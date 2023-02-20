import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader, DoubleSide } from "three";

/**
 * Represents a sky in a virtual reality scene.
 *
 * @param {Object} sky - The props for the sky.
 *
 * @return {JSX.Element} The sky.
 */
export function Sky(sky) {
	const skyUrl = sky.src[0].querySelector("p.sky-block-url")
	? sky.src[0].querySelector("p.sky-block-url").innerText
	: "";

	const texture1 = useLoader(TextureLoader, skyUrl);

	return (
		<>
			<mesh
				visible
				position={[0, 0, 0]}
				scale={[1, 1, 1]}
				rotation={[0, 0, 0]}
			>
				<sphereGeometry args={[300, 100, 100]} />
				<meshBasicMaterial side={DoubleSide} map={texture1} />
			</mesh>
		</>
	);
}
