import { useBlockProps } from "@wordpress/block-editor";

export default function Deprecated(){
	return [
		{
			attributes: {
				type: {
					type: "string",
					default: "ambient"
				},
				color: {
					type: "string",
					default: "0xffffff"
				},
				intensity: {
					type: "float",
					default: 0.7
				},
				distance: {
					type: "int",
					default: 100
				},
				decay: {
					type: "int",
					default: 1
				},
				positionX: {
					type: "float",
					default: 0
				},
				positionY: {
					type: "float",
					default: 0
				},
				positionZ: {
					type: "float",
					default: 0
				},
				rotationX: {
					type: "float",
					default: 0
				},
				rotationY: {
					type: "float",
					default: 0
				},
				rotationZ: {
					type: "float",
					default: 0
				},
				angle: {
					type: "float",
					default: 0.78539816339
				},
				penumbra: {
					type: "float",
					default: 0.1
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app-light-block">
								<p className="light-block-positionX">
									{props.attributes.positionX}
								</p>
								<p className="light-block-positionY">
									{props.attributes.positionY}
								</p>
								<p className="light-block-positionZ">
									{props.attributes.positionZ}
								</p>
								<p className="light-block-rotationX">
									{props.attributes.rotationX}
								</p>
								<p className="light-block-rotationY">
									{props.attributes.rotationY}
								</p>
								<p className="light-block-rotationZ">
									{props.attributes.rotationZ}
								</p>
								<p className="light-block-type">
									{props.attributes.type}
								</p>
								<p className="light-block-color">
									{props.attributes.color}
								</p>
								<p className="light-block-intensity">
									{props.attributes.intensity}
								</p>
								<p className="light-block-distance">
									{props.attributes.distance}
								</p>
								<p className="light-block-decay">
									{props.attributes.decay}
								</p>
								<p className="light-block-targetX">
									{props.attributes.targetX}
								</p>
								<p className="light-block-targetY">
									{props.attributes.targetY}
								</p>
								<p className="light-block-targetZ">
									{props.attributes.targetZ}
								</p>
								<p className="light-block-angle">
									{props.attributes.angle}
								</p>
								<p className="light-block-penumbra">
									{props.attributes.penumbra}
								</p>
							</div>
						</>
					</div>
            	);
			}
		}
	];
}