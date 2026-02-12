const fs = require('fs');

// Ici tu mets les coordonnées réelles de tes points énergétiques
// Format : { x: ..., y: ..., z: ... } pour chaque point
const meridiansPoints = {
    "p": [
        {x:-13.267798, y:46, z:-1.1},
        {x:-14.267798, y:48.6, z:-4.6},
        {x:-22.967798, y:32.4, z:-4.7},
        {x:-23.567798, y:28.7, z:-5},
        {x:-24.167798, y:15.7, z:-4.6},
        {x:-25.767798, y:7.5, z:-2.7},
        {x:-26.967798, y:-1.5, z:-1.5},
        {x:-26.267798, y:-3.5, z:-0.5},
        {x:-27.367798, y:-5.5, z:-0.3},
        {x:-27.667798, y:-7.7, z:2.1},
        {x:-30.567798, y:-13.2, z:5.999}
    ],
    "gi": [
        {x:29.2322, y:-20, z:6.2},
        {x:29.3322, y:-14.7, z:2.8},
        {x:29.5322, y:-12.2, z:1.8},
        {x:29.5322, y:-10.5, z:0.4},
        {x:28.3322, y:-6.8, z:0.4},
        {x:28.0322, y:-0.3, z:-3.8},
        {x:27.8322, y:4.4, z:-6.4},
        {x:27.7322, y:9.7, z:-8.1},
        {x:27.5322, y:12, z:-8.8},
        {x:27.2322, y:14.3, z:-9.3},
        {x:27.0322, y:17.6, z:-8.8},
        {x:26.6322, y:18.5, z:-8.6},
        {x:26.4322, y:23.5, z:-9.3},
        {x:24.7322, y:33.3, z:-7.6},
        {x:20.4322, y:47.2, z:-5}
    ],
    // ajoute ici les autres méridiens (e, vc...) de la même façon
};

// Nombre de segments entre deux points
const segments = 10;

function catmullRomSpline(p0, p1, p2, p3, t) {
    const t2 = t*t;
    const t3 = t2*t;

    const x = 0.5*((2*p1.x) + (-p0.x+p2.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*t2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*t3);
    const y = 0.5*((2*p1.y) + (-p0.y+p2.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*t2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*t3);
    const z = 0.5*((2*p1.z) + (-p0.z+p2.z)*t + (2*p0.z-5*p1.z+4*p2.z-p3.z)*t2 + (-p0.z+3*p1.z-3*p2.z+p3.z)*t3);

    return {x,y,z};
}

const curvesData = {};

for (let meridian in meridiansPoints) {
    const points = meridiansPoints[meridian];
    const curvePoints = [];

    for (let i=0; i<points.length-1; i++){
        const p0 = i === 0 ? points[i] : points[i-1];
        const p1 = points[i];
        const p2 = points[i+1];
        const p3 = i+2 >= points.length ? points[points.length-1] : points[i+2];

        for (let j=0; j<=segments; j++){
            const t = j/segments;
            curvePoints.push(catmullRomSpline(p0,p1,p2,p3,t));
        }
    }

    curvesData[meridian] = curvePoints;
}

// Sauvegarde dans un fichier JSON
fs.writeFileSync('meridians.json', JSON.stringify(curvesData, null, 2));
console.log('Fichier meridians.json créé avec succès !');

