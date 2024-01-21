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
export function ThreeSky(sky) {
	let skyUrl, distance, rayleigh, sunPositionX, sunPositionY, sunPositionZ;

	if (sky.src[0].tagName.toLowerCase() === 'three-sky-block') {
		skyUrl = sky.src[0].getAttribute("skyUrl");
		distance = sky.src[0].getAttribute("distance");
		rayleigh = sky.src[0].getAttribute("rayleigh");
		sunPositionX = sky.src[0].getAttribute("sunPositionX");
		sunPositionY = sky.src[0].getAttribute("sunPositionY");
		sunPositionZ = sky.src[0].getAttribute("sunPositionZ");															
	} else {

		skyUrl = sky.src[0].querySelector("p.sky-block-url")
		? sky.src[0].querySelector("p.sky-block-url").innerText
		: "";

		distance = sky.src[0].querySelector("p.sky-block-distance")
		? sky.src[0].querySelector("p.sky-block-distance").innerText
		: "";

		rayleigh = sky.src[0].querySelector("p.sky-block-rayleigh")
		? sky.src[0].querySelector("p.sky-block-rayleigh").innerText
		: "";

		sunPositionX = sky.src[0].querySelector("p.sky-block-sunPositionX")
		? sky.src[0].querySelector("p.sky-block-sunPositionX").innerText
		: "";

		sunPositionY = sky.src[0].querySelector("p.sky-block-sunPositionY")
		? sky.src[0].querySelector("p.sky-block-sunPositionY").innerText
		: "";

		sunPositionZ = sky.src[0].querySelector("p.sky-block-sunPositionZ")
		? sky.src[0].querySelector("p.sky-block-sunPositionZ").innerText
		: "";
	}

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
