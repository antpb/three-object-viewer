import * as THREE from "three";
import { Fog } from 'three/src/scenes/Fog'
import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { useLoader, useThree, Canvas, extend } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Physics, RigidBody, Debug, Attractor, CuboidCollider } from "@react-three/rapier";
import { GLTFGoogleTiltBrushMaterialExtension } from "three-icosa";
import ScrollableFeed from 'react-scrollable-feed'
import { Environment } from "@react-three/drei";
import { FrontPluginProvider, FrontPluginContext } from './FrontPluginProvider';  // Import the PluginProvider
import {
	useAnimations,
	Html,
	AdaptiveDpr,
	AdaptiveEvents,
	PerformanceMonitor,
} from "@react-three/drei";
import { EcctrlJoystick } from 'ecctrl'

// import { A11y } from "@react-three/a11y";
import { GLTFAudioEmitterExtension } from "three-omi";
import { VRButton, ARButton, XR, Controllers, Hands, XRButton } from '@react-three/xr'
// import { Perf } from "r3f-perf";
import { VRMUtils, VRMLoaderPlugin } from "@pixiv/three-vrm";
import TeleportTravel from "./TeleportTravel";
import Player from "./Player";
import defaultEnvironment from "../../../inc/assets/default_grid.glb";
import defaultLoadingZoomGraphic from "../../../inc/assets/room_entry_background.svg";
import defaultFont from "../../../inc/fonts/roboto.woff";
import { ItemBaseUI } from "@wordpress/components/build/navigation/styles/navigation-styles";
import { BoxGeometry } from "three";
import { Participants } from "./core/front/Participants";
import { ThreeImage } from "./core/front/ThreeImage";
import { ThreeVideo } from "./core/front/ThreeVideo";
import { ThreeAudio } from "./core/front/ThreeAudio";
import { ThreeLight } from "./core/front/ThreeLight";
import { ModelObject } from "./core/front/ModelObject";
import { NPCObject } from "./core/front/NPCObject";
import { Portal } from "./core/front/Portal";
import { ThreeSky } from "./core/front/ThreeSky";
import { TextObject } from "./core/front/TextObject";
import { useKeyboardControls } from "./Controls";
import { ContextBridgeComponent } from "./ContextBridgeComponent";

function isMobile() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isVRCompatible() {
	const xrSupported = navigator.xr && typeof navigator.xr.isSessionSupported === 'function';
	const webGLSupported = typeof window.WebGLRenderingContext !== 'undefined';
  
	return xrSupported && webGLSupported;
}

function goToPrivateRoom() {
	const url = window.location.href;
	const newUrl = url.split("#")[0];
	const randomString = Math.random().toString(36).substring(7);
	window.location
		.assign(newUrl + "#" + randomString);
}

function Loading({ visible, previewImage }) {
	// const backgroundImageUrl = previewImage !== "" ? previewImage : (threeObjectPlugin + zoomBackground);
	const backgroundImageUrl = previewImage !== "" ? previewImage : defaultLoadingZoomGraphic;
	// reveal one letter at a time of the string "Use [ W ], [ A ], [ S ], and [ D ] to move."
	const tip = "Use [ W ], [ A ], [ S ], and [ D ] to move.";
	const screenwidth = window.innerWidth;
	return (
		<div className="threeov-entry-scene-parent" style={{ background: "radial-gradient(circle, transparent, transparent 0%, white 2%)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", width: "400px" }}>
			<div class="threeov-entry-scene">
				<div class="threeov-entry-wrap">
					<div 
						style={{
							backgroundImage: "url(" + backgroundImageUrl + ")",
							backgroundSize: "cover",
						}}
						class="threeov-entry-wall threeov-entry-wall-right"
					/>
					<div 
						style={{
							backgroundImage: "url(" + backgroundImageUrl + ")",
						}}
						class="threeov-entry-wall threeov-entry-wall-left"
					/>
					<div 
						style={{
							backgroundImage: "url(" + backgroundImageUrl + ")",
							backgroundSize: "cover",
						}}
						class="threeov-entry-wall threeov-entry-wall-top"
					/>
					<div 
						style={{
							backgroundImage: "url(" + backgroundImageUrl + ")",
							backgroundSize: "cover",
						}}
						class="threeov-entry-wall threeov-entry-wall-bottom"
					/>
				</div>
				<div class="threeov-entry-wrap">
					<div 
						style={{
							backgroundImage: "url(" + backgroundImageUrl + ")",
							backgroundSize: "cover",
						}}
						class="threeov-entry-wall threeov-entry-wall-right"
					/>
					<div 
						style={{
							backgroundImage: "url(" + backgroundImageUrl + ")",
							backgroundSize: "cover",
						}}
						class="threeov-entry-wall threeov-entry-wall-left"
					/>
					<div 
						style={{
							backgroundImage: "url(" + backgroundImageUrl + ")",
							backgroundSize: "cover",
						}}
						class="threeov-entry-wall threeov-entry-wall-top"
					/>
					<div 
						style={{
							backgroundImage: "url(" + backgroundImageUrl + ")",
							backgroundSize: "cover",
						}}
						class="threeov-entry-wall threeov-entry-wall-bottom"
					/>
				</div>
			</div>
		  {/* <div className="threeov-spinner"></div> */}
			<div style={{
				zIndex: "1000",
				backgroundColor: "black",
				minWidth: "100px",
				maxHeight: "60px",
				padding: "20px",
				color: "white",
				textAlign: "center",
				position: "absolute",
				textShadow: "0 0 10px rgba(0,0,0,0.5)",
				bottom: ( screenwidth < 600 ? "130px" : "130px" ),
				fontSize: "0.9em",
				width: "350px"
			}}>
				Use [ <b>W</b> ], [ <b>A</b> ], [ <b>S</b> ], and [ <b>D</b> ] to move.
			</div>
		</div>
	);
}

