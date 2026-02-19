// Compatible code version for three.js r71 written by ppruvost github.com for bien-etre-geobiologie.fr
// SYSTÈME UNIVERSEL MÉRIDIENS 3D

// Rayon des sphères des points
var sphereRadius = 0.3;

// Centres du corps par partie anatomique
var BODY_CENTERS = {
    // Torse (centre par défaut)
    torse: { x: 0, y: 22, z: 0 },

    // Tête
    tete: { x: 0, y: 64.5, z: 0 },

    // Bras
    hautBrasDroit: { x: -3, y: 6, z: 0 },
    hautBrasGauche: { x: 3, y: 6, z: 0 },
    avantBrasDroit: { x: -5, y: 3, z: 0 },
    avantBrasGauche: { x: 5, y: 3, z: 0 },

    // Mains
    mainDroite: { x: -6, y: 0, z: 0 },
    mainGauche: { x: 6, y: 0, z: 0 },

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
    "p2-p3": "(1.75;2.05;0.8|0|1|1.2|3.5)",
    "p2-r-p3-r": "(1.75;2.05;0.8|0|1|1.2|3.5)",
    "e5-e6": "(0.2;0.4;0.2|0|1|1.3|3.6)",
    "e5-r-e6-r": "(0.2;0.4;0.2|0|1|1.3|3.6)",
    "e6-e7": "(0.3;0.6;0.3|0|1|1.4|3.8)",
    "e6-r-e7-r": "(0.3;0.6;0.3|0|1|1.4|3.8)",
    "vc1-vc2": "(1.1;1.4;0.9|0|1|1.1|3.2)",
    "vc1-r-vc2-r": "(1.1;1.4;0.9|0|1|1.1|3.2)",
    "gi15-gi16": "(0.8;1.2;0.7|0|1|1.0|3.0)",
    "gi16-gi17": "(0.9;1.3;0.8|0|1|1.1|3.1)",
    "gi15-r-gi16-r": "(0.8;1.2;0.7|0|1|1.0|3.0)",
    "gi16-r-gi17-r": "(0.9;1.3;0.8|0|1|1.1|3.1)"
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
    // Exemple de logique pour les méridiens des bras
    if (p1.name.startsWith("GI") || p2.name.startsWith("GI")) {
        if (p1.name.includes("r") || p2.name.includes("r")) {
            if (p1.y > 0 && p2.y > 0) return "hautBrasDroit"; // Haut du bras droit
            else if (p1.y < 0) return "mainDroite"; // Main droite
            else return "avantBrasDroit"; // Avant-bras droit
        } else {
            if (p1.y > 0 && p2.y > 0) return "hautBrasGauche"; // Haut du bras gauche
            else if (p1.y < 0) return "mainGauche"; // Main gauche
            else return "avantBrasGauche"; // Avant-bras gauche
        }
    }
    // Exemple pour les méridiens des jambes
    else if (p1.name.startsWith("E") || p2.name.startsWith("E")) {
        if (p1.name.includes("r") || p2.name.includes("r")) {
            if (p1.y > -7) return "hautJambeDroite"; // Haut de jambe droite
            else return "basJambeDroite"; // Bas de jambe droite
        } else {
            if (p1.y > -7) return "hautJambeGauche"; // Haut de jambe gauche
            else return "basJambeGauche"; // Bas de jambe gauche
        }
    }
    // Exemple pour la tête
    else if (p1.y > 8 || p2.y > 8) {
        return "tete";
    }
    // Par défaut : torse
    else {
        return "torse";
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

    var center = BODY_CENTERS[bodyCenterKey] || BODY_CENTERS.torse;
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
