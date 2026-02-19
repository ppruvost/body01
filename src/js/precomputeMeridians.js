// Compatible code version for three.js r71 written by ppruvost github.com for bien-etre-geobiologie.fr

var sphereRadius = 0.3;

// Définition des cas particuliers de courbes avec paramètres individuels
var SPECIAL_CURVES = {
    // Courbes méridien poumon
    "p2-p3": "(1.75;2.05;0.8|1.5|1|0.8|1.55)",  // (z25;z50;z75|angle|ventreDos|peakFactor|parabolaFactor)
    "p2-r-p3-r": "(1.75;2.05;0.8|-1.5|1|0.8|1.55)",

    // Courbes méridien estomac
    "e5-e6": "(;;|45|1|0.6|1.6)",  // (z25;z50;z75|angle|ventreDos|peakFactor|parabolaFactor)
    "e5-r-e6-r": "(;;|45|1|0.6|1.6)",

    "e6-e7": "(;;|20|1|0.6|1.6)",
    "e6-r-e7-r": "(;;|20|1|0.6|1.6)",
    
    "e16-e17": "(0.05;0.25;0.05|4|1|0.6|1.6)",
    "e16-r-e17-r": "(0.05;0.25;0.05|-4|1|0.6|1.6)",

    "e11-e12": "(;0.5;|5|1|0.6|1.2)",
    "e11-r-e12-r": "(;0.5;|-5|1|0.6|1.2)",

    "e17-e18": "(0.3;0.8;0.4|4|1|0.6|1.5)",
    "e17-r-e18-r": "(0.08;0.35;0.1|-4|1|0.6|1.5)",

    "e18-e19": "(;;|1|1|0.8|1.6)",
    "e18-r-e19-r": "(;;|-1|1|0.8|1.6)",
};

// Fonction pour analyser une chaîne de type "((z25;z50;z75|angle|ventreDos|peakFactor|parabolaFactor))"
function parseElevationString(str) {
    if (!str) return null;
    str = str.replace(/[()]/g, "");
    var parts = str.split("|");

    var elevations = parts[0].split(";");
    var z25 = elevations[0] ? parseFloat(elevations[0]) : 0;
    var z50 = elevations[1] ? parseFloat(elevations[1]) : 0;
    var z75 = elevations[2] ? parseFloat(elevations[2]) : 0;

    var angleDegrees = parts[1] ? parseFloat(parts[1]) : 0;            // Valeur par défaut pour les points standards
    var ventreDos = parts[2] ? parseInt(parts[2]) : 1;                // Valeur par défaut pour les points standards
    var peakFactor = parts[3] ? parseFloat(parts[3]) : 0.8;          // Valeur par défaut pour les points standards
    var parabolaFactor = parts[4] ? parseFloat(parts[4]) : 0.3;     // Valeur par défaut pour les points standards

    return {
        z25: z25,
        z50: z50,
        z75: z75,
        angleDegrees: angleDegrees,
        ventreDos: ventreDos,
        peakFactor: peakFactor,
        parabolaFactor: parabolaFactor, // Nouveau champ
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
    var peakFactor = specialProfile ? specialProfile.peakFactor : 0.6; // Valeur pour les points standards
    var parabolaFactor = specialProfile ? specialProfile.parabolaFactor : 2; // 2 pour les points standards, 4 pour les cas particuliers

    // Calcul de la parabole avec sommet devant/derrière
    var parabola = Math.sin(Math.PI * t) * ventreDos; // Utilisation de parabolaFactor
    var peak = peakFactor * parabola * parabolaFactor;


    // Application de l'angle d'inclinaison (rotation autour de l'axe Z)
    var angleRadians = angleDegrees * Math.PI / 180;
    var dx = (x - p1.x) * Math.cos(angleRadians) - (y - p1.y) * Math.sin(angleRadians);
    var dy = (x - p1.x) * Math.sin(angleRadians) + (y - p1.y) * Math.cos(angleRadians);
    x = p1.x + dx;
    y = p1.y + dy;

    // Ajout des élévations spécifiques
    var z = zLinear + peak;
    if (specialProfile) {
        var spread = 1.75; // pour adoucir courbure
        var influence25 = Math.exp(-Math.pow((t - 0.25) * spread, 2)) * specialProfile.z25;
        var influence50 = Math.exp(-Math.pow((t - 0.50) * spread, 2)) * specialProfile.z50;
        var influence75 = Math.exp(-Math.pow((t - 0.75) * spread, 2)) * specialProfile.z75;
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
                opacity: 0.6
            });
            var line = new THREE.Line(geometry, material);
            scene.add(line);
        }
    });
}
