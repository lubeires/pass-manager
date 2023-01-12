const mainContainer = document.querySelector("#main-container");

const accessesView = document.querySelector("#accesses-view");
const accessView = document.querySelector("#access-view");
const accessViewTitle = document.querySelector("#access-view-title");

const accessForm = document.querySelector("#access-form");
const formSite = document.querySelector("#form-site");
const formUsername = document.querySelector("#form-username");
const formPassword = document.querySelector("#form-password");
const submitAccessButton = document.querySelector("#submit-access-button");
const generatePasswordButton = document.querySelector(
  "#generate-password-button"
);
const returnButton = document.querySelector("#return-button");

const getAccesses = () => {
  fetch("/home")
    .then((res) => res.json())
    .then((accesses) => {
      if (accesses)
        accesses.forEach((access) => {
          const domain = new URL(access.site).hostname;
          const accessCard = document.createElement("div");
          accessCard.className = "col";
          accessCard.innerHTML = `
          <div class="card px-2 py-4 h-100">
                <a href=${access.site} target="_blank">
                    <div class="d-flex flex-column align-items-center justify-content-center">
                        <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32">
                        <p class="link-info"><em>${domain}</em></p>
                    </div>
                </a>
    
                <div class="card-body pt-0">
                    <small class="text-muted">User</small>
                    <div class="input-group mb-2">
                        <input type="text" class="form-control form-control-sm" value=${access.username} id="username-${access.id}"
                            readonly>
                        <button class="btn btn-outline-info btn-sm" type="button" onclick="copy('${access.username}')">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
    
                    <small class="text-muted">Password</small>
                    <div class="input-group">
                        <input type="password" class="form-control form-control-sm" value="${access.password}" id="password-${access.id}" 
                            readonly>
                        <button class="btn btn-outline-secondary btn-sm" type="button" onclick="hideAndUnhide('password-${access.id}', this)">
                            <i class="fa-regular fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-info btn-sm" type="button" onclick="copy('${access.password}')">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
    
                    <div class="input-group mt-3 justify-content-center">
                        <button class="btn btn-outline-warning btn-sm w-25" type="button" onclick="loadAccessView('Access', 'edit', ${access.id})">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm w-25" type="button" onclick="deleteAccess(${access.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
          accessesView.append(accessCard);
        });
    });
};

const loadAccessesView = () => {
  accessView.style.display = "none";
  accessesView.innerHTML = `
  <div class="col" id="new-access-button" type="button">
        <div class="btn btn-outline-secondary h-100 d-flex flex-column align-items-center justify-content-center"
            style="min-height: 270px;">
            <i class="fa-solid fa-plus fa-2xl m-4"></i>
            <p>ADD NEW PASSWORD</p>
        </div>
    </div>
  `;

  const newAccessButton = document.querySelector("#new-access-button");
  newAccessButton.addEventListener("click", () =>
    loadAccessView("New access", "add")
  );

  getAccesses();
  accessesView.style.display = "flex";
};

loadAccessesView();

const loadAccessView = (title, type, accessId = 0) => {
  accessesView.style.display = "none";
  accessView.style.display = "block";
  accessViewTitle.innerHTML = title;
  submitAccessButton.value = type.toUpperCase();

  generatePasswordButton.addEventListener("click", () => generatePassword());
  returnButton.addEventListener("click", () => loadAccessesView());

  if (type === "add") {
    formSite.value = "";
    formUsername.value = "";
    formPassword.value = "";

    accessForm.onsubmit = () => {
      addAccess();
      return false;
    };
  } else {
    fetch(`/accesses/${accessId}`)
      .then((res) => res.json())
      .then((access) => {
        formSite.value = access.site;
        formUsername.value = access.username;
        formPassword.value = access.password;
      });

    accessForm.onsubmit = () => {
      updateAccess(accessId);
      return false;
    };
  }
};

const addAccess = () => {
  fetch("/accesses", {
    method: "POST",
    body: JSON.stringify({
      site: formSite.value,
      username: formUsername.value,
      password: formPassword.value,
    }),
  })
    .then((res) => res.json())
    .then((message) => showAlert(message.message))
    .then(loadAccessesView);
};

const updateAccess = (accessId) => {
  fetch(`/accesses/${accessId}`, {
    method: "PUT",
    body: JSON.stringify({
      site: formSite.value,
      username: formUsername.value,
      password: formPassword.value,
    }),
  })
    .then((res) => res.json())
    .then((message) => showAlert(message.message))
    .then(loadAccessesView);
};

const deleteAccess = (accessId) => {
  fetch(`/accesses/${accessId}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((message) => showAlert(message.message))
    .then(loadAccessesView);
};

const generatePassword = () => {
  let password = "";

  for (let i = 0; i < 16; i++) {
    let type = i % 4;
    switch (type) {
      case 1:
        password += randomUpper();
        break;
      case 2:
        password += randomNumber();
        break;
      case 3:
        password += randomSpecial();
        break;
      default:
        password += randomLower();
    }
  }

  formPassword.value = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
};

const randomLower = () =>
  String.fromCharCode(Math.floor(Math.random() * 26) + 97);

const randomUpper = () =>
  String.fromCharCode(Math.floor(Math.random() * 26) + 65);

const randomNumber = () =>
  String.fromCharCode(Math.floor(Math.random() * 10) + 48);

const randomSpecial = () => {
  const specialCharacters = "!@#$%^&*(){}[]=<>/";
  return specialCharacters[
    Math.floor(Math.random() * specialCharacters.length)
  ];
};

const copy = (content) => {
  navigator.clipboard.writeText(content);
  showAlert("Copied!");
};

const hideAndUnhide = (passwordFieldId, hideAndUnhideButton) => {
  const passwordField = document.getElementById(passwordFieldId);

  if (passwordField.type === "password") {
    passwordField.type = "text";
    hideAndUnhideButton.firstElementChild.className = "fa-regular fa-eye-slash";
  } else {
    passwordField.type = "password";
    hideAndUnhideButton.firstElementChild.className = "fa-regular fa-eye";
  }
};

const showAlert = (message) => {
  const alert = document.createElement("div");
  alert.className = "alert alert-info alert-dismissible fade show";
  alert.role = "alert";
  alert.innerHTML = `
  ${message}
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  mainContainer.prepend(alert);
};
