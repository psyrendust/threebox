/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var THREE = window.THREE;
exports.default = THREE;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var WORLD_SIZE = 512;
var MERCATOR_A = 6378137.0;

module.exports = {
  WORLD_SIZE: WORLD_SIZE,
  PROJECTION_WORLD_SIZE: WORLD_SIZE / (MERCATOR_A * Math.PI) / 2,
  MERCATOR_A: MERCATOR_A, // 900913 projection property
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
  EARTH_CIRCUMFERENCE: 40075000 // In meters
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _three = __webpack_require__(0);

var _three2 = _interopRequireDefault(_three);

var _constants = __webpack_require__(1);

var _constants2 = _interopRequireDefault(_constants);

var _CameraSync = __webpack_require__(3);

var _CameraSync2 = _interopRequireDefault(_CameraSync);

var _SymbolLayer3D = __webpack_require__(5);

var _SymbolLayer3D2 = _interopRequireDefault(_SymbolLayer3D);

var _RAF = __webpack_require__(7);

var _RAF2 = _interopRequireDefault(_RAF);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

__webpack_require__(8);

function Threebox(map) {
  this.map = map;

  // Set up a THREE.js scene
  this.renderer = new _three2.default.WebGLRenderer({ alpha: true, antialias: true });
  this.renderer.setSize(this.map.transform.width, this.map.transform.height);
  this.renderer.shadowMap.enabled = true;

  this.map._container.appendChild(this.renderer.domElement);
  this.renderer.domElement.classList.add('threebox-canvas');
  // this.renderer.domElement.style["transform"] = "scale(1,-1)";

  var _this = this;
  this.map.on('resize', function () {
    _this.renderer.setSize(_this.map.transform.width, _this.map.transform.height);
  });

  this.scene = new _three2.default.Scene();
  this.camera = new _three2.default.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.000001, 5000000000);
  this.layers = [];
  this.mouse = new _three2.default.Vector2();
  this.raycaster = new _three2.default.Raycaster();

  // The CameraSync object will keep the Mapbox and THREE.js camera movements in sync.
  // It requires a world group to scale as we zoom in. Rotation is handled in the camera's
  // projection matrix itself (as is field of view and near/far clipping)
  // It automatically registers to listen for move events on the map so we don't need to do that here
  this.world = new _three2.default.Group();
  this.scene.add(this.world);
  this.cameraSynchronizer = new _CameraSync2.default(this.map, this.camera, this.world);

  this.raf = new _RAF2.default(this.renderer, this.scene, this.camera);
  this.raf.start();
}

