const mongoose = require('mongoose');

// Substitua 'meu_banco_de_dados' pelo nome do seu banco de dados
const dbURI = 'mongodb://127.0.0.1:27017/meu_banco_de_dados';

mongoose.connect(dbURI)
  .then(() => {
    console.log('Conectado ao MongoDB!');
  })
  .catch(err => {
    console.error('Erro de conexão com o MongoDB:', err);
  });

