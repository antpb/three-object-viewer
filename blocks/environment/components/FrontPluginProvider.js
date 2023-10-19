import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useThree } from '@react-three/fiber';

export const FrontPluginContext = React.createContext();

export function FrontPluginProvider({ children }) {

  const [plugins, setPlugins] = useState([]);
  const { scene, camera } = useThree();
  
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
    <FrontPluginContext.Provider value={{ plugins, registerFrontPlugin, scene, camera }}>
        {children}
    </FrontPluginContext.Provider>
  );
}

export const useFrontPlugins = () => useContext(FrontPluginContext);
