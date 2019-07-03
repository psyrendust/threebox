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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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


var _BirdFlocking = __webpack_require__(2);

var _BirdFlocking2 = _interopRequireDefault(_BirdFlocking);

var _mapboxgl = __webpack_require__(12);

var _mapboxgl2 = _interopRequireDefault(_mapboxgl);

var _config = __webpack_require__(13);

var _config2 = _interopRequireDefault(_config);

var _stats = __webpack_require__(14);

var _stats2 = _interopRequireDefault(_stats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mapboxgl2.default.accessToken = _config2.default.accessToken;
// import OldFlocking from './OldFlocking';

var map = new _mapboxgl2.default.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [-122.4131, 37.7743],
    zoom: 13,
    pitch: 60,
    hash: false
});
map.addControl(new _mapboxgl2.default.NavigationControl(), 'bottom-right');

map.on('load', function () {
    // const oldFlocking = new OldFlocking(map);
    // const threebox = oldFlocking.threebox;
    var birdFlocking = new _BirdFlocking2.default(map);
    var threebox = birdFlocking.threebox;
    var container = document.querySelector('body');
    var stats = new _stats2.default();
    container.appendChild(stats.dom);

    // oldFlocking.drive();
    birdFlocking.init();
    threebox.onAfterUpdate(function () {
        stats.update();
    });
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _three = __webpack_require__(0);

var _three2 = _interopRequireDefault(_three);

var _gpucomputationrenderThreejs = __webpack_require__(3);

var _dat = __webpack_require__(4);

var _dat2 = _interopRequireDefault(_dat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var birdShaders = __webpack_require__(5); /* eslint no-bitwise: 0 */

var positionShaders = __webpack_require__(8);
var velocityShaders = __webpack_require__(10);

var hash = document.location.hash.substr(1);
if (hash) hash = parseInt(hash, 0);

/* TEXTURE WIDTH FOR SIMULATION */
var WIDTH = hash || 32;

var BIRDS = WIDTH * WIDTH;

// Custom Geometry - using 3 triangles each. No UVs, no normals currently.
_three2.default.BirdGeometry = function BirdGeometry() {
    var triangles = BIRDS * 3;
    var points = triangles * 3;

    _three2.default.BufferGeometry.call(this);

    var vertices = new _three2.default.BufferAttribute(new Float32Array(points * 3), 3);
    var birdColors = new _three2.default.BufferAttribute(new Float32Array(points * 3), 3);
    var references = new _three2.default.BufferAttribute(new Float32Array(points * 2), 2);
    var birdVertex = new _three2.default.BufferAttribute(new Float32Array(points), 1);

    this.addAttribute('position', vertices);
    this.addAttribute('birdColor', birdColors);
    this.addAttribute('reference', references);
    this.addAttribute('birdVertex', birdVertex);

    // this.addAttribute( 'normal', new Float32Array( points * 3 ), 3 );


    var vert = 0;

    function vertsPush() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        for (var _i = 0; _i < arguments.length; _i += 1) {
            vertices.array[vert] = args[_i];
            vert += 1;
        }
    }

    var wingsSpan = 20;

    for (var f = 0; f < BIRDS; f += 1) {
        // Body
        vertsPush(0, -0, -20, 0, 4, -20, 0, 0, 30);

        // Left Wing
        vertsPush(0, 0, -15, -wingsSpan, 0, 0, 0, 0, 15);

        // Right Wing
        vertsPush(0, 0, 15, wingsSpan, 0, 0, 0, 0, -15);
    }

    for (var vtx = 0; vtx < triangles * 3; vtx += 1) {
        var _i2 = ~~(vtx / 3);
        var x = _i2 % WIDTH / WIDTH;
        var y = ~~(_i2 / WIDTH) / WIDTH;

        var c = new _three2.default.Color(0x444444 + ~~(vtx / 9) / BIRDS * 0x666666);

        birdColors.array[vtx * 3 + 0] = c.r;
        birdColors.array[vtx * 3 + 1] = c.g;
        birdColors.array[vtx * 3 + 2] = c.b;

        references.array[vtx * 2] = x;
        references.array[vtx * 2 + 1] = y;

        birdVertex.array[vtx] = vtx % 9;
    }

    this.scale(0.2, 0.2, 0.2);
};

_three2.default.BirdGeometry.prototype = Object.create(_three2.default.BufferGeometry.prototype);

var threebox = void 0;
var stats = void 0;
var scene = void 0;
var renderer = void 0;
var i = void 0;
var mouseX = 0;
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var BOUNDS = 800;
var BOUNDS_HALF = BOUNDS / 2;

document.getElementById('cars').innerText = BIRDS;

function change(val) {
    location.hash = val;
    location.reload();
    return false;
}

var options = document.createDocumentFragment();

var _loop = function _loop() {
    var j = Math.pow(2, i); // eslint-disable-line
    var link = document.createElement('a');
    link.textContent = '' + j * j;
    link.href = '#';
    link.onclick = function () {
        return change(j);
    };
    options.appendChild(link);
};

for (i = 1; i < 7; i += 1) {
    _loop();
}
document.getElementById('options').appendChild(options);

var last = performance.now();

var gpuCompute = void 0;
var velocityVariable = void 0;
var positionVariable = void 0;
var positionUniforms = void 0;
var velocityUniforms = void 0;
var birdUniforms = void 0;

function fillPositionTexture(texture) {
    var theArray = texture.image.data;

    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
        var x = Math.random() * BOUNDS - BOUNDS_HALF;
        var y = Math.random() * BOUNDS - BOUNDS_HALF;
        var z = Math.random() * BOUNDS - BOUNDS_HALF;

        theArray[k + 0] = x;
        theArray[k + 1] = y;
        theArray[k + 2] = z;
        theArray[k + 3] = 1;
    }
}

function fillVelocityTexture(texture) {
    var theArray = texture.image.data;

    for (var k = 0, kl = theArray.length; k < kl; k += 4) {
        var x = Math.random() - 0.5;
        var y = Math.random() - 0.5;
        var z = Math.random() - 0.5;

        theArray[k + 0] = x * 10;
        theArray[k + 1] = y * 10;
        theArray[k + 2] = z * 10;
        theArray[k + 3] = 1;
    }
}

function initComputeRenderer() {
    gpuCompute = new _gpucomputationrenderThreejs.GPUComputationRenderer(WIDTH, WIDTH, renderer);

    var dtPosition = gpuCompute.createTexture();
    var dtVelocity = gpuCompute.createTexture();
    fillPositionTexture(dtPosition);
    fillVelocityTexture(dtVelocity);

    velocityVariable = gpuCompute.addVariable('textureVelocity', velocityShaders.fragmentShader, dtVelocity);
    positionVariable = gpuCompute.addVariable('texturePosition', positionShaders.fragmentShader, dtPosition);

    gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);

    positionUniforms = positionVariable.material.uniforms;
    velocityUniforms = velocityVariable.material.uniforms;

    positionUniforms.time = { value: 0.0 };
    positionUniforms.delta = { value: 0.0 };
    velocityUniforms.time = { value: 1.0 };
    velocityUniforms.delta = { value: 0.0 };
    velocityUniforms.testing = { value: 1.0 };
    velocityUniforms.seperationDistance = { value: 1.0 };
    velocityUniforms.alignmentDistance = { value: 1.0 };
    velocityUniforms.cohesionDistance = { value: 1.0 };
    velocityUniforms.freedomFactor = { value: 1.0 };
    velocityUniforms.predator = { value: new _three2.default.Vector3() };
    velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed(2);

    velocityVariable.wrapS = _three2.default.RepeatWrapping;
    velocityVariable.wrapT = _three2.default.RepeatWrapping;
    positionVariable.wrapS = _three2.default.RepeatWrapping;
    positionVariable.wrapT = _three2.default.RepeatWrapping;

    var error = gpuCompute.init();
    if (error !== null) {
        console.error(error); // eslint-disable-line
    }
}

