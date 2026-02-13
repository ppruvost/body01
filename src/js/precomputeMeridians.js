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

            // Calcul du point médian pour la courbure
            var mid = new THREE.Vector3().addVectors(
                new THREE.Vector3(p1.x, p1.y, p1.z),
                new THREE.Vector3(p2.x, p2.y, p2.z)
            ).multiplyScalar(0.5);

            var dir = new THREE.Vector3().subVectors(
                new THREE.Vector3(p2.x, p2.y, p2.z),
                new THREE.Vector3(p1.x, p1.y, p1.z)
            );

            var perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize().multiplyScalar(
                curvatureFactor * (p1.z >= -10 ? 1 : -1)
            );
            mid.add(perp);

            // Génération des segments de la courbe
            var segments = 10;
            for (var s = 0; s <= segments; s++) {
                var t = s / segments;
                var x = (1-t)*(1-t)*p1.x + 2*(1-t)*t*mid.x + t*t*p2.x;
                var y = (1-t)*(1-t)*p1.y + 2*(1-t)*t*mid.y + t*t*p2.y;
                var z = (1-t)*(1-t)*p1.z + 2*(1-t)*t*mid.z + t*t*p2.z;

                geometry.vertices.push(new THREE.Vector3(x, y, z));
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
