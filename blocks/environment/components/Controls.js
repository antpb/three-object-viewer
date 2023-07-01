import React, { useEffect, useRef, useState } from "react";
import { Euler, Raycaster, MathUtils } from "three";
import CustomOrbitControls from "./CustomOrbitControls.js";
import { useFrame, useThree } from "@react-three/fiber";
import { 
	PointerLockControls,
	OrbitControls 
} from "@react-three/drei";
import { useRapier, useRigidBody, vec3, RigidBodyType } from "@react-three/rapier";
  
const Controls = (props) => {
	const p2pcf = window.p2pcf;
	const controlsRef = useRef();
	const orbitControlsRef = useRef();
	const centerPointRef = useRef([0, 0, 0]);
	const isLocked = useRef(false);
	const [lock, setLock] = useState(false);
	const [falling, setFalling] = useState(true);
	const [click, setClick] = useState(false);
	const [shiftActive, setShift] = useState(false);
	const [moveForward, setMoveForward] = useState(false);
	const [moveBackward, setMoveBackward] = useState(false);
	const [moveLeft, setMoveLeft] = useState(false);
	const [moveRight, setMoveRight] = useState(false);
	const [spawnPos, setSpawnPos] = useState(props.spawnPoint);
	const [jump, setJump] = useState(false);
	const [jumping, setJumping] = useState(false);
	const [isThirdPersonView, setIsThirdPersonView] = useState(false);
	const { world, rapier } = useRapier();
	const ray = new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -0.001, z: 0 });

	const pointerRay = new rapier.Ray(
		{ x: 0, y: 0, z: 0 },
		{ x: 0, y: 0, z: -0.5 }
	);
	const { camera, scene } = useThree();

	useEffect(() => {

		if (props.mobileControls !== null && props.mobileControls?.direction !== undefined) {
			if (props.mobileControls.direction.angle === "down") {
				setMoveForward(false);
				setMoveBackward(true);
				setMoveLeft(false);
				setMoveRight(false);
			} else if (props.mobileControls.direction.angle === "up") {
				setMoveBackward(false);
				setMoveForward(true);
				setMoveLeft(false);
				setMoveRight(false);
			} else if (props.mobileControls.direction.angle === "left") {
				setMoveLeft(true);
				setMoveForward(false);
				setMoveBackward(false);
				setMoveRight(false);
			} else if (props.mobileControls.direction.angle === "right") {
				setMoveRight(true);
				setMoveLeft(false);
				setMoveForward(false);
				setMoveBackward(false);
			} else {
				setMoveForward(false);
				setMoveBackward(false);
				setMoveLeft(false);
				setMoveRight(false);
			}
		} else {
			setMoveForward(false);
			setMoveBackward(false);
			setMoveLeft(false);
			setMoveRight(false);
		}

	}, [props.mobileControls]);

	useEffect(() => {
		const playerThing = world.getRigidBody(props.something.current.handle);
		const x = Number(spawnPos[0]);
		const y = Number(spawnPos[1]);
		const z = Number(spawnPos[2]);

		setTimeout(() => {
			let finalPoints = [];
			if (props.spawnPointsToAdd) {
				props.spawnPointsToAdd.forEach((point) => {
					finalPoints.push([Number(point[0]), Number(point[1]), Number(point[2])]);
				});
			}
			finalPoints.push([x, y, z]);
			//pick a random point
			let randomPoint = finalPoints[Math.floor(Math.random() * finalPoints.length)];
			// Check if the converted values are valid and finite
			// Set the camera's position
			camera.position.set(randomPoint[0], randomPoint[1], randomPoint[2]);

			playerThing.setTranslation({
				x: randomPoint[0],
				y: randomPoint[1],
				z: randomPoint[2]
			});
		}, 20);
	}, []);

	const raycaster = new Raycaster();

	useFrame(() => {
		const playerThing = world.getRigidBody(props.something.current.handle);
		// make orbit camera look at player
		if (orbitControlsRef.current) {
			orbitControlsRef.current.target = new vec3(
				playerThing.translation().x,
				playerThing.translation().y,
				playerThing.translation().z
			);
		}

		const playerThingColliders = world.getCollider(
			props.something.current.handle
		);
		//lock rotations.
		playerThing.restrictRotations({ enableX: false, enableY: false, enableZ: false }, true);
		//maybebringthemback
		playerThing.lockRotations(true, true);
		if (lock) {
			playerThing.restrictRotations({ enableX: false, enableY: false, enableZ: false }, true);
			if (!falling){
				playerThing.setBodyType(rapier.RigidBodyType.Fixed, 1);
			}
		} else {
			if (falling){
				setJumping(false);
				playerThing.setBodyType(rapier.RigidBodyType.Dynamic, 1);
			}
			playerThing.setBodyType(rapier.RigidBodyType.Dynamic, 0);
		}

		ray.origin.x = playerThing.translation().x;
		ray.origin.y = playerThing.translation().y;
		ray.origin.z = playerThing.translation().z;
		const velocity = shiftActive ? 0.28 : 0.08;
		world.step();
		const maxToi = 14;
		const solid = true;
		if (jump && ! jumping) {
			setJumping(true);
			// if not falling
			playerThing.setBodyType(rapier.RigidBodyType.Dynamic, 0);
			setFalling(true);
			playerThing.applyImpulse({ x: 0, y: 30, z: 0 }, true);
			console.log("jumping");
			setJump(false); // Reset the jump state
		}
		
		if (click) {
			if (raycaster) {
				raycaster.setFromCamera({ x: 0, y: 0 }, camera);
				const intersects = raycaster.intersectObjects(
					scene.children,
					true
				);
				if (intersects.length > 0) {
					const pointHitObject = scene.getObjectByName(
						intersects[0].object.name
					);
					if (intersects[0].point) {
						const rigidBodyDesc = new rapier.RigidBodyDesc(
							rapier.RigidBodyType.Dynamic
						)
							// The rigid body translation.
							// Default: zero vector.
							.setTranslation(
								intersects[0].point.x,
								intersects[0].point.y,
								intersects[0].point.z
							)
							.setCanSleep(false)
							.setCcdEnabled(true);
						const rigidBody = world.createRigidBody(rigidBodyDesc);

						const collider = world.createCollider(
							rapier.ColliderDesc.cuboid(0.05, 0.05, 0.05),
							rigidBody
						);

						// collider.setTranslation(intersects[0].point);
						setTimeout(() => {
							// console.log("removing collider", collider);
							world.removeCollider(collider);
							world.removeRigidBody(rigidBody);
						}, 50);

						// world.removeCollider(collider.handle);
					}
				}
			}
			setClick(false);
		}
		if (props.mobileRotControls) {
			const rotationSpeed = 0.03;
			const threshold = 45;

			switch (props.mobileRotControls.direction.angle) {
				case 'left':
					controlsRef.current.camera.rotation.y += rotationSpeed;
					break;
				case 'right':
					controlsRef.current.camera.rotation.y -= rotationSpeed;
					break;
				//   case 'down':
				// 	controlsRef.current.camera.rotation.x -= rotationSpeed;
				// 	break;
				//   case 'up':
				// 	controlsRef.current.camera.rotation.x += rotationSpeed;
				// 	break;
				default:
					break;
			}
		}

		if (moveForward) {
			if (
				controlsRef.current.camera &&
				controlsRef.current.camera.position &&
				controlsRef.current.camera.position.x !== undefined
			) {
				controlsRef.current.moveForward(velocity);
				if (playerThing && controlsRef.current.camera.position.x) {
					const hit = world.castRay(
						ray,
						maxToi,
						solid
					);
					playerThing.lockRotations(true, true);
					if (hit) {
						const hitPoint = ray.pointAt(hit.toi);
						//calculate distance hitpoint.y is away from the player y position
						const distance = Math.abs(hitPoint.y - controlsRef.current.camera.position.y);
						if (distance > 0.22) {
							setFalling(true);
						} else {
							setFalling(false);
						}
						const position = vec3(controlsRef.current.camera.position.x, hitPoint.y, controlsRef.current.camera.position.z)
						playerThing.setTranslation({
							x: Number(controlsRef.current.camera.position.x),
							y: Number(hitPoint.y),
							z: Number(controlsRef.current.camera.position.z)
						});
						camera.position.setY(hitPoint.y + 0.007);
					} else {
						setFalling(true);
					}
					if (p2pcf) {
						const position = [
							controlsRef.current.camera.position.x,
							controlsRef.current.camera.position.y,
							controlsRef.current.camera.position.z
						];
						const rotation = [
							controlsRef.current.camera.rotation.x,
							controlsRef.current.camera.rotation.y,
							controlsRef.current.camera.rotation.z
						];
						const message =
							`{ "${p2pcf.clientId}": [{ "position" : [` +
							position +
							`]},{ "rotation" : [` +
							rotation +
							`]},{ "profileImage" : ["` +
							userData.profileImage +
							`"]}]}`;
						p2pcf.broadcast(new TextEncoder().encode(message));
					}

					playerThing.setBodyType(rapier.RigidBodyType.Dynamic, 1);
				}
			}
		} else if (moveLeft) {
			playerThing.lockRotations(true, true);
			// playerThing.setRotation({x: 0, y: -0.707107, z: 0, w: 0.707107}, true);
			controlsRef.current.moveRight(-velocity);
			const hit = world.castRay(
				ray,
				maxToi,
				solid
			);

			if (hit) {
				const hitPoint = ray.pointAt(hit.toi); // Same as: `ray.origin + ray.dir * toi`
				playerThing.setTranslation({
					x: controlsRef.current.camera.position.x,
					y: hitPoint.y,
					z: controlsRef.current.camera.position.z
				});
			}
			if (p2pcf) {
				const position = [
					controlsRef.current.camera.position.x,
					controlsRef.current.camera.position.y,
					controlsRef.current.camera.position.z
				];
				const rotation = [
					controlsRef.current.camera.rotation.x,
					controlsRef.current.camera.rotation.y,
					controlsRef.current.camera.rotation.z
				];
				const message =
					`{ "${p2pcf.clientId}": [{ "position" : [` +
					position +
					`]},{ "rotation" : [` +
					rotation +
					`]},{ "profileImage" : ["` +
					userData.profileImage +
					`"]}]}`;
				p2pcf.broadcast(new TextEncoder().encode(message));
			}
		} else if (moveBackward) {
			playerThing.lockRotations(true, true);
			// playerThing.setRotation({x: 0, y: 0, z: 0, w: -1}, true);

			controlsRef.current.moveForward(-velocity);
			const hit = world.castRay(
				ray,
				maxToi,
				solid
			);

			if (hit) {
				const hitPoint = ray.pointAt(hit.toi); // Same as: `ray.origin + ray.dir * toi`
				playerThing.setTranslation({
					x: controlsRef.current.camera.position.x,
					y: hitPoint.y,
					z: controlsRef.current.camera.position.z
				});
			}
			if (p2pcf) {
				const position = [
					controlsRef.current.camera.position.x,
					controlsRef.current.camera.position.y,
					controlsRef.current.camera.position.z
				];
				const rotation = [
					controlsRef.current.camera.rotation.x,
					controlsRef.current.camera.rotation.y,
					controlsRef.current.camera.rotation.z
				];
				const message =
					`{ "${p2pcf.clientId}": [{ "position" : [` +
					position +
					`]},{ "rotation" : [` +
					rotation +
					`]},{ "profileImage" : ["` +
					userData.profileImage +
					`"]}]}`;
				p2pcf.broadcast(new TextEncoder().encode(message));
			}
		} else if (moveRight) {
			playerThing.lockRotations(true, true);
			// playerThing.setRotation({x: 0, y: 0.707107, z: 0, w: 0.707107}, true);
			controlsRef.current.moveRight(velocity);
			const hit = world.castRay(
				ray,
				maxToi,
				solid
			);

			if (hit) {
				const hitPoint = ray.pointAt(hit.toi); // Same as: `ray.origin + ray.dir * toi`
				playerThing.setTranslation({
					x: controlsRef.current.camera.position.x,
					y: hitPoint.y,
					z: controlsRef.current.camera.position.z
				});
			}
			// rigidBody.applyImpulse(controlsRef.current.vec);
			if (p2pcf) {
				const position = [
					controlsRef.current.camera.position.x,
					controlsRef.current.camera.position.y,
					controlsRef.current.camera.position.z
				];
				const rotation = [
					controlsRef.current.camera.rotation.x,
					controlsRef.current.camera.rotation.y,
					controlsRef.current.camera.rotation.z
				];
				const message =
					`{ "${p2pcf.clientId}": [{ "position" : [` +
					position +
					`]},{ "rotation" : [` +
					rotation +
					`]},{ "profileImage" : ["` +
					userData.profileImage +
					`"]}]}`;
				p2pcf.broadcast(new TextEncoder().encode(message));
			}
		} else if (jump) {
		}
	});
	const onKeyDown = function (event) {
		if (event.target instanceof HTMLInputElement) {
			return
		} else {
			switch (event.code) {
				// case when both shift and the w key are pressed
				case "ShiftLeft":
					setShift(true);
					setLock(false);
					break;
				case "ArrowUp":
				case "KeyW":
					setMoveForward(true);
					setLock(false);
					break;

				case "ArrowLeft":
				case "KeyA":
					setMoveLeft(true);
					setLock(false);
					break;

				case "ArrowDown":
				case "KeyS":
					setMoveBackward(true);
					setLock(false);
					break;

				case "ArrowRight":
				case "KeyD":
					setMoveRight(true);
					setLock(false);
					break;
				case "KeyR":
					if (props.something.current) {
						const playerThing = world.getRigidBody(props.something.current.handle);

						const x = Number(spawnPos[0]);
						const y = Number(spawnPos[1]);
						const z = Number(spawnPos[2]);
						if (props.spawnPointsToAdd) {
							let finalPoints = [];
							props.spawnPointsToAdd.forEach((point) => {
								finalPoints.push([Number(point.position.x), Number(point.position.y), Number(point.position.z)]);
							});
							finalPoints.push([x, y, z]);
							//pick a random point
							let randomPoint = finalPoints[Math.floor(Math.random() * finalPoints.length)];
							// Check if the converted values are valid and finite
							// Set the camera's position
							camera.position.set(randomPoint[0], randomPoint[1], randomPoint[2]);

							playerThing.setTranslation({
								x: randomPoint[0],
								y: randomPoint[1],
								z: randomPoint[2]
							});

						} else {
							// Check if the converted values are valid and finite
							// Set the camera's position
							camera.position.set(x, y, z);

							playerThing.setTranslation({
								x: x,
								y: y,
								z: z
							});
						}
					}
					setLock(false);
					break;
					case "Space":
						setJump(true);
						setLock(false);
						window.addEventListener("keydown", (e) => {
						  if (e.keyCode === 32 && e.target === document.body) {
							e.preventDefault();
						  }
						});
						break;
					default:
			}
		}
	};

	// listen for a click event on the canvas
	window.addEventListener("click", () => {
		setClick(true);
	});

	const onKeyUp = function (event) {
		switch (event.code) {
			case "KeyC":  // Here we choose 'C' key to switch views.
            setIsThirdPersonView(!isThirdPersonView);
            break;
			case "ShiftLeft":
				setShift(false);
				setLock(true);
				break;
			case "ArrowUp":
			case "KeyW":
				setMoveForward(false);
				setLock(true);
				break;

			case "ArrowLeft":
			case "KeyA":
				setMoveLeft(false);
				setLock(true);
				break;

			case "ArrowDown":
			case "KeyS":
				setMoveBackward(false);
				setLock(true);
				break;

			case "KeyR":
				setLock(true);
				break;
			case "Space":
				setJump(false);
				setLock(true);
				break;

			case "ArrowRight":
			case "KeyD":
				setMoveRight(false);
				setLock(true);
				break;

			default:
		}
	};

	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("keyup", onKeyUp);

	return (
		<>
			<PointerLockControls
				// enabled={!isThirdPersonView}
				position={[props.spawnPoint[0], props.spawnPoint[1], props.spawnPoint[2]]}
				onChange={() => {
					if ( p2pcf && controlsRef && orbitControlsRef) {
						// Update the center point based on the movement of PointerLockControls
						const cameraPosition = controlsRef.current.camera.position.clone();
						const cameraRotation = controlsRef.current.camera.rotation.clone();
						const offset = new THREE.Vector3(0, 0, -1).applyEuler(cameraRotation);
						const centerPoint = cameraPosition.clone().add(offset);
						centerPointRef.current = [centerPoint.x, centerPoint.y, centerPoint.z];
			
						// Broadcast the updated center point to other components if needed
						const position = [
							controlsRef.current.camera.position.x,
							controlsRef.current.camera.position.y,
							controlsRef.current.camera.position.z,
						];
						const rotation = [
							controlsRef.current.camera.rotation.x,
							controlsRef.current.camera.rotation.y,
							controlsRef.current.camera.rotation.z,
						];
						const message = `{ "${p2pcf.clientId}": [{ "position" : [` + position + `]}, { "rotation" : [` + rotation + `]}]}`;
						p2pcf.broadcast(new TextEncoder().encode(message));
			
						// Update the target position of OrbitControls
						orbitControlsRef.current.target = new THREE.Vector3(
							controlsRef.current.camera.position.x,
							controlsRef.current.camera.position.y,
							controlsRef.current.camera.position.z
						);
					}
				}}
				ref={controlsRef}
			/>
      		<CustomOrbitControls camera={camera} />
		</>
	);
};

export default Controls;
