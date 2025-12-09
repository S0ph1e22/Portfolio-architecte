const gallery = document.querySelector(".gallery");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("errorMessage");
const modalWrapper = document.querySelector(".modal-wrapper");
const valideProjectBtn = document.getElementById("btn-valide-project");
const galleryText = document.querySelector(".modal-wrapper > p");
const form = document.getElementById("addNewProject");
const backButton = document.getElementById("back");
const addProjectBtn = document.getElementById("addProject");
const categorySelect = document.querySelector('#categoryUpload');
const titleUpload = document.getElementById("titleUpload");
const imagePreview = document.getElementById("imagePreview");
const imageUpload = document.getElementById("imageUpload");
const fileError = document.getElementById("fileError");

const API_URL = "http://localhost:5678/api";

// Récupérer les projets

async function fetchProjects() {
    try {
        const response = await fetch(`${API_URL}/works`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const projects = await response.json();
        gallery.innerHTML = "";

        projects.forEach(project => {
            const projectElement = document.createElement("figure");
            projectElement.innerHTML = `
                <img id="${project.id}" src="${project.imageUrl}" alt="${project.title}">
                <figcaption>${project.title}</figcaption>
            `;
            gallery.appendChild(projectElement);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des projets :", error);
        gallery.innerHTML = "<p>Impossible de charger les projets.</p>";
    }
}

// Récupérer les catégories

async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const categories = await response.json();
        categorySelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.textContent = '';
        categorySelect.appendChild(defaultOption);

        let html = '<button class="btn-tous" name="Tous">Tous</button>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);

            html += `<button class="btn-category" name="${cat.id}">${cat.name}</button>`;
        });

        document.querySelector('.categories').innerHTML = html;
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
    }
}

// Filtrer par catégorie

document.querySelector(".categories").addEventListener("click", function(event) {
    if (event.target.tagName === "BUTTON") {
        const categoryID = parseInt(event.target.name); // converti en nombre

        if (!isNaN(categoryID)) {
            fetchProjectsByCategory(categoryID); // filtre les projets
        } else {
            fetchProjectsByCategory(null); // affiche tous les projets si "Tous"
        }
    }
});

