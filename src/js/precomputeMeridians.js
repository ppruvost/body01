// Compatible code version for three.js r71 written by ppruvost github.com for bien-etre-geobiologie.fr
var sphereRadius = 0.3;
var elevationFactor = 2.0; // Facteur pour ajuster globalement l'élévation

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

// Fonction pour calculer un point sur une courbe de Bézier cubique
function cubicBezier(t, p0, p1, p2, p3) {
    var mt = 1 - t;
    var mt2 = mt * mt;
    var t2 = t * t;
    return {
        x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
        y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
        z: mt2 * mt * p0.z + 3 * mt2 * t * p1.z + 3 * mt * t2 * p2.z + t2 * t * p3.z
    };
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

            if (specialProfile) {
                // Calcul des points de contrôle pour la courbe de Bézier
                var elevation25 = specialProfile.z25 * elevationFactor;
                var elevation50 = specialProfile.z50 * elevationFactor;
                var elevation75 = specialProfile.z75 * elevationFactor;

                // Points de contrôle pour la courbe de Bézier
                var controlPoint1 = {
                    x: p1.x + (p2.x - p1.x) * 0.33,
                    y: p1.y + (p2.y - p1.y) * 0.33,
                    z: p1.z + elevation25
                };

                var controlPoint2 = {
                    x: p1.x + (p2.x - p1.x) * 0.66,
                    y: p1.y + (p2.y - p1.y) * 0.66,
                    z: p1.z + elevation75
                };

                // Ajout des points de la courbe de Bézier
                for (var s = 1; s <= segments; s++) {
                    var t = s / segments;
                    var point = cubicBezier(t, p1, controlPoint1, controlPoint2, p2);
                    geometry.vertices.push(new THREE.Vector3(point.x, point.y, point.z));
                }
            } else {
                // Cas standard : ligne droite
                for (var s = 1; s <= segments; s++) {
                    var t = s / segments;
                    var x = p1.x + (p2.x - p1.x) * t;
                    var y = p1.y + (p2.y - p1.y) * t;
                    var z = p1.z + (p2.z - p1.z) * t;
                    geometry.vertices.push(new THREE.Vector3(x, y, z));
                }
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
