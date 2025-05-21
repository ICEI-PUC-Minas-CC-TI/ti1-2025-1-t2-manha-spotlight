fetch('noticias.json')
  .then(response => response.json())
  .then(noticias => {
    let cardsHTML = '';
    noticias.forEach(noticia => {
      cardsHTML += `
        <div class="col-sm-12 col-md-6 col-lg-6 mb-6">
          <div class="card h-100">
            <a href="detalhe.html?id=${noticia.id}" class="d-block">
              <img src="${noticia.imagem}" class="card-img-top" alt="${noticia.titulo}">
            </a>
            <div class="card-body">
              <a href="detalhe.html?id=${noticia.id}" class="text-decoration-none text-reset text-danger-hover">
                <h5 class="card-title">${noticia.titulo}</h5>
              </a>
                <!-- Badges de Local e Data -->
      <div class="d-flex gap-2 mb-3">
        <span class="badge bg-light text-dark border">
          <i class="fas fa-map-marker-alt text-primary me-1"></i>${noticia.local}
        </span>
        <span class="badge bg-light text-dark border">
          <i class="fas fa-calendar-day text-primary me-1"></i>${noticia.data}
        </span>
      </div>
              <p class="card-text">${noticia.texto.substring(0, 300)}...</p>
          
            </div>
          </div>
        </div>
      `;
    });
    document.getElementById('noticias-container').innerHTML = cardsHTML;
  })
  .catch(error => {
    console.error("Error loading news:", error);
  });