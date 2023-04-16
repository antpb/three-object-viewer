import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, DoubleSide } from "three";
import {
	Sky
} from "@react-three/drei";

/**
 * Represents a sky in a virtual reality scene.
 *
 * @param {Object} sky - The props for the sky.
 *
 * @return {JSX.Element} The sky.
 */
export function ThreeSkyThread(sky) {
	const skyUrl = sky.src ? sky.src : "";

	const distance = sky.distance ? sky.distance : "";

	const rayleigh = sky.rayleigh ? sky.rayleigh : "";

	const sunPositionX = sky.sunPositionX ? sky.sunPositionX : "";

	const sunPositionY = sky.sunPositionY ? sky.sunPositionY : "";

	const sunPositionZ = sky.sunPositionZ ? sky.sunPositionZ : "";

	if(skyUrl === "" || skyUrl === undefined || skyUrl === null) {
		return (
			<Sky
			distance={Number(distance)}
			sunPosition={[Number(sunPositionX), Number(sunPositionY), Number(sunPositionZ)]}
			rayleigh={rayleigh}
		/>
		);
	} else {
		const texture1 = useLoader(TextureLoader, skyUrl);
		return (
			<>
				<mesh
					visible
					position={[0, 0, 0]}
					scale={[1, 1, 1]}
					rotation={[0, 0, 0]}
				>
					<sphereGeometry args={[300, 60, 60]} />
					<meshBasicMaterial side={DoubleSide} map={texture1} />
				</mesh>
			</>
		);
	}	
}