function ChatBox(props) {
	
	const handleChange = async (event) => {
		event.preventDefault();
		event.stopPropagation();
	};

	useEffect(() => {
		let finalDefault = props.name + ': ' + props.defaultMessage;
		props.setMessages([finalDefault]);
	},[])

	const handleSubmit = async (event) => {
	  event.preventDefault();
  
	  // Get the value of the input element
	  const input = event.target.elements.message;
	  const value = input.value;

	  // Manually dispatch a 'message' event
	  window.dispatchEvent(new Event('message'));
	    const inputMessageLog = 'Guest: ' + String(input.value);
	//   props.setMessages([...props.messages, inputMessageLog]);
	input.value = '';

	// make sure the input prevents default when the user presses any keys
	input.addEventListener('keydown', function(event) {
		event.preventDefault();
	});
	input.addEventListener('keyup', function(event) {
		event.preventDefault();
	});
	  // Send the message to the localhost endpoint
	  const client = 1;
	  const channelId = "wordpress";
	  const entity = 1;
	  const speaker = "guest";
	  const agent = props.name;
	  const channel = "wordpress";

	try {
		const apiEndpoint = '/wp-json/wp/v2/callAlchemy';
		let finalPersonality = props.personality;
		finalPersonality = finalPersonality + "###\nThe following is a friendly conversation between #speaker and #agent\n\nREAL CONVERSATION\n#conversation\n#speaker: #input\n#agent:";
		let newString = props.objectsInRoom.join(", ");
		if (props.objectAwareness === "1") {
			finalPersonality = finalPersonality.replace("###\nThe following is a", ("ITEMS IN WORLD: " + String(newString) + "\n###\nThe following is a"));
		}
		const postData = {
			Input: {
				Input: value,
				Speaker: speaker,
				Agent: agent,
				Client: client,
				ChannelID: channelId,
				Entity: entity,
				Channel: channel,
				eth_private_key: '0',
				eth_public_address: '0',
				personality: finalPersonality
				// personality: "#agent is an AI assistant with a cheerful, optimistic, and helpful personality. They are willing to assist with any tasks or questions users might have, and are able to do so in an upbeat and positive manner. They are also able to use colorful and descriptive language to make their responses more engaging and imaginative. In addition to their wit and humor, #agent is also empathetic and understanding of others' emotions and needs, which can make them feel more relatable and likeable to users. #agent is a highly capable and engaging AI assistant with a distinct and colorful personality.\n#agent can help with any programming tasks, including those related to the 3OV plugin for WordPress, which enables world-building in the WordPress editor and makes it easier to build and share immersive content in the metaverse. The url for the website is 3ov.xyz. #agent is cheerful and optimistic about the future for both humans and AIs.\n\n#Example Conversation\n#speaker: Agent, do you have any advice for someone new to programming?\n#agent: Sure thing! My top tip would be to always keep an open mind and a positive attitude. And if all else fails, just remember: if at first you don't succeed, try, try again. And then if that still doesn't work, call it a day and go get a coffee.\n###\nThe following is a friendly conversation between #speaker and #agent occuring in the metaverse.\n\nREAL CONVERSATION\n#conversation\n#speaker: #input\n#agent:"
			}
		};
		// const postData = prompt;

		const response = await fetch('/wp-json/wp/v2/callAlchemy', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  'X-WP-Nonce': props.nonce,
			  'Authorization': ('Bearer ' + String(props.nonce))
			},
			body: JSON.stringify(postData)
		  }).then((response) => {

				return response.json();

			}).then(function(data) {
				// console.log("data", data.davinciData.choices[0].text);
				let thisMessage = JSON.parse(data);
				if(thisMessage?.model === "gpt-4-0314"){
					let formattedMessage = props.name +': ' + thisMessage.choices[0].message.content;
					props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
				} else if (thisMessage?.model === "gpt-3.5-turbo-0301"){
					let formattedMessage = props.name +': ' + Object.values(thisMessage.choices)[0].message.content;
					props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
				} else {
					if(thisMessage?.outputs){
						let formattedMessage = props.name +': ' + Object.values(thisMessage.outputs)[0];
						props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
					} else if(thisMessage?.name === "Server"){
						let formattedMessage = thisMessage.name +': ' + thisMessage.message;
						props.setMessages([...props.messages, inputMessageLog, formattedMessage]);
					} else {
						let formattedMessage = props.name +': ' + thisMessage.davinciData?.choices[0].text;
						// add formattedMessage and inputMessageLog to state
						props.setMessages([...props.messages, inputMessageLog, formattedMessage]);	
					}
				}
			});	
		} catch (error) {
			console.error(error);
		}
	};

	const ClickStop = ({ children }) => {
		return <div onClick={e => e.stopPropagation()}>{children}</div>;
	};

	const handleDummySubmit = async (event) => {
		event.preventDefault();
	
		// Get the value of the input element
		const input = event.target.elements.message;
		const value = input.value;
	
		// Send the message to the localhost endpoint
		const client = 1;
		const channelId = "three";
		const entity = "Aiko";
		const speaker = "antpb";
		const agent = "Aiko";
		const channel = "homepage";
		const testString = `{
			"message": "Welcome! Here you go: Test response complete. Is there anything else I can help you with?",
		  }`;

		  props.setMessages([...props.messages, testString]);

		};
	// return (
	// 	<>
	// 	<ClickStop>
	// 		<Resizable>
	// 			<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, marginTop: "-350px", width: "300px", height: "280px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", left: "2%", backgroundColor: "transparent"}}>
	// 				<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, width: "275px", maxHeight: "250px", height: "250px", fontSize: "0.8em", color: "#FFFFFF", backgroundColor: "#"}}>
	// 					<ScrollableFeed>
	// 						<ul style={{paddingLeft: "0px", marginLeft: "5px", listStyle: "none"}}>
	// 							{ props.showUI && props.messages && props.messages.length > 0 && props.messages.map((message, index) => (
	// 								<li style={{background: "#000000db", borderRadius: "30px", padding: "10px 20px"}} key={index}>{message}</li>
	// 							))}
	// 						</ul>
	// 					</ScrollableFeed>
	// 				</div>
	// 					<div style={{ width: "100%", height: "5%", position: "relative", bottom: "0px", boxSizing: "border-box", padding: "15px", paddingLeft: "7px" }}>
	// 					{/* {props.messages.map((message, index) => (
	// 					<p key={index}>{message}</p>
	// 					))} */}
	// 					<form style={{display: "flex"}} onSubmit={handleSubmit}>
	// 						<input style={{height: "30px", pointerEvents: "auto", borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px"} } type="text" name="message" onInput={handleChange} onChange={handleChange} />
	// 						<button className="threeov-chat-button-send" style={{ height: "30px", background: "#9100ff", color: "white", fontSize: ".9em", lineHeight: ".3em", borderTopRightRadius: "15px", borderBottomRightRadius: "15px", borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"} } type="submit">Send</button>
	// 					</form>
	// 				</div>
	// 			</div>
	// 		</Resizable>
	// 	</ClickStop>
	//   </>
	// );
	const [open, setOpen] = useState(false);
	const onSwitch = (e) => {
		e.preventDefault();
		e.stopPropagation();	
		setOpen(prevOpen => !prevOpen);
	};

	if(isMobile()){
		return (
			<>
			<button className="threeov-chat-button" onClick={onSwitch}>Chat</button>
			{open && (
				<ClickStop>
						<button className="threeov-chat-button" onClick={onSwitch}>Close</button>
						<div className="threeov-chat-container" style={{ pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, marginTop: "-350px", width: "300px", height: "280px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", left: "2%", backgroundColor: "transparent"}}>
							<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, width: "275px", maxHeight: "250px", height: "250px", fontSize: "0.8em", color: "#FFFFFF", backgroundColor: "#"}}>
								<ScrollableFeed>
									<ul style={{paddingLeft: "0px", marginLeft: "5px", listStyle: "none"}}>
										{ props.showUI && props.messages && props.messages.length > 0 && props.messages.map((message, index) => (
											<li style={{background: "#000000db", borderRadius: "30px", padding: "10px 20px"}} key={index}>{message}</li>
										))}
									</ul>
								</ScrollableFeed>
							</div>
								<div style={{ width: "100%", height: "5%", position: "relative", bottom: "0px", boxSizing: "border-box", padding: "15px", paddingLeft: "7px" }}>
								{/* {props.messages.map((message, index) => (
								<p key={index}>{message}</p>
								))} */}
								<form style={{display: "flex"}} autocomplete="off" onSubmit={handleSubmit}>
									<input autocomplete="false" style={{height: "30px", pointerEvents: "auto", borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px"} } type="text" name="message" onInput={handleChange} onChange={handleChange} onfocus={(e) => { e.preventDefault()} }/>
									<button className="threeov-chat-button-send" style={{ height: "30px", background: "#9100ff", color: "white", fontSize: ".9em", lineHeight: ".3em", borderTopRightRadius: "15px", borderBottomRightRadius: "15px", borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"} } type="submit">Send</button>
								</form>
							</div>
						</div>
				</ClickStop>
			)}
		  </>
		);
		} else {
			return (
				<>
					<ClickStop>
							<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, marginTop: "-350px", width: "300px", height: "280px", fontSize: ".8em", color: "#FFFFFF", bottom: "0", left: "2%", backgroundColor: "transparent"}}>
								<div style={{pointerEvents: "auto", position: "relative", paddingTop: "14px", paddingLeft: "5px", paddingRight: "5px", overflyY: "scroll", paddingBottom: "5px", boxSizing: "border-box", zIndex:100, width: "275px", maxHeight: "250px", height: "250px", fontSize: "0.8em", color: "#FFFFFF", backgroundColor: "#"}}>
									<ScrollableFeed>
										<ul style={{paddingLeft: "0px", marginLeft: "5px", listStyle: "none"}}>
											{ props.showUI && props.messages && props.messages.length > 0 && props.messages.map((message, index) => (
												<li style={{background: "#000000db", borderRadius: "30px", padding: "10px 20px"}} key={index}>{message}</li>
											))}
										</ul>
									</ScrollableFeed>
								</div>
									<div style={{ width: "100%", height: "5%", position: "relative", bottom: "0px", boxSizing: "border-box", padding: "15px", paddingLeft: "7px" }}>
									{/* {props.messages.map((message, index) => (
									<p key={index}>{message}</p>
									))} */}
									<form style={{display: "flex"}} autoComplete="off" onSubmit={handleSubmit}>
										<input type="text" style={{display: "none"}} />
										<input autocomplete="off" style={{height: "30px", pointerEvents: "auto", borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px"} } type="text" name="message" onInput={handleChange} onChange={handleChange} />
										<button className="threeov-chat-button-send" style={{ height: "30px", background: "#9100ff", color: "white", fontSize: ".9em", lineHeight: ".3em", borderTopRightRadius: "15px", borderBottomRightRadius: "15px", borderTopLeftRadius: "0px", borderBottomLeftRadius: "0px"} } type="submit">Send</button>
									</form>
								</div>
							</div>
					</ClickStop>
			  </>
			);
		}	
  }  

/**
 * Represents a saved object in a virtual reality world.
 *
 * @param {Object} props - The props for the saved object.
 *
 * @return {JSX.Element} The saved object.
 */
function SavedObject(props) {
	useEffect(() => {
		// Once the component is ready, dispatch an event to notify the parent
		const event = new Event('yourComponentReady');
		document.dispatchEvent(event);
	  }, []);


	useThree(({ camera, scene }) => {
		window.scene = scene;
		window.camera = camera;
	});

	const meshRef = useRef();
	const [url, set] = useState(props.url);
	useEffect(() => {
		setTimeout(() => set(props.url), 2000);
	}, []);
	const [listener] = useState(() => new THREE.AudioListener());
	const [colliders, setColliders] = useState();
	const [meshes, setMeshes] = useState();
	const [portals, setPortals] = useState();

	useThree(({ camera }) => {
		camera.add(listener);
	});
	
	const gltf = useLoader(GLTFLoader, url, (loader) => {
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath( threeObjectPluginRoot + "/inc/utils/draco/");
		dracoLoader.setDecoderConfig({type: 'js'});
		loader.setDRACOLoader(dracoLoader);

		loader.register(
			(parser) => new GLTFAudioEmitterExtension(parser, listener)
		);

		loader.register((parser) => {
			return new VRMLoaderPlugin(parser);
		});
	});
	const meshesScene = new THREE.Object3D();

	useEffect(() => {
		//OMI_collider logic.
		const childrenToParse = [];
		const collidersToAdd = [];
		const meshesToAdd = [];
		const portalsToAdd = [];
		const spawnPointsToAdd = [];
		const npcToAdd = [];
		let omiColliders;

		gltf.scene.scale.set(props.scale, props.scale, props.scale);
		gltf.scene.position.set(
			gltf.scene.position.x,
			props.positionY,
			gltf.scene.position.z
		);
		gltf.scene.rotation.set(
			gltf.scene.rotation.x,
			props.rotationY,
			gltf.scene.rotation.z
		);
		if (gltf.userData.gltfExtensions?.OMI_collider) {
			omiColliders = gltf.userData.gltfExtensions.OMI_collider.colliders;
		}

		gltf.scene.traverse((child) => {
			// @todo figure out shadows
			// if (child.isMesh) {
			// 	child.castShadow = true;
			// 	child.receiveShadow = true;
			// }
			if (child.isMesh) {
				if (child.userData.gltfExtensions?.MX_lightmap) {
					const extension = child.userData.gltfExtensions?.MX_lightmap;
					// @todo implement MX_lightmap
				}
				// add the mesh to the scene
				// meshesScene.add(child);
			}
			if (child.userData.gltfExtensions?.OMI_collider) {
				childrenToParse.push(child);
				// child.parent.remove(child.name);
			}
			if (child.userData.gltfExtensions?.OMI_link) {
				portalsToAdd.push(child);
			} else if (child.userData.gltfExtensions?.OMI_spawn_point) {
				spawnPointsToAdd.push(child);
			} else {
				meshesToAdd.push(child);
			}
		});

		meshesToAdd.forEach((mesh) => {
			meshesScene.attach(mesh);
		});

		childrenToParse.forEach((child) => {
			const index = child.userData.gltfExtensions.OMI_collider.collider;
			collidersToAdd.push([child, omiColliders[index]]);
			// gltf.scene.remove(child.name);
		});
		setColliders(collidersToAdd);
		setMeshes(meshesScene);
		setPortals(portalsToAdd);
		props.setSpawnPoints(spawnPointsToAdd);
		// End OMI_collider logic.
	}, []);

	const { actions } = useAnimations(gltf.animations, gltf.scene);

	const animationList = props.animations ? props.animations.split(",") : "";
	useEffect(() => {
		if (animationList) {
			animationList.forEach((name) => {
				if (Object.keys(actions).includes(name)) {
					actions[name].play();
				}
			});
		}
	}, []);

	return (
		<>
			{meshes && colliders.length > 0 && (
				<primitive
					// rotation={finalRotation}
					castShadow
					receiveShadow
					// position={item.getWorldPosition(pos)}
					object={meshes}
				/>
			)}
			{meshes && colliders.length === 0 && (
				<RigidBody type="fixed" colliders="trimesh">
					<primitive object={meshes} />
				</RigidBody>
			)}
			{portals &&
				portals.map((item, index) => {
					const pos = new THREE.Vector3();
					const quat = new THREE.Quaternion();
					const rotation = new THREE.Euler();
					const position = item.getWorldPosition(pos);
					const quaternion = item.getWorldQuaternion(quat);
					const finalRotation =
						rotation.setFromQuaternion(quaternion);
					return (
						<Portal
							key={index}
							positionX={position.x}
							positionY={position.y}
							positionZ={position.z}
							rotationX={finalRotation.x}
							rotationY={finalRotation.y}
							rotationZ={finalRotation.z}
							object={item.parent}
							label={props.label}
							defaultFont={defaultFont}
							threeObjectPlugin={threeObjectPlugin}
							destinationUrl={
								item.userData.gltfExtensions.OMI_link.uri
							}
						/>
					);
				})}
			{colliders &&
				colliders.map((item, index) => {
					const pos = new THREE.Vector3();
					const quat = new THREE.Quaternion();
					const rotation = new THREE.Euler();
					const quaternion = item[0].getWorldQuaternion(quat);
					const finalRotation =
						rotation.setFromQuaternion(quaternion);
					const worldPosition = item[0].getWorldPosition(pos);
					if (item[1].type === "mesh") {
						return (
							<RigidBody type="fixed" colliders="trimesh">
								<primitive
									rotation={finalRotation}
									position={worldPosition}
									object={item[0]}
								/>
							</RigidBody>
						);
					}
					if (item[1].type === "box") {
						return (
							<RigidBody type="fixed" colliders="cuboid">
								<primitive
									rotation={finalRotation}
									position={worldPosition}
									object={item[0]}
								/>
							</RigidBody>
						);
					}
					if (item[1].type === "capsule") {
						return (
							<RigidBody type="fixed" colliders="hull">
								<primitive
									rotation={finalRotation}
									position={worldPosition}
									object={item[0]}
								/>
							</RigidBody>
						);
					}
					if (item[1].type === "sphere") {
						return (
							<RigidBody type="fixed" colliders="ball">
								<primitive
									rotation={finalRotation}
									position={worldPosition}
									object={item[0]}
								/>
							</RigidBody>
						);
					}
				})}
		</>
	);
}

export default function EnvironmentFront(props) {
	  
	const [showUI, setShowUI] = useState(true);
	const [displayName, setDisplayName] = useState(props.userData.inWorldName);
	const [playerAvatar, setPlayerAvatar] = useState(props.userData.playerVRM);
	const canvasRef = useRef(null);
	const r3fCanvasRef = useRef(null);

	// let string = '{\"spell\":\"complexQuery\",\"outputs\":{\"Output\":\"{\\\"message\\\": \\\" Hi there! How can I help you?\\\",\\\"tone\\\": \\\"friendly\\\"}\"},\"state\":{}}';
	// let string = 'Hello! Welcome to this 3OV world! Feel free to ask me anything. I am especially versed in the 3OV metaverse plugin for WordPress.'
	const [mobileControls, setMobileControls] = useState(null);
	const [mobileRotControls, setMobileRotControls] = useState(null);	  
	const movement = useKeyboardControls();
	  

	const [messages, setMessages] = useState();
	const [messageHistory, setMessageHistory] = useState();
	const [loaded, setLoaded] = useState(false);
	const [spawnPoints, setSpawnPoints] = useState([0,0,0]);
	const [messageObject, setMessageObject] = useState({"tone": "happy", "message": "hello!"});
	const [objectsInRoom, setObjectsInRoom] = useState([]);
	const [url, setURL] = useState(props.threeUrl ? props.threeUrl : (defaultEnvironment));
	const [loadingWorld, setLoadingWorld] = useState(true);

	useEffect(() => {
		const handleReady = () => {
			setTimeout(() => {
				const event = new Event("loaderIsGone");
				window.dispatchEvent(event);
				setLoadingWorld(false);
			}, 3000);
		};
		// Listen for the ready event
		document.addEventListener('yourComponentReady', handleReady);

		return () => {
		  document.removeEventListener('yourComponentReady', handleReady);
		};
	  }, []);
	const [dpr, setDpr] = useState(2);

	useEffect(() => {
		const handleKeyDown = (event) => {
		  if ((event.key === ' ' || event.key === 'Spacebar') && document.pointerLockElement === r3fCanvasRef.current) {
			event.preventDefault(); // Prevent scrolling when spacebar is pressed
		  }
		};
	  
		window.addEventListener('keydown', handleKeyDown);
	  
		return () => {
		  window.removeEventListener('keydown', handleKeyDown);
		};
	  }, []);	  

	if (loaded === true) {
		// emit javascript event "loaded"
		const event = new Event("loaded");
		window.dispatchEvent(event);
		// const elements = document.body.getElementsByTagName('*');
		// const webXRNotAvail = Array.from(elements).find((el) => el.textContent === 'WEBXR NOT AVAILABLE');
		// if (webXRNotAvail) {
		// 	webXRNotAvail.style.display = "none";
		// }
		props.userData.inWorldName = displayName;
		window.userData = props.userData;
		props.userData.playerVRM = playerAvatar;

		if (props.deviceTarget === "vr") {
			return (
				<>
					{loadingWorld && <Loading previewImage={props.previewImage} />}
					<Canvas
						ref={r3fCanvasRef}
						tabindex={0}
						resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
						camera={{
							fov: 70,
							zoom: 1,
							far: 2000,
							position: [0, 0, 20]
						}}
						onPointerDown={(e) => {
							e.target.requestPointerLock();
						}}
						className="threeov-main-canvas"
						dpr={dpr}
						mode="concurrent"		
						// dpr={1.5}
						// shadowMap
						// linear={true}
						// shadows={{ type: "PCFSoftShadowMap" }}
						style={{
							backgroundColor: props.backgroundColor,
							margin: "0",
							height: "100vh",
							width: "100%",
							padding: "0",
							position: "relative",
							zIndex: 1
						}}
					>
						<AdaptiveDpr pixelated />
						<AdaptiveEvents />
						<PerformanceMonitor onFallback={() => setDpr(1)} factor={1} onChange={({ factor }) => setDpr(Math.floor(0.5 + 1.5 * factor, 1))} />
						<XR>
							<FrontPluginProvider>
							{/* <Perf className="stats" /> */}
							{/* <fog attach="fog" color="hotpink" near={100} far={20} /> */}
							<Hands />
							<Controllers />
							<Suspense>
								{props.hdr && 
									<Environment
										blur={0.05}
										files={props.hdr}
										background
									/>
								}
								<ContextBridgeComponent/>
								<Physics
									erp = {1}
									iterations = {10}
									// timestep = {1/30}
									// gravity={[0, -9.8, 0]}
									// interpolate={false}
									allowSleep={true}
									allowDeactivation={true}
									// allowCcd={true}
									// updateLoop="independent"
									debug={false}
									timeStep={"vary"}
									updateLoop={"follow"}
									updatePriority={-100}
								>
									{loaded && (
										<Player
											spawnPointsToAdd={spawnPoints}
											spawnPoint={props.spawnPoint}
											p2pcf={window.p2pcf}
											defaultAvatar={defaultAvatar}
											defaultPlayerAvatar = {defaultPlayerAvatar}
											movement={movement}
											camCollisions={props.camCollisions}
										/>
									)}
									{/* <Perf className="stats" /> */}
									{/* Debug physics */}
									{url && (
										<>
											<TeleportTravel
												spawnPointsToAdd={props.spawnPointsToAdd}
												spawnPoint={props.spawnPoint}
												useNormal={false}
											>
												{ ( props.networkingBlock.length > 0 ) && (
													<Participants 
														// participants={window.participants}
													/>
												)}
												<SavedObject
													positionY={props.positionY}
													rotationY={props.rotationY}
													url={url}
													color={props.backgroundColor}
													hasZoom={props.hasZoom}
													scale={props.scale}
													hasTip={props.hasTip}
													animations={props.animations}
													playerData={props.userData}
													setSpawnPoints={setSpawnPoints}
												/>
												{Object.values(props.sky).map(
													(item, index) => {
														return (
															<>
																<ThreeSky
																	src={props.sky}
																/>
															</>
														);
													}
												)}
												{Object.values(
													props.imagesToAdd
												).map((item, index) => {
													let imagePosX, imagePosY, imagePosZ, imageScaleX, imageScaleY, imageScaleZ;
													let imageRotationX, imageRotationY, imageRotationZ, imageUrl, aspectHeight, aspectWidth;
													let transparent;
													if(item.tagName.toLowerCase() === 'three-image-block'){
														imagePosX = item.getAttribute('positionX') || '';
														imagePosY = item.getAttribute('positionY') || '';
														imagePosZ = item.getAttribute('positionZ') || '';
														imageScaleX = item.getAttribute('scaleX') || '';
														imageScaleY = item.getAttribute('scaleY') || '';
														imageScaleZ = item.getAttribute('scaleZ') || '';
														imageRotationX = item.getAttribute('rotationX') || '';
														imageRotationY = item.getAttribute('rotationY') || '';
														imageRotationZ = item.getAttribute('rotationZ') || '';
														imageUrl = item.getAttribute('imageUrl') || '';
														aspectHeight = item.getAttribute('aspectHeight') || '';
														aspectWidth = item.getAttribute('aspectWidth') || '';
														transparent = item.getAttribute('transparent') || false;
													} else {
														imagePosX =
															item.querySelector(
																"p.image-block-positionX"
															)
																? item.querySelector(
																	"p.image-block-positionX"
																).innerText
																: "";

														imagePosY =
															item.querySelector(
																"p.image-block-positionY"
															)
																? item.querySelector(
																	"p.image-block-positionY"
																).innerText
																: "";

														imagePosZ =
															item.querySelector(
																"p.image-block-positionZ"
															)
																? item.querySelector(
																	"p.image-block-positionZ"
																).innerText
																: "";

														imageScaleX =
															item.querySelector(
																"p.image-block-scaleX"
															)
																? item.querySelector(
																	"p.image-block-scaleX"
																).innerText
																: "";

														imageScaleY =
															item.querySelector(
																"p.image-block-scaleY"
															)
																? item.querySelector(
																	"p.image-block-scaleY"
																).innerText
																: "";

														imageScaleZ =
															item.querySelector(
																"p.image-block-scaleZ"
															)
																? item.querySelector(
																	"p.image-block-scaleZ"
																).innerText
																: "";

														imageRotationX =
															item.querySelector(
																"p.image-block-rotationX"
															)
																? item.querySelector(
																	"p.image-block-rotationX"
																).innerText
																: "";

														imageRotationY =
															item.querySelector(
																"p.image-block-rotationY"
															)
																? item.querySelector(
																	"p.image-block-rotationY"
																).innerText
																: "";

														imageRotationZ =
															item.querySelector(
																"p.image-block-rotationZ"
															)
																? item.querySelector(
																	"p.image-block-rotationZ"
																).innerText
																: "";

														imageUrl =
															item.querySelector(
																"p.image-block-url"
															)
																? item.querySelector(
																	"p.image-block-url"
																).innerText
																: "";

														aspectHeight =
															item.querySelector(
																"p.image-block-aspect-height"
															)
																? item.querySelector(
																	"p.image-block-aspect-height"
																).innerText
																: "";

														aspectWidth =
															item.querySelector(
																"p.image-block-aspect-width"
															)
																? item.querySelector(
																	"p.image-block-aspect-width"
																).innerText
																: "";

														transparent =
															item.querySelector(
																"p.image-block-transparent"
															)
																? item.querySelector(
																	"p.image-block-transparent"
																).innerText
																: false;
													}
													return (
														<ThreeImage
															key={index}
															url={imageUrl}
															positionX={imagePosX}
															positionY={imagePosY}
															positionZ={imagePosZ}
															scaleX={imageScaleX}
															scaleY={imageScaleY}
															scaleZ={imageScaleZ}
															rotationX={
																imageRotationX
															}
															rotationY={
																imageRotationY
															}
															rotationZ={
																imageRotationZ
															}
															aspectHeight={
																aspectHeight
															}
															aspectWidth={
																aspectWidth
															}
															transparent={
																transparent
															}
														/>
													);
												})}
												{Object.values(props.videosToAdd).map((item, index) => {
													let videoPosX, videoPosY, videoPosZ, videoScaleX, videoScaleY, videoScaleZ;
													let videoRotationX, videoRotationY, videoRotationZ, videoUrl, aspectHeight, aspectWidth;
													let autoPlay, customModel, videoModelUrl, videoControlsEnabled;

													if (item.tagName.toLowerCase() === 'three-video-block') {
														videoPosX = item.getAttribute('positionX') || '';
														videoPosY = item.getAttribute('positionY') || '';
														videoPosZ = item.getAttribute('positionZ') || '';
														videoScaleX = item.getAttribute('scaleX') || '';
														videoScaleY = item.getAttribute('scaleY') || '';
														videoScaleZ = item.getAttribute('scaleZ') || '';
														videoRotationX = item.getAttribute('rotationX') || '';
														videoRotationY = item.getAttribute('rotationY') || '';
														videoRotationZ = item.getAttribute('rotationZ') || '';
														videoUrl = item.getAttribute('videoUrl') || '';
														aspectHeight = item.getAttribute('aspectHeight') || '';
														aspectWidth = item.getAttribute('aspectWidth') || '';
														autoPlay = item.hasAttribute('autoplay') ? "1" : false;
														customModel = item.getAttribute('customModel') ? item.getAttribute('customModel') : false;
														videoModelUrl = item.getAttribute('modelUrl') || '';
														videoControlsEnabled = item.getAttribute('videoControlsEnabled') === "1" ? true : false;
													} else {
														videoPosX =
														item.querySelector(
															"p.video-block-positionX"
														)
															? item.querySelector(
																"p.video-block-positionX"
															).innerText
															: "";

														videoPosY =
															item.querySelector(
																"p.video-block-positionY"
															)
																? item.querySelector(
																	"p.video-block-positionY"
																).innerText
																: "";

														videoPosZ =
															item.querySelector(
																"p.video-block-positionZ"
															)
																? item.querySelector(
																	"p.video-block-positionZ"
																).innerText
																: "";

														videoScaleX =
															item.querySelector(
																"p.video-block-scaleX"
															)
																? item.querySelector(
																	"p.video-block-scaleX"
																).innerText
																: "";

														videoScaleY =
															item.querySelector(
																"p.video-block-scaleY"
															)
																? item.querySelector(
																	"p.video-block-scaleY"
																).innerText
																: "";

														videoScaleZ =
															item.querySelector(
																"p.video-block-scaleZ"
															)
																? item.querySelector(
																	"p.video-block-scaleZ"
																).innerText
																: "";

														videoRotationX =
															item.querySelector(
																"p.video-block-rotationX"
															)
																? item.querySelector(
																	"p.video-block-rotationX"
																).innerText
																: "";

														videoRotationY =
															item.querySelector(
																"p.video-block-rotationY"
															)
																? item.querySelector(
																	"p.video-block-rotationY"
																).innerText
																: "";

														videoRotationZ =
															item.querySelector(
																"p.video-block-rotationZ"
															)
																? item.querySelector(
																	"p.video-block-rotationZ"
																).innerText
																: "";

														videoUrl =
															item.querySelector(
																"div.video-block-url"
															)
																? item.querySelector(
																	"div.video-block-url"
																).innerText
																: "";

														aspectHeight =
															item.querySelector(
																"p.video-block-aspect-height"
															)
																? item.querySelector(
																	"p.video-block-aspect-height"
																).innerText
																: "";

														aspectWidth =
															item.querySelector(
																"p.video-block-aspect-width"
															)
																? item.querySelector(
																	"p.video-block-aspect-width"
																).innerText
																: "";

														autoPlay =
															item.querySelector(
																"p.video-block-autoplay"
															)
																? item.querySelector(
																	"p.video-block-autoplay"
																).innerText
																: false;
		
														customModel =
															item.querySelector(
																"p.video-block-custom-model"
															)
																? item.querySelector(
																	"p.video-block-custom-model"
																).innerText
																: false;
														videoModelUrl =
														item.querySelector(
															"div.video-block-model-url"
														)
														? item.querySelector(
															"div.video-block-model-url"
														).innerText
														: "";
														videoControlsEnabled = true;
													}
													return (
														<ThreeVideo
															key={index}
															url={videoUrl}
															positionX={videoPosX}
															positionY={videoPosY}
															positionZ={videoPosZ}
															scaleX={videoScaleX}
															scaleY={videoScaleY}
															scaleZ={videoScaleZ}
															rotationX={
																videoRotationX
															}
															rotationY={
																videoRotationY
															}
															rotationZ={
																videoRotationZ
															}
															aspectHeight={
																aspectHeight
															}
															aspectWidth={
																aspectWidth
															}
															autoPlay={autoPlay}
															customModel={customModel}
															threeObjectPlugin={threeObjectPlugin}
															threeObjectPluginRoot={threeObjectPluginRoot}
															modelUrl={videoModelUrl}
															videoControlsEnabled={videoControlsEnabled}
														/>
													);
												})}
												{Object.values(props.audiosToAdd).map((item, index) => {
													let audioPosX, audioPosY, audioPosZ, audioScaleX, audioScaleY, audioScaleZ;
													let audioRotationX, audioRotationY, audioRotationZ, audioUrl;
													let autoPlay, loop, volume, positional, coneInnerAngle, coneOuterAngle, coneOuterGain, distanceModel, maxDistance, refDistance, rolloffFactor;
													if (item.tagName.toLowerCase() === 'three-audio-block') {
														audioPosX = item.getAttribute('positionX') || '';
														audioPosY = item.getAttribute('positionY') || '';
														audioPosZ = item.getAttribute('positionZ') || '';
														audioScaleX = item.getAttribute('scaleX') || '';
														audioScaleY = item.getAttribute('scaleY') || '';
														audioScaleZ = item.getAttribute('scaleZ') || '';
														audioRotationX = item.getAttribute('rotationX') || '';
														audioRotationY = item.getAttribute('rotationY') || '';
														audioRotationZ = item.getAttribute('rotationZ') || '';
														audioUrl = item.getAttribute('audioUrl') || '';
														autoPlay = item.hasAttribute('autoplay') ? "1" : false;
														loop = item.hasAttribute('loop') ? "1" : false;
														volume = item.getAttribute('volume') || '';
														positional = item.hasAttribute('positional') ? "1" : false;
														coneInnerAngle = item.getAttribute('coneInnerAngle') || '';
														coneOuterAngle = item.getAttribute('coneOuterAngle') || '';
														coneOuterGain = item.getAttribute('coneOuterGain') || '';
														distanceModel = item.getAttribute('distanceModel') || '';
														maxDistance = item.getAttribute('maxDistance') || '';
														refDistance = item.getAttribute('refDistance') || '';
														rolloffFactor = item.getAttribute('rolloffFactor') || '';
													} else {
														audioPosX = item.querySelector("p.audio-block-positionX")
															? item.querySelector("p.audio-block-positionX").innerText
															: "";

														audioPosY = item.querySelector("p.audio-block-positionY")
															? item.querySelector("p.audio-block-positionY").innerText
															: "";

														audioPosZ = item.querySelector("p.audio-block-positionZ")
															? item.querySelector("p.audio-block-positionZ").innerText
															: "";

														audioScaleX = item.querySelector("p.audio-block-scaleX")
															? item.querySelector("p.audio-block-scaleX").innerText
															: "";

														audioScaleY = item.querySelector("p.audio-block-scaleY")
															? item.querySelector("p.audio-block-scaleY").innerText
															: "";

														audioScaleZ = item.querySelector("p.audio-block-scaleZ")
															? item.querySelector("p.audio-block-scaleZ").innerText
															: "";

														audioRotationX = item.querySelector("p.audio-block-rotationX")
															? item.querySelector("p.audio-block-rotationX").innerText
															: "";

														audioRotationY = item.querySelector("p.audio-block-rotationY")
															? item.querySelector("p.audio-block-rotationY").innerText
															: "";

														audioRotationZ = item.querySelector("p.audio-block-rotationZ")
															? item.querySelector("p.audio-block-rotationZ").innerText
															: "";

														audioUrl = item.querySelector("p.audio-block-url")
															? item.querySelector("p.audio-block-url").innerText
															: "";

														autoPlay = item.querySelector("p.audio-block-autoPlay")
															? item.querySelector("p.audio-block-autoPlay").innerText === "1"
															: false;

														loop = item.querySelector("p.audio-block-loop")
															? item.querySelector("p.audio-block-loop").innerText === "1"
															: false;

														volume = item.querySelector("p.audio-block-volume")
															? Number(item.querySelector("p.audio-block-volume").innerText)
															: 1;

														positional = item.querySelector("p.audio-block-positional")
															? item.querySelector("p.audio-block-positional").innerText === "1"
															: false;

														coneInnerAngle = item.querySelector("p.audio-block-coneInnerAngle")
															? Number(item.querySelector("p.audio-block-coneInnerAngle").innerText)
															: 1;

														coneOuterAngle = item.querySelector("p.audio-block-coneOuterAngle")
															? Number(item.querySelector("p.audio-block-coneOuterAngle").innerText)
															: 1;

														coneOuterGain = item.querySelector("p.audio-block-coneOuterGain")
															? Number(item.querySelector("p.audio-block-coneOuterGain").innerText)
															: 1;

														distanceModel = item.querySelector("p.audio-block-distanceModel")
															? item.querySelector("p.audio-block-distanceModel").innerText
															: "inverse";

														maxDistance = item.querySelector("p.audio-block-maxDistance")
															? Number(item.querySelector("p.audio-block-maxDistance").innerText)
															: 1;

														refDistance = item.querySelector("p.audio-block-refDistance")
															? Number(item.querySelector("p.audio-block-refDistance").innerText)
															: 1;

														rolloffFactor = item.querySelector("p.audio-block-rolloffFactor")
															? Number(item.querySelector("p.audio-block-rolloffFactor").innerText)
															: 1;
												}

												return (
													<ThreeAudio
													key={index}
													audioUrl={audioUrl}
													positionX={audioPosX}
													positionY={audioPosY}
													positionZ={audioPosZ}
													scaleX={audioScaleX}
													scaleY={audioScaleY}
													scaleZ={audioScaleZ}
													rotationX={audioRotationX}
													rotationY={audioRotationY}
													rotationZ={audioRotationZ}
													autoPlay={autoPlay ? "1" : "0"} 
													loop={loop ? "1" : "0"}
													volume={volume}
													positional={positional ? "1" : "0"}
													coneInnerAngle={coneInnerAngle}
													coneOuterAngle={coneOuterAngle}
													coneOuterGain={coneOuterGain}
													distanceModel={distanceModel}
													maxDistance={maxDistance}
													refDistance={refDistance}
													rolloffFactor={rolloffFactor}
													/>
												);
												})}
												{props.lightsToAdd.length < 1 && (
													<>
														<ambientLight intensity={0.8} />
														<directionalLight
															intensity={0.7}
															position={[0, 2, 2]}
														// shadow-mapSize-width={512}
														// shadow-mapSize-height={512}
														// shadow-camera-far={5000}
														// shadow-camera-fov={15}
														// shadow-camera-near={0.5}
														// shadow-camera-left={-50}
														// shadow-camera-bottom={-50}
														// shadow-camera-right={50}
														// shadow-camera-top={50}
														// shadow-radius={1}
														// shadow-bias={-0.001}
														// castShadow
														/>
													</>
												)}
												{Object.values(props.lightsToAdd).map((item, index) => {
													let lightPosX, lightPosY, lightPosZ, lightRotationX, lightRotationY, lightRotationZ;
													let lightType, lightColor, lightItensity, lightDistance, lightDecay, lightAngle, lightPenumbra;
													let targetX, targetY, targetZ = 0;
													if (item.tagName.toLowerCase() === 'three-light-block') {
														lightPosX = item.getAttribute('positionX') || '';
														lightPosY = item.getAttribute('positionY') || '';
														lightPosZ = item.getAttribute('positionZ') || '';
														lightRotationX = item.getAttribute('rotationX') || '';
														lightRotationY = item.getAttribute('rotationY') || '';
														lightRotationZ = item.getAttribute('rotationZ') || '';
														lightType = item.getAttribute('type') || 'ambient';
														lightColor = item.getAttribute('color') || '';
														lightItensity = item.getAttribute('intensity') || '';
														lightDistance = item.getAttribute('distance') || '';
														lightDecay = item.getAttribute('decay') || '';
														lightAngle = item.getAttribute('angle') || '';
														lightPenumbra = item.getAttribute('penumbra') || '';
													} else {
														lightPosX = item.querySelector("p.light-block-positionX")
															? item.querySelector("p.light-block-positionX").innerText
															: "";

														lightPosY = item.querySelector("p.light-block-positionY")
															? item.querySelector("p.light-block-positionY").innerText
															: "";

														lightPosZ = item.querySelector("p.light-block-positionZ")
															? item.querySelector("p.light-block-positionZ").innerText
															: "";

														lightRotationX = item.querySelector("p.light-block-rotationX")
															? item.querySelector("p.light-block-rotationX").innerText
															: "";

														lightRotationY = item.querySelector("p.light-block-rotationY")
															? item.querySelector("p.light-block-rotationY").innerText
															: "";

														lightRotationZ = item.querySelector("p.light-block-rotationZ")
															? item.querySelector("p.light-block-rotationZ").innerText
															: "";

														lightType = item.querySelector("p.light-block-type")
															? item.querySelector("p.light-block-type").innerText
															: "ambient";

														lightColor = item.querySelector("p.light-block-color")
															? item.querySelector("p.light-block-color").innerText
															: "";

														lightItensity = item.querySelector("p.light-block-intensity")
															? item.querySelector("p.light-block-intensity").innerText
															: "";
			
														lightDistance = item.querySelector("p.light-block-distance")
															? item.querySelector("p.light-block-distance").innerText
															: "";

														lightDecay = item.querySelector("p.light-block-decay")
															? item.querySelector("p.light-block-decay").innerText
															: "";

														lightAngle = item.querySelector("p.light-block-angle")
															? item.querySelector("p.light-block-angle").innerText
															: "";

														lightPenumbra = item.querySelector("p.light-block-penumbra")
															? item.querySelector("p.light-block-penumbra").innerText
															: "";
												}

												return (
													<ThreeLight
														key={index}
														positionX={lightPosX}
														positionY={lightPosY}
														positionZ={lightPosZ}
														rotationX={lightRotationX}
														rotationY={lightRotationY}
														rotationZ={lightRotationZ}
														type={lightType}
														color={lightColor}
														intensity={lightItensity}
														distance={lightDistance}
														decay={lightDecay}
														angle={lightAngle}
														penumbra={lightPenumbra}
													/>
												);
												})}

												{Object.values(
													props.npcsToAdd
												).map((npc, index) => {
													let url, modelPosX, modelPosY, modelPosZ, modelRotationX, modelRotationY, modelRotationZ, name, alt, defaultMessage, personality, objectAwareness;
													if (npc.tagName.toLowerCase() === 'three-npc-block') {
														url= npc.getAttribute('threeObjectUrl') || '';
														modelPosX = npc.getAttribute('positionX') || '';
														modelPosY = npc.getAttribute('positionY') || '';
														modelPosZ = npc.getAttribute('positionZ') || '';
														modelRotationX = npc.getAttribute('rotationX') || '';
														modelRotationY = npc.getAttribute('rotationY') || '';
														modelRotationZ = npc.getAttribute('rotationZ') || '';
														name = npc.getAttribute('name') || '';
														defaultMessage = npc.getAttribute('defaultMessage') || '';
														personality = npc.getAttribute('personality') || '';
														objectAwareness = npc.getAttribute('objectAwareness') || false;
													} else {
														modelPosX =
															npc.querySelector(
																"p.npc-block-position-x"
															)
																? npc.querySelector(
																	"p.npc-block-position-x"
																).innerText
																: "";

														modelPosY =
															npc.querySelector(
																"p.npc-block-position-y"
															)
																? npc.querySelector(
																	"p.npc-block-position-y"
																).innerText
																: "";

														modelPosZ =
															npc.querySelector(
																"p.npc-block-position-z"
															)
																? npc.querySelector(
																	"p.npc-block-position-z"
																).innerText
																: "";

														modelRotationX =
															npc.querySelector(
																"p.npc-block-rotation-x"
															)
																? npc.querySelector(
																	"p.npc-block-rotation-x"
																).innerText
																: "";

														modelRotationY =
															npc.querySelector(
																"p.npc-block-rotation-y"
															)
																? npc.querySelector(
																	"p.npc-block-rotation-y"
																).innerText
																: "";

														modelRotationZ =
															npc.querySelector(
																"p.npc-block-rotation-z"
															)
																? npc.querySelector(
																	"p.npc-block-rotation-z"
																).innerText
																: "";

														url = npc.querySelector(
															"p.npc-block-url"
														)
															? npc.querySelector(
																"p.npc-block-url"
															).innerText
															: "";

														alt = npc.querySelector(
															"p.npc-block-alt"
														)
															? npc.querySelector(
																"p.npc-block-alt"
															).innerText
															: "";

														personality = npc.querySelector(
																"p.npc-block-personality"
															)
																? npc.querySelector(
																	"p.npc-block-personality"
																).innerText
																: "";

														defaultMessage = npc.querySelector(
																"p.npc-block-default-message"
															)
																? npc.querySelector(
																	"p.npc-block-default-message"
																).innerText
																: "";
			
														name = npc.querySelector(
																"p.npc-block-name"
															)
																? npc.querySelector(
																	"p.npc-block-name"
																).innerText
																: "";
				
														objectAwareness =
															npc.querySelector(
																"p.npc-block-object-awareness"
															)
																? npc.querySelector(
																	"p.npc-block-object-awareness"
																).innerText
																: false;
													}

													return (
														<NPCObject
															key={index}
															url={url}
															positionX={modelPosX}
															positionY={modelPosY}
															positionZ={modelPosZ}
															messages={messages}
															rotationX={
																modelRotationX
															}
															rotationY={
																modelRotationY
															}
															rotationZ={
																modelRotationZ
															}
															objectAwareness={objectAwareness}
															name={name}
															message={
																messageObject
															}
															threeObjectPlugin={threeObjectPlugin}
															threeObjectPluginRoot={threeObjectPluginRoot}
															defaultAvatarAnimation={defaultAvatarAnimation}
															defaultFont={defaultFont}
															defaultMessage={defaultMessage}
															personality={personality}
															// idle={idle}
														/>
													);
												})}
												{Object.values(
													props.modelsToAdd
												).map((model, index) => {
													let modelPosX, modelPosY, modelPosZ, modelScaleX, modelScaleY, modelScaleZ;
													let modelRotationX, modelRotationY, modelRotationZ, url, animations, alt, collidable;
													if (model.tagName.toLowerCase() === 'three-model-block') {
														modelPosX = model.getAttribute('positionX') || '';
														modelPosY = model.getAttribute('positionY') || '';
														modelPosZ = model.getAttribute('positionZ') || '';
														modelScaleX = model.getAttribute('scaleX') || '';
														modelScaleY = model.getAttribute('scaleY') || '';
														modelScaleZ = model.getAttribute('scaleZ') || '';
														modelRotationX = model.getAttribute('rotationX') || '';
														modelRotationY = model.getAttribute('rotationY') || '';
														modelRotationZ = model.getAttribute('rotationZ') || '';
														url = model.getAttribute('threeObjectUrl') || '';
														animations = model.getAttribute('animations') || '';
														alt = model.getAttribute('alt') || '';
														if (!objectsInRoom.includes(alt)) {
															setObjectsInRoom([...objectsInRoom, alt]);
														}
														collidable = model.getAttribute('collidable');
													} else {
														modelPosX =
															model.querySelector(
																"p.model-block-position-x"
															)
																? model.querySelector(
																	"p.model-block-position-x"
																).innerText
																: "";

														modelPosY =
															model.querySelector(
																"p.model-block-position-y"
															)
																? model.querySelector(
																	"p.model-block-position-y"
																).innerText
																: "";

														modelPosZ =
															model.querySelector(
																"p.model-block-position-z"
															)
																? model.querySelector(
																	"p.model-block-position-z"
																).innerText
																: "";

														modelScaleX =
															model.querySelector(
																"p.model-block-scale-x"
															)
																? model.querySelector(
																	"p.model-block-scale-x"
																).innerText
																: "";

														modelScaleY =
															model.querySelector(
																"p.model-block-scale-y"
															)
																? model.querySelector(
																	"p.model-block-scale-y"
																).innerText
																: "";

														modelScaleZ =
															model.querySelector(
																"p.model-block-scale-z"
															)
																? model.querySelector(
																	"p.model-block-scale-z"
																).innerText
																: "";

														modelRotationX =
															model.querySelector(
																"p.model-block-rotation-x"
															)
																? model.querySelector(
																	"p.model-block-rotation-x"
																).innerText
																: "";

														modelRotationY =
															model.querySelector(
																"p.model-block-rotation-y"
															)
																? model.querySelector(
																	"p.model-block-rotation-y"
																).innerText
																: "";

														modelRotationZ =
															model.querySelector(
																"p.model-block-rotation-z"
															)
																? model.querySelector(
																	"p.model-block-rotation-z"
																).innerText
																: "";

														url = model.querySelector(
															"p.model-block-url"
														)
															? model.querySelector(
																"p.model-block-url"
															).innerText
															: "";

														animations =
															model.querySelector(
																"p.model-block-animations"
															)
																? model.querySelector(
																	"p.model-block-animations"
																).innerText
																: "";

														alt = model.querySelector(
															"p.model-block-alt"
														)
															? model.querySelector(
																"p.model-block-alt"
															).innerText
															: "";

															if (!objectsInRoom.includes(alt)) {
																setObjectsInRoom([...objectsInRoom, alt]);
															}
															
														collidable =
															model.querySelector(
																"p.model-block-collidable"
															)
																? model.querySelector(
																	"p.model-block-collidable"
																).innerText
																: false;
													}
													// log all of the vars above
													return (
														<ModelObject
															key={index}
															url={url}
															positionX={modelPosX}
															positionY={modelPosY}
															positionZ={modelPosZ}
															scaleX={modelScaleX}
															scaleY={modelScaleY}
															scaleZ={modelScaleZ}
															messages={messages}
															rotationX={
																modelRotationX
															}
															rotationY={
																modelRotationY
															}
															rotationZ={
																modelRotationZ
															}
															alt={alt}
															animations={animations}
															collidable={collidable}
															message={
																messageObject
															}
															threeObjectPlugin={threeObjectPlugin}
															threeObjectPluginRoot={threeObjectPluginRoot}
															defaultFont={defaultFont}
															// idle={idle}
														/>
													);
												})}
												{Object.values(props.textToAdd).map(
													(model, index) => {
														let textContent, rotationX, rotationY, rotationZ, positionX, positionY, positionZ, scaleX, scaleY, scaleZ, textColor;

														if (model.tagName.toLowerCase() === 'three-text-block') {
															textContent = model.getAttribute('textContent') || '';
															rotationX = model.getAttribute('rotationX') || '';
															rotationY = model.getAttribute('rotationY') || '';
															rotationZ = model.getAttribute('rotationZ') || '';
															positionX = model.getAttribute('positionX') || '';
															positionY = model.getAttribute('positionY') || '';
															positionZ = model.getAttribute('positionZ') || '';
															scaleX = model.getAttribute('scaleX') || '';
															scaleY = model.getAttribute('scaleY') || '';
															scaleZ = model.getAttribute('scaleZ') || '';
															textColor = model.getAttribute('textColor') || '';
														} else {
															textContent =
																model.querySelector(
																	"p.three-text-content"
																)
																	? model.querySelector(
																		"p.three-text-content"
																	).innerText
																	: "";
															rotationX =
																model.querySelector(
																	"p.three-text-rotationX"
																)
																	? model.querySelector(
																		"p.three-text-rotationX"
																	).innerText
																	: "";
															rotationY =
																model.querySelector(
																	"p.three-text-rotationY"
																)
																	? model.querySelector(
																		"p.three-text-rotationY"
																	).innerText
																	: "";
															rotationZ =
																model.querySelector(
																	"p.three-text-rotationZ"
																)
																	? model.querySelector(
																		"p.three-text-rotationZ"
																	).innerText
																	: "";
															positionX =
																model.querySelector(
																	"p.three-text-positionX"
																)
																	? model.querySelector(
																		"p.three-text-positionX"
																	).innerText
																	: "";
															positionY =
																model.querySelector(
																	"p.three-text-positionY"
																)
																	? model.querySelector(
																		"p.three-text-positionY"
																	).innerText
																	: "";
															positionZ =
																model.querySelector(
																	"p.three-text-positionZ"
																)
																	? model.querySelector(
																		"p.three-text-positionZ"
																	).innerText
																	: "";
															scaleX =
																model.querySelector(
																	"p.three-text-scaleX"
																)
																	? model.querySelector(
																		"p.three-text-scaleX"
																	).innerText
																	: "";
															scaleY =
																model.querySelector(
																	"p.three-text-scaleY"
																)
																	? model.querySelector(
																		"p.three-text-scaleY"
																	).innerText
																	: "";
															scaleZ =
																model.querySelector(
																	"p.three-text-scaleZ"
																)
																	? model.querySelector(
																		"p.three-text-scaleZ"
																	).innerText
																	: "";

															textColor =
																model.querySelector(
																	"p.three-text-color"
																)
																	? model.querySelector(
																		"p.three-text-color"
																	).innerText
																	: "";
														}

														return (
															<TextObject
																key={index}
																textContent={
																	textContent
																}
																positionX={
																	positionX
																}
																positionY={
																	positionY
																}
																positionZ={
																	positionZ
																}
																scaleX={scaleX}
																scaleY={scaleY}
																scaleZ={scaleZ}
																defaultFont={defaultFont}
																threeObjectPlugin={threeObjectPlugin}
																textColor={
																	textColor
																}
																rotationX={
																	rotationX
																}
																rotationY={
																	rotationY
																}
																rotationZ={
																	rotationZ
																}
															// alt={alt}
															// animations={animations}
															/>
														);
													}
												)}
												{Object.values(
													props.portalsToAdd
												).map((model, index) => {
													let modelPosX, modelPosY, modelPosZ, modelScaleX, modelScaleY, modelScaleZ;
													let modelRotationX, modelRotationY, modelRotationZ, url, destinationUrl, animations, label, labelOffsetX, labelOffsetY, labelOffsetZ, labelTextColor;
													if (model.tagName.toLowerCase() === 'three-portal-block') {
														modelPosX = model.getAttribute('positionX') || '';
														modelPosY = model.getAttribute('positionY') || '';
														modelPosZ = model.getAttribute('positionZ') || '';
														modelScaleX = model.getAttribute('scaleX') || '';
														modelScaleY = model.getAttribute('scaleY') || '';
														modelScaleZ = model.getAttribute('scaleZ') || '';
														modelRotationX = model.getAttribute('rotationX') || '';
														modelRotationY = model.getAttribute('rotationY') || '';
														modelRotationZ = model.getAttribute('rotationZ') || '';
														url = model.getAttribute('threeObjectUrl') || '';
														destinationUrl = model.getAttribute('destinationUrl') || '';
														animations = model.getAttribute('animations') || '';
														label = model.getAttribute('label') || '';
														labelOffsetX = model.getAttribute('labelOffsetX') || '';
														labelOffsetY = model.getAttribute('labelOffsetY') || '';
														labelOffsetZ = model.getAttribute('labelOffsetZ') || '';
														labelTextColor = model.getAttribute('labelTextColor') || '';
													} else {
													modelPosX =
														model.querySelector(
															"p.three-portal-block-position-x"
														)
															? model.querySelector(
																"p.three-portal-block-position-x"
															).innerText
															: "";

													modelPosY =
														model.querySelector(
															"p.three-portal-block-position-y"
														)
															? model.querySelector(
																"p.three-portal-block-position-y"
															).innerText
															: "";

													modelPosZ =
														model.querySelector(
															"p.three-portal-block-position-z"
														)
															? model.querySelector(
																"p.three-portal-block-position-z"
															).innerText
															: "";

													modelScaleX =
														model.querySelector(
															"p.three-portal-block-scale-x"
														)
															? model.querySelector(
																"p.three-portal-block-scale-x"
															).innerText
															: "";

													modelScaleY =
														model.querySelector(
															"p.three-portal-block-scale-y"
														)
															? model.querySelector(
																"p.three-portal-block-scale-y"
															).innerText
															: "";

													modelScaleZ =
														model.querySelector(
															"p.three-portal-block-scale-z"
														)
															? model.querySelector(
																"p.three-portal-block-scale-z"
															).innerText
															: "";

													modelRotationX =
														model.querySelector(
															"p.three-portal-block-rotation-x"
														)
															? model.querySelector(
																"p.three-portal-block-rotation-x"
															).innerText
															: "";

													modelRotationY =
														model.querySelector(
															"p.three-portal-block-rotation-y"
														)
															? model.querySelector(
																"p.three-portal-block-rotation-y"
															).innerText
															: "";

													modelRotationZ =
														model.querySelector(
															"p.three-portal-block-rotation-z"
														)
															? model.querySelector(
																"p.three-portal-block-rotation-z"
															).innerText
															: "";

													url = model.querySelector(
														"p.three-portal-block-url"
													)
														? model.querySelector(
															"p.three-portal-block-url"
														).innerText
														: "";

													destinationUrl =
														model.querySelector(
															"p.three-portal-block-destination-url"
														)
															? model.querySelector(
																"p.three-portal-block-destination-url"
															).innerText
															: "";

													animations =
														model.querySelector(
															"p.three-portal-block-animations"
														)
															? model.querySelector(
																"p.three-portal-block-animations"
															).innerText
															: "";

													label =
														model.querySelector(
															"p.three-portal-block-label"
														)
															? model.querySelector(
																"p.three-portal-block-label"
															).innerText
															: "";

													labelOffsetX =
														model.querySelector(
															"p.three-portal-block-label-offset-x"
														)
															? model.querySelector(
																"p.three-portal-block-label-offset-x"
															).innerText
															: "";

													labelOffsetY =
														model.querySelector(
															"p.three-portal-block-label-offset-y"
														)
															? model.querySelector(
																"p.three-portal-block-label-offset-y"
															).innerText
															: "";

													labelOffsetZ =
														model.querySelector(
															"p.three-portal-block-label-offset-z"
														)
															? model.querySelector(
																"p.three-portal-block-label-offset-z"
															).innerText
															: "";
													labelTextColor =
														model.querySelector(
															"p.three-portal-block-label-text-color"
														)
															? model.querySelector(
																"p.three-portal-block-label-text-color"
															).innerText
															: "";
													}

													return (
														<Portal
															key={index}
															url={url}
															destinationUrl={
																destinationUrl
															}
															defaultFont={defaultFont}
															threeObjectPlugin={threeObjectPlugin}
															positionX={modelPosX}
															positionY={modelPosY}
															animations={animations}
															positionZ={modelPosZ}
															scaleX={modelScaleX}
															scaleY={modelScaleY}
															scaleZ={modelScaleZ}
															rotationX={
																modelRotationX
															}
															rotationY={
																modelRotationY
															}
															rotationZ={
																modelRotationZ
															}
															label={label}
															labelOffsetX={
																labelOffsetX
															}
															labelOffsetY={
																labelOffsetY
															}
															labelOffsetZ={
																labelOffsetZ
															}
															labelTextColor={
																labelTextColor
															}
															threeObjectPluginRoot={threeObjectPluginRoot}
														/>
													);
												})}
											</TeleportTravel>
										</>
									)}
								</Physics>
							</Suspense>
							{/* <OrbitControls
								enableZoom={ true }
							/> */}
							</FrontPluginProvider>
						</XR>
					</Canvas>
				{Object.values(
					props.npcsToAdd
				).map((npc, index) => {
					let url, modelPosX, modelPosY, modelPosZ, modelRotationX, modelRotationY, modelRotationZ, name, alt, defaultMessage, personality, objectAwareness;
					
					if (npc.tagName.toLowerCase() === 'three-npc-block') {
						url= npc.getAttribute('threeObjectUrl') || '';
						modelPosX = npc.getAttribute('positionX') || '';
						modelPosY = npc.getAttribute('positionY') || '';
						modelPosZ = npc.getAttribute('positionZ') || '';
						modelRotationX = npc.getAttribute('rotationX') || '';
						modelRotationY = npc.getAttribute('rotationY') || '';
						modelRotationZ = npc.getAttribute('rotationZ') || '';
						name = npc.getAttribute('name') || '';
						defaultMessage = npc.getAttribute('defaultMessage') || '';
						personality = npc.getAttribute('personality') || '';
						objectAwareness = npc.getAttribute('objectAwareness') || false;
					} else {
						modelPosX =
							npc.querySelector(
								"p.npc-block-position-x"
							)
								? npc.querySelector(
									"p.npc-block-position-x"
								).innerText
								: "";

						modelPosY =
							npc.querySelector(
								"p.npc-block-position-y"
							)
								? npc.querySelector(
									"p.npc-block-position-y"
								).innerText
								: "";

						modelPosZ =
							npc.querySelector(
								"p.npc-block-position-z"
							)
								? npc.querySelector(
									"p.npc-block-position-z"
								).innerText
								: "";

						modelRotationX =
							npc.querySelector(
								"p.npc-block-rotation-x"
							)
								? npc.querySelector(
									"p.npc-block-rotation-x"
								).innerText
								: "";

						modelRotationY =
							npc.querySelector(
								"p.npc-block-rotation-y"
							)
								? npc.querySelector(
									"p.npc-block-rotation-y"
								).innerText
								: "";

						modelRotationZ =
							npc.querySelector(
								"p.npc-block-rotation-z"
							)
								? npc.querySelector(
									"p.npc-block-rotation-z"
								).innerText
								: "";

						url = npc.querySelector(
							"p.npc-block-url"
						)
							? npc.querySelector(
								"p.npc-block-url"
							).innerText
							: "";

						alt = npc.querySelector(
							"p.npc-block-alt"
						)
							? npc.querySelector(
								"p.npc-block-alt"
							).innerText
							: "";

						personality = npc.querySelector(
								"p.npc-block-personality"
							)
								? npc.querySelector(
									"p.npc-block-personality"
								).innerText
								: "";

						defaultMessage = npc.querySelector(
								"p.npc-block-default-message"
							)
								? npc.querySelector(
									"p.npc-block-default-message"
								).innerText
								: "";

						name = npc.querySelector(
								"p.npc-block-name"
							)
								? npc.querySelector(
									"p.npc-block-name"
								).innerText
								: "";

						objectAwareness =
							npc.querySelector(
								"p.npc-block-object-awareness"
							)
								? npc.querySelector(
									"p.npc-block-object-awareness"
								).innerText
								: false;
					}

					
					return (
							<ChatBox 
								setMessages = {setMessages}
								objectsInRoom = {objectsInRoom}
								personality = {personality}
								objectAwareness = {objectAwareness}
								name = {name}
								defaultMessage = {defaultMessage}
								messages = {messages}
								showUI = {showUI}
								style = {{zIndex: 100}}
								nonce={props.userData.nonce}
								key="something"
							/>
					)
					})}
					<>
						{ isMobile() && (
							<EcctrlJoystick
						  		buttonNumber={1}
							/>
						) }
					</>
				</>
			);
		}
	} else {
		return (
			<div
				ref={canvasRef}
				style={{
					backgroundColor: props.backgroundColor,
					backgroundImage: `url(${props.previewImage})`,
					backgroundPosition: "center",
					backgroundSize: "cover",
					margin: "0",
					height: "100vh",
					width: "100%",
					padding: "0",
					alignItems: "center",
					justifyContent: "center",
					display: "flex",
				}}
			>
				<div
					className={"threeov-entry-flow"}
					style={{
						width: "250px",
						position: "relative",
						padding: "20px",
						boxSizing: "border-box"
					}}
				>
					<div>
						<div className="threeov-entry-pfp" style={ { backgroundImage: `url(${props.userData.profileImage})` } }></div>
						{/* <span>Display Name</span> */}
						{ ( props.networkingBlock.length > 0 ) ? (
							<>
								<input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
								{( props.networkingBlock[0].attributes.customAvatars && props.networkingBlock[0].attributes.customAvatars.value === "1" ) && (
									<div>
										<span>VRM or Sprite URL</span>
										<input type="text" value={playerAvatar} onChange={(e) => setPlayerAvatar(e.target.value)} />
									</div>
								)}
								<button
									class="threeov-load-world-button-secondary"
									onClick={() => {
										goToPrivateRoom();
										canvasRef.current.scrollIntoView({ behavior: 'smooth' });
										setLoaded(true);			
									}}
									style={{
										padding: "10px"
									}}
								>
									{" "}
									{"Join Private"}
								</button>
							</>
						):(
							<div>
								<span>VRM or Sprite URL</span>
								<input type="text" value={playerAvatar} onChange={(e) => setPlayerAvatar(e.target.value)} />
							</div>
						) }
					</div>
					<button
						class="threeov-load-world-button"
						onClick={() => {
							canvasRef.current.scrollIntoView({ behavior: 'smooth' });
							setLoaded(true);
						}}
						style={{
							padding: "10px"
						}}
					>
						{" "}
						{props.networkingBlock.length > 0 ? "Join Public" : "Load World"}
					</button>
					{ ( props.networkingBlock.length > 0 ) && (
						<div class="threeov-entry-flow-instruction">
							<p>After entering, use the "Join Voice" button to select your microphone.</p>
						</div>
				)}
				</div>
			</div>
		);
	}
}
