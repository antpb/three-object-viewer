import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-portal-block
			{...blockProps}
			threeObjectUrl={attributes.threeObjectUrl}
			destinationUrl={attributes.destinationUrl}
			scaleX={attributes.scaleX}
			scaleY={attributes.scaleY}
			scaleZ={attributes.scaleZ}
			positionX={attributes.positionX}
			positionY={attributes.positionY}
			positionZ={attributes.positionZ}
			rotationX={attributes.rotationX}
			rotationY={attributes.rotationY}
			rotationZ={attributes.rotationZ}
			animations={attributes.animations}
			label={attributes.label}
			labelOffsetX={attributes.labelOffsetX}
			labelOffsetY={attributes.labelOffsetY}
			labelOffsetZ={attributes.labelOffsetZ}
			labelTextColor={attributes.labelTextColor}
		/>
	);
}
