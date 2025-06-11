document.addEventListener('DOMContentLoaded', () => {
    const formCadastroEvento = document.getElementById('formCadastroEvento');
    const mensagemStatus = document.getElementById('mensagemStatus');

    if (formCadastroEvento) {
        formCadastroEvento.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nomeGrupo = document.getElementById('nomeGrupo').value;
            const descricaoEvento = document.getElementById('descricaoEvento').value;
            const dataEvento = document.getElementById('dataEvento').value;
            const imgCaixaInicial = document.getElementById('imgCaixaInicial').value;
            const imgSobreposicao = document.getElementById('imgSobreposicao').value;

            const novoEvento = {
                nomeGrupo,
                descricaoEvento,
                dataEvento,
                imgCaixaInicial: imgCaixaInicial || 'sem_imagem.png',
                imgSobreposicao: imgSobreposicao || 'sem_imagem_detalhe.png'
            };

            try {
                const response = await fetch('http://localhost:3000/eventos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(novoEvento)
                });

                if (!response.ok) {
                    throw new Error('Erro ao cadastrar evento.');
                }

                const eventoCadastrado = await response.json();
                console.log('Evento cadastrado:', eventoCadastrado);

                mensagemStatus.textContent = 'Evento cadastrado com sucesso!';
                mensagemStatus.classList.remove('erro');
                mensagemStatus.classList.add('sucesso');

                formCadastroEvento.reset();

            } catch (error) {
                console.error('Erro no cadastro:', error);
                mensagemStatus.textContent = `Erro ao cadastrar evento: ${error.message}`;
                mensagemStatus.classList.remove('sucesso');
                mensagemStatus.classList.add('erro');
            }
        });
    }
});