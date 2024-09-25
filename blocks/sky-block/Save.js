import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-sky-block
			{...blockProps}
			skyUrl={attributes.skyUrl}
			distance={attributes.distance}
			rayleigh={attributes.rayleigh}
			sunPositionX={attributes.sunPositionX}
			sunPositionY={attributes.sunPositionY}
			sunPositionZ={attributes.sunPositionZ}
		/>
	);
}
