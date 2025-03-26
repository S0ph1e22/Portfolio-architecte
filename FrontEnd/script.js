const gallery = document.querySelector(".gallery"); //grd gallery
const loginBtn = document.getElementById("loginBtn"); //btn login
const loginSection = document.getElementById("page-login"); //page login avec formulaire
const errorMessage = document.getElementById('errorMessage'); //message d'erreur si champs du form incorrect
const modalWrapper = document.querySelector(".modal-wrapper" ); //la modal
const imagesInModal = modalWrapper.querySelectorAll('img'); //img du modal
const deleteBtn = document.createElement('button'); //btn supp img modal
const valideProjectBtn = document.getElementById("btn-valide-project"); //btn valider projet
const galleryText = document.querySelector(".modal-wrapper > p"); //remettre le titre de la gallery modal
const form = document.getElementById("addNewProject"); //formulaire pour ajouter projet
const backButton = document.getElementById("back"); //fleche retour
const addProjectBtn = document.getElementById("addProject"); //btn ajouter une photo modal
const categorySelect = document.querySelector('#categoryUpload'); //élément select pour choisir les catégories
const titleUpload = document.getElementById("titleUpload"); //champ pour écrire un titre
const categoryUpload = document.getElementById ("categoryUpload"); //choisir une categorie
const imagePreview = document.getElementById("imagePreview"); //preview de l'img
const imageUpload = document.getElementById("imageUpload"); //btn pour choisir un fichier a ajouter
const fileError = document.getElementById("fileError");


// Récupérer les projets et les afficher
async function fetchProjects() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const projects = await response.json();    
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

