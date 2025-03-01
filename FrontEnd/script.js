// Récupérer les projets et les afficher
async function fetchProjects() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const projects = await response.json();
        console.log("Données récupérées :", projects);

        const gallery = document.querySelector(".gallery");
        if (!gallery) {
            console.error("Élément .gallery non trouvé");
            return;
        }

        gallery.innerHTML = ""; 

        projects.forEach(project => {
            const projectElement = document.createElement("figure");
            projectElement.innerHTML = `
                <img src="${project.imageUrl}" alt="${project.title}">
                <figcaption>${project.title}</figcaption>`;
            gallery.appendChild(projectElement);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des projets :", error);
    }
}

// Récupérer les catégories et afficher les boutons
async function fetchCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const categories = await response.json();
        console.log("Catégories récupérées :", categories);

        let html = '<button class="btn-tous" name="Tous">Tous</button>'; 

        categories.forEach(category => {
            html += `<button class="btn-category" name="${category.id}">${category.name}</button>`;
        });

        document.querySelector('.categories').innerHTML = html;

    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
    }
}

//recupere les projets en fonction de l'ID de la category
async function fetchProjectsByCategory(categoryId) {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const projects = await response.json();
        console.log("Données récupérées par categorie :", projects);

        const gallery = document.querySelector(".gallery");
        if (!gallery) {
            console.error("Élément .gallery non trouvé");
            return;
        }

        gallery.innerHTML = ""; //vide la galerie avant d'afficher les nouveaux projets

       
        let filteredProjects;   //vérifie si categorieID existe

        if (categoryId) {
            filteredProjects = projects.filter(project => {     //si catID existe, filtre les projets
                return project.categoryId === categoryId;       //verifie si catID du projet correspond a celui de l'argument
            });
        } else {
            filteredProjects = projects;        //si catID=tous, affiche tous les projets
        }if (filteredProjects.length === 0) {
            gallery.innerHTML = "<p>Aucun projet trouvé pour cette catégorie.</p>";
            return;
        }

        filteredProjects.forEach(project => {           //affiche les projets en fct des cat (comme dans fetchProjects)
            const projectElement = document.createElement("figure");
            projectElement.innerHTML = `
                <img src="${project.imageUrl}" alt="${project.title}">
                <figcaption>${project.title}</figcaption>`;
            gallery.appendChild(projectElement);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des projets :", error);
    }
}


    document.querySelector(".categories").addEventListener("click", function(event) {
        if (event.target.tagName === "BUTTON") {
            const categoryID = event.target.name;
            if (event.target.name !== "Tous"){
                fetchProjectsByCategory(parseInt(categoryID));  //filtre projet avec id de la cat
            }else{
                fetchProjectsByCategory(null);      //affiche tous les projets !!
            }
            
        }
    });


//charger les projets   
function loadLoginForm() {
    // Utiliser fetch pour charger le contenu du fichier login.html
    fetch('login.html')     //va chercher le fichier login.html
        .then(response => response.text())  // transforme les réponses que tu recois en texte
        .then(html => {
            mainContent.innerHTML = html;
        })
        .catch(error => {
            console.error('Erreur lors du chargement du fichier login.html:', error);
        });
}

//login
function login() {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById ('errorMessage');

    //cacher message d'erreur qd login
    if (errorMessage){
        errorMessage.style.display = 'none';
    }
    
    fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(response => {
                if (!response.ok){
                    throw new Error('Erreur dans l’identifiant ou le mot de passe');
                }
                return response.json();
            })
            .then(response => {
                if (response['token'] && response['userId']) {
        
                    // Stocker le token et l'ID utilisateur pour la session
                    localStorage.setItem('token', response['token']);
                    localStorage.setItem('userId', response['userId']);
                    //redirection vers index si id ok
                    window.location.href = "edition.html";   
                }
            }) 
            .catch (error => {
            console.error('Erreur lors de la connexion :', error);    
            if (errorMessage){ 
                errorMessage.textContent = "Erreur dans l’identifiant ou le mot de passe";
                errorMessage.style.display = "block";
            }
        });  
}

function logout(){

    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn){
        loginBtn.innerText = "Login";
        loginBtn.removeEventListener('click', logout);
        loginBtn.addEventListener('click', loadLoginForm);
        window.location.href = "index.html";
    }
   
}

