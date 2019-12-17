const express = require('express');
const cfenv = require('cfenv');
const apiKeys = require('./app.json');
const {Pool, Client} = require('pg');

const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

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

let acessPermission = [804932589, 740600431, 710342198, 905858684];

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

const userSession = [];
async function createSession (user){
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

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

console.log(timeConverter(0));
 
telegramBot.on('message', function (msg) {
	const chatId = msg.chat.id;	

	datainicio = timeConverter(msg.date)
	console.log('tempooo: ', datainicio)
	const session = createSession(msg.from.id)
	session
		.then(ses => {
			sendMessage(msg.text, ses) 
				.then(res => {
					let type = res.result.output.generic[0].response_type;
					const watsonContext = res.result.context.skills['main skill'].user_defined;
					if(watsonContext) {
						console.log(watsonContext)
						if(watsonContext.computar === 1) {
							const query = {
								text: 'INSERT INTO validacao (tipoValidacao, departamento, sku, temproduto, motivo_nao_venda, conseguiu_ajustar, solicitarAbastecimento) values ($1, $2, $3, $4, $5, $6, $7);	',
								values: [watsonContext.tipoValidacao, watsonContext.departamento, watsonContext.sku, watsonContext.temproduto, watsonContext.motivonaovenda, watsonContext.conseguiuAjustar, watsonContext.solicitarAbastecimento],
							}
							c = pguser
								.query(query)
						}
					}
		
					if (msg.text == 'Validação de Gôndola' || msg.text =='Validação de Estoque' || msg.text == 'Nova Validação em outro departamento') {
						type = 'Departamento';
					}
					if(msg.text === watsonContext.departamento || msg.text === 'Nova Validação no mesmo departamento'){
					type = 'sku';
					}

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
		
						case 'Departamento':
							const query = {
							text: 'SELECT ds_section from sections',
							rowMode: 'array',
							}
							
						pguser.query(query).then(list => {
							const optionLabel2 = list.rows.map(elem => {
								return 	[{
									text: elem[0],
									callback_data: elem[0]
								}]
							})
							const jOptions2 =   {
								reply_markup: {
									keyboard: 
										optionLabel2
									
								}
							}
							telegramBot.sendMessage(chatId, res.result.output.generic[0].title, jOptions2);
						})
									
							break;
							case 'sku':
									const querysku = {
										text: `SELECT ds_sku, tipo_problema from skus where ds_departamento = '${watsonContext.departamento}' and validado = false;`,
										rowMode: 'array',
										}
										pguser.query(querysku).then(list => {
											const optionLabel3 = list.rows.map(elem => {
												//console.log(elem)
												return 	[{
													text: elem[0] + ' ' + elem[1],
													callback_data: elem[0] + ' ' + elem [1]
												}]
											})


											const jOptions3 =   {
												reply_markup: {
													keyboard: 
														optionLabel3
													
												}
											}
											telegramBot.sendMessage(chatId, res.result.output.generic[0].title, jOptions3);
										})



								break;
						default:
							break;
					}
					}  else {
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