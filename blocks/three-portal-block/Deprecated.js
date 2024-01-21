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
			label: {
				type: "string",
				default: null
			},
			labelTextColor: {
				type: "string",
				default: "0x000000"
			},
			labelOffsetX: {
				type: "int",
				default:0
			},
			labelOffsetY: {
				type: "int",
				default:0
			},
			labelOffsetZ: {
				type: "int",
				default:0
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
						<div className="three-object-three-app-three-portal-block">
							<p className="three-portal-block-url">
								{props.attributes.threeObjectUrl}
							</p>
							<p className="three-portal-block-destination-url">
								{props.attributes.destinationUrl}
							</p>
							<p className="three-portal-block-scale-x">
								{props.attributes.scaleX}
							</p>
							<p className="three-portal-block-scale-y">
								{props.attributes.scaleY}
							</p>
							<p className="three-portal-block-scale-z">
								{props.attributes.scaleZ}
							</p>
							<p className="three-portal-block-position-x">
								{props.attributes.positionX}
							</p>
							<p className="three-portal-block-position-y">
								{props.attributes.positionY}
							</p>
							<p className="three-portal-block-position-z">
								{props.attributes.positionZ}
							</p>
							<p className="three-portal-block-rotation-x">
								{props.attributes.rotationX}
							</p>
							<p className="three-portal-block-rotation-y">
								{props.attributes.rotationY}
							</p>
							<p className="three-portal-block-rotation-z">
								{props.attributes.rotationZ}
							</p>
							<p className="three-portal-block-animations">
								{props.attributes.animations}
							</p>
							<p className="three-portal-block-label">
								{props.attributes.label}
							</p>
							<p className="three-portal-block-label-offset-x">
								{props.attributes.labelOffsetX}
							</p>
							<p className="three-portal-block-label-offset-y">
								{props.attributes.labelOffsetY}
							</p>
							<p className="three-portal-block-label-offset-z">
								{props.attributes.labelOffsetZ}
							</p>
							<p className="three-portal-block-label-text-color">
								{props.attributes.labelTextColor}
							</p>
						</div>
					</>
				</div>
			);
		}
	}
];
}