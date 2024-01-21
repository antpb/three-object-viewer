import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-light-block
			{...blockProps}
			positionX={attributes.positionX}
			positionY={attributes.positionY}
			positionZ={attributes.positionZ}
			rotationX={attributes.rotationX}
			rotationY={attributes.rotationY}
			rotationZ={attributes.rotationZ}
			type={attributes.type}
			color={attributes.color}
			intensity={attributes.intensity}
			distance={attributes.distance}
			decay={attributes.decay}
			targetX={attributes.targetX}
			targetY={attributes.targetY}
			targetZ={attributes.targetZ}
			angle={attributes.angle}
			penumbra={attributes.penumbra}
		/>
	);
}
