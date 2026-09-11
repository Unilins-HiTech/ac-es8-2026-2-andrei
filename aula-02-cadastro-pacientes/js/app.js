// app.js

const pacientes = [];

let quantidadeJSON = 0;
let quantidadeManual = 0;

const formulario = document.getElementById('form-paciente');
const tabela = document.getElementById('tabela-pacientes');
const tabelaCompleta = document.getElementById('tabela');
const mensagemCarregando = document.getElementById('carregando');

const contadorJSON = document.getElementById('contador-json');
const contadorManual = document.getElementById('contador-manual');

function adicionarPaciente(nome, email, nascimento) {
	pacientes.push({ nome, email, nascimento });
}

function atualizarContadores() {
	contadorJSON.textContent = quantidadeJSON;
	contadorManual.textContent = quantidadeManual;
}

function renderizarTabela() {
	tabela.innerHTML = '';

	pacientes.forEach((paciente) => {
		const linha = document.createElement('tr');

		linha.innerHTML = `
			<td>${paciente.nome}</td>
			<td>${paciente.email}</td>
			<td>${formatarData(paciente.nascimento)}</td>
		`;

		tabela.appendChild(linha);
	});
}

function formatarData(dataISO) {
	const [ano, mes, dia] = dataISO.split('-');

	return `${dia}/${mes}/${ano}`;
}

async function carregarPacientesIniciais() {
	try {
		mensagemCarregando.style.display = 'block';
		mensagemCarregando.textContent = 'Carregando pacientes...';

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const resposta = await fetch('./pacientes.json');

		if (!resposta.ok) {
			throw new Error(`Erro HTTP: ${resposta.status}`);
		}

		const dados = await resposta.json();

		if (dados.length === 0) {
			mensagemCarregando.textContent =
				'Nenhum paciente cadastrado ainda';

			tabelaCompleta.style.display = 'none';

			quantidadeJSON = 0;

			atualizarContadores();

			return;
		}

		dados.forEach((paciente) => {
			adicionarPaciente(
				paciente.nome,
				paciente.email,
				paciente.nascimento
			);
		});

		quantidadeJSON = dados.length;

		atualizarContadores();
		renderizarTabela();

		tabelaCompleta.style.display = '';
		mensagemCarregando.style.display = 'none';

	} catch (erro) {
		console.error('Erro ao carregar pacientes:', erro);

		tabelaCompleta.style.display = 'none';

		mensagemCarregando.style.display = 'block';

		mensagemCarregando.textContent =
			'Não foi possível carregar os pacientes.';
	}
}

formulario.addEventListener('submit', (event) => {
	event.preventDefault();

	const nome = document.getElementById('nome').value;
	const email = document.getElementById('email').value;
	const nascimento = document.getElementById('nascimento').value;

	adicionarPaciente(nome, email, nascimento);

	quantidadeManual++;

	atualizarContadores();

	tabelaCompleta.style.display = '';

	renderizarTabela();

	mensagemCarregando.style.display = 'none';

	formulario.reset();
});

carregarPacientesIniciais();