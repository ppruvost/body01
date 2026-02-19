// Compatible code version for three.js r71 written by ppruvost github.com for bien-etre-geobiologie.fr
// SYSTÈME UNIVERSEL MÉRIDIENS 3D
// Projection extérieure + adoucissement anatomique

// Rayon sphères points
var sphereRadius = 0.3;

// Centre du corps (adapter si nécessaire)
var BODY_CENTER = {
    x: 0,
    y: 0,
    z: 0
};

// Hauteur approx du modèle (adapter à ton mesh)
var BODY_MIN_Y = -2;   // bas pieds
var BODY_MAX_Y = 3;    // sommet tête

// ------------------------------------------------------
// Cas particuliers
// Format : "(z25;z50;z75|angle|ventreDos|peakFactor|parabolaFactor)"
// ------------------------------------------------------

var SPECIAL_CURVES = {

    "vc1-vc2": "(1.1;1.4;0.9|0|1|1.1|3.2)",

    "p2-p3": "(1.75;2.05;0.8|0|1|0.9|2.5)",
    "p2-r-p3-r": "(1.75;2.05;0.8|0|1|0.9|2.5)",

    "e5-e6": "(0.2;0.4;0.2|0|1|0.9|2.5)",
    "e5-r-e6-r": "(0.2;0.4;0.2|0|1|0.9|2.5)",

    "e6-e7": "(0.3;0.6;0.3|0|1|0.9|2.5)",
    "e6-r-e7-r": "(0.3;0.6;0.3|0|1|0.9|2.5)"
};

// ------------------------------------------------------
// Parser
// ------------------------------------------------------

function parseElevationString(str) {

    if (!str) return null;

    str = str.replace(/[()]/g, "");
    var parts = str.split("|");

    var elevations = parts[0].split(";");

    var z25 = elevations[0] ? parseFloat(elevations[0]) : 0;
    var z50 = elevations[1] ? parseFloat(elevations[1]) : 0;
    var z75 = elevations[2] ? parseFloat(elevations[2]) : 0;

    var angleDegrees = parts[1] ? parseFloat(parts[1]) : 0;
    var ventreDos = parts[2] ? parseInt(parts[2]) : 1;
    var peakFactor = parts[3] ? parseFloat(parts[3]) : 0.9;
    var parabolaFactor = parts[4] ? parseFloat(parts[4]) : 2.5;

    return {
        z25: z25,
        z50: z50,
        z75: z75,
        angleDegrees: angleDegrees,
        ventreDos: ventreDos,
        peakFactor: peakFactor,
        parabolaFactor: parabolaFactor
    };
}

// ------------------------------------------------------
// Profil spécial
// ------------------------------------------------------

function getSpecialCurveProfile(p1, p2) {

    var key1 = p1.name + "-" + p2.name;
    var key2 = p2.name + "-" + p1.name;

    if (SPECIAL_CURVES[key1]) return parseElevationString(SPECIAL_CURVES[key1]);
    if (SPECIAL_CURVES[key2]) return parseElevationString(SPECIAL_CURVES[key2]);

    return null;
}

// ------------------------------------------------------
// CALCUL COURBE UNIVERSAL
// ------------------------------------------------------

function calculateInclinedParabolicCurve(t, p1, p2, specialProfile) {

    // 1️⃣ Position linéaire
    var x = p1.x + (p2.x - p1.x) * t;
    var y = p1.y + (p2.y - p1.y) * t;
    var z = p1.z + (p2.z - p1.z) * t;

    // 2️⃣ Paramètres
    var ventreDos      = specialProfile ? specialProfile.ventreDos      : 1;
    var peakFactor     = specialProfile ? specialProfile.peakFactor     : 0.9;
    var parabolaFactor = specialProfile ? specialProfile.parabolaFactor : 2.5;

    // 3️⃣ Parabole douce
    var parabola = Math.pow(Math.sin(Math.PI * t), 0.8) * ventreDos;
    var peak = peakFactor * parabola * parabolaFactor;

    // --------------------------------------------------
    // 🔵 Atténuation anatomique (corps vs visage)
    // --------------------------------------------------

    // Normalisation hauteur 0 → 1
    var normalizedHeight = (y - BODY_MIN_Y) / (BODY_MAX_Y - BODY_MIN_Y);

    // Clamp sécurité
    if (normalizedHeight < 0) normalizedHeight = 0;
    if (normalizedHeight > 1) normalizedHeight = 1;

    // Dégradé progressif
    // Bas corps ≈ 0.4
    // Milieu ≈ 0.6
    // Haut ≈ 1.0
    var softFactor = 0.4 + 0.6 * Math.pow(normalizedHeight, 1.6);

    peak *= softFactor;

    // --------------------------------------------------
    // 4️⃣ Projection vers l'extérieur du corps
    // --------------------------------------------------

    var dirX = x - BODY_CENTER.x;
    var dirY = y - BODY_CENTER.y;
    var dirZ = z - BODY_CENTER.z;

    var length = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
    if (length === 0) length = 0.0001;

    dirX /= length;
    dirY /= length;
    dirZ /= length;

    x += dirX * peak;
    y += dirY * peak;
    z += dirZ * peak;

    // --------------------------------------------------
    // 5️⃣ Micro-élévations locales
    // --------------------------------------------------

    if (specialProfile) {

        var spread = 2.0;

        var influence25 = Math.exp(-Math.pow((t - 0.25) * spread, 2)) * specialProfile.z25;
        var influence50 = Math.exp(-Math.pow((t - 0.50) * spread, 2)) * specialProfile.z50;
        var influence75 = Math.exp(-Math.pow((t - 0.75) * spread, 2)) * specialProfile.z75;

        z += influence25 + influence50 + influence75;
    }

    return { x: x, y: y, z: z };
}

// ------------------------------------------------------
// Construction des méridiens
// ------------------------------------------------------

function buildMeridianCurves(scene) {

    if (!ACU_POINTS) {
        console.error("ACU_POINTS n'est pas défini.");
        return;
    }

    var meridianGroups = {};

    ACU_POINTS.forEach(function(p) {
        if (!meridianGroups[p.meridian]) {
            meridianGroups[p.meridian] = [];
        }
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

            for (var s = 1; s <= segments; s++) {
                var t = s / segments;
                var point = calculateInclinedParabolicCurve(t, p1, p2, specialProfile);
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
