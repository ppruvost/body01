var sphereRadius = 0.3; // Rayon de la sphère

function buildMeridianCurves_r71(scene, curvatureFactor) {
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

        var geometry = new THREE.Geometry();

        for (var i = 0; i < points.length - 1; i++) {
            var p1 = points[i];
            var p2 = points[i + 1];

            // Déterminer les points de départ/arrivée en fonction de z
            var startZ = p1.z >= -10 ? sphereRadius : -sphereRadius;
            var endZ = p2.z >= -10 ? sphereRadius : -sphereRadius;

            // Conserver les coordonnées x et y des points d'origine
            var startPoint = new THREE.Vector3(p1.x, p1.y, startZ);
            var endPoint = new THREE.Vector3(p2.x, p2.y, endZ);

            // Ajouter le point de départ
            geometry.vertices.push(startPoint);

            // Calcul des points intermédiaires pour une courbe plus douce
            var segments = 20; // Augmenter le nombre de segments pour une courbe plus lisse
            for (var s = 1; s < segments; s++) {
                var t = s / segments;

                // Interpolation cubique pour une courbe plus naturelle
                var x = (1-t)*(1-t)*(1-t)*p1.x + 3*(1-t)*(1-t)*t*p1.x + 3*(1-t)*t*t*p2.x + t*t*t*p2.x;
                var y = (1-t)*(1-t)*(1-t)*p1.y + 3*(1-t)*(1-t)*t*p1.y + 3*(1-t)*t*t*p2.y + t*t*t*p2.y;
                var z = (1-t)*(1-t)*(1-t)*p1.z + 3*(1-t)*(1-t)*t*p1.z + 3*(1-t)*t*t*p2.z + t*t*t*p2.z;

                // Ajouter une légère courbure supplémentaire
                var midZ = p1.z + (p2.z - p1.z) * t + (p1.z >= -10 ? curvatureFactor : -curvatureFactor) * Math.sin(t * Math.PI);

                geometry.vertices.push(new THREE.Vector3(x, y, midZ));
            }

            // Ajouter le point d'arrivée
            geometry.vertices.push(endPoint);
        }

        var material = new THREE.LineBasicMaterial({
            color: getMeridianColor(meridian),
            transparent: true,
            opacity: 0.6
        });

        var line = new THREE.Line(geometry, material);
        line.name = "line_" + meridian;
        scene.add(line);
    });
}

// Fonction pour appeler avec une courbure par défaut
function buildMeridianLines(scene) {
    buildMeridianCurves_r71(scene, 1.1);
}
