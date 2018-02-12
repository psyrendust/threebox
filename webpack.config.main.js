const path = require('path');
const config = require('./webpack.config');

module.exports = {
    ...config,
    entry: {
        home: path.join(__dirname, 'src', 'Threebox.js'),
    },

    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'threebox.js',
        sourceMapFilename: '[file].map',
    },
};
