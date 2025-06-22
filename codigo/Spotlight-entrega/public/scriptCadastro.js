document.addEventListener('DOMContentLoaded', () => {
    const formCadastroEvento = document.getElementById('formCadastroEvento');
    const mensagemStatus = document.getElementById('mensagemStatus');
    const userIconLink = document.getElementById('user-icon-link'); // Adicionado para o link do perfil

    const imagensAleatorias = [
        "https://source.unsplash.com/random/300x150?art,music",
        "https://source.unsplash.com/random/300x150?concert,festival",
        "https://source.unsplash.com/random/300x150?exhibition,gallery",
        "https://source.unsplash.com/random/300x150?lecture,workshop",
        "https://source.unsplash.com/random/300x150?theater,performance",
        "https://source.unsplash.com/random/300x150?education,event"
    ];

    if (formCadastroEvento) {
        formCadastroEvento.addEventListener('submit', async (event) => {
            event.preventDefault();

            const titulo = document.getElementById('tituloEvento').value;
            const texto = document.getElementById('descricaoEvento').value;
            const dataInput = document.getElementById('dataEvento').value;
            const autor = document.getElementById('autorEvento').value;
            const local = document.getElementById('localEvento').value;
            const destaque = document.getElementById('destaqueEvento').checked;

            const dataParaSalvar = dataInput;

            const imagemAleatoria = imagensAleatorias[Math.floor(Math.random() * imagensAleatorias.length)];

            const novoEvento = {
                titulo: titulo,
                imagem: imagemAleatoria,
                destaque: destaque,
                autor: autor,
                data: dataParaSalvar,
                local: local,
                texto: texto
            };

            try {
                const response = await fetch('http://localhost:3000/noticias', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(novoEvento)
                });

                if (!response.ok) {
                    throw new Error('Erro ao cadastrar evento/edital. Status: ' + response.status);
                }

                const eventoCadastrado = await response.json();
                console.log('Evento/Edital cadastrado:', eventoCadastrado);

                mensagemStatus.textContent = 'Evento/Edital cadastrado com sucesso!';
                mensagemStatus.classList.remove('erro');
                mensagemStatus.classList.add('sucesso');

                formCadastroEvento.reset();

            } catch (error) {
                console.error('Erro no cadastro:', error);
                mensagemStatus.textContent = `Erro ao cadastrar evento/edital: ${error.message}`;
                mensagemStatus.classList.remove('sucesso');
                mensagemStatus.classList.add('erro');
            }
        });
    }

    // Lógica para redirecionar o ícone do perfil
    if (userIconLink) {
        userIconLink.addEventListener('click', (event) => {
            event.preventDefault(); // Impede o comportamento padrão do link (ir para login.html)
            window.location.href = 'perfil.html'; // Redireciona para a nova página de perfil
        });
    }
});