import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const blockProps = useBlockProps.save();

	return (
		<three-video-block
			{...blockProps}
			videoUrl={attributes.videoUrl}
			scaleX={attributes.scaleX}
			scaleY={attributes.scaleY}
			scaleZ={attributes.scaleZ}
			positionX={attributes.positionX}
			positionY={attributes.positionY}
			positionZ={attributes.positionZ}
			rotationX={attributes.rotationX}
			rotationY={attributes.rotationY}
			rotationZ={attributes.rotationZ}
			autoPlay={attributes.autoPlay ? true : false}
			customModel={attributes.customModel ? "1" : "0"}
			aspectHeight={attributes.aspectHeight}
			aspectWidth={attributes.aspectWidth}
			modelUrl={attributes.modelUrl}
		/>
	);
}
