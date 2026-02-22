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
    coeur: { x: 0, y: 0, z: 0 },
    plexusSolaire: { x: 0, y: 0, z: 0 },
    sacre: { x: 0, y: 0, z: 0 },
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

    function inZone(p, min, max) {
        return p.y >= min && p.y <= max;
    }

    // Couronne
    if (inZone(p1, 68, 100) || inZone(p2, 68, 100))
        return "couronne";

    // Troisième œil
    if (inZone(p1, 58, 68) || inZone(p2, 58, 68))
        return "troisiemeOeil";

    // Gorge
    if (inZone(p1, 26, 34) || inZone(p2, 26, 34))
        return "gorge";

    // Cœur
    if (inZone(p1, 16, 26) || inZone(p2, 16, 26))
        return "coeur";

    // Plexus solaire
    if (inZone(p1, 10, 16) || inZone(p2, 10, 16))
        return "plexusSolaire";

    // Sacré
    if (inZone(p1, 2, 10) || inZone(p2, 2, 10))
        return "sacre";

    // Racine
    if (inZone(p1, -20, 2) || inZone(p2, -20, 2))
        return "racine";

    // fallback sécurité
    return "coeur";
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

// Définition des centres des chakras selon body
function computeChakraCenters() {

    var chakraZones = {
        couronne:        { minY: 68,  maxY: 100 },
        troisiemeOeil:   { minY: 58,  maxY: 68 },
        gorge:           { minY: 26,  maxY: 34 },
        coeur:           { minY: 16,  maxY: 26 },
        plexusSolaire:   { minY: 10,  maxY: 16 },
        sacre:           { minY: 2,   maxY: 10 },
        racine:          { minY: -20, maxY: 2 }
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
    });
}
        
// Fonction principale pour construire les courbes méridiennes
function buildMeridianCurves(scene) {
    if (!ACU_POINTS) {
        console.error("ACU_POINTS n'est pas défini.");
        return;
    }
    
    computeChakraCenters();
    
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
