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
					type: "string",
					default: null
				},
				audioUrl: {
					type: "string",
					default: null
				},
				autoPlay: {
					type: "bool",
					default: true
				},
				loop: {
					type: "bool",
					default: true
				},
				volume: {
					type: "int",
					default: 1
				},
				positional: {
					type: "bool",
					default: true
				},
				coneInnerAngle: {
					type: "int",
					default:360
				},
				coneOuterAngle: {
					type: "int",
					default:0
				},
				coneOuterGain: {
					type: "int",
					default:0.8
				},
				distanceModel: {
					type: "string",
					default: "inverse"
				},
				maxDistance: {
					type: "int",
					default:10000
				},
				refDistance: {
					type: "int",
					default:5
				},
				rolloffFactor: {
					type: "int",
					default:5
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
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app-audio-block">
								<p className="audio-block-url">{props.attributes.audioUrl}</p>
								<p className="audio-block-scaleX">{props.attributes.scaleX}</p>
								<p className="audio-block-scaleY">{props.attributes.scaleY}</p>
								<p className="audio-block-scaleZ">{props.attributes.scaleZ}</p>
								<p className="audio-block-positionX">
									{props.attributes.positionX}
								</p>
								<p className="audio-block-positionY">
									{props.attributes.positionY}
								</p>
								<p className="audio-block-positionZ">
									{props.attributes.positionZ}
								</p>
								<p className="audio-block-rotationX">
									{props.attributes.rotationX}
								</p>
								<p className="audio-block-rotationY">
									{props.attributes.rotationY}
								</p>
								<p className="audio-block-rotationZ">
									{props.attributes.rotationZ}
								</p>
								<p className="audio-block-autoPlay">
									{props.attributes.autoPlay ? '1' : '0'}
								</p>
								<p className="audio-block-loop">
									{props.attributes.loop ? '1' : '0'}
								</p>
								<p className="audio-block-volume">
									{props.attributes.volume}
								</p>
								<p className="audio-block-positional">
									{props.attributes.positional ? '1' : '0'}
								</p>
								<p className="audio-block-coneInnerAngle">
									{props.attributes.coneInnerAngle}
								</p>
								<p className="audio-block-coneOuterAngle">
									{props.attributes.coneOuterAngle}
								</p>
								<p className="audio-block-coneOuterGain">
									{props.attributes.coneOuterGain}
								</p>
								<p className="audio-block-distanceModel">
									{props.attributes.distanceModel}
								</p>
								<p className="audio-block-maxDistance">
									{props.attributes.maxDistance}
								</p>
								<p className="audio-block-refDistance">
									{props.attributes.refDistance}
								</p>
								<p className="audio-block-rolloffFactor">
									{props.attributes.rolloffFactor}
								</p>
							</div>
						</>
					</div>
				);			
			}
		}
	];
}
