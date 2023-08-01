import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	return (
		<div {...useBlockProps.save()}>
			<>
				<div className="three-object-three-app-audio-block">
					<p className="audio-block-url">{attributes.audioUrl}</p>
					<p className="audio-block-scaleX">{attributes.scaleX}</p>
					<p className="audio-block-scaleY">{attributes.scaleY}</p>
					<p className="audio-block-scaleZ">{attributes.scaleZ}</p>
					<p className="audio-block-positionX">
						{attributes.positionX}
					</p>
					<p className="audio-block-positionY">
						{attributes.positionY}
					</p>
					<p className="audio-block-positionZ">
						{attributes.positionZ}
					</p>
					<p className="audio-block-rotationX">
						{attributes.rotationX}
					</p>
					<p className="audio-block-rotationY">
						{attributes.rotationY}
					</p>
					<p className="audio-block-rotationZ">
						{attributes.rotationZ}
					</p>
					<p className="audio-block-autoPlay">
						{attributes.autoPlay ? '1' : '0'}
					</p>
					<p className="audio-block-loop">
						{attributes.loop ? '1' : '0'}
					</p>
					<p className="audio-block-volume">
						{attributes.volume}
					</p>
					<p className="audio-block-positional">
						{attributes.positional ? '1' : '0'}
					</p>
					<p className="audio-block-coneInnerAngle">
						{attributes.coneInnerAngle}
					</p>
					<p className="audio-block-coneOuterAngle">
						{attributes.coneOuterAngle}
					</p>
					<p className="audio-block-coneOuterGain">
						{attributes.coneOuterGain}
					</p>
					<p className="audio-block-distanceModel">
						{attributes.distanceModel}
					</p>
					<p className="audio-block-maxDistance">
						{attributes.maxDistance}
					</p>
					<p className="audio-block-refDistance">
						{attributes.refDistance}
					</p>
					<p className="audio-block-rolloffFactor">
						{attributes.rolloffFactor}
					</p>
				</div>
			</>
		</div>
	);
}
