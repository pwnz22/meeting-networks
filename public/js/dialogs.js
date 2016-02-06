var dialog = io.connect('http://localhost:3000/dialog');

var typing = false;  
var timeout = undefined;
function timeoutFunction() {
	typing = false;
	dialog.emit('user_stop_typing');
}
$('input[name="message_add_field"]').keypress(function(e){
	if (e.which !== 13) {
		if (typing === false && $('input[name="message_add_field"]').is(":focus")) {
			typing = true;
			dialog.emit('user_start_typing');
		} else {
			clearTimeout(timeout);
			timeout = setTimeout(timeoutFunction, 4000);
		}
	}
});


dialog.on('onGetMessage', function(msg) {
	jQuery('#messages').append(jQuery('<li>').text(msg));
});
dialog.on('onStartTyping', function(data) { 
	jQuery('.message_system_panel').html('Собеседник печатает вам сообщение...');
});
dialog.on('onStopTyping', function(data) {
	jQuery('.message_system_panel').html('');
});

jQuery('.message_add_button').on('click', function() {
	var $input = jQuery('input[name="message_add_field"]');
	var val = $input.val();
	dialog.emit('message_add', val);
	$input.val('');
});

//@TODO При клике на диалог переходим на его страницу