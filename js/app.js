// Array que guarda os pacientes cadastrados (em memória, só nesta sessão)
const pacientes = [];

// Referências aos elementos do DOM
const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const contadorPacientes = document.getElementById('contador-pacientes'); // Referência ao contador

// Função responsável por calcular a idade exata a partir da data ISO (yyyy-mm-dd)
function calcularIdade(dataISO) {
  if (!dataISO) return '';
  const hoje = new Date();
  const nascimento = new Date(dataISO);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  // Ajusta se o aniversário do ano corrente ainda não aconteceu
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
}

// Função responsável por adicionar um paciente ao array (retorna true se adicionou, false se duplicado)
function adicionarPaciente(nome, email, nascimento, telefone) {
  // Validação de E-mail duplicado (ignora letras maiúsculas/minúsculas)
  const emailExiste = pacientes.some(
    (p) => p.email.toLowerCase() === email.toLowerCase()
  );

  if (emailExiste) {
    alert('Atenção: Este e-mail já está cadastrado!');
    return false;
  }

  const novoPaciente = { nome, email, nascimento, telefone };
  pacientes.push(novoPaciente);
  return true;
}

// Função responsável por desenhar a tabela inteira e atualizar o contador
function renderizarTabela() {
  tabela.innerHTML = ''; // Limpa a tabela antes de redesenhar

  pacientes.forEach((paciente) => {
    const linha = document.createElement('tr');

    linha.innerHTML = `
      <td>${paciente.nome}</td>
      <td>${paciente.email}</td>
      <td>${formatarData(paciente.nascimento)}</td>
      <td>${paciente.telefone}</td>
      <td>${calcularIdade(paciente.nascimento)} anos</td>
    `;

    tabela.appendChild(linha);
  });

  // Atualiza o texto do contador de pacientes
  contadorPacientes.textContent = `Total de pacientes: ${pacientes.length}`;
}

// Função utilitária para formatar a data no padrão dd/mm/aaaa
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Evento disparado quando o formulário é enviado
formulario.addEventListener('submit', (event) => {
  event.preventDefault(); // Evita o recarregamento da página

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const nascimento = document.getElementById('nascimento').value;
  const telefone = document.getElementById('telefone').value;

  // Tenta adicionar o paciente. Se for bem-sucedido (não duplicado), atualiza a tela
  const adicionado = adicionarPaciente(nome, email, nascimento, telefone);

  if (adicionado) {
    renderizarTabela();
    formulario.reset(); // Limpa os campos do formulário
  }
});