Threebox.prototype = {
  SymbolLayer3D: _SymbolLayer3D2.default,

  start: function start() {
    this.raf.start();
  },
  step: function step() {
    this.raf.step();
  },
  stop: function stop() {
    this.raf.stop();
  },
  onUpdate: function onUpdate(fn, scope) {
    this.raf.onUpdate(fn, scope);
  },
  onAfterUpdate: function onAfterUpdate(fn, scope) {
    this.raf.onAfterUpdate(fn, scope);
  },
  onRender: function onRender(fn, scope) {
    this.raf.onUpdate(fn, scope);
  },
  onAfterRender: function onAfterRender(fn, scope) {
    this.raf.onAfterUpdate(fn, scope);
  },
  getMousePositionFromMapPoint: function getMousePositionFromMapPoint(point) {
    this.mouse.x = point.x / this.map.transform.width * 2 - 1;
    this.mouse.y = -(point.y / this.map.transform.height) * 2 + 1;
    return this.mouse.clone();
  },
  getIntersects: function getIntersects(point, recursive, objects) {
    this.raycaster.setFromCamera(point, this.camera);
    return this.raycaster.intersectObjects(objects || this.world.children, recursive);
  },
  getIntersectsFromMapPoint: function getIntersectsFromMapPoint(point, recursive, objects) {
    return this.getIntersects(this.getMousePositionFromMapPoint(point), recursive, objects);
  },
  projectToWorld: function projectToWorld(coords) {
    // Spherical mercator forward projection, re-scaling to WORLD_SIZE
    var projected = [-_constants2.default.MERCATOR_A * coords[0] * _constants2.default.DEG2RAD * _constants2.default.PROJECTION_WORLD_SIZE, -_constants2.default.MERCATOR_A * Math.log(Math.tan(Math.PI * 0.25 + 0.5 * coords[1] * _constants2.default.DEG2RAD)) * _constants2.default.PROJECTION_WORLD_SIZE];

    var pixelsPerMeter = this.projectedUnitsPerMeter(coords[1]);

    // z dimension
    var height = coords[2] || 0;
    projected.push(height * pixelsPerMeter);

    var result = new _three2.default.Vector3(projected[0], projected[1], projected[2]);

    return result;
  },
  projectedUnitsPerMeter: function projectedUnitsPerMeter(latitude) {
    return Math.abs(_constants2.default.WORLD_SIZE * (1 / Math.cos(latitude * Math.PI / 180)) / _constants2.default.EARTH_CIRCUMFERENCE);
  },
  _scaleVerticesToMeters: function _scaleVerticesToMeters(centerLatLng, vertices) {
    var pixelsPerMeter = this.projectedUnitsPerMeter(centerLatLng[1]);
    // const centerProjected = this.projectToWorld(centerLatLng);

    for (var i = 0; i < vertices.length; i += 1) {
      vertices[i].multiplyScalar(pixelsPerMeter);
    }

    return vertices;
  },
  projectToScreen: function projectToScreen(coords) {
    console.log('WARNING: Projecting to screen coordinates is not yet implemented'); // eslint-disable-line
  },
  unprojectFromScreen: function unprojectFromScreen(pixel) {
    console.log('WARNING: unproject is not yet implemented'); // eslint-disable-line
  },
  unprojectFromWorld: function unprojectFromWorld(pixel) {
    var unprojected = [-pixel.x / (_constants2.default.MERCATOR_A * _constants2.default.DEG2RAD * _constants2.default.PROJECTION_WORLD_SIZE), 2 * (Math.atan(Math.exp(pixel.y / (_constants2.default.PROJECTION_WORLD_SIZE * -_constants2.default.MERCATOR_A))) - Math.PI / 4) / _constants2.default.DEG2RAD];

    var pixelsPerMeter = this.projectedUnitsPerMeter(unprojected[1]);

    // z dimension
    var height = pixel.z || 0;
    unprojected.push(height / pixelsPerMeter);

    return unprojected;
  },
  _flipMaterialSides: function _flipMaterialSides(obj) {},
  addAtCoordinate: function addAtCoordinate(obj, lnglat, options) {
    var geoGroup = new _three2.default.Group();
    geoGroup.userData.isGeoGroup = true;
    geoGroup.add(obj);
    this._flipMaterialSides(obj);
    this.world.add(geoGroup);
    this.moveToCoordinate(obj, lnglat, options);

    // Bestow this mesh with animation superpowers and keeps track of its movements in the global animation queue
    // this.animationManager.enroll(obj);

    return obj;
  },
  moveToCoordinate: function moveToCoordinate(obj, lnglat, options) {
    /** Place the given object on the map, centered around the provided longitude and latitude
        The object's internal coordinates are assumed to be in meter-offset format, meaning
        1 unit represents 1 meter distance away from the provided coordinate.
    */

    if (options === undefined) options = {};
    if (options.preScale === undefined) options.preScale = 1.0;
    if (options.scaleToLatitude === undefined || obj.userData.scaleToLatitude) options.scaleToLatitude = true;

    obj.userData.scaleToLatitude = options.scaleToLatitude;

    if (typeof options.preScale === 'number') options.preScale = new _three2.default.Vector3(options.preScale, options.preScale, options.preScale);else if (options.preScale.constructor === Array && options.preScale.length === 3) options.preScale = new _three2.default.Vector3(options.preScale[0], options.preScale[1], options.preScale[2]); // eslint-disable-line
    else if (options.preScale.constructor !== _three2.default.Vector3) {
        console.warn('Invalid preScale value: number, Array with length 3, or THREE.Vector3 expected. Defaulting to [1,1,1]'); // eslint-disable-line
        options.preScale = new _three2.default.Vector3(1, 1, 1);
      }

    var scale = options.preScale;

    // Figure out if this object is a geoGroup and should be positioned and scaled directly, or if its parent
    var geoGroup = void 0;
    if (obj.userData.isGeoGroup) geoGroup = obj;else if (obj.parent && obj.parent.userData.isGeoGroup) geoGroup = obj.parent;else return console.error("Cannot set geographic coordinates of object that does not have an associated GeoGroup. Object must be added to scene with 'addAtCoordinate()'."); // eslint-disable-line

    if (options.scaleToLatitude) {
      // Scale the model so that its units are interpreted as meters at the given latitude
      var pixelsPerMeter = this.projectedUnitsPerMeter(lnglat[1]);
      scale.multiplyScalar(pixelsPerMeter);
    }

    geoGroup.scale.copy(scale);

    geoGroup.position.copy(this.projectToWorld(lnglat));
    obj.coordinates = lnglat;

    return obj;
  },
  addGeoreferencedMesh: function addGeoreferencedMesh(mesh, options) {
    /* Place the mesh on the map, assuming its internal (x,y) coordinates are already in (longitude, latitude) format
        TODO: write this
    */

  },
  addSymbolLayer: function addSymbolLayer(options) {
    var layer = new _SymbolLayer3D2.default(this, options);
    this.layers.push(layer);

    return layer;
  },
  getDataLayer: function getDataLayer(id) {
    for (var i = 0; i < this.layers.length; i += 1) {
      var layer = this.layers[i];
      if (layer.id === id) {
        return layer;
      }
    }
    return null;
  },
  add: function add(obj) {
    this.world.add(obj);
  },
  remove: function remove(obj) {
    this.world.remove(obj);
  },
  setupDefaultLights: function setupDefaultLights() {
    this.scene.add(new _three2.default.AmbientLight(0x404040));

    // Taken from https://threejs.org/examples/webgl_lights_hemisphere.html
    // LIGHTS
    // HemisphereLight does not cast shadows
    var hemiLight = new _three2.default.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 800, 3000);
    this.scene.add(hemiLight);

    var sunlight = new _three2.default.DirectionalLight(0xffffff, 0.5);
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
  setupHemisphereLights: function setupHemisphereLights() {
    // Taken from https://threejs.org/examples/webgl_lights_hemisphere.html
    // LIGHTS
    // HemisphereLight does not cast shadows
    var hemiLight = new _three2.default.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 800, 3000);

    // Used to cast shadows
    var dirLight = new _three2.default.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);

    dirLight.castShadow = true;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    var d = 50;

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
  }
};

