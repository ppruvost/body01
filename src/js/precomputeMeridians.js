/* ============================================================
   PRECOMPUTE MERIDIANS LINES
   ============================================================ */

function buildMeridianLines(scene) {

    const meridianGroups = {};

    // Regrouper les points par méridien
    ACU_POINTS.forEach(p => {
        if (!meridianGroups[p.meridian]) {
            meridianGroups[p.meridian] = [];
        }
        meridianGroups[p.meridian].push(p);
    });

    // Pour chaque méridien
    Object.keys(meridianGroups).forEach(meridian => {

        const points = meridianGroups[meridian];

        // Tri intelligent basé sur le nom (ex: p1, p2, gi3...)
        points.sort((a, b) => {
            const na = parseInt(a.name.replace(/\D/g, ''));
            const nb = parseInt(b.name.replace(/\D/g, ''));
            return na - nb;
        });

        const positions = [];

        points.forEach(p => {
            positions.push(p.x, p.y, p.z);
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );

        const material = new THREE.LineBasicMaterial({
            color: getMeridianColor(meridian),
            transparent: true,
            opacity: 0.6
        });

        const line = new THREE.Line(geometry, material);
        line.name = "line_" + meridian;

        scene.add(line);
    });
}
