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
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    "Printemps", "Été", "Automne", "Hiver",
    "Soleil", "Lune", "Étoile", "Nuage", "Pluie", "Neige", "Vent",
    "Fleur", "Arbre", "Feuille", "Herbe", "Jardin",
    "Bonjour", "Bonsoir", "Merci", "Pardon", "Bravo", "Aurevoir",
    "Joie", "Rire", "Bisou", "Câlin", "Amour", "Gentil",
    "Maman", "Papa", "Bébé", "Papi", "Mamie", "Frère", "Soeur", 
    "Maison", "École", "Maîtresse", "Stylo", "Crayon", "Livre", "Cahier",
    "Table", "Chaise", "Lit", "Porte", "Jouet", "Ballon",
    "Chat", "Chien", "Lapin", "Cheval", "Vache", "Poule", "Cochon",
    "Lion", "Tigre", "Ours", "Girafe", "Éléphant", "Singe",
    "Oiseau", "Poisson", "Loup", "Renard", "Papillon",
    "Pomme", "Poire", "Banane", "Fraise", "Cerise", "Orange",
    "Carotte", "Patate", "Tomate", "Salade", "Radis",
    "Gâteau", "Chocolat", "Bonbon", "Pain", "Lait", "Eau",
    "Vélo", "Voiture", "Train", "Avion", "Bateau", "Bus"
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
    canvas.addEventListener('pointermove', draw);
    window.addEventListener('pointercancel', endPosition);
    
    window.addEventListener('resize', () => { resizeCanvas(); });
    
    // Config trait
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setMode('scroll');     
    setTool('pen');        
    updateContent(); 
}

// --- SYNTHÈSE VOCALE ---
function readContent() {
    window.speechSynthesis.cancel();
    let rawText = currentList[currentIndex];
    let utterance = new SpeechSynthesisUtterance(rawText);
    utterance.lang = 'fr-FR'; 
    utterance.rate = 0.8; 
    utterance.pitch = 1;  
    window.speechSynthesis.speak(utterance);
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

// --- DESSIN ---
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
    
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    draw(e); 
}

function endPosition() {
    isDrawing = false;
    ctx.beginPath(); 
}

function draw(e) {
    if (!isDrawing) return;
    if (currentMode !== 'write') return;
    if (palmRejection && e.pointerType !== 'pen') return;
    if (!palmRejection && e.pointerType !== 'pen' && e.pointerType !== 'touch') return;

    e.preventDefault();
    const pos = getPos(e);

    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 30; 
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = 8;  
        ctx.strokeStyle = '#2c3e50';
    }

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}


// --- NAVIGATION ---
function resizeCanvas() {
    canvas.width = sheet.clientWidth;
    canvas.height = sheet.clientHeight;
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
    setTimeout(() => { 
        resizeCanvas(); 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
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

function nextItem() { 
    if (currentIndex < currentList.length - 1) { 
        currentIndex++; 
        updateContent(); 
        // J'ai supprimé la ligne de lecture automatique ici
    } 
}

function previousItem() { 
    if (currentIndex > 0) { 
        currentIndex--; 
        updateContent(); 
        // J'ai supprimé la ligne de lecture automatique ici aussi
    } 
}

function clearCanvas() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
}

window.onload = init;
