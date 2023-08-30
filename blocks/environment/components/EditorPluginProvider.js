import React, { useState, useContext } from "react";

const EditorPluginContext = React.createContext();

export function EditorPluginProvider({ children }) {
  const [plugins, setPlugins] = useState([]);
  
  const registerPlugin = (plugin) => {
    setPlugins([...plugins, plugin]);
  };

  return (
    <EditorPluginContext.Provider value={{ plugins, registerPlugin }}>
      {children}
    </EditorPluginContext.Provider>
  );
}

export const useEditorPlugins = () => useContext(EditorPluginContext);
