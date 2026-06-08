function ajouterOffre() {
  // 1. Récupérer ce qui existe déjà
  let offres = JSON.parse(localStorage.getItem('offres')) || [];

  // 2. Créer la nouvelle offre depuis le formulaire
  const nouvelleOffre = {
    id: Date.now(),                          // identifiant unique
    titre: document.getElementById('titre').value,
    entreprise: document.getElementById('entreprise').value,
    lieu: document.getElementById('lieu').value,
    salaire: document.getElementById('salaire').value,
    contrat: document.getElementById('contrat').value,
    competences: document.getElementById('competences').value,
    description: document.getElementById('desc').value,
    statut: 'ouverte'
  };

  // 3. Ajouter à la liste
  offres.push(nouvelleOffre);

  // 4. Sauvegarder dans le stockage partagé
  localStorage.setItem('offres', JSON.stringify(offres));

  // 5. Rafraîchir l'affichage
  afficherOffresPubliees();
}






/* =====================================================
   JOBSWIFT — PARTIE RECRUTEUR
   Publie des offres et gère les candidatures reçues
   ===================================================== */

// ---------- ÉTAT GLOBAL ----------
let offres = [];          // toutes les offres publiées
let candidatures = [];    // toutes les candidatures reçues
let filtreActuel = 'toutes';


// ---------- 1. CHARGEMENT INITIAL ----------
/**
 * Récupère les offres et candidatures depuis le stockage partagé.
 */
function chargerDonnees() {
  offres       = JSON.parse(localStorage.getItem('offres'))       || [];
  candidatures = JSON.parse(localStorage.getItem('candidatures')) || [];
}


// ---------- 2. AJOUTER UNE OFFRE ----------
/**
 * Lit le formulaire, crée une nouvelle offre avec un id unique,
 * sauvegarde dans localStorage, puis rafraîchit l'affichage.
 */
function ajouterOffre() {
  // Lecture des champs du formulaire
  const titre       = document.getElementById('titre').value.trim();
  const entreprise  = document.getElementById('entreprise').value.trim();
  const lieu        = document.getElementById('lieu').value.trim();
  const salaire     = document.getElementById('salaire').value.trim();
  const contrat     = document.getElementById('contrat').value;
  const competences = document.getElementById('competences').value.trim();
  const description = document.getElementById('desc').value.trim();

  // Validation simple : au moins le titre et l'entreprise
  if (!titre || !entreprise) {
    alert('Le titre et l\'entreprise sont obligatoires.');
    return;
  }

  // Construction de l'objet offre
  // Ces clés DOIVENT correspondre exactement à ce que la page candidat lit
  const nouvelleOffre = {
    id:          Date.now(),       // identifiant unique basé sur l'horodatage
    titre:       titre,
    entreprise:  entreprise,
    lieu:        lieu,
    salaire:     salaire,
    contrat:     contrat,
    competences: competences,
    description: description,
    statut:      'ouverte',         // ouverte par défaut
    datePublication: new Date().toISOString()
  };

  // On recharge pour ne pas écraser une offre ajoutée entre-temps
  chargerDonnees();
  offres.push(nouvelleOffre);
  localStorage.setItem('offres', JSON.stringify(offres));

  // Reset du formulaire
  document.getElementById('formOffre').reset();

  // Rafraîchissement de l'affichage
  afficherOffresPubliees();
  afficherCandidatures();
}


// ---------- 3. AFFICHAGE DES OFFRES PUBLIÉES ----------
/**
 * Génère le HTML des offres dans #offresPubliees,
 * en appliquant le filtre actuel (toutes / ouvertes / fermées).
 */
function afficherOffresPubliees() {
  chargerDonnees();
  const conteneur = document.getElementById('offresPubliees');
  conteneur.innerHTML = '';

  // Application du filtre
  let offresAffichees = offres;
  if (filtreActuel === 'ouvertes') {
    offresAffichees = offres.filter(o => o.statut === 'ouverte');
  } else if (filtreActuel === 'fermees') {
    offresAffichees = offres.filter(o => o.statut === 'fermee');
  }

  if (offresAffichees.length === 0) {
    conteneur.innerHTML = '<p style="padding:0 16px;color:#888;">Aucune offre à afficher.</p>';
    return;
  }

  // Construction de chaque carte d'offre
  offresAffichees.forEach(offre => {
    // Comptage des candidatures liées à cette offre
    const nbCandidatures = candidatures.filter(c => c.offreId === offre.id).length;

    const article = document.createElement('article');
    article.className = 'carteOffrePubliee';
    article.dataset.id = offre.id;

    const badgeClass = offre.statut === 'fermee' ? 'badgeStatut fermee' : 'badgeStatut';
    const badgeTexte = offre.statut === 'fermee' ? 'Fermée' : 'Ouverte';

    article.innerHTML = `
      <h4>
        ${offre.titre}
        <span class="${badgeClass}">${badgeTexte}</span>
      </h4>
      <p>${offre.entreprise} · ${offre.lieu} · ${offre.contrat} · ${offre.salaire}</p>
      <p><em>${offre.competences}</em></p>
      <p>${offre.description}</p>
      <p>Candidatures reçues : <span class="nbCandidatures">${nbCandidatures}</span></p>
      <div class="actionsOffre">
        ${offre.statut === 'ouverte'
          ? `<button onclick="fermerOffre(${offre.id})">Fermer</button>`
          : `<button onclick="rouvrirOffre(${offre.id})">Rouvrir</button>`
        }
        <button onclick="supprimerOffre(${offre.id})">Supprimer</button>
      </div>
    `;

    conteneur.appendChild(article);
  });
}


