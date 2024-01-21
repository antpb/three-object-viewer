import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-spawn-point-block
			{...blockProps}
			positionX={attributes.positionX}
			positionY={attributes.positionY}
			positionZ={attributes.positionZ}
			rotationX={attributes.rotationX}
			rotationY={attributes.rotationY}
			rotationZ={attributes.rotationZ}
		/>
	);
}
