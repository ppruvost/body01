var sphereRadius = 0.3;

function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));
}

function buildMeridianCurves_r71(scene) {
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

            // Ajustement dynamique du curvatureFactor en fonction de la distance
            var curvatureFactor = distance > 5 ? 1.2 : 0.6;

            var geometry = new THREE.BufferGeometry();
            var vertices = [];

            // Point de départ
            vertices.push(p1.x, p1.y, p1.z);

            var segments = 20;
            for (var s = 1; s <= segments; s++) {
                var t = s / segments;
                var x = p1.x + (p2.x - p1.x) * t;
                var y = p1.y + (p2.y - p1.y) * t;
                var z = p1.z + (p2.z - p1.z) * t;

                // Ajout d'une courbure douce sans artefact
                var midZ = z + curvatureFactor * Math.sin(t * Math.PI);
                vertices.push(x, y, midZ);
            }

            // Point d'arrivée
            vertices.push(p2.x, p2.y, p2.z);

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
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
