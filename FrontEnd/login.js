// Définir si l'utilisateur à récupéré le token pour se connecter
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userStatut = localStorage.getItem('token') ? true : false

    if (userStatut === true) {
       loginMode(userStatut)
    } else {
        logoutMode(userStatut)
    }
}

// Changer l'affichage de la page, apparition des éléments du mode édition
function loginMode () {
    const loginButton = document.querySelector('.login')
        loginButton.style.display = 'none';

        const editModeBanner = document.querySelector('.edit-mode-container')
        editModeBanner.style.display = 'flex'

        const editButton = document.querySelector('.modal-link-container')
        editButton.style.display = 'flex'

        const galleryFilters = document.querySelector('.categorie-container')
        galleryFilters.style.display = 'none'

        const logoutButton = document.querySelector('.logout')
        logoutButton.style.display = 'block'
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token')
        })
}

// Changer l'affichage de la page, disparition des éléments du mode édition
function logoutMode () {
    const galleryFilters = document.querySelector('.categorie-container')
    const navBar = document.querySelector('.nav-container')

    navBar.style.margin = '40px 0 50px 0';
    if (galleryFilters) {
        galleryFilters.style.display = 'flex'
    }
}

// Envoyer le formulaire de connexion - requête api/login
function loginSubmit () {
    const loginForm = document.querySelector('.login-container')
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const userAuth = {
                email: event.target.querySelector("[name=email]").value,
                password: event.target.querySelector("[name=password]").value
            }

            fetch('http://localhost:5678/api/users/login', {
                method: 'POST', 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(userAuth)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Authentification échouée')
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('token', data.token)
                window.location.href = 'index.html'
            })
            .catch((error) => { 
                console.error('Error:', error)
                const errorMessage = document.querySelector('.errorMessage')
                if (errorMessage) {
                    errorMessage.textContent = 'Identifiants incorrects';
                    errorMessage.style.color = 'red'
                    errorMessage.style.display = 'flex';
                }
            })
        })
    }
}

checkLoginStatus()
loginSubmit ()
