// Récupérer les données + créer les éléments de la galerie + stocker données dans le local storage
async function initializeGallery() {
    const works = await fetchData('works')
    const categories = await fetchData('categories')
    if (works && categories) {
        createGalleryElements(works)
        createCategoriesButtons(categories, works)
        localStorage.setItem('works', JSON.stringify(works))
        localStorage.setItem('categories', JSON.stringify(categories))
    }
}

// Récupérer les données via l'API
async function fetchData(endpoint) {
    const response = await fetch(`http://localhost:5678/api/${endpoint}`);
    if (response.ok) {
        return await response.json();
    } else {
        console.error("Echec lors de la récupération des données de " + endpoint);
    }
}

// Créer les éléments à partir des données du fetchData api/WORKS
function createGalleryElements(works) {

    const gallery = document.querySelector('.gallery'); 
    gallery.innerHTML = '';
    
    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const title = document.createElement('figcaption');
        img.src = work.imageUrl;
        title.textContent = work.title;
        figure.id = "work-" + work.id
        figure.appendChild(img);
        figure.appendChild(title);
        gallery.appendChild(figure);
    };
}

// Créer les boutons avec les catégories de l'API
function createCategoriesButtons(categories, works) { 
    const categoriesButtons = document.querySelector('.categorie-container');
    categoriesButtons.innerHTML = '';
    categories.unshift({'id': 0, 'name': 'Tous'}); // Ajoute 'Tous' aux catégories

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const button = document.createElement('button');
        button.textContent = category.name;
        button.classList.add('categorie-button');
        button.addEventListener('click', () => filterWorksByCategory(category.name, works));
        categoriesButtons.appendChild(button);
    };
}

// Filtrer les éléments par nom de catégorie
function filterWorksByCategory(categoryName = 'Tous', works) {
    const filteredWorks = categoryName === "Tous" ? works : works.filter(work =>
        work.category.name === categoryName );
    createGalleryElements(filteredWorks);
}

initializeGallery()
