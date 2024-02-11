const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const isProduction = "production" === process.env.NODE_ENV;
const { entryPoints } = require("./pluginMachine.json");
const isPro = process.env.ISPRO === 'true';

const entry = {};
if (entryPoints.hasOwnProperty("blocks")) {
	entryPoints.blocks.forEach((entryPoint) => {
		entry[`block-${entryPoint}`] = path.resolve(
			process.cwd(),
			`blocks/${entryPoint}/index.js`
		);
	});
}

if (isPro) {
	if (entryPoints.hasOwnProperty("proBlocks")) {
		entryPoints.proBlocks.forEach((entryPoint) => {
			entry[`block-${entryPoint}`] = path.resolve(
				process.cwd(),
				`pro/blocks/${entryPoint}/index.js`
			);
		});
	}
}

if (entryPoints.hasOwnProperty("adminPages")) {
	entryPoints.adminPages.forEach((entryPoint) => {
		entry[`admin-page-${entryPoint}`] = path.resolve(
			process.cwd(),
			`admin/${entryPoint}/index.js`
		);
	});
}

if (isPro) {
	if (entryPoints.hasOwnProperty("proAdminPages")) {
		entryPoints.proAdminPages.forEach((entryPoint) => {
			entry[`admin-page-${entryPoint}`] = path.resolve(
				process.cwd(),
				`pro/admin/${entryPoint}/index.js`
			);
		});
	}
}

// entry[`./assets/js/blocks.frontend`] = "./blocks/three-object-block/frontend.js";

entry[`./assets/js/blocks.frontend-versepress`] = "./blocks/environment/frontend.js";

if (isPro) {
    entry[`./assets/js/blocks.three-mirror-block`] = "./pro/blocks/three-mirror-block/three-mirror-block-front.js";
}

module.exports = {
	mode: isProduction ? "production" : "development",
	...defaultConfig,
	module: {
		...defaultConfig.module,
		
		rules: [
			...defaultConfig.module.rules,
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto',
                use: 'babel-loader'
            },
			{
				test: /\.js$/,
                exclude: /node_modules\/(?!chess\.js|@lumaai\/luma-web|three-mesh-bvh|ecctrl|@mediapipe\/tasks-vision|@react-spring)/,
				use: 'babel-loader'
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},			  
			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},			  
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
	externals: {
		react: "React",
		"react-dom": "ReactDOM",
		'react-dom/client': 'ReactDOM'
	},
	resolve: {
		modules: ['node_modules'],
		extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],	  
		alias: {
			Brushes: path.resolve(__dirname, "brushes"),
			'@magickml/editor': path.resolve(__dirname, 'node_modules/@magickml/editor'),
			'draco-decoder': path.resolve(__dirname, 'node_modules/draco3d/')
		}
	}
};
