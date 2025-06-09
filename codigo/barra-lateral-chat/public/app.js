document.addEventListener('DOMContentLoaded', function() {
    const grupoLista = document.querySelector('.grupo-lista');
    const areaConversa = document.getElementById('areaConversa');
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
            
            // Verifica se é um grupo existente (com ID de 1 a 5) para mostrar imagem
            const temImagem = grupoImages[grupo.id];
            
            const iconContent = temImagem 
                ? `<div class="grupo-icone" style="background-image: url('${grupoImages[grupo.id]}')"></div>`
                : `<div class="grupo-icone">${grupo.icone}</div>`;
            
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
                carregarConversa(grupo.id);
            });
            
            grupoLista.appendChild(grupoItem);
        });
    }

    function carregarConversa(grupoId) {
        const grupo = grupos.find(g => g.id == grupoId);

        let mensagensHTML = '';

        if (grupo.mensagens && grupo.mensagens.length > 0) {
            mensagensHTML = grupo.mensagens.map(msg => `
                <div class="mensagem">
                    <strong>${msg.remetente}:</strong> ${msg.texto}
                    <div class="detalhes-msg">${msg.data} ${msg.hora}</div>
                </div>
            `).join('');
        } else {
            mensagensHTML = `
                <div class="mensagem-vazia">
                    <p>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
                </div>
            `;
        }

        areaConversa.innerHTML = `
            <div class="cabecalho-conversa">
                <h2>${grupo.nome}</h2>
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
        }
    });

    async function carregarDadosIniciais() {
        try {
            const response = await fetch('http://localhost:3000/grupos');
            if (!response.ok) throw new Error('Erro ao carregar dados');
            
            grupos = await response.json();
            renderizarGrupos();

            if (grupos.length > 0) {
                const primeiroItem = grupoLista.querySelector('.grupo-item');
                if (primeiroItem) {
                    primeiroItem.click();
                }
            }
        } catch (error) {
            console.error('Erro:', error);
            grupoLista.innerHTML = '<li class="erro">Erro ao carregar projetos</li>';
        }
    }

    carregarDadosIniciais();
});