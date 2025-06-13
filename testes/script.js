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

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
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

// Conteúdo ORIGINAL do seu script.js AQUI
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

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
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

    // --- CÓDIGO DA BARRA LATERAL DE CHAT (app.js) ADICIONADO AQUI ---

    const grupoLista = document.querySelector('.grupo-lista');
    const areaConversa = document.getElementById('areaConversa'); // Esta será usada se você mover a área de conversa para cá
    const novoGrupoBtn = document.getElementById('novoGrupoBtn');

    let grupos = [];

    // Imagens fixas para os grupos existentes (IDs 1-5)
    const grupoImages = {
        1: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        2: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        3: 'https://images.unsplash.com/photo-1565201053376-de8b6fd6aa66?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        4: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        5: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    };

    function renderizarGrupos(gruposParaRenderizar = grupos) {
        grupoLista.innerHTML = '';

        if (gruposParaRenderizar.length === 0) {
            grupoLista.innerHTML = '<li class="sem-grupos">Nenhum projeto encontrado</li>';
            return;
        }

        gruposParaRenderizar.forEach(grupo => {
            const grupoItem = document.createElement('li');
            grupoItem.className = 'grupo-item';
            grupoItem.dataset.id = grupo.id;

            const temImagem = grupoImages[grupo.id];

            const iconContent = temImagem ?
                `<div class="grupo-icone" style="background-image: url('${grupoImages[grupo.id]}')"></div>` :
                `<div class="grupo-icone">${grupo.icone}</div>`;

            grupoItem.innerHTML = `
                ${iconContent}
                <div class="grupo-info">
                    <div class="grupo-nome">${grupo.nome}</div>
                    <div class="grupo-ultima-msg">${grupo.ultimaMsg}</div>
                </div>
            `;

            grupoItem.addEventListener('click', function() {
                document.querySelectorAll('.grupo-item').forEach(item => {
                    item.classList.remove('ativo');
                });
                this.classList.add('ativo');
                // IMPORTANTE: A função carregarConversa AGORA DEVE ABRIR UM MODAL OU NAVEGAR PARA O DETALHES.HTML
                // Como não temos a área de conversa diretamente no index.html principal,
                // vamos simular uma ação ou navegar para a página de chat separada.
                // Por ora, vamos apenas logar e, se quiser abrir um modal de chat, seria aqui.
                console.log(`Grupo ${grupo.nome} clicado. Idealmente, abriria uma janela de chat aqui.`);
                
                // Se você quiser que o clique na barra lateral abra a "área de conversa" do chat
                // como um modal similar ao de "detalhes do edital", precisaríamos criar um novo modal
                // para o chat. Por simplicidade, por enquanto, o clique apenas ativa o item na lista.
                // Para abrir em uma página separada como detalhes.html, você faria:
                // window.location.href = `detalhes.html?grupoId=${grupo.id}`;
            });

            grupoLista.appendChild(grupoItem);
        });
    }

    // A função carregarConversa não será mais usada para renderizar a conversa diretamente no index.html
    // porque não há uma "areaConversa" no layout principal para o chat embutido.
    // Ela é relevante para a página de chat dedicada (detalhes.html ou um modal).
    // Vou mantê-la aqui, mas ela não será chamada pelo clique nos itens da barra lateral principal.
    function carregarConversa(grupoId) {
        const grupo = grupos.find(g => g.id == grupoId);

        let mensagensHTML = '';

        if (grupo && grupo.mensagens && grupo.mensagens.length > 0) {
            mensagensHTML = grupo.mensagens.map(msg => `
                <div class="mensagem">
                    <strong>${msg.remetente}:</strong> ${msg.texto}
                    <div class="detalhes-msg">${msg.data} ${msg.hora}</div>
                </div>
            `).join('');
        } else if (grupo) {
            mensagensHTML = `
                <div class="mensagem-vazia">
                    <p>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
                </div>
            `;
        } else {
            mensagensHTML = `
                <div class="mensagem-vazia">
                    <p>Grupo não encontrado.</p>
                </div>
            `;
        }
        // Este bloco de código abaixo AGORA SÓ É RELEVANTE SE areaConversa EXISTIR NO SEU INDEX.HTML
        // E SE VOCÊ QUISER QUE O CHAT SEJA EMBUTIDO.
        // No layout atual, essa 'areaConversa' não existe, então este código não terá efeito direto
        // na interface do usuário do index.html.
        if (areaConversa) { // Verifica se o elemento existe no DOM atual
            areaConversa.innerHTML = `
                <div class="cabecalho-conversa">
                    <h2>${grupo ? grupo.nome : 'Grupo'}</h2>
                </div>
                <div class="mensagens" id="mensagens">
                    ${mensagensHTML}
                </div>
                <div class="enviar-mensagem">
                    <input type="text" placeholder="Envio desabilitado por enquanto..." id="inputMensagem" disabled>
                    <button id="enviarBtn" disabled><i class="fas fa-paper-plane"></i></button>
                </div>
            `;
        }
    }


    novoGrupoBtn.addEventListener('click', function() {
        const nomeGrupo = prompt("Digite o nome do novo projeto:");
        if (nomeGrupo && nomeGrupo.trim() !== '') {
            const novoGrupo = {
                id: grupos.length > 0 ? Math.max(...grupos.map(g => g.id)) + 1 : 1,
                nome: nomeGrupo,
                ultimaMsg: "Projeto criado",
                icone: nomeGrupo.substring(0, 2).toUpperCase(),
                mensagens: []
            };
            grupos.unshift(novoGrupo);
            renderizarGrupos();
            // Opcional: ativar o novo grupo automaticamente
            // const novoItem = grupoLista.querySelector(`[data-id="${novoGrupo.id}"]`);
            // if(novoItem) novoItem.click();
        }
    });

    async function carregarDadosIniciaisChat() { // Renomeada para evitar conflito com carregarEditais
        try {
            const response = await fetch('http://localhost:3000/grupos');
            if (!response.ok) throw new Error('Erro ao carregar dados dos grupos');

            grupos = await response.json();
            renderizarGrupos();

            // Desabilitado o auto-selecionar o primeiro grupo no índice principal,
            // pois a área de conversa em si não está visível aqui.
            // if (grupos.length > 0) {
            //     const primeiroItem = grupoLista.querySelector('.grupo-item');
            //     if (primeiroItem) {
            //         primeiroItem.click();
            //     }
            // }
        } catch (error) {
            console.error('Erro ao carregar projetos de chat:', error);
            // Mostrar mensagem de erro na barra lateral de chat
            const sidebarElement = document.getElementById('mainSidebar'); // Obtém a barra lateral principal
            if (sidebarElement) {
                const chatGroupsList = sidebarElement.querySelector('.grupo-lista');
                if (chatGroupsList) {
                    chatGroupsList.innerHTML = '<li class="erro text-danger text-center">Erro ao carregar projetos de chat</li>';
                }
            }
        }
    }

    carregarDadosIniciaisChat(); // Chama a função para carregar os grupos de chat ao iniciar

});