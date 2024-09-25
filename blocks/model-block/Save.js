import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-model-block
			{...blockProps}
			threeObjectUrl={attributes.threeObjectUrl}
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
			collidable={attributes.collidable ? '1' : '0'}
			alt={attributes.alt}
		/>
	);
}
