var datePicker = {
    defaultMonth: 0,
    defaultYear: 1990,
    setDate: function() {
        var curr_year = new Date().getFullYear();
        var d_count = 33 - new Date(this.defaultYear, this.defaultMonth, 33).getDate();
        var d = '<option value="null">День</option>';
        for (var i=0; i<d_count; i++) {
            d += '<option name="'+(i+1)+'">'+(i+1)+'</option>';
        }
        jQuery('#day').html(d);
        var y = '<option value="null">Год</option>';
        for (var i=this.defaultYear; i<=curr_year; i++) {
            y += '<option name="'+i+'">'+i+'</option>';
        }
        jQuery('#year').html(y);
    },
    changeDays: function(picked_day) {
        var year = (jQuery('#year option:selected').val() == "null") ? this.defaultYear : jQuery('#year option:selected').val();
        var month = (jQuery('#month option:selected').val() == "null") ? this.defaultMonth : jQuery('#month option:selected').attr('name')-1;
        var d_count = 33 - new Date(year, month, 33).getDate();
        var d = '<option value="null">День</option>';
        for (var i=1; i<d_count+1; i++) {
            if (i == picked_day) {
                d += '<option name="'+i+'" selected>'+i+'</option>';
            } else {
                d += '<option name="'+i+'">'+i+'</option>';
            }
        }
        jQuery('#day').html(d).selectOrDie("update");
    }
}

var Auth = function() {
	this.login = function() {
		var data = {
			email: jQuery('.auth-form-email input[name="email"]').val(),
			password: jQuery('.auth-form-password input[name="password"]').val()
		}
		jQuery.ajax({
			type: 'POST',
			url: '/auth',
			data: {
				'do': 'login',
				'data': JSON.stringify(data) 
			},
			success: function(a) {
                //var obj = jQuery.parseJSON(a);
                console.log(a);
            }
        });
	}
	this.logout = function() {
		jQuery.ajax({
			type: 'POST',
			url: '/auth',
			data: {
				'do': 'logout'
			},
			success: function(a) {
                //var obj = jQuery.parseJSON(a);
                console.log(a);
            }
        });
	}
	this.getRecoveryLink = function() {
		var login = jQuery('#get_recovery_link input[name="login"]').val();
		jQuery.ajax({
			type: "POST",
			url: "/ajax.php",
			data: {
				type: "auth",
				what: "forgot_password",
				data: serialize({"login": login})
			},
			success: function(a) {
				var obj = jQuery.parseJSON(a);
				if (obj.status == 0) {
					alert(obj.result);
					closePopUpWindow();
				} else {
					alert(obj.result);
				}
			}
		});
	}
	this.setNewPassword = function() {
		var hash = jQuery('#set_new_password input[name="hash"]').val();
		var password = jQuery('#set_new_password input[name="password"]').val();
		jQuery.ajax({
			type: "POST",
			url: "/ajax.php",
			data: {
				type: "auth",
				what: "change_forgot_password",
				data: serialize({"hash": hash, "password": password})
			},
			success: function(a) {
				var obj = jQuery.parseJSON(a);
				if (obj.status == 0) {
					alert(obj.result);
					closePopUpWindow();
				} else {
					alert(obj.result);
				}
			}
		});
	}
}
var auth = new Auth();

