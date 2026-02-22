// Compatible code version for three.js r71 written by ppruvost github.com pour bien-etre-geobiologie.fr
// SYSTÈME UNIVERSEL MÉRIDIENS 3D avec 7 chakras

// Déclaration des variables globales nécessaires
var BODY_CENTERS = (typeof BODY_CENTERS !== 'undefined') ? BODY_CENTERS : {};
var SPECIAL_CURVES = (typeof SPECIAL_CURVES !== 'undefined') ? SPECIAL_CURVES : {};

// Initialisation des centres du corps et des chakras
Object.assign(BODY_CENTERS, {
    couronne: { x: 0, y: 68, z: 0 },
    troisiemeOeil: { x: 0, y: 60, z: 0 },
    gorge: { x: 0, y: 27, z: 0 },
    coeur: { x: 0, y: 18, z: 0 },
    plexusSolaire: { x: 0, y: 12, z: 0 },
    sacre: { x: 0, y: 6, z: 0 },
    racine: { x: 0, y: 0, z: 0 },
    tete: { x: 0, y: 64.5, z: 0 },
    hautBrasDroit: { x: -3, y: 30, z: 0 },
    hautBrasGauche: { x: 3, y: 30, z: 0 },
    avantBrasDroit: { x: -5, y: 18, z: 0 },
    avantBrasGauche: { x: 5, y: 18, z: 0 },
    mainDroite: { x: -6, y: 12, z: 0 },
    mainGauche: { x: 6, y: 12, z: 0 },
    hautJambeDroite: { x: -1.5, y: -29, z: 0 },
    hautJambeGauche: { x: 1.5, y: -29, z: 0 },
    basJambeDroite: { x: -1.5, y: -66, z: 0 },
    basJambeGauche: { x: 1.5, y: -66, z: 0 },
    piedDroit: { x: -1.5, y: -89, z: 1 },
    piedGauche: { x: 1.5, y: -89, z: 1 }
});

// Initialisation des courbes spéciales
Object.assign(SPECIAL_CURVES, {    
    "vc1-vc2": "(1.1;1.4;0.9|0|1|1.1|3.2)",
    "e19-e20": "(0.10;0.25;0.10|0|1.4|1.6|3.8)",
    "e19-r-e20-r": "(0.10;0.25;0.10|0|1.4|1.6|3.8)",
    "vc13-vc12": "(0.15;0.35;0.15|0|1.6|1.8|4.2)",
    "vc13-r-vc12-r": "(0.15;0.35;0.15|0|1.6|1.8|4.2)"
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
    if (p1.y >= 70 || p2.y >= 70) return "couronne";
    if (p1.y >= 62 || p2.y >= 62) return "troisiemeOeil";
    if (p1.y >= 27 || p2.y >= 27) return "gorge";
    if ((p1.y >= 16 && p1.y <= 20) || (p2.y >= 16 && p2.y <= 20)) return "coeur";
    if ((p1.y >= 10 && p1.y <= 14) || (p2.y >= 10 && p2.y <= 14)) return "plexusSolaire";
    if ((p1.y >= 4 && p1.y <= 8) || (p2.y >= 4 && p2.y <= 8)) return "sacre";
    if (p1.y <= 2 || p2.y <= 2) return "racine";

    if (p1.y >= 24 || p2.y >= 24) return "tete";

    if (p1.name.includes("r") || p2.name.includes("r")) {
        if (p1.y >= 18 && p2.y >= 18) return "hautBrasDroit";
        if (p1.y <= 12 || p2.y <= 12) return "mainDroite";
        return "avantBrasDroit";
    }

    if (p1.y >= 18 && p2.y >= 18) return "hautBrasGauche";
    if (p1.y <= 12 || p2.y <= 12) return "mainGauche";
    return "avantBrasGauche";
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
    var ventreDos      = specialProfile ? specialProfile.ventreDos      : 1;
    var peakFactor     = specialProfile ? specialProfile.peakFactor     : 1.2;
    var parabolaFactor = specialProfile ? specialProfile.parabolaFactor : 3.5;

    // 3️⃣ Courbe
    var parabola = Math.pow(Math.sin(Math.PI * t), 0.75) * ventreDos;
    var peak = peakFactor * parabola * parabolaFactor;

    // 4️⃣ Direction vers l'extérieur du corps
    var dirX = x - BODY_CENTER.x;
    var dirY = y - BODY_CENTER.y;
    var dirZ = z - BODY_CENTER.z;

    var length = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
    if (length === 0) length = 0.0001;

    dirX /= length;
    dirY /= length;
    dirZ /= length;

    // 5️⃣ Projection extérieure
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

// Fonction principale pour construire les courbes méridiennes
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
