import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	return (
		<div {...useBlockProps.save()}>
			<>
				<div className="three-object-three-app-three-html-block">
					<p className="three-html-markup">{attributes.markup}</p>
					<p className="three-html-positionX">
						{attributes.positionX}
					</p>
					<p className="three-html-positionY">
						{attributes.positionY}
					</p>
					<p className="three-html-positionZ">
						{attributes.positionZ}
					</p>
					<p className="three-html-rotationX">
						{attributes.rotationX}
					</p>
					<p className="three-html-rotationY">
						{attributes.rotationY}
					</p>
					<p className="three-html-rotationZ">
						{attributes.rotationZ}
					</p>
				</div>
			</>
		</div>
	);
}
