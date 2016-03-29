
var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
module.exports = {
    //插件项
    plugins: [commonsPlugin],
    //页面入口文件配置
    entry: {
        app : ['./education_app/src/js/app.js','./education_app/js/controllers.js','./education_app/js/directive.js','./education_app/js/service.js','./education_app/js/route.js','./education_app/js/app.js']
    },
    //入口文件输出配置
    output: {
        path: './education_app/dist/js/',
        filename: '[name].bundle.js'},
    module: {	//加载器配置
        loaders: [
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.js$/,
                loader: 'jsx-loader?harmony'
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass?sourceMap'
            },
            {
            test: /\.(png|jpg)$/,
            loader: 'url-loader?limit=8192'}
        ]
    },
    resolve: {	//其它解决方案配置
        root: './education_app',
         //绝对路径
        extensions: ['', '.js', '.json', '.less'],
        alias: {
            AppStore : './education_app/stores/app.js',
            AppControl : './education_app/actions/controllers.js',
            AppService : './education_app/actions/service.js',
            AppDerective : './education_app/actions/service.js',
        }
    }
}