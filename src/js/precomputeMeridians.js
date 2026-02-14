
var sphereRadius = 0.3;

function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));
}

function buildMeridianCurves(scene) {
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
            var curvatureFactor = distance > 6 ? 1.3 : 0.3;

            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));

            var segments = 20;
            for (var s = 1; s <= segments; s++) {
                var t = s / segments;
                var x = p1.x + (p2.x - p1.x) * t;
                var y = p1.y + (p2.y - p1.y) * t;
                var z = p1.z + (p2.z - p1.z) * t + curvatureFactor * Math.sin(t * Math.PI);
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
// Compatible code version for three.js r71 written by ppruvost github.com
