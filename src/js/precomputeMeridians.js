function buildMeridianCurves_r71(scene, curvatureFactor) {

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

        var geometry = new THREE.Geometry();

        for (var i = 0; i < points.length - 1; i++) {

            var p1 = new THREE.Vector3(points[i].x, points[i].y, points[i].z);
            var p2 = new THREE.Vector3(points[i+1].x, points[i+1].y, points[i+1].z);

            // Point médian
            var mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

            // Direction perpendiculaire simple pour la courbure dans le plan XY
            var dir = new THREE.Vector3().subVectors(p2, p1);
            var perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize().multiplyScalar(curvatureFactor * (p1.z >= -12 ? 1 : -1));
            mid.add(perp);

            // Diviser en N points pour simuler la courbe
            var segments = 10;
            for (var s = 0; s <= segments; s++) {
                var t = s / segments;

                // Quadratic Bézier formula
                var x = (1-t)*(1-t)*p1.x + 2*(1-t)*t*mid.x + t*t*p2.x;
                var y = (1-t)*(1-t)*p1.y + 2*(1-t)*t*mid.y + t*t*p2.y;
                var z = (1-t)*(1-t)*p1.z + 2*(1-t)*t*mid.z + t*t*p2.z;

                geometry.vertices.push(new THREE.Vector3(x, y, z));
            }
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

// Function to call buildMeridianCurves_r71 with default curvature
function buildMeridianLines(scene) {
    buildMeridianCurves_r71(scene, 0.3);
}
/* (scene, curvatureFactor) modifier la valeur de curvatureFactor par 0.15 ou autre nombre ... pour accentuer la courbure*/
