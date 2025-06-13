// Elementos da página
const searchInput = document.getElementById('campo-busca');
const searchButton = document.getElementById('botao-busca');
const cardsContainer = document.getElementById('Editais-container'); 


// Função onload que carrega todos os editais quando se entra na pagina
function carregarTodosEditais() {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      renderizarCards(data.editais); // Mostra todos os editais
    })
    .catch(error => console.error("Erro ao carregar editais:", error));
}


//funcao da busca que é acionada quando se clica na barra de pesquisa
function filtrarEditais() {
  const termo = searchInput.value.trim().toLowerCase();

  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      const todosEditais = data.editais; //pegamos todos os editais 

      
      const resultados = termo ?
        todosEditais.filter(edital =>             //aplicamos um filtro a todos os editais
          edital.titulo.toLowerCase().includes(termo) ||   //vai buscar pelo titulo ou pela tag
          (edital.tags && edital.tags.some(tag =>
            tag.toLowerCase().includes(termo)
          ))
        ) :
        todosEditais;

      renderizarCards(resultados); //mesma funcao da funcao onload, so que agora executada com os cards filtrados
    });
} //-------------------------ate aqui se vc copiar e criar uma funcao "renderizar cards" fica a mesma coisa da barra de pesquisa-------------

//funcao renderizar cards
function renderizarCards(editais) {
  let cardsHTML = '';

  if (editais.length === 0) {
    cardsContainer.innerHTML = '<p class="no-results">Nenhum resultado encontrado</p>';
    return;
  } else {

    editais.forEach(edital => {
      cardsHTML += `
        <div class="col-sm-12 col-md-6 col-lg-6 mb-6">
          <div class="card h-100">
            <a href="detalhe.html?id=${edital.id}" class="d-block">
              <img src="${edital.imagem}" class="card-img-top" alt="${edital.titulo}">
            </a>
            <div class="card-body">
              <a href="detalhe.html?id=${edital.id}" class="text-decoration-none text-reset text-danger-hover">
                <h5 class="card-title">${edital.titulo}</h5>
              </a>
                <!-- Badges de Local e Data -->
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
      `;
    });
    document.getElementById('Editais-container').innerHTML = cardsHTML;
  }
}


// Eventos
document.addEventListener('DOMContentLoaded', carregarTodosEditais); // Carrega todos ao abrir a página
searchButton.addEventListener('click', filtrarEditais); // Filtra ao clicar no botão