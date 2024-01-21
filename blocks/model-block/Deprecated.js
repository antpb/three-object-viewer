import { useBlockProps } from "@wordpress/block-editor";

export default function Deprecated(){
	return [
		{
			attributes: {
				scaleX: {
					type: "int",
					default:1
				},
				name: {
					type: "string"
				},
				scaleY: {
					type: "int",
					default:1
				},
				scaleZ: {
					type: "int",
					default:1
				},
				positionX: {
					type: "int",
					default:0
				},
				positionY: {
					type: "int",
					default:0
				},
				positionZ: {
					type: "int",
					default:0
				},
				rotationX: {
					type: "int",
					default:0
				},
				rotationY: {
					type: "int",
					default:0
				},
				rotationZ: {
					type: "int",
					default:0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				animations: {
					type: "string",
					default: ""
				},
				alt: {
					type: "string",
					default: ""
				},
				collidable: {
					type: "boolean",
					default: false
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app-model-block">
								<p className="model-block-url">
									{props.attributes.threeObjectUrl}
								</p>
								<p className="model-block-scale-x">{props.attributes.scaleX}</p>
								<p className="model-block-scale-y">{props.attributes.scaleY}</p>
								<p className="model-block-scale-z">{props.attributes.scaleZ}</p>
								<p className="model-block-position-x">
									{props.attributes.positionX}
								</p>
								<p className="model-block-position-y">
									{props.attributes.positionY}
								</p>
								<p className="model-block-position-z">
									{props.attributes.positionZ}
								</p>
								<p className="model-block-rotation-x">
									{props.attributes.rotationX}
								</p>
								<p className="model-block-rotation-y">
									{props.attributes.rotationY}
								</p>
								<p className="model-block-rotation-z">
									{props.attributes.rotationZ}
								</p>
								<p className="model-block-animations">
									{props.attributes.animations}
								</p>
								<p className="model-block-collidable">
									{props.attributes.collidable ? 1 : 0}
								</p>
								<p className="model-block-alt">{props.attributes.alt}</p>
							</div>
						</>
					</div>
				);
			}
		},
		{
			attributes: {
				scaleX: {
					type: "int",
					default:1
				},
				name: {
					type: "string"
				},
				scaleY: {
					type: "int",
					default:1
				},
				scaleZ: {
					type: "int",
					default:1
				},
				positionX: {
					type: "int",
					default:0
				},
				positionY: {
					type: "int",
					default:0
				},
				positionZ: {
					type: "int",
					default:0
				},
				rotationX: {
					type: "int",
					default:0
				},
				rotationY: {
					type: "int",
					default:0
				},
				rotationZ: {
					type: "int",
					default:0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				animations: {
					type: "string",
					default: ""
				},
				alt: {
					type: "string",
					default: ""
				},
				collidable: {
					type: "boolean",
					default: false
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app-model-block">
								<p className="model-block-url">
									{props.attributes.threeObjectUrl}
								</p>
								<p className="model-block-scale-x">{props.attributes.scaleX}</p>
								<p className="model-block-scale-y">{props.attributes.scaleY}</p>
								<p className="model-block-scale-z">{props.attributes.scaleZ}</p>
								<p className="model-block-position-x">
									{props.attributes.positionX}
								</p>
								<p className="model-block-position-y">
									{props.attributes.positionY}
								</p>
								<p className="model-block-position-z">
									{props.attributes.positionZ}
								</p>
								<p className="model-block-rotation-x">
									{props.attributes.rotationX}
								</p>
								<p className="model-block-rotation-y">
									{props.attributes.rotationY}
								</p>
								<p className="model-block-rotation-z">
									{props.attributes.rotationZ}
								</p>
								<p className="model-block-animations">
									{props.attributes.animations}
								</p>
								<p className="model-block-collidable">
									{props.attributes.collidable ? 1 : 0}
								</p>
								<p className="model-block-alt">{props.attributes.alt}</p>
							</div>
						</>
					</div>
				);            
			}
		}
	];
}