async function fetchProjectsByCategory(categoryId) {
    try {
        const response = await fetch(`${API_URL}/works`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const projects = await response.json();

        let filteredProjects;
        if (categoryId === null) {
            filteredProjects = projects; // afficher tous
        } else {
            filteredProjects = projects.filter(p => p.categoryId === categoryId);
        }

        gallery.innerHTML = "";

        if (filteredProjects.length === 0) {
            gallery.innerHTML = "<p>Aucun projet trouvé pour cette catégorie.</p>";
            return;
        }

        filteredProjects.forEach(project => {
            const projectElement = document.createElement("figure");
            projectElement.innerHTML = `
                <img src="${project.imageUrl}" alt="${project.title}">
                <figcaption>${project.title}</figcaption>
            `;
            gallery.appendChild(projectElement);
        });
    } catch (error) {
        console.error("Erreur lors du filtrage des projets :", error);
    }
}

function loadLoginForm() {
    // Utiliser fetch pour charger le contenu du fichier login.html
    fetch('login.html')     //va chercher le fichier login.html
        .then(response => response.text())  // transforme les réponses que tu recois en texte
        .then(html => {
            mainContent.innerHTML = html;
            loginBtn.style.fontWeight = "bold";  //mettre btn login en gras qd on est dessus
        })
        .catch(error => {
            console.error('Erreur lors du chargement du fichier login.html:', error);
        });
}


// Login / Logout local

function login(){

    //recup email, mdp et où afficher les erreurs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById ('errorMessage');

    //cacher message d'erreur qd login
    if (errorMessage){
        errorMessage.style.display = 'none';
    }
    
    //envoie des données a l'api
    fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(response => {   //si identifiant et mdp différent de ceux qui sont stocké dans l'api, erreur
                if (!response.ok){
                    throw new Error('Erreur dans l’identifiant ou le mot de passe');
                }
                return response.json();  //si correct, on convertit la rep en json
            })
            .then(response => {
                if (response['token'] && response['userId']) { //si api renvoie un token et un user id :
        
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

//deconnexion
function logout(){

    localStorage.removeItem('token');  //supp token
    localStorage.removeItem('userId');  //supp userid
    if (loginBtn){
        loginBtn.innerText = "Login"; //changement du logout en login
        loginBtn.removeEventListener('click', logout);  
        loginBtn.addEventListener('click', loadLoginForm);  //ap la déco, on réaffiche le formulaire de connexion
        window.location.href = "index.html";
    }
   
}

//tranforme login en logout et charge le formulaire de connexion dans la page actuelle
function changeLoginBtn(token){
    if (errorMessage) {   //si errormessage existe dans le dom
        errorMessage.style.display = "none";} // cache le pour pas que le msg reste affiché après la connexion

    if (token) {                                    //si connexion
        loginBtn.innerText = "Logout";   //change login en logout
        loginBtn.removeEventListener('click', loadLoginForm); //supp le formulaire de connexion
        loginBtn.addEventListener('click', logout);        //ajoute action de déco
    }else{
        loginBtn.addEventListener('click', loadLoginForm); //si pas connecté, affiche le formulaire
    }
}


//PAGE AVEC LA MODAL

//mode édition
function editMode(){
    let token = localStorage.getItem("token"); //recup token dans le localstorage

    if (token) {
        
        //crée div avec mode edtion (barre noire)
        let nouvelleDiv = document.createElement("div");
        nouvelleDiv.classList.add("modeEdition");

        //crée une i pour une icone
        let nouvelIcone = document.createElement("i");
        nouvelIcone.classList.add("fa-regular", "fa-pen-to-square");

        //cree un <p> qui va afficher le txt  'mode edition'
        let nouveauParagraphe = document.createElement("p");
        nouveauParagraphe.textContent = "Mode édition";

        // Ajout des icone et texte à la div
        nouvelleDiv.appendChild(nouvelIcone);
        nouvelleDiv.appendChild(nouveauParagraphe);

        // selectionne header pour ajouter la barre mode edition
        let header = document.querySelector("header");
        header.appendChild(nouvelleDiv);

        //cache les btn filtre
        let categoriesDiv = document.querySelector('.categories');
        if (categoriesDiv) {
            categoriesDiv.style.visibility= "hidden";
            categoriesDiv.style.marginTop = "5px";   //pour diminuer l'espace entre la photo et la gallery
            categoriesDiv.style.marginBottom = "5px";
        }
    }
}

//fonction pour ajouter le btn modifier
function addBtnModifier(token){
    //ajout btn modifier
        if (token){
            let portfolioSection = document.querySelector("#portfolio"); //section où ajouter le btn 
             if (portfolioSection) {
                let modifierProjetDiv = document.querySelector(".modifierProjet");
    
                if (!modifierProjetDiv) {
                    modifierProjetDiv = document.createElement("div"); //créer div pour icone + txt
                    modifierProjetDiv.classList.add("modifierProjet");
    
                    let nouvelIcone = document.createElement('i'); //créer i pour l'icone
                    nouvelIcone.classList.add("fa-regular", "fa-pen-to-square");
     
                    let nouveauLien = document.createElement("a"); //créer lien a pour le btn modifier
                    nouveauLien.textContent = "modifier";
                    nouveauLien.href = "#modifier"; 
                    nouveauLien.classList.add("js-modal");
                  
                    modifierProjetDiv.appendChild(nouvelIcone);
                    modifierProjetDiv.appendChild(nouveauLien);
    
                    //insère div apres h2
                    let h2 = portfolioSection.querySelector("h2");
                        h2.insertAdjacentElement("afterend", modifierProjetDiv);
                }
            }
            
            document.querySelectorAll('.js-modal').forEach(a => {
                a.addEventListener('click', openModal);  //click pour appeler openModal
            });
        }
    }

//ouvrir la modal avec btn modifier
let modal = null
const focusableSelector = "button, a, input, textarea, select"
let focusables = []

const openModal = function(e){
    e.preventDefault();  //empeche le comportement par défaut : evite la navigation vers #modifier
    resetModal(); 
    modal = document.querySelector (e.target.getAttribute ('href')); //recup la modal #modifier
    modal.style.display = null;  //affiche la modal
    modal.removeAttribute ('aria-hidden'); //la modal devient accessible aux lecteurs d'écran
    modal.setAttribute ('aria-modal', 'true'); //c'est une modal active, intéragir avec elle avant de retourner sur la page
    
    //changer la couleur du background
    document.querySelector(".modal-overlay").style.display = "block";

    //fermer qd on clique a l'xt
    modal.addEventListener ('click', closeModal);

    //fermer qd clique sur la croix + empecher click a l'intérieur
    modal.querySelector('.js-modal-close').addEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop') .addEventListener('click', stopPropagation);

    //avoir la mini gallery
    fetchProjects().then(() => { //charge les projets et clone la grd gallery
        if (gallery && modalWrapper) {
                const existingClone = modalWrapper.querySelector(".gallery-modal"); 
                if (!existingClone) { 
                    const galleryClone = gallery.cloneNode(true);
                    galleryClone.classList.add("gallery-modal");
                    galleryClone.classList.remove("gallery");
                    modalWrapper.appendChild(galleryClone);
                    //ajout bouton supprimer
                    addDeleteButton();
                }
        }
    });
};

//fermer la modal
const closeModal = function (){
    const galleryClone = modal.querySelector (".gallery-modal"); //récup la gallery du modal
    if (modal === null) return;
    if(valideProjectBtn){
        valideProjectBtn.removeEventListener("click", sendForm); //si btn existe, on supp l'écouteur d'évènement pour envoyer le formulaire
        valideProjectBtn.id = "btn-valide-project"; //réinitialide id du btn en btn valide project
    }
    modal.style.display = "none";  //cache la modal
    modal.setAttribute ('aria-hidden', "true");
    modal.removeAttribute ('aria-modal');

    //remettre background en blanc
    document.querySelector(".modal-overlay").style.display = "none";
    form.style.display = "none";

    //supp les ecouteur d'evenmt lié a la fermeture de la modal
    modal.removeEventListener ('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop') .removeEventListener('click', stopPropagation);
    
    if (galleryClone){
        galleryClone.remove(); //supp la gallery clonée
    }
    modal = null; //reinitialise la modal
};

//empeche que qd on clique a l'intérieur le modal se ferme 
const stopPropagation = function (e){
    e.stopPropagation();
};

//btn retour
document.getElementById("back").addEventListener("click", function(){
    resetModal();
 });

 //affiche le formulaire pour ajouter un projet
 document.getElementById("addProject").addEventListener("click", function(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Vous devez être connecté pour pouvoir ajouter un projet");
        return;
    }
    
    //selectionner gallery et form
   const gallery = document.querySelector(".gallery-modal");
 
    if (gallery) gallery.style.display = "none"; //masquer gallery
    if (form)form.style.display = "block"; //afficher form
    if (galleryText) galleryText.textContent = "Ajout photo"; //changer le titre
    if (modalWrapper) modalWrapper.querySelectorAll('.delete-project').forEach(btn => btn.remove()); //supp les btn avec la classe delete-project (icone poubelle)
    addProjectBtn.style.display="none"; //cache le btn pour ajouter une photo

    document.getElementById("back").style.display = "block";
});

// Fonction pour supprimer un projet
async function deleteProject(projectId, imgElement) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Vous devez être connecté pour pouvoir supprimé le projet");
            return;
        }

        const response = await fetch(`${API_URL}/works/${projectId}`, { //envoi requete delete a l'api pour supp le projet en utilisant son id
            method: 'DELETE',
            headers: {
                'Accept' : '*/*',
                'Authorization': `Bearer ${token}`,
            }
        });

        const responseText = await response.text(); //recup la réponse du serveur
        if (!response.ok) {
            throw new Error(`Erreur lors de la suppression du projet: ${response.status}`);           
        }

        // Supprimer l'image du modal
        imgElement.parentElement.remove(); //supp img + icone
     } catch (error) {
        console.error("Erreur lors de la suppression du projet :", error);
    }

    //supp l'image de la gallery sans recharger la page
    const projectInGallery = document.querySelector(`.gallery img[id='${projectId}']`);
        if (projectInGallery) {
            const figureToRemove = projectInGallery.closest('figure'); //trouve l'élément parent
            figureToRemove.remove();
        }
}

//afficher preview image
imageUpload.addEventListener("change", (event) => { //evenement 'change' déclancher qd un fichier est selectionné
    const file = event.target.files[0];
    
    if (file) {
    const reader = new FileReader(); //permet de lire les fichiers et donc d'afficher l'img
        reader.onload = function(e) { //déclancher qd fichier lu par filereader
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block"; // afficher aperçu de l'image
            document.querySelector("label[for='imageUpload']").style.display = "none"; //cacher btn pour ajouter une image
            document.querySelector(".btn-image").style.display = "none"; // cacher icone image
            document.getElementById("formatImage").style.display = "none"; //cacher txt format image
            if (modalWrapper) {
                const deleteBtns = modalWrapper.querySelectorAll('.delete-project');
                deleteBtns.forEach(btn => {
                    btn.style.display = "none"; //cache icone poubelle pour éviter que la personne supp le projet pdt qu'il en ajoute un
                });
            }
        };

        reader.readAsDataURL(file); //lis le contenu du fichier
    }
});

//fonction form data pour envoyer le formulaire
function sendForm(){
    const file = imageUpload.files[0]; // Vérifie si un fichier a été sélectionné

    if (!file) {
        alert("Veuillez choisir un fichier à ajouter");
        return; 
    }

    // Vérif taille du fichier 
    if (file.size > 4 * 1024 * 1024) { 
        alert("La taille de l'image ne doit pas dépasser 4mo");
        return;
    }
    
    //créer objet formdata à partir du formulaire, permet de collecter toute les données du formulaire
    const saveProject = new FormData(form);  
    try{
        const token = localStorage.getItem('token'); //recup le token

        if (!token){
            alert("Erreur, vous devez être connecté pour ajouter un projet.");
            return
        }

        //appel la fonction pour envoyer le projet
        if(pushForm(saveProject, token)){
            // si le push reussi; on ferme la modal
            closeModal();
        };
    
    } catch (error) {
        console.error("Erreur lors de l'envoi des données :", error);
    }
}

//mettre btn valider en vert si tout les champ sont remplis
document.getElementById("imageUpload").addEventListener("change", updateBtn);
document.getElementById("titleUpload").addEventListener("input", updateBtn);
document.getElementById("categoryUpload").addEventListener("change", updateBtn);

function updateBtn() {
    const file = document.getElementById("imageUpload").files[0]; //détecte si img sélectionner
    const titleUpload = document.getElementById("titleUpload").value.trim(); //detecte si titre rempli
    const categoryUpload = document.getElementById("categoryUpload").value; //détecte si cat chooisie
    //si tout les champs sont rempli, mettre btn en vert
    if (file && titleUpload && categoryUpload) {
        valideProjectBtn.style.backgroundColor = "rgba(29, 97, 84, 1)"; //mettre background en vert
        valideProjectBtn.disabled = false; //rend le btn actif pour pouvoir ajouter le nouveau projet
    }
}

//remettre la modal a 0 après ajout projet
function resetModal(){
    titleUpload.value = ""; //vide champ du titre
    categoryUpload.selectedIndex = 0; //reinitialise champ categorie
    imageUpload.value= ""; //vide champ selection image

    let gallery = document.querySelector(".gallery-modal");
    addProjectBtn.style.display = ''; //remet le btn pour ajouter une photo

    if (gallery) gallery.style.display = "grid";
    if (imageUpload) imageUpload.style.display = "block"
    if (backButton) backButton.style.display = "none"; //cache le btn retour
    if (form) form.style.display = "none"; // Cacher le formulaire
    if (galleryText) galleryText.textContent = "Galerie photo"; //remettre txt galerie photo
    document.querySelector("label[for='imageUpload']").style.display = "block"; //remettre btn pour ajouter photo   

    //reinitialise preview img
    if (imagePreview) {
        imagePreview.style.display = "none"; //cache la preview
        imagePreview.src = "";
        document.querySelector(".btn-image").style.display = "block"; //affiche le btn pour ajouter une img
        document.getElementById("formatImage").style.display = "block"; //affiche le txt avec le format autorisé
        const imageUpload = document.getElementById("imageUpload");
        if (imageUpload) imageUpload.style.display = "block";   //met le champ upload visible
    }

    document.querySelectorAll(".gallery-modal .delete-project").forEach((btn) => { //reaffiche les icones poubelles dans la gallerie du modal
        btn.style.display = "block";
    });

    valideProjectBtn.style.backgroundColor = ""; //reinitialise couleur du bouton pour valider le projet
    fileError.style.display = "none"; //cache le message d'erreur des img

    addDeleteButton(); //ajoute btn de suppression
    errorAddPicture(); //ajoute message d'erreur
}

//recup btn delete car créer avec le dom donc pas dispo
function addDeleteButton(){
    const imagesInModal = document.querySelectorAll('.gallery-modal img'); // sélectionne images du modal
    imagesInModal.forEach(img => {
        const deleteBtn = document.createElement('button'); //cree un button
        deleteBtn.classList.add('delete-project'); //ajoute lui la classe delete project
        deleteBtn.innerHTML = `<i class="btn-delete fa-regular fa-trash-can fa-xs" aria-hidden="true"></i>`; //ajoute lui une icone

        img.parentElement.style.position = "relative"; //position du btn de supp a l'intérieur de l'img
        img.parentElement.appendChild(deleteBtn); //ajoute le btn dans le mm conteneur que l'img pour l'afficher au dessus de l'img

        //ajout evenement click pour supp
        deleteBtn.addEventListener('click', function () {
            let projectId = img.id;  //recup id du projet depuis l'attribut id de l'img

            if(!projectId){
                projectId = img.dataset.id; //si pas trouvé, essaie de recup depuis un attribut de données
            }

            if (projectId) {
                deleteProject(projectId, img);  // Appel de deleteProject avec ID du projet
            } else {
                console.error("ID du projet non trouvé.");
            }
        });
        
    });
}

//message d'erreur ajout fichier
function errorAddPicture() {
    // Cacher l'erreur dès qu'une image est sélectionnée
    imageUpload.addEventListener("change", function() {
        if (imageUpload.files.length > 0) {
            fileError.style.display = "none"; 
        }
    });

    // Vérifier si une image est sélectionnée avant validation
    valideProjectBtn.addEventListener("click", function(event) {
        if (!imageUpload.files.length) {
            event.preventDefault(); 
            fileError.style.display = "block"; // Afficher le message d'erreur
        } else {
            fileError.style.display = "none"; // Cacher l'erreur si img
        }
    });
}
errorAddPicture();

//envoie nouvel image
async function pushForm(saveProject, token){
    
    const response = await fetch(`${API_URL}/works`, { //envoie requete post a l'api
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

    let result = await response.json(); //converti la reponse en objet js

    if (result && result.imageUrl) {
       
        //ajout image gallery
        const newImage = document.createElement('img');
        newImage.src = result.imageUrl; 
        newImage.alt = result.title; 
        newImage.dataset.id = result.id; //ajout id a image
   
        //création balise figcaption
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = result.title;
        
        //creation balise figure 
        const figure = document.createElement('figure');
        figure.appendChild(newImage);
        figure.appendChild(figcaption);

        //ajout figure dans gallery
        gallery.appendChild(figure); 
       
        //ajout image modal
        const modalGallery = document.querySelector('.gallery-modal');
        if (modalGallery) {
            const modalFigure = figure.cloneNode(true); //dupplique elm figure pour qu'il soit visible dans la modal
            modalGallery.appendChild(modalFigure); //ajout img duppliquer a la modal
        }
        return true;
    } 
   
}

//une fois le DOM pret
document.addEventListener("DOMContentLoaded", function(){

    let token = localStorage.getItem('token'); //recup le token

    fetchCategories(); //recup et affiche les cat
    fetchProjects(); //recup et affiche les projets
    editMode(); //active le mode edition si l'utilisateur est connecté
    changeLoginBtn(token); //change le btn login en logout si token
    addBtnModifier(token); //ajoute le btn modifier
    
    //cree overlay pour la modal
    const modalOverlay = document.createElement("div"); //cree div pour modal overlay
    modalOverlay.classList.add("modal-overlay");
    document.body.appendChild(modalOverlay); //ajoute l'overlay au body

    // Fermer la modal en cliquant sur l'overlay
    modalOverlay.addEventListener("click", function () {
        closeModal(new Event("click"));
    });

    /* ici on gere le formulaire d'ajout d'un projet
    On verifie la validite du formulaire puis on le soumet avec sendForm
    */
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Empêche la soumission par défaut

        if (!form.checkValidity()) {
            form.reportValidity(); // Affiche les messages HTML si invalide
            return; // Stoppe l'exécution ici si le formulaire est invalide
        }
        sendForm(); 
    });

});