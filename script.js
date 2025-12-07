// --- VARIABLES GLOBALES ---
let currentMode = 'scroll';
let palmRejection = false;
let pointsBuffer = []; // Tampon pour stocker les points avant de les dessiner
let isDrawing = false;
let lastPos = { x: 0, y: 0 }; // Dernière position connue pour lier les traits

const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const numbers = "0123456789".split("");
const words = [
    "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche",
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
    "Printemps", "Ete", "Automne", "Hiver",
    "Soleil", "Lune", "Etoile", "Nuage", "Pluie", "Neige", "Vent",
    "Fleur", "Arbre", "Feuille", "Herbe", "Jardin",
    "Bonjour", "Bonsoir", "Merci", "Pardon", "Bravo", "Aurevoir",
    "Joie", "Rire", "Bisou", "Calin", "Amour", "Gentil",
    "Maman", "Papa", "Bebe", "Papi", "Mamie", "Frere", "Soeur", 
    "Maison", "Ecole", "Maitresse", "Stylo", "Crayon", "Livre", "Cahier",
    "Table", "Chaise", "Lit", "Porte", "Jouet", "Ballon",
    "Chat", "Chien", "Lapin", "Cheval", "Vache", "Poule", "Cochon",
    "Lion", "Tigre", "Ours", "Girafe", "Elephant", "Singe",
    "Oiseau", "Poisson", "Loup", "Renard", "Papillon",
    "Pomme", "Poire", "Banane", "Fraise", "Cerise", "Orange",
    "Carotte", "Patate", "Tomate", "Salade", "Radis",
    "Gateau", "Chocolat", "Bonbon", "Pain", "Lait", "Eau",
    "Velo", "Voiture", "Train", "Avion", "Bateau", "Bus"
];

let currentIndex = 0;
let currentList = letters;
let isUpperCase = false;

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const textContainer = document.getElementById('textContainer');
const sheet = document.getElementById('sheet');

// --- INITIALISATION ---
function init() {
    document.getElementById('typeSelect').addEventListener('change', changeType);
    document.getElementById('styleSelect').addEventListener('change', updateContent);
    
    // GESTION DU DESSIN (POINTER EVENTS)
    canvas.addEventListener('pointerdown', startPosition);
    // On utilise 'window' pour pointerup/out pour être sûr de capturer le relâchement même hors canvas
    window.addEventListener('pointerup', endPosition);
    canvas.addEventListener('pointermove', collectPoints); // On ne dessine pas, on collecte
    window.addEventListener('pointercancel', endPosition);
    
    window.addEventListener('resize', () => { resizeCanvas(); });
    
    setMode('scroll');
    updateContent(); 
    
    // Démarrage de la boucle de dessin haute performance
    drawFrame();
}

// --- BOUCLE DE DESSIN (RENDU) ---
// Cette fonction tourne en boucle 60 fois par seconde
function drawFrame() {
    // S'il y a des points en attente dans le tampon
    if (pointsBuffer.length > 0) {
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y); // On part du dernier point connu

        // On trace des lignes vers tous les nouveaux points collectés
        for (let i = 0; i < pointsBuffer.length; i++) {
            ctx.lineTo(pointsBuffer[i].x, pointsBuffer[i].y);
        }
        
        ctx.stroke(); // On dessine tout d'un coup (beaucoup plus rapide)
        
        // On met à jour la dernière position connue avec le dernier point du tampon
        lastPos = pointsBuffer[pointsBuffer.length - 1];
        // On vide le tampon pour le prochain tour
        pointsBuffer = [];
    }

    // On demande au navigateur de rappeler cette fonction à la prochaine image
    requestAnimationFrame(drawFrame);
}


// --- GESTION DES MODES ---
function setMode(mode) {
    currentMode = mode;
    document.getElementById('btnScroll').className = (mode === 'scroll') ? 'tool-btn active' : 'tool-btn';
    document.getElementById('btnWrite').className = (mode === 'write') ? 'tool-btn active' : 'tool-btn';
    document.getElementById('palmOption').style.display = (mode === 'write') ? 'flex' : 'none';
    if (mode === 'write') { sheet.classList.add('write-mode'); } else { sheet.classList.remove('write-mode'); }
}

function updatePalm() {
    palmRejection = document.getElementById('checkPalm').checked;
}

// --- FONCTIONS DE DESSIN (EVENEMENTS) ---
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function startPosition(e) {
    if (currentMode !== 'write') return;
    if (palmRejection && e.pointerType !== 'pen') return;
    // Pour les stylets passifs, on accepte 'touch' si palmRejection est faux
    if (!palmRejection && e.pointerType !== 'pen' && e.pointerType !== 'touch') return; 

    e.preventDefault(); 
    isDrawing = true;
    
    // On définit le point de départ
    lastPos = getPos(e);
    pointsBuffer.push(lastPos); // On l'ajoute au tampon pour le dessiner tout de suite
}

function endPosition(e) {
    if(isDrawing) {
        isDrawing = false;
        pointsBuffer = []; // On vide le tampon par sécurité
    }
}

// Cette fonction ne dessine PAS, elle stocke juste les points très vite
function collectPoints(e) {
    if (!isDrawing) return;
    if (currentMode !== 'write') return;
    if (palmRejection && e.pointerType !== 'pen') return;
     if (!palmRejection && e.pointerType !== 'pen' && e.pointerType !== 'touch') return;

    e.preventDefault();

    // Récupération des points "cachés" (haute précision)
    if (e.getCoalescedEvents) {
        let events = e.getCoalescedEvents();
        for(let event of events) {
            pointsBuffer.push(getPos(event));
        }
    } else {
        // Fallback si la tablette ne supporte pas coalesced events
        pointsBuffer.push(getPos(e));
    }
}


// --- RESTE DU CODE (CONTENU, NAV) ---
function resizeCanvas() {
    canvas.width = sheet.clientWidth;
    canvas.height = sheet.clientHeight;
    ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2c3e50'; 
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
    document.getElementById('btnCase').innerText = isUpperCase ? "Min" : "Maj";
    updateContent();
}

function updateContent() {
    textContainer.innerHTML = ''; 
    setTimeout(() => { resizeCanvas(); ctx.clearRect(0, 0, canvas.width, canvas.height); pointsBuffer = [];}, 50);

    let rawText = currentList[currentIndex];
    let textToShow = isUpperCase ? rawText.toUpperCase() : (isNaN(rawText) ? rawText.toLowerCase() : rawText);
    
    const fontStyle = document.getElementById('styleSelect').value;
    const fontClass = (fontStyle === 'cursif') ? 'font-cursif' : 'font-baton';

    if (fontStyle === 'cursif' && textToShow.toLowerCase().includes('f')) {
        textContainer.classList.add('spread-lines');
    } else {
        textContainer.classList.remove('spread-lines');
    }

    let repetitions = 12; 
    for (let i = 0; i < repetitions; i++) {
        let opacity = (i === 0) ? 1 : (i < 3 ? 0.4 : 0.08);
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

function nextItem() { if (currentIndex < currentList.length - 1) { currentIndex++; updateContent(); } }
function previousItem() { if (currentIndex > 0) { currentIndex--; updateContent(); } }
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); pointsBuffer = []; }

window.onload = init;
