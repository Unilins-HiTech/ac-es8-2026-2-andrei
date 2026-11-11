
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Banco de dados em memória
const pacientes = [
  {
    id: 1,
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    nascimento: '1990-04-12'
  },
  {
    id: 2,
    nome: 'João Pereira',
    email: 'joao.pereira@email.com',
    nascimento: '1985-11-30'
  },
  {
    id: 3,
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    nascimento: '2001-07-08'
  }
];

let proximoId = 4;

// Validar os dados dos pacientes
function validarPaciente(dados, parcial = false) {
  const { nome, email, nascimento } = dados;

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
    const hoje = new Date();

    if (
      Number.isNaN(data.getTime()) ||
      data.toISOString().slice(0, 10) !== nascimento
    ) {
      return 'Informe uma data de nascimento válida';
    }

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

// Verificar se o e-mail já pertence a outro paciente
function emailDuplicado(email, ignorarId = null) {
  return pacientes.some(p =>
    p.id !== ignorarId &&
    p.email.toLowerCase() === email.toLowerCase()
  );
}

// GET - Listar pacientes e filtrar por nome
app.get('/pacientes', (req, res) => {
  const nome = req.query.nome;

  if (nome) {
    const filtrados = pacientes.filter(p =>
      p.nome.toLowerCase().includes(String(nome).toLowerCase())
    );

    return res.json(filtrados);
  }

  res.json(pacientes);
});

// GET - Total de pacientes
app.get('/pacientes/total', (req, res) => {
  res.json({ total: pacientes.length });
});

// GET - Buscar paciente pelo ID
app.get('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find(p => p.id === id);

  if (!paciente) {
    return res.status(404).json({
      erro: 'Paciente não encontrado'
    });
  }

  res.json(paciente);
});

// POST - Cadastrar paciente
app.post('/pacientes', (req, res) => {
  const dados = req.body ?? {};
  const erro = validarPaciente(dados);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const { nome, email, nascimento } = dados;

  if (emailDuplicado(email)) {
    return res.status(409).json({
      erro: 'Este e-mail já está cadastrado'
    });
  }

  const novoPaciente = {
    id: proximoId++,
    nome: nome.trim(),
    email: email.trim(),
    nascimento
  };

  pacientes.push(novoPaciente);

  res.status(201).json(novoPaciente);
});

// PUT - Atualizar todos os dados do paciente
app.put('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find(p => p.id === id);

  if (!paciente) {
    return res.status(404).json({
      erro: 'Paciente não encontrado'
    });
  }

  const dados = req.body ?? {};
  const erro = validarPaciente(dados);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const { nome, email, nascimento } = dados;

  if (emailDuplicado(email, id)) {
    return res.status(409).json({
      erro: 'Este e-mail já está cadastrado'
    });
  }

  paciente.nome = nome.trim();
  paciente.email = email.trim();
  paciente.nascimento = nascimento;

  res.json(paciente);
});

// PATCH - Atualizar apenas os dados enviados
app.patch('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const paciente = pacientes.find(p => p.id === id);

  if (!paciente) {
    return res.status(404).json({
      erro: 'Paciente não encontrado'
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

  if (
    dados.email !== undefined &&
    emailDuplicado(dados.email, id)
  ) {
    return res.status(409).json({
      erro: 'Este e-mail já está cadastrado'
    });
  }

  if (dados.nome !== undefined) {
    paciente.nome = dados.nome.trim();
  }

  if (dados.email !== undefined) {
    paciente.email = dados.email.trim();
  }

  if (dados.nascimento !== undefined) {
    paciente.nascimento = dados.nascimento;
  }

  res.json(paciente);
});

// DELETE - Excluir paciente
app.delete('/pacientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = pacientes.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({
      erro: 'Paciente não encontrado'
    });
  }

  pacientes.splice(indice, 1);

  res.status(204).send();
});

// Iniciar servidor
const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
