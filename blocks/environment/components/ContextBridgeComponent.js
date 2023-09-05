import React, { useState, useEffect } from "react";
import { useFrontPlugins, FrontPluginContext } from './FrontPluginProvider';
import { Environment, useContextBridge } from "@react-three/drei";

//import contextBridgef
// add function for context
export function ContextBridgeComponent(props) {
	const { plugins } = useFrontPlugins(); // From your own context
	const [registeredThreeovBlocks, setRegisteredThreeovBlocks] = useState([]);
	const ContextBridge = useContextBridge(FrontPluginContext);  // Bridging EditorPluginContext

	console.log("plugins", plugins);
	useEffect(() => {
		if (plugins.length > 0) {
			plugins.forEach((plugin) => {
				// add the plugin to the registered blocks
				setRegisteredThreeovBlocks((registeredThreeovBlocks) => [
					...registeredThreeovBlocks,
					plugin,
				]);
			});
		}
	}, [plugins]);

	return (
		<ContextBridge>
			{
				registeredThreeovBlocks.length > 0 && registeredThreeovBlocks.map((blockElement, index) => {
					console.log("block Element in front", blockElement)
					const BlockComponent = blockElement.type;
					// Missing return statement here
					return ( // Added return
						<group
							key={index}
							position={[0, 0, 0]}
							rotation={[0, 0, 0]}
							scale={[1, 1, 1]}
						>
							<BlockComponent key={index} {...blockElement.props} />
						</group>
					) // Added closing parenthesis for return
				})
			}
		</ContextBridge>
	)

}
