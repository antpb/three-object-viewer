import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	return (
		<div {...useBlockProps.save()}>
			<>
				<div className="three-object-three-app-npc-block">
					<p className="npc-block-url">
						{attributes.threeObjectUrl}
					</p>
					<p className="npc-block-scale-x">{attributes.scaleX}</p>
					<p className="npc-block-scale-y">{attributes.scaleY}</p>
					<p className="npc-block-scale-z">{attributes.scaleZ}</p>
					<p className="npc-block-position-x">
						{attributes.positionX}
					</p>
					<p className="npc-block-position-y">
						{attributes.positionY}
					</p>
					<p className="npc-block-position-z">
						{attributes.positionZ}
					</p>
					<p className="npc-block-rotation-x">
						{attributes.rotationX}
					</p>
					<p className="npc-block-rotation-y">
						{attributes.rotationY}
					</p>
					<p className="npc-block-rotation-z">
						{attributes.rotationZ}
					</p>
					<p className="npc-block-name">
						{attributes.name}
					</p>
					<p className="npc-block-personality">
						{attributes.personality}
					</p>
					<p className="npc-block-animations">
						{attributes.animations}
					</p>
					<p className="npc-block-collidable">
						{attributes.collidable ? 1 : 0}
					</p>
					<p className="npc-block-alt">{attributes.alt}</p>
				</div>
			</>
		</div>
	);
}
