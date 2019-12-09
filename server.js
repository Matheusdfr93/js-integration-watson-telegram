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
	user:apiKeys.postgres.user,
	host:apiKeys.postgres.host,
	database:apiKeys.postgres.database,
	password:apiKeys.postgres.password,
	port: apiKeys.postgres.port
});

pguser.connect();
c = pguser
.query('SELECT * from segurança;')
.then(res => console.log(res.rows[0]))
.catch(e => console.error(e.stack));

console.log('c =',c);

const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

let acessPermission = [804932589, 740600431, 710342198,905858684];

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

async function deleteSession (user){
	const findUser = userSession.indexOf(item => item.id === user )
	userSession.pop(findUser)
}

const userContext = {};
const telegramBot = new tbot(apiKeys.apiTelegram, 
 { polling: true });

function sendMessage(msg, ses) {
	console.log(msg)
	return conversation.message({
		assistantId: apiKeys.assistantId,
		sessionId: ses,
		input: {
		  'message_type': 'text',
		  'text': msg,
			options: {
				return_context: true
			},
		},
		context: {
      global: {
        system: {
          user_id: ses
        }
      },
      skills: {
        'main skill': {
          user_defined: {}
        }
      }
    }
	})
}
 
let auxValores = 0;
let valores = [];
telegramBot.on('message', function (msg) {
	var chatId = msg.chat.id;	
	console.log("user: ", );
	const session = createSession(msg.from.id);
	session.then(ses => {
		console.log('retorno: ',ses)
		sendMessage(msg.text, ses) 
			.then(res => {
				const type = res.result.output.generic[0].response_type;
				const watsonContext = res.result.context.skills['main skill'].user_defined;
				if(watsonContext) {
					if(watsonContext.computar === 1) {
						console.log(watsonContext.computar)
						const query = {
							text: 'INSERT INTO validacao (tipoValidacao, departamento, sku, temproduto, motivo_nao_venda, conseguiu_ajustar, solicitarAbastecimento) values ($1, $2, $3, $4, $5, $6, $7);	',
							values: [watsonContext.tipoValidacao, watsonContext.departamento, watsonContext.sku, watsonContext.temproduto, watsonContext.motivonaovenda, watsonContext.conseguiuAjustar, watsonContext.solicitarAbastecimento],
						}
						c = pguser
						.query(query)
						//.then(res => console.log('Valores Computados'))
						//.catch(e => console.error(e.stack));
					}
					console.log('resultado:',  watsonContext);
				}
				// if (watsonContext.listaDepartamentos) {
				// 	type = 'listaDepatamentos'
				// }
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
					// case 'listaDepatamentos':
					// 		const options = // busca no banco
					// 		const optionLabel = options.map(function(elem) {
					// 			return 	[{
					// 				text: elem.label,
					// 				callback_data: elem.label
					// 			}]
					// 		})
					// 		const jOptions =   {
					// 			reply_markup: {
					// 				keyboard: 
					// 					optionLabel
									
					// 			}
					// 		}
					// 			telegramBot.sendMessage(chatId, res.result.output.generic[0].title, jOptions);
								
					// 	break;
					default:
						break;
				}
				}else{
				telegramBot.sendMessage(chatId, 'Não Autorizado');
				} 
			})
			.catch(err => {
				console.log(err)
				deleteSession(msg.from.id)
				telegramBot.sendMessage(chatId, 'Sua sessão expirou, me mande um novo olá, por favor');
			})
	})
	

});



app.listen(3000, 'localhost', function() {
  console.log("server starting on " + appEnv.url);
});