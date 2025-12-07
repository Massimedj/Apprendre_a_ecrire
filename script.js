// --- DONNÉES ---
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

// --- VARIABLES ---
let currentIndex = 0;
let currentList = letters;
let isUpperCase = false;
let isDrawing = false;
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const textContainer = document.getElementById('textContainer');
const sheet = document.getElementById('sheet');

// --- INITIALISATION ---
function init() {
    document.getElementById('typeSelect').addEventListener('change', changeType);
    document.getElementById('styleSelect').addEventListener('change', updateContent);
    
    // --- MODIFICATION MAJEURE ICI POUR LE STYLET ---
    // On utilise "pointer" au lieu de "mouse" ou "touch"
    // Cela permet de distinguer le doigt du stylet
    canvas.addEventListener('pointerdown', startPosition);
    canvas.addEventListener('pointerup', endPosition);
    canvas.addEventListener('pointermove', draw);
    
    // On gère aussi le cas où le stylet sort de l'écran
    canvas.addEventListener('pointercancel', endPosition);
    canvas.addEventListener('pointerout', endPosition);

    window.addEventListener('resize', () => {
        resizeCanvas();
        // Pas d'updateContent pour ne pas effacer le dessin en cours de rotation
    });
    
    updateContent(); 
}

function resizeCanvas() {
    canvas.width = sheet.clientWidth;
    canvas.height = sheet.clientHeight;
    
    ctx.lineWidth = 12; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2c3e50'; 
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
    let btn = document.getElementById('btnCase');
    btn.innerText = isUpperCase ? "Passer en Minuscules" : "Passer en Majuscules";
    updateContent();
}

function updateContent() {
    textContainer.innerHTML = ''; 
    // On efface le canvas uniquement lors d'un changement de contenu
    // resizeCanvas le fera aussi, mais par sécurité :
    setTimeout(() => {
        resizeCanvas();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 10);

    let rawText = currentList[currentIndex];
    let textToShow = rawText;
    
    if (isUpperCase) {
        textToShow = rawText.toUpperCase();
    } else {
        if(isNaN(textToShow)) textToShow = rawText.toLowerCase();
    }
    
    const fontStyle = document.getElementById('styleSelect').value;
    const fontClass = (fontStyle === 'cursif') ? 'font-cursif' : 'font-baton';

    if (fontStyle === 'cursif' && textToShow.toLowerCase().includes('f')) {
        textContainer.classList.add('spread-lines');
    } else {
        textContainer.classList.remove('spread-lines');
    }

    let repetitions = 12; 

    for (let i = 0; i < repetitions; i++) {
        let opacity = 1;
        if (i === 0) opacity = 1;         
        else if (i < 3) opacity = 0.4;    
        else opacity = 0.08;              

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
    }
}

function previousItem() {
    if (currentIndex > 0) {
        currentIndex--;
        updateContent();
    }
}

function getPos(e) {
    // Calcul précis de la position pour PointerEvent
    const rect = canvas.getBoundingClientRect();
    return { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
    };
}

// --- FONCTIONS DE DESSIN INTELLIGENTES ---

function startPosition(e) {
    // LE SECRET EST ICI :
    // Si c'est du tactile (le doigt), on ne dessine pas !
    // On laisse le navigateur gérer (ce qui permettra de scroller avec le doigt)
    if (e.pointerType === 'touch') return;

    // Si c'est un stylet ('pen') ou une souris ('mouse' pour tester sur PC), on dessine
    // On empêche le comportement par défaut (scroll, sélection) seulement si on dessine
    e.preventDefault(); 
    
    isDrawing = true;
    draw(e);
}

function endPosition() {
    isDrawing = false;
    ctx.beginPath();
}

function draw(e) {
    // Si on n'est pas en train de dessiner OU si c'est un doigt, on arrête tout
    if (!isDrawing || e.pointerType === 'touch') return;

    e.preventDefault();
    const pos = getPos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

window.onload = init;
