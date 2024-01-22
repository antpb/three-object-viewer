import { Raycaster, Vector3 } from "three";
import { useXR, Interactive, useController } from "@react-three/xr";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useRef, useState, useEffect } from "react";
import { useRapier, useRigidBody, RigidBody } from "@react-three/rapier";
import {
	Text,
} from "@react-three/drei";

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
			menuRef.current.visible = true;
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
				color={ muted ? "#ff3e00" : "#b7ff00"  }
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
	const { scene } = useThree();
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
	const target = useRef();
	const targetLoc = useRef();
	const ray = useRef(new Raycaster());
	const { world, rapier } = useRapier();

	const rayDir = useRef({
		pos: new Vector3(),
		dir: new Vector3()
	});

	const { controllers, player, isPresenting } = useXR();

	useEffect(() => {
		const x = Number(spawnPos[0]);
		const y = Number(spawnPos[1]) + 0.1;
		const z = Number(spawnPos[2]);

		if (isPresenting) {
			player.position.x = x
			player.position.y = y
			player.position.z = z
		}
	}, [isPresenting])
	

	// Set a variable finding an object in the three.js scene that is named reticle.
	useEffect(() => {
		// Remove the reticle when the controllers are registered.
		const reticle = scene.getObjectByName("reticle");
		const participantObject = scene.getObjectByName("playerOne");
		if (controllers.length > 0 && reticle) {
			// console.log("participantObject", participantObject);
			// set participantObject to invisible
			participantObject.visible = false;
			reticle.visible = false;
		}	
	}, [controllers]);
	const movementTimeoutRef = useRef(null);

	useFrame(() => {
		if (
			isHovered &&
			controllers.length > 0 &&
			ray.current &&
			target.current &&
			targetLoc.current
		) {
			controllers[0].controller.getWorldDirection(rayDir.current.dir);
			controllers[0].controller.getWorldPosition(rayDir.current.pos);
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
					setCanInteract(true);
					setCanTeleport(false);
				} else {
					setCanInteract(false);
					setCanTeleport(true);
				}
				if (useNormal) {
					const p = intersection.point;
					setIntersectionPoint(p);
					// targetLoc.current.position.set(0, 0, 0);

					// const n = intersection.face.normal.clone();
					// n.transformDirection(intersection.object.matrixWorld);

					// targetLoc.current.lookAt(n);
					// targetLoc.current.rotateOnAxis(
					// 	new Vector3(1, 0, 0),
					// 	Math.PI / 2
					// );
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
				targetLoc.current.position.y + 0.3,
				targetLoc.current.position.z
			);
			if (canTeleport) {
				player.position.copy(targetLoc.current.position);
				const p2pcf = window.p2pcf;
				const participantObject = scene.getObjectByName("playerOne");
				participantObject.position.copy(targetLoc.current.position);
				//if moving, send a network event of where we are and our current state....animations probably need to go here too.
				if (p2pcf) {	
					var target = new Vector3(); // create once an reuse it
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
