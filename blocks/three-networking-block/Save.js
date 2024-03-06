import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-networking-block
			{...blockProps}
			participantLimit={attributes.participantLimit}
			customAvatars={attributes.customAvatars ? '1' : '0'}
			multiplayerAccess={attributes.multiplayerAccess}
		/>
	);
}
