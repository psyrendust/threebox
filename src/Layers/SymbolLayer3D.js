import THREE from '../three';
import valueGenerator from '../Utils/valueGenerator';

function SymbolLayer3D(parent, options) {
  if (options === undefined) {
    console.error('Invalid options provided to SymbolLayer3D'); // eslint-disable-line
    return;
  }
    // TODO: Better error handling here

  if (options.scale === undefined) options.scale = 1.0;
  if (options.rotation === undefined) options.rotation = 0;
  if (options.scaleWithMapProjection === undefined) options.scaleWithMapProjection = true;
  if (options.key === undefined || options.key === '' || (typeof options.key === 'object' && options.key.property === undefined && options.key.generator === undefined)) { // eslint-disable-line
    options.key = {
      generator: (val, i) => i,
    };
    console.warn('Using array index for SymbolLayer3D key property.'); // eslint-disable-line
  }

  this.parent = parent;

  this.id = options.id;
  this.keyGen = valueGenerator(options.key);
  if (typeof options.source === 'string') { this.sourcePath = options.source; } else { this.source = options.source; }

  this.modelDirectoryGen = valueGenerator(options.modelDirectory);
  this.modelNameGen = valueGenerator(options.modelName);
  this.rotationGen = valueGenerator(options.rotation);
  this.scaleGen = valueGenerator(options.scale);
  this.models = Object.create(null);
  this.features = Object.create(null);
  this.scaleWithMapProjection = options.scaleWithMapProjection;

  this.loaded = false;

  if (this.sourcePath) {
        // Load source and models
    const sourceLoader = new THREE.FileLoader();

    sourceLoader.load(this.sourcePath, (data) => {
      this.source = JSON.parse(data);
            // TODO: Handle invalid GeoJSON

      this._initialize();
    }, () => (null), (error) => {
      return console.error('Could not load SymbolLayer3D source file.'); // eslint-disable-line
    });
  } else {
    this._initialize();
  }
}

SymbolLayer3D.prototype = {
  updateSourceData(source, absolute) {
    const oldFeatures = {};

    if (!source.features) {
      console.error("updateSourceData expects a GeoJSON FeatureCollection with a 'features' property"); // eslint-disable-line
      return;
    }
    source.features.forEach((feature, i) => {
      const key = this.keyGen(feature, i); // TODO: error handling
      if (key in this.features) {
                // Update
        this.features[key].geojson = feature;
        oldFeatures[key] = feature;
      } else {
                // Create
        const modelDirectory = this.modelDirectoryGen(feature, i);
        const modelName = this.modelNameGen(feature, i);

                // TODO: Handle loading of new models
        this.features[key] = {
          geojson: feature,
          model: modelDirectory + modelName,
        };
      }
    });

    this._addOrUpdateFeatures(this.features);

    if (absolute) {
      // Check for any features that are not have not been updated and remove them from the scene
      Object.keys(this.features).forEach((key) => {
        if (!(key in oldFeatures)) {
          this.removeFeature(key);
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
  removeFeature(key) {
    this.parent.remove(this.features[key].rawObject);
    delete this.features[key];
  },
  _initialize() {
    const modelNames = [];

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
    this.source.features.forEach((f, i) => {
      const key = this.keyGen(f, i); // TODO: error handling
      if (this.features[key] !== undefined) {
        console.warn(`Features with duplicate key: ${key}`); // eslint-disable-line
      }

      const modelDirectory = this.modelDirectoryGen(f, i);
      const modelName = this.modelNameGen(f, i);
      this.features[key] = {
        geojson: f,
        model: modelDirectory + modelName,
      };

      modelNames.push({directory: modelDirectory, name: modelName});
    });

        // Filter out only unique models
    modelNames.forEach((mod) => {
      this.models[(mod.directory + mod.name)] = {
        directory: mod.directory,
        name: mod.name,
        loaded: false,
      };
    });

    // And load models asynchronously
    let remaining = Object.keys(this.models).length;
    console.log(`Loading ${remaining} models`, this.models); // eslint-disable-line
    const modelComplete = (mod) => {
      console.log('Model complete!', mod); // eslint-disable-line
      remaining -= 1;
      if (remaining === 0) {
        this.loaded = true;
        this._addOrUpdateFeatures(this.features);
      }
    };

    Object.keys(this.models).forEach((modelKey) => {
      // TODO: Support formats other than OBJ/MTL
      const objLoader = new THREE.OBJLoader();
      const materialLoader = new THREE.MTLLoader();

      const loadObject = ((modelName) => {
        return (materials) => {
          // Closure madness!
          if (materials) {
            materials.preload();

            Object.keys(materials.materials).forEach((matKey) => {
              materials.materials[matKey].shininess /= 50;  // Shininess exported by Blender is way too high
            });

            objLoader.setMaterials(materials);
          }
          objLoader.setPath(this.models[modelName].directory);

          console.log('Loading model ', modelName); // eslint-disable-line

          objLoader.load(`${this.models[modelName].name}.obj`, (obj) => {
            this.models[modelName].obj = obj;
            this.models[modelName].isMesh = obj.isMesh;
            this.models[modelName].loaded = true;

            modelComplete(modelName);
          }, () => (null), (error) => {
            console.error('Could not load SymbolLayer3D model file.'); // eslint-disable-line
          });
        };
      })(modelKey);

      materialLoader.setPath(this.models[modelKey].directory);
      materialLoader.load(`${this.models[modelKey].name}.mtl`, loadObject, () => (null), (error) => {
        console.warn(`No material file found for SymbolLayer3D model ${model}`); // eslint-disable-line
        loadObject();
      });
    });
  },
  _addOrUpdateFeatures(features) {
    Object.keys(features).forEach((key) => {
      const f = features[key];
      const position = f.geojson.geometry.coordinates;
      const scale = this.scaleGen(f.geojson);

      const rotation = this.rotationGen(f.geojson);

      let obj;
      if (!f.rawObject) {
        // Need to create a scene graph object and add it to the scene
        if (f.model && this.models[f.model] && this.models[f.model].obj && this.models[f.model].loaded) { obj = this.models[f.model].obj.clone(); } else {
          console.warn(`Model not loaded: ${f.model}`); // eslint-disable-line
          obj = new THREE.Group();    // Temporary placeholder if the model doesn't exist and/or will be loaded later
        }

        f.rawObject = obj;

        this.parent.addAtCoordinate(obj, position, {scaleToLatitude: this.scaleWithMapProjection, preScale: scale});
                // this.features[key] = f;
      } else {
        obj = f.rawObject;
        this.parent.moveToCoordinate(obj, position, {scaleToLatitude: this.scaleWithMapProjection, preScale: scale});
      }

      obj.rotation.copy(rotation);
    });
  },
};

module.exports = SymbolLayer3D;
