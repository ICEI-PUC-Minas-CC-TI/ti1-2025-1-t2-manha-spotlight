const form = document.getElementById('groupForm');
const imageInput = document.getElementById('groupImage');
const imagePreview = document.getElementById('imagePreview');
const addChannelBtn = document.getElementById('addChannelBtn');
const channelFields = document.getElementById('channelFields');

let canalCount = 0;

imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

addChannelBtn.addEventListener('click', () => {
  canalCount++;

  const fieldWrapper = document.createElement('div');
  fieldWrapper.classList.add('channel-field');

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'canal[]';
  input.value = `Canal ${canalCount}`;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '🗑️';
  removeBtn.classList.add('remove-btn');

  removeBtn.addEventListener('click', () => {
    channelFields.removeChild(fieldWrapper);
  });

  fieldWrapper.appendChild(input);
  fieldWrapper.appendChild(removeBtn);
  channelFields.appendChild(fieldWrapper);
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('groupName').value;
  const description = document.getElementById('groupDescription').value;
  const image = imageInput.files[0];

  const canais = Array.from(document.getElementsByName('canal[]')).map(input => input.value);

  console.log('Grupo Criado:', {
    nome: name,
    descricao: description,
    imagem: image ? image.name : 'Nenhuma imagem selecionada',
    canais: canais
  });

  alert('Grupo criado com sucesso!');

  form.reset();
  imagePreview.src = 'https://via.placeholder.com/100';
  channelFields.innerHTML = '';
  canalCount = 0;
});
