const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const isProduction = "production" === process.env.NODE_ENV;
const { entryPoints } = require("./pluginMachine.json");

const entry = {};
if (entryPoints.hasOwnProperty("blocks")) {
	entryPoints.blocks.forEach((entryPoint) => {
		entry[`block-${entryPoint}`] = path.resolve(
			process.cwd(),
			`blocks/${entryPoint}/index.js`
		);
	});
}

if (entryPoints.hasOwnProperty("adminPages")) {
	entryPoints.adminPages.forEach((entryPoint) => {
		entry[`admin-page-${entryPoint}`] = path.resolve(
			process.cwd(),
			`admin/${entryPoint}/index.js`
		);
	});
}

entry[`./assets/js/blocks.frontend`] =
	"./blocks/three-object-block/frontend.js";

entry[`./assets/js/blocks.frontend-versepress`] =
	"./blocks/environment/frontend.js";

module.exports = {
	mode: isProduction ? "production" : "development",
	...defaultConfig,
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			{
				test: /\.css$/,
				use: ["style-loader", "sass-loader", "css-loader"]
			},
			{
				test: /\.glsl$/,
				include: [path.resolve(__dirname, "node_modules/three-icosa")],
				use: "webpack-glsl"
			},
			{
				test: /\.js$/,
				include: [path.resolve(__dirname, "node_modules/three-icosa")],
				use: "babel-loader"
			},
			{
				test: /\.vrm$/,
				use: [
					{
						loader: "file-loader"
					}
				]
			},
			{
				test: /\.glb$/,
				use: [
					{
						loader: "file-loader"
					}
				]
			},
			{
				test: /\.fbx$/,
				use: [
					{
						loader: "file-loader"
					}
				]
			}
		]
	},
	entry,
	output: {
		filename: "[name].js",
		path: path.join(__dirname, "./build")
	},
	// externals: {
	// 	react: "React",
	// 	"react-dom": "ReactDOM",
	// },
	resolve: {
		modules: ['node_modules'],
		extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],	  
		alias: {
			Brushes: path.resolve(__dirname, "brushes"),
			// React: path.resolve(__dirname, 'node_modules/react'),
			// react: path.resolve(__dirname, 'node_modules/react'),
			// ReactDOM: path.resolve(__dirname, 'node_modules/react-dom'),
			// "react-dom": path.resolve(__dirname, 'node_modules/react-dom'),
			// "React-dom": path.resolve(__dirname, 'node_modules/react-dom'),
		}
	}
};
