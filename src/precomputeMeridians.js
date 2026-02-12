const fs = require('fs');

// Ici tu mets les coordonnées réelles de tes points énergétiques
// Format : { x: ..., y: ..., z: ... } pour chaque point
const meridiansPoints = {
    "p": [
        {"x": -13.267798006864483,"y": 46.00000000000004,"z": -1.0999999999999999 },
                {"x":-14.26779800686449,"y": 48.60000000000008,"z": -4.6000000000000026 },
                {"x": -22.967798006864573,"y": 32.39999999999985,"z": -4.7 },
                {"x": -23.56779800686458,"y": 28.699999999999797,"z": -4.999999999999999 },
                {"x": -24.16779800686459,"y": 15.69999999999962,"z": -4.6000000000000005 },
                {"x": -25.767798006864613,"y": 7.499999999999648,"z": -2.7000000000000015 },
                {"x": -26.96779800686463,"y": -1.5000000000003426,"z": -1.5000000000000004 },
                {"x": -26.26779800686462,"y": -3.500000000000344,"z": -0.5000000000000001 },
                {"x": -27.367798006864636,"y": -5.500000000000339,"z": -0.30000000000000016 },
                {"x": -27.66779800686464,"y": -7.7000000000003315,"z": 2.1000000000000005 },
                {"x": -30.56779800686468,"y": -13.200000000000312,"z": 5.999999999999995 }
            ],
    "gi": [
        {"x": 29.232201993135632,"y": -20.00000000000036,"z": 6.199999999999994, view: 1 },
                {"x": 29.332201993135634,"y": -14.700000000000307,"z": 2.8000000000000007, view: 1 },
                {"x": 29.532201993135637,"y": -12.200000000000315,"z": 1.7999999999999998, view: 1 },
                {"x": 29.532201993135637,v: -10.500000000000322,"z": 0.39999999999999936, view: -2 },
                {"x": 28.33220199313562,"y": -6.800000000000335,"z": 0.39999999999999925, view: 1 },
                {"x": 28.032201993135615,"y": -0.3000000000003421,"z": -3.8000000000000025, view: 1 },
                {"x": 27.832201993135612,"y": 4.399999999999659,"z": -6.399999999999994, view: 1 },
                {"x": 27.73220199313561,"y": 9.69999999999964,"z": -8.099999999999989, view: 1 },
                {"x": 27.532201993135608,"y": 11.999999999999632,"z": -8.799999999999986, view: 1 },
                {"x": 27.232201993135604,"y": 14.299999999999624,"z": -9.299999999999985, view: 1 },
                {"x": 27.0322019931356,"y": 17.59999999999964,"z": -8.799999999999986, view: 1 },
                {"x": 26.632201993135595,"y": 18.49999999999968,"z": -8.599999999999987, view: 1 },
                {"x": 26.432201993135592,"y": 23.499999999999723,"z": -9.299999999999985, view: 1 },
                {"x": 24.73220199313557,"y": 33.29999999999986,"z": -7.599999999999991, view: 1 },
                {"x": 20.432201993135507,"y": 47.20000000000006,"z": -5, view: 1 },
                {"x": 9.132201993135475,"y": 45.80000000000008,"z": -17.48, view: 1 },
                {"x": 5.532201993135482,"y": 54.10000000000016,"z": -4.0000000000000036 },
                {"x": 5.132201993135483,"y": 56.100000000000186,"z": -3.600000000000003 },
                {"x": 0.9322019931354847,"y": 62.400000000000276,"z": 4.899999999999998 },
                {"x": 1.9322019931354855,"y": 62.90000000000028,"z": 4.3 },
                {"x": -0.9322019931354847,"y": 62.400000000000276,"z": 4.899999999999998 },
                {"x": -1.9322019931354855,"y": 62.90000000000028,"z": 4.3 }
    ],
   
    
    // ajoute ici les autres méridiens (e, vc...) de la même façon
};

// Nombre de segments entre deux points (plus élevé = courbe plus douce)
// rayon de lissage aux angles (en pixels ou unités de coordonnées)
const radius = 5; 

function getRoundedLine(points, radius = 5) {
    if (points.length < 2) return points;

    const roundedPoints = [points[0]]; // commencer par le premier point

    for (let i = 1; i < points.length - 1; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];

        // vecteurs des segments
        const v0 = { x: p0.x - p1.x, y: p0.y - p1.y };
        const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };

        // longueurs des vecteurs
        const len0 = Math.hypot(v0.x, v0.y);
        const len1 = Math.hypot(v1.x, v1.y);

        // ajuster le rayon pour ne pas dépasser les segments
        const r0 = Math.min(radius, len0 / 2);
        const r1 = Math.min(radius, len1 / 2);

        // points d'entrée et de sortie de l'angle arrondi
        const entry = { x: p1.x + (v0.x / len0) * r0, y: p1.y + (v0.y / len0) * r0 };
        const exit = { x: p1.x + (v1.x / len1) * r1, y: p1.y + (v1.y / len1) * r1 };

        roundedPoints.push(entry);
        // On peut ici insérer des points intermédiaires pour arrondi "réel" (ex: quart de cercle)
        roundedPoints.push(exit);
    }

    // ajouter le dernier point
    roundedPoints.push(points[points.length - 1]);

    return roundedPoints;
}

// ⚡ Exemple d'utilisation pour tous les méridiens
const smoothedLines = {};
for (let meridian in meridiansPoints) {
    smoothedLines[meridian] = getRoundedLine(meridiansPoints[meridian], radius);
}

// Sauvegarde dans un fichier JSON
fs.writeFileSync('meridians.json', JSON.stringify(curvesData, null, 2));
console.log('Fichier meridians.json créé avec succès !');

