module.exports = {
    entry: './src/index.js',
    mode: 'production',
    output: {
        filename: 'extension.js',
        path: __dirname,
        library: {
            type: "module",
        }
    },
    experiments: {
        outputModule: true,
    }
};