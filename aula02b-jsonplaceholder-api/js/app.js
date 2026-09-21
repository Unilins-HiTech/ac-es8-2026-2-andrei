const URL_BASE = 'https://jsonplaceholder.typicode.com';

// Referências aos elementos do DOM
const telaLista = document.getElementById('tela-lista');
const telaDetalhe = document.getElementById('tela-detalhe');
const mensagemCarregando = document.getElementById('carregando');
const detalheNome = document.getElementById('detalhe-nome');
const listaPosts = document.getElementById('lista-posts');
const botaoVoltar = document.getElementById('btn-voltar');
const campoBusca = document.getElementById('busca-usuario');
const contadorPosts = document.getElementById('contador-posts');

let usuariosCarregados = [];

// Busca a lista de usuários na API
async function carregarUsuarios() {

    try {

        const resposta = await fetch(`${URL_BASE}/users`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        usuariosCarregados = await resposta.json();

        renderizarListaUsuarios(usuariosCarregados);

    } catch (erro) {

        console.error('Erro ao carregar usuários:', erro);

        mensagemCarregando.textContent =
            'Não foi possível carregar os usuários.';

        return;
    }

    mensagemCarregando.style.display = 'none';
}

// Desenha um "card" para cada usuário na tela de lista
function renderizarListaUsuarios(usuarios) {

    telaLista.innerHTML = '';

    usuarios.forEach((usuario) => {

        const coluna = document.createElement('div');

        coluna.className = 'col-md-4';

        coluna.innerHTML = `
            <div class="card card-usuario h-100" data-id="${usuario.id}">

                <div class="card-body">

                    <h5 class="card-title">${usuario.name}</h5>

                    <p class="card-text text-muted">
                        ${usuario.email}
                    </p>

                    <p class="card-text">
                        Telefone: ${usuario.phone || 'Não informado'}
                    </p>

                    <p class="card-text">
                        Website: ${usuario.website || 'Não informado'}
                    </p>

                    <p class="card-text">
                        <small>
                            ${usuario.company?.name || 'Empresa não informada'}
                        </small>
                    </p>

                </div>

            </div>
        `;

        // Cada card recebe seu próprio listener
        coluna
            .querySelector('.card-usuario')
            .addEventListener('click', () => {

                abrirDetalheUsuario(usuario);

            });

        telaLista.appendChild(coluna);
    });
}

// Busca os posts de um usuário específico
async function abrirDetalheUsuario(usuario) {

    detalheNome.textContent = `Posts de ${usuario.name}`;

    contadorPosts.textContent = '';

    listaPosts.innerHTML =
        '<li class="list-group-item">Carregando posts...</li>';

    telaLista.classList.add('d-none');

    telaDetalhe.classList.remove('d-none');

    try {

        const resposta = await fetch(
            `${URL_BASE}/posts?userId=${usuario.id}`
        );

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const posts = await resposta.json();

        contadorPosts.textContent =
            `${posts.length} posts encontrados`;

        renderizarPosts(posts);

    } catch (erro) {

        console.error('Erro ao carregar posts:', erro);

        listaPosts.innerHTML =
            '<li class="list-group-item text-danger">Erro ao carregar posts.</li>';

    }
}

// Renderiza os posts
function renderizarPosts(posts) {

    listaPosts.innerHTML = '';

    // Tratamento para usuário sem posts
    if (posts.length === 0) {

        listaPosts.innerHTML = `
            <li class="list-group-item text-muted">
                Este usuário não possui posts.
            </li>
        `;

        return;
    }

    posts.forEach((post) => {

        const item = document.createElement('li');

        item.className = 'list-group-item';

        item.innerHTML = `
            <strong>${post.title}</strong>
            <p class="mb-0">${post.body}</p>
        `;

        listaPosts.appendChild(item);
    });
}

// Filtro de usuários em tempo real
campoBusca.addEventListener('input', () => {

    const texto = campoBusca.value.toLowerCase();

    const usuariosFiltrados = usuariosCarregados.filter((usuario) =>
        usuario.name.toLowerCase().includes(texto)
    );

    renderizarListaUsuarios(usuariosFiltrados);
});

// Botão para voltar
botaoVoltar.addEventListener('click', () => {

    telaDetalhe.classList.add('d-none');

    telaLista.classList.remove('d-none');

});

// Inicialização
carregarUsuarios();