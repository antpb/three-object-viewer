import React, { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
  AudioListener,
  PositionalAudio,
  AudioLoader,
  Audio
} from "three";

/**
 * Audio component that creates an Audio or PositionalAudio object and attaches it to the Three.js camera.
 *
 * @param {Object} threeAudio - An object containing audio configuration options.
 * @param {string} threeAudio.positional - Indicates if the audio should be positional ("1") or not ("0").
 * @param {string} threeAudio.audioUrl - The URL of the audio file to be loaded and played.
 * @param {string} threeAudio.loop - Indicates if the audio should loop ("1") or not ("0").
 * @param {number} threeAudio.volume - The volume level of the audio (0 to 1).
 * @param {string} threeAudio.autoPlay - Indicates if the audio should play automatically ("1") or not ("0").
 * @param {number} threeAudio.refDistance - The reference distance for positional audio.
 * @param {number} threeAudio.maxDistance - The maximum distance for positional audio.
 * @param {number} threeAudio.rolloffFactor - The rolloff factor for positional audio.
 * @param {number} threeAudio.coneInnerAngle - The inner cone angle for positional audio (in degrees).
 * @param {number} threeAudio.coneOuterAngle - The outer cone angle for positional audio (in degrees).
 * @param {number} threeAudio.coneOuterGain - The outer cone gain for positional audio.
 * @param {string} threeAudio.distanceModel - The distance model for positional audio.
 * @param {number} threeAudio.positionX - The X-coordinate of the audio's position for positional audio.
 * @param {number} threeAudio.positionY - The Y-coordinate of the audio's position for positional audio.
 * @param {number} threeAudio.positionZ - The Z-coordinate of the audio's position for positional audio.
 * @param {number} threeAudio.rotationX - The X-coordinate of the audio's rotation for positional audio (in radians).
 * @param {number} threeAudio.rotationY - The Y-coordinate of the audio's rotation for positional audio (in radians).
 * @param {number} threeAudio.rotationZ - The Z-coordinate of the audio's rotation for positional audio (in radians).
 *
 * @returns {JSX.Element} - Returns a JSX element containing a Three.js primitive object (Audio/PositionalAudio).
 */
export function ThreeAudio(threeAudio) {
  const { camera } = useThree();
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    const listener = new AudioListener();
    camera.add(listener);

    // Create either a PositionalAudio object or a normal Audio object based on the positional attribute
    const audio = threeAudio.positional === "1" ? new PositionalAudio(listener) : new Audio(listener);

    if (threeAudio.audioUrl) {
      const audioLoader = new AudioLoader();
      audioLoader.load(threeAudio.audioUrl, (buffer) => {
        audio.setBuffer(buffer);
        audio.setLoop(threeAudio.loop === "1" ? true : false);
        audio.setVolume(threeAudio.volume);
        if (threeAudio.autoPlay === "1") audio.play();
      });
    }

    if (threeAudio.positional === "1") {
      audio.refDistance = threeAudio.refDistance;
      audio.maxDistance = threeAudio.maxDistance;
      audio.rolloffFactor = threeAudio.rolloffFactor;
      audio.coneInnerAngle = threeAudio.coneInnerAngle;
      audio.coneOuterAngle = threeAudio.coneOuterAngle;
      audio.coneOuterGain = threeAudio.coneOuterGain;
      audio.distanceModel = threeAudio.distanceModel;
      audio.position.set(threeAudio.positionX, threeAudio.positionY, threeAudio.positionZ);
	  audio.rotation.set(threeAudio.rotationX, threeAudio.rotationY, threeAudio.rotationZ);
	}

    setAudio(audio);

    return () => {
      audio.stop();
      camera.remove(listener);
    }
  }, []);

  return (
    <>
      {audio && <primitive object={audio} />}
    </>
  );
}
