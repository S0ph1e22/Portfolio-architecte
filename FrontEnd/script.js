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

/* document.addEventListener('DOMContentLoaded',function(){

    const loginForm=document.querySelector("#loginForm form");
    const errorMessage = document.getElementById('error-message');

    if (loginForm){
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email=document.getElementById('email').value;
            const password=document.getElementById('password').value;

            const reponse= await fetch ('/login',{
                method: 'POST',
                headers : {'Content-type' : 'application/json'},
                body :JSON.stringify({email,password})
            });
            if (!response.ok){
                errorMessage.textContent = "Erreur dans l’identifiant ou le mot de passe";
                errorMessage.style.display="block";
            }else{
                window.location.href = '/dashboard';
            }
        });
    }
}); */
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

    const loginBtn = document.getElementById('loginBtn');  //selectionner le bouton login
    const mainContent = document.getElementsByTagName('main')[0];

    
document.addEventListener('DOMContentLoaded', async function() {  //fait passer le dom(index.html) avant
        await fetchCategories();   //att que les cat soit générer
        await fetchProjects();     //att que les projets soit générer
        loginBtn.addEventListener('click', loadLoginForm);      //qd on clique, affiche la fonction
});