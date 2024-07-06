    // Récupére les résultats API dans le local storage
    function getLocalStorage () {
        const works = JSON.parse(localStorage.getItem('works'));
        const categories = JSON.parse(localStorage.getItem('categories'));
        if (works && categories) {
            createGalleryModal(works);
            createCategoriesElements(categories);
        }
    }

    // Faire apparaître la modale sur le click
    function openModal() {
        const openModalLink = document.getElementById('openModalLink');
        openModalLink.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.querySelector('.modal');
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
        });
    }

    // Faire disparaitre la modale sur le click des éléments 'modal-close'
    function closeModal() {
        const closeModalButtons = document.querySelectorAll('.modal-close');
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = document.querySelector('.modal');
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');

                // Revenir sur le premier wrapper après avoir fermé la modale
                const modalWrapper = document.querySelector('.modal-wrapper');
                const modalWrapperPhoto = document.querySelector('.modal-wrapper-photo');
                modalWrapper.style.display = 'flex';
                modalWrapperPhoto.style.display = 'none';
            });
        });
    }

    // Créer les éléments à partir des données WORKS
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

    // Créer les éléments de la gallerie/ et des boutons pour supprimer un élément
    function createGalleryModal(works) {
        const gallery = document.querySelector('.modal-gallery');
        gallery.innerHTML = '';

        for ( let i =0; i < works.length; i++) {
            const work = works[i]
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            const deleteButton = document.createElement('button');

            figure.style.position = 'relative';

            deleteButton.classList.add('delete-button');
            deleteButton.type = 'button';
            deleteButton.innerHTML = '<i class="fa-solid fa-trash-can fa-xs"></i>';
            deleteButton.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                removeWork(work.id);
            });

            img.src = work.imageUrl;
            img.style.zIndex = '10';
            figure.id = "work" + work.id 

            figure.appendChild(img);
            figure.appendChild(deleteButton);
            gallery.appendChild(figure);
        };
    }

    // Création des options du menu déroulant avec les catégories
    function createCategoriesElements(categories) {
        const dropdownCategories = document.querySelector('#category');
        dropdownCategories.innerHTML = ''; // Reset pour éviter les duplicata
        const choisirUneCategorie = document.createElement('option');

        choisirUneCategorie.textContent = 'Choisir une catégorie';
        choisirUneCategorie.value = '';
        choisirUneCategorie.disabled = true;
        choisirUneCategorie.selected = true;
        dropdownCategories.appendChild(choisirUneCategorie);

        // Filtrer les catégories pour exclure "Tous"
        const filteredCategories = categories.filter(category => category.name !== 'Tous');

        for (let i = 0; i < filteredCategories.length; i++) {
            let category = filteredCategories[i];
            const categoriesOptions = document.createElement('option');
            categoriesOptions.value = category.id;
            categoriesOptions.textContent = category.name;
            dropdownCategories.appendChild(categoriesOptions);
        }
    }

    // Permet de passer d'un wrapper à l'autre
    function switchWrapper() {
        const addPhotoButton = document.querySelector('.add-photo-button');
        const modalWrapper = document.querySelector('.modal-wrapper');
        const modalWrapperPhoto = document.querySelector('.modal-wrapper-photo');
        const backToGallery = document.querySelector('.back-wrapper-gallery');

        addPhotoButton.addEventListener('click', () => {
            modalWrapper.style.display = 'none';
            modalWrapperPhoto.style.display = 'flex';
        });

        backToGallery.addEventListener('click', () => {
            modalWrapper.style.display = 'flex';
            modalWrapperPhoto.style.display = 'none';
        });
    }

  // Ajouter un nouveau projet à la database via un formulaire (api POST)
    function submitWork() {
        const form = document.querySelector('#add-photo-form');
        if (form) {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                showErroMsg()
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const formData = new FormData(form);

                try {
                    const response = await fetch('http://localhost:5678/api/works', {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Échec de l\'envoi des données');
                    }

                    const data = await response.json();
                    const works = addWorkToLocalStorage(data);
                    form.reset(); // Réinitialiser les champs du formulaire
                    resetPhotoInput()

                    createGalleryModal(works)
                    createGalleryElements(works)

                    const modalWrapper = document.querySelector('.modal-wrapper');
                    const modalWrapperPhoto = document.querySelector('.modal-wrapper-photo');
                    modalWrapper.style.display = 'flex';
                    modalWrapperPhoto.style.display = 'none';
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        }
    }


    // Ajoute le nouveau projet au local storage
    function addWorkToLocalStorage (newWork) {
        // Récupérer les travaux depuis le local storage 
        let works = JSON.parse(localStorage.getItem('works'));

        // Ajouter le nouveau projet à la liste
        works.push(newWork);

        // Mettre à jour le local storage avec le nouvelle liste
        localStorage.setItem('works', JSON.stringify(works))
        return works
    }

    // Nettoyer le formulaire après qu'un travail ait été posté
    function resetPhotoInput () {
        // Réinitialiser le conteneur d'image et les éléments affichés
        const imageContainer = document.querySelector('.add-photo-container');
                    imageContainer.innerHTML = ''; // Supprimer l'image affichée
                    const icon = document.createElement('i');
                    icon.classList.add('fa-regular', 'fa-image');
                    icon.style.color = '#b9c5cc';
                    const label = document.createElement('label');
                    label.setAttribute('for', 'image');
                    label.textContent = '+ Ajouter photo';
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('id', 'image');
                    input.setAttribute('name', 'image');
                    const info = document.createElement('p');
                    info.classList.add('infoPhotoInput');
                    info.textContent = 'jpg.png : 4mo max';
                    
                    imageContainer.appendChild(icon);
                    imageContainer.appendChild(label);
                    imageContainer.appendChild(input);
                    imageContainer.appendChild(info);

                    // Réinitialiser le fichier de l'input
                    const imageInput = document.getElementById('image');
                    imageInput.value = '';

                    // Réattacher l'événement change
                    displayUploadedImage();
    }

    // Vérifier que les formulaires sont bien remplis avant de submit
    function checkInputs() {
        const imageInput = document.getElementById('image');
        const titleInput = document.getElementById('title');
        const categoryInput = document.getElementById('category');
        const submitButton = document.querySelector('#add-photo-form button');
        const errorMsg = document.querySelector('.input-error-msg');

        function updateSubmitButton() {
            const imageValue = imageInput.value;
            const titleValue = titleInput.value;
            const categoryValue = categoryInput.value;

            const isFormValid = imageValue !== "" && titleValue !== "" && categoryValue !== "";

            if (isFormValid) {
                submitButton.removeAttribute('disabled');
                submitButton.style.backgroundColor = '#1D6154';
                errorMsg.style.display = 'none';
            } 
        }

        imageInput.addEventListener('change', updateSubmitButton);
        titleInput.addEventListener('input', updateSubmitButton);
        categoryInput.addEventListener('change', updateSubmitButton);

        updateSubmitButton();
    }

    // Affiche un message d'erreur si on submit alors que les champs ne sont pas remplis
    function showErroMsg() {
        const imageInput = document.getElementById('image');
        const titleInput = document.getElementById('title');
        const categoryInput = document.getElementById('category');
        const submitButton = document.querySelector('#add-photo-form button');
        const errorMsg = document.querySelector('.input-error-msg');

        const imageValue = imageInput.value;
        const titleValue = titleInput.value;
        const categoryValue = categoryInput.value;

        const isFormValid = imageValue !== "" && titleValue !== "" && categoryValue !== "";

        if (isFormValid) {
            submitButton.removeAttribute('disabled');
            submitButton.style.backgroundColor = '#1D6154';
            errorMsg.style.display = 'none';
        } else {
            submitButton.setAttribute('disabled', 'disabled');
            submitButton.style.backgroundColor = 'grey';
            errorMsg.style.display = 'block';
            errorMsg.style.color = 'red';
        }
    }

  // Supprimer un travail existant de la database (api DELETE)
async function removeWork(workId) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('La suppression a échoué');
        }

        const works = removeWorkFromLocalStorage (workId);
            
        createGalleryModal(works)
        const GalleryElement = document.getElementById("work-" + workId)
        GalleryElement.remove()

    } catch (error) {
        console.error('Erreur lors de la suppression', error);
    }
}

    // Supprime le projet supprimé du local storage
    function removeWorkFromLocalStorage (workId) {
        // Récupérer les travaux depuis le local storage 
        let works = JSON.parse(localStorage.getItem('works'));

        // Filtrer la liste des travaux pour supprimer celui correspondant à workId
        works = works.filter(work => work.id !== workId);

        // Mettre à jour le localStorage avec la nouvelle liste de travaux
        localStorage.setItem('works', JSON.stringify(works));
        return works
    }

    // Masque les éléments sur l'input file et affiche l'image qui vient d'être téléchargée
    function displayUploadedImage() {
        const imageInput = document.getElementById('image');

        imageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const imageContainer = document.querySelector('.add-photo-container');
                const uploadedImage = document.createElement('img');

                const icon = imageContainer.querySelector('i');
                const label = imageContainer.querySelector('label');
                const info = imageContainer.querySelector('.infoPhotoInput');
                if (icon) icon.style.display = 'none';
                if (label) label.style.display = 'none';
                if (info) info.style.display = 'none';

                uploadedImage.src = URL.createObjectURL(file);
                uploadedImage.style.maxWidth = "100%";
                uploadedImage.style.height = '170px';
                imageContainer.appendChild(uploadedImage);

            } else {
                console.log('Aucun fichier sélectionné');
            }
        });
    }

    getLocalStorage ();
    submitWork();
    openModal();
    closeModal();
    switchWrapper();
    checkInputs();
    displayUploadedImage();
