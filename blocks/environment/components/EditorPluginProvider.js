import React, { useState, useContext, useEffect } from "react";

const EditorPluginContext = React.createContext();

export function EditorPluginProvider({ children }) {
	useEffect(() => {
		// Expose the registerPlugin method globally
		window.registerEditorPlugin = registerEditorPlugin;
		window.dispatchEvent(new Event('registerEditorPluginReady'));

		return () => {
			// Cleanup
			window.registerEditorPlugin = null;
		};
	}, [registerEditorPlugin]);
	
	const [plugins, setPlugins] = useState([]);

	const registerEditorPlugin = (plugin) => {
		setPlugins([...plugins, plugin]);
	};

	return (
		<EditorPluginContext.Provider value={{ plugins, registerEditorPlugin }}>
			{children}
		</EditorPluginContext.Provider>
	);
}

export const useEditorPlugins = () => useContext(EditorPluginContext);
