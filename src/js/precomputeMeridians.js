// Compatible code version for three.js r71 written by ppruvost github.com for bien-etre-geobiologie.fr

var sphereRadius = 0.3;
var distanceCurveFactor = 1.5; // Coefficient modifiable pour influencer l'élévation

// Fonction pour calculer la distance entre deux points
function calculateDistance(p1, p2) {
    return Math.sqrt(
        Math.pow(p2.x - p1.x, 2) +
        Math.pow(p2.y - p1.y, 2) +
        Math.pow(p2.z - p1.z, 2)
    );
}

// Définition des cas particuliers de courbes
var SPECIAL_CURVES = {
    "p2-p3": "(;8;)",
    "p2-r-p3-r": "(;8;)"
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
            var distance = calculateDistance(p1, p2);
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));

            var specialProfile = getSpecialCurveProfile(p1, p2);
            var segments = 40;

            for (var s = 1; s <= segments; s++) {
                var t = s / segments;
                var x = p1.x + (p2.x - p1.x) * t;
                var y = p1.y + (p2.y - p1.y) * t;
                var zLinear = p1.z + (p2.z - p1.z) * t;
                var z = zLinear;

                if (specialProfile) {
                    var influence25 = Math.exp(-Math.pow((t - 0.25) * 8, 2));
                    var influence50 = Math.exp(-Math.pow((t - 0.50) * 8, 2));
                    var influence75 = Math.exp(-Math.pow((t - 0.75) * 8, 2));
                    z += specialProfile.z25 * influence25;
                    z += specialProfile.z50 * influence50;
                    z += specialProfile.z75 * influence75;
                } else {
                    z += distanceCurveFactor * distance * 0.1 * Math.sin(t * Math.PI);
                }

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
