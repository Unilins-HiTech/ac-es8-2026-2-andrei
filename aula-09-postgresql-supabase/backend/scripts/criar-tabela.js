const fs = require('fs');
const path = require('path');
const pool = require('../banco');

async function criarTabela() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  await pool.query(sql);
  console.log('Tabela "pacientes" pronta.');

  await pool.end(); // encerra as conexões para o script terminar
}

criarTabela().catch((erro) => {
  console.error('Falha ao criar a tabela:', erro);
  process.exit(1);
});