// --- VARIABLES GLOBALES ---
let currentMode = 'scroll';   // 'scroll' ou 'write'
let currentTool = 'pen';      // NOUVEAU : 'pen' (crayon) ou 'eraser' (gomme)
let palmRejection = false;
let pointsBuffer = []; 
let isDrawing = false;
let lastPos = { x: 0, y: 0 }; 

// (Vos listes letters, numbers, words restent ici...)
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
    
    canvas.addEventListener('pointerdown', startPosition);
    window.addEventListener('pointerup', endPosition);
    canvas.addEventListener('pointermove', collectPoints); 
    window.addEventListener('pointercancel', endPosition);
    
    window.addEventListener('resize', () => { resizeCanvas(); });
    
    // Configuration initiale du canvas
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setMode('scroll');     // On commence en mode scroll
    setTool('pen');        // Outil par défaut : crayon
    updateContent(); 
    
    drawFrame();
}

// --- BOUCLE DE DESSIN (C'EST ICI QUE LA MAGIE OPÈRE) ---
function drawFrame() {
    if (pointsBuffer.length > 0) {
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);

        for (let i = 0; i < pointsBuffer.length; i++) {
            ctx.lineTo(pointsBuffer[i].x, pointsBuffer[i].y);
        }
        
        // --- CHANGEMENT MAJEUR ICI POUR LA GOMME ---
        if (currentTool === 'eraser') {
            // Mode GOMME : "destination-out" rend transparent ce qu'on touche
            ctx.globalCompositeOperation = "destination-out";
            // La gomme est plus grosse que le crayon pour être pratique
            ctx.lineWidth = 40; 
        } else {
            // Mode CRAYON : "source-over" dessine par dessus (normal)
            ctx.globalCompositeOperation = "source-over";
            ctx.lineWidth = 12; // Taille normale du trait
            ctx.strokeStyle = '#2c3e50'; // Couleur du trait
        }
        // -------------------------------------------
        
        ctx.stroke(); 
        
        lastPos = pointsBuffer[pointsBuffer.length - 1];
        pointsBuffer = [];
    }

    requestAnimationFrame(drawFrame);
}


// --- GESTION DES MODES ET OUTILS ---
function setMode(mode) {
    currentMode = mode;
    document.getElementById('btnScroll').className = (mode === 'scroll') ? 'tool-btn active' : 'tool-btn';
    document.getElementById('btnWrite').className = (mode === 'write') ? 'tool-btn active' : 'tool-btn';
    
    // On affiche les outils d'écriture (crayon/gomme/palm) seulement si on est en mode "Écrire"
    const displayStyle = (mode === 'write') ? 'flex' : 'none';
    document.getElementById('writingTools').style.display = displayStyle;
    document.getElementById('palmOption').style.display = displayStyle;

    if (mode === 'write') { sheet.classList.add('write-mode'); } else { sheet.classList.remove('write-mode'); }
}

// NOUVELLE FONCTION POUR CHOIISIR CRAYON OU GOMME
function setTool(tool) {
    currentTool = tool;
    // Met à jour visuellement les boutons
    document.getElementById('btnPen').className = (tool === 'pen') ? 'tool-btn sub-tool active' : 'tool-btn sub-tool';
    document.getElementById('btnEraser').className = (tool === 'eraser') ? 'tool-btn sub-tool active' : 'tool-btn sub-tool';
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
    if (!palmRejection && e.pointerType !== 'pen' && e.pointerType !== 'touch') return; 

    e.preventDefault(); 
    isDrawing = true;
    lastPos = getPos(e);
    pointsBuffer.push(lastPos);
}

function endPosition(e) {
    if(isDrawing) {
        isDrawing = false;
        pointsBuffer = []; 
    }
}

function collectPoints(e) {
    if (!isDrawing) return;
    if (currentMode !== 'write') return;
    if (palmRejection && e.pointerType !== 'pen') return;
     if (!palmRejection && e.pointerType !== 'pen' && e.pointerType !== 'touch') return;

    e.preventDefault();

    if (e.getCoalescedEvents) {
        let events = e.getCoalescedEvents();
        for(let event of events) pointsBuffer.push(getPos(event));
    } else {
        pointsBuffer.push(getPos(e));
    }
}


// --- RESTE DU CODE (CONTENU, NAV) ---
function resizeCanvas() {
    canvas.width = sheet.clientWidth;
    canvas.height = sheet.clientHeight;
    // Les propriétés de style de trait sont maintenant gérées dans drawFrame
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
    // On réinitialise le canvas et le mode de fusion
    setTimeout(() => { 
        resizeCanvas(); 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        pointsBuffer = [];
        // Important : reset du mode de composition par défaut après un clear
        ctx.globalCompositeOperation = "source-over";
    }, 50);

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
// Le bouton "Effacer" efface tout d'un coup
function clearCanvas() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    pointsBuffer = [];
}

window.onload = init;