function initBirds() {
    var geometry = new _three2.default.BirdGeometry();

    // For Vertex and Fragment
    birdUniforms = {
        color: { value: new _three2.default.Color(0xff2200) },
        texturePosition: { value: null },
        textureVelocity: { value: null },
        time: { value: 1.0 },
        delta: { value: 0.0 }
    };

    // ShaderMaterial
    var material = new _three2.default.ShaderMaterial({
        uniforms: birdUniforms,
        vertexShader: birdShaders.vertexShader,
        fragmentShader: birdShaders.fragmentShader,
        side: _three2.default.DoubleSide
    });

    var birdMesh = new _three2.default.Mesh(geometry, material);
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
    var now = performance.now();
    var delta = (now - last) / 1000;

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
    scene = threebox.world;
    renderer = threebox.renderer;

    initComputeRenderer();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);

    //

    // window.addEventListener('resize', onWindowResize, false);


    var gui = new _dat2.default.GUI();

    var effectController = {
        seperation: 20.0,
        alignment: 20.0,
        cohesion: 20.0,
        freedom: 0.75
    };

    var valuesChanger = function valuesChanger() {
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

    threebox.onRender(function () {
        render();
    });
}

function BirdFlocking(map) {
    threebox = new window.Threebox(map);
    threebox.setupDefaultLights();
    this.threebox = threebox;
    this.init = function () {
        init();
    };
}

