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
                <img id="${project.id}" src="${project.imageUrl}" alt="${project.title}">
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
                    //redirection vers index avec mode edition si id ok
                    window.location.href = "index.html";
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

//ajout mode edition
document.addEventListener("DOMContentLoaded", function () {
    let token = localStorage.getItem("token");

    if (token) {
        console.log("affichage en cours");
        
        let nouvelleDiv = document.createElement("div");
        nouvelleDiv.classList.add("modeEdition");

        let nouvelIcone = document.createElement("i");
        nouvelIcone.classList.add("fa-regular", "fa-pen-to-square");

        let nouveauParagraphe = document.createElement("p");
        nouveauParagraphe.textContent = "Mode édition";

        // Ajout des éléments à la div
        nouvelleDiv.appendChild(nouvelIcone);
        nouvelleDiv.appendChild(nouveauParagraphe);

        // Vérifie si <header> existe
        let header = document.querySelector("header");
        header.appendChild(nouvelleDiv);
            console.log("mode édition");
    }
});

//ajout btn modifier ds section portfolio

document.addEventListener("DOMContentLoaded", function(){
    let token = localStorage.getItem('token');

    if (token){
        console.log ("affiche btn modifier");

        let portfolioSection = document.querySelector("#portfolio");

         if (portfolioSection) {
            let modifierProjetDiv = document.querySelector(".modifierProjet");

            if (!modifierProjetDiv) {
               
                modifierProjetDiv = document.createElement("div");
                modifierProjetDiv.classList.add("modifierProjet");

                let nouvelIcone = document.createElement('i');
                nouvelIcone.classList.add("fa-regular", "fa-pen-to-square");

                let nouveauLien = document.createElement("a");
                nouveauLien.textContent = "modifier";
                nouveauLien.href = "#modifier"; 
                nouveauLien.classList.add("js-modal");
              
                modifierProjetDiv.appendChild(nouvelIcone);
                modifierProjetDiv.appendChild(nouveauLien);

                //insère div apres h2
                let h2 = portfolioSection.querySelector("h2");
                    h2.insertAdjacentElement("afterend", modifierProjetDiv);
            }
                console.log("Bouton Modifier ajouté");
            }
            document.querySelectorAll('.js-modal').forEach(a => {
                a.addEventListener('click', openModal);
            });
    }
});

//deconnexion
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
            loginBtn.removeEventListener('click', loadLoginForm); 
            loginBtn.addEventListener('click', logout);        
        }else{
            loginBtn.addEventListener('click', loadLoginForm); 
        }
        
        await fetchCategories();   //att que les cat soit générer
        await fetchProjects();     //att que les projets soit générer
});

//mettre fond gris + clique fond pour fermer la modal
document.addEventListener("DOMContentLoaded", function () {
    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("modal-overlay");
    document.body.appendChild(modalOverlay);

    // Fermer la modal en cliquant sur l'overlay
    modalOverlay.addEventListener("click", function () {
        closeModal(new Event("click"));
    });
});

//ouvrir la modal avec btn modifier
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
    
    //changer la couleur du background
    document.querySelector(".modal-overlay").style.display = "block";

    //fermer qd on clique a l'xt
    modal.addEventListener ('click', closeModal);

    //fermer qd clique sur la croix + empecher click a l'intérieur
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
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
                    galleryClone.classList.remove("gallery");
                    modalWrapper.appendChild(galleryClone);

                    //ajout icone poubelle
                    const imagesInModal = modalWrapper.querySelectorAll('img');
                    imagesInModal.forEach(img => {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.classList.add('delete-project');
                        deleteBtn.innerHTML = `<i class="btn-delete fa-regular fa-trash-can fa-xs" aria-hidden="true"></i>`;

                        img.parentElement.style.position="relative";
                        img.parentElement.appendChild(deleteBtn);

                        //écoute pour supp le projet
                        deleteBtn.addEventListener('click', function () {
                            const projectId = img.id;  
                            deleteProject(projectId, img);
                        });
    
                        img.parentElement.appendChild(deleteBtn);
                    });
                }
        }
    });
};

//fermer la modal
const closeModal = function (e){
    if (modal === null) return;

    e.preventDefault();
    modal.style.display = "none";
    modal.setAttribute ('aria-hidden', "true");
    modal.removeAttribute ('aria-modal');

    //remettre background en blanc
    document.querySelector(".modal-overlay").style.display = "none";

    
    modal.removeEventListener ('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop') .removeEventListener('click', stopPropagation);
    
    const galleryClone = modal.querySelector (".gallery-modal");
    if (galleryClone){
        galleryClone.remove();
    }
    modal = null;

};

//empeche que qd on clique a l'intérieur le modal se ferme
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


