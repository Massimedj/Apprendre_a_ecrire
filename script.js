// --- VARIABLES GLOBALES ET ÉTAT ---
let currentMode = 'scroll'; // Peut être 'scroll' ou 'write'
let palmRejection = false;  // Désactivé par défaut (accepte tous les stylets)

// --- LISTES DE DONNÉES ---
const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const numbers = "0123456789".split("");

// La liste complète des 100 mots du quotidien
const words = [
    // JOURS
    "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
    // MOIS
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
    // SAISONS & NATURE
    "Printemps", "Ete", "Automne", "Hiver",
    "Soleil", "Lune", "Etoile", "Nuage", "Pluie", "Neige", "Vent",
    "Fleur", "Arbre", "Feuille", "Herbe", "Jardin",
    // POLITESSE & EMOTIONS
    "Bonjour", "Bonsoir", "Merci", "Pardon", "Bravo", "Aurevoir",
    "Joie", "Rire", "Bisou", "Calin", "Amour", "Gentil",
    // FAMILLE & ECOLE
    "Maman", "Papa", "Bebe", "Papi", "Mamie", "Frere", "Soeur", 
    "Maison", "Ecole", "Maitresse", "Stylo", "Crayon", "Livre", "Cahier",
    "Table", "Chaise", "Lit", "Porte", "Jouet", "Ballon",
    // ANIMAUX
    "Chat", "Chien", "Lapin", "Cheval", "Vache", "Poule", "Cochon",
    "Lion", "Tigre", "Ours", "Girafe", "Elephant", "Singe",
    "Oiseau", "Poisson", "Loup", "Renard", "Papillon",
    // NOURRITURE
    "Pomme", "Poire", "Banane", "Fraise", "Cerise", "Orange",
    "Carotte", "Patate", "Tomate", "Salade", "Radis",
    "Gateau", "Chocolat", "Bonbon", "Pain", "Lait", "Eau",
    // TRANSPORTS
    "Velo", "Voiture", "Train", "Avion", "Bateau", "Bus"
];

// --- INITIALISATION ---
let currentIndex = 0;
let currentList = letters;
let isUpperCase = false;
let isDrawing = false;

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const textContainer = document.getElementById('textContainer');
const sheet = document.getElementById('sheet');

function init() {
    // Écouteurs pour les menus déroulants
    document.getElementById('typeSelect').addEventListener('change', changeType);
    document.getElementById('styleSelect').addEventListener('change', updateContent);
    
    // GESTION DU DESSIN (POINTER EVENTS)
    // Pointer Events gèrent à la fois la souris, le tactile et le stylet
    canvas.addEventListener('pointerdown', startPosition);
    canvas.addEventListener('pointerup', endPosition);
    canvas.addEventListener('pointermove', draw);
    
    // Cas de sortie (si le stylet sort de l'écran)
    canvas.addEventListener('pointercancel', endPosition);
    canvas.addEventListener('pointerout', endPosition);

    // Redimensionnement
    window.addEventListener('resize', () => { 
        resizeCanvas(); 
        // Note : on ne recharge pas le contenu au resize pour ne pas perdre le dessin
    });
    
    // Démarrage par défaut en mode Scroll pour permettre de voir la page
    setMode('scroll');
    updateContent(); 
}

// --- GESTION DES MODES (SCROLL vs ÉCRIRE) ---
function setMode(mode) {
    currentMode = mode;
    
    // Mise à jour visuelle des boutons (Vert si actif, Gris sinon)
    const btnScroll = document.getElementById('btnScroll');
    const btnWrite = document.getElementById('btnWrite');
    const palmOption = document.getElementById('palmOption');

    if (mode === 'scroll') {
        btnScroll.className = 'tool-btn active';
        btnWrite.className = 'tool-btn';
        palmOption.style.display = 'none'; // On cache l'option palm rejection
        
        // Retrait de la classe CSS sur la feuille
        sheet.classList.remove('write-mode'); 
    } else {
        btnScroll.className = 'tool-btn';
        btnWrite.className = 'tool-btn active';
        palmOption.style.display = 'flex'; // On affiche l'option
        
        // Ajout de la classe CSS qui active le canvas (pointer-events: auto)
        sheet.classList.add('write-mode');
    }
}

// Mise à jour de l'option Palm Rejection depuis la case à cocher
function updatePalm() {
    palmRejection = document.getElementById('checkPalm').checked;
}

