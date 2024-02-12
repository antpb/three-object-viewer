import { Raycaster, Vector3, Mesh, MeshBasicMaterial, BoxGeometry } from "three";
import { useXR, Interactive, useController } from "@react-three/xr";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useRef, useState, useEffect } from "react";
import { useRapier, useRigidBody, RigidBody } from "@react-three/rapier";
import {
	Text,
} from "@react-three/drei";
import { useTeleportation } from '@react-three/xr'
import { BLUE } from "@wordpress/components/build/utils/colors-values";

export function indexAndThumbColliders() {
	const { world, rapier } = useRapier();

	// const indexLeftRigidBody = world.createRigidBody(
	// 	new rapier.RigidBodyDesc(rapier.RigidBodyType.Kinematic)
	// );
	// indexLeftRigidBody.name = "index_click_left";
	// const thumbLeftRigidBody = world.createRigidBody(
	// 	new rapier.RigidBodyDesc(rapier.RigidBodyType.Kinematic)
	// );
	// thumbLeftRigidBody.name = "thumb_click_left";

	const indexRightRigidBody = world.createRigidBody(
		new rapier.RigidBodyDesc(rapier.RigidBodyType.Kinematic)
	);
	indexRightRigidBody.name = "index_click_right";
	const thumbRightRigidBody = world.createRigidBody(
		new rapier.RigidBodyDesc(rapier.RigidBodyType.Kinematic)
	);
	thumbRightRigidBody.name = "thumb_click_right";

	// add the colliders to the world
	// const indexLeftCollider = world.createCollider(
	// 	rapier.ColliderDesc.cuboid(0.05, 0.05, 0.05),
	// 	indexLeftRigidBody
	// );
	// const thumbLeftCollider = world.createCollider(
	// 	rapier.ColliderDesc.cuboid(0.05, 0.05, 0.05),
	// 	thumbLeftRigidBody
	// );
	const indexRightCollider = world.createCollider(
		rapier.ColliderDesc.cuboid(0.05, 0.05, 0.05),
		indexRightRigidBody
	);
	const thumbRightCollider = world.createCollider(
		rapier.ColliderDesc.cuboid(0.05, 0.05, 0.05),
		thumbRightRigidBody
	);

	const {controllers} = useXR();
	// use the controllers object to find the index and thumb positions and rotations and update the colliders to match
	// const thumbLeft = controllers[0].inputSource.gamepad.buttons[0];
	// const indexLeft = controllers[0].inputSource.gamepad.buttons[1];
	// add them to the respective thumb and index locations of the controllers as children
	// controllers[0].add(indexLeftRigidBody);
	// controllers[0].add(thumbLeftRigidBody);
	controllers[1].add(indexRightRigidBody);
	controllers[1].add(thumbRightRigidBody);
	// return [indexLeftCollider, thumbLeftCollider, indexRightCollider, thumbRightCollider];
}

export function TeleportIndicator(props) {

	return (
		<>
			<mesh position={[0, 0.25, 0]}>
				<boxGeometry args={[0.1, 0.1, 0.1]} attach="geometry"/>
				<meshBasicMaterial attach="material" color={0xff00ff} />
			</mesh>
		</>
	);
}
export function ClickIndicatorObject(props) {
	return (
		<>
			<mesh position={[0, 0, -0.005]}>
				<boxGeometry args={[0.08, 0.08, 0.08]} attach="geometry" />
				<meshBasicMaterial attach="material" color={0x26ff00} />
			</mesh>
		</>
	);
}
function Button({ onClick, position, color, hoverColor }) {
	const mesh = React.useRef();

	const [hovered, setHovered] = React.useState(false);
	const currentColor = hovered ? hoverColor : color;

	return (
	<Interactive
		onSelect={onClick}
		onHover={() => setHovered(true)}
		onBlur={() => setHovered(false)}
	>
		<mesh position={position} ref={mesh}>
		<boxGeometry args={[0.4, 0.2, 0.01]} />
		<meshStandardMaterial color={currentColor} />
		</mesh>
	</Interactive>
	);
}

