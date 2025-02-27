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
            loginBtn.addEventListener('click',loadLoginForm);
            loginBtn.addEventListener('click', loadLoginForm); // Ajouter le gestionnaire "Login"
        }
        
        await fetchCategories();   //att que les cat soit générer
        await fetchProjects();     //att que les projets soit générer
});

