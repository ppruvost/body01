function buildMeridianLines(scene) {

    var meridianGroups = {};

    // Regrouper les points par méridien
    ACU_POINTS.forEach(function(p) {
        if (!meridianGroups[p.meridian]) {
            meridianGroups[p.meridian] = [];
        }
        meridianGroups[p.meridian].push(p);
    });

    // Pour chaque méridien
    Object.keys(meridianGroups).forEach(function(meridian) {

        var points = meridianGroups[meridian];

        // Tri basé sur le numéro contenu dans le nom
        points.sort(function(a, b) {
            var na = parseInt(a.name.replace(/\D/g, ''));
            var nb = parseInt(b.name.replace(/\D/g, ''));
            return na - nb;
        });

        var geometry = new THREE.Geometry();

        points.forEach(function(p) {
            geometry.vertices.push(
                new THREE.Vector3(p.x, p.y, p.z)
            );
        });

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