function Menu() {
	const menuRef = useRef();
	const { camera } = useThree();
	const { player, controllers } = useXR();
	const [ muted, setMuted ] = useState(false);
	const handleButtonClick = () => {
		console.log("Button clicked");
		if(window.localStream){
			// loop through all audio tracks and mute them
			for (let i = 0; i < window.localStream.getAudioTracks().length; i++) {
				window.localStream.getAudioTracks()[i].enabled = !window.localStream.getAudioTracks()[i].enabled;
			}
			// if(muted){
			// 	window.localStream.getAudioTracks()[0].enabled = false;
			// } else {
			// 	window.localStream.getAudioTracks()[0].enabled = true;
			// }
			console.log("window.localStream", window.localStream.getAudioTracks()[0]);
		}
		setMuted(!muted);
	};

	// when the player is available, add the menu to the player
	useEffect(() => {
		if (player && menuRef.current) {
			//menuRef.current.visible = true;
			player.add(menuRef.current);
			menuRef.current.position.set(0, 2, -0.8);
		}
		console.log(window.localStream);
	}, [player]);


	useFrame(() => {
		if (menuRef.current) {

		}
	});

	return (
		<group ref={menuRef} visible={false}>
			<Button
				onClick={handleButtonClick}
				position={[0, 0.1, -0.108]} // Position relative to the menu
				color={ muted ? "#ff3e00" : "#b7ff00" }
				hoverColor={ muted ? "#fa8660" : "#daffa0" }
			/>
			<Text
				color="black"
				anchorX="center"
				anchorY="middle"
				fontSize={0.1}
				position={[0, 0.1, -0.1]}
			>
				{ muted ? `Mute` : `Unmute`}
			</Text>
			{/* Additional menu items */}
		</group>
	);
}


