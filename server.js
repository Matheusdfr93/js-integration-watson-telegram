const express = require('express');
const cfenv = require('cfenv');

//const userskeys = require('./app.json');

var watson = require('watson-developer-cloud');
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


async function newWatsonSes() {
	return await conversation.createSession({
		assistantId: '422166ea-c502-4b2a-bbc9-4c5c081b1146'
	})
}

const userSession = [];
async function createSession (user){
	console.log(user)
	const findUser = userSession.filter(item => item.id === user )
	if(findUser[0] === undefined){
		key = await newWatsonSes().then( async res => {
			const session_id = await res.result.session_id
			const newUser = {
				id: user,
				session: session_id
			}
			userSession.push(newUser)
			return newUser.session;
		})
		console.log('ses: ',key);
		return key;
	} else {
		return findUser[0].session;
	}
}


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
	const session = createSession(message.from.id)

	sendMessage(context, category, session ).then(res =>{
		telegramBot.sendMessage(message.chat.id, res.result.output.generic[0].text);
		console.log(message.chat.id)
	})
	
 });

telegramBot.on('message', function (msg) {
	var chatId = msg.chat.id;	
	const session = createSession(msg.from.id);
	session.then(ses => {
		console.log('retorno: ',ses)
		sendMessage(context, msg.text, ses) 
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
								keyboard: [[
									{
										text: options[0].label,
										callback_data: options[0].label
									}],[ {
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
	

});



app.listen(3000, 'localhost', function() {
  console.log("server starting on " + appEnv.url);
});