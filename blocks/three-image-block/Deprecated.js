import { useBlockProps } from "@wordpress/block-editor";

export default function Deprecated(){
	return [
		{
			attributes: {
				imageUrl: {
					type: "string",
					default: null
				},
				transparent: {
					type: "boolean",
					default: false
				},
				scaleX: {
					type: "int",
					default: 1
				},
				scaleY: {
					type: "int",
					default: 1
				},
				scaleZ: {
					type: "int",
					default: 1
				},
				positionX: {
					type: "int",
					default: 0
				},
				positionY: {
					type: "int",
					default: 0
				},
				positionZ: {
					type: "int",
					default: 0
				},
				rotationX: {
					type: "int",
					default: 0
				},
				rotationY: {
					type: "int",
					default: 0
				},
				rotationZ: {
					type: "int",
					default: 0
				},
				aspectHeight: {
					type: "int",
					default: 0
				},
				aspectWidth: {
					type: "int",
					default: 0
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app-image-block">
								<p className="image-block-url">{props.attributes.imageUrl}</p>
								<p className="image-block-scaleX">{props.attributes.scaleX}</p>
								<p className="image-block-scaleY">{props.attributes.scaleY}</p>
								<p className="image-block-scaleZ">{props.attributes.scaleZ}</p>
								<p className="image-block-positionX">
									{props.attributes.positionX}
								</p>
								<p className="image-block-positionY">
									{props.attributes.positionY}
								</p>
								<p className="image-block-positionZ">
									{props.attributes.positionZ}
								</p>
								<p className="image-block-rotationX">
									{props.attributes.rotationX}
								</p>
								<p className="image-block-rotationY">
									{props.attributes.rotationY}
								</p>
								<p className="image-block-rotationZ">
									{props.attributes.rotationZ}
								</p>
								<p className="image-block-aspect-height">
									{props.attributes.aspectHeight}
								</p>
								<p className="image-block-aspect-width">
									{props.attributes.aspectWidth}
								</p>
								<p className="image-block-transparent">
									{props.attributes.transparent ? 1 : 0}
								</p>
							</div>
						</>
					</div>
				);
			}
		}
	];
}
