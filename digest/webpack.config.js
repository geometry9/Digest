module.exports = {
    entry  : './public/javascripts/src/entry.js',
    output : {
        path     : __dirname + '/public/javascripts/',
        filename : 'bundle.js'
    },
    module : {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
      ]
    }
};
