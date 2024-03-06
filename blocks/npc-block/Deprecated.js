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
			name: {
				type: "string"
			},
			personality: {
				type: "string"
			},
			defaultMessage: {
				type: "string"
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
			objectAwareness: {
				type: "boolean",
				default: false
			}
		},
		save(props) {
			return (
					<div {...useBlockProps.save()}>
					<>
						<div className="three-object-three-app-npc-block">
							<p className="npc-block-url">
								{props.attributes.threeObjectUrl}
							</p>
							<p className="npc-block-position-x">
								{props.attributes.positionX}
							</p>
							<p className="npc-block-position-y">
								{props.attributes.positionY}
							</p>
							<p className="npc-block-position-z">
								{props.attributes.positionZ}
							</p>
							<p className="npc-block-rotation-x">
								{props.attributes.rotationX}
							</p>
							<p className="npc-block-rotation-y">
								{props.attributes.rotationY}
							</p>
							<p className="npc-block-rotation-z">
								{props.attributes.rotationZ}
							</p>
							<p className="npc-block-name">
								{props.attributes.name}
							</p>
							<p className="npc-block-default-message">
								{props.attributes.defaultMessage}
							</p>
							<p className="npc-block-personality">
								{props.attributes.personality}
							</p>
							<p className="npc-block-object-awareness">
								{props.attributes.objectAwareness ? 1 : 0}
							</p>
						</div>
					</>
				</div>
			);
		}
	}
];
}