document.addEventListener('DOMContentLoaded', function () {
    const organizacaoCaixasIniciais = document.querySelector('.organizacao-caixas-iniciais');

    const eventoSobreposicao = document.getElementById('sobreposicao');
    const btnFecharSobreposicao = document.getElementById('btnFecharSobreposicao');
    const imgDoGrupoNaSobreposicao = document.getElementById('sobreposicao-img');
    const nomeDoGrupo = document.getElementById('nome-grupo');
    const descricaoDoGrupo = document.getElementById('descricao');
    const contagemRegressiva = document.getElementById('contador');

    let intervaloContador;

    // Função que você nomeou: contarTempoRestante (camel case)
    function contarTempoRestante(dataAlvo) {
        if (intervaloContador) {
            clearInterval(intervaloContador); // Usamos clearInterval diretamente
        }

        const dataFinal = new Date(dataAlvo).getTime();

        // Usamos setInterval diretamente
        intervaloContador = setInterval(() => {
            const agora = new Date().getTime();
            const diferenca = dataFinal - agora;

            const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

            if (diferenca < 0) {
                clearInterval(intervaloContador); // Usamos clearInterval diretamente
                contagemRegressiva.textContent = "EVENTO ENCERRADO!";
            } else {
                contagemRegressiva.textContent = `Faltam: ${dias}d ${horas}h ${minutos}m ${segundos}s`;
            }
        }, 1000);
    }

    // Função que você nomeou: puxarDados (camel case)
    async function puxarDados() {
        // Bloco try-catch removido
        const response = await fetch('http://localhost:3000/eventos');
        const informacoesDoEvento = await response.json();

        organizacaoCaixasIniciais.innerHTML = '';

        informacoesDoEvento.forEach(evento => {
            const caixaInicial = document.createElement('div');
            caixaInicial.classList.add('caixa-inicial');
            caixaInicial.dataset.id = evento.id;

            const imagem = document.createElement('img');
            imagem.src = evento.imgCaixaInicial;
            imagem.alt = evento.nomeGrupo;

            caixaInicial.appendChild(imagem);
            organizacaoCaixasIniciais.appendChild(caixaInicial);

            caixaInicial.addEventListener('click', function () {
                imgDoGrupoNaSobreposicao.src = evento.imgSobreposicao;
                nomeDoGrupo.textContent = evento.nomeGrupo;
                descricaoDoGrupo.textContent = evento.descricaoEvento;

                contarTempoRestante(evento.dataEvento);

                eventoSobreposicao.classList.add('overlay-visible');
            });
        });
    }

    puxarDados();

    btnFecharSobreposicao.addEventListener('click', function () {
        eventoSobreposicao.classList.remove('overlay-visible');
        if (intervaloContador) {
            clearInterval(intervaloContador); // Usamos clearInterval diretamente
        }
    });

    window.addEventListener('click', function (event) {
        if (event.target === eventoSobreposicao) {
            eventoSobreposicao.classList.remove('overlay-visible');
            if (intervaloContador) {
                clearInterval(intervaloContador); // Usamos clearInterval diretamente
            }
        }
    });
});