import { useBlockProps } from "@wordpress/block-editor";

export default function Deprecated(){
	return [
		{
			attributes: {
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
							<div className="three-object-three-app-spawn-point-block">
								<p className="spawn-point-block-positionX">
									{props.attributes.positionX}
								</p>
								<p className="spawn-point-block-positionY">
									{props.attributes.positionY}
								</p>
								<p className="spawn-point-block-positionZ">
									{props.attributes.positionZ}
								</p>
								<p className="spawn-point-block-rotationX">
									{props.attributes.rotationX}
								</p>
								<p className="spawn-point-block-rotationY">
									{props.attributes.rotationY}
								</p>
								<p className="spawn-point-block-rotationZ">
									{props.attributes.rotationZ}
								</p>
							</div>
						</>
					</div>
				);
			}
		}
	];
}
