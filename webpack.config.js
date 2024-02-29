const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const { entryPoints } = require("./pluginMachine.json");
const isPro = process.env.ISPRO === 'true';

const entry = {};
Object.keys(entryPoints).forEach((type) => {
    if (type === 'blocks' || type === 'proBlocks' && isPro) {
        entryPoints[type].forEach((entryPoint) => {
            entry[`block-${entryPoint}`] = path.resolve(
                process.cwd(),
                `${isPro && type === 'proBlocks' ? 'pro/' : ''}blocks/${entryPoint}/index.js`
            );
        });
    }

    if (type === 'adminPages' || type === 'proAdminPages' && isPro) {
        entryPoints[type].forEach((entryPoint) => {
            entry[`admin-page-${entryPoint}`] = path.resolve(
                process.cwd(),
                `${isPro && type === 'proAdminPages' ? 'pro/' : ''}admin/${entryPoint}/index.js`
            );
        });
    }
});

// Add specific entries
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
                resolve: {
                    fullySpecified: false // disable the behavior
                }
            },
            {
                test: /\.(wasm|eot|ttf|woff|woff2)$/,
                type: 'asset/resource'
            },
            {
                test: /\.js$/,
                exclude: /node_modules\/(?!chess\.js|@react-three\/uikit|@lumaai\/luma-web|three-mesh-bvh|ecctrl|@mediapipe\/tasks-vision|@react-spring)/,
                use: 'babel-loader'
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.(glsl|vrm|glb|fbx)$/,
				use: [
					{
						loader: "file-loader"
					}
				],
            }
        ]
    },
    entry,
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "./build"),
        clean: true
    },
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
        'react-dom/client': 'ReactDOM'
    },
    resolve: {
        ...defaultConfig.resolve,
		symlinks: true,
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.wasm'],
        alias: {
            ...defaultConfig.resolve.alias,
            Brushes: path.resolve(__dirname, "brushes"),
            '@magickml/editor': path.resolve(__dirname, 'node_modules/@magickml/editor'),
            'draco-decoder': path.resolve(__dirname, 'node_modules/draco3d/'),
        }
    }
};
