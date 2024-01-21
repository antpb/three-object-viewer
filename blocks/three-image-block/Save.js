import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-image-block
			{...blockProps}
			imageUrl={attributes.imageUrl}
			scaleX={attributes.scaleX}
			scaleY={attributes.scaleY}
			scaleZ={attributes.scaleZ}
			positionX={attributes.positionX}
			positionY={attributes.positionY}
			positionZ={attributes.positionZ}
			rotationX={attributes.rotationX}
			rotationY={attributes.rotationY}
			rotationZ={attributes.rotationZ}
			aspectHeight={attributes.aspectHeight}
			aspectWidth={attributes.aspectWidth}
			transparent={attributes.transparent ? '1' : '0'}
		/>
	);
}
