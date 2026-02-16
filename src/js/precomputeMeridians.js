// Compatible code version for three.js r71 written by ppruvost github.com for bien-etre-geobiologie.fr

var sphereRadius = 0.3;

// Définition des cas particuliers de courbes avec paramètres individuels
var SPECIAL_CURVES = {
    "p2-p3": "(;4;;|15|1|1.0)",  // Exemple : élévation à 50%, angle 15°, sommet devant, hauteur 2.0
    "p2-r-p3-r": "(;4;;|15|1|1.0)",
};

// Fonction pour analyser une chaîne de type "(z25;z50;z75|angle|ventreDos|peakFactor)"
function parseElevationString(str) {
    if (!str) return null;
    str = str.replace(/[()]/g, "");
    var parts = str.split("|");

    // Parsing des élévations (z25;z50;z75)
    var elevations = parts[0].split(";");
    var z25 = elevations[0] ? parseFloat(elevations[0]) : 0;
    var z50 = elevations[1] ? parseFloat(elevations[1]) : 0;
    var z75 = elevations[2] ? parseFloat(elevations[2]) : 0;

    // Parsing des paramètres supplémentaires (angle, ventreDos, peakFactor)
    var angleDegrees = parts[1] ? parseFloat(parts[1]) : 0;
    var ventreDos = parts[2] ? parseInt(parts[2]) : 1;
    var peakFactor = parts[3] ? parseFloat(parts[3]) : 1.2;

    return {
        z25: z25,
        z50: z50,
        z75: z75,
        angleDegrees: angleDegrees,
        ventreDos: ventreDos,
        peakFactor: peakFactor
    };
}

// Fonction pour récupérer un profil de courbe spécial
function getSpecialCurveProfile(p1, p2) {
    var key1 = p1.name + "-" + p2.name;
    var key2 = p2.name + "-" + p1.name;
    if (SPECIAL_CURVES[key1]) return parseElevationString(SPECIAL_CURVES[key1]);
    if (SPECIAL_CURVES[key2]) return parseElevationString(SPECIAL_CURVES[key2]);
    return null;
}

// Fonction pour calculer une parabole inclinée et orientée
function calculateInclinedParabolicCurve(t, p1, p2, specialProfile) {
    // Position de base sur la ligne droite entre p1 et p2
    var x = p1.x + (p2.x - p1.x) * t;
    var y = p1.y + (p2.y - p1.y) * t;
    var zLinear = p1.z + (p2.z - p1.z) * t;

    // Paramètres par défaut ou spécifiques au cas particulier
    var angleDegrees = specialProfile ? specialProfile.angleDegrees : 0;
    var ventreDos = specialProfile ? specialProfile.ventreDos : 1;
    var peakFactor = specialProfile ? specialProfile.peakFactor : 1.2;

    // Calcul de la parabole avec sommet devant/derrière
    var parabola = 4 * t * (1 - t) * ventreDos;
    var peak = peakFactor * parabola;

    // Application de l'angle d'inclinaison (rotation autour de l'axe Z)
    var angleRadians = angleDegrees * Math.PI / 180;
    var dx = (x - p1.x) * Math.cos(angleRadians) - (y - p1.y) * Math.sin(angleRadians);
    var dy = (x - p1.x) * Math.sin(angleRadians) + (y - p1.y) * Math.cos(angleRadians);
    x = p1.x + dx;
    y = p1.y + dy;

    // Ajout des élévations spécifiques
    var z = zLinear + peak;
    if (specialProfile) {
        var influence25 = Math.exp(-Math.pow((t - 0.25) * 8, 2)) * specialProfile.z25;
        var influence50 = Math.exp(-Math.pow((t - 0.50) * 8, 2)) * specialProfile.z50;
        var influence75 = Math.exp(-Math.pow((t - 0.75) * 8, 2)) * specialProfile.z75;
        z += influence25 + influence50 + influence75;
    }

    return { x: x, y: y, z: z };
}

// Fonction pour construire les courbes méridiennes
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
            var segments = 40;

            for (var s = 1; s <= segments; s++) {
                var t = s / segments;
                var point = calculateInclinedParabolicCurve(t, p1, p2, specialProfile);
                geometry.vertices.push(new THREE.Vector3(point.x, point.y, point.z));
            }

            geometry.vertices.push(new THREE.Vector3(p2.x, p2.y, p2.z));
            var material = new THREE.LineBasicMaterial({
                color: getMeridianColor(meridian),
                transparent: true,
                opacity: 0.6
            });
            var line = new THREE.Line(geometry, material);
            scene.add(line);
        }
    });
}
