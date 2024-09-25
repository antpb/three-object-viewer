import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-audio-block
			{...blockProps}
			audioUrl={attributes.audioUrl}
			scaleX={attributes.scaleX}
			scaleY={attributes.scaleY}
			scaleZ={attributes.scaleZ}
			positionX={attributes.positionX}
			positionY={attributes.positionY}
			positionZ={attributes.positionZ}
			rotationX={attributes.rotationX}
			rotationY={attributes.rotationY}
			rotationZ={attributes.rotationZ}
			autoPlay={attributes.autoPlay}
			loop={attributes.loop}
			volume={attributes.volume}
			positional={attributes.positional ? '1' : '0'}
			coneInnerAngle={attributes.coneInnerAngle}
			coneOuterAngle={attributes.coneOuterAngle}
			coneOuterGain={attributes.coneOuterGain}
			distanceModel={attributes.distanceModel}
			maxDistance={attributes.maxDistance}
			refDistance={attributes.refDistance}
			rolloffFactor={attributes.rolloffFactor}
		/>
	);
}