export default function TeleportTravel(props) {
	const doubleClickThreshold = 1000;
	const clickTimeoutRef = useRef(null);
	const pinchThreshold = 0.01;
	const controllerStateRef = useRef(new Map());
	const { scene, camera } = useThree();
	const {
		centerOnTeleport,
		Indicator = TeleportIndicator,
		ClickIndicator = ClickIndicatorObject,
		useNormal = true
	} = props;
	const [isHovered, setIsHovered] = useState(false);
	const [canTeleport, setCanTeleport] = useState(true);
	const [canInteract, setCanInteract] = useState(false);
	const [spawnPos, setSpawnPos] = useState(props.spawnPoint);
	const [intersectionPoint, setIntersectionPoint] = useState();
	const { controllers, player, isPresenting } = useXR();

	const target = useRef();
	const targetLoc = useRef();
	const ray = useRef(new Raycaster());
	const { world, rapier } = useRapier();
	let controllersFound = false;
	useEffect(() => {
		controllers.forEach((controller) => {
			// if this is the left hand ignore
			if (controller.inputSource.handedness === "right") {
				const { hand } = controller;
				const thumbTip = hand.joints['thumb-tip'];
				const indexTip = hand.joints['index-finger-tip'];
			
				// Visual indicators for thumb and index tips
				indexTip.add(new Mesh(new BoxGeometry(0.0081, 0.0081, 0.0081), new MeshBasicMaterial({ color: 0x0000ff })));
				thumbTip.add(new Mesh(new BoxGeometry(0.0081, 0.0081, 0.008), new MeshBasicMaterial({ color: 0x0000ff })));

			}
	
		});
	}, [controllers, world, rapier]);
	
	useFrame(() => {
		controllers.forEach((controller, index) => {
			if (controller.inputSource.handedness === "right") {
				let state = controllerStateRef.current.get(controller) || { isPinching: false, timer: null };
			
				const { hand } = controller;
				if (hand) {
					const thumbTip = hand.joints['thumb-tip'];
					const indexTip = hand.joints['index-finger-tip'];
					if (thumbTip && indexTip) {
						const thumbPos = new Vector3();
						const indexPos = new Vector3();
						thumbTip.getWorldPosition(thumbPos);
						indexTip.getWorldPosition(indexPos);
						const distance = thumbPos.distanceTo(indexPos);
				
						if (distance < pinchThreshold && !state.isPinching) {
							state.isPinching = true;
							controllerStateRef.current.set(controller, state);
						} else if (distance >= pinchThreshold && state.isPinching) {
							state.isPinching = false;
							const now = Date.now();
							if (state.lastPinchTime && (now - state.lastPinchTime) < doubleClickThreshold) {
							// Double pinch detected
							click();
							}
							state.lastPinchTime = now;
							controllerStateRef.current.set(controller, state);
				
							// Reset pinch count after a delay to avoid false double pinch detection
							clearTimeout(clickTimeoutRef.current);
							clickTimeoutRef.current = setTimeout(() => {
							state.lastPinchTime = null;
							controllerStateRef.current.set(controller, state);
							}, doubleClickThreshold);
						} else if (state.timer) {
							// Clean up if the hand is no longer present
							clearTimeout(state.timer);
							state.timer = null;
							controllerStateRef.current.set(controller, state);
						}
					}
				}
			}
		});
	  });
	
	  // Cleanup to prevent memory leaks
	  useEffect(() => {
		return () => {
		  controllerStateRef.current.forEach((state) => {
			if (state.timer) {
			  clearTimeout(state.timer);
			}
		  });
		};
	  }, []);
				
	const rayDir = useRef({
		pos: new Vector3(),
		dir: new Vector3()
	});


	useEffect(() => {
		const x = Number(spawnPos[0]);
		const y = Number(spawnPos[1]) + 0.1;
		const z = Number(spawnPos[2]);

		if (isPresenting) {
			player.position.x = 0
			player.position.y = 0
			player.position.z = 0
		}
	}, [isPresenting])
	

	// Set a variable finding an object in the three.js scene that is named reticle.
	useEffect(() => {
		// Remove the reticle when the controllers are registered.
		const reticle = scene.getObjectByName("reticle");
		const participantObject = scene.getObjectByName("playerOne");
		if (controllers?.length > 0 && reticle) {
			// console.log("participantObject", participantObject);
			// set participantObject to invisible
			participantObject.visible = false;
			reticle.visible = false;
		}	
	}, [controllers]);
	const movementTimeoutRef = useRef(null);
	const teleport = useTeleportation();
	const rightController = useController('right')

	useFrame(() => {
		if (
			isHovered &&
			controllers?.length > 0 &&
			ray.current &&
			target.current &&
			targetLoc.current &&
			rightController?.controller
		) {
			// get the right hand controller
			rightController.controller.getWorldDirection(rayDir.current.dir);
			rightController.controller.getWorldPosition(rayDir.current.pos);
			// ray.far = 0.05;
			// ray.near = 0.01;
			rayDir.current.dir.multiplyScalar(-1);
			ray.current.set(rayDir.current.pos, rayDir.current.dir);

			const [intersection] = ray.current.intersectObject(target.current);

			if (
				intersection &&
				intersection.distance < 100 &&
				intersection.distance > .5
			) {
				const intersectionObject = intersection.object;
				let containsInteractiveObject = false;
				intersectionObject.traverseAncestors((parent) => {
					if (parent.name === "video") {
						containsInteractiveObject = true;
					}
					if (parent.name === "portal") {
						containsInteractiveObject = true;
					}
				});
				if (containsInteractiveObject) {
					console.log("set teleport false in contains interactive object");
					setCanInteract(true);
					setCanTeleport(false);
				} else {
					setCanInteract(false);
					setCanTeleport(true);
				}
				if (useNormal) {
					const p = intersection.point;
					setIntersectionPoint(p);
					targetLoc.current.position.copy(p);
					
				} else {
					targetLoc.current.position.copy(intersection.point);
				}
			}
		}
	});

	const click = useCallback(() => {
		if (isHovered && !canInteract) {
			targetLoc.current.position.set(
				targetLoc.current.position.x,
				targetLoc.current.position.y + 0.4,
				targetLoc.current.position.z
			);
			if (canTeleport) {
				console.log("teleporting to", targetLoc.current.position);
				player.position.copy(targetLoc.current.position);

				const p2pcf = window.p2pcf;
				const participantObject = scene.getObjectByName("playerOne");
				// participantObject.position.set([targetLoc.current?.position.x, targetLoc.current?.position.y, targetLoc.current?.position.z]);
				//if moving, send a network event of where we are and our current state....animations probably need to go here too.
				if(participantObject){
					if (p2pcf) {	
						var target = new Vector3();
						var worldPosition = participantObject.getWorldPosition( target );
						const position = [
							worldPosition.x,
							worldPosition.y,
							worldPosition.z
						];
						// console.log("sending position", participantObject, position);
						// get the z rotation of the headset
						const rotation = [
							participantObject.rotation.x,
							participantObject.rotation.y,
							participantObject.rotation.z
						];
						const messageObject = {
							[p2pcf.clientId]: {
								position: position,
								rotation: rotation,
								profileImage: userData.profileImage,
								vrm: userData.vrm,
								inWorldName: userData.inWorldName,
								isMoving: "walking"
							}
						};
						console.log("sending message", messageObject, p2pcf, p2pcf.clientId);
						// console.log("userdata", userData);
						clearTimeout(movementTimeoutRef.current);
						movementTimeoutRef.current = setTimeout(() => {
							// Send "isMoving: false" message here
							const messageStopObject = {
								[p2pcf.clientId]: {
									isMoving: false
								}
							};
							const messageStop = JSON.stringify(messageStopObject);
							p2pcf.broadcast(new TextEncoder().encode(messageStop));
						}, 100);

						const message = JSON.stringify(messageObject);
						p2pcf.broadcast(new TextEncoder().encode(message)), p2pcf;
					}
				}
			}
		}
		if (isHovered && canInteract) {
			if (controllers.length > 0) {
				const rigidBodyDesc = new rapier.RigidBodyDesc(
					rapier.RigidBodyType.Static
				)
					// The rigid body translation.
					// Default: zero vector.
					.setTranslation(
						targetLoc.current.position.x,
						targetLoc.current.position.y,
						targetLoc.current.position.z - 0.008
					)
					.setLinvel(0, 0, 0)
					// The linear velocity of this body.
					// .setLinvel(targetLoc.current.position.x, targetLoc.current.position.y - 1.1, targetLoc.current.position.z)
					// Default: zero vector.
					.setGravityScale(1)
					// Default: zero velocity.
					.setCanSleep(false)
					// Whether or not CCD is enabled for this rigid-body.
					// Default: false
					.setCcdEnabled(true);
				const rigidBody = world.createRigidBody(rigidBodyDesc);

				const collider = world.createCollider(
					rapier.ColliderDesc.cuboid(0.05, 0.05, 0.05),
					rigidBody
					// rapier.ColliderDesc.capsule(0.5, 0.5), rigidBody
				);

				collider.setFriction(0.1);
				collider.setRestitution(0);
				// collider.setSensor(true);
				// collider.setTranslation(intersects[0].point);
				setTimeout(() => {
					world.removeCollider(collider);
					world.removeRigidBody(rigidBody);
				}, 200);
			}
		}
	}, [isHovered, canTeleport, canInteract]);

	return (
		<>
			{isHovered && canTeleport && (
				<group ref={targetLoc}>
					<Indicator />
				</group>
			)}
			{isHovered && canInteract && (
				<group ref={targetLoc}>
					<ClickIndicator />
				</group>
			)}
			<Menu/>
			<Interactive
				onSelect={click}
				onHover={(e) => {
					setIsHovered(true);
				}}
				onBlur={() => {
					setIsHovered(false);
					setCanTeleport(true);
					setCanInteract(false);
				}}
			>
				<group ref={target}>{props.children}</group>
			</Interactive>
		</>
	);
}