window.Threebox = Threebox;
module.exports = Threebox;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _three = __webpack_require__(0);

var _three2 = _interopRequireDefault(_three);

var _utils = __webpack_require__(13);

var utils = _interopRequireWildcard(_utils);

var _constants = __webpack_require__(1);

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CameraSync(map, camera, world) {
  this.map = map;
  this.camera = camera;
  this.active = true;

  this.camera.matrixAutoUpdate = false; // We're in charge of the camera now!

  // Postion and configure the world group so we can scale it appropriately when the camera zooms
  this.world = world || new _three2.default.Group();
  this.world.position.x = this.world.position.y = _constants2.default.WORLD_SIZE / 2;
  this.world.matrixAutoUpdate = false;

  // Listen for move events from the map and update the Three.js camera
  var _this = this;
  this.map.on('move', function () {
    _this.updateCamera();
  });
  this.updateCamera();
}

CameraSync.prototype = {
  updateCamera: function updateCamera(ev) {
    if (!this.camera) {
      console.log('nocamera'); // eslint-disable-line
      return;
    }

    // Build a projection matrix, paralleling the code found in Mapbox GL JS
    var fov = 0.6435011087932844;
    var cameraToCenterDistance = 0.5 / Math.tan(fov / 2) * this.map.transform.height;
    var halfFov = fov / 2;
    var groundAngle = Math.PI / 2 + this.map.transform._pitch;
    var topHalfSurfaceDistance = Math.sin(halfFov) * cameraToCenterDistance / Math.sin(Math.PI - groundAngle - halfFov);

    // Calculate z distance of the farthest fragment that should be rendered.
    var furthestDistance = Math.cos(Math.PI / 2 - this.map.transform._pitch) * topHalfSurfaceDistance + cameraToCenterDistance;

    // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
    var farZ = furthestDistance * 1.01;

    this.camera.projectionMatrix = utils.makePerspectiveMatrix(fov, this.map.transform.width / this.map.transform.height, 1, farZ);

    var cameraWorldMatrix = new _three2.default.Matrix4();
    var cameraTranslateZ = new _three2.default.Matrix4().makeTranslation(0, 0, cameraToCenterDistance);
    var cameraRotateX = new _three2.default.Matrix4().makeRotationX(this.map.transform._pitch);
    var cameraRotateZ = new _three2.default.Matrix4().makeRotationZ(this.map.transform.angle);

    // Unlike the Mapbox GL JS camera, separate camera translation and rotation out into its world matrix
    // If this is applied directly to the projection matrix, it will work OK but break raycasting
    cameraWorldMatrix.premultiply(cameraTranslateZ).premultiply(cameraRotateX).premultiply(cameraRotateZ);

    this.camera.matrixWorld.copy(cameraWorldMatrix);

    var zoomPow = this.map.transform.scale;
    // Handle scaling and translation of objects in the map in the world's matrix transform, not the camera
    var scale = new _three2.default.Matrix4();
    var translateCenter = new _three2.default.Matrix4();
    var translateMap = new _three2.default.Matrix4();
    var rotateMap = new _three2.default.Matrix4();

    scale.makeScale(zoomPow, zoomPow, zoomPow);
    translateCenter.makeTranslation(_constants2.default.WORLD_SIZE / 2, -_constants2.default.WORLD_SIZE / 2, 0);
    translateMap.makeTranslation(-this.map.transform.x, this.map.transform.y, 0);
    rotateMap.makeRotationZ(Math.PI);
    this.world.matrix = new _three2.default.Matrix4();
    this.world.matrix.premultiply(rotateMap).premultiply(translateCenter).premultiply(scale).premultiply(translateMap);

    // utils.prettyPrintMatrix(this.camera.projectionMatrix.elements);
  }
};