module.exports = BirdFlocking;

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["GPUComputationRenderer"] = GPUComputationRenderer;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_three__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_three___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_three__);
/**
 * @author yomboprime https://github.com/yomboprime
 *
 * GPUComputationRenderer, based on SimulationRenderer by zz85
 *
 * The GPUComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats
 * for each compute element (texel)
 *
 * Each variable has a fragment shader that defines the computation made to obtain the variable in question.
 * You can use as many variables you need, and make dependencies so you can use textures of other variables in the shader
 * (the sampler uniforms are added automatically) Most of the variables will need themselves as dependency.
 *
 * The renderer has actually two render targets per variable, to make ping-pong. Textures from the current frame are used
 * as inputs to render the textures of the next frame.
 *
 * The render targets of the variables can be used as input textures for your visualization shaders.
 *
 * Variable names should be valid identifiers and should not collide with THREE GLSL used identifiers.
 * a common approach could be to use 'texture' prefixing the variable name; i.e texturePosition, textureVelocity...
 *
 * The size of the computation (sizeX * sizeY) is defined as 'resolution' automatically in the shader. For example:
 * #DEFINE resolution vec2( 1024.0, 1024.0 )
 *
 * -------------
 *
 * Basic use:
 *
 * // Initialization...
 *
 * // Create computation renderer
 * var gpuCompute = new GPUComputationRenderer( 1024, 1024, renderer );
 *
 * // Create initial state float textures
 * var pos0 = gpuCompute.createTexture();
 * var vel0 = gpuCompute.createTexture();
 * // and fill in here the texture data...
 *
 * // Add texture variables
 * var velVar = gpuCompute.addVariable( "textureVelocity", fragmentShaderVel, pos0 );
 * var posVar = gpuCompute.addVariable( "texturePosition", fragmentShaderPos, vel0 );
 *
 * // Add variable dependencies
 * gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );
 * gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );
 *
 * // Add custom uniforms
 * velVar.material.uniforms.time = { value: 0.0 };
 *
 * // Check for completeness
 * var error = gpuCompute.init();
 * if ( error !== null ) {
 *		console.error( error );
 * }
 *
 *
 * // In each frame...
 *
 * // Compute!
 * gpuCompute.compute();
 *
 * // Update texture uniforms in your visualization materials with the gpu renderer output
 * myMaterial.uniforms.myTexture.value = gpuCompute.getCurrentRenderTarget( posVar ).texture;
 *
 * // Do your rendering
 * renderer.render( myScene, myCamera );
 *
 * -------------
 *
 * Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures)
 * Note that the shaders can have multiple input textures.
 *
 * var myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );
 * var myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );
 *
 * var inputTexture = gpuCompute.createTexture();
 *
 * // Fill in here inputTexture...
 *
 * myFilter1.uniforms.theTexture.value = inputTexture;
 *
 * var myRenderTarget = gpuCompute.createRenderTarget();
 * myFilter2.uniforms.theTexture.value = myRenderTarget.texture;
 *
 * var outputRenderTarget = gpuCompute.createRenderTarget();
 *
 * // Now use the output texture where you want:
 * myMaterial.uniforms.map.value = outputRenderTarget.texture;
 *
 * // And compute each frame, before rendering to screen:
 * gpuCompute.doRenderTarget( myFilter1, myRenderTarget );
 * gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );
 *
 *
 *
 * @param {int} sizeX Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {int} sizeY Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {WebGLRenderer} renderer The renderer
  */



