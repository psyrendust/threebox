const path = require('path');
const config = require('./webpack.config');

module.exports = {
    ...config,
    entry: {
        home: path.join(__dirname, 'flocking-gpgpu', 'index.js'),
    },

    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'flocking.js',
        sourceMapFilename: '[file].map',
    },
};
