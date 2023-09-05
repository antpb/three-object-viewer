import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	return (
		<div {...useBlockProps.save()}>
			<>
			<div id="three-mirror-block-container"></div>
				<div className="three-object-three-app-three-mirror-block">
					<p className="three-mirror-block-scaleX">{attributes.scaleX}</p>
					<p className="three-mirror-block-scaleY">{attributes.scaleY}</p>
					<p className="three-mirror-block-scaleZ">{attributes.scaleZ}</p>
					<p className="three-mirror-block-positionX">
						{attributes.positionX}
					</p>
					<p className="three-mirror-block-positionY">
						{attributes.positionY}
					</p>
					<p className="three-mirror-block-positionZ">
						{attributes.positionZ}
					</p>
					<p className="three-mirror-block-rotationX">
						{attributes.rotationX}
					</p>
					<p className="three-mirror-block-rotationY">
						{attributes.rotationY}
					</p>
					<p className="three-mirror-block-rotationZ">
						{attributes.rotationZ}
					</p>
					<p className="three-mirror-block-height">
						{attributes.height}
					</p>
					<p className="three-mirror-block-width">
						{attributes.width}
					</p>
				</div>
			</>
		</div>
	);
}
