
const URL_API = 'https://ac-es8-2026-2-andrei.onrender.com/pacientes';

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const mensagem = document.getElementById('mensagem');
const mensagemCarregando = document.getElementById('carregando');

const campoId = document.getElementById('id');
const campoNome = document.getElementById('nome');
const campoEmail = document.getElementById('email');
const campoNascimento = document.getElementById('nascimento');

const botaoSalvar = document.getElementById('btn-salvar');
const botaoCancelar = document.getElementById('btn-cancelar');

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

function mostrarMensagem(texto, tipo = 'danger') {
  mensagem.innerHTML = '';

  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo}`;
  alerta.textContent = texto;

  mensagem.appendChild(alerta);
}

function criarCelula(texto) {
  const celula = document.createElement('td');
  celula.textContent = texto;
  return celula;
}

// Ler mensagens especÃ­ficas da API
async function verificarResposta(resposta) {
  if (!resposta.ok) {
    let mensagemErro = `Erro HTTP: ${resposta.status}`;

    try {
      const dados = await resposta.json();
      mensagemErro = dados.erro || mensagemErro;
    } catch {
      // MantÃ©m a mensagem HTTP original
    }

    throw new Error(mensagemErro);
  }

  return resposta;
}

function renderizarTabela(pacientes) {
  tabela.innerHTML = '';

  pacientes.forEach(paciente => {
    const linha = document.createElement('tr');

    linha.appendChild(criarCelula(paciente.nome));
    linha.appendChild(criarCelula(paciente.email));
    linha.appendChild(criarCelula(formatarData(paciente.nascimento)));

    const celulaAcoes = document.createElement('td');

    const botaoEditar = document.createElement('button');
    botaoEditar.textContent = 'Editar';
    botaoEditar.className =
      'btn btn-sm btn-outline-primary me-2';

    botaoEditar.addEventListener('click', () => {
      iniciarEdicao(paciente);
    });

    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.className =
      'btn btn-sm btn-outline-danger';

    botaoExcluir.addEventListener('click', () => {
      excluirPaciente(paciente.id);
    });

    celulaAcoes.appendChild(botaoEditar);
    celulaAcoes.appendChild(botaoExcluir);

    linha.appendChild(celulaAcoes);
    tabela.appendChild(linha);
  });
}

function iniciarEdicao(paciente) {
  campoId.value = paciente.id;
  campoNome.value = paciente.nome;
  campoEmail.value = paciente.email;
  campoNascimento.value = paciente.nascimento;

  botaoSalvar.textContent = 'Atualizar';
  botaoCancelar.classList.remove('d-none');

  campoNome.focus();
}

function limparFormulario() {
  formulario.reset();
  campoId.value = '';

  botaoSalvar.textContent = 'Salvar';
  botaoCancelar.classList.add('d-none');
}

// GET - Listar pacientes
async function listarPacientes() {
  try {
    const resposta = await fetch(URL_API);

    await verificarResposta(resposta);

    const pacientes = await resposta.json();

    renderizarTabela(pacientes);
    mensagemCarregando.style.display = 'none';

  } catch (erro) {
    console.error(erro);
    mensagemCarregando.style.display = 'none';

    mostrarMensagem(
      `NÃ£o foi possÃ­vel carregar os pacientes: ${erro.message}`
    );
  }
}

// POST - Cadastrar ou PUT - Editar
async function salvarPaciente(dados, id) {
  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `${URL_API}/${id}` : URL_API;

  const resposta = await fetch(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  });

  await verificarResposta(resposta);
}

// DELETE - Excluir paciente
async function excluirPaciente(id) {
  if (!confirm('Deseja realmente excluir este paciente?')) {
    return;
  }

  try {
    const resposta = await fetch(`${URL_API}/${id}`, {
      method: 'DELETE'
    });

    await verificarResposta(resposta);

    mostrarMensagem(
      'Paciente excluÃ­do com sucesso.',
      'success'
    );

    await listarPacientes();

  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message);
  }
}

// Evento do formulÃ¡rio
formulario.addEventListener('submit', async event => {
  event.preventDefault();

  const dados = {
    nome: campoNome.value,
    email: campoEmail.value,
    nascimento: campoNascimento.value
  };

  try {
    await salvarPaciente(dados, campoId.value);

    mostrarMensagem(
      'Paciente salvo com sucesso.',
      'success'
    );

    limparFormulario();
    await listarPacientes();

  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message);
  }
});

// Cancelar ediÃ§Ã£o
botaoCancelar.addEventListener('click', limparFormulario);

// Carregar os pacientes ao iniciar
listarPacientes();

