import { useBlockProps } from "@wordpress/block-editor";

export default function Deprecated(){
	return [
		{
			attributes: {
				videoUrl: {
					type: "string",
					default: null
				},
				modelUrl: {
					type: "string",
					default: null
				},
				autoPlay: {
					type: "bool",
					default: true
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
							<div className="three-object-three-app-video-block">
								<div className="video-block-url">{props.attributes.videoUrl}</div>
								<p className="video-block-scaleX">{props.attributes.scaleX}</p>
								<p className="video-block-scaleY">{props.attributes.scaleY}</p>
								<p className="video-block-scaleZ">{props.attributes.scaleZ}</p>
								<p className="video-block-positionX">
									{props.attributes.positionX}
								</p>
								<p className="video-block-positionY">
									{props.attributes.positionY}
								</p>
								<p className="video-block-positionZ">
									{props.attributes.positionZ}
								</p>
								<p className="video-block-rotationX">
									{props.attributes.rotationX}
								</p>
								<p className="video-block-rotationY">
									{props.attributes.rotationY}
								</p>
								<p className="video-block-rotationZ">
									{props.attributes.rotationZ}
								</p>
								<p className="video-block-aspect-height">
									{props.attributes.aspectHeight}
								</p>
								<p className="video-block-aspect-width">
									{props.attributes.aspectWidth}
								</p>
								<p className="video-block-autoplay">
									{props.attributes.autoPlay ? 1 : 0}
								</p>
							</div>
						</>
					</div>
				);
			}
		},
		{
			attributes: {
				videoUrl: {
					type: "string",
					default: null
				},
				modelUrl: {
					type: "string",
					default: null
				},
				autoPlay: {
					type: "bool",
					default: true
				},
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
				aspectHeight: {
					type: "int",
					default:0
				},
				aspectWidth: {
					type: "int",
					default:0
				},
				customModel: {
					type: "bool",
					default: false
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app-video-block">
								<div className="video-block-url">{props.attributes.videoUrl}</div>
								<p className="video-block-scaleX">{props.attributes.scaleX}</p>
								<p className="video-block-scaleY">{props.attributes.scaleY}</p>
								<p className="video-block-scaleZ">{props.attributes.scaleZ}</p>
								<p className="video-block-positionX">
									{props.attributes.positionX}
								</p>
								<p className="video-block-positionY">
									{props.attributes.positionY}
								</p>
								<p className="video-block-positionZ">
									{props.attributes.positionZ}
								</p>
								<p className="video-block-rotationX">
									{props.attributes.rotationX}
								</p>
								<p className="video-block-rotationY">
									{props.attributes.rotationY}
								</p>
								<p className="video-block-rotationZ">
									{props.attributes.rotationZ}
								</p>
								<p className="video-block-autoplay">
									{props.attributes.autoPlay ? 1 : 0}
								</p>
								<p className="video-block-custom-model">
									{props.attributes.customModel ? 1 : 0}
								</p>
								<p className="video-block-aspect-height">
									{props.attributes.aspectHeight}
								</p>
								<p className="video-block-aspect-width">
									{props.attributes.aspectWidth}
								</p>
								<div className="video-block-model-url">{props.attributes.modelUrl}</div>
							</div>
						</>
					</div>
				);
			}
		}
	];
}
