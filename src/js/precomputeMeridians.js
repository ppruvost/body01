// Compatible code version for three.js r71 written by ppruvost github.com pour bien-etre-geobiologie.fr

// Déclaration des variables globales
var BODY_CENTERS = (typeof BODY_CENTERS !== 'undefined') ? BODY_CENTERS : {};
var SPECIAL_CURVES = (typeof SPECIAL_CURVES !== 'undefined') ? SPECIAL_CURVES : {};

// Initialisation des centres du corps et des chakras
Object.assign(BODY_CENTERS, {
    couronne: { x: 0, y: 68, z: 0 },
    troisiemeOeil: { x: 0, y: 60, z: 0 },
    gorge: { x: 0, y: 25, z: 0 },
    coeur: { x: 0, y: 18, z: 0 },
    plexusSolaire: { x: 0, y: 12, z: 0 },
    sacre: { x: 0, y: 6, z: 0 },
    racine: { x: 0, y: 0, z: 0 },
    tete: { x: 0, y: 64.5, z: 0 },
    hautBrasDroit: { x: -3, y: 30, z: 0 },
    hautBrasGauche: { x: 3, y: 30, z: 0 },
    avantBrasDroit: { x: -5, y: 18, z: 0 },
    avantBrasGauche: { x: 5, y: 18, z: 0 },
    mainSurfaceDroite: { x: -6, y: 12, z: 2.5 },
    mainSurfaceGauche: { x: 6, y: 12, z: 2.5 },
    hautJambeDroite: { x: -1.5, y: -5, z: 0 },
    hautJambeGauche: { x: 1.5, y: -5, z: 0 },
    basJambeDroite: { x: -1.5, y: -10, z: 0 },
    basJambeGauche: { x: 1.5, y: -10, z: 0 },
    piedSurfaceDroit: { x: -1.5, y: -12, z: 3 },
    piedSurfaceGauche: { x: 1.5, y: -12, z: 3 }
});

// Fonction pour déterminer le centre du corps
function getBodyCenterKey(p1, p2) {
    if (p1.y >= 70 || p2.y >= 70) return "couronne";
    if (p1.y >= 62 || p2.y >= 62) return "troisiemeOeil";
    if (p1.y >= 25 || p2.y >= 25) return "gorge";
    if ((p1.y >= 16 && p1.y <= 20) || (p2.y >= 16 && p2.y <= 20)) return "coeur";
    if ((p1.y >= 10 && p1.y <= 14) || (p2.y >= 10 && p2.y <= 14)) return "plexusSolaire";
    if ((p1.y >= 4 && p1.y <= 8) || (p2.y >= 4 && p2.y <= 8)) return "sacre";
    if (p1.y <= 2 || p2.y <= 2) return "racine";
    if (p1.y <= -10 || p2.y <= -10) return (p1.x < 0 || p2.x < 0) ? "piedSurfaceDroit" : "piedSurfaceGauche";
    if (p1.y <= -6 || p2.y <= -6) return (p1.x < 0 || p2.x < 0) ? "basJambeDroite" : "basJambeGauche";
    if (p1.y <= 12 || p2.y <= 12) return (p1.x < 0 || p2.x < 0) ? "mainSurfaceDroite" : "mainSurfaceGauche";
    if (p1.y >= 18 || p2.y >= 18) return (p1.x < 0 || p2.x < 0) ? "hautBrasDroit" : "hautBrasGauche";
    return "tete";
}

// Fonction pour calculer une courbe méridienne
function calculateInclinedParabolicCurve(t, p1, p2, specialProfile, centerKey) {
    var BODY_CENTER = BODY_CENTERS[centerKey] || { x: 0, y: 0, z: 0 };
    var x = p1.x + (p2.x - p1.x) * t;
    var y = p1.y + (p2.y - p1.y) * t;
    var z = p1.z + (p2.z - p1.z) * t;

    var ventreDos = specialProfile ? specialProfile.ventreDos : 1;
    var peakFactor = specialProfile ? specialProfile.peakFactor : 1.2;
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

    // Projection spécifique pour mains/pieds
    if (centerKey.includes("Surface")) {
        dirX = 0;
        dirY = 0;
        dirZ = Math.abs(dirZ);
    }

    x += dirX * peak;
    y += dirY * peak;
    z += dirZ * peak;

    // Micro-élévations locales
    if (specialProfile) {
        var spread = 2.0;
        z += Math.exp(-Math.pow((t - 0.25) * spread, 2)) * specialProfile.z25;
        z += Math.exp(-Math.pow((t - 0.50) * spread, 2)) * specialProfile.z50;
        z += Math.exp(-Math.pow((t - 0.75) * spread, 2)) * specialProfile.z75;
    }

    return { x: x, y: y, z: z };
}
