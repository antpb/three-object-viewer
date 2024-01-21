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
			bg_color={attributes.bg_color}
			zoom={attributes.zoom}
			hasZoom={attributes.hasZoom ? '1' : '0'}
			hasTip={attributes.hasTip ? '1' : '0'}
			positionY={attributes.positionY}
			rotationY={attributes.rotationY}
			threePreviewImage={attributes.threePreviewImage}
			animations={attributes.animations}
		>
			<InnerBlocks.Content />
		</three-environment-block>
	);
}
