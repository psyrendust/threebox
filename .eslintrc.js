module.exports = {
    parser: 'babel-eslint',
    extends: 'airbnb',
    env: {
        node: true,
        browser: true,
        'jest/globals': true,
    },
    plugins: [
        'jest',
    ],
    rules: {
        indent: [ 2, 4 ],
        'react/jsx-indent': [ 2, 4 ],
        'react/require-extension': 0,
        'react/forbid-prop-types': 0,
        'no-console': 'error',
        'no-param-reassign': [ 'error', { props: false } ],
        'no-multiple-empty-lines': [ 2, { max: 1, maxEOF: 1 } ],
        'no-underscore-dangle': [
            'error', {
                allow: [ '__INITIAL_STATE__', '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__' ],
            },
        ],
        'max-len': [ 2, {
            code: 120,
            tabWidth: 4,
            ignoreUrls: true,
            ignoreComments: false,
            ignoreRegExpLiterals: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
        } ],
        'comma-dangle': [ 'error', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'never',
        } ],

        // Preference for Lyft, especially helpful with constant files
        'import/prefer-default-export': 0,

        // TODO Deeper investigation if we should enable this or not
        'react/require-default-props': 0,

        // TODO - Fix this so it will correctly follow webpack resolutions too
        'import/no-unresolved': 0,
        'import/no-extraneous-dependencies': 0,
        'import/extensions': 0,
    },
};