function GPUComputationRenderer( sizeX, sizeY, renderer ) {

	this.variables = [];

	this.currentTextureIndex = 0;

	let scene = new __WEBPACK_IMPORTED_MODULE_0_three__["Scene"]();
	let camera = new __WEBPACK_IMPORTED_MODULE_0_three__["Camera"]();
	camera.position.z = 1;

	let passThruUniforms = {
		texture: { value: null }
	};

	let passThruShader = createShaderMaterial( getPassThroughFragmentShader(), passThruUniforms );

	let mesh = new __WEBPACK_IMPORTED_MODULE_0_three__["Mesh"]( new __WEBPACK_IMPORTED_MODULE_0_three__["PlaneBufferGeometry"]( 2, 2 ), passThruShader );
	scene.add( mesh );

	this.addVariable = function( variableName, computeFragmentShader, initialValueTexture ) {

		let material = this.createShaderMaterial( computeFragmentShader );

		let variable = {
			name: variableName,
			initialValueTexture,
			material,
			dependencies: null,
			renderTargets: [],
			wrapS: null,
			wrapT: null,
			minFilter: __WEBPACK_IMPORTED_MODULE_0_three__["NearestFilter"],
			magFilter: __WEBPACK_IMPORTED_MODULE_0_three__["NearestFilter"]
		};

		this.variables.push( variable );

		return variable;

	};

	this.setVariableDependencies = function( variable, dependencies ) {

		variable.dependencies = dependencies;

	};

	this.init = function() {

		if ( ! renderer.extensions.get( "OES_texture_float" ) ) {

			return "No OES_texture_float support for float textures.";

		}

		if ( renderer.capabilities.maxVertexTextures === 0 ) {

			return "No support for vertex shader textures.";

		}

		for ( let i = 0; i < this.variables.length; i++ ) {

			let variable = this.variables[ i ];

			// Creates rendertargets and initialize them with input texture
			variable.renderTargets[ 0 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
			variable.renderTargets[ 1 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
			this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 0 ] );
			this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 1 ] );

			// Adds dependencies uniforms to the ShaderMaterial
			let material = variable.material;
			let uniforms = material.uniforms;
			if ( variable.dependencies !== null ) {
				for ( let d = 0; d < variable.dependencies.length; d++ ) {

					let depVar = variable.dependencies[ d ];

					if ( depVar.name !== variable.name ) {

						// Checks if variable exists
						let found = false;
						for ( let j = 0; j < this.variables.length; j++ ) {

							if ( depVar.name === this.variables[ j ].name ) {
								found = true;
								break;
							}

						}
						if ( ! found ) {
							return "Variable dependency not found. Variable=" + variable.name + ", dependency=" + depVar.name;
						}

					}

					uniforms[ depVar.name ] = { value: null };

					material.fragmentShader = "\nuniform sampler2D " + depVar.name + ";\n" + material.fragmentShader;

				}
			}
		}

		this.currentTextureIndex = 0;

		return null;

	};

	this.compute = function() {

		let currentTextureIndex = this.currentTextureIndex;
		let nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

		for ( let i = 0, il = this.variables.length; i < il; i++ ) {

			let variable = this.variables[ i ];

			// Sets texture dependencies uniforms
			if ( variable.dependencies !== null ) {

				let uniforms = variable.material.uniforms;
				for ( let d = 0, dl = variable.dependencies.length; d < dl; d++ ) {

					let depVar = variable.dependencies[ d ];

					uniforms[ depVar.name ].value = depVar.renderTargets[ currentTextureIndex ].texture;

				}

			}

			// Performs the computation for this variable
			this.doRenderTarget( variable.material, variable.renderTargets[ nextTextureIndex ] );

		}

		this.currentTextureIndex = nextTextureIndex;
	};

	this.getCurrentRenderTarget = function( variable ) {

		return variable.renderTargets[ this.currentTextureIndex ];

	};

	this.getAlternateRenderTarget = function( variable ) {

		return variable.renderTargets[ this.currentTextureIndex === 0 ? 1 : 0 ];

	};

	function addResolutionDefine( materialShader ) {

		materialShader.defines.resolution = 'vec2( ' + sizeX.toFixed( 1 ) + ', ' + sizeY.toFixed( 1 ) + " )";

	};

	this.addResolutionDefine = addResolutionDefine;

	// The following functions can be used to compute things manually

	function createShaderMaterial( computeFragmentShader, uniforms ) {

		uniforms = uniforms || {};

		let material = new __WEBPACK_IMPORTED_MODULE_0_three__["ShaderMaterial"]( {
			uniforms,
			vertexShader: getPassThroughVertexShader(),
			fragmentShader: computeFragmentShader
		} );

		addResolutionDefine( material );

		return material;
	};

	this.createShaderMaterial = createShaderMaterial;

	this.createRenderTarget = function( sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter ) {

		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		wrapS = wrapS || __WEBPACK_IMPORTED_MODULE_0_three__["ClampToEdgeWrapping"];
		wrapT = wrapT || __WEBPACK_IMPORTED_MODULE_0_three__["ClampToEdgeWrapping"];

		minFilter = minFilter || __WEBPACK_IMPORTED_MODULE_0_three__["NearestFilter"];
		magFilter = magFilter || __WEBPACK_IMPORTED_MODULE_0_three__["NearestFilter"];

		let renderTarget = new __WEBPACK_IMPORTED_MODULE_0_three__["WebGLRenderTarget"]( sizeXTexture, sizeYTexture, {
			wrapS,
			wrapT,
			minFilter,
			magFilter,
			format: __WEBPACK_IMPORTED_MODULE_0_three__["RGBAFormat"],
			type: ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? __WEBPACK_IMPORTED_MODULE_0_three__["HalfFloatType"] : __WEBPACK_IMPORTED_MODULE_0_three__["FloatType"],
			stencilBuffer: false
		} );

		return renderTarget;

	};

	this.createTexture = function( sizeXTexture, sizeYTexture ) {

		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		let a = new Float32Array( sizeXTexture * sizeYTexture * 4 );
		let texture = new __WEBPACK_IMPORTED_MODULE_0_three__["DataTexture"]( a, sizeX, sizeY, __WEBPACK_IMPORTED_MODULE_0_three__["RGBAFormat"], __WEBPACK_IMPORTED_MODULE_0_three__["FloatType"] );
		texture.needsUpdate = true;

		return texture;

	};

	this.renderTexture = function( input, output ) {

		// Takes a texture, and render out in rendertarget
		// input = Texture
		// output = RenderTarget

		passThruUniforms.texture.value = input;

		this.doRenderTarget( passThruShader, output);

		passThruUniforms.texture.value = null;

	};

	this.doRenderTarget = function( material, output ) {

		mesh.material = material;
		renderer.render( scene, camera, output );
		mesh.material = passThruShader;

	};

	// Shaders

	function getPassThroughVertexShader() {
		return	`void main(){
					gl_Position = vec4( position, 1.0 );
				}`;
	};

	function getPassThroughFragmentShader() {
		return	`uniform sampler2D texture;
				void main() {
					vec2 uv = gl_FragCoord.xy / resolution.xy;
					gl_FragColor = texture2D( texture, uv );
				}`;
	};

}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var dat = window.dat;
exports.default = dat;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _FragmentShader = __webpack_require__(6);