document.addEventListener('DOMContentLoaded', async function() { 
        const errorMessage = document.getElementById('errorMessage');
        const loginBtn = document.getElementById('loginBtn');

        if (errorMessage) {
            errorMessage.style.display = "none";} //fait passer le dom(index.html) avant
        
        const token = localStorage.getItem('token');
        if (token) {                                    //si connexion
            loginBtn.innerText = "Logout";   //change login en logout
            loginBtn.removeEventListener('click', loadLoginForm); // Retirer le gestionnaire "Login"
            loginBtn.addEventListener('click', logout); // Ajouter l'événement de déconnexion          
        }else{
            loginBtn.addEventListener('click', loadLoginForm); // Ajouter le gestionnaire "Login"
        }
        
        await fetchCategories();   //att que les cat soit générer
        await fetchProjects();     //att que les projets soit générer
});

//fenetre ajout

let modal = null
const focusableSelector = "button, a, input, textarea"
let focusables = []

const openModal = function(e){
    e.preventDefault();
    modal = document.querySelector (e.target.getAttribute ('href'));
    focusables = Array.from(modal.querySelectorAll(focusableSelector));
    modal.style.display = null;
    modal.removeAttribute ('aria-hidden');
    modal.setAttribute ('aria-modal', 'true');

    modal.querySelector('.js-modal-close') .addEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop') .addEventListener('click', stopPropagation);

    //avoir la mini gallery
    
    fetchProjects().then(() => {
        const gallery = document.querySelector(".gallery");
        const modalWrapper = modal.querySelector(".modal-wrapper" );
        if (gallery && modalWrapper) {
                const existingClone = modalWrapper.querySelector(".gallery-modal"); 
                if (!existingClone) { 
                    const galleryClone = gallery.cloneNode(true);
                    galleryClone.classList.add("gallery-modal");
                    modalWrapper.appendChild(galleryClone);

                    //ajout icone poubelle
                    const imagesInModal = modalWrapper.querySelectorAll('img');
                    imagesInModal.forEach(img => {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.classList.add('delete-project');
                        deleteBtn.innerHTML = `<i class="btn-delete fa-regular fa-trash-can" aria-hidden="true"></i>`;

                        img.parentElement.style.position="relative";
                        img.parentElement.appendChild(deleteBtn);

                        //écoute pour supp le projet
                        deleteBtn.addEventListener('click', function () {
                            const projectId = img.dataset.id;  
                            deleteProject(projectId, img);
                        });
    
                        img.parentElement.appendChild(deleteBtn);
                    });
                }
        }
    });
};

// Fonction pour supprimer un projet
async function deleteProject(projectId, imgElement) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("Token non trouvé. Vous devez être connecté.");
            return;
        }

        const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la suppression du projet: ${response.status}`);
        }

        // Supprimer l'image du modal
        imgElement.parentElement.remove(); //supp img + icone
        console.log(`Projet ${projectId} supprimé`);
    } catch (error) {
        console.error("Erreur lors de la suppression du projet :", error);
    }
} 

const closeModal = function (e){
    if (modal ===null) return
    e.preventDefault();
    modal.style.display = "none";
    modal.setAttribute ('aria-hidden', "true");
    modal.removeAttribute ('aria-modal');
    modal.removeEventListener ('click', closeModal);
    modal.querySelector('.js-modal-close') .removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop') .removeEventListener('click', stopPropagation);
    
    const galleryClone = modal.querySelector (".gallery-modal");
    if (galleryClone){
        galleryClone.remove();
    }
    modal = null;
};

//empeche que qd on clique a l'intérieur le modal
const stopPropagation = function (e){
    e.stopPropagation();
};

const focusInModal = function (e){
    e.preventDefault();
    let index = focusables.findIndex( f => f === modal.querySelector(':focus'));
    index++;
    if (index >= focusables.length){
        index=0;
    }
    focusables[index].focus();
};

document.querySelectorAll('.js-modal').forEach (a =>{
    a.addEventListener ('click', openModal);
});

window.addEventListener ('keydown', function(e){
    if (e.key === "Escape" || e.key === 'Esc'){
        closeModal(e);
    }
    if (e.key=== 'Tab' && modal !== null){
        focusInModal (e);
    }
});




//delete
