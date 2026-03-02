// Compatible code version for three.js r71 written by ppruvost github.com pour bien-etre-geobiologie.fr
// SYSTÈME UNIVERSEL MÉRIDIENS 3D avec 7 chakras

// Déclaration des variables globales nécessaires
var BODY_CENTERS = (typeof BODY_CENTERS !== 'undefined') ? BODY_CENTERS : {};
var SPECIAL_CURVES = (typeof SPECIAL_CURVES !== 'undefined') ? SPECIAL_CURVES : {};

// Initialisation des centres du corps et des chakras
Object.assign(BODY_CENTERS, {
    couronne: { x: 0, y: 0, z: 0 },
    troisiemeOeil: { x: 0, y: 0, z: 0 },
    gorge: { x: 0, y: 0, z: 0 },
    Cœur: { x: 0, y: 0, z: 0 },
    plexusSolaire: { x: 0, y: 0, z: 0 },
    sacre: { x: 0, y: 0, z: 0 },
    racine: { x: 0, y: 0, z: 0 },        
        
    hautBrasDroit: { x: 0, y: 0, z: 0 },
    hautBrasGauche: { x: 0, y: 0, z: 0 },
    
    avantBrasDroit: { x: 0, y: 0, z: 0 },
    avantBrasGauche: { x: 0, y: 0, z: 0 },
    
    mainDroite: { x: 0, y: 0, z: 0 },
    mainGauche: { x: 0, y: 0, z: 0 },
    
    hautJambeDroiteSup: { x: 0, y: 0, z: 0 },
    hautJambeDroiteInf: { x: 0, y: 0, z: 0 },
    hautJambeGaucheSup: { x: 0, y: 0, z: 0 },
    hautJambeGaucheInf: { x: 0, y: 0, z: 0 },
    
    basJambeDroiteSup: { x: 0, y: 0, z: 0 },
    basJambeDroiteInf: { x: 0, y: 0, z: 0 },
    basJambeGaucheSup: { x: 0, y: 0, z: 0 },
    basJambeGaucheInf: { x: 0, y: 0, z: 0 },
    
    piedDroit: { x: 0, y: 0, z: 0 },
    piedGauche: { x: 0, y: 0, z: 0 }
});

// Initialisation des courbes spéciales
Object.assign(SPECIAL_CURVES, {    
    "vc1-vc2": "(1.1;1.4;0.9|0|1|1.1|3.2)",
    
    "e19-e20": "(0.10;0.25;0.10|0|1.4|1.6|3.8)",    
    "e19-r-e20-r": "(0.10;0.25;0.10|0|1.4|1.6|3.8)",
    
    "vc13-vc12": "(0.15;0.35;0.15|0|1.6|1.6|4.2)",
    "vc13-r-vc12-r": "(0.15;0.35;0.15|0|1.6|1.8|4.2)",
    
    "p2-p3": "(1.6;1.9;1.2|0|1|1.15|3.4)",
    "p2-r-p3-r": "(1.6;1.9;1.2|0|1|1.15|3.4)",
    
    "Cœur-global": "(0.4;0.8;0.4|-60|1|1.4|3.2)",    // seul paramètre angle à adapter si besoin pour méridien du coeur

    "v10-v41": "(-0.85;8.49;1.05|0|1|2|3.2)",
    "v10-r-v41-r": "(0.85;8.49;1.05|0|1|2|3.2)",

    "v10-v11": "(0;5.9;0.1|0|1|2|3.2)",
    "v10-r-v11-r": "(0;5.9;0.1|0|1|2|3.2)"
});

// Fonction pour analyser les paramètres des courbes spéciales
function parseElevationString(str) {
    if (!str) return null;
    str = str.replace(/[()]/g, "");
    var parts = str.split("|");
    var elevations = parts[0].split(";");
    return {
        z25: parseFloat(elevations[0]) || 0,
        z50: parseFloat(elevations[1]) || 0,
        z75: parseFloat(elevations[2]) || 0,
        angleDegrees: parseFloat(parts[1]) || 0,
        ventreDos: parseInt(parts[2]) || 1,
        peakFactor: parseFloat(parts[3]) || 0.9,
        parabolaFactor: parseFloat(parts[4]) || 2.5
    };
}

// Fonction pour récupérer un profil spécial
function getSpecialCurveProfile(p1, p2) {
    var key1 = p1.name + "-" + p2.name;
    var key2 = p2.name + "-" + p1.name;
    if (SPECIAL_CURVES[key1]) return parseElevationString(SPECIAL_CURVES[key1]);
    if (SPECIAL_CURVES[key2]) return parseElevationString(SPECIAL_CURVES[key2]);
    return null;
}

