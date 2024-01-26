import { __ } from "@wordpress/i18n";
import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-environment-block
			{...blockProps}
			deviceTarget={attributes.deviceTarget}
			threeObjectUrl={attributes.threeObjectUrl}
			hdr={attributes.hdr}
			scale={attributes.scale}
			positionY={attributes.positionY}
			rotationY={attributes.rotationY}
			threePreviewImage={attributes.threePreviewImage}
			animations={attributes.animations}
		>
			<InnerBlocks.Content />
		</three-environment-block>
	);
}