var _FragmentShader2 = _interopRequireDefault(_FragmentShader);

var _VertexShader = __webpack_require__(7);

var _VertexShader2 = _interopRequireDefault(_VertexShader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var shaders = {
    fragment: _FragmentShader2.default,
    vertex: _VertexShader2.default
};

exports.default = shaders;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = "varying vec4 vColor;\nvarying float z;\n\nuniform vec3 color;\n\nvoid main() {\n  // Fake colors for now\n  float z2 = 0.2 + ( 1000. - z ) / 1000. * vColor.x;\n  gl_FragColor = vec4( z2, z2, z2, 1. );\n\n}\n"

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = "attribute vec2 reference;\nattribute float birdVertex;\n\nattribute vec3 birdColor;\n\nuniform sampler2D texturePosition;\nuniform sampler2D textureVelocity;\n\nvarying vec4 vColor;\nvarying float z;\n\nuniform float time;\n\nvoid main() {\n\n  vec4 tmpPos = texture2D( texturePosition, reference );\n  vec3 pos = tmpPos.xyz;\n  vec3 velocity = normalize(texture2D( textureVelocity, reference ).xyz);\n\n  vec3 newPosition = position;\n\n  if ( birdVertex == 4.0 || birdVertex == 7.0 ) {\n    // flap wings\n    newPosition.y = sin( tmpPos.w ) * 5.;\n  }\n\n  newPosition = mat3( modelMatrix ) * newPosition;\n\n\n  velocity.z *= -1.;\n  float xz = length( velocity.xz );\n  float xyz = 1.;\n  float x = sqrt( 1. - velocity.y * velocity.y );\n\n  float cosry = velocity.x / xz;\n  float sinry = velocity.z / xz;\n\n  float cosrz = x / xyz;\n  float sinrz = velocity.y / xyz;\n\n  mat3 maty =  mat3(\n    cosry, 0, -sinry,\n    0    , 1, 0     ,\n    sinry, 0, cosry\n\n  );\n\n  mat3 matz =  mat3(\n    cosrz , sinrz, 0,\n    -sinrz, cosrz, 0,\n    0     , 0    , 1\n  );\n\n  newPosition =  maty * matz * newPosition;\n  newPosition += pos;\n\n  z = newPosition.z;\n\n  vColor = vec4( birdColor, 1.0 );\n  gl_Position = projectionMatrix *  viewMatrix  * vec4( newPosition, 1.0 );\n}\n"

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _FragmentShader = __webpack_require__(9);

var _FragmentShader2 = _interopRequireDefault(_FragmentShader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var shaders = {
    fragment: _FragmentShader2.default
};

exports.default = shaders;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = "uniform float time;\nuniform float delta;\n\nvoid main()\t{\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec4 tmpPos = texture2D( texturePosition, uv );\n  vec3 position = tmpPos.xyz;\n  vec3 velocity = texture2D( textureVelocity, uv ).xyz;\n\n  float phase = tmpPos.w;\n\n  phase = mod( ( phase + delta +\n    length( velocity.xz ) * delta * 3. +\n    max( velocity.y, 0.0 ) * delta * 6. ), 62.83 );\n\n  gl_FragColor = vec4( position + velocity * delta * 15. , phase );\n}\n"

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _FragmentShader = __webpack_require__(11);

var _FragmentShader2 = _interopRequireDefault(_FragmentShader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var shaders = {
    fragment: _FragmentShader2.default
};

exports.default = shaders;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = "uniform float time;\nuniform float testing;\nuniform float delta; // about 0.016\nuniform float seperationDistance; // 20\nuniform float alignmentDistance; // 40\nuniform float cohesionDistance; //\nuniform float freedomFactor;\nuniform vec3 predator;\n\nconst float width = resolution.x;\nconst float height = resolution.y;\n\nconst float PI = 3.141592653589793;\nconst float PI_2 = PI * 2.0;\n// const float VISION = PI * 0.55;\n\nfloat zoneRadius = 40.0;\nfloat zoneRadiusSquared = 1600.0;\n\nfloat separationThresh = 0.45;\nfloat alignmentThresh = 0.65;\n\nconst float UPPER_BOUNDS = BOUNDS;\nconst float LOWER_BOUNDS = -UPPER_BOUNDS;\n\nconst float SPEED_LIMIT = 9.0;\n\nfloat rand(vec2 co){\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n\n  zoneRadius = seperationDistance + alignmentDistance + cohesionDistance;\n  separationThresh = seperationDistance / zoneRadius;\n  alignmentThresh = ( seperationDistance + alignmentDistance ) / zoneRadius;\n  zoneRadiusSquared = zoneRadius * zoneRadius;\n\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec3 birdPosition, birdVelocity;\n\n  vec3 selfPosition = texture2D( texturePosition, uv ).xyz;\n  vec3 selfVelocity = texture2D( textureVelocity, uv ).xyz;\n\n  float dist;\n  vec3 dir; // direction\n  float distSquared;\n\n  float seperationSquared = seperationDistance * seperationDistance;\n  float cohesionSquared = cohesionDistance * cohesionDistance;\n\n  float f;\n  float percent;\n\n  vec3 velocity = selfVelocity;\n\n  float limit = SPEED_LIMIT;\n\n  dir = predator * UPPER_BOUNDS - selfPosition;\n  dir.z = 0.;\n  // dir.z *= 0.6;\n  dist = length( dir );\n  distSquared = dist * dist;\n\n  float preyRadius = 150.0;\n  float preyRadiusSq = preyRadius * preyRadius;\n\n\n  // move birds away from predator\n  if (dist < preyRadius) {\n\n    f = ( distSquared / preyRadiusSq - 1.0 ) * delta * 100.;\n    velocity += normalize( dir ) * f;\n    limit += 5.0;\n  }\n\n\n  // if (testing == 0.0) {}\n  // if ( rand( uv + time ) < freedomFactor ) {}\n\n\n  // Attract flocks to the center\n  vec3 central = vec3( 0., 0., 0. );\n  dir = selfPosition - central;\n  dist = length( dir );\n\n  dir.y *= 2.5;\n  velocity -= normalize( dir ) * delta * 5.;\n\n  for (float y=0.0;y<height;y++) {\n    for (float x=0.0;x<width;x++) {\n\n      vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;\n      birdPosition = texture2D( texturePosition, ref ).xyz;\n\n      dir = birdPosition - selfPosition;\n      dist = length(dir);\n\n      if (dist < 0.0001) continue;\n\n      distSquared = dist * dist;\n\n      if (distSquared > zoneRadiusSquared ) continue;\n\n      percent = distSquared / zoneRadiusSquared;\n\n      if ( percent < separationThresh ) { // low\n\n        // Separation - Move apart for comfort\n        f = (separationThresh / percent - 1.0) * delta;\n        velocity -= normalize(dir) * f;\n\n      } else if ( percent < alignmentThresh ) { // high\n\n        // Alignment - fly the same direction\n        float threshDelta = alignmentThresh - separationThresh;\n        float adjustedPercent = ( percent - separationThresh ) / threshDelta;\n\n        birdVelocity = texture2D( textureVelocity, ref ).xyz;\n\n        f = ( 0.5 - cos( adjustedPercent * PI_2 ) * 0.5 + 0.5 ) * delta;\n        velocity += normalize(birdVelocity) * f;\n\n      } else {\n\n        // Attraction / Cohesion - move closer\n        float threshDelta = 1.0 - alignmentThresh;\n        float adjustedPercent = ( percent - alignmentThresh ) / threshDelta;\n\n        f = ( 0.5 - ( cos( adjustedPercent * PI_2 ) * -0.5 + 0.5 ) ) * delta;\n\n        velocity += normalize(dir) * f;\n\n      }\n\n    }\n\n  }\n\n  // this make tends to fly around than down or up\n  // if (velocity.y > 0.) velocity.y *= (1. - 0.2 * delta);\n\n  // Speed Limits\n  if ( length( velocity ) > limit ) {\n    velocity = normalize( velocity ) * limit;\n  }\n\n  gl_FragColor = vec4( velocity, 1.0 );\n\n}\n"

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var mapboxgl = window.mapboxgl;
exports.default = mapboxgl;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
var config = {
    accessToken: 'pk.eyJ1IjoicHN5cmVuZHVzdCIsImEiOiJjajVsZ3RtMXcyZ2Z0MndsbTM2c2VzZTdnIn0.4SXh1jwWtkfJURT7V8kN4w'
};

exports.default = config;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var Stats = window.Stats;
exports.default = Stats;

/***/ })
/******/ ]);
//# sourceMappingURL=flocking.js.map