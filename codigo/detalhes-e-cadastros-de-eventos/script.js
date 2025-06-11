document.addEventListener('DOMContentLoaded', () => {
    const listaEventos = document.getElementById('listaEventos');
    const sobreposicao = document.getElementById('sobreposicao');
    const btnFecharSobreposicao = document.getElementById('btnFecharSobreposicao');

    // Elementos da sobreposição
    const nomeGrupoSobreposicao = document.getElementById('nomeGrupoSobreposicao');
    const imgEventoSobreposicao = document.getElementById('imgEventoSobreposicao');
    const descricaoEventoSobreposicao = document.getElementById('descricaoEventoSobreposicao');
    const contadorRegressivo = document.getElementById('contadorRegressivo');

    // Botões de ação dentro da sobreposição
    const btnEditar = document.getElementById('btnEditar');
    const btnExcluir = document.getElementById('btnExcluir');

    // Formulário de Edição
    const formularioEdicaoContainer = document.getElementById('formularioEdicaoContainer');
    const formEdicaoEvento = document.getElementById('formEdicaoEvento');
    const editarEventoId = document.getElementById('editarEventoId');
    const editarNomeGrupo = document.getElementById('editarNomeGrupo');
    const editarDescricaoEvento = document.getElementById('editarDescricaoEvento');
    const editarDataEvento = document.getElementById('editarDataEvento');
    const editarImgCaixaInicial = document.getElementById('editarImgCaixaInicial');
    const editarImgSobreposicao = document.getElementById('editarImgSobreposicao');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');

    let intervaloContador;

    async function carregarEventos() {
        try {
            const response = await fetch('http://localhost:3000/eventos');
            if (!response.ok) {
                throw new Error('Erro ao carregar eventos');
            }
            const eventos = await response.json();
            exibirEventos(eventos);
        } catch (error) {
            console.error('Erro:', error);
            listaEventos.innerHTML = '<p>Erro ao carregar eventos. Verifique se o JSON Server está rodando.</p>';
        }
    }

    // Função para exibir eventos na tela
    function exibirEventos(eventos) {
        listaEventos.innerHTML = '';
        if (eventos.length === 0) {
            listaEventos.innerHTML = '<p>Nenhum evento cadastrado. Que tal adicionar um novo?</p>';
            return;
        }

        eventos.forEach(evento => {
            const caixaInicial = document.createElement('div');
            caixaInicial.classList.add('caixa-inicial');
            caixaInicial.dataset.id = evento.id;

            const imagemSrc = evento.imgCaixaInicial ? evento.imgCaixaInicial : 'sem_imagem.png';
            caixaInicial.innerHTML = `<img src="${imagemSrc}" alt="${evento.nomeGrupo}">`;

            caixaInicial.addEventListener('click', () => abrirSobreposicao(evento));
            listaEventos.appendChild(caixaInicial);
        });
    }

    // Função para abrir a sobreposição de detalhes do evento
    function abrirSobreposicao(evento) {

        if (intervaloContador) {
            clearInterval(intervaloContador);
        }


        nomeGrupoSobreposicao.textContent = evento.nomeGrupo;
        imgEventoSobreposicao.src = evento.imgSobreposicao ? evento.imgSobreposicao : 'sem_imagem.png';
        imgEventoSobreposicao.alt = evento.nomeGrupo;
        descricaoEventoSobreposicao.textContent = evento.descricaoEvento;


        const dataAlvo = new Date(evento.dataEvento).getTime();
        atualizarContador(dataAlvo);
        intervaloContador = setInterval(() => atualizarContador(dataAlvo), 1000);


        btnEditar.dataset.id = evento.id;
        btnExcluir.dataset.id = evento.id;


        formularioEdicaoContainer.classList.add('oculto');

        sobreposicao.classList.add('overlay-visible');
    }

    // Função para fechar a sobreposição
    btnFecharSobreposicao.addEventListener('click', () => {
        sobreposicao.classList.remove('overlay-visible');
        if (intervaloContador) {
            clearInterval(intervaloContador);
        }
    });

    // Função para atualizar o contador regressivo
    function atualizarContador(dataAlvo) {
        const agora = new Date().getTime();
        const diferenca = dataAlvo - agora;

        if (diferenca < 0) {
            contadorRegressivo.textContent = "Evento Encerrado!";
            clearInterval(intervaloContador);
            return;
        }

        const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

        contadorRegressivo.textContent = `Faltam: ${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }


    btnEditar.addEventListener('click', (event) => {
        const eventoId = event.target.dataset.id;
        abrirFormularioEdicao(eventoId);
    });

    // Função para abrir o formulário de edição e preenchê-lo
    async function abrirFormularioEdicao(id) {
        try {
            const response = await fetch(`http://localhost:3000/eventos/${id}`);
            if (!response.ok) {
                throw new Error('Evento não encontrado para edição.');
            }
            const evento = await response.json();

            editarEventoId.value = evento.id;
            editarNomeGrupo.value = evento.nomeGrupo;
            editarDescricaoEvento.value = evento.descricaoEvento;
            // Formata a data para o formato datetime-local (YYYY-MM-DDTHH:MM)
            editarDataEvento.value = evento.dataEvento.substring(0, 16);
            editarImgCaixaInicial.value = evento.imgCaixaInicial || '';
            editarImgSobreposicao.value = evento.imgSobreposicao || '';

            formularioEdicaoContainer.classList.remove('oculto');
        } catch (error) {
            console.error('Erro ao carregar evento para edição:', error);
            alert('Erro ao carregar evento para edição.');
        }
    }


    btnCancelarEdicao.addEventListener('click', () => {
        formularioEdicaoContainer.classList.add('oculto');
    });


    formEdicaoEvento.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = editarEventoId.value;
        const eventoAtualizado = {
            nomeGrupo: editarNomeGrupo.value,
            descricaoEvento: editarDescricaoEvento.value,
            dataEvento: editarDataEvento.value,
            imgCaixaInicial: editarImgCaixaInicial.value,
            imgSobreposicao: editarImgSobreposicao.value,
        };

        try {
            const response = await fetch(`http://localhost:3000/eventos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventoAtualizado),
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar edições.');
            }

            alert('Evento atualizado com sucesso!');
            sobreposicao.classList.remove('overlay-visible');
            carregarEventos();
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            alert('Erro ao atualizar evento.');
        }
    });


    btnExcluir.addEventListener('click', async (event) => {
        const eventoId = event.target.dataset.id;
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            try {
                const response = await fetch(`http://localhost:3000/eventos/${eventoId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Erro ao excluir evento.');
                }

                alert('Evento excluído com sucesso!');
                sobreposicao.classList.remove('overlay-visible');
                carregarEventos();
            } catch (error) {
                console.error('Erro ao excluir evento:', error);
                alert('Erro ao excluir evento.');
            }
        }
    });


    carregarEventos();
});