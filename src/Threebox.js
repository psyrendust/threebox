import THREE from './three';
import ThreeboxConstants from './constants';
import CameraSync from './Camera/CameraSync';
import SymbolLayer3D from './Layers/SymbolLayer3D';
import RAF from './utils/RAF';

require('./threebox.scss');

function Threebox(map) {
  this.map = map;

    // Set up a THREE.js scene
  this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
  this.renderer.setSize(this.map.transform.width, this.map.transform.height);
  this.renderer.shadowMap.enabled = true;

  this.map._container.appendChild(this.renderer.domElement);
  this.renderer.domElement.classList.add('threebox-canvas');
    // this.renderer.domElement.style["transform"] = "scale(1,-1)";

  const _this = this;
  this.map.on('resize', () => { _this.renderer.setSize(_this.map.transform.width, _this.map.transform.height); });


  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.000001, 5000000000);
  this.layers = [];
  this.mouse = new THREE.Vector2();
  this.raycaster = new THREE.Raycaster();

    // The CameraSync object will keep the Mapbox and THREE.js camera movements in sync.
    // It requires a world group to scale as we zoom in. Rotation is handled in the camera's
    // projection matrix itself (as is field of view and near/far clipping)
    // It automatically registers to listen for move events on the map so we don't need to do that here
  this.world = new THREE.Group();
  this.scene.add(this.world);
  this.cameraSynchronizer = new CameraSync(this.map, this.camera, this.world);

  this.raf = new RAF(this.renderer, this.scene, this.camera);
  this.raf.start();
}

