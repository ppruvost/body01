// Compatible code version for three.js r71 written by ppruvost github.com pour bien-etre-geobiologie.fr
// SYSTÈME UNIVERSEL MÉRIDIENS 3D avec 7 chakras

// Déclaration des variables globales nécessaires
var BODY_CENTERS = (typeof BODY_CENTERS !== 'undefined') ? BODY_CENTERS : {};
var SPECIAL_CURVES = (typeof SPECIAL_CURVES !== 'undefined') ? SPECIAL_CURVES : {};

// Initialisation des centres du corps et des chakras
Object.assign(BODY_CENTERS, {

    // Chakras / Axe central
    couronne: { x: 0, y: 68, z: 0 },
    troisiemeOeil: { x: 0, y: 60, z: 0 },
    gorge: { x: 0, y: 25, z: 0 },
    coeur: { x: 0, y: 18, z: 0 },
    plexusSolaire: { x: 0, y: 12, z: 0 },
    sacre: { x: 0, y: 6, z: 0 },
    racine: { x: 0, y: 0, z: 0 },

    // Bras
    hautBrasDroit: { x: -3, y: 30, z: 0 },
    hautBrasGauche: { x: 3, y: 30, z: 0 },
    avantBrasDroit: { x: -5, y: 18, z: 0 },
    avantBrasGauche: { x: 5, y: 18, z: 0 },

    // MAINS – surface anatomique
    mainSurfaceDroite: { x: -6, y: 12, z: 2.5 },
    mainSurfaceGauche: { x: 6, y: 12, z: 2.5 },

    // Jambes
    hautJambeDroite: { x: -1.5, y: -5, z: 0 },
    hautJambeGauche: { x: 1.5, y: -5, z: 0 },
    basJambeDroite: { x: -1.5, y: -10, z: 0 },
    basJambeGauche: { x: 1.5, y: -10, z: 0 },

    // PIEDS – surface anatomique
    piedSurfaceDroit: { x: -1.5, y: -12, z: 3 },
    piedSurfaceGauche: { x: 1.5, y: -12, z: 3 }

});

// Initialisation des courbes spéciales
Object.assign(SPECIAL_CURVES, {    
    "vc1-vc2": "(1.1;1.4;0.9|0|1|1.1|3.2)",
    "gi15-gi16": "(0.4;0.9;0.4|0|1|1.3|3.8)",
    "gi15-r-gi16-r": "(0.4;0.9;0.4|0|1|1.3|3.8)",
    "gi16-gi17": "(0.3;1.1;0.6|0|1|1.4|4.2)",
    "gi16-r-gi17-r": "(0.3;1.1;0.6|0|1|1.4|4.2)",
    "p2-p3": "(0.6;1.4;0.6|0|1|1.8|4.7)",
    "p2-r-p3-r": "(0.6;1.4;0.6|0|1|1.8|4.7)"
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
        peakFactor: parseFloat(parts[3]) || 1.2,
        parabolaFactor: parseFloat(parts[4]) || 3.5
    };
}
// Fonction pour récupérer les profils spéciaux
function getSpecialCurveProfile(p1, p2) {
    var key1 = p1.name + "-" + p2.name;
    var key2 = p2.name + "-" + p1.name;
    if (SPECIAL_CURVES[key1]) return parseElevationString(SPECIAL_CURVES[key1]);
    if (SPECIAL_CURVES[key2]) return parseElevationString(SPECIAL_CURVES[key2]);
    return null;
}
// Fonction pour déterminer le centre du corps
function getBodyCenterKey(p1, p2) {

    // PIEDS
    if (p1.y <= -10 || p2.y <= -10) {
        if (p1.x < 0 || p2.x < 0) return "piedSurfaceDroit";
        return "piedSurfaceGauche";
    }

    // BAS JAMBE
    if (p1.y <= -6 || p2.y <= -6) {
        if (p1.x < 0 || p2.x < 0) return "basJambeDroite";
        return "basJambeGauche";
    }

    // MAINS
    if (p1.y <= 12 || p2.y <= 12) {
        if (p1.x < 0 || p2.x < 0) return "mainSurfaceDroite";
        return "mainSurfaceGauche";
    }

    // BRAS
    if (p1.y >= 18 || p2.y >= 18) {
        if (p1.x < 0 || p2.x < 0) return "hautBrasDroit";
        return "hautBrasGauche";
    }

    return "coeur";
}

// Fonction pour calculer une courbe méridienne
function calculateInclinedParabolicCurve(t, p1, p2, specialProfile, centerKey) {

    var BODY_CENTER = BODY_CENTERS[centerKey] || { x: 0, y: 0, z: 0 };

    var x = p1.x + (p2.x - p1.x) * t;
    var y = p1.y + (p2.y - p1.y) * t;
    var z = p1.z + (p2.z - p1.z) * t;

    var ventreDos      = specialProfile ? specialProfile.ventreDos      : 1;
    var peakFactor     = specialProfile ? specialProfile.peakFactor     : 1.2;
    var parabolaFactor = specialProfile ? specialProfile.parabolaFactor : 3.5;

    var parabola = Math.pow(Math.sin(Math.PI * t), 0.75) * ventreDos;
    var peak = peakFactor * parabola * parabolaFactor;

    var dirX = x - BODY_CENTER.x;
    var dirY = y - BODY_CENTER.y;
    var dirZ = z - BODY_CENTER.z;

    var length = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
    if (length === 0) length = 0.0001;

    dirX /= length;
    dirY /= length;
    dirZ /= length;

    // Projection extérieure
    if (centerKey.indexOf("piedSurface") !== -1 ||
        centerKey.indexOf("mainSurface") !== -1) {

        // Projection verticale douce
        dirX = 0;
        dirY = 0;
        dirZ = Math.abs(dirZ); // OPTION PRO
    }

    x += dirX * peak;
    y += dirY * peak;
    z += dirZ * peak;

    // Micro élévations
    if (specialProfile) {
        var spread = 2.0;

        var influence25 = Math.exp(-Math.pow((t - 0.25) * spread, 2)) * specialProfile.z25;
        var influence50 = Math.exp(-Math.pow((t - 0.50) * spread, 2)) * specialProfile.z50;
        var influence75 = Math.exp(-Math.pow((t - 0.75) * spread, 2)) * specialProfile.z75;

        z += influence25 + influence50 + influence75;
    }

    return { x: x, y: y, z: z };
}

// CONSTRUCTION DES COURBES

function buildMeridianCurves(scene) {

    if (!ACU_POINTS) {
        console.error("ACU_POINTS non défini.");
        return;
    }

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

        for (var i = 0; i < points.length - 1; i++) {

            var p1 = points[i];
            var p2 = points[i + 1];

            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));

            var specialProfile = getSpecialCurveProfile(p1, p2);
            var centerKey = getBodyCenterKey(p1, p2);

            var segments = 80;

            for (var s = 1; s <= segments; s++) {
                var t = s / segments;
                var point = calculateInclinedParabolicCurve(t, p1, p2, specialProfile, centerKey);
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
