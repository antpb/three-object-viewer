const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const isProduction = "production" === process.env.NODE_ENV;
const {entryPoints} = require("./pluginMachine.json");

let entry = {};
if( entryPoints.hasOwnProperty("blocks") ){
    entryPoints.blocks.forEach(
        (entryPoint) => {
            entry[`block-${entryPoint}`] = path.resolve(process.cwd(), `blocks/${entryPoint}/index.js`);
        }
    );
}

if( entryPoints.hasOwnProperty("adminPages") ){
    entryPoints.adminPages.forEach(
        (entryPoint) => {
            entry[`admin-page-${entryPoint}`] = path.resolve(process.cwd(), `admin/${entryPoint}/index.js`);
        }
    );
}

entry[`./assets/js/blocks.frontend`] = "./blocks/three-object-block/frontend.js";

module.exports = {
	mode: isProduction ? "production" : "development",
	...defaultConfig,
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	entry,
	output: {
		filename: "[name].js",
		path: path.join(__dirname, "./build"),
	},
	externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};
