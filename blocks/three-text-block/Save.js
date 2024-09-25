import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
			<three-text-block
				{...blockProps}
				textContent={attributes.textContent}
				positionX={attributes.positionX}
				positionY={attributes.positionY}
				positionZ={attributes.positionZ}
				rotationX={attributes.rotationX}
				rotationY={attributes.rotationY}
				rotationZ={attributes.rotationZ}
				scaleX={attributes.scaleX}
				scaleY={attributes.scaleY}
				scaleZ={attributes.scaleZ}
				textColor={attributes.textColor}
			/>
	);
}
