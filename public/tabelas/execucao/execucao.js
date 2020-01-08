'use strict'

module.exports = (sequelize, DataTypes) => {

    const execucao = sequelize.define('Setor', {
      cod_assunto: {
            type: DataTypes.STRING,
            primaryKey: true,
            autoIncrement: true,
            field: 'cod_assunto'
        },
        cod_cpf: {
            type: DataTypes.STRING,
            field: 'cod_cpf'
        },
        cod_loja: {
          type: DataTypes.STRING,
          field: 'cod_loja'
        },
        cod_sku: {
          type: DataTypes.STRING,
          field: 'cod_sku'
        },
        cod_depto: {
        type: DataTypes.STRING,
        field: 'cod_depto'
        },
        tipo_validacao: {
          type: DataTypes.STRING,
          field: 'tipo_validacao'
        },
        tipo_problema: {
          type: DataTypes.STRING,
          field: 'tipo_problema'
        },
        tem_produto_estoque: {
          type: DataTypes.STRING,
          field: 'tem_produto_estoque'
        },
        tem_produto_gondola: {
          type: DataTypes.STRING,
          field: 'tem_produto_gondola'
        },
        conseguiu_ajustar: {
          type: DataTypes.STRING,
          field: 'conseguiu_ajustar'
        },
        motivo_nao_venda: {
          type: DataTypes.STRING,
          field: 'motivo_nao_venda'
        },
        qtde_estoque: {
          type: DataTypes.STRING,
          field: 'qtde_estoque'
        },
        qtde_gondola: {
          type: DataTypes.STRING,
          field: 'qtde_gondola'
        },
        tempo_inicio: {
          type: DataTypes.STRING,
          field: 'tempo_inicio'
        },
        tempo_fim: {
          type: DataTypes.STRING,
          field: 'tempo_fim'
        },
        data_execucao: {
          type: DataTypes.STRING,
          field: 'data_execucao'
        }                        
    }, {
        freezeTableName: true,
        schema: 'public',
        tableName: 'execucao',
        timestamps: false
    })

    return execucao
}