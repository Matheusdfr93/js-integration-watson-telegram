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

const ses = conversation.createSession({
	assistantId: '422166ea-c502-4b2a-bbc9-4c5c081b1146'
})

var context = {};
var telegramBot = new tbot('970020294:AAFTqOQAlL3qAE41XtzGrpdmVtnyfSnLKrw', 
{ polling: true });

function sendMessage(context, msg, ses) {
	return conversation.message({
		assistantId: '422166ea-c502-4b2a-bbc9-4c5c081b1146',
		sessionId: ses,
		context: context,
		input: {
		  'message_type': 'text',
		  'text': msg
		  }
		})
}

telegramBot.on('callback_query', (callbackQuery) => {
	const message = callbackQuery.message;
	const category = callbackQuery.data;
 
	//URLLabels.push({
	//	url: tempSiteURL,
	//	label: category,
	//});
 
	//tempSiteURL = '';
	ses.then(res => {
		sendMessage(context, category, res.result.session_id ).then(res =>{
			telegramBot.sendMessage(message.chat.id, res.result.output.generic[0].text);
			console.log(message.chat.id)
		})
	
	})
	
 });

telegramBot.on('message', function (msg) {
	var chatId = msg.chat.id;	
	
	ses.then(res => {
			console.log(res.result.session_id)
			sendMessage(context, msg.text, res.result.session_id) 
				.then(res => {
					const type = res.result.output.generic[0].response_type;
					context = res.result.context;
					switch (type) {
						case 'text':
							console.log(JSON.stringify(res.result.output.generic[0].response_type));
							telegramBot.sendMessage(chatId, res.result.output.generic[0].text);
							break;

						case 'option':
							const options = res.result.output.generic[0].options;
							const jOptions =   {
								reply_markup: {
									inline_keyboard: [[
										{
											text: options[0].label,
											callback_data: options[0].label
										}, {
											text: options[1].label,
											callback_data: options[1].label
										},
									]]
								}
							}
								console.log(JSON.stringify(res.result.output.generic[0].response_type));
								telegramBot.sendMessage(chatId, res.result.output.generic[0].title, jOptions);
								break;

						default:
							break;
					}

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