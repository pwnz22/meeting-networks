var express = require('express');
var router = express.Router();

var url = require('url');
var querystring = require('querystring');

var user = require('./models/user');

/* Main page */
router.get('/', function(req, res, next) {
	var options = {};

	options.title = 'Главная страница';
	options.user_id = (req.session.user_id == undefined) ? 0 : req.session.user_id;

	res.render('index', { 'options': options });
});

router.get('/dialog', function(req, res, next) {
	var url_obj = url.parse(req.url);
	var pathname = url_obj.pathname;
	var params = querystring.parse(url_obj.query);

	var user_id = (req.session.user_id == undefined) ? 0 : req.session.user_id;
	var receiver_id = params["id"];
	//@TODO Если user_id == receiver_id, редирект на /dialogs

	var options = {};
	if(user_id == 0) {

		options.title = 'Ошибка';

		res.render('index', { 'options': options });
	} else {
		var messages = [];
		db.query('SELECT * FROM personal_messages WHERE (message_author_id = ' + db.escape(user_id) + ' && message_receiver_id = ' + db.escape(receiver_id) + ') or (message_author_id = ' + db.escape(receiver_id) + ' && message_receiver_id = ' + db.escape(user_id) + ')')
			.on('result', function(data) {
				messages.push(data);
			})
			.on('end', function() {

		        //@TODO Надо ебануть запросик к таблице юзерс и вынуть оттуда аватарку и имя WHERE user_id = receiver_id
		        //@TODO Чекнуть статус юзера с user_id = receiver_id
		        //@TODO Перевести timestamp в нормальный вид
		        var message_author_name = 'Заглушка';

		        options.title = 'Диалог с ' + message_author_name;
		        options.user_id = user_id;
		        options.messages = messages;

		        res.render('dialog', { 'options': options });
		    });
	}
});

router.get('/dialogs', function(req, res, next) {
	var dialogs = {},
		options = {};

	var user_id = (req.session.user_id == undefined) ? '0' : req.session.user_id;
	//console.log(req);
	if(user_id == 0) {
		options.title = 'Ощибка';
		res.render('index', { 'options': options });
	} else {
		db.query('SELECT * FROM personal_messages WHERE (message_author_id = ' + db.escape(user_id) + ' or message_receiver_id = ' + db.escape(user_id) + ')', function(err, result) {

			for(var i=0; i<result.length; i++) {
				if(result[i]["message_author_id"] != user_id) {
					if (result[i]["message_author_id"] in dialogs) {
						dialogs[result[i]["message_author_id"]].unshift(result[i]);
					} else {
						dialogs[result[i]["message_author_id"]] = [result[i]];
					}
				}
				if(result[i]["message_receiver_id"] != user_id) {
					if (result[i]["message_receiver_id"] in dialogs) {
						dialogs[result[i]["message_receiver_id"]].unshift(result[i]);
					} else {
						dialogs[result[i]["message_receiver_id"]] = [result[i]];
					}
				}
			}

			options.title = 'Диалоги';
			options.dialogs = dialogs;

			res.render('dialogs', { 'options': options });

		});
	}
});

router.get('/registration', function(req, res, next) {
	if(user_id == 0) {
		return false;
	}

	var options = {};

	options.title = 'Регистрация';

	//@TODO Получаем данные из пост-запроса, валидируем их и добавляем новый аккаунт в БД
	//@TODO Выводим сообщение об успешной или не очень регистрации

	res.render('registration', { 'options': options });
});

/*router.get('/registertest', function(req, res, next) {
	//var result = user.register.register();
	console.log(req.session);

	res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
	res.write("result");
	res.end();
});*/

/* AJAX Requests handlers */
router.post('/register', function(req, res, next) {
	var type = req.body.do;
	var data = JSON.parse(req.body.data);

	switch(type) {
		case 'register':
			var result = user.register.register(data);

			res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
			res.write(result);
			res.end();
		    break;
		case 'check_email':
			var result = user.register.checkEmail(data);
			console.log(result);
			break;
	}
});
router.post('/auth', function(req, res, next) {
	var type = req.body.do;
	var data = JSON.parse(req.body.data);

	switch(type) {
		case 'login':
			/*res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
			res.write(user.auth.login(data));
			res.end();*/
			user.auth.login(req, data).then(function(result) {
		        res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
				res.write(result);
				res.end();
		    });
		    break;
		case 'logout':
			var result = user.auth.logout();
			console.log(result);
			break;
	}
});

module.exports = router;