import { useBlockProps } from "@wordpress/block-editor";

export default function Deprecated(){
	return [
		{
			attributes: {
				bg_color: {
					type: "string",
					default: "#FFFFFF"
				},
				zoom: {
					type: "integer",
					default: 90
				},
				scale: {
					type: "integer",
					default: 1
				},
				positionX: {
					type: "integer",
					default: 0
				},
				positionY: {
					type: "integer",
					default: 0
				},
				rotationY: {
					type: "integer",
					default: 0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				hasZoom: {
					type: "bool",
					default: false
				},
				hasTip: {
					type: "bool",
					default: true
				},
				deviceTarget: {
					type: "string",
					default: "2d"
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app">
								<p className="three-object-block-device-target">
									{props.attributes.deviceTarget}
								</p>
								<p className="three-object-block-url">
									{props.attributes.threeObjectUrl}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
								<p className="three-object-background-color">
									{props.attributes.bg_color}
								</p>
								<p className="three-object-zoom">
									{props.attributes.zoom}
								</p>
								<p className="three-object-has-zoom">
									{props.attributes.hasZoom ? 1 : 0}
								</p>
								<p className="three-object-has-tip">
									{props.attributes.hasTip ? 1 : 0}
								</p>
								<p className="three-object-position-y">
									{props.attributes.positionY}
								</p>
								<p className="three-object-rotation-y">
									{props.attributes.rotationY}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
							</div>
						</>
					</div>
				);
			}
		},
		{
			attributes: {
				bg_color: {
					type: "string",
					default: "#FFFFFF"
				},
				zoom: {
					type: "integer",
					default: 90
				},
				scale: {
					type: "integer",
					default: 1
				},
				positionX: {
					type: "integer",
					default: 0
				},
				positionY: {
					type: "integer",
					default: 0
				},
				rotationY: {
					type: "integer",
					default: 0
				},
				threeObjectUrl: {
					type: "string",
					default: null
				},
				hasZoom: {
					type: "bool",
					default: false
				},
				hasTip: {
					type: "bool",
					default: true
				},
				deviceTarget: {
					type: "string",
					default: "2d"
				},
				animations: {
					type: "string",
					default: ""
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app">
								<p className="three-object-block-device-target">
									{props.attributes.deviceTarget}
								</p>
								<p className="three-object-block-url">
									{props.attributes.threeObjectUrl}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
								<p className="three-object-background-color">
									{props.attributes.bg_color}
								</p>
								<p className="three-object-zoom">
									{props.attributes.zoom}
								</p>
								<p className="three-object-has-zoom">
									{props.attributes.hasZoom ? 1 : 0}
								</p>
								<p className="three-object-has-tip">
									{props.attributes.hasTip ? 1 : 0}
								</p>
								<p className="three-object-position-y">
									{props.attributes.positionY}
								</p>
								<p className="three-object-rotation-y">
									{props.attributes.rotationY}
								</p>
								<p className="three-object-scale">
									{props.attributes.scale}
								</p>
								<p className="three-object-animations">
									{props.attributes.animations}
								</p>
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
				destinationUrl: {
					type: "string",
					default: null
				},
				textContent: {
					type: "string",
					default: null
				},
				textColor: {
					type: "string",
					default: "0x000000"
				},
				animations: {
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
							<div className="three-object-three-app-three-text-block">
								<p className="three-text-content">
									{props.attributes.textContent}
								</p>
								<p className="three-text-positionX">
									{props.attributes.positionX}
								</p>
								<p className="three-text-positionY">
									{props.attributes.positionY}
								</p>
								<p className="three-text-positionZ">
									{props.attributes.positionZ}
								</p>
								<p className="three-text-rotationX">
									{props.attributes.rotationX}
								</p>
								<p className="three-text-rotationY">
									{props.attributes.rotationY}
								</p>
								<p className="three-text-rotationZ">
									{props.attributes.rotationZ}
								</p>
								<p className="three-text-scaleX">{props.attributes.scaleX}</p>
								<p className="three-text-scaleY">{props.attributes.scaleY}</p>
								<p className="three-text-scaleZ">{props.attributes.scaleZ}</p>
								<p className="three-text-color">{props.attributes.textColor}</p>
							</div>
						</>
					</div>
				);
			}
		}
	];
}