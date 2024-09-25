module.exports = function (api) {
	api.cache(true);
	const presets = ["@babel/preset-env", "@babel/preset-react"];
	const plugins = ["@babel/plugin-proposal-nullish-coalescing-operator", "@babel/plugin-proposal-optional-chaining", "@babel/plugin-proposal-class-properties"];
	return { presets, plugins };
};
