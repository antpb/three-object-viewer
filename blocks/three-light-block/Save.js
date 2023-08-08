import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	return (
		<div {...useBlockProps.save()}>
			<>
				<div className="three-object-three-app-light-block">
					<p className="light-block-positionX">
						{attributes.positionX}
					</p>
					<p className="light-block-positionY">
						{attributes.positionY}
					</p>
					<p className="light-block-positionZ">
						{attributes.positionZ}
					</p>
					<p className="light-block-rotationX">
						{attributes.rotationX}
					</p>
					<p className="light-block-rotationY">
						{attributes.rotationY}
					</p>
					<p className="light-block-rotationZ">
						{attributes.rotationZ}
					</p>
					<p className="light-block-type">
						{attributes.type}
					</p>
					<p className="light-block-color">
						{attributes.color}
					</p>
					<p className="light-block-intensity">
						{attributes.intensity}
					</p>
					<p className="light-block-distance">
						{attributes.distance}
					</p>
					<p className="light-block-decay">
						{attributes.decay}
					</p>
					<p className="light-block-targetX">
						{attributes.targetX}
					</p>
					<p className="light-block-targetY">
						{attributes.targetY}
					</p>
					<p className="light-block-targetZ">
						{attributes.targetZ}
					</p>
					<p className="light-block-angle">
						{attributes.angle}
					</p>
					<p className="light-block-penumbra">
						{attributes.penumbra}
					</p>
				</div>
			</>
		</div>
	);
}
