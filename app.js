let offres = JSON.parse(localStorage.getItem("offres")) || [];
let candidatures = JSON.parse(localStorage.getItem("candidatures")) || [];
let profil = JSON.parse(localStorage.getItem("profil")) || null;

let index = 0;
let filtreActif = "toutes";

// ================= SWITCH UI (RÔLES) =================
function showCandidat() {
  document.getElementById("candidat").style.display = "block";
  document.getElementById("recruteur").style.display = "none";
  showOnglet("offres");
}

function showRecruteur() {
  document.getElementById("candidat").style.display = "none";
  document.getElementById("recruteur").style.display = "block";
  afficherOffresPubliees();
  afficherCandidatures();
}

// ================= ONGLETS CANDIDAT =================
function showOnglet(onglet) {
  document.getElementById("ongletOffres").style.display =
    onglet === "offres" ? "block" : "none";
  document.getElementById("ongletProfil").style.display =
    onglet === "profil" ? "block" : "none";

  if (onglet === "offres") {
    index = 0;
    afficherOffre();
    afficherMesCandidatures();
  } else {
    chargerProfil();
    afficherApercuProfil();
  }
}

// ================= HELPERS =================
// Renvoie uniquement les offres ouvertes (visibles côté candidat)
function offresOuvertes() {
  return offres.filter((o) => o.statut === "ouverte");
}

function sauverOffres() {
  localStorage.setItem("offres", JSON.stringify(offres));
}

function sauverCandidatures() {
  localStorage.setItem("candidatures", JSON.stringify(candidatures));
}

// ================= RECRUTEUR : AJOUTER UNE OFFRE =================
function ajouterOffre() {
  const titre = document.getElementById("titre").value.trim();
  const entreprise = document.getElementById("entreprise").value.trim();
  const lieu = document.getElementById("lieu").value.trim();
  const salaire = document.getElementById("salaire").value.trim();
  const contrat = document.getElementById("contrat").value;
  const competences = document.getElementById("competences").value.trim();
  const desc = document.getElementById("desc").value.trim();

  if (!titre || !desc) return alert("Remplis au moins le titre et la description");

  offres.push({
    id: Date.now(),
    titre,
    entreprise,
    lieu,
    salaire,
    contrat,
    competences,
    desc,
    statut: "ouverte",
  });
  sauverOffres();

  // On vide le formulaire
  document.getElementById("titre").value = "";
  document.getElementById("entreprise").value = "";
  document.getElementById("lieu").value = "";
  document.getElementById("salaire").value = "";
  document.getElementById("competences").value = "";
  document.getElementById("desc").value = "";

  alert("Offre ajoutée ");
  afficherOffresPubliees();
}

// ================= RECRUTEUR : MES OFFRES PUBLIÉES =================
function filtrerOffres(filtre) {
  filtreActif = filtre;
  afficherOffresPubliees();
}

