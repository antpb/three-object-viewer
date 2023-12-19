import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	return (
		<div {...useBlockProps.save()}>
			<>
				<div className="three-object-three-app-networking-block">
					<p className="networking-block-participant-count">{attributes.scaleX}</p>
				</div>
			</>
		</div>
	);
}
