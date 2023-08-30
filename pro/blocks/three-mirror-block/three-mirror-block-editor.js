import React, { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import {
	TransformControls,
} from "@react-three/drei";

import {
  PlaneGeometry,
  Color,
  Euler
} from "three";

export function ThreeMirror(threeMirror) {
	const mirrorObj = useRef();
	const [isSelected, setIsSelected] = useState();
	const mirrorBlockAttributes = wp.data
		.select("core/block-editor")
		.getBlockAttributes(text.mirrorObjectId);
	const TransformController = ({ condition, wrap, children }) =>
		condition ? wrap(children) : children;

  const { scene } = useThree();

  useEffect(() => {
    let lightInstance;

    const mirror = new Reflector(
        new PlaneGeometry(10, 10),
        {
            color: new Color(0x7f7f7f),
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio
        }
    )
    // set the scale of the mirror 
    mirror.scale.set(threeMirror.scaleX, threeMirror.scaleY, threeMirror.scaleZ);
    // set the position of the mirror
    mirror.position.set(threeMirror.positionX, threeMirror.positionY, threeMirror.positionZ);
    // set the rotation
    mirror.rotation.set(threeMirror.rotationX, threeMirror.rotationY, threeMirror.rotationZ);
    // add the mirror to the scene
    scene.add(mirror);
  }, [threeMirror.positionX, threeMirror.positionY, threeMirror.positionZ, threeMirror.rotationX, threeMirror.rotationY, threeMirror.rotationZ, threeMirror.scaleX, threeMirror.scaleY, threeMirror.scaleZ]);

	return (
		<Select
			box
			multiple
			onChange={(e) => {
				e.length !== 0 ? setIsSelected(true) : setIsSelected(false);
			}}
			filter={(items) => items}
		>
			<TransformController
				condition={threeMirror.focusID === threeMirror.mirrorObjectId}
				wrap={(children) => (
					<TransformControls
						mode={threeMirror.transformMode}
						// enabled={threeMirror.focusID === threeMirror.mirrorObjectId}
						enabled={true}
						object={mirrorObj}
						size={0.5}
						onObjectChange={(e) => {
							const rot = new Euler(0, 0, 0, "XYZ");
							const scale = e?.target.worldScale;
							rot.setFromQuaternion(
								e?.target.worldQuaternion
							);
							wp.data
								.dispatch("core/block-editor")
								.updateBlockAttributes(text.mirrorObjectId, {
									positionX: e?.target.worldPosition.x,
									positionY: e?.target.worldPosition.y,
									positionZ: e?.target.worldPosition.z,
									rotationX: rot.x,
									rotationY: rot.y,
									rotationZ: rot.z,
									scaleX: scale.x,
									scaleY: scale.y,
									scaleZ: scale.z
								});
						}}
					>
						{children}
					</TransformControls>
				)}
			>
				{mirrorBlockAttributes && (
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
					</group>
				)}
			</TransformController>
		</Select>
	);
}
