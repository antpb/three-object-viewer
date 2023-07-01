import React, { useEffect, useRef } from "react";
import { OrbitControls } from '@react-three/drei';
import { useFrame } from "@react-three/fiber";

const CustomOrbitControls = ({camera}) => {
  const orbitControlsRef = useRef(null);

  useFrame(() => {
    if (!orbitControlsRef.current) {
      return;
    }
    orbitControlsRef.current.update();
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!orbitControlsRef.current) {
        return;
      }

      switch (event.key) {
        case "KeyW":
          orbitControlsRef.current.target.y += 1;
          break;
        case "KeyS":
          orbitControlsRef.current.target.y -= 1;
          break;
        case "KeyA":
          orbitControlsRef.current.target.x -= 1;
          break;
        case "KeyD":
          orbitControlsRef.current.target.x += 1;
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return <OrbitControls ref={orbitControlsRef} args={[camera]} />;
};

export default CustomOrbitControls;
