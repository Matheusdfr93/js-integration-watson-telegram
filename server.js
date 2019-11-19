var express = require('express');
var cfenv = require('cfenv');
const userskeys = require('./app.json');

var watson = require('watson-developer-cloud');
var tbot = require('node-telegram-bot-api');

var app = express();
app.use(express.static(__dirname + '/public'));
var appEnv = cfenv.getAppEnv();

var conversation = watson.conversation({
  username: userskeys.watsonUsername,
  password: userskeys.senhaWatson,
  version: 'v1',
  version_date: '2016-09-20'
});

var context = {};
var telegramBot = new tbot(userskeys.apiTelegram, 
{ polling: true });

telegramBot.on('message', function (msg) {
	var chatId = msg.chat.id;	
	
	conversation.message({
		workspace_id: userskeys.workspaceId,
		input: {'text': msg.text},
		context: context
	},  function(err, response) {
		if (err)
			console.log('error:', err);
		else{
			context = response.context;
			telegramBot.sendMessage(chatId, response.output.text[0]);
		}
	});	
});

app.listen(3000, 'localhost', function() {
  console.log("server starting on " + appEnv.url);
});