// Fonction pour déterminer le centre du corps
function getBodyCenterKey(p1, p2) {

    function inZone(p, min, max) {
        return p.y >= min && p.y <= max;
    }

    function isRight(p) {
        return p.x < 0;
    }

    function isLeft(p) {
        return p.x > 0;
    }

    // Couronne
    if (inZone(p1, 68, 100) || inZone(p2, 71, 80))
        return "couronne";

    // Troisième œil
    if (inZone(p1, 58, 68) || inZone(p2, 63, 71))
        return "troisiemeOeil";

    // Gorge
    if (inZone(p1, 26, 34) || inZone(p2, 49, 63))
        return "gorge";

    // Cœur
    if (inZone(p1, 16, 26) || inZone(p2, 31, 49))
        return "Cœur";

    // Plexus solaire
    if (inZone(p1, 10, 16) || inZone(p2, 14, 31))
        return "plexusSolaire";

    // Sacré
    if (inZone(p1, 2, 10) || inZone(p2, 7, 14))
        return "sacre";

    // Racine
    if (inZone(p1, -10, 2) || inZone(p2, -13, 7))
        return "racine";

    // Haut bras droit
    if (
        (inZone(p1, 16, 33) && isRight(p1)) ||
        (inZone(p2, 16, 33) && isRight(p2))
    )
        return "hautBrasDroit";

        // Haut bras gauche
    if (
        (inZone(p1, 16, 33) && isLeft(p1)) ||
        (inZone(p2, 16, 33) && isLeft(p2))
    )
        return "hautBrasGauche";
    
        // Avant bras droit
    if (
        (inZone(p1, -6, 16) && isRight(p1)) ||
        (inZone(p2, -6, 16) && isRight(p2))
    )
        return "avantBrasDroit";

        // Avant bras gauche
    if (
        (inZone(p1, -6, 16) && isLeft(p1)) ||
        (inZone(p2, -6, 16) && isLeft(p2))
    )
        return "avantBrasGauche";

    // Main droite
    if (
        (inZone(p1, -25, -6) && isRight(p1)) ||
        (inZone(p2, -25, -6) && isRight(p2))
    )
        return "mainDroite";

        // Main gauche
    if (
        (inZone(p1, -25, -6) && isLeft(p1)) ||
        (inZone(p2, -25, -6) && isLeft(p2))
    )
        return "mainGauche";
    
    // Haut jambe droite Sup
    if (
        (inZone(p1, -25, -10) && isRight(p1)) ||
        (inZone(p2, -25, -10) && isRight(p2))
    )
        return "hautJambeDroiteSup";

     // Haut jambe droite Inf
    if (
        (inZone(p1, -40, -25) && isRight(p1)) ||
        (inZone(p2, -40, -25) && isRight(p2))
    )
        return "hautJambeDroiteInf";

    // Haut jambe gauche Sup
    if (
        (inZone(p1, -25, -10) && isLeft(p1)) ||
        (inZone(p2, -25, -10) && isLeft(p2))
    )
        return "hautJambeGaucheSup";

    // Haut jambe gauche Inf
    if (
        (inZone(p1, -40, -25) && isLeft(p1)) ||
        (inZone(p2, -40, -25) && isLeft(p2))
    )
        return "hautJambeGaucheInf";
   
    // Bas jambe droite Sup
    if (
        (inZone(p1, -66, -40) && isRight(p1)) ||
        (inZone(p2, -66, -40) && isRight(p2))
    )
        return "basJambeDroiteSup";

     // Bas jambe droite Inf
    if (
        (inZone(p1, -80, -66) && isRight(p1)) ||
        (inZone(p2, -80, -66) && isRight(p2))
    )
        return "basJambeDroiteInf";

    // Bas jambe gauche Sup
    if (
        (inZone(p1, -66, -40) && isLeft(p1)) ||
        (inZone(p2, -66, -40) && isLeft(p2))
    )
        return "basJambeGaucheSup";

    // Bas jambe gauche Inf
    if (
        (inZone(p1, -80, -66) && isLeft(p1)) ||
        (inZone(p2, -80, -66) && isLeft(p2))
    )
        return "basJambeGaucheInf";

    // Pied droit
    if (
        (inZone(p1, -96, -80) && isRight(p1)) ||
        (inZone(p2, -96, -80) && isRight(p2))
    )
        return "piedDroit";

    // Pied gauche
    if (
        (inZone(p1, -96, -80) && isLeft(p1)) ||
        (inZone(p2, -96, -80) && isLeft(p2))
    )
        return "piedGauche";

    return null;
}