function afficherOffresPubliees() {
  const container = document.getElementById("offresPubliees");
  container.innerHTML = "";

  let liste = offres;
  if (filtreActif === "ouvertes") liste = offres.filter((o) => o.statut === "ouverte");
  if (filtreActif === "fermees") liste = offres.filter((o) => o.statut === "fermee");

  if (liste.length === 0) {
    container.innerHTML = "<p>Aucune offre dans cette catégorie.</p>";
    return;
  }

  liste.forEach((offre) => {
    const nbCandidatures = candidatures.filter((c) => c.offreId === offre.id).length;
    const estOuverte = offre.statut === "ouverte";

    const article = document.createElement("article");
    article.className = "carteOffrePubliee";
    article.setAttribute("data-id", offre.id);

    article.innerHTML = `
      <h4>${offre.titre}
        <span class="badgeStatut">${estOuverte ? "Ouverte" : "Fermée"}</span>
      </h4>
      <p>${offre.entreprise || "—"} · ${offre.lieu || "—"} · ${offre.contrat || "—"} · ${offre.salaire || "—"}</p>
      <p><strong>Compétences :</strong> ${offre.competences || "—"}</p>
      <p>${offre.desc}</p>
      <p>Candidatures reçues : <span class="nbCandidatures">${nbCandidatures}</span></p>
      <div class="actionsOffre">
        ${
          estOuverte
            ? `<button onclick="fermerOffre(${offre.id})"> Fermer l'offre</button>`
            : `<button onclick="rouvrirOffre(${offre.id})"> Rouvrir l'offre</button>`
        }
        <button onclick="supprimerOffre(${offre.id})"> Supprimer</button>
      </div>
    `;

    container.appendChild(article);
  });
}

function fermerOffre(id) {
  const offre = offres.find((o) => o.id === id);
  if (offre) offre.statut = "fermee";
  sauverOffres();
  afficherOffresPubliees();
}

function rouvrirOffre(id) {
  const offre = offres.find((o) => o.id === id);
  if (offre) offre.statut = "ouverte";
  sauverOffres();
  afficherOffresPubliees();
}

function supprimerOffre(id) {
  if (!confirm("Supprimer cette offre et ses candidatures ?")) return;
  offres = offres.filter((o) => o.id !== id);
  candidatures = candidatures.filter((c) => c.offreId !== id);
  sauverOffres();
  sauverCandidatures();
  afficherOffresPubliees();
  afficherCandidatures();
}

// ================= CANDIDAT : AFFICHER UNE OFFRE =================
function afficherOffre() {
  const ouvertes = offresOuvertes();
  const container = document.getElementById("offreContainer");
  const actions = document.getElementById("actionsCandidat");
  const fin = document.getElementById("finOffres");

  document.getElementById("compteurOffres").textContent =
    Math.max(ouvertes.length - index, 0);

  // Plus d'offres à montrer
  if (ouvertes.length === 0 || index >= ouvertes.length) {
    container.style.display = "none";
    actions.style.display = "none";
    fin.style.display = "block";
    return;
  }

  container.style.display = "block";
  actions.style.display = "block";
  fin.style.display = "none";

  const offre = ouvertes[index];
  document.getElementById("offreTitre").textContent = offre.titre;
  document.getElementById("offreEntreprise").textContent = offre.entreprise || "—";
  document.getElementById("offreLieu").textContent = offre.lieu || "—";
  document.getElementById("offreSalaire").textContent = offre.salaire || "—";
  document.getElementById("offreContrat").textContent = offre.contrat || "—";
  document.getElementById("offreCompetences").textContent = offre.competences || "—";
  document.getElementById("offreDescription").textContent = offre.desc;
}

// ================= CANDIDAT : POSTULER / PASSER =================
function postuler() {
  const ouvertes = offresOuvertes();
  if (ouvertes.length === 0 || index >= ouvertes.length) return;

  const offre = ouvertes[index];
  const nomCandidat = profil
    ? `${profil.prenom || ""} ${profil.nom || ""}`.trim() || "Candidat anonyme"
    : "Candidat anonyme";

  candidatures.push({
    offreId: offre.id,
    titreOffre: offre.titre,
    candidat: nomCandidat,
    statut: "Nouveau",
  });
  sauverCandidatures();

  alert("Candidature envoyée ");
  index++;
  afficherOffre();
  afficherMesCandidatures();
}

function passer() {
  index++;
  afficherOffre();
}

// ================= CANDIDAT : MES CANDIDATURES =================
function afficherMesCandidatures() {
  const liste = document.getElementById("mesCandidatures");
  liste.innerHTML = "";

  const miennes = candidatures.filter((c) => c.candidat !== "Candidat anonyme" || true);
  // (toutes les candidatures de ce navigateur — MVP mono-utilisateur)

  if (candidatures.length === 0) {
    liste.innerHTML = "<li>Aucune candidature envoyée pour l'instant.</li>";
    return;
  }

  candidatures.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = `${c.titreOffre} — ${c.statut}`;
    liste.appendChild(li);
  });
}

// ================= RECRUTEUR : CANDIDATURES REÇUES =================
function afficherCandidatures() {
  const container = document.getElementById("candidatures");
  container.innerHTML = "";

  if (candidatures.length === 0) {
    container.innerHTML = "<p>Aucune candidature reçue pour l'instant.</p>";
    return;
  }

  // On regroupe les candidatures par offre
  offres.forEach((offre) => {
    const candidatsOffre = candidatures.filter((c) => c.offreId === offre.id);
    if (candidatsOffre.length === 0) return;

    const article = document.createElement("article");
    article.className = "blocCandidatures";
    article.setAttribute("data-offre-id", offre.id);

    let html = `<h4>${offre.titre}</h4><ul class="listeCandidats">`;

    candidatsOffre.forEach((c) => {
      // index global de la candidature pour pouvoir agir dessus
      const i = candidatures.indexOf(c);
      html += `
        <li>
          <span>${c.candidat}</span>
          <span class="statutCandidature">${c.statut}</span>
          <button onclick="accepterCandidat(${i})">Accepter</button>
          <button onclick="refuserCandidat(${i})"> Refuser</button>
        </li>
      `;
    });

    html += "</ul>";
    article.innerHTML = html;
    container.appendChild(article);
  });
}

function accepterCandidat(i) {
  if (candidatures[i]) candidatures[i].statut = "Accepté";
  sauverCandidatures();
  afficherCandidatures();
}

function refuserCandidat(i) {
  if (candidatures[i]) candidatures[i].statut = "Refusé";
  sauverCandidatures();
  afficherCandidatures();
}

// ================= CANDIDAT : PROFIL =================
function enregistrerProfil() {
  profil = {
    prenom: document.getElementById("profilPrenom").value.trim(),
    nom: document.getElementById("profilNom").value.trim(),
    email: document.getElementById("profilEmail").value.trim(),
    tel: document.getElementById("profilTel").value.trim(),
    ville: document.getElementById("profilVille").value.trim(),
    naissance: document.getElementById("profilNaissance").value,
    poste: document.getElementById("profilPoste").value.trim(),
    contrat: document.getElementById("profilContrat").value,
    mobilite: document.getElementById("profilMobilite").value,
    salaire: document.getElementById("profilSalaire").value.trim(),
    dispo: document.getElementById("profilDispo").value.trim(),
    experience: document.getElementById("profilExperience").value,
    diplome: document.getElementById("profilDiplome").value.trim(),
    parcours: document.getElementById("profilParcours").value.trim(),
    competences: document.getElementById("profilCompetences").value.trim(),
    langues: document.getElementById("profilLangues").value.trim(),
    bio: document.getElementById("profilBio").value.trim(),
    linkedin: document.getElementById("profilLinkedin").value.trim(),
    // Pour le CV on stocke juste le nom du fichier (les fichiers ne se
    // sérialisent pas en localStorage)
    cv: document.getElementById("profilCV").files[0]
      ? document.getElementById("profilCV").files[0].name
      : "",
  };

  localStorage.setItem("profil", JSON.stringify(profil));
  alert("Profil enregistré ");
  afficherApercuProfil();
}

// Recharge les valeurs dans le formulaire si un profil existe déjà
function chargerProfil() {
  if (!profil) return;

  document.getElementById("profilPrenom").value = profil.prenom || "";
  document.getElementById("profilNom").value = profil.nom || "";
  document.getElementById("profilEmail").value = profil.email || "";
  document.getElementById("profilTel").value = profil.tel || "";
  document.getElementById("profilVille").value = profil.ville || "";
  document.getElementById("profilNaissance").value = profil.naissance || "";
  document.getElementById("profilPoste").value = profil.poste || "";
  document.getElementById("profilContrat").value = profil.contrat || "CDI";
  document.getElementById("profilMobilite").value = profil.mobilite || "Sur site";
  document.getElementById("profilSalaire").value = profil.salaire || "";
  document.getElementById("profilDispo").value = profil.dispo || "";
  document.getElementById("profilExperience").value = profil.experience || "Débutant";
  document.getElementById("profilDiplome").value = profil.diplome || "";
  document.getElementById("profilParcours").value = profil.parcours || "";
  document.getElementById("profilCompetences").value = profil.competences || "";
  document.getElementById("profilLangues").value = profil.langues || "";
  document.getElementById("profilBio").value = profil.bio || "";
  document.getElementById("profilLinkedin").value = profil.linkedin || "";
}

function afficherApercuProfil() {
  const apercu = document.getElementById("apercuProfil");
  const contenu = document.getElementById("contenuApercuProfil");

  if (!profil) {
    apercu.style.display = "none";
    return;
  }

  apercu.style.display = "block";
  contenu.innerHTML = `
    <p><strong>${profil.prenom} ${profil.nom}</strong> — ${profil.poste || "—"}</p>
    <p>${profil.ville || "—"} · ${profil.email || "—"} · ${profil.tel || "—"}</p>
    <p><strong>Recherche :</strong> ${profil.contrat} · ${profil.mobilite} · ${profil.salaire || "—"} · Dispo : ${profil.dispo || "—"}</p>
    <p><strong>Expérience :</strong> ${profil.experience} — ${profil.diplome || "—"}</p>
    <p><strong>Parcours :</strong> ${profil.parcours || "—"}</p>
    <p><strong>Compétences :</strong> ${profil.competences || "—"}</p>
    <p><strong>Langues :</strong> ${profil.langues || "—"}</p>
    <p><strong>Présentation :</strong> ${profil.bio || "—"}</p>
    <p><strong>CV :</strong> ${profil.cv || "Aucun"} · <strong>Lien :</strong> ${profil.linkedin || "—"}</p>
  `;
}

/* ============================================
   SWIPE CANDIDAT — glisser souris + tactile
   ============================================ */

// Seuil de déclenchement : distance minimale pour valider un swipe
const SEUIL_SWIPE = 100;

// État du geste en cours
let swipeEnCours = false;
let posDepartX = 0;
let posDepartY = 0;
let deltaX = 0;

// On initialise le swipe sur la carte d'offre.
// À appeler une fois la page candidat chargée (après showOnglet("offres")).
function initSwipe() {
  const carte = document.getElementById("offreContainer");
  if (!carte) return; // sécurité : on n'est peut-être pas sur la page candidat

  // --- SOURIS ---
  carte.addEventListener("mousedown", debutSwipe);
  document.addEventListener("mousemove", deplacementSwipe);
  document.addEventListener("mouseup", finSwipe);

  // --- TACTILE ---
  carte.addEventListener("touchstart", debutSwipe, { passive: true });
  carte.addEventListener("touchmove", deplacementSwipe, { passive: false });
  carte.addEventListener("touchend", finSwipe);
}

// Récupère la position X/Y que ce soit souris ou tactile
function getPos(e) {
  if (e.touches && e.touches.length) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if (e.changedTouches && e.changedTouches.length) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function debutSwipe(e) {
  const carte = document.getElementById("offreContainer");
  if (!carte || carte.style.display === "none") return;

  swipeEnCours = true;
  const pos = getPos(e);
  posDepartX = pos.x;
  posDepartY = pos.y;
  deltaX = 0;

  // On coupe la transition pendant qu'on glisse pour que ça suive le doigt
  carte.style.transition = "none";
  carte.style.cursor = "grabbing";
}

function deplacementSwipe(e) {
  if (!swipeEnCours) return;

  const carte = document.getElementById("offreContainer");
  if (!carte) return;

  const pos = getPos(e);
  deltaX = pos.x - posDepartX;
  const deltaY = pos.y - posDepartY;

  // Sur tactile, on empêche le scroll vertical si le geste est horizontal
  if (e.cancelable && Math.abs(deltaX) > Math.abs(deltaY)) {
    e.preventDefault();
  }

  // La carte suit le doigt + petite rotation proportionnelle
  const rotation = deltaX / 20;
  carte.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

  // Indice visuel : vert si on va postuler, rouge si on va passer
  if (deltaX > 40) {
    carte.style.borderColor = "var(--green)";
  } else if (deltaX < -40) {
    carte.style.borderColor = "var(--red)";
  } else {
    carte.style.borderColor = "var(--separator)";
  }
}

function finSwipe() {
  if (!swipeEnCours) return;
  swipeEnCours = false;

  const carte = document.getElementById("offreContainer");
  if (!carte) return;

  carte.style.cursor = "grab";
  carte.style.transition = "transform 0.3s var(--ease), border-color 0.2s var(--ease)";

  // Swipe vers la DROITE → postuler
  if (deltaX > SEUIL_SWIPE) {
    envolerCarte(carte, 1);
    return;
  }

  // Swipe vers la GAUCHE → passer
  if (deltaX < -SEUIL_SWIPE) {
    envolerCarte(carte, -1);
    return;
  }

  // Pas assez loin → la carte revient au centre
  carte.style.transform = "translateX(0) rotate(0)";
  carte.style.borderColor = "var(--separator)";
}

// Anime la carte qui sort de l'écran, puis déclenche l'action
function envolerCarte(carte, direction) {
  const sortie = direction * (window.innerWidth + 200);
  const rotation = direction * 25;

  carte.style.transform = `translateX(${sortie}px) rotate(${rotation}deg)`;
  carte.style.opacity = "0";

  // Une fois l'animation finie, on traite l'action et on remet la carte en place
  setTimeout(() => {
    if (direction === 1) {
      postuler();   // ta fonction existante
    } else {
      passer();     // ta fonction existante
    }

    // Réinitialisation pour la prochaine offre
    carte.style.transition = "none";
    carte.style.transform = "translateX(0) rotate(0)";
    carte.style.opacity = "1";
    carte.style.borderColor = "var(--separator)";

    // On réactive la transition au prochain frame
    requestAnimationFrame(() => {
      carte.style.transition = "transform 0.3s var(--ease), border-color 0.2s var(--ease)";
    });
  }, 300);
}



/* ============================================
   IMPORT EXCEL — drag & drop d'offres
   ============================================ */

function initImportExcel() {
  const zone = document.getElementById("zoneDrop");
  const input = document.getElementById("fichierExcel");
  if (!zone || !input) return; // sécurité : pas sur la page recruteur

  // Clic sur la zone → ouvre le sélecteur de fichier
  zone.addEventListener("click", () => input.click());

  // Fichier choisi via le sélecteur
  input.addEventListener("change", (e) => {
    if (e.target.files.length) lireFichierExcel(e.target.files[0]);
  });

  // --- Drag & drop ---
  // On empêche le navigateur d'ouvrir le fichier à la place
  ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
    zone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // Retour visuel quand un fichier survole la zone
  zone.addEventListener("dragover", () => zone.classList.add("survol"));
  zone.addEventListener("dragenter", () => zone.classList.add("survol"));
  zone.addEventListener("dragleave", () => zone.classList.remove("survol"));

  // Dépôt du fichier
  zone.addEventListener("drop", (e) => {
    zone.classList.remove("survol");
    const fichier = e.dataTransfer.files[0];
    if (fichier) lireFichierExcel(fichier);
  });
}

// Lit le fichier Excel/CSV et en extrait les offres
function lireFichierExcel(fichier) {
  const resultat = document.getElementById("resultatImport");
  resultat.textContent = "Lecture du fichier…";

  const lecteur = new FileReader();

  lecteur.onload = (e) => {
    try {
      const donnees = new Uint8Array(e.target.result);
      const classeur = XLSX.read(donnees, { type: "array" });

      // On prend la première feuille du classeur
      const premiereFeuille = classeur.SheetNames[0];
      const feuille = classeur.Sheets[premiereFeuille];

      // Convertit la feuille en tableau d'objets (1 ligne = 1 offre)
      const lignes = XLSX.utils.sheet_to_json(feuille);

      if (lignes.length === 0) {
        resultat.textContent = " Le fichier est vide ou mal formaté.";
        return;
      }

      let nbAjoutees = 0;

      lignes.forEach((ligne) => {
        // On accepte plusieurs noms de colonnes possibles (souples)
        const titre = ligne.Titre || ligne.titre || ligne.Poste || "";
        const desc = ligne.Description || ligne.description || "";

        if (!titre) return; // on ignore les lignes sans titre

        offres.push({
          id: Date.now() + nbAjoutees, // id unique même en boucle rapide
          titre: String(titre).trim(),
          entreprise: String(ligne.Entreprise || ligne.entreprise || "").trim(),
          lieu: String(ligne.Lieu || ligne.lieu || "").trim(),
          salaire: String(ligne.Salaire || ligne.salaire || "").trim(),
          contrat: String(ligne.Contrat || ligne.contrat || "CDI").trim(),
          competences: String(ligne.Competences || ligne.Compétences || ligne.competences || "").trim(),
          desc: String(desc).trim(),
          statut: "ouverte",
        });

        nbAjoutees++;
      });

      sauverOffres();
      afficherOffresPubliees();

      resultat.textContent = `${nbAjoutees} offre(s) importée(s) avec succès.`;
    } catch (err) {
      console.error(err);
      resultat.textContent = "Erreur de lecture. Vérifie le format du fichier.";
    }
  };

  lecteur.readAsArrayBuffer(fichier);
}