// ---------- 4. FILTRAGE DES OFFRES ----------
function filtrerOffres(filtre) {
  filtreActuel = filtre;

  // Mise à jour visuelle du bouton actif
  document.querySelectorAll('#ligneFiltres button').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  afficherOffresPubliees();
}


// ---------- 5. GESTION DU CYCLE DE VIE D'UNE OFFRE ----------
function fermerOffre(id) {
  chargerDonnees();
  const offre = offres.find(o => o.id === id);
  if (offre) {
    offre.statut = 'fermee';
    localStorage.setItem('offres', JSON.stringify(offres));
    afficherOffresPubliees();
  }
}

function rouvrirOffre(id) {
  chargerDonnees();
  const offre = offres.find(o => o.id === id);
  if (offre) {
    offre.statut = 'ouverte';
    localStorage.setItem('offres', JSON.stringify(offres));
    afficherOffresPubliees();
  }
}

function supprimerOffre(id) {
  // Confirmation avant action destructive
  if (!confirm('Supprimer définitivement cette offre et toutes ses candidatures ?')) {
    return;
  }

  chargerDonnees();

  // On supprime l'offre
  offres = offres.filter(o => o.id !== id);
  localStorage.setItem('offres', JSON.stringify(offres));

  // On supprime aussi les candidatures liées (cohérence des données)
  candidatures = candidatures.filter(c => c.offreId !== id);
  localStorage.setItem('candidatures', JSON.stringify(candidatures));

  afficherOffresPubliees();
  afficherCandidatures();
}


// ---------- 6. AFFICHAGE DES CANDIDATURES REÇUES ----------
/**
 * Pour chaque offre, on liste les candidats qui ont postulé.
 * Une offre sans candidat n'est pas affichée.
 */
function afficherCandidatures() {
  chargerDonnees();
  const conteneur = document.getElementById('candidatures');
  conteneur.innerHTML = '';

  if (candidatures.length === 0) {
    conteneur.innerHTML = '<p style="padding:0 16px;color:#888;">Aucune candidature reçue pour le moment.</p>';
    return;
  }

  // On regroupe les candidatures par offre
  offres.forEach(offre => {
    const candidatsDeCetteOffre = candidatures.filter(c => c.offreId === offre.id);

    // On n'affiche que les offres ayant au moins une candidature
    if (candidatsDeCetteOffre.length === 0) return;

    const bloc = document.createElement('article');
    bloc.className = 'blocCandidatures';
    bloc.dataset.offreId = offre.id;

    // En-tête du bloc
    let html = `<h4>${offre.titre} — ${candidatsDeCetteOffre.length} candidat(s)</h4>`;
    html += '<ul class="listeCandidats">';

    // Une ligne par candidat
    candidatsDeCetteOffre.forEach(c => {
      const nomComplet = `${c.candidat.prenom} ${c.candidat.nom}`.trim() || 'Anonyme';
      const email      = c.candidat.email || 'Pas d\'email';

      // Boutons disponibles selon le statut
      let boutons = '';
      if (c.statut === 'nouveau') {
        boutons = `
          <button onclick="accepterCandidat(${c.id})">Accepter</button>
          <button onclick="refuserCandidat(${c.id})">Refuser</button>
        `;
      } else {
        boutons = '<em style="color:#888;font-size:12px;">Traité</em>';
      }

      html += `
        <li>
          <span>${nomComplet} <small style="color:#888;">(${email})</small></span>
          <span class="statutCandidature">${c.statut}</span>
          ${boutons}
        </li>
      `;
    });

    html += '</ul>';
    bloc.innerHTML = html;
    conteneur.appendChild(bloc);
  });
}


// ---------- 7. ACCEPTER / REFUSER UNE CANDIDATURE ----------
function accepterCandidat(id) {
  changerStatutCandidature(id, 'accepté');
}

function refuserCandidat(id) {
  changerStatutCandidature(id, 'refusé');
}

/**
 * Fonction utilitaire mutualisée : change le statut d'une candidature.
 * Le candidat verra ce nouveau statut lors de sa prochaine visite.
 */
function changerStatutCandidature(id, nouveauStatut) {
  chargerDonnees();
  const candidature = candidatures.find(c => c.id === id);
  if (candidature) {
    candidature.statut = nouveauStatut;
    localStorage.setItem('candidatures', JSON.stringify(candidatures));
    afficherCandidatures();
  }
}