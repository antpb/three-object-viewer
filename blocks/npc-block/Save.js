import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
			<three-npc-block
				{...blockProps}
				threeObjectUrl={attributes.threeObjectUrl}
				positionX={attributes.positionX}
				positionY={attributes.positionY}
				positionZ={attributes.positionZ}
				rotationX={attributes.rotationX}
				rotationY={attributes.rotationY}
				rotationZ={attributes.rotationZ}
				name={attributes.name}
				defaultMessage={attributes.defaultMessage}
				personality={attributes.personality}
				objectAwareness={attributes.objectAwareness ? 1 : 0}
			/>
	);
}
