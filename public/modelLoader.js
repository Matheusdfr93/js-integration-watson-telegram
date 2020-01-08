'use strict'

const env = process.env.NODE_ENV || 'development'
const config = require('./tabelas/execucao/execucao')[env]
const path = require('path')
let Sequelize = require('sequelize')

//Criando a conexão com o banco de dados de acordo com a configuração do config.json
let sequelize = new Sequelize(config.database, config.username, config.password, config)
let db = {}

//Criando um array do caminho dos modelos
const models = [
    ''
]

let l = models.length

//Irá importar os modelos para o sequelize
for (let i = 0; i < l; i++) {
    let model = sequelize.import(path.join(models[i]))
    db[model.name] = model
}

//Irá percorrer e separar apenas o objeto que contém a propriedade associate, sem o "associate" o sequelize não monta uma relação!
Object.keys(db).forEach((modelName) => {
    if ('associate' in db[modelName])
        db[modelName].associate(db)
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db