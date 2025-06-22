document.addEventListener('DOMContentLoaded', function () {
    // --- Seletores de Elementos Existentes ---
    const eventoSobreposicao = document.getElementById('sobreposicao');
    const btnFecharSobreposicao = document.getElementById('btnFecharSobreposicao');
    const imgEdital = document.getElementById('sobreposicao-img');
    const tituloEdital = document.getElementById('titulo-edital');
    const autorEdital = document.querySelector('#autor-edital span');
    const localEdital = document.querySelector('#local-edital span');
    const dataEdital = document.querySelector('#data-edital span');
    const descricaoEdital = document.getElementById('descricao-edital');
    const btnFavoritar = document.querySelector('.btnFavoritar');
    const btnInscricao = document.querySelector('.btnInscricao');
    const btnEditarSobreposicao = document.querySelector('.edit-btn-sobreposicao');
    const btnExcluirSobreposicao = document.querySelector('.delete-btn-sobreposicao');
    let currentEditalId = null;
    let currentGroupId = null;

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const grupoLista = document.querySelector('.grupo-lista');
    const novoGrupoBtn = document.getElementById('novoGrupoBtn');
    const eventoFormSobreposicao = document.getElementById('eventoFormSobreposicao');
    const fecharFormBtn = document.getElementById('fecharFormBtn');
    const eventoForm = document.getElementById('eventoForm');
    
    // --- Seletores de Elementos para Grupos ---
    const groupSection = document.getElementById('groupSection');
    const groupListContainer = document.getElementById('groupListContainer');
    const createGroupModal = document.getElementById('createGroupModal');
    const criarGrupoBtn = document.getElementById('criarGrupoBtn');
    const closeGroupModalBtn = document.getElementById('closeGroupModalBtn');
    const cancelGroupCreationBtn = document.getElementById('cancelGroupCreationBtn');
    const createGroupForm = document.getElementById('createGroupForm');
    
    // --- Seletores do Modal de Detalhes do Grupo ---
    const groupDetailsModal = document.getElementById('groupDetailsModal');
    const closeGroupDetailsModalBtn = document.getElementById('closeGroupDetailsModalBtn');
    const groupDetailsView = document.getElementById('groupDetailsView');
    const groupEditView = document.getElementById('groupEditView');
    const groupDetailsImage = document.getElementById('groupDetailsImage');
    const groupDetailsName = document.getElementById('groupDetailsName');
    const groupDetailsDescription = document.getElementById('groupDetailsDescription');
    const deleteGroupBtn = document.getElementById('deleteGroupBtn');
    const editGroupBtn = document.getElementById('editGroupBtn');
    const groupEditForm = document.getElementById('groupEditForm');
    const cancelEditGroupBtn = document.getElementById('cancelEditGroupBtn');

    let allEditaisData = [];
    let usuarioLogado = null;
    try {
        const usuarioStr = sessionStorage.getItem('usuarioLogado');
        if (usuarioStr) {
            usuarioLogado = JSON.parse(usuarioStr);
        }
    } catch (e) {
        console.error("Erro ao parsear usuarioLogado do sessionStorage:", e);
        sessionStorage.removeItem('usuarioLogado');
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (usuarioLogado) {
            const userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions')) || {};
            Object.keys(userSubscriptions).forEach(editalId => {
                if (userSubscriptions[editalId]) {
                    const btn = document.querySelector(`[data-edital-id="${editalId}"] .btn-inscricao`);
                    if (btn) btn.textContent = 'Cancelar Inscrição';
                }
            });
        }
    });

    function generateRandomPicsumUrl(width = 60, height = 60) {
        return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
    }
    
    // Função para verificar se o usuário é artista
    function isArtista() {
        return usuarioLogado && usuarioLogado.tipo === 'artista';
    }

    // Função para esconder botões CRUD para artistas
    function hideCrudButtonsForArtista() {
        if (isArtista()) {
            // Esconde botões de editar/excluir eventos
            if (btnEditarSobreposicao) btnEditarSobreposicao.style.display = 'none';
            if (btnExcluirSobreposicao) btnExcluirSobreposicao.style.display = 'none';
            
            // Esconde botão de novo grupo
            if (novoGrupoBtn) novoGrupoBtn.style.display = 'none';
            
            // Esconde botões de editar/excluir grupos
            if (editGroupBtn) editGroupBtn.style.display = 'none';
            if (deleteGroupBtn) deleteGroupBtn.style.display = 'none';
            
            // Esconde botão de criar grupo
            if (criarGrupoBtn) criarGrupoBtn.style.display = 'none';
        }
    }

    async function renderGroupsForEdital(editalId) {
        groupListContainer.innerHTML = 'Carregando grupos...';
        try {
            const response = await fetch(`http://localhost:3000/grupos?noticiaId=${editalId}`);
            if (!response.ok) throw new Error('Falha ao buscar grupos.');
            const groups = await response.json();

            if (groups.length === 0) {
                groupListContainer.innerHTML = '<p class="text-center small">Nenhum grupo nesse edital ainda...</p>';
                return;
            }

            groupListContainer.innerHTML = groups.map(group => `
                <div class="group-item-sidebar" data-group-id="${group.id}">
                    ${group.nome}
                </div>
            `).join('');

        } catch (error) {
            console.error("Erro ao renderizar grupos:", error);
            groupListContainer.innerHTML = '<p class="text-center small text-danger">Erro ao carregar grupos.</p>';
        }
    }

    async function openGroupDetailsModal(groupId) {
        try {
            const response = await fetch(`http://localhost:3000/grupos/${groupId}`);
            if (!response.ok) throw new Error('Grupo não encontrado.');
            const group = await response.json();
            
            currentGroupId = group.id;

            groupDetailsImage.src = group.imagem || 'https://via.placeholder.com/120';
            groupDetailsName.textContent = group.nome;
            groupDetailsDescription.textContent = group.descricao;
            
            document.getElementById('groupEditName').value = group.nome;
            document.getElementById('groupEditDescription').value = group.descricao;
            document.getElementById('groupEditAvatar').value = group.imagem;

            const actionButtons = document.getElementById('groupActionButtons');
            if (usuarioLogado && usuarioLogado.produtor && !isArtista()) {
                actionButtons.classList.remove('hidden');
            } else {
                actionButtons.classList.add('hidden');
            }
            
            groupDetailsView.classList.remove('hidden');
            groupEditView.classList.add('hidden');
            groupDetailsModal.classList.add('overlay-visible');

        } catch (error) {
            console.error('Erro ao abrir detalhes do grupo:', error);
            Swal.fire('Erro!', 'Não foi possível carregar os detalhes do grupo.', 'error');
        }
    }

    groupListContainer.addEventListener('click', (event) => {
        const groupItem = event.target.closest('.group-item-sidebar');
        if (groupItem) {
            const groupId = groupItem.dataset.groupId;
            openGroupDetailsModal(groupId);
        }
    });

    editGroupBtn.addEventListener('click', () => {
        groupDetailsView.classList.add('hidden');
        groupEditView.classList.remove('hidden');
    });

    cancelEditGroupBtn.addEventListener('click', () => {
        groupDetailsView.classList.remove('hidden');
        groupEditView.classList.add('hidden');
    });

    closeGroupDetailsModalBtn.addEventListener('click', () => {
        groupDetailsModal.classList.remove('overlay-visible');
        currentGroupId = null;
    });

    deleteGroupBtn.addEventListener('click', () => {
        if (!currentGroupId) return;
        
        Swal.fire({
            title: 'Tem certeza?',
            text: "Esta ação não pode ser revertida!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/grupos/${currentGroupId}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) throw new Error('Falha ao excluir o grupo.');
                    
                    Swal.fire('Excluído!', 'O grupo foi excluído com sucesso.', 'success');
                    groupDetailsModal.classList.remove('overlay-visible');
                    renderGroupsForEdital(currentEditalId);
                } catch(error) {
                    console.error('Erro ao excluir grupo:', error);
                    Swal.fire('Erro!', 'Não foi possível excluir o grupo.', 'error');
                }
            }
        });
    });

    groupEditForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!currentGroupId) return;

        const updatedGroup = {
            nome: document.getElementById('groupEditName').value,
            descricao: document.getElementById('groupEditDescription').value,
            imagem: document.getElementById('groupEditAvatar').value || generateRandomPicsumUrl(120, 120)
        };

        try {
            const response = await fetch(`http://localhost:3000/grupos/${currentGroupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedGroup)
            });
            if (!response.ok) throw new Error('Falha ao salvar alterações.');
            
            const savedGroup = await response.json();
            
            Swal.fire('Sucesso!', 'Grupo atualizado com sucesso!', 'success');
            
            groupDetailsImage.src = savedGroup.imagem;
            groupDetailsName.textContent = savedGroup.nome;
            groupDetailsDescription.textContent = savedGroup.descricao;
            groupDetailsView.classList.remove('hidden');
            groupEditView.classList.add('hidden');
            renderGroupsForEdital(currentEditalId);

        } catch (error) {
            console.error('Erro ao editar grupo:', error);
            Swal.fire('Erro!', 'Não foi possível salvar as alterações.', 'error');
        }
    });

    function getFavorites() {
        const favorites = localStorage.getItem('favoritedNews');
        return favorites ? JSON.parse(favorites) : [];
    }

    function saveFavorites(favorites) {
        localStorage.setItem('favoritedNews', JSON.stringify(favorites));
    }

    function isFavorited(id) {
        return getFavorites().includes(parseInt(id));
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
        if (btnFavoritar) {
            if (isFavorited(id)) {
                btnFavoritar.classList.add('favorited');
                btnFavoritar.innerHTML = '<i class="fas fa-heart"></i> Favoritado';
            } else {
                btnFavoritar.classList.remove('favorited');
                btnFavoritar.innerHTML = '<i class="far fa-heart"></i> Favoritar';
            }
        }
    }
    
    function updateSubscriptionStatus(edital) {
        if (!usuarioLogado) {
            btnInscricao.textContent = 'Faça login para se inscrever';
            btnInscricao.disabled = true;
            groupSection.style.display = 'none';
            return;
        }

        // Verifica tanto o localStorage quanto a API
        const userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions')) || {};
        const isSubscribed = userSubscriptions[edital.id] || 
                           (edital.inscritos && edital.inscritos.includes(usuarioLogado.id));

        if (isSubscribed) {
            btnInscricao.textContent = 'Cancelar Inscrição';
            btnInscricao.disabled = false;
            groupSection.style.display = 'flex';
            renderGroupsForEdital(edital.id);
        } else {
            btnInscricao.textContent = 'Inscrever-se';
            btnInscricao.disabled = false;
            groupSection.style.display = 'none';
        }
    }

    btnInscricao.addEventListener('click', async () => {
        if (!usuarioLogado || !currentEditalId) {
            Swal.fire('Acesso Negado', 'Você precisa fazer login para interagir.', 'warning');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/noticias/${currentEditalId}`);
            if (!response.ok) throw new Error('Não foi possível obter dados do edital.');
            const edital = await response.json();

            const inscritos = edital.inscritos || [];
            const isSubscribed = inscritos.includes(usuarioLogado.id);
            let novosInscritos;
            let successMessage;

            if (isSubscribed) {
                novosInscritos = inscritos.filter(id => id !== usuarioLogado.id);
                successMessage = 'Inscrição cancelada com sucesso!';
            } else {
                novosInscritos = [...inscritos, usuarioLogado.id];
                successMessage = 'Inscrito com sucesso!';
            }

            // 1. Atualiza no JSON Server (API)
            const patchResponse = await fetch(`http://localhost:3000/noticias/${currentEditalId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inscritos: novosInscritos })
            });
            if (!patchResponse.ok) throw new Error('A operação falhou.');

            // 2. Atualiza no localStorage (persistência)
            const userSubscriptions = JSON.parse(localStorage.getItem('userSubscriptions')) || {};
            userSubscriptions[currentEditalId] = !isSubscribed; // true = inscrito, false = cancelado
            localStorage.setItem('userSubscriptions', JSON.stringify(userSubscriptions));

            // 3. Atualiza a UI
            Swal.fire('Sucesso!', successMessage, 'success');
            updateSubscriptionStatus({ ...edital, inscritos: novosInscritos });

        } catch (error) {
            console.error("Erro na operação de inscrição:", error);
            Swal.fire('Erro', `Não foi possível concluir a operação: ${error.message}`, 'error');
        }
    });

    function showSearchSuggestions(term) {
        const searchSuggestions = document.getElementById('searchSuggestions');
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
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allEditaisData = await response.json();

            let filteredEditais = [];
            const filterTermLower = filterTerm.toLowerCase();

            if (filterTermLower === 'favoritos') {
                filteredEditais = allEditaisData.filter(edital => isFavorited(edital.id));
            } else {
                filteredEditais = allEditaisData.filter(edital =>
                    edital.titulo.toLowerCase().includes(filterTermLower) ||
                    (edital.texto && edital.texto.toLowerCase().includes(filterTermLower)) ||
                    edital.autor.toLowerCase().includes(filterTermLower) ||
                    edital.local.toLowerCase().includes(filterTermLower)
                );
            }

            const container = document.getElementById('noticias-container');
            if (!container) return;

            if (filteredEditais.length === 0) {
                container.innerHTML = `<p class="text-muted text-center mt-4">Nenhum edital encontrado.</p>`;
            } else {
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
                                    <span class="badge bg-light text-dark border"><i class="fas fa-map-marker-alt text-primary me-1"></i>${edital.local}</span>
                                    <span class="badge bg-light text-dark border"><i class="fas fa-calendar-day text-primary me-1"></i>${edital.data}</span>
                                </div>
                                <p class="card-text">${(edital.texto || '').substring(0, 300)}...</p>
                            </div>
                        </div>
                    </div>
                `).join('');
            }

            document.querySelectorAll('.card-img-container, .card-title').forEach(element => {
                element.addEventListener('click', function (event) {
                    if (event.target.classList.contains('favorite-icon-card')) return;

                    const card = this.closest('.card');
                    const editalIdString = card.dataset.id;
                    const edital = allEditaisData.find(n => n.id == editalIdString);

                    if (edital) {
                        currentEditalId = edital.id;
                        imgEdital.src = edital.imagem;
                        tituloEdital.textContent = edital.titulo;
                        autorEdital.textContent = edital.autor;
                        localEdital.textContent = edital.local;
                        dataEdital.textContent = edital.data;
                        descricaoEdital.textContent = edital.texto;
                        btnEditarSobreposicao.dataset.id = edital.id;
                        btnExcluirSobreposicao.dataset.id = edital.id;

                        updateFavoriteUI(parseInt(edital.id));
                        updateSubscriptionStatus(edital);
                        
                        eventoSobreposicao.classList.add('overlay-visible');

                        const crudButtons = document.querySelector('.caixa-inscricao .produtor-only');
                        if (crudButtons && usuarioLogado && usuarioLogado.produtor && !isArtista()) {
                            crudButtons.style.display = 'flex';
                        } else if (crudButtons) {
                            crudButtons.style.display = 'none';
                        }
                        
                        // Esconde botões para artistas
                        hideCrudButtonsForArtista();
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

            renderizarGruposDaSidebar();
            updateProdutorElementsVisibility();
            hideCrudButtonsForArtista(); // Aplica as restrições para artistas
        } catch (error) {
            console.error("Erro ao carregar editais:", error);
        }
    }

    btnFavoritar.addEventListener('click', function () {
        if (currentEditalId !== null) toggleFavorite(currentEditalId);
    });

    btnFecharSobreposicao.addEventListener('click', () => eventoSobreposicao.classList.remove('overlay-visible'));

    searchButton.addEventListener('click', () => {
        carregarEditais(searchInput.value);
        searchSuggestions.style.display = 'none';
    });
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            carregarEditais(searchInput.value);
            searchSuggestions.style.display = 'none';
        }
    });
    searchInput.addEventListener('input', () => showSearchSuggestions(searchInput.value));
    searchInput.addEventListener('blur', () => setTimeout(() => searchSuggestions.style.display = 'none', 150));
    searchInput.addEventListener('focus', () => showSearchSuggestions(searchInput.value));

    function renderizarGruposDaSidebar() {
        grupoLista.innerHTML = '';
        if (allEditaisData.length === 0) {
            grupoLista.innerHTML = '<li class="sem-grupos">Nenhum projeto encontrado</li>';
            return;
        }
        const eventosOrdenados = [...allEditaisData].sort((a, b) => (b.id - a.id));
        eventosOrdenados.forEach(edital => {
            const grupoItem = document.createElement('li');
            grupoItem.className = 'grupo-item';
            grupoItem.dataset.id = edital.id;
            const iconContent = edital.imagem ? `<div class="grupo-icone" style="background-image: url('${edital.imagem}'); background-size: cover; background-position: center;"></div>` : `<div class="grupo-icone"><i class="fas fa-calendar-alt"></i></div>`;
            grupoItem.innerHTML = `${iconContent}<div class="grupo-info"><div class="grupo-nome">${edital.titulo}</div><div class="grupo-ultima-msg">Local: ${edital.local}</div></div>`;
            
            grupoItem.addEventListener('click', function() {
                document.querySelectorAll('.card[data-id="'+this.dataset.id+'"] .card-title')[0].click();
            });

            grupoLista.appendChild(grupoItem);
        });
    }

    if (novoGrupoBtn) {
        novoGrupoBtn.addEventListener('click', function () {
            if (usuarioLogado && usuarioLogado.produtor && !isArtista()) {
                mostrarFormulario();
            } else {
                Swal.fire({
                    title: 'Acesso Negado',
                    text: 'Você precisa estar logado como produtor para adicionar eventos.',
                    icon: 'info'
                });
            }
        });
    }

    function mostrarFormulario(edital = null) {
        const formTitulo = document.getElementById('formTitulo');
        const eventoIdInput = document.getElementById('eventoId');
        const tituloInput = document.getElementById('titulo');
        const autorInput = document.getElementById('autor');
        const dataInput = document.getElementById('data');
        const localInput = document.getElementById('local');
        const textoInput = document.getElementById('texto');
        const destaqueInput = document.getElementById('destaque');

        eventoForm.reset();
        if (edital) {
            formTitulo.textContent = 'Editar Evento';
            eventoIdInput.value = edital.id;
            tituloInput.value = edital.titulo;
            autorInput.value = edital.autor;
            dataInput.value = edital.data;
            localInput.value = edital.local;
            textoInput.value = edital.texto;
            destaqueInput.checked = edital.destaque;
        } else {
            formTitulo.textContent = 'Adicionar Novo Evento';
            eventoIdInput.value = '';
        }
        eventoFormSobreposicao.classList.add('overlay-visible');
    }

    function esconderFormulario() {
        eventoFormSobreposicao.classList.remove('overlay-visible');
    }

    eventoForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!usuarioLogado || !usuarioLogado.produtor || isArtista()) {
            Swal.fire('Permissão Negada','Apenas produtores podem adicionar/editar eventos.','error');
            return;
        }

        const id = document.getElementById('eventoId').value;
        const novoEvento = {
            titulo: document.getElementById('titulo').value,
            autor: document.getElementById('autor').value,
            data: document.getElementById('data').value,
            local: document.getElementById('local').value,
            texto: document.getElementById('texto').value,
            destaque: document.getElementById('destaque').checked
        };

        try {
            if (id) {
                const originalEvent = allEditaisData.find(e => e.id == id);
                novoEvento.imagem = (originalEvent && originalEvent.imagem) ? originalEvent.imagem : generateRandomPicsumUrl(600, 400);

                const response = await fetch(`http://localhost:3000/noticias/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoEvento)
                });
                if (!response.ok) throw new Error('Falha ao atualizar evento.');
                Swal.fire('Sucesso!', 'Evento atualizado com sucesso!', 'success');
            } else {
                novoEvento.imagem = generateRandomPicsumUrl(600, 400);
                novoEvento.inscritos = [];
                const response = await fetch('http://localhost:3000/noticias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoEvento)
                });
                if (!response.ok) throw new Error('Falha ao adicionar evento.');
                Swal.fire('Sucesso!', 'Evento adicionado com sucesso!', 'success');
            }
            esconderFormulario();
            carregarEditais();
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            Swal.fire('Erro!', 'Erro ao salvar evento.', 'error');
        }
    });

    async function editarEvento(id) {
        if (!usuarioLogado || !usuarioLogado.produtor || isArtista()) {
            Swal.fire('Permissão Negada','Apenas produtores podem editar eventos.','error');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/noticias/${id}`);
            if (!response.ok) throw new Error('Evento não encontrado para edição.');
            const editalParaEditar = await response.json();
            eventoSobreposicao.classList.remove('overlay-visible');
            mostrarFormulario(editalParaEditar);
        } catch (error) {
            console.error('Erro ao carregar evento para edição:', error);
            Swal.fire('Erro!', 'Erro ao carregar evento para edição.', 'error');
        }
    }

    async function excluirEvento(id) {
        if (!usuarioLogado || !usuarioLogado.produtor || isArtista()) {
            Swal.fire('Permissão Negada', 'Apenas produtores podem excluir eventos.', 'error');
            return;
        }
        Swal.fire({
            title: 'Tem certeza?',
            text: "Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/noticias/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Falha ao excluir evento.');
                    Swal.fire('Sucesso!', 'Evento excluído com sucesso!', 'success');
                    esconderFormulario();
                    eventoSobreposicao.classList.remove('overlay-visible');
                    carregarEditais();
                } catch (error) {
                    console.error('Erro ao excluir evento:', error);
                    Swal.fire('Erro!', 'Erro ao excluir evento.', 'error');
                }
            }
        });
    }

    fecharFormBtn.addEventListener('click', esconderFormulario);
    
    btnEditarSobreposicao.addEventListener('click', function () {
        const id = this.dataset.id;
        if (id) editarEvento(id);
    });

    btnExcluirSobreposicao.addEventListener('click', function () {
        const id = this.dataset.id;
        if (id) excluirEvento(id);
    });

    function showCreateGroupModal() {
        if (!usuarioLogado) {
            Swal.fire('Acesso Negado', 'Você precisa fazer login para criar um grupo.', 'warning');
            return;
        }
        if (!usuarioLogado.produtor || isArtista()) {
            Swal.fire('Acesso Negado', 'Apenas produtores podem criar grupos.', 'error');
            return;
        }

        createGroupForm.reset();
        createGroupModal.classList.add('overlay-visible');
    }

    function hideCreateGroupModal() {
        createGroupModal.classList.remove('overlay-visible');
    }

    criarGrupoBtn.addEventListener('click', showCreateGroupModal);
    closeGroupModalBtn.addEventListener('click', hideCreateGroupModal);
    cancelGroupCreationBtn.addEventListener('click', hideCreateGroupModal);

    createGroupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const groupName = document.getElementById('groupName').value;
        const groupDescription = document.getElementById('groupDescription').value;
        let groupAvatar = document.getElementById('groupAvatar').value;

        if (!groupAvatar) {
            groupAvatar = generateRandomPicsumUrl();
        }

        const newGroup = {
            noticiaId: currentEditalId,
            nome: groupName,
            descricao: groupDescription,
            imagem: groupAvatar,
            ultimaMsg: "Grupo recém-criado!",
            mensagens: []
        };

        try {
            const response = await fetch('http://localhost:3000/grupos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newGroup)
            });

            if (!response.ok) throw new Error('Falha ao criar o grupo.');
            
            Swal.fire('Sucesso!', 'Grupo criado com sucesso!', 'success');
            hideCreateGroupModal();
            renderGroupsForEdital(currentEditalId);

        } catch (error) {
            console.error("Erro ao criar grupo:", error);
            Swal.fire('Erro!', `Não foi possível criar o grupo: ${error.message}`, 'error');
        }
    });

    function updateProdutorElementsVisibility() {
        const produtorElements = document.querySelectorAll('.produtor-only');
        if (usuarioLogado && usuarioLogado.produtor && !isArtista()) {
            produtorElements.forEach(el => el.style.display = 'flex');
        } else {
            produtorElements.forEach(el => el.style.display = 'none');
        }
    }

    window.addEventListener('click', function (event) {
        if (event.target === eventoFormSobreposicao) {
            esconderFormulario();
        }
        if (event.target === createGroupModal) {
            hideCreateGroupModal();
        }
        if (event.target === groupDetailsModal) {
            groupDetailsModal.classList.remove('overlay-visible');
        }
    });
    
    carregarEditais();
    hideCrudButtonsForArtista(); // Aplica as restrições para artistas ao carregar a página
});