import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save();
	return (
		<three-object-viewer-block
			{ ...blockProps }
			device-target={ attributes.deviceTarget }
			three-object-url={ attributes.threeObjectUrl }
			scale={ attributes.scale }
			bg-color={ attributes.bg_color }
			zoom={ attributes.zoom }
			has-zoom={attributes.hasZoom ? 1 : 0}
			has-tip={attributes.hasTip ? 1 : 0}
			position-y={ attributes.positionY }
			rotation-y={ attributes.rotationY }
			animations={ attributes.animations }
		/>
	);
}
