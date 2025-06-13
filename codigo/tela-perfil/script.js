let originalData = {};

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  document.getElementById("editButton").addEventListener("click", enableEdit);
  document.getElementById("saveButton").addEventListener("click", saveChanges);
  document.getElementById("cancelButton").addEventListener("click", cancelEdit);
  document.getElementById("uploadPhoto").addEventListener("change", handlePhotoUpload);
});

function enableEdit() {
  originalData = {
    username: document.getElementById("usernameDisplay").textContent,
    bio: document.getElementById("bioDisplay").textContent,
    image: document.getElementById("profileImage").src,
  };

  document.getElementById("usernameDisplay").classList.add("hidden");
  document.getElementById("bioDisplay").classList.add("hidden");
  document.getElementById("usernameInput").classList.remove("hidden");
  document.getElementById("bioInput").classList.remove("hidden");
  document.getElementById("usernameInput").value = originalData.username;
  document.getElementById("bioInput").value = originalData.bio;
  document.querySelector(".edit-photo-label").classList.remove("hidden");
  document.getElementById("editButton").classList.add("hidden");
  document.getElementById("saveButton").classList.remove("hidden");
  document.getElementById("cancelButton").classList.remove("hidden");
  document.getElementById("addTagContainer").classList.remove("hidden");
}

function saveChanges() {
  const newName = document.getElementById("usernameInput").value;
  const newBio = document.getElementById("bioInput").value;
  const image = document.getElementById("profileImage").src;
  document.getElementById("usernameDisplay").textContent = newName;
  document.getElementById("bioDisplay").textContent = newBio;
  localStorage.setItem("profileData", JSON.stringify({ username: newName, bio: newBio, image }));
  localStorage.setItem("profileTags", JSON.stringify(getCurrentTags()));

  endEditMode();
}

function cancelEdit() {
  document.getElementById("profileImage").src = originalData.image;
  endEditMode();
}

function endEditMode() {
  document.getElementById("usernameDisplay").classList.remove("hidden");
  document.getElementById("bioDisplay").classList.remove("hidden");
  document.getElementById("usernameInput").classList.add("hidden");
  document.getElementById("bioInput").classList.add("hidden");
  document.querySelector(".edit-photo-label").classList.add("hidden");
  document.getElementById("editButton").classList.remove("hidden");
  document.getElementById("saveButton").classList.add("hidden");
  document.getElementById("cancelButton").classList.add("hidden");
  document.getElementById("addTagContainer").classList.add("hidden");
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById("profileImage").src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function createTagElement(tagText) {
  const tag = document.createElement("div");
  tag.className = "tag";
  tag.textContent = tagText;

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-tag";
  removeBtn.textContent = "×";
  removeBtn.title = "Remover tag";
  removeBtn.onclick = () => {
    tag.classList.add("fadeOut");
    setTimeout(() => {
      tag.remove();
    }, 300);
  };

  tag.appendChild(removeBtn);
  return tag;
}

function addTag() {
  const select = document.getElementById("newTagSelect");
  const tagValue = select.value;

  if (!tagValue) return;

  const existingTags = getCurrentTags();
  if (existingTags.includes(tagValue)) {
    alert("Tag já adicionada.");
    return;
  }

  const tagList = document.getElementById("tagList");
  const newTag = createTagElement(tagValue);
  tagList.appendChild(newTag);

  select.value = "";
}

function getCurrentTags() {
  const tags = [];
  document.querySelectorAll("#tagList .tag").forEach(tagEl => {
    tags.push(tagEl.childNodes[0].nodeValue);
  });
  return tags;
}

function loadData() {
  const storedProfile = JSON.parse(localStorage.getItem("profileData"));
  const storedTags = JSON.parse(localStorage.getItem("profileTags"));

  if (storedProfile) {
    document.getElementById("usernameDisplay").textContent = storedProfile.username;
    document.getElementById("bioDisplay").textContent = storedProfile.bio;
    document.getElementById("profileImage").src = storedProfile.image;
  }

  if (storedTags && Array.isArray(storedTags)) {
    const tagList = document.getElementById("tagList");
    tagList.innerHTML = "";
    storedTags.forEach(tag => {
      tagList.appendChild(createTagElement(tag));
    });
  }
}
