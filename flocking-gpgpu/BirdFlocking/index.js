/* eslint no-bitwise: 0 */
import THREE from '../../src/three';
import { GPUComputationRenderer } from 'gpucomputationrender-threejs';
import dat from '../../src/dat.gui';

const birdShaders = require('../shaders/object-shader');
const positionShaders = require('../shaders/position-shader');
const velocityShaders = require('../shaders/velocity-shader');

let hash = document.location.hash.substr(1);
if (hash) hash = parseInt(hash, 0);

/* TEXTURE WIDTH FOR SIMULATION */
const WIDTH = hash || 32;

const BIRDS = WIDTH * WIDTH;

// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
THREE.BirdGeometry = function BirdGeometry() {
  const triangles = BIRDS * 3;
  const points = triangles * 3;

  THREE.BufferGeometry.call(this);

  const vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
  const birdColors = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
  const references = new THREE.BufferAttribute(new Float32Array(points * 2), 2);
  const birdVertex = new THREE.BufferAttribute(new Float32Array(points), 1);

  this.addAttribute('position', vertices);
  this.addAttribute('birdColor', birdColors);
  this.addAttribute('reference', references);
  this.addAttribute('birdVertex', birdVertex);

  // this.addAttribute( 'normal', new Float32Array( points * 3 ), 3 );


  let vert = 0;

  function vertsPush(...args) {
    for (let i = 0; i < arguments.length; i += 1) {
      vertices.array[vert] = args[i];
      vert += 1;
    }
  }

  const wingsSpan = 20;

  for (let f = 0; f < BIRDS; f += 1) {
    // Body
    vertsPush(
      0, -0, -20,
      0, 4, -20,
      0, 0, 30,
    );

    // Left Wing
    vertsPush(
      0, 0, -15,
      -wingsSpan, 0, 0,
      0, 0, 15,
    );

    // Right Wing
    vertsPush(
      0, 0, 15,
      wingsSpan, 0, 0,
      0, 0, -15,
    );
  }

  for (let vtx = 0; vtx < triangles * 3; vtx += 1) {
    const i = ~~(vtx / 3);
    const x = (i % WIDTH) / WIDTH;
    const y = ~~(i / WIDTH) / WIDTH;

    const c = new THREE.Color(
      0x444444 +
      ~~(vtx / 9) / BIRDS * 0x666666,
    );

    birdColors.array[vtx * 3 + 0] = c.r;
    birdColors.array[vtx * 3 + 1] = c.g;
    birdColors.array[vtx * 3 + 2] = c.b;

    references.array[vtx * 2] = x;
    references.array[vtx * 2 + 1] = y;

    birdVertex.array[vtx] = vtx % 9;
  }

  this.scale(0.2, 0.2, 0.2);
};

THREE.BirdGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);

let threebox;
let stats;
let scene;
let renderer;
let i;
let mouseX = 0;
let mouseY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

const BOUNDS = 800;
const BOUNDS_HALF = BOUNDS / 2;

document.getElementById('cars').innerText = BIRDS;

function change(val) {
  location.hash = val;
  location.reload();
  return false;
}

const options = document.createDocumentFragment();
for (i = 1; i < 7; i += 1) {
  const j = Math.pow(2, i); // eslint-disable-line
  const link = document.createElement('a');
  link.textContent = `${j * j}`;
  link.href = '#';
  link.onclick = () => {
    return change(j);
  };
  options.appendChild(link);
}
document.getElementById('options').appendChild(options);

let last = performance.now();

let gpuCompute;
let velocityVariable;
let positionVariable;
let positionUniforms;
let velocityUniforms;
let birdUniforms;

function fillPositionTexture(texture) {
  const theArray = texture.image.data;

  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    const x = Math.random() * BOUNDS - BOUNDS_HALF;
    const y = Math.random() * BOUNDS - BOUNDS_HALF;
    const z = Math.random() * BOUNDS - BOUNDS_HALF;

    theArray[k + 0] = x;
    theArray[k + 1] = y;
    theArray[k + 2] = z;
    theArray[k + 3] = 1;
  }
}

function fillVelocityTexture(texture) {
  const theArray = texture.image.data;

  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    const x = Math.random() - 0.5;
    const y = Math.random() - 0.5;
    const z = Math.random() - 0.5;

    theArray[k + 0] = x * 10;
    theArray[k + 1] = y * 10;
    theArray[k + 2] = z * 10;
    theArray[k + 3] = 1;
  }
}

