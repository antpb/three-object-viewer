import React, { useState, useEffect, useRef } from "react";
// import { useThree } from "@react-three/fiber";
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import {
	TransformControls,
	Select
} from "@react-three/drei";

import {
  PlaneGeometry,
  Color,
  Euler,
  OutlineEffect
} from "three";

export function ThreeMirror(threeMirror) {
	const mirrorObj = useRef();
	const [isSelected, setIsSelected] = useState();
	const mirrorBlockAttributes = wp.data
		.select("core/block-editor")
		.getBlockAttributes(threeMirror.htmlobjectId);
	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

//   const { scene } = useThree();
	const mirror = new Reflector(
		new PlaneGeometry(10, 10),
		{
			color: new Color(0x7f7f7f),
			textureWidth: window.innerWidth * window.devicePixelRatio,
			textureHeight: window.innerHeight * window.devicePixelRatio
		}
	);
	// make the mirror outlined using the three.js outline 

  useEffect(() => {

    // set the scale of the mirror 
    mirror.scale.set(threeMirror.scaleX, threeMirror.scaleY, threeMirror.scaleZ);
    // set the position of the mirror
    mirror.position.set(threeMirror.positionX, threeMirror.positionY, threeMirror.positionZ);
    // set the rotation
    mirror.rotation.set(threeMirror.rotationX, threeMirror.rotationY, threeMirror.rotationZ);
    // add the mirror to the scene
    // scene.add(mirror);
  }, [threeMirror.positionX, threeMirror.positionY, threeMirror.positionZ, threeMirror.rotationX, threeMirror.rotationY, threeMirror.rotationZ, threeMirror.scaleX, threeMirror.scaleY, threeMirror.scaleZ]);

	return ( mirrorBlockAttributes && (
					<group
						ref={mirrorObj}
						position={[
							mirrorBlockAttributes.positionX,
							mirrorBlockAttributes.positionY,
							mirrorBlockAttributes.positionZ
						]}
						rotation={[
							mirrorBlockAttributes.rotationX,
							mirrorBlockAttributes.rotationY,
							mirrorBlockAttributes.rotationZ
						]}
						scale={[mirrorBlockAttributes.scaleX, mirrorBlockAttributes.scaleY, mirrorBlockAttributes.scaleZ]}
					>
						<primitive object={mirror} />
					</group>
				)
	);
}
