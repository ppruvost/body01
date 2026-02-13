function buildMeridianLines(scene) {

    var meridianGroups = {};

    // Regroupement par méridien
    ACU_POINTS.forEach(function(p){
        if(!meridianGroups[p.meridian]){
            meridianGroups[p.meridian] = [];
        }
        meridianGroups[p.meridian].push(p);
    });

    Object.keys(meridianGroups).forEach(function(meridian){

        var points = meridianGroups[meridian];

        // tri numérique (p1, p2, gi3...)
        points.sort(function(a,b){
            var na = parseInt(a.name.replace(/\D/g,''));
            var nb = parseInt(b.name.replace(/\D/g,''));
            return na - nb;
        });

        var vectors = [];

        for(var i=0; i<points.length; i++){
            vectors.push(
                new THREE.Vector3(
                    points[i].x,
                    points[i].y,
                    points[i].z
                )
            );
        }

        // Courbe CatmullRom
        var curve = new THREE.CatmullRomCurve3(vectors);

        // échantillonnage
        var sampled = curve.getPoints(60);

        var geometry = new THREE.BufferGeometry();

        var positions = new Float32Array(sampled.length * 3);

        for(var j=0; j<sampled.length; j++){

            // léger offset pour éviter de passer sous le mesh
            var v = sampled[j].clone().multiplyScalar(1.01);

            positions[j*3]     = v.x;
            positions[j*3 + 1] = v.y;
            positions[j*3 + 2] = v.z;
        }

        geometry.addAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );

        var material = new THREE.LineBasicMaterial({
            color: getMeridianColor(meridian),
            transparent: true,
            opacity: 0.6
        });

        var line = new THREE.Line(geometry, material);

        scene.add(line);
    });
}
