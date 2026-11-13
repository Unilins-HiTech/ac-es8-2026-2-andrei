
const express = require('express');
const cors = require('cors');
const pool = require('./banco');

const app = express();

app.use(cors());
app.use(express.json());

const COLUNAS = 'id, nome, email, nascimento';

// Validar os dados dos pacientes
function validarPaciente(dados, parcial = false) {
  const { nome, email, nascimento } = dados ?? {};

  if (!parcial && (!nome || !email || !nascimento)) {
    return 'Nome, e-mail e nascimento são obrigatórios';
  }

  if (nome !== undefined) {
    if (typeof nome !== 'string' || !nome.trim()) {
      return 'Informe um nome válido';
    }
  }

  if (email !== undefined) {
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return 'Informe um e-mail válido';
    }
  }

  if (nascimento !== undefined) {
    if (
      typeof nascimento !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(nascimento)
    ) {
      return 'Informe uma data de nascimento válida';
    }

    const data = new Date(`${nascimento}T00:00:00Z`);

    if (
      Number.isNaN(data.getTime()) ||
      data.toISOString().slice(0, 10) !== nascimento
    ) {
      return 'Informe uma data de nascimento válida';
    }

    const hoje = new Date();
    const hojeISO = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      String(hoje.getDate()).padStart(2, '0')
    ].join('-');

    if (nascimento > hojeISO) {
      return 'A data de nascimento não pode ser futura';
    }
  }

  return null;
}

// Validar ID
function idValido(id) {
  return Number.isInteger(id) && id > 0;
}

// Tratar erros do PostgreSQL
function tratarErro(res, erro) {
  console.error(erro);

  if (erro.code === '23505') {
    return res.status(409).json({
      erro: 'Este e-mail já está cadastrado'
    });
  }

  res.status(500).json({
    erro: 'Erro interno do servidor'
  });
}

// GET - Listar pacientes e filtrar por nome
app.get('/pacientes', async (req, res) => {
  try {
    const nome = req.query.nome;

    if (nome) {
      const resultado = await pool.query(
        `SELECT ${COLUNAS} FROM pacientes
         WHERE nome ILIKE $1 ORDER BY id`,
        [`%${nome}%`]
      );

      return res.json(resultado.rows);
    }

    const resultado = await pool.query(
      `SELECT ${COLUNAS} FROM pacientes ORDER BY id`
    );

    res.json(resultado.rows);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// GET - Total de pacientes
app.get('/pacientes/total', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT COUNT(*) FROM pacientes'
    );

    res.json({
      total: Number(resultado.rows[0].count)
    });
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// GET - Buscar paciente pelo ID
app.get('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      erro: 'ID inválido'
    });
  }

  try {
    const resultado = await pool.query(
      `SELECT ${COLUNAS} FROM pacientes WHERE id = $1`,
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: 'Paciente não encontrado'
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// POST - Cadastrar paciente
app.post('/pacientes', async (req, res) => {
  const dados = req.body ?? {};
  const erro = validarPaciente(dados);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const { nome, email, nascimento } = dados;

  try {
    const resultado = await pool.query(
      `INSERT INTO pacientes (nome, email, nascimento)
       VALUES ($1, $2, $3)
       RETURNING ${COLUNAS}`,
      [nome.trim(), email.trim(), nascimento]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// PUT - Atualizar todos os dados
app.put('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      erro: 'ID inválido'
    });
  }

  const dados = req.body ?? {};
  const erro = validarPaciente(dados);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const { nome, email, nascimento } = dados;

  try {
    const resultado = await pool.query(
      `UPDATE pacientes
       SET nome = $1, email = $2, nascimento = $3
       WHERE id = $4
       RETURNING ${COLUNAS}`,
      [nome.trim(), email.trim(), nascimento, id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: 'Paciente não encontrado'
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// PATCH - Atualizar apenas os campos enviados
app.patch('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      erro: 'ID inválido'
    });
  }

  const dados = req.body ?? {};
  const campos = Object.keys(dados);

  if (
    campos.length === 0 ||
    campos.some(campo =>
      !['nome', 'email', 'nascimento'].includes(campo)
    )
  ) {
    return res.status(400).json({
      erro: 'Informe ao menos um campo válido para atualizar'
    });
  }

  const erro = validarPaciente(dados, true);

  if (erro) {
    return res.status(400).json({ erro });
  }

  try {
    const valores = campos.map(campo => {
      if (campo === 'nome' || campo === 'email') {
        return dados[campo].trim();
      }

      return dados[campo];
    });

    const atualizacoes = campos.map(
      (campo, indice) => `${campo} = $${indice + 1}`
    );

    valores.push(id);

    const resultado = await pool.query(
      `UPDATE pacientes
       SET ${atualizacoes.join(', ')}
       WHERE id = $${valores.length}
       RETURNING ${COLUNAS}`,
      valores
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: 'Paciente não encontrado'
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// DELETE - Excluir paciente
app.delete('/pacientes/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      erro: 'ID inválido'
    });
  }

  try {
    const resultado = await pool.query(
      'DELETE FROM pacientes WHERE id = $1',
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        erro: 'Paciente não encontrado'
      });
    }

    res.status(204).send();
  } catch (erro) {
    tratarErro(res, erro);
  }
});

// Iniciar servidor
const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
