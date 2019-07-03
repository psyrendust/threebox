// @ts-nocheck
const test = require('tape');
// const Threebox = require('../src/Threebox.js');
const THREE = require('../src/three64.js');

function vector3Equals(t, input, expected, allowableError = 0.0000001, epsilon = 0.00000000000001) {
    // Check that two Vector3s are equal to each other, allowing for a certain percentage of error due to floating point math
    let dX;
    let dY;
    let dZ;
    dX = Math.abs(input.x - expected.x) / (expected.x === 0 ? 1 : expected.x);
    dY = Math.abs(input.y - expected.y) / (expected.y === 0 ? 1 : expected.y);
    dZ = Math.abs(input.z - expected.z) / (expected.z === 0 ? 1 : expected.z);

    if (dX < epsilon) dX = 0;
    if (dY < epsilon) dY = 0;
    if (dZ < epsilon) dZ = 0;

    if (dX > allowableError || dY > allowableError || dZ > allowableError) {
        t.fail(`Vector3 Equivalance failed: (${input.x}, ${input.y}, ${input.z}) expected: (${expected.x}, ${expected.y}, ${expected.z})`);
        console.log(dY); // eslint-disable-line
    }
    t.pass('ok Vector3 equivalance');
}

window.runTests = function runTests(instance) {
    test('project / unproject', (t) => {
        let coord;
        let projected;
        let expected;
        let unprojected;

        coord = [0, 0, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(0, 0, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        coord = [30, 30, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(42.66666666666666, -44.76149152845563, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        coord = [30, -30, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(42.66666666666666, 44.76149152845563, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        coord = [-30, 30, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(-42.66666666666666, -44.76149152845563, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        coord = [-30, -30, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(-42.66666666666666, 44.76149152845563, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        t.end();
    });

    test('project / unproject extened lat/lng range', (t) => {
        let coord;
        let projected;
        let expected;
        let unprojected;

        coord = [180, 0, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(256, 0, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        coord = [-180, 0, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(-256, 0, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        coord = [0, 90, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(0, -3042.073317352722, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        coord = [0, 85.051129, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(0, -256, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        coord = [0, -85.051129, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(0, 256, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        coord = [300, 0, 0];
        projected = instance.projectToWorld(coord);
        unprojected = instance.unprojectFromWorld(projected);
        expected = new THREE.Vector3(426.66666666666663, 0, 0);
        vector3Equals(t, projected, expected);
        vector3Equals(t, new THREE.Vector3(unprojected), new THREE.Vector3(expected));

        // coord = [0,120];
        // projected = instance.projectToWorld(coord);
        // Should fail on invalid value
        // expected = new THREE.Vector3(0,0,0);
        // vector3Equals(t, projected, expected);

        t.end();
    });

    test('project with altitude', (t) => {
        let coord;
        let projected;
        let expected;

        coord = [0, 0, 10000];
        projected = instance.projectToWorld(coord);
        expected = new THREE.Vector3(0, 0, 0.12776044915782905);
        vector3Equals(t, projected, expected);

        coord = [0, 0, -10000];
        projected = instance.projectToWorld(coord);
        expected = new THREE.Vector3(0, 0, -0.12776044915782905);
        vector3Equals(t, projected, expected);

        t.end();
    });

    test('project / unproject invalid input', (t) => {
        // TODO: Check for null/undefined/NaN values
        t.end();
    });
};
