import React, { useState, useContext, useEffect, useCallback } from "react";

export const EditorPluginContext = React.createContext();

export function EditorPluginProvider({ children }) {

  const [plugins, setPlugins] = useState([]);
  
  const registerEditorPlugin = useCallback((plugin) => {
    setPlugins(prevPlugins => [...prevPlugins, plugin]);
  }, []);
  
  useEffect(() => {
    // Expose the registerPlugin method globally
    window.registerEditorPlugin = registerEditorPlugin;
    window.dispatchEvent(new Event('registerEditorPluginReady'));
    
    return () => {
      // Cleanup
      window.registerEditorPlugin = null;
    };
  }, [registerEditorPlugin]);

  return (
    <EditorPluginContext.Provider value={{ plugins, registerEditorPlugin }}>
      {children}
    </EditorPluginContext.Provider>
  );
}

export const useEditorPlugins = () => useContext(EditorPluginContext);
