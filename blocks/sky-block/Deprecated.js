import { useBlockProps } from "@wordpress/block-editor";

export default function Deprecated(){
	return [
		{
			attributes: {
				skyUrl: {
					type: "string",
					default: null
				},
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app-sky-block">
								<p className="sky-block-url">{props.attributes.skyUrl}</p>
							</div>
						</>
					</div>
				);
			}
		},
        {
			attributes: {
				skyUrl: {
					type: "string",
					default: null
				},
				distance: {
					type: "int",
					default: 170000
				},
				rayleigh: {
					type: "int",
					default: 1
				},
				sunPositionX: {
					type: "int",
					default: 0
				},
				sunPositionY: {
					type: "int",
					default: 10000
				},
				sunPositionZ: {
					type: "int",
					default: -10000
				}
			},
			save(props) {
				return (
					<div {...useBlockProps.save()}>
						<>
							<div className="three-object-three-app-sky-block">
								<p className="sky-block-url">{props.attributes.skyUrl}</p>
								<p className="sky-block-distance">{props.attributes.distance}</p>
								<p className="sky-block-rayleigh">{props.attributes.rayleigh}</p>
								<p className="sky-block-sunPositionX">{props.attributes.sunPositionX}</p>
								<p className="sky-block-sunPositionY">{props.attributes.sunPositionY}</p>
								<p className="sky-block-sunPositionZ">{props.attributes.sunPositionZ}</p>
							</div>
						</>
					</div>        
				);
			}
		}
	];
}
