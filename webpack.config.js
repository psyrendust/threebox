const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');

module.exports = {
    target: 'web',

    resolve: {
        modules: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'flocking-gpgpu'),
            path.join(__dirname, 'node_modules'),
        ],
    },

    module: {
        rules: [
      // First, run the linter.
      // It's important to do this before Babel processes the JS.
            {
                test: /\.(js)$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            formatter: eslintFormatter,
                            eslintPath: require.resolve('eslint'),

                        },
                        loader: require.resolve('eslint-loader'),
                    },
                ],
                include: [
                    path.join(__dirname, 'src'),
                    path.join(__dirname, 'flocking-gpgpu'),
                ],
            },
            {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
                oneOf: [
          // rule for .js files
                    {
                        test: /\.(js)$/,
                        include: [
                            path.join(__dirname, 'src'),
                            path.join(__dirname, 'flocking-gpgpu'),
                        ],
                        exclude: [
                            path.join(__dirname, 'node_modules'),
                        ],
                        use: {
                            loader: 'babel-loader',
                        },
                    },
          // rule for .css files
                    {
                        test: /\.css$/,
                        include: [
                            path.join(__dirname, 'src'),
                            path.join(__dirname, 'flocking-gpgpu'),
                            path.join(__dirname, 'node_modules'),
                        ],
                        use: ['style-loader', 'css-loader'],
                    },
          // rule for .scss files
                    {
                        test: /\.(sass|scss)$/,
                        include: [
                            path.join(__dirname, 'src'),
                            path.join(__dirname, 'flocking-gpgpu'),
                            path.join(__dirname, 'node_modules'),
                        ],
                        use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }),
                    },
          // rule for .glsl files (shaders)
                    {
                        test: /\.glsl$/,
                        use: [
                            {
                                loader: 'webpack-glsl-loader',
                            },
                        ],
                    },
                    {
                        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                        },
                    },
                ],
            },
        ],
    },

    devtool: 'cheap-module-source-map',

    plugins: [
        new ExtractTextPlugin({
            filename: 'threebox.css',
        }),
    ],

    stats: {
        colors: true,
        reasons: true,
        chunks: false,
        modules: false,
        warnings: false,
    },

    performance: {
        hints: 'warning',
    },

};
