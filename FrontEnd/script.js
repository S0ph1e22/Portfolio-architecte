//récup tout les éléments de gallery
const gallery = document.querySelector(".gallery");



async function fetchProjects() {
    try {
        const response = await fetch("http://localhost:5678/api/works"); //endroit ou sont stockés les projets
        if (!response.ok) {                                              //si endroit existe pas, retourne une erreur 
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const projects = await response.json();                         //si donnée récup, affiche un message
        console.log("Données récupérées :", projects); 

        const gallery = document.querySelector(".gallery");
        if (!gallery) {
            console.error("Élément .gallery non trouvé !");              //si gallery inexistante, affiche une error
            return;
        }

        gallery.innerHTML = "";                                            //vide la galerie pour ajouter les projets dynamiquement

        projects.forEach(project => {                                     //ajouter chaque projet dans la galerie
            const projectElement = document.createElement("figure");       // ou se trouve image+txt 
            projectElement.innerHTML = `
                <img src="${project.imageUrl}" alt="${project.title}">      
                <figcaption>${project.title}</figcaption>`;                 // chemin des images + figcaption pour le txt sous img
            gallery.appendChild(projectElement);        
        });
    } catch (error) {                                                       //affche erreur si pas réussi
        console.error("Erreur lors de la récupération des projets :", error);
    }
}

fetchProjects();                                                           //si tout est ok, affihe tout

