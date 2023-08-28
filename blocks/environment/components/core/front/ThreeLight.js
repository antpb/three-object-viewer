import React, { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
  DirectionalLight,
  AmbientLight,
  PointLight,
  SpotLight,
  Color
} from "three";

/**
 * Light component that creates various Three.js light objects based on the provided configuration.
 *
 * @param {Object} threeLight - An object containing light configuration options.
 * @param {string} threeLight.type - The type of light: "directional", "ambient", "point", "spot".
 * @param {number} threeLight.color - The color of the light.
 * @param {number} threeLight.intensity - The intensity of the light.
 * @param {number} threeLight.distance - Maximum range of the point light (for PointLight).
 * @param {number} threeLight.decay - The amount the light dims along the distance of the point light (for PointLight).
 * @param {number} threeLight.positionX - The X-coordinate of the light's position.
 * @param {number} threeLight.positionY - The Y-coordinate of the light's position.
 * @param {number} threeLight.positionZ - The Z-coordinate of the light's position.
 * @param {number} threeLight.angle - Maximum extent of the spotlight, in radians (for SpotLight).
 * @param {number} threeLight.penumbra - Percentage of the spotlight cone that is attenuated due to penumbra (for SpotLight).
 *
 * @returns {JSX.Element} - Returns a JSX element containing a Three.js light object.
 */
export function ThreeLight(threeLight) {
  const { scene } = useThree();

  useEffect(() => {
    let lightInstance;
    const color = new Color( threeLight.color );

    switch (threeLight.type) {
      case "directional":
        lightInstance = new DirectionalLight(color, threeLight.intensity);
        lightInstance.position.set(threeLight.positionX, threeLight.positionY, threeLight.positionZ);
        break;

      case "ambient":
        lightInstance = new AmbientLight(color, Number(threeLight.intensity));
        break;

      case "point":
        lightInstance = new PointLight(color, threeLight.intensity, threeLight.distance, threeLight.decay);
        lightInstance.position.set(threeLight.positionX, threeLight.positionY, threeLight.positionZ);
        break;

      case "spot":
        lightInstance = new SpotLight(color, threeLight.intensity, threeLight.distance, threeLight.angle, threeLight.penumbra);
        lightInstance.position.set(threeLight.positionX, threeLight.positionY, threeLight.positionZ);
        break;

      default:
        console.warn("Invalid light type provided");
    }

    // add the light to the scene 
    scene.add(lightInstance);
  }, []);

  return;
}