module.exports = CameraSync;

/***/ }),
/* 4 */,
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _three = __webpack_require__(0);

var _three2 = _interopRequireDefault(_three);

var _valueGenerator = __webpack_require__(6);

var _valueGenerator2 = _interopRequireDefault(_valueGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SymbolLayer3D(parent, options) {
  var _this = this;

  if (options === undefined) {
    console.error('Invalid options provided to SymbolLayer3D'); // eslint-disable-line
    return;
  }
  // TODO: Better error handling here

  if (options.scale === undefined) options.scale = 1.0;
  if (options.rotation === undefined) options.rotation = 0;
  if (options.scaleWithMapProjection === undefined) options.scaleWithMapProjection = true;
  if (options.key === undefined || options.key === '' || _typeof(options.key) === 'object' && options.key.property === undefined && options.key.generator === undefined) {
    // eslint-disable-line
    options.key = {
      generator: function generator(val, i) {
        return i;
      }
    };
    console.warn('Using array index for SymbolLayer3D key property.'); // eslint-disable-line
  }

  this.parent = parent;

  this.id = options.id;
  this.keyGen = (0, _valueGenerator2.default)(options.key);
  if (typeof options.source === 'string') {
    this.sourcePath = options.source;
  } else {
    this.source = options.source;
  }

  this.modelDirectoryGen = (0, _valueGenerator2.default)(options.modelDirectory);
  this.modelNameGen = (0, _valueGenerator2.default)(options.modelName);
  this.rotationGen = (0, _valueGenerator2.default)(options.rotation);
  this.scaleGen = (0, _valueGenerator2.default)(options.scale);
  this.models = Object.create(null);
  this.features = Object.create(null);
  this.scaleWithMapProjection = options.scaleWithMapProjection;

  this.loaded = false;

  if (this.sourcePath) {
    // Load source and models
    var sourceLoader = new _three2.default.FileLoader();

    sourceLoader.load(this.sourcePath, function (data) {
      _this.source = JSON.parse(data);
      // TODO: Handle invalid GeoJSON

      _this._initialize();
    }, function () {
      return null;
    }, function (error) {
      return console.error('Could not load SymbolLayer3D source file.'); // eslint-disable-line
    });
  } else {
    this._initialize();
  }
}

SymbolLayer3D.prototype = {
  updateSourceData: function updateSourceData(source, absolute) {
    var _this2 = this;

    var oldFeatures = {};

    if (!source.features) {
      console.error("updateSourceData expects a GeoJSON FeatureCollection with a 'features' property"); // eslint-disable-line
      return;
    }
    source.features.forEach(function (feature, i) {
      var key = _this2.keyGen(feature, i); // TODO: error handling
      if (key in _this2.features) {
        // Update
        _this2.features[key].geojson = feature;
        oldFeatures[key] = feature;
      } else {
        // Create
        var modelDirectory = _this2.modelDirectoryGen(feature, i);
        var modelName = _this2.modelNameGen(feature, i);

        // TODO: Handle loading of new models
        _this2.features[key] = {
          geojson: feature,
          model: modelDirectory + modelName
        };
      }
    });

    this._addOrUpdateFeatures(this.features);

    if (absolute) {
      // Check for any features that are not have not been updated and remove them from the scene
      Object.keys(this.features).forEach(function (key) {
        if (!(key in oldFeatures)) {
          _this2.removeFeature(key);
        }
      });
      // for (key in this.features) {
      //   if (!(key in oldFeatures)) {
      //     this.removeFeature(key);
      //   }
      // }
    }

    this.source = source;
  },
  removeFeature: function removeFeature(key) {
    this.parent.remove(this.features[key].rawObject);
    delete this.features[key];
  },
  _initialize: function _initialize() {
    var _this3 = this;

    var modelNames = [];

    // Determine how to load the models
    if (!this.modelNameGen) {
      console.error('Invalid model name definition provided to SymbolLayer3D'); // eslint-disable-line
      return;
    }
    if (!this.modelDirectoryGen) {
      console.error('Invalid model directory definition provided to SymbolLayer3D'); // eslint-disable-line
      return;
    }

    // Add features to a map
    this.source.features.forEach(function (f, i) {
      var key = _this3.keyGen(f, i); // TODO: error handling
      if (_this3.features[key] !== undefined) {
        console.warn('Features with duplicate key: ' + key); // eslint-disable-line
      }

      var modelDirectory = _this3.modelDirectoryGen(f, i);
      var modelName = _this3.modelNameGen(f, i);
      _this3.features[key] = {
        geojson: f,
        model: modelDirectory + modelName
      };

      modelNames.push({ directory: modelDirectory, name: modelName });
    });

    // Filter out only unique models
    modelNames.forEach(function (mod) {
      _this3.models[mod.directory + mod.name] = {
        directory: mod.directory,
        name: mod.name,
        loaded: false
      };
    });

    // And load models asynchronously
    var remaining = Object.keys(this.models).length;
    console.log('Loading ' + remaining + ' models', this.models); // eslint-disable-line
    var modelComplete = function modelComplete(mod) {
      console.log('Model complete!', mod); // eslint-disable-line
      remaining -= 1;
      if (remaining === 0) {
        _this3.loaded = true;
        _this3._addOrUpdateFeatures(_this3.features);
      }
    };

    Object.keys(this.models).forEach(function (modelKey) {
      // TODO: Support formats other than OBJ/MTL
      var objLoader = new _three2.default.OBJLoader();
      var materialLoader = new _three2.default.MTLLoader();

      var loadObject = function (modelName) {
        return function (materials) {
          // Closure madness!
          if (materials) {
            materials.preload();

            Object.keys(materials.materials).forEach(function (matKey) {
              materials.materials[matKey].shininess /= 50; // Shininess exported by Blender is way too high
            });

            objLoader.setMaterials(materials);
          }
          objLoader.setPath(_this3.models[modelName].directory);

          console.log('Loading model ', modelName); // eslint-disable-line

          objLoader.load(_this3.models[modelName].name + '.obj', function (obj) {
            _this3.models[modelName].obj = obj;
            _this3.models[modelName].isMesh = obj.isMesh;
            _this3.models[modelName].loaded = true;

            modelComplete(modelName);
          }, function () {
            return null;
          }, function (error) {
            console.error('Could not load SymbolLayer3D model file.'); // eslint-disable-line
          });
        };
      }(modelKey);

      materialLoader.setPath(_this3.models[modelKey].directory);
      materialLoader.load(_this3.models[modelKey].name + '.mtl', loadObject, function () {
        return null;
      }, function (error) {
        console.warn('No material file found for SymbolLayer3D model ' + model); // eslint-disable-line
        loadObject();
      });
    });
  },
  _addOrUpdateFeatures: function _addOrUpdateFeatures(features) {
    var _this4 = this;

    Object.keys(features).forEach(function (key) {
      var f = features[key];
      var position = f.geojson.geometry.coordinates;
      var scale = _this4.scaleGen(f.geojson);

      var rotation = _this4.rotationGen(f.geojson);

      var obj = void 0;
      if (!f.rawObject) {
        // Need to create a scene graph object and add it to the scene
        if (f.model && _this4.models[f.model] && _this4.models[f.model].obj && _this4.models[f.model].loaded) {
          obj = _this4.models[f.model].obj.clone();
        } else {
          console.warn('Model not loaded: ' + f.model); // eslint-disable-line
          obj = new _three2.default.Group(); // Temporary placeholder if the model doesn't exist and/or will be loaded later
        }

        f.rawObject = obj;

        _this4.parent.addAtCoordinate(obj, position, { scaleToLatitude: _this4.scaleWithMapProjection, preScale: scale });
        // this.features[key] = f;
      } else {
        obj = f.rawObject;
        _this4.parent.moveToCoordinate(obj, position, { scaleToLatitude: _this4.scaleWithMapProjection, preScale: scale });
      }

      obj.rotation.copy(rotation);
    });
  }
};

module.exports = SymbolLayer3D;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = valueGenerator;
function valueGenerator(input) {
    if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object' && input.property !== undefined) {
        // Value name comes from a property in each item
        return function (f) {
            return f.properties[input.property];
        };
    } else if ((typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object' && input.generator !== undefined) {
        // Value name generated by a function run on each item
        return input.generator;
    }
    return function () {
        return input;
    };
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RAF = function RAF(renderer, scene, camera) {
    var _this = this;

    _classCallCheck(this, RAF);

    this.queue = [];
    this.afterQueue = [];
    this.isRunning = false;
    this.isStepping = false;
    this.raf = null;

    var update = function update(timestamp) {
        if (_this.isRunning || _this.isStepping) {
            _this.isStepping = false;
            _this.raf = requestAnimationFrame(update);

            _this.queue.forEach(function (queue) {
                queue.fn.call(queue.scope, timestamp);
            });

            renderer.render(scene, camera);

            _this.afterQueue.forEach(function (queue) {
                queue.fn.call(queue.scope, timestamp);
            });
        }
    };

    var run = function run() {
        _this.raf = requestAnimationFrame(update);
    };

    this.start = function () {
        if (!_this.isRunning) {
            if (_this.raf) {
                cancelAnimationFrame(_this.raf);
            }
            _this.isRunning = true;
        }
        run();
    };

    this.step = function () {
        if (!_this.isRunning) {
            _this.isStepping = true;
            run();
        }
    };

    this.stop = function () {
        _this.isRunning = false;
        if (_this.raf) {
            cancelAnimationFrame(_this.raf);
        }
        _this.raf = null;
    };

    this.onUpdate = function (fn, scope) {
        _this.queue.push({
            fn: fn,
            scope: scope
        });
    };

    this.onAfterUpdate = function (fn, scope) {
        _this.afterQueue.push({
            fn: fn,
            scope: scope
        });
    };
};

exports.default = RAF;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.prettyPrintMatrix = prettyPrintMatrix;
exports.makePerspectiveMatrix = makePerspectiveMatrix;
exports.radify = radify;
exports.degreeify = degreeify;

var _three = __webpack_require__(0);

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prettyPrintMatrix(uglymatrix) {
  for (var s = 0; s < 4; s += 1) {
    var quartet = [uglymatrix[s], uglymatrix[s + 4], uglymatrix[s + 8], uglymatrix[s + 12]];
    console.log(quartet.map(function (num) {
      return num.toFixed(4);
    })); // eslint-disable-line
  }
}

function makePerspectiveMatrix(fovy, aspect, near, far) {
  var out = new _three2.default.Matrix4();
  var f = 1.0 / Math.tan(fovy / 2);
  var nf = 1 / (near - far);
  out.elements[0] = f / aspect;
  out.elements[1] = 0;
  out.elements[2] = 0;
  out.elements[3] = 0;
  out.elements[4] = 0;
  out.elements[5] = f;
  out.elements[6] = 0;
  out.elements[7] = 0;
  out.elements[8] = 0;
  out.elements[9] = 0;
  out.elements[10] = (far + near) * nf;
  out.elements[11] = -1;
  out.elements[12] = 0;
  out.elements[13] = 0;
  out.elements[14] = 2 * far * near * nf;
  out.elements[15] = 0;
  return out;
}

// gimme radians
function radify(deg) {
  if ((typeof deg === 'undefined' ? 'undefined' : _typeof(deg)) === 'object') {
    return deg.map(function (degree) {
      return Math.PI * 2 * degree / 360;
    });
  }

  return Math.PI * 2 * deg / 360;
}

// gimme degrees
function degreeify(rad) {
  return 360 * rad / (Math.PI * 2);
}

/***/ })
/******/ ]);
//# sourceMappingURL=threebox.js.map