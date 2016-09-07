module.exports = {
    entry  : './public/javascripts/src/entry.js',
    output : {
        path     : __dirname,
        filename : 'bundle.js'
    },
    module : {
        loaders: [ {
                test   : /.js$/,
                loader : 'babel-loader'
            }
        ]
    }
};
