var bcrypt = require('bcrypt-nodejs');

var config = require('../config');

function Auth() {
	this.login = function(request, data) {
		var email = data.email.toLowerCase();
		var password = data.password;
		var salt = config.salt;

		var status = '';
		return new Promise(function(resolve, reject) {
			db.query('SELECT user_id, user_register_date, user_email, user_password, user_group, user_active FROM users WHERE user_email = ' + db.escape(email), function(err, result) {
				if(result.length == 0) {
					status = 'Введённый логин неверный.';
				} else {
					var user = result[0];
					if(bcrypt.compareSync(password+email+salt, user.user_password)) {
						if(user.user_active) {
							request.session.user_id = user.user_id;
							request.session.user_group = user.user_group;
							status = 'Авторизация прошла успешно.';
						} else {
							status = 'Учётная запись не активна. Пожалуйста, активируйте её!';
						}
					} else {
						status = 'Введённый пароль неверный.';
					}
				}
				resolve(status);
			});
		});
	}
	this.logout = function() {
		req.session = null;
		return "Вы вышли из своего профиля.";
	}
}
var auth = new Auth();

function Register() {
	this.checkEmail = function(data) {
		return data;
	}
	this.register = function(data) {
		if(data.email == undefined || data.email == '') {
			return 'Введите E-Mail';
		} else {
			var email = data.email.strToLower();
			if(!email.test(/^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/))
				return 'Неверный логин';
			var res = this.checkEmail(email);
			if(res)
				return res;
		}
		if(data.password == undefined || data.password == ''){
			return 'Введите пароль';
		} else {
			var password = data.password;
			if(!password.test(/^[A-Z0-9]{6,20}$/))
				return 'Неверный пароль';
		}

		/*if (!isset($new_user["name"]) || empty($new_user["name"])){
			return array("status" => "14", "result" => "Введите Имя");
		}else{
			$find_res = preg_match_all(Settings::regExp["name"], $new_user["name"], $matches);
			if($find_res<1)
				return array("status" => "20", "result" => "Не подходящее имя");
		}
		if (!isset($new_user["birth_date"]) || empty($new_user["birth_date"]))
			return array("status" => "16", "result" => "Введите birth_date");
		if (!isset($new_user["sex"]) || empty($new_user["sex"]))
			$new_user["sex"] = "0";
		if (!isset($new_user["country"]) || empty($new_user["country"])){
			return array("status" => "17", "result" => "Введите country");
		}else{
			$find_res = preg_match_all(Settings::regExp["country"], $new_user["country"], $matches);
			if($find_res<1)
				return array("status" => "22", "result" => "Не подходящий country");
		}
		if (!isset($new_user["city"]) || empty($new_user["city"]))
			return array("status" => "18", "result" => "Введите city");

		$STH = $this->DBH->prepare("SELECT * FROM users WHERE login=:login");
		$STH->bindParam(':login', strtolower($new_user["login"]));
		$STH->execute();
		$user = $STH->fetchAll(PDO::FETCH_ASSOC);
		if (count($user)>0){
			return array("status" => "10", "result" => "Логин занят.");
		}else{
			$hash = $this->generate_hash($new_user["login"],$new_user["password"],$new_user["email"]);
			$STH = $this->DBH->prepare("INSERT INTO users (reg_date,email,login,password,group_id,name,surname,birth_date,sex,country,city,hash_code) VALUES (:reg_date,:email,:login,:password,:group_id,:name,:surname,:birth_date,:sex,:country,:city,:hash_code)");
			$data = array(
				"reg_date" => time(),
				"email" => $new_user["email"],
				"login" => strtolower($new_user["login"]),
				"password" => base64_encode(md5(strtolower($new_user["login"]).$new_user["password"])),
				"group_id" => 3,
				"name" => $new_user["name"],
				"surname" => $new_user["surname"],
				"birth_date" => $new_user["birth_date"],
				"sex" => $new_user["sex"],
				"country" => $new_user["country"],
				"city" => $new_user["city"],
				"hash_code" => $hash
			);
			$result = $STH->execute($data);
			if ($result){
				//mail $hash to $new_user["e-mail"]
				$mail_to = $new_user["email"];
				$subject = "Активация аккаунта";
				$link = "http://".$_SERVER['SERVER_NAME']."/activate/".urlencode($hash);
				$message = sprintf("<html><head></head><body>Для того, чтобы активировать свой аккаунт, пройдите по ссылке <a href='%s'>%s</a></body></html>", $link, $link);
				$result = smtpmail($mail_to, $subject, $message);
				if ($result){
					return array("status" => "0", "result" => "Пользователь зарегистрирован. Требуется активация");
				}else{
					return array("status" => "0", "result" => "Пользователь зарегистрирован. Однако письмо для активации затерялось :(");
				}
			} else
				return array("status" => "8", "result" => "Не удалось занести информацию в DB");
		}*/
	}
	this.activate = function(data) {

	}
	this.recoveryPassword = function(data) {

	}
	this.changeForgottenPassword = function(data) {

	}
}
var register = new Register();

function Profile() {
	this.getInfo = function(data) {
		return data;
	}
	this.search = function(params) {

	}
}
var profile = new Profile();

module.exports.auth = auth;
module.exports.register = register;
module.exports.profile = profile;