function initComputeRenderer() {
  gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

  const dtPosition = gpuCompute.createTexture();
  const dtVelocity = gpuCompute.createTexture();
  fillPositionTexture(dtPosition);
  fillVelocityTexture(dtVelocity);

  velocityVariable = gpuCompute.addVariable('textureVelocity', velocityShaders.fragmentShader, dtVelocity);
  positionVariable = gpuCompute.addVariable('texturePosition', positionShaders.fragmentShader, dtPosition);

  gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
  gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);

  positionUniforms = positionVariable.material.uniforms;
  velocityUniforms = velocityVariable.material.uniforms;

  positionUniforms.time = {value: 0.0};
  positionUniforms.delta = {value: 0.0};
  velocityUniforms.time = {value: 1.0};
  velocityUniforms.delta = {value: 0.0};
  velocityUniforms.testing = {value: 1.0};
  velocityUniforms.seperationDistance = {value: 1.0};
  velocityUniforms.alignmentDistance = {value: 1.0};
  velocityUniforms.cohesionDistance = {value: 1.0};
  velocityUniforms.freedomFactor = {value: 1.0};
  velocityUniforms.predator = {value: new THREE.Vector3()};
  velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed(2);

  velocityVariable.wrapS = THREE.RepeatWrapping;
  velocityVariable.wrapT = THREE.RepeatWrapping;
  positionVariable.wrapS = THREE.RepeatWrapping;
  positionVariable.wrapT = THREE.RepeatWrapping;

  const error = gpuCompute.init();
  if (error !== null) {
    console.error(error); // eslint-disable-line
  }
}

function initBirds() {
  const geometry = new THREE.BirdGeometry();

  // For Vertex and Fragment
  birdUniforms = {
    color: {value: new THREE.Color(0xff2200)},
    texturePosition: {value: null},
    textureVelocity: {value: null},
    time: {value: 1.0},
    delta: {value: 0.0},
  };

  // ShaderMaterial
  const material = new THREE.ShaderMaterial({
    uniforms: birdUniforms,
    vertexShader: birdShaders.vertexShader,
    fragmentShader: birdShaders.fragmentShader,
    side: THREE.DoubleSide,
  });

  const birdMesh = new THREE.Mesh(geometry, material);
  birdMesh.rotation.y = Math.PI / 2;
  birdMesh.matrixAutoUpdate = false;
  birdMesh.updateMatrix();

  scene.add(birdMesh);
}


// function onWindowResize() {
//   windowHalfX = window.innerWidth / 2;
//   windowHalfY = window.innerHeight / 2;

//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);
// }

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart(event) {
  if (event.touches.length === 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function render() {
  const now = performance.now();
  let delta = (now - last) / 1000;

  if (delta > 1) delta = 1; // safety cap on large deltas
  last = now;

  positionUniforms.time.value = now;
  positionUniforms.delta.value = delta;
  velocityUniforms.time.value = now;
  velocityUniforms.delta.value = delta;
  birdUniforms.time.value = now;
  birdUniforms.delta.value = delta;

  velocityUniforms.predator.value.set(0.5 * mouseX / windowHalfX, -0.5 * mouseY / windowHalfY, 0);

  mouseX = 10000;
  mouseY = 10000;

  gpuCompute.compute();

  birdUniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
  birdUniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget(velocityVariable).texture;

  // renderer.render(scene, camera);
}


function init() {
  // container = document.createElement('div');
  // document.body.appendChild(container);

  // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
  // camera.position.z = 350;

  // scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog(0xffffff, 100, 1000);

  // renderer = new THREE.WebGLRenderer();
  // renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // container.appendChild(renderer.domElement);
  scene = threebox.world;
  renderer = threebox.renderer;

  initComputeRenderer();

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);

  //

  // window.addEventListener('resize', onWindowResize, false);


  const gui = new dat.GUI();

  const effectController = {
    seperation: 20.0,
    alignment: 20.0,
    cohesion: 20.0,
    freedom: 0.75,
  };

  const valuesChanger = () => {
    velocityUniforms.seperationDistance.value = effectController.seperation;
    velocityUniforms.alignmentDistance.value = effectController.alignment;
    velocityUniforms.cohesionDistance.value = effectController.cohesion;
    velocityUniforms.freedomFactor.value = effectController.freedom;
  };

  valuesChanger();

  gui.add(effectController, 'seperation', 0.0, 100.0, 1.0).onChange(valuesChanger);
  gui.add(effectController, 'alignment', 0.0, 100, 0.001).onChange(valuesChanger);
  gui.add(effectController, 'cohesion', 0.0, 100, 0.025).onChange(valuesChanger);
  gui.close();

  initBirds();

  threebox.onRender(() => {
    render();
  });
}


function BirdFlocking(map) {
  threebox = new window.Threebox(map);
  threebox.setupDefaultLights();
  this.threebox = threebox;
  this.init = () => {
    init();
  };
}

module.exports = BirdFlocking;
