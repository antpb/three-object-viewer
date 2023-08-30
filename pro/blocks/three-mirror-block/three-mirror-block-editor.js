import React, { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Reflector } from 'three/examples/jsm/objects/Reflector';

import {
  PlaneGeometry,
  Color
} from "three";

export function ThreeMirror(threeMirror) {
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
  }, []);

  return;
}
