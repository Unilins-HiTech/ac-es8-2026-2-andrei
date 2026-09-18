<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pokédex Completa - Solução do Desafio</title>
  <!-- Bootstrap 5 CSS -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <style>
    .pokemon-card {
      transition: transform 0.2s ease-in-out;
      cursor: pointer;
    }
    .pokemon-card:hover {
      transform: translateY(-5px);
    }
    .badge-type {
      text-transform: capitalize;
      margin-right: 4px;
    }
    .sprite-box {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 8px;
      text-align: center;
    }
  </style>
</head>
<body class="bg-light">

  <div class="container py-5">
    <header class="text-center mb-5">
      <h1 class="display-4 fw-bold text-danger">Pokédex</h1>
      <p class="lead text-secondary">Clique em qualquer Pokémon para abrir os detalhes completos!</p>
    </header>

    <!-- Área de Busca / Filtro -->
    <div class="row justify-content-center mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            id="searchInput"
            class="form-control"
            placeholder="Buscar por nome (ex: pikachu, charizard)..."
          />
          <button class="btn btn-danger" type="button" id="searchBtn">Buscar</button>
        </div>
      </div>
    </div>

    <!-- Spinner de Carregamento Principal -->
    <div id="loading" class="text-center my-5 d-none">
      <div class="spinner-border text-danger" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <!-- Grid de Pokémon -->
    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4" id="pokemonGrid"></div>
  </div>

  <!-- MODAL DE DETALHES DO POKÉMON -->
  <div class="modal fade" id="pokemonModal" tabindex="-1" aria-labelledby="pokemonModalTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title text-capitalize fw-bold" id="pokemonModalTitle">Detalhes do Pokémon</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
        </div>
        <div class="modal-body p-4" id="pokemonModalBody">
          <!-- Conteúdo gerado via JavaScript -->
        </div>
      </div>
    </div>
  </div>

  <!-- Bootstrap 5 JavaScript (necessário para o Modal funcionar) -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

  <!-- Lógica JavaScript -->
  <script>
    const API_URL = 'https://pokeapi.co/api/v2/pokemon';
    const pokemonGrid = document.getElementById('pokemonGrid');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Instância do Modal do Bootstrap
    const modalElement = document.getElementById('pokemonModal');
    const pokemonModal = new bootstrap.Modal(modalElement);
    const modalTitle = document.getElementById('pokemonModalTitle');
    const modalBody = document.getElementById('pokemonModalBody');

    // Função para buscar dados da PokéAPI
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

    // Carrega a lista inicial (20 primeiros)
    async function loadInitialPokemon(limit = 20) {
      showLoading(true);
      pokemonGrid.innerHTML = '';
      
      try {
        const response = await fetch(`${API_URL}?limit=${limit}`);
        const data = await response.json();
        
        const pokemonPromises = data.results.map(item => fetchPokemonData(item.url));
        const pokemonList = await Promise.all(pokemonPromises);
        
        pokemonList.forEach(renderPokemonCard);
      } catch (error) {
        showError('Erro ao carregar a lista de Pokémon.');
        console.error(error);
      } finally {
        showLoading(false);
      }
    }

    // Renderiza o card individual na Grid
    function renderPokemonCard(pokemon) {
      const imageUrl = pokemon.sprites.other['official-artwork'].front_default 
        || pokemon.sprites.front_default;

      const typesBadges = pokemon.types
        .map(t => `<span class="badge bg-secondary badge-type">${t.type.name}</span>`)
        .join('');

      const heightInMeters = (pokemon.height / 10).toFixed(1);
      const weightInKg = (pokemon.weight / 10).toFixed(1);

      const cardHTML = `
        <div class="col">
          <div class="card h-100 shadow-sm pokemon-card border-0" onclick="openPokemonModal('${pokemon.id}')">
            <div class="text-center p-3 bg-white rounded-top">
              <img src="${imageUrl}" class="card-img-top img-fluid" style="max-height: 160px; object-fit: contain;" alt="${pokemon.name}">
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title text-capitalize fw-bold m-0">${pokemon.name}</h5>
                <small class="text-muted">#${String(pokemon.id).padStart(3, '0')}</small>
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

    // Abre e preenche o Modal com as estatísticas e detalhes avançados
    async function openPokemonModal(idOrName) {
      // Exibe indicador de carregamento dentro do Modal
      modalTitle.textContent = 'Carregando...';
      modalBody.innerHTML = `
        <div class="text-center py-4">
          <div class="spinner-border text-danger" role="status"></div>
        </div>
      `;
      pokemonModal.show();

      try {
        const pokemon = await fetchPokemonData(idOrName);

        modalTitle.textContent = `${pokemon.name} #${String(pokemon.id).padStart(3, '0')}`;

        // Habilidades
        const abilities = pokemon.abilities
          .map(a => `<span class="badge bg-dark me-1 text-capitalize">${a.ability.name}${a.is_hidden ? ' (oculta)' : ''}</span>`)
          .join('');

        // Som/Cry
        const cryAudio = pokemon.cries?.latest || pokemon.cries?.legacy;
        const audioHTML = cryAudio 
          ? `<audio controls class="w-100 mt-2">
               <source src="${cryAudio}" type="audio/ogg">
               Seu navegador não suporta áudio.
             </audio>`
          : '<p class="text-muted small">Som indisponível</p>';

        // Mapeamento de Status Base
        const statsMap = {
          'hp': { name: 'HP', color: 'bg-success' },
          'attack': { name: 'Ataque', color: 'bg-danger' },
          'defense': { name: 'Defesa', color: 'bg-warning' },
          'speed': { name: 'Velocidade', color: 'bg-info' }
        };

        const statsHTML = pokemon.stats
          .filter(s => statsMap[s.stat.name])
          .map(s => {
            const config = statsMap[s.stat.name];
            const percent = Math.min((s.base_stat / 150) * 100, 100); // Ex: base max ~150 para escala visual
            return `
              <div class="mb-2">
                <div class="d-flex justify-content-between mb-1">
                  <span class="fw-bold small">${config.name}</span>
                  <span class="fw-bold small">${s.base_stat}</span>
                </div>
                <div class="progress" style="height: 12px;">
                  <div class="progress-bar ${config.color}" role="progressbar" style="width: ${percent}%;" aria-valuenow="${s.base_stat}" aria-valuemin="0" aria-valuemax="150"></div>
                </div>
              </div>
            `;
          }).join('');

        // Sprites
        const spriteNormalFront = pokemon.sprites.front_default || '';
        const spriteNormalBack = pokemon.sprites.back_default || '';
        const spriteShinyFront = pokemon.sprites.front_shiny || '';
        const spriteShinyBack = pokemon.sprites.back_shiny || '';

        modalBody.innerHTML = `
          <div class="row g-4">
            <!-- Coluna Esquerda: Som e Sprites -->
            <div class="col-md-5">
              <h6 class="fw-bold mb-3">Variações de Sprites</h6>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <div class="sprite-box">
                    <img src="${spriteNormalFront}" class="img-fluid" alt="Normal Frente">
                    <small class="d-block text-muted">Normal (Frente)</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="sprite-box">
                    <img src="${spriteNormalBack}" class="img-fluid" alt="Normal Costas">
                    <small class="d-block text-muted">Normal (Costas)</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="sprite-box">
                    <img src="${spriteShinyFront}" class="img-fluid" alt="Shiny Frente">
                    <small class="d-block text-muted">Shiny (Frente)</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="sprite-box">
                    <img src="${spriteShinyBack}" class="img-fluid" alt="Shiny Costas">
                    <small class="d-block text-muted">Shiny (Costas)</small>
                  </div>
                </div>
              </div>

              <h6 class="fw-bold mb-2">Voz / Som (Cry)</h6>
              ${audioHTML}
            </div>

            <!-- Coluna Direita: Stats e Habilidades -->
            <div class="col-md-7">
              <h6 class="fw-bold mb-3">Status Base</h6>
              <div class="mb-4">
                ${statsHTML}
              </div>

              <h6 class="fw-bold mb-2">Habilidades</h6>
              <div>
                ${abilities}
              </div>
            </div>
          </div>
        `;
      } catch (error) {
        modalTitle.textContent = 'Erro';
        modalBody.innerHTML = `
          <div class="alert alert-danger" role="alert">
            Não foi possível carregar os detalhes deste Pokémon.
          </div>
        `;
      }
    }

    // Busca por input
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

    // Auxiliares de UI
    function showLoading(state) {
      if (state) {
        loading.classList.remove('d-none');
      } else {
        loading.classList.add('d-none');
      }
    }

    function showError(message) {
      pokemonGrid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center" role="alert">
            ${message}
          </div>
        </div>
      `;
    }

    // Listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });

    // Início
    loadInitialPokemon();
  </script>
</body>
</html>