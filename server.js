const express = require('express');
const cfenv = require('cfenv');
const apiKeys = require('./app.json');
var watson = require('watson-developer-cloud');
var tbot = require('node-telegram-bot-api');


var app = express();
app.use(express.static(__dirname + '/public'));
var appEnv = cfenv.getAppEnv();

const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');


let acessPermission = [804932589];


const conversation = new AssistantV2({
  version: '2019-10-09',
  authenticator: new IamAuthenticator({
    apikey: apiKeys.apikey,
  }),
  url: 'https://gateway.watsonplatform.net/assistant/api',
});


async function newWatsonSes() {
	return await conversation.createSession({
		assistantId: apiKeys.assistantId
	})
}

let userSession = [];
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
var telegramBot = new tbot(apiKeys.apiTelegram, 
 { polling: true });

 
function sendMessage(context, msg, ses) {
	return conversation.message({
		assistantId: apiKeys.assistantId,
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
	console.log("user: ", );
	const session = createSession(msg.from.id);
	session.then(ses => {
		console.log('retorno: ',ses)
		sendMessage(context, msg.text, ses) 
			.then(res => {
				const type = res.result.output.generic[0].response_type;
				context = res.result.context;
				if (acessPermission.includes(msg.from.id)){
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
			}else{
				telegramBot.sendMessage(chatId, 'Não Autorizado');
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