// --- FONCTIONS DE DESSIN ---

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
    };
}

function startPosition(e) {
    // SÉCURITÉ 1 : Si on est en mode scroll, on ne dessine jamais
    if (currentMode !== 'write') return;

    // SÉCURITÉ 2 : PALM REJECTION
    // Si la case est cochée ET que l'écran détecte autre chose qu'un stylet ('pen'), on ignore
    if (palmRejection && e.pointerType !== 'pen') return;

    // Si on passe les sécurités, on bloque le navigateur (zoom, sélection) et on dessine
    e.preventDefault(); 
    isDrawing = true;
    draw(e);
}

function endPosition() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(e) {
    // Si on ne dessine pas, ou mauvais mode, ou rejet de paume actif sur un doigt
    if (!isDrawing) return;
    if (currentMode !== 'write') return;
    if (palmRejection && e.pointerType !== 'pen') return;

    e.preventDefault();
    const pos = getPos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

// --- GESTION DU CANVAS ET DU CONTENU ---

function resizeCanvas() {
    canvas.width = sheet.clientWidth;
    canvas.height = sheet.clientHeight;
    
    // Configuration du trait (Gros feutre)
    ctx.lineWidth = 12; 
    ctx.lineCap = 'round'; 
    ctx.lineJoin = 'round'; 
    ctx.strokeStyle = '#2c3e50'; // Gris foncé presque noir
}

function changeType() {
    const type = document.getElementById('typeSelect').value;
    currentIndex = 0;
    if (type === 'lettres') currentList = letters;
    else if (type === 'chiffres') currentList = numbers;
    else if (type === 'mots') currentList = words;
    updateContent();
}

function changeCase() {
    isUpperCase = !isUpperCase;
    document.getElementById('btnCase').innerText = isUpperCase ? "Passer en Minuscules" : "Passer en Majuscules";
    updateContent();
}

function updateContent() {
    // On vide le conteneur de texte HTML
    textContainer.innerHTML = ''; 
    
    // On efface le dessin précédent
    // On utilise un petit délai pour être sûr que le DOM est à jour
    setTimeout(() => { 
        resizeCanvas(); 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
    }, 10);

    let rawText = currentList[currentIndex];
    let textToShow = rawText;
    
    // Gestion Majuscule / Minuscule
    if (isUpperCase) {
        textToShow = rawText.toUpperCase();
    } else {
        // Pour les mots, on garde la casse originale ou on met en minuscule si demandé
        if(isNaN(textToShow)) textToShow = rawText.toLowerCase();
    }
    
    const fontStyle = document.getElementById('styleSelect').value;
    const fontClass = (fontStyle === 'cursif') ? 'font-cursif' : 'font-baton';

    // DETECTION DE LA LETTRE "f" EN CURSIF
    // Si oui, on ajoute la classe 'spread-lines' pour sauter des lignes
    if (fontStyle === 'cursif' && textToShow.toLowerCase().includes('f')) {
        textContainer.classList.add('spread-lines');
    } else {
        textContainer.classList.remove('spread-lines');
    }

    // --- BOUCLE DE GÉNÉRATION (TOUJOURS 12 FOIS) ---
    let repetitions = 12; 
    for (let i = 0; i < repetitions; i++) {
        // Calcul de l'opacité (Dégradé)
        let opacity = 1;
        if (i === 0) opacity = 1;         // Modèle noir
        else if (i < 3) opacity = 0.4;    // Gris moyen
        else opacity = 0.08;              // Gris très pâle

        // Création des éléments HTML
        let box = document.createElement('div');
        box.className = `letter-box ${fontClass}`;
        
        let span = document.createElement('span');
        span.className = 'letter-content';
        span.innerText = textToShow;
        span.style.color = (i===0) ? "black" : `rgba(0, 0, 0, ${opacity})`;
        
        box.appendChild(span);
        textContainer.appendChild(box);
    }
}

// --- NAVIGATION ---
function nextItem() { 
    if (currentIndex < currentList.length - 1) { 
        currentIndex++; 
        updateContent(); 
    } 
}

function previousItem() { 
    if (currentIndex > 0) { 
        currentIndex--; 
        updateContent(); 
    } 
}

function clearCanvas() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
}

// --- LANCEMENT ---
window.onload = init;