//btn filtre
async function fetchProjectsByCategory(categoryId) {
    try {
        const response = await fetch("http://localhost:5678/api/works");      //requete pour récup les projets
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const projects = await response.json();

        if (!gallery) {
            return;
        }

        gallery.innerHTML = ""; //vide la galerie avant d'afficher les nouveaux projets
        let filteredProjects;   //vérifie si categorieID existe

        if (categoryId) {
            filteredProjects = projects.filter(project => {     //si catID existe, filtre les projets pour garder que ceux qui appartienne a la cat choisie
                return project.categoryId === categoryId;       //verifie si catID du projet correspond a celui de l'argument
            });
        } else {
            filteredProjects = projects;        //si catID=tous, affiche tous les projets
        }if (filteredProjects.length === 0) { //si aucun projet ne correspond a la cat séléctionné, afficher msg d'erreur
            gallery.innerHTML = "<p>Aucun projet trouvé pour cette catégorie.</p>";
            return;
        }

        filteredProjects.forEach(project => {           //affiche les projets en fct des cat 
            const projectElement = document.createElement("figure"); //affiche les projets en créer dynamiquement élément figure
            projectElement.innerHTML = `
                <img src="${project.imageUrl}" alt="${project.title}">  
                <figcaption>${project.title}</figcaption>`; //ajouter une image et un titre
            gallery.appendChild(projectElement);  //ajouter chaque projet a la galerie
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des projets :", error);
    }
}

//récup catégories depuis l'api pour les afficher ds un select dans la modal et sous forme de btn pour les filtres
async function fetchCategories() {
    try {
       
        const response = await fetch("http://localhost:5678/api/categories");  //requete pour récup les catégories
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const categories = await response.json();
        
        // vide les select pour pas les afficher plusieurs fois
        categorySelect.innerHTML = '';

        // ajout option vide dans la modal
        const defaultOption = document.createElement('option');
        defaultOption.textContent = '';
        categorySelect.appendChild(defaultOption);

        // creer une option pour chaque cat récup + l'ajouter au select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;  
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    
        //créer btn filtre
        let html = '<button class="btn-tous" name="Tous">Tous</button>'; //pour afficher tous les projets avec le btn tous
        // pour chaque cat, récup l'id et le nom de la catégorie et insère btn créer dans le conteneur .categories
        categories.forEach(category => {
            html += `<button class="btn-category" name="${category.id}">${category.name}</button>`;
        });

        document.querySelector('.categories').innerHTML = html;

    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
    }
}


//filtrer les éléments par catégorie
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

//charger le template de la page de login
function loadLoginForm() {
    // Utiliser fetch pour charger le contenu du fichier login.html
    fetch('login.html')     //va chercher le fichier login.html
        .then(response => response.text())  // transforme les réponses que tu recois en texte
        .then(html => {
            mainContent.innerHTML = html;
            loginBtn.style.fontWeight = "bold";
        })
        .catch(error => {
            console.error('Erreur lors du chargement du fichier login.html:', error);
        });
}


//fonction pour se connecter 
function login(){

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

//deconnexion
function logout(){

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    if (loginBtn){
        loginBtn.innerText = "Login";
        loginBtn.removeEventListener('click', logout);
        loginBtn.addEventListener('click', loadLoginForm);
        window.location.href = "index.html";
    }
   
}

//tranforme login en logout
function changeLoginBtn(token){
    if (errorMessage) {
        errorMessage.style.display = "none";} //fait passer le dom(index.html) avant

    if (token) {                                    //si connexion
        loginBtn.innerText = "Logout";   //change login en logout
        loginBtn.removeEventListener('click', loadLoginForm); 
        loginBtn.addEventListener('click', logout);        
    }else{
        loginBtn.addEventListener('click', loadLoginForm); 
    }
}


//PAGE AVEC LA MODAL

//mode édition
function editMode(){
    let token = localStorage.getItem("token");

    if (token) {
        
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

        //cache les btn filtre
        let categoriesDiv = document.querySelector('.categories');
        if (categoriesDiv) {
            categoriesDiv.style.visibility= "hidden";
            categoriesDiv.style.marginTop = "5px";
            categoriesDiv.style.marginBottom = "5px";
        }
    }
}

//fonction pour ajouter le btn modifier
function addBtnModifier(token){
    //ajout btn modifier
        if (token){
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
            }
            
            document.querySelectorAll('.js-modal').forEach(a => {
                a.addEventListener('click', openModal);
            });
        }
    }

//ouvrir la modal avec btn modifier
let modal = null
const focusableSelector = "button, a, input, textarea, select"
let focusables = []

const openModal = function(e){
    e.preventDefault();
    resetModal();
    modal = document.querySelector (e.target.getAttribute ('href'));
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
    const galleryClone = modal.querySelector (".gallery-modal"); //gallery du modal
    if (modal === null) return;
    if(valideProjectBtn){
        valideProjectBtn.removeEventListener("click", sendForm);
        valideProjectBtn.id = "btn-valide-project";
    }
    modal.style.display = "none";
    modal.setAttribute ('aria-hidden', "true");
    modal.removeAttribute ('aria-modal');

    //remettre background en blanc
    document.querySelector(".modal-overlay").style.display = "none";
    form.style.display = "none";

    modal.removeEventListener ('click', closeModal);
    modal.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modal.querySelector('.js-modal-stop') .removeEventListener('click', stopPropagation);
    
    if (galleryClone){
        galleryClone.remove();
    }
    modal = null;
};

//empeche que qd on clique a l'intérieur le modal se ferme 
const stopPropagation = function (e){
    e.stopPropagation();
};

//btn retour
document.getElementById("back").addEventListener("click", function(){
    resetModal();
 });

 //affiche le formulaire 
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
    if (modalWrapper) modalWrapper.querySelectorAll('.delete-project').forEach(btn => btn.remove());
    addProjectBtn.style.display="none";
    

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

        const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Accept' : '*/*',
                'Authorization': `Bearer ${token}`,
            }
        });

        const responseText = await response.text();
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
imageUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    
    if (file) {
    const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block"; // afficher aperçu de l'image
            document.querySelector("label[for='imageUpload']").style.display = "none"; //cacher btn pour ajouter une image
            document.querySelector(".btn-image").style.display = "none"; // cacher icone image
            document.getElementById("formatImage").style.display = "none"; //cacher txt format image
            if (modalWrapper) {
                const deleteBtns = modalWrapper.querySelectorAll('.delete-project');
                deleteBtns.forEach(btn => {
                    btn.style.display = "none";
                });
            }
        };

        reader.readAsDataURL(file);
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
    
    const saveProject = new FormData(form);  
    try{
        const token = localStorage.getItem('token');

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
        valideProjectBtn.disabled = false;
    }
}

//remettre la modal a 0 après ajout projet
function resetModal(){
    titleUpload.value = "";
    categoryUpload.selectedIndex = 0;
    imageUpload.value= "";

    let gallery = document.querySelector(".gallery-modal");
    addProjectBtn.style.display = '';

    if (gallery) gallery.style.display = "grid";
    if (imageUpload) imageUpload.style.display = "block"
    if (backButton) backButton.style.display = "none"; //remet btn pour ajouter un fichier
    if (form) form.style.display = "none"; // Cacher le formulaire
    if (galleryText) galleryText.textContent = "Galerie photo"; //remettre txt galerie photo
    document.querySelector("label[for='imageUpload']").style.display = "block"; //remettre btn pour ajouter photo

    

    if (imagePreview) {
        imagePreview.style.display = "none";
        imagePreview.src = "";
        document.querySelector(".btn-image").style.display = "block";
        document.getElementById("formatImage").style.display = "block";
        const imageUpload = document.getElementById("imageUpload");
        if (imageUpload) imageUpload.style.display = "block";  
    }

    document.querySelectorAll(".gallery-modal .delete-project").forEach((btn) => {
        btn.style.display = "block";
    });

    valideProjectBtn.style.backgroundColor = "";
    fileError.style.display = "none";

    addDeleteButton();
    errorAddPicture();
}

//recup btn delete car créer avec le dom donc pas dispo
function addDeleteButton(){
    const imagesInModal = document.querySelectorAll('.gallery-modal img'); // sélectionne images du modal
    imagesInModal.forEach(img => {
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-project');
        deleteBtn.innerHTML = `<i class="btn-delete fa-regular fa-trash-can fa-xs" aria-hidden="true"></i>`;

        img.parentElement.style.position = "relative";
        img.parentElement.appendChild(deleteBtn);

        //ajout evenement click pour supp
        deleteBtn.addEventListener('click', function () {
            let projectId = img.id;

            if(!projectId){
                projectId = img.dataset.id;
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

    if (result && result.imageUrl) {
       
        //ajout image gallery
        const newImage = document.createElement('img');
        newImage.src = result.imageUrl; 
        newImage.alt = result.title; 
        newImage.dataset.id = result.id; //ajoput id a image
   
        //création balise figcaption
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = result.title;
        
        //creation balise figure pour titre
        const figure = document.createElement('figure');
        figure.appendChild(newImage);
        figure.appendChild(figcaption);

        //ajout figure dans gallery
        gallery.appendChild(figure); 
       
        //ajout image modal
        const modalGallery = document.querySelector('.gallery-modal');
        if (modalGallery) {
            const modalFigure = figure.cloneNode(true);
            modalGallery.appendChild(modalFigure);
        }
        return true;
    } 
   
}

//une fois le DOM pret
document.addEventListener("DOMContentLoaded", function(){

    let token = localStorage.getItem('token');

    fetchCategories();
    fetchProjects();
    editMode();
    changeLoginBtn(token);
    addBtnModifier(token);    
    
    const modalOverlay = document.createElement("div");
    modalOverlay.classList.add("modal-overlay");
    document.body.appendChild(modalOverlay);

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

