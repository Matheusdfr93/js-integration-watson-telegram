const functions = require('firebase-functions');

const apiKeys = require('./app.json');
const { Client } = require('pg');
const Sequelize = require('sequelize');
const horariofim = require('./public/horario');
const datahoje = require('./public/data');
const {createSession, deleteSession, sendMessage} = require('./public/Watson');
var tbot = require('node-telegram-bot-api');


const sequelize = new Sequelize('postgres', 'postgres', apiKeys.postgres.password, {
  host: apiKeys.postgres.host,
  dialect: 'postgres'/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
});

//const model = sequ.model;
//model.findall({})

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

let acessPermission = [804932589, 740600431, 710342198, 905858684, 1013468107];
const userContext = {};
const telegramBot = new tbot(apiKeys.apiTelegram, { polling: true });


telegramBot.on('message', function (msg) {
	const chatId = msg.chat.id;	
	const session = createSession(msg.from.id)
	session
		.then(ses => {
			sendMessage(msg.text, ses) 
				.then(res => {
					console.log(msg.from.id)
					let type = res.result.output.generic[0].response_type;
					const watsonContext = res.result.context.skills['main skill'].user_defined;
					if(watsonContext) {
							if(watsonContext.computar === 1) {
							let data = datahoje(msg.date);
							let tempofim = horariofim(msg.date);
							var usuario;
							pguser.query(`SELECT cod_cpf from usuario_security WHERE id_telegram = '${msg.from.id}'`)
							.then(res => {return res.rows[0].cod_cpf})
							.catch(e => console.error(e.stack));
							console.log('usuario:', usuario);
							const query = {
								text: 'INSERT INTO execucao (cod_assunto, cod_cpf, cod_loja, cod_sku, cod_depto, tipo_validacao, tipo_problema, tem_produto_estoque, tem_produto_gondola, conseguiu_ajustar, motivo_nao_venda, qtde_estoque, qtde_gondola, tempo_inicio, tempo_fim, data_execucao) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);',
								values: [usuario, null, null, watsonContext.sku, watsonContext.departamento, watsonContext.tipoValidacao, watsonContext.tipoProblema, watsonContext.temProdutoEstoque, watsonContext.temprodutoGondola, watsonContext.conseguiuAjustar, watsonContext.motivonaovenda, watsonContext.qtdEstoque, watsonContext.qtdGondola, null, tempofim, data]
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

exports.telegramBot = functions.https.onRequest(telegramBot);