// Fonction pour calculer une courbe méridienne
function calculateInclinedParabolicCurve(t, p1, p2, specialProfile, centerKey) {
    // Récupération du centre correspondant au segment
    var BODY_CENTER = BODY_CENTERS[centerKey] || { x: 0, y: 0, z: 0 };

    // 1️⃣ Position linéaire
    var x = p1.x + (p2.x - p1.x) * t;
    var y = p1.y + (p2.y - p1.y) * t;
    var z = p1.z + (p2.z - p1.z) * t;

    // 2️⃣ Paramètres
    var ventreDos = specialProfile ? specialProfile.ventreDos : 1;
    if (centerKey === "piedDroit" || centerKey === "piedGauche") {
        ventreDos = 1; // mettre -1 si projection part dessous
    }
    var peakFactor     = specialProfile ? specialProfile.peakFactor     : 1.2;
    var parabolaFactor = specialProfile ? specialProfile.parabolaFactor : 3.5;

    // 3️⃣ Courbe
    var parabola = Math.pow(Math.sin(Math.PI * t), 0.75) * ventreDos;
    var peak = peakFactor * parabola * parabolaFactor;

    // 4️⃣ Direction initiale (utile pour zones non bras)
    var dirX = x - BODY_CENTER.x;
    var dirY = y - BODY_CENTER.y;
    var dirZ = z - BODY_CENTER.z;

    var length = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
    if (length === 0) length = 0.0001;

    dirX /= length;
    dirY /= length;
    dirZ /= length;

    // 🔴 Rotation angulaire si profil spécial Cœur
    if (specialProfile && specialProfile.angleDegrees !== 0) {

        var angle = specialProfile.angleDegrees;

        // 🔁 Inversion automatique pour le côté gauche
        if (p1.x > 0) {   // côté gauche (tes x positifs)
            angle = -angle;
        }

        var angleRad = angle * Math.PI / 180;

        var cos = Math.cos(angleRad);
        var sin = Math.sin(angleRad);

        // Rotation autour de l’axe Y
        var rotatedX = dirX * cos - dirZ * sin;
        var rotatedZ = dirX * sin + dirZ * cos;

        dirX = rotatedX;
        dirZ = rotatedZ;
    }

    // 5️⃣ Application de la projection
    x += dirX * peak;
    y += dirY * peak;
    z += dirZ * peak;

    // 6️⃣ Micro-élévations locales
    if (specialProfile) {
        var spread = 2.0;
        var influence25 = Math.exp(-Math.pow((t - 0.25) * spread, 2)) * specialProfile.z25;
        var influence50 = Math.exp(-Math.pow((t - 0.50) * spread, 2)) * specialProfile.z50;
        var influence75 = Math.exp(-Math.pow((t - 0.75) * spread, 2)) * specialProfile.z75;

        z += influence25 + influence50 + influence75;
    }

    return { x: x, y: y, z: z };
}

// Définition des centres des chakras selon body
function computeChakraCenters() {

    var chakraZones = {
        couronne:        { minY: 68,  maxY: 100 },
        troisiemeOeil:   { minY: 58,  maxY: 68 },
        gorge:           { minY: 26,  maxY: 34 },
        Cœur:           { minY: 16,  maxY: 26 },
        plexusSolaire:   { minY: 10,  maxY: 16 },
        sacre:           { minY: 2,   maxY: 10 },
        racine:          { minY: -10, maxY: 2 },

        hautBrasDroit:          { minY: 16, maxY: 33 },
        hautBrasGauche:          { minY: 16, maxY: 33 },
        avantBrasDroit:          { minY: -6, maxY: 16 },
        avantBrasGauche:          { minY: -6, maxY: 16 },

        mainDroite:          { minY: -25, maxY: -6 },
        mainGauche:          { minY: -25, maxY: -6 },
        
        hautJambeDroiteSup:   { minY: -25,  maxY: -10 },
        hautJambeDroiteInf:   { minY: -40,  maxY: -25 },
        hautJambeGaucheSup:   { minY: -25,  maxY: -10 },
        hautJambeGaucheInf:   { minY: -40,  maxY: -10 },

        basJambeDroiteSup:   { minY: -66,  maxY: -40 },
        basJambeDroiteInf:   { minY: -80,  maxY: -66 },
        basJambeGaucheSup:   { minY: -66,  maxY: -40 },
        basJambeGaucheInf:   { minY: -80,  maxY: -66 },

        piedDroit:   { minY: -96,  maxY: -80 },
        piedGauche:   { minY: -96,  maxY: -80 },
    };

    Object.keys(chakraZones).forEach(function(key) {

        var zone = chakraZones[key];

        var filtered = ACU_POINTS.filter(function(p) {
            return p.y >= zone.minY && p.y <= zone.maxY;
        });

        if (filtered.length === 0) return;

        var sumX = 0, sumY = 0, sumZ = 0;

        filtered.forEach(function(p) {
            sumX += p.x;
            sumY += p.y;
            sumZ += p.z;
        });

        BODY_CENTERS[key] = {
            x: sumX / filtered.length,
            y: sumY / filtered.length,
            z: sumZ / filtered.length
        };

        // Décalage spécifique chakra couronne vers l’arrière
        if (key === "couronne") {
            BODY_CENTERS[key].z -= 5;   // recule de 5 unités
        }

        // Décalage spécifique du chakra Cœur vers l’arrière
        if (key === "Cœur") {
            BODY_CENTERS[key].z = -3;
        }
        
    });
}

