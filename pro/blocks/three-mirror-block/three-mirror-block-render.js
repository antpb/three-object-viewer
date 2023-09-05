import React from "react";
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import {
  PlaneGeometry,
  Color,
} from "three";
import { useMyThree } from "../../../blocks/environment/components/FrontPluginProvider";

export function ThreeMirrorBlockRender(threeMirror) {
    console.log("hi from the front render");

    const { scene } = useMyThree();
	console.log("scene", scene);
	const mirror = new Reflector(
		new PlaneGeometry(10, 10),
		{
			color: new Color(0x7f7f7f),
			textureWidth: window.innerWidth * window.devicePixelRatio,
			textureHeight: window.innerHeight * window.devicePixelRatio
		}
	);
        // console.log("mirror", mirror);
	return ( 
					<group
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        scale={[1, 1, 1]}
					>
						<primitive object={mirror} />
					</group>
				)
	;
}
