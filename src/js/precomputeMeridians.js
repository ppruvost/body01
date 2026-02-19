// Compatible code version for three.js r71 written by ppruvost github.com for bien-etre-geobiologie.fr
// SYSTÈME UNIVERSEL MÉRIDIENS 3D avec 7 chakras

// Rayon des sphères des points
var sphereRadius = 0.3;

// Centres du corps par partie anatomique et chakras
var BODY_CENTERS = {
    // 7 Chakras principaux (positions le long de la colonne vertébrale)
    couronne: { x: 0, y: 42, z: 0 },       // Chakra couronne (sommet du crâne)
    troisiemeOeil: { x: 0, y: 36, z: 0 },  // Chakra du 3ème œil (entre les sourcils)
    gorge: { x: 0, y: 28, z: 0 },           // Chakra de la gorge
    coeur: { x: 0, y: 18, z: 0 },            // Chakra du cœur
    plexusSolaire: { x: 0, y: 12, z: 0 },  // Chakra du plexus solaire
    sacre: { x: 0, y: 6, z: 0 },            // Chakra sacré
    racine: { x: 0, y: 0, z: 0 },           // Chakra racine (périnée)

    // Tête
    tete: { x: 0, y: 64.5, z: 0 },

    // Bras
    hautBrasDroit: { x: -3, y: 30, z: 0 },
    hautBrasGauche: { x: 3, y: 30, z: 0 },
    avantBrasDroit: { x: -5, y: 18, z: 0 },
    avantBrasGauche: { x: 5, y: 18, z: 0 },

    // Mains
    mainDroite: { x: -6, y: 12, z: 0 },
    mainGauche: { x: 6, y: 12, z: 0 },

    // Jambes
    hautJambeDroite: { x: -1.5, y: -5, z: 0 },
    hautJambeGauche: { x: 1.5, y: -5, z: 0 },
    basJambeDroite: { x: -1.5, y: -9, z: 0 },
    basJambeGauche: { x: 1.5, y: -9, z: 0 },

    // Pieds
    piedDroit: { x: -1.5, y: -12, z: 1 },
    piedGauche: { x: 1.5, y: -12, z: 1 }
};

// ------------------------------------------------------
// Définition des cas particuliers de courbes
// Format : "(z25;z50;z75|angle|ventreDos|peakFactor|parabolaFactor)"
// ------------------------------------------------------
var SPECIAL_CURVES = {
   // "p2-p3": "(1.75;2.05;0.8|0|1|1.2|3.5)",
   // "p2-r-p3-r": "(1.75;2.05;0.8|0|1|1.2|3.5)",
   // "e5-e6": "(0.2;0.4;0.2|0|1|1.3|3.6)",
   // "e5-r-e6-r": "(0.2;0.4;0.2|0|1|1.3|3.6)",
   // "e6-e7": "(0.3;0.6;0.3|0|1|1.4|3.8)",
    // "e6-r-e7-r": "(0.3;0.6;0.3|0|1|1.4|3.8)",
    "vc1-vc2": "(1.1;1.4;0.9|0|1|1.1|3.2)",
    // "gi15-gi16": "(0.8;1.2;0.7|0|1|1.0|3.0)",
    // "gi16-gi17": "(0.9;1.3;0.8|0|1|1.1|3.1)",
    // "gi15-r-gi16-r": "(0.8;1.2;0.7|0|1|1.0|3.0)",
    // "gi16-r-gi17-r": "(0.9;1.3;0.8|0|1|1.1|3.1)"
};

// ------------------------------------------------------
// Parser de paramètres
// ------------------------------------------------------
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

// ------------------------------------------------------
// Récupération profil spécial
// ------------------------------------------------------
function getSpecialCurveProfile(p1, p2) {
    var key1 = p1.name + "-" + p2.name;
    var key2 = p2.name + "-" + p1.name;
    if (SPECIAL_CURVES[key1]) return parseElevationString(SPECIAL_CURVES[key1]);
    if (SPECIAL_CURVES[key2]) return parseElevationString(SPECIAL_CURVES[key2]);
    return null;
}

