import React, { useRef } from "react";
import {
	Text,
} from "@react-three/drei";

/**
 * Represents a text object in a virtual reality scene.
 *
 * @param {Object} model - The props for the text object.
 *
 * @return {JSX.Element} The text object.
 */
export function TextObject(model) {
	const htmlObj = useRef();
	return (
		<>
			<group
				position={[model.positionX, model.positionY, model.positionZ]}
				rotation={[model.rotationX, model.rotationY, model.rotationZ]}
				scale={[model.scaleX, model.scaleY, model.scaleZ]}
				ref={htmlObj}
			>
				<Text
					font={model.threeObjectPlugin + model.defaultFont}
					className="content"
					scale={[1, 1, 1]}
					// rotation-y={-Math.PI / 2}
					maxWidth={10}
					height={20}
					color={model.textColor}
					transform
				>
					{model.textContent}
				</Text>
			</group>
		</>
	);
}
