import React, { useState, useContext, useEffect, useCallback } from "react";

export const FrontPluginContext = React.createContext();

export function FrontPluginProvider({ children }) {

  const [plugins, setPlugins] = useState([]);
  
  const registerFrontPlugin = useCallback((plugin) => {
    setPlugins(prevPlugins => [...prevPlugins, plugin]);
  }, []);
  
  useEffect(() => {
    // Expose the registerPlugin method globally
    window.registerFrontPlugin = registerFrontPlugin;
    window.dispatchEvent(new Event('registerFrontPluginReady'));
    
    return () => {
      // Cleanup
      window.registerFrontPlugin = null;
    };
  }, [registerFrontPlugin]);

  return (
    <FrontPluginContext.Provider value={{ plugins, registerFrontPlugin }}>
      {children}
    </FrontPluginContext.Provider>
  );
}

export const useFrontPlugins = () => useContext(FrontPluginContext);