// ------------------------------------------------------
// Détermine le centre du corps en fonction des points
// ------------------------------------------------------
function getBodyCenterKey(p1, p2) {
    // Logique pour les chakras
    if (p1.y >= 40 || p2.y >= 40) return "couronne";
    else if (p1.y >= 34 || p2.y >= 34) return "troisiemeOeil";
    else if (p1.y >= 26 || p2.y >= 26) return "gorge";
    else if (p1.y >= 16 || p2.y >= 16) return "coeur";
    else if (p1.y >= 10 || p2.y >= 10) return "plexusSolaire";
    else if (p1.y >= 4 || p2.y >= 4) return "sacre";
    else if (p1.y >= 0 || p2.y >= 0) return "racine";

    // Logique pour la tête
    else if (p1.y >= 24 || p2.y >= 24) return "tete";

    // Logique pour les bras droits
    else if (p1.name.includes("r") || p2.name.includes("r")) {
        if (p1.y >= 18 && p2.y >= 18) return "hautBrasDroit";
        else if (p1.y <= 12 || p2.y <= 12) return "mainDroite";
        else return "avantBrasDroit";
    }
    // Logique pour les bras gauches
    else if (p1.y >= 18 && p2.y >= 18) return "hautBrasGauche";
    else if (p1.y <= 12 || p2.y <= 12) return "mainGauche";
    else return "avantBrasGauche";

    // Logique pour les jambes droites
    else if (p1.name.includes("r") || p2.name.includes("r")) {
        if (p1.y >= -5 || p2.y >= -5) return "hautJambeDroite";
        else if (p1.y <= -9 || p2.y <= -9) return "basJambeDroite";
        else return "piedDroit";
    }
    // Logique pour les jambes gauches
    else {
        if (p1.y >= -5 || p2.y >= -5) return "hautJambeGauche";
        else if (p1.y <= -9 || p2.y <= -9) return "basJambeGauche";
        else return "piedGauche";
    }
}

// ------------------------------------------------------
// CALCUL UNIVERSAL COURBE MÉRIDIEN
// ------------------------------------------------------
function calculateInclinedParabolicCurve(t, p1, p2, specialProfile, bodyCenterKey) {
    var x = p1.x + (p2.x - p1.x) * t;
    var y = p1.y + (p2.y - p1.y) * t;
    var z = p1.z + (p2.z - p1.z) * t;

    var ventreDos = specialProfile ? specialProfile.ventreDos : 1;
    var peakFactor = specialProfile ? specialProfile.peakFactor : 1.2;
    var parabolaFactor = specialProfile ? specialProfile.parabolaFactor : 3.5;

    var parabola = Math.pow(Math.sin(Math.PI * t), 0.75) * ventreDos;
    var peak = peakFactor * parabola * parabolaFactor;

    var center = BODY_CENTERS[bodyCenterKey] || BODY_CENTERS.coeur;
    var dirX = x - center.x;
    var dirY = y - center.y;
    var dirZ = z - center.z;

    var length = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
    if (length === 0) length = 0.0001;

    dirX /= length;
    dirY /= length;
    dirZ /= length;

    x += dirX * peak;
    y += dirY * peak;
    z += dirZ * peak;

    if (specialProfile) {
        var spread = 2.0;
        z += Math.exp(-Math.pow((t - 0.25) * spread, 2)) * specialProfile.z25 +
            Math.exp(-Math.pow((t - 0.50) * spread, 2)) * specialProfile.z50 +
            Math.exp(-Math.pow((t - 0.75) * spread, 2)) * specialProfile.z75;
    }

    return { x: x, y: y, z: z };
}

// ------------------------------------------------------
// Construction des courbes méridiennes
// ------------------------------------------------------
function buildMeridianCurves(scene) {
    if (!ACU_POINTS) {
        console.error("ACU_POINTS n'est pas défini.");
        return;
    }

    var meridianGroups = {};
    ACU_POINTS.forEach(function(p) {
        if (!meridianGroups[p.meridian]) meridianGroups[p.meridian] = [];
        meridianGroups[p.meridian].push(p);
    });

    Object.keys(meridianGroups).forEach(function(meridian) {
        var points = meridianGroups[meridian];
        points.sort(function(a, b) {
            var na = parseInt(a.name.replace(/\D/g, ''));
            var nb = parseInt(b.name.replace(/\D/g, ''));
            return na - nb;
        });

        for (var i = 0; i < points.length - 1; i++) {
            var p1 = points[i];
            var p2 = points[i + 1];
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));

            var specialProfile = getSpecialCurveProfile(p1, p2);
            var segments = 80;
            var bodyCenterKey = getBodyCenterKey(p1, p2);

            for (var s = 1; s <= segments; s++) {
                var t = s / segments;
                var point = calculateInclinedParabolicCurve(t, p1, p2, specialProfile, bodyCenterKey);
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
    });
}
