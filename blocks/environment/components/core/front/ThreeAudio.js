import React, { useState, useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import {
  Audio,
  AudioListener,
  PositionalAudio,
  AudioLoader,
  Mesh,
  BufferGeometry,
  BufferAttribute,
  MeshBasicMaterial,
} from "three";

/**
 * Renders an audio source in a three.js scene.
 *
 * @param {Object} threeAudio - The props for the audio.
 *
 * @return {JSX.Element} The audio source.
 */
export function ThreeAudio(threeAudio) {
  const { scene, camera } = useThree();
  const [audio] = useState(() => {
    const listener = new AudioListener();
    const audio = new PositionalAudio(listener);

    if (threeAudio.audioUrl) {
      const audioLoader = new AudioLoader();
      audioLoader.load(threeAudio.audioUrl, (buffer) => {
        audio.setBuffer(buffer);
        audio.setLoop(threeAudio.loop === "1");
        audio.setVolume(threeAudio.volume);
      });
    }
    return audio;
  });

  useEffect(() => {
    if (threeAudio.positional === "1") {
      audio.setRefDistance(threeAudio.refDistance);
      audio.setMaxDistance(threeAudio.maxDistance);
      audio.setRolloffFactor(threeAudio.rolloffFactor);
      audio.setDirectionalCone(
        threeAudio.coneInnerAngle,
        threeAudio.coneOuterAngle,
        threeAudio.coneOuterGain
      );
    }
  }, [audio, threeAudio]);

  // Add an audio source indicator (optional)
  const [indicatorObject, setIndicatorObject] = useState(null);
  const indicator = threeAudio.positional === "1" ? (
    <mesh>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={["attributes", "position"]}
          array={[0, 0, 0, 0, 0, -10]}
          itemSize={3}
        />
      </bufferGeometry>
      <meshBasicMaterial color={0x00ff00} />
    </mesh>
  ) : null;

  useEffect(() => {
    if (threeAudio.positional === "1" && indicator) {
      // Create a new instance of THREE.Mesh using the geometry and material
      const meshIndicator = new Mesh(
        indicator.props.geometry,
        indicator.props.material
      );

      // Set the position of the mesh indicator based on threeAudio properties
      meshIndicator.position.set(
        Number(threeAudio.positionX),
        Number(threeAudio.positionY),
        Number(threeAudio.positionZ)
      );

      // Add the mesh indicator to the scene
      scene.add(meshIndicator);
      setIndicatorObject(meshIndicator); // Keep a reference to the mesh indicator

      // Remove the original indicator from the scene (if it exists)
      scene.remove(indicator);
    } else if (indicatorObject) {
      // Remove the mesh indicator from the scene
      scene.remove(indicatorObject);
      setIndicatorObject(null); // Clear the reference
    }
  }, [indicator, threeAudio, scene]);

  return (
    <>
      <primitive object={audio} />
      {threeAudio.positional === "1" && indicator}
    </>
  );
}
