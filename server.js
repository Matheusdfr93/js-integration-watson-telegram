var express = require('express');
var cfenv = require('cfenv');
//const userskeys = require('./app.json');

//var watson = require('watson-developer-cloud');
var tbot = require('node-telegram-bot-api');

var app = express();
app.use(express.static(__dirname + '/public'));
var appEnv = cfenv.getAppEnv();

const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const conversation = new AssistantV2({
  version: '2019-10-09',
  authenticator: new IamAuthenticator({
    apikey: 'o-rhJdaYokZh0rmC-EA3uCKb-ve46tcYhbmnmFjNCJYV',
  }),
  url: 'https://gateway.watsonplatform.net/assistant/api',
});

var context = {};
var telegramBot = new tbot('970020294:AAFTqOQAlL3qAE41XtzGrpdmVtnyfSnLKrw', 
{ polling: true });

telegramBot.on('message', function (msg) {
	var chatId = msg.chat.id;	
	conversation.createSession({
		assistantId: '422166ea-c502-4b2a-bbc9-4c5c081b1146'
	  })
		.then(res => {
			console.log(res.result.session_id)
			conversation.message({
				assistantId: '422166ea-c502-4b2a-bbc9-4c5c081b1146',
				sessionId: res.result.session_id,
				context: context,
				input: {
				  'message_type': 'text',
				  'text': msg.text
				  }
				})
				.then(res => {
					context = res.result.context;
					telegramBot.sendMessage(chatId, res.result.output.generic[0].text);
				})
				.catch(err => {
				  console.log(err);
				})
		})
		.catch(err => {
		  console.log(err);
		});
		

});



app.listen(3000, 'localhost', function() {
  console.log("server starting on " + appEnv.url);
});