function chargerOffres() {
  const offres = JSON.parse(localStorage.getItem('offres')) || [];
  // Filtrer pour ne montrer que les offres ouvertes
  return offres.filter(o => o.statut === 'ouverte');
}

/* =====================================================
   JOBSWIFT — PARTIE CANDIDAT
   Lit les offres publiées par le recruteur (localStorage)
   ===================================================== */

// ---------- ÉTAT GLOBAL ----------
let offresDisponibles = [];   // les offres ouvertes à parcourir
let indexOffreActuelle = 0;   // position dans le paquet d'offres
let mesCandidatures = [];     // les offres auxquelles on a postulé


// ---------- 1. CHARGEMENT INITIAL ----------
/**
 * Récupère les offres depuis localStorage,
 * ne garde que celles qui sont "ouvertes",
 * et filtre celles auxquelles on a déjà postulé.
 */
function chargerOffres() {
  // Récupération depuis le stockage partagé
  const toutesLesOffres = JSON.parse(localStorage.getItem('offres')) || [];

  // Récupération des candidatures déjà envoyées
  mesCandidatures = JSON.parse(localStorage.getItem('candidatures')) || [];
  const idsDejaPostule = mesCandidatures.map(c => c.offreId);

  // On ne garde que les offres ouvertes ET pas encore postulées
  offresDisponibles = toutesLesOffres.filter(offre =>
    offre.statut === 'ouverte' && !idsDejaPostule.includes(offre.id)
  );

  // On remet l'index au début à chaque chargement
  indexOffreActuelle = 0;
}


// ---------- 2. AFFICHAGE D'UNE OFFRE ----------
/**
 * Remplit la carte HTML avec l'offre courante.
 * Si on est à la fin du paquet, on affiche l'écran de fin.
 */
function afficherOffreActuelle() {
  const conteneur   = document.getElementById('offreContainer');
  const ecranFin    = document.getElementById('finOffres');
  const actions     = document.getElementById('actionsCandidat');
  const compteur    = document.getElementById('compteurOffres');

  // Mise à jour du compteur d'offres restantes
  const restantes = offresDisponibles.length - indexOffreActuelle;
  compteur.textContent = restantes > 0 ? restantes : 0;

  // Cas 1 : plus d'offres → on cache la carte et on montre l'écran de fin
  if (indexOffreActuelle >= offresDisponibles.length) {
    conteneur.style.display = 'none';
    actions.style.display   = 'none';
    ecranFin.style.display  = 'block';
    return;
  }

  // Cas 2 : il reste des offres → on affiche celle en cours
  conteneur.style.display = 'block';
  actions.style.display   = 'flex';
  ecranFin.style.display  = 'none';

  const offre = offresDisponibles[indexOffreActuelle];

  document.getElementById('offreTitre').textContent       = offre.titre;
  document.getElementById('offreEntreprise').textContent  = offre.entreprise;
  document.getElementById('offreLieu').textContent        = offre.lieu;
  document.getElementById('offreSalaire').textContent     = offre.salaire;
  document.getElementById('offreContrat').textContent     = offre.contrat;
  document.getElementById('offreCompetences').textContent = offre.competences;
  document.getElementById('offreDescription').textContent = offre.description;
}


// ---------- 3. ACTIONS SWIPE ----------
/**
 * "Passer" : on ignore l'offre et on passe à la suivante.
 * Rien n'est sauvegardé — l'offre reviendra si on recharge.
 */
function passer() {
  indexOffreActuelle++;
  afficherOffreActuelle();
}

/**
 * "Postuler" : on enregistre la candidature dans localStorage,
 * puis on passe à l'offre suivante.
 */
function postuler() {
  const offre = offresDisponibles[indexOffreActuelle];
  if (!offre) return;  // sécurité

  // Récupération du profil candidat (rempli dans l'onglet profil)
  const profil = JSON.parse(localStorage.getItem('profil')) || {};

  // Construction de la candidature
  const candidature = {
    id:         Date.now(),
    offreId:    offre.id,
    offreTitre: offre.titre,
    entreprise: offre.entreprise,
    candidat: {
      prenom: profil.prenom || 'Anonyme',
      nom:    profil.nom    || '',
      email:  profil.email  || ''
    },
    statut: 'nouveau',          // sera mis à jour côté recruteur
    date:   new Date().toISOString()
  };

  // Ajout au tableau global et sauvegarde
  mesCandidatures.push(candidature);
  localStorage.setItem('candidatures', JSON.stringify(mesCandidatures));

  // Passage à la suite + mise à jour de la liste affichée
  indexOffreActuelle++;
  afficherOffreActuelle();
  afficherMesCandidatures();
}


