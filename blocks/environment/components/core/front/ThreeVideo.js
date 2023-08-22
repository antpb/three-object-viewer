import React, { useState, useEffect } from "react";
import { useThree, useLoader } from "@react-three/fiber";
import {
  VideoTexture,
  Vector3,
  BufferGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  DoubleSide,
  Mesh,
  CircleGeometry,
  sRGBEncoding,
  AudioListener,
  AudioLoader,
  PositionalAudio,
} from "three";
import { RigidBody } from "@react-three/rapier";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Select } from "@react-three/drei";

export function ThreeVideo(threeVideo) {
  const play = threeVideo.autoPlay === "1" ? true : false;
  const { scene, camera } = useThree();
  const [clicked, setClickEvent] = useState();
  const [screen, setScreen] = useState(null);
  const [screenParent, setScreenParent] = useState(null);

  const [video] = useState(() =>
    Object.assign(document.createElement("video"), {
      src: threeVideo.url,
      crossOrigin: "Anonymous",
      loop: true,
      muted: true
    })
  );
  const [audio, setAudio] = useState(null);

  const gltf = (threeVideo.customModel === "1") ? useLoader(GLTFLoader, threeVideo.modelUrl, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( threeVideo.threeObjectPluginRoot + "/inc/utils/draco/");
    dracoLoader.setDecoderConfig({type: 'js'});
    loader.setDRACOLoader(dracoLoader);

    loader.register((parser) => {
      return new VRMLoaderPlugin(parser);
    });
  }) : null;

  useEffect(() => {
    const listener = new AudioListener();
    camera.add(listener);
    const positionalAudio = new PositionalAudio(listener);
	const audioPosition = [
		Number(threeVideo.positionX),
		Number(threeVideo.positionY),
		Number(threeVideo.positionZ)
	];

	const audioRotation = [
		Number(threeVideo.rotationX),
		Number(threeVideo.rotationY),
		Number(threeVideo.rotationZ)
	];
    if (threeVideo.url) {
      const audioLoader = new AudioLoader();
	  positionalAudio.refDistance = 5;
      positionalAudio.maxDistance = 10000;
      positionalAudio.rolloffFactor = 5;
      positionalAudio.coneInnerAngle = 360;
      positionalAudio.coneOuterAngle = 0;
      positionalAudio.coneOuterGain = 0.8;
      positionalAudio.distanceModel = "inverse";
      audioLoader.load(threeVideo.url, (buffer) => {
        positionalAudio.setBuffer(buffer);
        positionalAudio.setLoop(true);
        if (play) positionalAudio.play();
      });
    }
    setAudio(positionalAudio);

    return () => {
      positionalAudio.stop();
      camera.remove(listener);
    }
  }, []);

  useEffect(() => {
    if (threeVideo.customModel === "1" && gltf && audio) {
      if (gltf.scene) {
        let foundScreen;
        gltf.scene.traverse((child) => {
          if (child.name === "screen") {
            foundScreen = child;
          }
        });
        if (foundScreen) {
          setScreen(foundScreen);
          setScreenParent(foundScreen.parent);
          const videoTexture = new VideoTexture(video);
          videoTexture.encoding = sRGBEncoding;

		  // new mesh standard material with the map texture
		  const material = new MeshStandardMaterial({
			map: videoTexture,
			side: DoubleSide
		  });	
          foundScreen.material = material;
          foundScreen.add(audio);
        }
      }
    }
  }, [gltf, audio]);

	// Add a triangle mesh on top of the video
	const [triangle] = useState(() => {
		const points = [];
		points.push(
			new Vector3(0, -3, 0),
			new Vector3(0, 3, 0),
			new Vector3(4, 0, 0)
		);
		const geometry = new BufferGeometry().setFromPoints(points);
		const material = new MeshBasicMaterial({
			color: 0x00000,
			side: DoubleSide
		});
		const triangle = new Mesh(geometry, material);
		return triangle;
	});

	const [circle] = useState(() => {
		const geometryCircle = new CircleGeometry(5, 32);
		const materialCircle = new MeshBasicMaterial({
			color: 0xfffff,
			side: DoubleSide
		});
		const circle = new Mesh(geometryCircle, materialCircle);
		return circle;
	});

	useEffect(() => {
		if (play) {
			triangle.material.visible = false;
			circle.material.visible = false;
			video.play();
		} else {
			triangle.material.visible = true;
			circle.material.visible = true;
		}
	}, [video, play]);
	return (
		<Select
		  box
		  onChange={(e) => {
			if (e.length !== 0) {
			  setClickEvent(!clicked);
			  if (clicked) {
				video.play();
				audio.play();
				triangle.material.visible = false;
				circle.material.visible = false;
			  } else {
				video.pause();
				audio.pause();
				triangle.material.visible = true;
				circle.material.visible = true;
			  }
			}
		  }}
		  filter={(items) => items}
		>
		  <group
			name="video"
			scale={[threeVideo.scaleX, threeVideo.scaleY, threeVideo.scaleZ]}
			position={[
			  Number(threeVideo.positionX),
			  Number(threeVideo.positionY),
			  Number(threeVideo.positionZ)
			]}
			rotation={[
			  Number(threeVideo.rotationX),
			  Number(threeVideo.rotationY),
			  Number(threeVideo.rotationZ)
			]}
		  >
			{audio && <primitive object={audio} />}
			{threeVideo.customModel === "1" && gltf ? (
			  <primitive object={gltf.scene} />
			) : (
								<RigidBody
								type="fixed"
								colliders={"cuboid"}
								ccd={true}
								onCollisionExit={(manifold, target, other) => {
									setClickEvent(!clicked);
									if (clicked) {
										video.play();
										triangle.material.visible = false;
										circle.material.visible = false;
									} else {
										video.pause();
										triangle.material.visible = true;
										circle.material.visible = true;
									}
								}}
							>
								<mesh>
									<meshStandardMaterial>
										<videoTexture
											attach="map"
											args={[video]}
											encoding={sRGBEncoding}
										/>
									</meshStandardMaterial>
									<planeGeometry
										args={[
											threeVideo.aspectWidth / 12,
											threeVideo.aspectHeight / 12
										]}
									/>
								</mesh>
							</RigidBody>
						)}
        <primitive position={[-1.5, 0, 0.1]} object={triangle} />
        <primitive position={[0, 0, 0.05]} object={circle} />
      </group>
    </Select>
  );
}