var Registration = function() {
    var options = {
        "class": '.registration-form'
    }
    var jValidation = {
        errors: false,
        email: function() {
            var $el = jQuery('input[name="email"]');
            var regExp = /^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
            if ($el.val() != '') {
                if (!regExp.test($el.val())) {
                    $el.parent().find(".error").html('E-Mail указан неверно.');
                    this.errors = true;
                } else {
                    jQuery.when(checkEmail()).then(
                        function (result) {
                            if (result == 0) {
                                $el.parent().find(".error").html('<span class="is-free">E-Mail свободен.</span>');
                            } else {
                                $el.parent().find(".error").html('E-Mail уже используется.');
                                this.errors = true;
                            }
                        }
                    );
                }
            } else {
                $el.parent().find(".error").html('E-mail не указан.');
                this.errors = true;
            }
        },
        password: function(e) {
            //var regExp = /^[A-Z0-9]{8,20}$/i;
            var $el = jQuery('input[name="password"]');
            var val = $el.val();
            var capitalletters = 0;
            var loweletters = 0;
            var number = 0;

            var upperCase = new RegExp('[A-Z]');
            var lowerCase = new RegExp('[a-z]');
            var numbers = new RegExp('[0-9]');

            var $lock = jQuery('.strength-panel-border');
            var getTotal = function(total) {
                switch(total) {
                    case 1:
                        $lock.height("66%");
                        break;
                    case 2:
                        $lock.height("33%");
                        break;
                    case 3:
                        $lock.height("0%");
                        break;
                }
            }
            var checkInput = function() {
                var newval = val.replace(/[^0-9A-Z]*/i, '');
                if (val != newval) {
                    $el.val(newval);
                }
            }
            var checkStrength = (function() {
                checkInput();
                if (e && e.keyCode == 9)
                    return false;
                //console.log($el.val());
                if ($el.val().length == 0) {
                    $el.parent().find(".error").html('Пароль не указан.');
                    this.errors = true;
                    $lock.height("100%");
                } else if (val.length < 6) {
                    $el.parent().find(".error").html('Пароль слишком короткий.');
                    this.errors = true;
                    $lock.height("100%");
                } else {
                    $el.parent().find(".error").html('');
                    if (val.match(upperCase)) {
                        capitalletters = 1
                    } else {
                        capitalletters = 0;
                    }
                    if (val.match(lowerCase)) {
                        loweletters = 1
                    } else {
                        loweletters = 0;
                    }
                    if (val.match(numbers)) {
                        number = 1
                    } else {
                        number = 0;
                    }

                    var total = capitalletters + loweletters + number;
                    getTotal(total);
                }
            })();
        },
        confirmation: function() {
            var $el = jQuery('input[name="confirm_password"]');
            var pass_val = jQuery('input[name="password"]').val();
            var confirm_val = $el.val();
            if (pass_val != '') {
                if (pass_val == confirm_val) {
                    $el.parent().find(".error").html('');
                } else {
                    $el.parent().find(".error").html('Пароли не совпадают.');
                    this.errors = true;
                }
            }
        },
        name: function() {
            var $el = jQuery('input[name="firstname"]');
            var regExp = /^[A-ZА-Яа-я]{2,20}$/i;
            if ($el.val() != '') {
                if (!regExp.test($el.val())) {
                    $el.parent().find(".error").html('Имя указано неверно.');
                    this.errors = true;
                } else {
                    $el.parent().find(".error").html('');
                }
            } else {
                $el.parent().find(".error").html('Имя не указано.');
                this.errors = true;
            }
        },
        birthdate: function() {
            var $el = jQuery('.registration-form-birthday');
            var day = jQuery("#day option:selected").val();
            var month = jQuery('#month option:selected').attr('name') - 1;
            var year = jQuery("#year option:selected").val();
            if (isNaN(day) && isNaN(month) && isNaN(year)) {
                $el.find(".error").html('Укажите дату рождения.');
                this.errors = true;
            } else if (isNaN(day)) {
                $el.find(".error").html('Укажите день.');
                this.errors = true;
            } else if (isNaN(month)) {
                $el.find(".error").html('Укажите месяц.');
                this.errors = true;
            } else if (isNaN(year)) {
                $el.find(".error").html('Укажите год.');
                this.errors = true;
            } else {
                $el.find(".error").html('');
            }
        },
        sex: function() {
            var $el = jQuery('.registration-form-sex');
            var val = jQuery(".registration-form-sex input:checked").val();

            if (isNaN(val)) {
                $el.find(".error").html('Выберите пол.');
                this.errors = true;
            } else {
                $el.find(".error").html('');
            }
        },
        city: function() {
            var $el = jQuery('.registration-form-city');
            var val = jQuery('input[name="city"]').val();
            var regExp = /^[A-ZА-Яа-я0-9]{3,}$/i;
            if (val != '') {
                if (!regExp.test(val)) {
                    $el.find(".error").html('Город указан неверно.');
                    this.errors = true;
                } else {
                    $el.find(".error").html('');
                }
            } else {
                $el.find(".error").html('Город не указан.');
                this.errors = true;
            }
        },
        district: function() {
            var $el = jQuery('.registration-form-district');
            var val = jQuery('input[name="district"]').val();
            var regExp = /^[A-ZА-Яа-я0-9]{3,}$/i;
            if (val != '') {
                if (!regExp.test(val)) {
                    $el.find(".error").html('Район указан неверно.');
                    this.errors = true;
                } else {
                    $el.find(".error").html('');
                }
            } else {
                $el.find(".error").html('Район не указан.');
                this.errors = true;
            }
        },
        goal: function() {
            var $el = jQuery('.registration-form-goal');
            var val = jQuery("#goal option:selected").attr('name');
            if (isNaN(val)) {
                $el.find(".error").html('Укажите цель знакомства.');
                this.errors = true;
            } else {
                $el.find(".error").html('');
            }
        },
        terms: function() {
            var $el = jQuery('#labelauty-3');
            if ($el.prop("checked")) {
                $el.parent().find(".error").html('');
            } else {
                $el.parent().find(".error").html('Необходимо принять соглашение.');
                this.errors = true;
            }
        },
        submit: function() {
            this.errors = false;
            jValidation.email();
            jValidation.password();
            jValidation.confirmation();
            jValidation.name();
            jValidation.birthdate();
            jValidation.sex();
            jValidation.city();
            jValidation.district();
            jValidation.goal();
            jValidation.terms();
            if (!jValidation.errors) {
                register.register();
                return;
            }
            return false;
        }
    }
    function getUnixTimestamp(day, month, year, hours, minutes, seconds) {
        hours = hours || 0;
        minutes = minutes || 0;
        seconds = seconds || 0;
        return new Date(year, month, day, hours, minutes, seconds)/1000;
    }
    function checkEmail() {
        var dfd = jQuery.Deferred();
        var data = {'email': jQuery('input[name="email"]').val()};
        jQuery.ajax({
            type: 'POST',
            url: '/auth',
            data: {
                'do': 'check_email',
				'data': JSON.stringify(data)
            },
            success: function(a) {
                var obj = jQuery.parseJSON(a);
                dfd.resolve(obj.status);
            }
        });
        return dfd.promise();
    }
    function Registration() {
        this.init();
    }
    Registration.prototype = {
        init: function() {
            datePicker.setDate();
        },
        register: function() {
            var timestamp = getUnixTimestamp(jQuery("#day option:selected").val(), jQuery('#month option:selected').attr('name')-1, jQuery("#year option:selected").val());
            var data = {
                'email': jQuery('input[name="email"]').val(),
                'password': jQuery('input[name="password"]').val(),
                'name': jQuery('input[name="firstname"]').val(),
                'birth_date': timestamp,
                'sex': jQuery('input[name="sex"]:checked').val(),
                'city': jQuery('input[name="city"]').val(),
                'district': jQuery('input[name="district"]').val(),
                'goal': jQuery('#goal option:selected').attr('name')
            };
            jQuery.ajax({
                type: 'POST',
                url: '/register',
                data: {
                    'do': 'register',
                    'data': JSON.stringify(data)
                },
                success: function(a) {
                    var obj = jQuery.parseJSON(a);
                    if (obj.status == 0) {
                        alert(obj.result);
                        window.location.href = "/";
                    } else {
                        alert(obj.result);
                    }
                }
            });
        },
        showPassword: function() {
            var $el = jQuery('input[name="password"], input[name="confirm_password"]');
            if ($el.attr('type') == 'password') {
                $el.attr('type', 'text');
                jQuery('.visibility-panel img').attr('src', '/img/icons/hide-password.png');
            } else {
                $el.attr('type', 'password');
                jQuery('.visibility-panel img').attr('src', '/img/icons/show-password.png');
            }
        }
    }
    jQuery('.registration-form-submit').click(function() {
        if (!jValidation.submit()) {
            jQuery('body').animate({ scrollTop: jQuery(options.class).offset().top }, 750);
        }
    });
    jQuery('input[name="email"]').change(jValidation.email);
    jQuery('input[name="password"]').bind('keyup', jValidation.password);
    jQuery('input[name="confirm_password"]').change(jValidation.confirmation);
    jQuery('input[name="firstname"]').change(jValidation.name);
    jQuery('#day, #month, #year').change(jValidation.birthdate);
    jQuery('input[name="sex"]').change(jValidation.sex);
    jQuery('input[name="city"]').change(jValidation.city);
    jQuery('input[name="district"]').change(jValidation.district);
    jQuery('#goal').change(jValidation.goal);
    jQuery('input[name="terms"]').click(jValidation.terms);
    return Registration;
}();
var register = new Registration();