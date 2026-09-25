const API_URL = 'https://pokeapi.co/api/v2/pokemon';

const pokemonGrid = document.getElementById('pokemonGrid');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Função para buscar os detalhes individuais de um Pokémon
async function fetchPokemonData(urlOrName) {
    const url = urlOrName.startsWith('http')
        ? urlOrName
        : `${API_URL}/${urlOrName.toLowerCase().trim()}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Pokémon não encontrado');
    }

    return await response.json();
}

// Função para carregar a lista inicial
async function loadInitialPokemon(limit = 20) {
    showLoading(true);
    pokemonGrid.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}?limit=${limit}`);
        const data = await response.json();

        const pokemonPromises = data.results.map((item) =>
            fetchPokemonData(item.url)
        );

        const pokemonList = await Promise.all(pokemonPromises);

        pokemonList.forEach(renderPokemonCard);

    } catch (error) {
        showError('Erro ao carregar a lista de Pokémon.');
        console.error(error);

    } finally {
        showLoading(false);
    }
}

// Função para criar os cards
function renderPokemonCard(pokemon) {

    const imageUrl =
        pokemon.sprites.other['official-artwork'].front_default ||
        pokemon.sprites.front_default;

    const typesBadges = pokemon.types
        .map(
            (t) =>
                `<span class="badge bg-secondary badge-type">${t.type.name}</span>`
        )
        .join('');

    const heightInMeters = (pokemon.height / 10).toFixed(1);
    const weightInKg = (pokemon.weight / 10).toFixed(1);

    const cardHTML = `
        <div class="col">

            <div class="card h-100 shadow-sm pokemon-card border-0"
                 onclick="openPokemonModal('${pokemon.name}')">

                <div class="text-center p-3 bg-white rounded-top">

                    <img
                        src="${imageUrl}"
                        class="card-img-top img-fluid"
                        style="max-height: 160px; object-fit: contain;"
                        alt="${pokemon.name}"
                    >

                </div>

                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-center mb-2">

                        <h5 class="card-title text-capitalize fw-bold m-0">
                            ${pokemon.name}
                        </h5>

                        <small class="text-muted">
                            #${String(pokemon.id).padStart(3, '0')}
                        </small>

                    </div>

                    <div class="mb-3">
                        ${typesBadges}
                    </div>

                    <div class="row text-center border-top pt-2">

                        <div class="col-6 border-end">
                            <small class="text-muted d-block">Altura</small>
                            <strong>${heightInMeters} m</strong>
                        </div>

                        <div class="col-6">
                            <small class="text-muted d-block">Peso</small>
                            <strong>${weightInKg} kg</strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    `;

    pokemonGrid.insertAdjacentHTML('beforeend', cardHTML);
}

// Busca específica por nome ou ID
async function handleSearch() {

    const query = searchInput.value.trim();

    if (!query) {
        loadInitialPokemon();
        return;
    }

    showLoading(true);
    pokemonGrid.innerHTML = '';

    try {
        const pokemon = await fetchPokemonData(query);

        renderPokemonCard(pokemon);

    } catch (error) {

        showError(`Nenhum Pokémon encontrado com o termo "${query}".`);

    } finally {

        showLoading(false);
    }
}

// Loading
function showLoading(state) {

    if (state) {
        loading.classList.remove('d-none');
    } else {
        loading.classList.add('d-none');
    }
}

// Erro
function showError(message) {

    pokemonGrid.innerHTML = `
        <div class="col-12">

            <div class="alert alert-warning text-center" role="alert">
                ${message}
            </div>

        </div>
    `;
}

// Abre o modal
async function openPokemonModal(name) {

    const modalElement = document.getElementById('pokemonModal');
    const modal = new bootstrap.Modal(modalElement);

    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.textContent = name;

    // Spinner enquanto carrega
    modalBody.innerHTML = `
        <div class="text-center">

            <div class="spinner-border text-danger"></div>

            <p>Carregando...</p>

        </div>
    `;

    modal.show();

    try {

        const pokemon = await fetchPokemonData(name);

        // Status pedidos
        const statsNames = {
            hp: 'HP',
            attack: 'Ataque',
            defense: 'Defesa',
            speed: 'Velocidade'
        };

        const stats = pokemon.stats
            .filter((stat) => statsNames[stat.stat.name])
            .map((stat) => `
                <p class="mb-1">
                    ${statsNames[stat.stat.name]}: ${stat.base_stat}
                </p>

                <div class="progress mb-3">

                    <div
                        class="progress-bar"
                        style="width: ${Math.min(stat.base_stat, 100)}%"
                    >
                        ${stat.base_stat}
                    </div>

                </div>
            `)
            .join('');

        // Habilidades
        const abilities = pokemon.abilities
            .map((item) => `
                <span class="badge bg-danger me-1">
                    ${item.ability.name}
                </span>
            `)
            .join('');

        // Conteúdo do modal
        modalBody.innerHTML = `

            <h6>Status Base</h6>

            ${stats}

            <h6>Habilidades</h6>

            <div class="mb-4">
                ${abilities}
            </div>

            <h6>Som</h6>

            <audio controls class="mb-4">
                <source src="${pokemon.cries.latest}">
            </audio>

            <h6>Sprites</h6>

            <div class="text-center">

                <img
                    src="${pokemon.sprites.front_default}"
                    alt="Normal frente"
                >

                <img
                    src="${pokemon.sprites.back_default}"
                    alt="Normal costas"
                >

                <img
                    src="${pokemon.sprites.front_shiny}"
                    alt="Shiny frente"
                >

                <img
                    src="${pokemon.sprites.back_shiny}"
                    alt="Shiny costas"
                >

            </div>
        `;

    } catch (error) {

        modalBody.innerHTML = `
            <div class="alert alert-danger">
                Erro ao carregar os detalhes do Pokémon.
            </div>
        `;

        console.error(error);
    }
}

// Eventos
searchBtn.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', (e) => {

    if (e.key === 'Enter') {
        handleSearch();
    }

});

// Inicialização
loadInitialPokemon();