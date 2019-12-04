const express = require('express');
const cfenv = require('cfenv');
const apiKeys = require('./app.json');
const {Pool, Client} = require('pg');

var watson = require('watson-developer-cloud');
var tbot = require('node-telegram-bot-api');


var app = express();
app.use(express.static(__dirname + '/public'));
var appEnv = cfenv.getAppEnv();

const pguser = new Client({
	user:'postgres',
	host:'localhost',
	database:'postgres',
	password:'Net@2019',
	port: '5432'
});

pguser.connect();
c = pguser
.query('SELECT * from segurança;')
.then(res => console.log(res.rows[1]))
.catch(e => console.error(e.stack))

console.log('c =',c)

const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');


let acessPermission = [804932589, 740600431, 710342198];


const conversation = new AssistantV2({
  version: apiKeys.watsonVersion,
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
	console.log(msg)
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
	let armazena;
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
						telegramBot.sendMessage(chatId, res.result.output.generic[0].text);
						break;
	
					case 'option':
						const options = res.result.output.generic[0].options;
						const optionLabel = options.map(function(elem) {
							return 	[{
								text: elem.label,
								callback_data: elem.label
							}]
						})
						const jOptions =   {
							reply_markup: {
								keyboard: 
									optionLabel
								
							}
						}
							telegramBot.sendMessage(chatId, res.result.output.generic[0].title, jOptions);
							break;
					case 'image':

					telegramBot.sendMessage(chatId, res.result.output.generic[0].title);
					setTimeout(function(){ 
						telegramBot.sendPhoto(chatId, res.result.output.generic[0].source);
					}, 70);

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