Threebox.prototype = {
  SymbolLayer3D,

  start() {
    this.raf.start();
  },
  step() {
    this.raf.step();
  },
  stop() {
    this.raf.stop();
  },
  onUpdate(fn, scope) {
    this.raf.onUpdate(fn, scope);
  },
  onAfterUpdate(fn, scope) {
    this.raf.onAfterUpdate(fn, scope);
  },
  onRender(fn, scope) {
    this.raf.onUpdate(fn, scope);
  },
  onAfterRender(fn, scope) {
    this.raf.onAfterUpdate(fn, scope);
  },

  getMousePositionFromMapPoint(point) {
    this.mouse.x = (point.x / this.map.transform.width) * 2 - 1;
    this.mouse.y = -((point.y) / this.map.transform.height) * 2 + 1;
    return this.mouse.clone();
  },

  getIntersects(point, recursive, objects) {
    this.raycaster.setFromCamera(point, this.camera);
    return this.raycaster.intersectObjects(objects || this.world.children, recursive);
  },

  getIntersectsFromMapPoint(point, recursive, objects) {
    return this.getIntersects(this.getMousePositionFromMapPoint(point), recursive, objects);
  },

  projectToWorld(coords) {
        // Spherical mercator forward projection, re-scaling to WORLD_SIZE
    const projected = [
      -ThreeboxConstants.MERCATOR_A * coords[0] * ThreeboxConstants.DEG2RAD * ThreeboxConstants.PROJECTION_WORLD_SIZE,
      -ThreeboxConstants.MERCATOR_A * Math.log(Math.tan((Math.PI * 0.25) + (0.5 * coords[1] * ThreeboxConstants.DEG2RAD))) * ThreeboxConstants.PROJECTION_WORLD_SIZE, // eslint-disable-line
    ];

    const pixelsPerMeter = this.projectedUnitsPerMeter(coords[1]);

        // z dimension
    const height = coords[2] || 0;
    projected.push(height * pixelsPerMeter);

    const result = new THREE.Vector3(projected[0], projected[1], projected[2]);

    return result;
  },
  projectedUnitsPerMeter(latitude) {
    return Math.abs(ThreeboxConstants.WORLD_SIZE * (1 / Math.cos(latitude * Math.PI / 180)) / ThreeboxConstants.EARTH_CIRCUMFERENCE);
  },
  _scaleVerticesToMeters(centerLatLng, vertices) {
    const pixelsPerMeter = this.projectedUnitsPerMeter(centerLatLng[1]);
    // const centerProjected = this.projectToWorld(centerLatLng);

    for (let i = 0; i < vertices.length; i += 1) {
      vertices[i].multiplyScalar(pixelsPerMeter);
    }

    return vertices;
  },
  projectToScreen(coords) {
    console.log('WARNING: Projecting to screen coordinates is not yet implemented'); // eslint-disable-line
  },
  unprojectFromScreen(pixel) {
    console.log('WARNING: unproject is not yet implemented'); // eslint-disable-line
  },
  unprojectFromWorld(pixel) {
    const unprojected = [
      -pixel.x / (ThreeboxConstants.MERCATOR_A * ThreeboxConstants.DEG2RAD * ThreeboxConstants.PROJECTION_WORLD_SIZE),
      2 * (Math.atan(Math.exp(pixel.y / (ThreeboxConstants.PROJECTION_WORLD_SIZE * (-ThreeboxConstants.MERCATOR_A)))) - Math.PI / 4) / ThreeboxConstants.DEG2RAD, // eslint-disable-line
    ];

    const pixelsPerMeter = this.projectedUnitsPerMeter(unprojected[1]);

        // z dimension
    const height = pixel.z || 0;
    unprojected.push(height / pixelsPerMeter);

    return unprojected;
  },

  _flipMaterialSides(obj) {

  },

  addAtCoordinate(obj, lnglat, options) {
    const geoGroup = new THREE.Group();
    geoGroup.userData.isGeoGroup = true;
    geoGroup.add(obj);
    this._flipMaterialSides(obj);
    this.world.add(geoGroup);
    this.moveToCoordinate(obj, lnglat, options);

        // Bestow this mesh with animation superpowers and keeps track of its movements in the global animation queue
        // this.animationManager.enroll(obj);

    return obj;
  },
  moveToCoordinate(obj, lnglat, options) {
        /** Place the given object on the map, centered around the provided longitude and latitude
            The object's internal coordinates are assumed to be in meter-offset format, meaning
            1 unit represents 1 meter distance away from the provided coordinate.
        */

    if (options === undefined) options = {};
    if (options.preScale === undefined) options.preScale = 1.0;
    if (options.scaleToLatitude === undefined || obj.userData.scaleToLatitude) options.scaleToLatitude = true;

    obj.userData.scaleToLatitude = options.scaleToLatitude;

    if (typeof options.preScale === 'number') options.preScale = new THREE.Vector3(options.preScale, options.preScale, options.preScale);
    else if (options.preScale.constructor === Array && options.preScale.length === 3) options.preScale = new THREE.Vector3(options.preScale[0], options.preScale[1], options.preScale[2]); // eslint-disable-line
    else if (options.preScale.constructor !== THREE.Vector3) {
      console.warn('Invalid preScale value: number, Array with length 3, or THREE.Vector3 expected. Defaulting to [1,1,1]'); // eslint-disable-line
      options.preScale = new THREE.Vector3(1, 1, 1);
    }

    const scale = options.preScale;

        // Figure out if this object is a geoGroup and should be positioned and scaled directly, or if its parent
    let geoGroup;
    if (obj.userData.isGeoGroup) geoGroup = obj;
    else if (obj.parent && obj.parent.userData.isGeoGroup) geoGroup = obj.parent;
    else return console.error("Cannot set geographic coordinates of object that does not have an associated GeoGroup. Object must be added to scene with 'addAtCoordinate()'."); // eslint-disable-line

    if (options.scaleToLatitude) {
            // Scale the model so that its units are interpreted as meters at the given latitude
      const pixelsPerMeter = this.projectedUnitsPerMeter(lnglat[1]);
      scale.multiplyScalar(pixelsPerMeter);
    }

    geoGroup.scale.copy(scale);

    geoGroup.position.copy(this.projectToWorld(lnglat));
    obj.coordinates = lnglat;

    return obj;
  },

  addGeoreferencedMesh(mesh, options) {
        /* Place the mesh on the map, assuming its internal (x,y) coordinates are already in (longitude, latitude) format
            TODO: write this
        */

  },

  addSymbolLayer(options) {
    const layer = new SymbolLayer3D(this, options);
    this.layers.push(layer);

    return layer;
  },

  getDataLayer(id) {
    for (let i = 0; i < this.layers.length; i += 1) {
      const layer = this.layers[i];
      if (layer.id === id) {
        return layer;
      }
    }
    return null;
  },

  add(obj) {
    this.world.add(obj);
  },

  remove(obj) {
    this.world.remove(obj);
  },

  setupDefaultLights() {
    this.scene.add(new THREE.AmbientLight(0x404040));

    // Taken from https://threejs.org/examples/webgl_lights_hemisphere.html
    // LIGHTS
    // HemisphereLight does not cast shadows
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 800, 3000);
    this.scene.add(hemiLight);

    const sunlight = new THREE.DirectionalLight(0xffffff, 0.5);
    sunlight.position.set(0, 800, 1000);
    sunlight.matrixWorldNeedsUpdate = true;
    this.world.add(sunlight);

    // const lights = [];
    // lights[0] = new THREE.PointLight(0x999999, 1, 0);
    // lights[1] = new THREE.PointLight(0x999999, 1, 0);
    // lights[2] = new THREE.PointLight(0x999999, 0.2, 0);

    // // lights[0].position.set(0, 200, 1000);
    // lights[1].position.set(-2000, -2000, 2000);
    // lights[2].position.set(2000, 2000, 2000);

    // // // this.scene.add(lights[0]);
    // // this.scene.add(lights[1]);
    // this.scene.add(lights[2]);
  },

  setupHemisphereLights() {
    // Taken from https://threejs.org/examples/webgl_lights_hemisphere.html
    // LIGHTS
    // HemisphereLight does not cast shadows
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 800, 3000);

    // Used to cast shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    const d = 50;

    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = -0.0001;


    this.scene.add(hemiLight);
    this.scene.add(dirLight);

    this.hemiLight = hemiLight;
    this.dirLight = dirLight;
  },
};

window.Threebox = Threebox;
module.exports = Threebox;

