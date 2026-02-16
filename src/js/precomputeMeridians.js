// Compatible code version for three.js r71 written by ppruvost github.com for bien-etre-geobiologie.fr

var sphereRadius = 0.3;
var elevationFactor = 1.2; // Facteur global pour ajuster l'élévation

// Définition des cas particuliers de courbes
var SPECIAL_CURVES = {
    "p2-p3": "(;8;)", // Exemple : élévation à 50%
};

// Fonction pour analyser une chaîne de type "(a;b;c)"
function parseElevationString(str) {
    if (!str) return null;
    str = str.replace(/[()]/g, "");
    var parts = str.split(";");
    return {
        z25: parts[0] ? parseFloat(parts[0]) : 0,
        z50: parts[1] ? parseFloat(parts[1]) : 0,
        z75: parts[2] ? parseFloat(parts[2]) : 0
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

// Fonction pour calculer une courbe polynomiale lisse
function calculateSmoothCurve(t, p1, p2, specialProfile) {
    var zLinear = p1.z + (p2.z - p1.z) * t;
    var z = zLinear;

    if (specialProfile) {
        // Appliquer une élévation modulée selon les positions 25%, 50%, 75%
        var influence25 = Math.exp(-Math.pow((t - 0.25) * 8, 2)) * specialProfile.z25;
        var influence50 = Math.exp(-Math.pow((t - 0.50) * 8, 2)) * specialProfile.z50;
        var influence75 = Math.exp(-Math.pow((t - 0.75) * 8, 2)) * specialProfile.z75;

        // Utiliser une fonction polynomiale pour lisser la courbe
        z += elevationFactor * (
            influence25 * Math.pow(t, 2) * Math.pow(1 - t, 1) +
            influence50 * Math.pow(t, 2) * Math.pow(1 - t, 0) +
            influence75 * Math.pow(t, 1) * Math.pow(1 - t, 2)
        );
    } else {
        // Cas standard : courbe sinusoïdale légère
        z += elevationFactor * 0.1 * Math.sin(t * Math.PI);
    }

    return z;
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
                var x = p1.x + (p2.x - p1.x) * t;
                var y = p1.y + (p2.y - p1.y) * t;
                var z = calculateSmoothCurve(t, p1, p2, specialProfile);

                geometry.vertices.push(new THREE.Vector3(x, y, z));
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
