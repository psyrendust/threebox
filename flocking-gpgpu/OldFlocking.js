import THREE from '../src/three';

function randomRange(low, high) {
  return Math.random() * (high - low) + low;
}

function OldFlocking(map) {
  // Initialize threebox
  const threebox = new window.Threebox(map);
  threebox.setupDefaultLights();

  const source = {
    type: 'FeatureCollection',
    features: [],
  };

  for (let i = 0; i < 200; i++) {
    const newFeat = {
      type: 'Feature',
      properties: {
        heading: randomRange(0, 360),
        headingChange: 0,
        zAcceleration: 0,
        size: 60,
        id: i,
      },
      geometry: {
        type: 'Point',
        coordinates: [randomRange(-122.508544921875, -122.37945556640624), randomRange(37.70229391925025, 37.800289863702076), randomRange(0, 2000)],
      },
    };
    source.features.push(newFeat);
  }

  const symbols = threebox.addSymbolLayer({
    id: 'cars',
    source, // You can also specify a URL or relative path such as "data/points.geojson",
    modelName: 'CarLow',    // will look for an .obj and .mtl file with this name
    modelDirectory: 'models/car/',          // in this directory
    rotation: {generator: feature => (new THREE.Euler(Math.PI / 2, -feature.properties.headingChange * 10 * Math.PI / 180, -feature.properties.heading * Math.PI / 180, 'ZYX'))},
    scale: {property: 'size'},
    scaleWithMapProjection: true,
    key: {property: 'id'},
  });

  const cohere = true;


  let lastT = performance.now();
  const drive = (t) => {
    const dT = t - lastT;
    lastT = t;
    const fpsFactor = Math.min(dT, 1000) / 16.6 * 2;


    const source = symbols.source;
    if (symbols.loaded && source) {
      const kSeparation = -0.00000001;
      const nSeparation = Math.ceil(source.features.length / 20);
      const separationDistance = 0.00005;

      const kAlignment = 0.01;
      const nAlignment = 5;

      const kCohesion = 0.0005;
      const nCohesion = Math.ceil(source.features.length / 4);

      const headingDiff = (a, b) => (((((a - b) % 360) + 540) % 360) - 180);

      const speed = 0.0001;
      const targetAltitude = 10000000 / Math.pow(2, map.transform.zoom);
      source.features.forEach((f, i) => {
        if (f.properties.headingChange === undefined) f.properties.headingChange = 0;

        // Find neighbors (brute force search for now) and implement flocking algorithm
        let neighbors = [];
        source.features.forEach((f2) => {
          const deltaX = f.geometry.coordinates[0] - f2.geometry.coordinates[0];
          const deltaY = f.geometry.coordinates[1] - f2.geometry.coordinates[1];
          const deltaZ = (f.geometry.coordinates[2] - f2.geometry.coordinates[2]) / 10000;
          const distance = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
          neighbors.push({
            feature: f2,
            distance,
          });
        });
        neighbors = neighbors.sort((a, b) => (a.distance - b.distance)).slice(1);
        const alignmentNeighbors = neighbors.slice(0, nAlignment);
        const alignment = kAlignment * alignmentNeighbors
          .map(f2 => (headingDiff(f2.feature.properties.heading, f.properties.heading)))
          .reduce((a, b) => (a + b), 0) / alignmentNeighbors.length;

        const cohesionNeighbors = neighbors.slice(0, nCohesion);
        let cohesionVector = [0, 0, 0];
        if (cohere) {
          cohesionVector = [
            cohesionNeighbors.map(f2 => (f2.feature.geometry.coordinates[0] - f.geometry.coordinates[0])).reduce((a, b) => (a + b)) / cohesionNeighbors.length * kCohesion,
            cohesionNeighbors.map(f2 => (f2.feature.geometry.coordinates[1] - f.geometry.coordinates[1])).reduce((a, b) => (a + b)) / cohesionNeighbors.length * kCohesion,
            cohesionNeighbors.map(f2 => (f2.feature.geometry.coordinates[2] - f.geometry.coordinates[2])).reduce((a, b) => (a + b)) / cohesionNeighbors.length * kCohesion,
          ];
        }


        let centerVector = [0, 0, 0];
        if (cohere) {
          centerVector = [
            (map.transform.center.lng - f.geometry.coordinates[0]),
            (map.transform.center.lat - f.geometry.coordinates[1]),
            targetAltitude - f.geometry.coordinates[2],
          ];
        }
        // centerVector[0] = centerVector[0] * centerVector[0] * centerVector[0];
        // centerVector[1] = centerVector[1] * centerVector[1] * centerVector[1];

        centerVector[0] *= 0.001;
        centerVector[1] *= 0.001;
        centerVector[2] *= 0.1;

        centerVector[0] = Math.min(centerVector[0], 0.01);
        centerVector[0] = Math.max(centerVector[0], -0.01);
        centerVector[1] = Math.min(centerVector[1], 0.01);
        centerVector[1] = Math.max(centerVector[1], -0.01);
        centerVector[2] = Math.min(centerVector[2], 0.1);
        centerVector[2] = Math.max(centerVector[2], -0.1);

        cohesionVector[0] += centerVector[0];
        cohesionVector[1] += centerVector[1];
        cohesionVector[2] += centerVector[2];

        const separationNeighbors = neighbors.slice(0, nSeparation);// filter(f2 => f2.distance < separationDistance)
        const neighborsDX = separationNeighbors.map(f2 => (((f2.feature.geometry.coordinates[0] - f.geometry.coordinates[0]) / (f2.distance))));
        const neighborsDY = separationNeighbors.map(f2 => (((f2.feature.geometry.coordinates[1] - f.geometry.coordinates[1]) / (f2.distance))));
        const neighborsDZ = separationNeighbors.map(f2 => (((f2.feature.geometry.coordinates[2] - f.geometry.coordinates[2]) / (f2.distance))));
        const separationVector = [
          neighborsDX.reduce((a, b) => (a + b), 0) * kSeparation,
          neighborsDY.reduce((a, b) => (a + b), 0) * kSeparation,
          neighborsDZ.reduce((a, b) => (a + b), 0) * kSeparation,
        ];

        const zForce = cohesionVector[2] + separationVector[2];
        f.properties.zAcceleration += zForce;
        f.properties.zAcceleration *= 0.98;

        const forwardVector = [
          Math.sin(f.properties.heading * Math.PI / 180) * speed + cohesionVector[0] + separationVector[0],
          Math.cos(f.properties.heading * Math.PI / 180) * speed + cohesionVector[1] + separationVector[1],
          f.properties.zAcceleration,
        ];

        const forwardSpeed = Math.sqrt(forwardVector[0] * forwardVector[0] + forwardVector[1] * forwardVector[1]);
        if (forwardSpeed > 0.001) {
          forwardVector[0] *= 0.001 / forwardSpeed;
          forwardVector[1] *= 0.001 / forwardSpeed;
          // forwardVector[2] *= 0.0005 / forwardSpeed;
        }

        const newBearing = 90 - Math.atan2(forwardVector[1], forwardVector[0]) * 180 / Math.PI;
        // f.properties.heading += (newBearing - f.properties.heading) * 0.1 + alignment;
        const change = headingDiff(newBearing, f.properties.heading) * 0.1 + alignment;
        f.properties.headingChange += change * 0.5;
        f.properties.headingChange = Math.min(f.properties.headingChange, 5);
        f.properties.headingChange = Math.max(f.properties.headingChange, -5);
        f.properties.heading += change * fpsFactor;


        forwardVector[0] *= fpsFactor;
        forwardVector[1] *= fpsFactor;


        f.geometry.coordinates = [f.geometry.coordinates[0] + forwardVector[0], f.geometry.coordinates[1] + forwardVector[1], f.geometry.coordinates[2] + forwardVector[2]];
      });

      symbols.updateSourceData(source);
    }

    window.requestAnimationFrame(drive);
  };

  this.drive = drive;
  this.threebox = threebox;
  window.threebox = threebox;
}
export default OldFlocking;
