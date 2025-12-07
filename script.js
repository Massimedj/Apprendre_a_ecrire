// --- VARIABLES GLOBALES ---
let currentMode = 'scroll';   // 'scroll' ou 'write'
let currentTool = 'pen';      // 'pen' (crayon) ou 'eraser' (gomme)
let palmRejection = false;
let isDrawing = false;

// Listes de contenu
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
    
    // Événements Pointer (Stylet/Doigt/Souris)
    canvas.addEventListener('pointerdown', startPosition);
    window.addEventListener('pointerup', endPosition);
    canvas.addEventListener('pointermove', draw);
    window.addEventListener('pointercancel', endPosition);
    
    window.addEventListener('resize', () => { resizeCanvas(); });
    
    // Configuration initiale du trait
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setMode('scroll');     
    setTool('pen');        
    updateContent(); 
}

// --- GESTION DES MODES ET OUTILS ---
function setMode(mode) {
    currentMode = mode;
    document.getElementById('btnScroll').className = (mode === 'scroll') ? 'tool-btn active' : 'tool-btn';
    document.getElementById('btnWrite').className = (mode === 'write') ? 'tool-btn active' : 'tool-btn';
    
    const displayStyle = (mode === 'write') ? 'flex' : 'none';
    document.getElementById('writingTools').style.display = displayStyle;
    document.getElementById('palmOption').style.display = displayStyle;

    if (mode === 'write') { sheet.classList.add('write-mode'); } else { sheet.classList.remove('write-mode'); }
}

function setTool(tool) {
    currentTool = tool;
    document.getElementById('btnPen').className = (tool === 'pen') ? 'tool-btn sub-tool active' : 'tool-btn sub-tool';
    document.getElementById('btnEraser').className = (tool === 'eraser') ? 'tool-btn sub-tool active' : 'tool-btn sub-tool';
}

function updatePalm() {
    palmRejection = document.getElementById('checkPalm').checked;
}

// --- FONCTIONS DE DESSIN (MÉTHODE CLASSIQUE ET FLUIDE) ---

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function startPosition(e) {
    if (currentMode !== 'write') return;
    // Vérification du stylet
    if (palmRejection && e.pointerType !== 'pen') return;
    if (!palmRejection && e.pointerType !== 'pen' && e.pointerType !== 'touch') return; 

    e.preventDefault(); 
    isDrawing = true;
    
    // On commence le tracé immédiatement
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    // Astuce : on fait un tout petit trait tout de suite pour faire un point si on tape juste
    draw(e); 
}

function endPosition() {
    isDrawing = false;
    ctx.beginPath(); // Coupe le chemin pour ne pas relier au prochain trait
}

function draw(e) {
    if (!isDrawing) return;
    if (currentMode !== 'write') return;
    if (palmRejection && e.pointerType !== 'pen') return;
    if (!palmRejection && e.pointerType !== 'pen' && e.pointerType !== 'touch') return;

    e.preventDefault();
    
    const pos = getPos(e);

    // CONFIGURATION DU STYLE (Appliquée à chaque mouvement pour être sûr)
    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 30; // Gomme un peu plus petite qu'avant (40 -> 30)
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = 8;  // Crayon plus fin (12 -> 8)
        ctx.strokeStyle = '#2c3e50';
    }

    // DESSIN DIRECT
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    // On replace le point de départ pour la suite du mouvement (lissage naturel)
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}


// --- RESTE DU CODE (CONTENU, NAV) ---
function resizeCanvas() {
    canvas.width = sheet.clientWidth;
    canvas.height = sheet.clientHeight;
    // On remet les styles de base au cas où
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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
    document.getElementById('btnCase').innerText = isUpperCase ? "miniscule" : "MAJUSCULE";
    updateContent();
}

function updateContent() {
    textContainer.innerHTML = ''; 
    // Reset complet du canvas et des modes
    setTimeout(() => { 
        resizeCanvas(); 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.globalCompositeOperation = "source-over"; // Reset mode normal
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
function clearCanvas() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
}

window.onload = init;