// ---------- 4. LISTE DES CANDIDATURES ENVOYÉES ----------
/**
 * Affiche en bas de l'écran les offres auxquelles on a postulé.
 */
function afficherMesCandidatures() {
  const liste = document.getElementById('mesCandidatures');
  liste.innerHTML = '';  // on vide avant de re-remplir

  // On recharge depuis localStorage pour avoir les statuts à jour
  mesCandidatures = JSON.parse(localStorage.getItem('candidatures')) || [];

  if (mesCandidatures.length === 0) {
    liste.innerHTML = '<li>Vous n\'avez pas encore postulé.</li>';
    return;
  }

  mesCandidatures.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${c.offreTitre}</strong> — ${c.entreprise}
      <span class="statutCandidature">${c.statut}</span>
    `;
    liste.appendChild(li);
  });
}


// ---------- 5. NAVIGATION ENTRE ONGLETS ----------
function showOnglet(nom) {
  document.getElementById('ongletOffres').style.display = 'none';
  document.getElementById('ongletProfil').style.display = 'none';

  if (nom === 'offres') {
    document.getElementById('ongletOffres').style.display = 'block';
    // Rechargement à chaque visite pour avoir les nouvelles offres
    chargerOffres();
    afficherOffreActuelle();
    afficherMesCandidatures();
  } else if (nom === 'profil') {
    document.getElementById('ongletProfil').style.display = 'block';
    chargerProfil();
  }
}


// ---------- 6. GESTION DU PROFIL ----------
function enregistrerProfil() {
  const profil = {
    prenom:      document.getElementById('profilPrenom').value,
    nom:         document.getElementById('profilNom').value,
    email:       document.getElementById('profilEmail').value,
    tel:         document.getElementById('profilTel').value,
    ville:       document.getElementById('profilVille').value,
    naissance:   document.getElementById('profilNaissance').value,
    poste:       document.getElementById('profilPoste').value,
    contrat:     document.getElementById('profilContrat').value,
    mobilite:    document.getElementById('profilMobilite').value,
    salaire:     document.getElementById('profilSalaire').value,
    dispo:       document.getElementById('profilDispo').value,
    experience:  document.getElementById('profilExperience').value,
    diplome:     document.getElementById('profilDiplome').value,
    parcours:    document.getElementById('profilParcours').value,
    competences: document.getElementById('profilCompetences').value,
    langues:     document.getElementById('profilLangues').value,
    bio:         document.getElementById('profilBio').value,
    linkedin:    document.getElementById('profilLinkedin').value
  };

  localStorage.setItem('profil', JSON.stringify(profil));
  afficherApercuProfil(profil);
  alert('Profil enregistré !');
}

function chargerProfil() {
  const profil = JSON.parse(localStorage.getItem('profil'));
  if (!profil) return;

  // On repopule les champs du formulaire
  Object.keys(profil).forEach(cle => {
    const input = document.getElementById('profil' +
      cle.charAt(0).toUpperCase() + cle.slice(1));
    if (input) input.value = profil[cle];
  });

  afficherApercuProfil(profil);
}

function afficherApercuProfil(profil) {
  const apercu = document.getElementById('apercuProfil');
  const contenu = document.getElementById('contenuApercuProfil');

  contenu.innerHTML = `
    <p><strong>${profil.prenom || ''} ${profil.nom || ''}</strong></p>
    <p>${profil.poste || ''} — ${profil.ville || ''}</p>
    <p>${profil.bio || ''}</p>
  `;
  apercu.style.display = 'block';
}


// ---------- 7. SWIPE (placeholder pour ton initSwipe) ----------
function initSwipe() {
  // À compléter plus tard si tu veux ajouter le swipe tactile
  // Pour l'instant, les boutons Passer/Postuler suffisent
}