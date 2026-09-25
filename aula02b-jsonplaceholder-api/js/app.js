const URL_BASE = 'https://jsonplaceholder.typicode.com';

// Elementos do DOM
const telaLista = document.getElementById('tela-lista');
const telaDetalhe = document.getElementById('tela-detalhe');
const telaComentarios = document.getElementById('tela-comentarios');

const mensagemCarregando = document.getElementById('carregando');

const detalheNome = document.getElementById('detalhe-nome');
const listaPosts = document.getElementById('lista-posts');
const listaComentarios = document.getElementById('lista-comentarios');

const botaoVoltar = document.getElementById('btn-voltar');
const botaoVoltarPosts = document.getElementById('btn-voltar-posts');

const campoBusca = document.getElementById('busca-usuario');
const contadorPosts = document.getElementById('contador-posts');

let usuariosCarregados = [];

// Carrega usuários
async function carregarUsuarios() {

    mostrarSpinner(true);

    try {

        const resposta = await fetch(`${URL_BASE}/users`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        usuariosCarregados = await resposta.json();

        renderizarListaUsuarios(usuariosCarregados);

    } catch (erro) {

        console.error('Erro ao carregar usuários:', erro);

        telaLista.innerHTML = `
            <div class="alert alert-danger">
                Não foi possível carregar os usuários.
            </div>
        `;

    } finally {

        mostrarSpinner(false);

    }
}

// Renderiza usuários
function renderizarListaUsuarios(usuarios) {

    telaLista.innerHTML = '';

    usuarios.forEach((usuario) => {

        const coluna = document.createElement('div');

        coluna.className = 'col-md-4';

        coluna.innerHTML = `
            <div class="card card-usuario h-100" data-id="${usuario.id}">

                <div class="card-body">

                    <h5 class="card-title">
                        ${usuario.name}
                    </h5>

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

        coluna
            .querySelector('.card-usuario')
            .addEventListener('click', () => {

                abrirDetalheUsuario(usuario);

            });

        telaLista.appendChild(coluna);

    });
}

// Abre posts do usuário
async function abrirDetalheUsuario(usuario) {

    detalheNome.textContent = `Posts de ${usuario.name}`;

    contadorPosts.textContent = '';

    telaLista.classList.add('d-none');
    campoBusca.classList.add('d-none');

    telaDetalhe.classList.remove('d-none');

    listaPosts.innerHTML = '';

    mostrarSpinner(true);

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

        listaPosts.innerHTML = `
            <li class="list-group-item text-danger">
                Erro ao carregar posts.
            </li>
        `;

    } finally {

        mostrarSpinner(false);

    }
}

// Renderiza posts
function renderizarPosts(posts) {

    listaPosts.innerHTML = '';

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

        item.style.cursor = 'pointer';

        item.innerHTML = `
            <strong>${post.title}</strong>

            <p class="mb-0">
                ${post.body}
            </p>
        `;

        // Clique no post busca os comentários
        item.addEventListener('click', () => {

            abrirComentarios(post);

        });

        listaPosts.appendChild(item);

    });
}

// Carrega comentários do post
async function abrirComentarios(post) {

    telaDetalhe.classList.add('d-none');

    telaComentarios.classList.remove('d-none');

    listaComentarios.innerHTML = '';

    mostrarSpinner(true);

    try {

        const resposta = await fetch(
            `${URL_BASE}/comments?postId=${post.id}`
        );

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const comentarios = await resposta.json();

        renderizarComentarios(comentarios);

    } catch (erro) {

        console.error('Erro ao carregar comentários:', erro);

        listaComentarios.innerHTML = `
            <li class="list-group-item text-danger">
                Erro ao carregar comentários.
            </li>
        `;

    } finally {

        mostrarSpinner(false);

    }
}

// Renderiza comentários
function renderizarComentarios(comentarios) {

    listaComentarios.innerHTML = '';

    if (comentarios.length === 0) {

        listaComentarios.innerHTML = `
            <li class="list-group-item text-muted">
                Nenhum comentário encontrado.
            </li>
        `;

        return;
    }

    comentarios.forEach((comentario) => {

        const item = document.createElement('li');

        item.className = 'list-group-item';

        item.innerHTML = `
            <strong>${comentario.name}</strong>

            <small class="d-block text-muted mb-2">
                ${comentario.email}
            </small>

            <p class="mb-0">
                ${comentario.body}
            </p>
        `;

        listaComentarios.appendChild(item);

    });
}

// Spinner
function mostrarSpinner(mostrar) {

    if (mostrar) {

        mensagemCarregando.style.display = 'block';

    } else {

        mensagemCarregando.style.display = 'none';

    }
}

// Busca em tempo real
campoBusca.addEventListener('input', () => {

    const texto = campoBusca.value.toLowerCase();

    const usuariosFiltrados = usuariosCarregados.filter((usuario) =>
        usuario.name.toLowerCase().includes(texto)
    );

    renderizarListaUsuarios(usuariosFiltrados);

});

// Voltar para usuários
botaoVoltar.addEventListener('click', () => {

    telaDetalhe.classList.add('d-none');

    telaLista.classList.remove('d-none');

    campoBusca.classList.remove('d-none');

});

// Voltar dos comentários para posts
botaoVoltarPosts.addEventListener('click', () => {

    telaComentarios.classList.add('d-none');

    telaDetalhe.classList.remove('d-none');

});

// Inicialização
carregarUsuarios();