// Fonction pour supprimer un projet
async function deleteProject(projectId, imgElement) {
    try {
        const token = localStorage.getItem('token');
        console.log(token);
        if (!token) {
            console.log("Token non trouvé. Vous devez être connecté.");
            return;
        }

        const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Accept' : '*/*',
                'Authorization': `Bearer ${token}`,
            }
        });

        console.log(response);

        const responseText = await response.text();
        console.log("Statut HTTP :", response.status);

        if (!response.ok) {
            throw new Error(`Erreur lors de la suppression du projet: ${response.status}`);
        }

        // Supprimer l'image du modal
        imgElement.parentElement.remove(); //supp img + icone
        console.log(`Le projet ${projectId} a bien été supprimé`);
     } catch (error) {
        console.error("Erreur lors de la suppression du projet :", error);
    }

    //supp l'image de la gallery sans recharger la page
    const projectInGallery = document.querySelector(`.gallery img[id='${projectId}']`);
        if (projectInGallery) {
            const figureToRemove = projectInGallery.closest('figure'); //trouve l'élément parent
            figureToRemove.remove();
            console.log(` Le projet ${projectId} a bien été supprimé de la galerie.`);
        }
}

//ajouter un projet

document.addEventListener("DOMContentLoaded", function(event) {
    event.preventDefault();
   
    const galleryText = document.querySelector(".modal-wrapper > p");
    const gallery = document.querySelector(".gallery-modal");
    const form = document.getElementById("addNewProject");
    const backButton = document.getElementById("back");
   

    if (gallery) gallery.style.display = "grid";  // Afficher la galerie 
    if (backButton) backButton.style.display = "none"; //cacher btn retour
    if (form) form.style.display = "none"; // Cacher le formulaire 
    if (galleryText) galleryText.textContent = "Galerie photo"; //affiche txt
});  

//fct click sur le btn ajouter une photo
document.getElementById("addProject").addEventListener("click", function(event){
    event.preventDefault();
    console.log("btn ajout projet cliqué");

     //selectionner gallery et form
    const galleryText = document.querySelector(".modal-wrapper > p");
    const gallery = document.querySelector(".gallery-modal");
    const form = document.getElementById("addNewProject");
    const addProjectBtn = document.getElementById("addProject");

  
  if (gallery) gallery.style.display = "none"; //masquer gallery
  if (form)form.style.display = "block"; //afficher form
  if (galleryText) galleryText.textContent = "Ajout photo"; //changer le titre
  if (addProjectBtn){ 
    addProjectBtn.value = "valider"; //changer txt du btn
    addProjectBtn.classList.add("btn-valider");
    addProjectBtn.style.backgroundColor = "rgba(167, 167, 167, 1)"; //couleur background btn valider
    addProjectBtn.style.border="none";
    }
});


document.getElementById("back").addEventListener("click", function(){
    const galleryText = document.querySelector(".modal-wrapper > p");
    const gallery = document.querySelector(".gallery-modal");
    const form = document.getElementById("addNewProject");
    const addProjectBtn = document.getElementById("addProject");
    const backButton = document.getElementById("back");


    if (gallery) gallery.style.display = "grid"; // Réafficher la galerie
    if (backButton) backButton.style.display = "none";
    if (form) form.style.display = "none"; // Cacher le formulaire
    if (galleryText) galleryText.textContent = "Galerie photo"; //remettre txt galerie photo
    if (addProjectBtn) {
        addProjectBtn.value = "Ajouter une photo"; //remettre btn ajouter photo qd retour
        addProjectBtn.classList.remove("btn-valider");
        addProjectBtn.style.backgroundColor = ""; //remettre couleur background de base
    }

});

document.getElementById("addProject").addEventListener("click", function() {
    document.getElementById("back").style.display = "block";
});  

//ajouter photo en cliquant sur le btn avec input caché
const fileInput = document.getElementById("imageUpload");
const uploadBtn = document.getElementById("customBtn");
const fileNameDisplay = document.getElementById("fileName");

    // qd click, on déclanche l'input caché
    uploadBtn.addEventListener("click", () => {
        fileInput.click();
    });


//fonction form data pour envoyer le formulaire

document.getElementById("addProject").addEventListener("click", async function(e){
    e.preventDefault();

    const fileInput = document.getElementById("imageUpload");
    const file = fileInput.files[0];

    // Vérif type de fichier
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
        alert("Seul les formats jpg ou png sont autorisés");
        return;
    }

    // Vérif taille du fichier 
    if (file.size > 4 * 1024 * 1024) { 
        alert("La taille de l'image ne doit pas dépasser 4mo");
        return;
    }

    const form = document.getElementById('addNewProject');
    const saveProject = new FormData(form);

    for (let [key, value] of saveProject.entries()) {
        console.log(`${key}:`, value);
    }    

    try{
    const token = localStorage.getItem('token');

    if (!token){
        console.log ("Erreur, vous devez être connecté pour ajouter un projet.");
        return
    }

    //envoie nouvel image

        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: saveProject, 
        });
    
        if (!response.ok) {
            throw new Error(`Erreur ${response.status} : ${response.statusText}`);
        }
    
        let result = await response.json();
        console.log(result); 
    
        
        if (result && result.imageUrl) {
           
            //ajout image gallery
            const newImage = document.createElement('img');
            newImage.src = result.imageUrl; 
            newImage.alt = result.title; 
       
            //création balise figcaption
            const figcaption = document.createElement('figcaption');
            figcaption.textContent = result.title;
            
            //creation balise figure pour titre
            const figure = document.createElement('figure');
            figure.appendChild(newImage);
            figure.appendChild(figcaption);

            //ajout figure dans gallery
            const gallery = document.querySelector('.gallery'); 
            gallery.appendChild(figure); 
           
            //ajout image modal
            const modalGallery = document.querySelector('.modal-gallery');
            if (modalGallery) {
                const modalImage = document.createElement('img');
                modalImage.src = result.imageUrl;
                modalImage.alt = result.title;
                modalGallery.appendChild(modalImage);
            }

            // Fermer modal après ajout
            closeModal(e);

        } else {
            console.log("Pas d'url trouvée");
        }
    
    } catch (error) {
        console.log("Erreur lors de l'envoi des données :", error);
    }
});

//rouvrir la modal sans refresh la page
document.getElementById("openModalButton").addEventListener("click", function (e) {
    openModal(e);
    console.log("Modal rouverte");
});