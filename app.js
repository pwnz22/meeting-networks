var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookie = require('cookie');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
var debug = require('debug')('myapp:server');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var bcrypt = require('bcrypt-nodejs');

var FileStore = require('session-file-store')(session);
var fileStore = new FileStore({
	path: __dirname+'/tmp/sessions',
	encrypt: true
})

var route = require('./route');

var port = normalizePort(process.env.PORT || '3000');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(methodOverride());

app.use(session({
	store: fileStore,
	secret: "eZy68Tb14",
	resave: true,
	saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(route);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/* Error handlers */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
/*app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});*/

/* DB Connection */
global.db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	//password: '',
  	database: 'meetings-network'
});
db.connect(function(err){
	if (err) console.log(err);
});
db.query("SET SESSION wait_timeout = 604800"); // 7 days timeout

/* Creating Web-server */
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/* Using Socket.IO */
var io = require('socket.io').listen(server);

function getSession(socket) {
	return new Promise(function(resolve, reject) {
		var parsed_cookies = cookie.parse(socket.request.headers.cookie);
		var connect_sid = parsed_cookies['connect.sid'].slice(2, 34);
		if(connect_sid) {
			fileStore.get(connect_sid, function (error, session) {
				if(error)
					throw new Error('Ошибка получения сессии.');
				resolve(session);
			});
		}
	});
}

var connected_users = {};
//@TODO Сделать для разных неймспейсов разные поля объекта

/* Dialog, Dialogs */
var dialog = io.of('/dialog').on('connection', function(socket) {
	getSession(socket).then(function(session) {
		var user_id = (session.user_id == undefined) ? 0 : session.user_id;
		var receiver_id = (isNaN(n = parseInt(querystring.parse(url.parse(socket.handshake.headers.referer).query).id, 10))) ? 0 : n;

		connected_users[socket.id] = [user_id, receiver_id];
		console.log(connected_users);

		//@TODO Добавить проверку на игнор
		socket.on('message_add', function(message_text) {
			var time = Math.round(new Date().getTime()/1000);
			db.query('INSERT INTO personal_messages (message_add_date, message_author_id, message_receiver_id, message_text) VALUES ('+ time +','+ db.escape(user_id) +','+ db.escape(receiver_id) +','+ db.escape(message_text) +')');

			for(var key in connected_users) {
				var curr = connected_users[key];
				if(curr.indexOf(receiver_id) == 0 && curr.indexOf(user_id) == 1) {
					dialog.connected[key].emit('onGetMessage', message_text);
					dialog.connected[key].emit('onStopTyping');
				}
				if(curr.indexOf(receiver_id) == 1 && curr.indexOf(user_id) == 0) {
					dialog.connected[key].emit('onGetMessage', message_text);
				}
			}

			//@TODO Выслать событие на /dialogs
		});

		socket.on('user_start_typing', function(data) {
			for(var key in connected_users) {
				var curr = connected_users[key];
				if(curr.indexOf(receiver_id) == 0 && curr.indexOf(user_id) == 1) {
					dialog.connected[key].emit('onStartTyping');
				}
			}

			//@TODO Выслать событие на /dialogs
		});

		socket.on('user_stop_typing', function(data) {
			for(var key in connected_users) {
				var curr = connected_users[key];
				if(curr.indexOf(receiver_id) == 0 && curr.indexOf(user_id) == 1) {
					dialog.connected[key].emit('onStopTyping');
				}
			}

			//@TODO Выслать событие на /dialogs
		});

		socket.on('disconnect', function() {
			delete connected_users[socket.id];
		});
	});
});

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
 	var port = parseInt(val, 10);

 	if (isNaN(port)) {
	    // named pipe
	    return val;
	}

	if (port >= 0) {
	    // port number
	    return port;
	}

	return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
 	if (error.syscall !== 'listen') {
 		throw error;
 	}

 	var bind = typeof port === 'string'
 	? 'Pipe ' + port
 	: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
		console.error(bind + ' requires elevated privileges');
		process.exit(1);
		break;
		case 'EADDRINUSE':
		console.error(bind + ' is already in use');
		process.exit(1);
		break;
		default:
		throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string'
	? 'pipe ' + addr
	: 'port ' + addr.port;
	debug('Listening on ' + bind);
}