function drawCurveBetween(p1, p2, meridian, scene) {

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));

    var specialProfile = getSpecialCurveProfile(p1, p2);

    // Gestion globale du méridien du cœur
    if (!specialProfile && p1.meridian.indexOf("Cœur") === 0) {

        var n1 = parseInt(p1.name.replace(/\D/g, ''));
        var n2 = parseInt(p2.name.replace(/\D/g, ''));

        if (n1 >= 1 && n2 >= 1) {
            specialProfile = parseElevationString(SPECIAL_CURVES["Cœur-global"]);
        }
    }

    var bodyCenterKey = getBodyCenterKey(p1, p2);
    var segments = 80;

    for (var s = 1; s <= segments; s++) {
        var t = s / segments;
        var point = calculateInclinedParabolicCurve(
            t, p1, p2, specialProfile, bodyCenterKey
        );
        geometry.vertices.push(new THREE.Vector3(point.x, point.y, point.z));
    }

    geometry.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));

    var material = new THREE.LineBasicMaterial({
        color: getMeridianColor(meridian),
        transparent: true,
        opacity: 0.75
    });

    var line = new THREE.Line(geometry, material);
    scene.add(line);
}
        
function buildMeridianCurves(scene) {

    if (!ACU_POINTS) {
        console.error("ACU_POINTS n'est pas défini.");
        return;
    }

    computeChakraCenters();

    var meridianGroups = {};

    ACU_POINTS.forEach(function(p) {
        if (!meridianGroups[p.meridian])
            meridianGroups[p.meridian] = [];
        meridianGroups[p.meridian].push(p);
    });

    Object.keys(meridianGroups).forEach(function(meridian) {

        var points = meridianGroups[meridian];

        points.sort(function(a, b) {
            var na = parseInt(a.name.replace(/\D/g, ''));
            var nb = parseInt(b.name.replace(/\D/g, ''));
            return na - nb;
        });

        // 🔥 BIFURCATION VESSIE GAUCHE
        if (meridian === "Vessie") {

            var v10 = points.find(p => p.name === "v10");
            var v11 = points.find(p => p.name === "v11");
            var v41 = points.find(p => p.name === "v41");

            if (v10 && v11) drawCurveBetween(v10, v11, meridian, scene);
            if (v10 && v41) drawCurveBetween(v10, v41, meridian, scene);
        }

        // 🔥 BIFURCATION VESSIE DROITE
        if (meridian === "Vessie-r") {

            var v10r = points.find(p => p.name === "v10-r");
            var v11r = points.find(p => p.name === "v11-r");
            var v41r = points.find(p => p.name === "v41-r");

            if (v10r && v11r) drawCurveBetween(v10r, v11r, meridian, scene);
            if (v10r && v41r) drawCurveBetween(v10r, v41r, meridian, scene);
        }

        // 🔁 Boucle normale
        for (var i = 0; i < points.length - 1; i++) {

            var p1 = points[i];
            var p2 = points[i + 1];

            // On saute v10 car déjà géré
            if (
                (meridian === "Vessie" && p1.name === "v10") ||
                (meridian === "Vessie-r" && p1.name === "v10-r")
            ) {
                continue;
            }

            drawCurveBetween(p1, p2, meridian, scene);
        }

    });
}
