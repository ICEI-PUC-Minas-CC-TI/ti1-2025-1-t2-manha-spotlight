document.addEventListener('DOMContentLoaded', function () {
    const eventoSobreposicao = document.getElementById('sobreposicao');
    const btnFecharSobreposicao = document.getElementById('btnFecharSobreposicao');
    const imgEdital = document.getElementById('sobreposicao-img');
    const tituloEdital = document.getElementById('titulo-edital');
    const autorEdital = document.querySelector('#autor-edital span');
    const localEdital = document.querySelector('#local-edital span');
    const dataEdital = document.querySelector('#data-edital span');
    const descricaoEdital = document.getElementById('descricao-edital');

    const btnFavoritar = document.querySelector('.btnFavoritar');
    let currentEditalId = null;

    const searchInput = document.getElementById('campo-busca');  //alterei o nome do search e do button pra corresponder ao minha barra de pesquisa
    const searchButton = document.getElementById('botao-busca');
    const searchInputContainer = searchInput.closest('.input-group').parentNode;
    const searchSuggestions = document.createElement('ul');
    searchSuggestions.id = 'searchSuggestions';
    searchInputContainer.appendChild(searchSuggestions);

    let allEditaisData = [];

    function getFavorites() {
        const favorites = localStorage.getItem('favoritedNews');
        return favorites ? JSON.parse(favorites) : [];
    }

    function saveFavorites(favorites) {
        localStorage.setItem('favoritedNews', JSON.stringify(favorites));
    }

    function isFavorited(id) {
        const favorites = getFavorites();
        return favorites.includes(parseInt(id));
    }

    function toggleFavorite(id) {
        let favorites = getFavorites();
        const idNum = parseInt(id);
        if (favorites.includes(idNum)) {
            favorites = favorites.filter(favId => favId !== idNum);
        } else {
            favorites.push(idNum);
        }
        saveFavorites(favorites);
        updateFavoriteUI(idNum);
        carregarEditais(searchInput.value);
    }

    function updateFavoriteUI(id) {
        if (isFavorited(id)) {
            btnFavoritar.classList.add('favorited');
            btnFavoritar.innerHTML = '<i class="fas fa-heart"></i> Favoritado';
        } else {
            btnFavoritar.classList.remove('favorited');
            btnFavoritar.innerHTML = '<i class="far fa-heart"></i> Favoritar';
        }
    }

    function showSearchSuggestions(term) {
        searchSuggestions.innerHTML = '';
        const suggestions = [];

        if (getFavorites().length > 0 && !term.toLowerCase().includes('favoritos')) {
            suggestions.push('💛 favoritos');
        }

        if (suggestions.length > 0) {
            suggestions.forEach(sug => {
                const li = document.createElement('li');
                li.textContent = sug;
                li.addEventListener('click', () => {
                    searchInput.value = sug.replace('💛 ', '');
                    carregarEditais(searchInput.value);
                    searchSuggestions.style.display = 'none';
                });
                searchSuggestions.appendChild(li);
            });
            searchSuggestions.style.display = 'block';
        } else {
            searchSuggestions.style.display = 'none';
        }
    }

    async function carregarEditais(filterTerm = '') {
        try {
            const response = await fetch('http://localhost:3000/noticias');
            allEditaisData = await response.json();

            let filteredEditais = [];
            const filterTermLower = filterTerm.toLowerCase();

            if (filterTermLower === 'favoritos') {
                const favorites = getFavorites();
                filteredEditais = allEditaisData.filter(edital => {
                    return favorites.includes(parseInt(edital.id));
                });
            } else {
                filteredEditais = allEditaisData.filter(edital =>
                    edital.titulo.toLowerCase().includes(filterTermLower) ||
                    edital.texto.toLowerCase().includes(filterTermLower) ||
                    edital.autor.toLowerCase().includes(filterTermLower) ||
                    edital.local.toLowerCase().includes(filterTermLower)
                );
            }

            const container = document.getElementById('noticias-container');
            container.innerHTML = filteredEditais.map(edital => `
                <div class="col-sm-12 col-md-6 col-lg-6 mb-6">
                    <div class="card h-100" data-id="${edital.id}">
                        <div class="card-img-container" data-id="${edital.id}">
                            <img src="${edital.imagem}" class="card-img-top" alt="${edital.titulo}">
                            ${isFavorited(edital.id) ? '<i class="fas fa-heart favorite-icon-card" style="display: block;"></i>' : ''}
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${edital.titulo}
                                ${isFavorited(edital.id) ? '<span class="favorite-tag">Favoritos</span>' : ''}
                            </h5>
                            <div class="d-flex gap-2 mb-3">
                                <span class="badge bg-light text-dark border">
                                    <i class="fas fa-map-marker-alt text-primary me-1"></i>${edital.local}
                                </span>
                                <span class="badge bg-light text-dark border">
                                    <i class="fas fa-calendar-day text-primary me-1"></i>${edital.data}
                                </span>
                            </div>
                            <p class="card-text">${edital.texto.substring(0, 300)}...</p>
                        </div>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.card-img-container, .card-title').forEach(element => {
                element.addEventListener('click', function(event) {
                    if (event.target.classList.contains('favorite-icon-card')) {
                        return;
                    }

                    const card = this.closest('.card');
                    const editalIdString = card.dataset.id;
                    const edital = allEditaisData.find(n => n.id == editalIdString);

                    if (edital) {
                        currentEditalId = parseInt(edital.id);
                        imgEdital.src = edital.imagem;
                        tituloEdital.textContent = edital.titulo;
                        autorEdital.textContent = edital.autor;
                        localEdital.textContent = edital.local;
                        dataEdital.textContent = edital.data;
                        descricaoEdital.textContent = edital.texto;

                        updateFavoriteUI(currentEditalId);
                        eventoSobreposicao.classList.add('overlay-visible');
                    } else {
                        console.error("Edital não encontrado para o ID:", editalIdString);
                    }
                });
            });

            document.querySelectorAll('.favorite-icon-card').forEach(icon => {
                icon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const id = icon.closest('.card').dataset.id;
                    toggleFavorite(id);
                });
            });

        } catch (error) {
            console.error("Erro ao carregar editais:", error);
        }
    }

    btnFavoritar.addEventListener('click', function() {
        if (currentEditalId !== null) {
            toggleFavorite(currentEditalId);
        }
    });

    btnFecharSobreposicao.addEventListener('click', function() {
        eventoSobreposicao.classList.remove('overlay-visible');
    });

    window.addEventListener('click', function(event) {
        if (event.target === eventoSobreposicao) {
            eventoSobreposicao.classList.remove('overlay-visible');
        }
    });

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value;
        carregarEditais(searchTerm);
        searchSuggestions.style.display = 'none';
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const searchTerm = searchInput.value;
            carregarEditais(searchTerm);
            searchSuggestions.style.display = 'none';
        }
    });

    searchInput.addEventListener('input', () => {
        showSearchSuggestions(searchInput.value);
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchSuggestions.style.display = 'none';
        }, 100);
    });

    searchInput.addEventListener('focus', () => {
        showSearchSuggestions(searchInput.value);
    });

    carregarEditais();
});