// Appeler fetch pour works et categorie dynamiquement
// Appeler fonctions pour créer les éléments de la gallerie et les boutons de catégories
async function initializeGallery() {
        const works = await fetchData('works');
        const categories = await fetchData('categories');
        if (works && categories) {
            createGalleryModal(works);
            createCategoriesElements(categories);
        }
    }

    // Appeler fetch dynamiquement avec 'endpoint' en paramètre
    async function fetchData(endpoint) {
        const response = await fetch(`http://localhost:5678/api/${endpoint}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error("Echec lors de la récupération des données de " + endpoint);
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

        for (let i = 0; i < categories.length; i++) {
            let category = categories[i];
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

    // AJouter un nouveau projet à la database via un formulaire (api POST)
    function submitWork() {
        const form = document.querySelector('#add-photo-form');
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                showErroMsg()
                console.log('bouton submit cliqué');
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const formData = new FormData(form);

                for (const [key, value] of formData.entries()) {
                    if (value instanceof File) {
                        console.log(`${key}: ${value.name}, ${value.size} bytes, ${value.type}`);
                    } else {
                        console.log(`${key}: ${value}`);
                    }
                }

                fetch('http://localhost:5678/api/works', {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Échec de l\'envoi des données');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Success:', data);
                    initializeGallery();
                    form.reset(); // Réinitialiser les champs du formulaire
                    resetPhotoInput ()
                    
                    const modalWrapper = document.querySelector('.modal-wrapper');
                    const modalWrapperPhoto = document.querySelector('.modal-wrapper-photo');
                    modalWrapper.style.display = 'flex';
                    modalWrapperPhoto.style.display = 'none';

                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });
        }
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
    function removeWork(workId) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('La suppression a échoué');
            }
            console.log('L\'élément a bien été supprimé');
            initializeGallery();
        })
        .catch(error => {
            console.error('Erreur lors de la suppression', error);
        });
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

                console.log(file);
            } else {
                console.log('Aucun fichier sélectionné');
            }
        });
    }

    initializeGallery();
    submitWork();
    openModal();
    closeModal();
    switchWrapper();
    checkInputs();
    displayUploadedImage();

// // Récupérer les données via l'API
// async function initializeGallery() {
//     const works = await fetchData('works')
//     const categories = await fetchData('categories')
//     if (works && categories) {
//         createGalleryModal(works)
//         createCategoriesElements(categories)
//         console.log(works, categories)
//     }
// }

// async function fetchData(endpoint) {
//     const response = await fetch(`http://localhost:5678/api/${endpoint}`);
//     if (response.ok) {
//         return await response.json();
//     } else {
//         console.error("Echec lors de la récupération des données de " + endpoint);
//     }
// }

// function openModal() {
//     const openModalLink = document.getElementById('openModalLink')
//     openModalLink.addEventListener('click', (e) => {
//         e.preventDefault()
//         const modal = document.querySelector('.modal')
//         console.log(modal)
//         modal.style.display = 'flex'
//         modal.setAttribute('aria-hidden', 'false')
//     })
// }

// function closeModal() {
//     const closeModalButtons = document.querySelectorAll('.modal-close');
//     closeModalButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             const modal = document.querySelector('.modal');
//             console.log(modal);
//             modal.style.display = 'none';
//             modal.setAttribute('aria-hidden', 'true');

//             const modalWrapper = document.querySelector('.modal-wrapper')
//             const modalWrapperPhoto = document.querySelector('.modal-wrapper-photo')
//             modalWrapper.style.display = 'flex'
//             modalWrapperPhoto.style.display = 'none'
//         });
//     });
// }

// function createGalleryModal (works) {
//     const gallery = document.querySelector('.modal-gallery'); 
//     gallery.innerHTML = '';
    
//     for (let i = 0; i < works.length; i++) {
//         const work = works[i];
//         const workId = work.id
//         const figure = document.createElement('figure');
//         const img = document.createElement('img');
//         const deleteButton = document.createElement('button')

//         figure.style.position = 'relative';

//         deleteButton.classList.add('delete-button')
//         deleteButton.type = 'button'
//         deleteButton.innerHTML = '<i class="fa-solid fa-trash-can fa-xs"></i>';
//         deleteButton.addEventListener('click', function (event) {
//             event.preventDefault();
//             event.stopPropagation();
//             removeWork(workId)
//         })
    
//         img.src = work.imageUrl;
//         img.style.zIndex = '10'

//         figure.appendChild(img);
//         figure.appendChild(deleteButton);
//         gallery.appendChild(figure);
//     };
// }

// function createCategoriesElements (categories) {
//     const dropdownCategories = document.querySelector('#category')
//     const choisirUneCategorie = document.createElement('option')
//     choisirUneCategorie.textContent = 'Choisir une catégorie'
//     choisirUneCategorie.value = ''
//     choisirUneCategorie.disabled = true; // Empêche la sélection de cette option
//     choisirUneCategorie.selected = true; // Sélectionne cette option par défaut
//     console.log(dropdownCategories)
//     dropdownCategories.appendChild(choisirUneCategorie)

//     for (let i = 0; i < categories.length; i++) {
//         const category = categories[i];
//         const categoriesOptions = document.createElement('option')
//         categoriesOptions.value = category.id
//         categoriesOptions.textContent = category.name
//         dropdownCategories.appendChild(categoriesOptions)
//         console.log(categoriesOptions)
//     }
// }

// function switchWrapper () {
//     const addPhotoButton = document.querySelector('.add-photo-button')
//     const modalWrapper = document.querySelector('.modal-wrapper')
//     const modalWrapperPhoto = document.querySelector('.modal-wrapper-photo')
//     const backToGallery = document.querySelector('.back-wrapper-gallery')

//     addPhotoButton.addEventListener('click', () => {
//         modalWrapper.style.display = 'none'
//         modalWrapperPhoto.style.display = 'flex'
//     })

//     backToGallery.addEventListener('click', () => {
//         modalWrapper.style.display = 'flex'
//         modalWrapperPhoto.style.display = 'none'
//     } )
// }

// function submitWork() {
//     const form = document.querySelector('#add-photo-form')
//     if (form) {
//         form.addEventListener('submit', (event) => {
//             event.preventDefault()
//             checkInputs()
//             console.log('bouton submit cliqué');

//             const token = localStorage.getItem('token');
//             const formData = new FormData(form);  // Utiliser FormData pour s'occuper du fichier image

//             // Ajouter des logs pour vérifier les étapes
//             for (const [key, value] of formData.entries()) {
//                 if (value instanceof File) {
//                     console.log(`${key}: ${value.name}, ${value.size} bytes, ${value.type}`);
//                 } else {
//                     console.log(`${key}: ${value}`);
//                 }
//             }

//             // Requête fetch pour envoyer les données
//             fetch('http://localhost:5678/api/works', {
//                 method: "POST",
//                 headers: {
//                     // "Content-Type": "application/json", // pas besoin car FormData s'occupe des headers
//                     "Authorization": `Bearer ${token}`
//                 },
//                 body: formData,  // Envoyer formData au lieu de JSON.stringify(workData)
//             })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Échec de l\'envoi des données');
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 console.log('Success:', data);
//             })
//             .catch((error) => {
//                 console.error('Error:', error);
//                 // const errorMessageElement = document.getElementById('errorMessage');
//                 // if (errorMessageElement) {
//                 //     errorMessageElement.textContent = "Erreur lors de l'envoi des données";
//                 //     errorMessageElement.style.display = "block";
//                 // }
//             });
//         });
//     } 
// }

// function checkInputs() {
//     const imageInput = document.getElementById('image');
//     const titleInput = document.getElementById('title');
//     const categoryInput = document.getElementById('category');
//     const submitButton = document.querySelector('#add-photo-form button');
//     const errorMsg = document.querySelector('.input-error-msg');

//     function updateSubmitButton() {
//         const imageValue = imageInput.value;
//         const titleValue = titleInput.value;
//         const categoryValue = categoryInput.value;

//         const isFormValid = imageValue !== "" && titleValue !== "" && categoryValue !== "";

//         if (isFormValid) {
//             submitButton.removeAttribute('disabled');
//             submitButton.style.backgroundColor = '#1D6154';
//             errorMsg.style.display = 'none';
//         } else {
//             submitButton.setAttribute('disabled', 'disabled');
//             submitButton.style.backgroundColor = 'grey';
//             errorMsg.style.display = 'block';
//             errorMsg.style.color = 'red';
//         }
//     }

//     // Ajouter des écouteurs d'événements sur les champs d'entrée pour vérifier leur état
//     imageInput.addEventListener('change', updateSubmitButton);
//     titleInput.addEventListener('input', updateSubmitButton);
//     categoryInput.addEventListener('change', updateSubmitButton);

//     // Vérifier l'état initial des champs
//     updateSubmitButton();
// }

// function removeWork (workId) {

//     const token = localStorage.getItem('token')

//     fetch(`http://localhost:5678/api/works/${workId}`, {
//         method: 'DELETE',
//         headers: {'Authorization': `Bearer ${token}`,
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//         }
//     })
//     .then(response => {
//         if(!response.ok) {
//             throw new Error('La suppression à échoué')
//         }
//         console.log('L\'élement à bien été supprimé')
//         initializeGallery()
//     })
//     .catch(error => {
//         console.error('Erreur lors de la suppression', error)
//     })
// }

// function displayUploadedImage() {
//     const imageInput = document.getElementById('image');

//     imageInput.addEventListener('change', (event) => {
//         const file = event.target.files[0]; // Récupère le premier fichier sélectionné
//         if (file) {
//             const imageContainer = document.querySelector('.add-photo-container');
//             const uploadedImage = document.createElement('img');

//             imageContainer.innerHTML = ""; // Efface tout contenu existant dans le conteneur
//             uploadedImage.src = URL.createObjectURL(file); // Crée une URL temporaire pour l'image
//             uploadedImage.style.maxWidth = "100%"; // Pour s'assurer que l'image ne dépasse pas les limites du conteneur
//             uploadedImage.style.height = '170px'; // Pour maintenir le ratio de l'image
//             imageContainer.appendChild(uploadedImage); // Ajoute l'image au conteneur

//             console.log(file);
//         } else {
//             console.log('Aucun fichier sélectionné');
//         }
//     });
// }

// initializeGallery()
// submitWork ();
// openModal();
// closeModal ();
// switchWrapper();
// displayUploadedImage ()



