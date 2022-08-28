import React, { useRef, useState } from 'react';
import { Raycaster, Vector3 } from 'three';

import { useFrame } from '@react-three/fiber';
import { PointerLockControls, OrbitControls } from '@react-three/drei';
import previewOptions from '@wordpress/block-editor/build/components/preview-options';
import { RigidBody, MeshCollider, useRapier, BallCollider, useRigidBody, RigidBodyApi, useCollider } from '@react-three/rapier';

const Controls = (props) => {
	const p2pcf = window.p2pcf;
	const controlsRef = useRef();
	const isLocked = useRef( false );
	const [ moveForward, setMoveForward ] = useState( false );
	const [ moveBackward, setMoveBackward ] = useState( false );
	const [ moveLeft, setMoveLeft ] = useState( false );
	const [ moveRight, setMoveRight ] = useState( false );
	const [ jump, setJump ] = useState( false );
	const currentRigidbody = useRigidBody();
	const {world} = useRapier();


	// const rigidBody = useRapier();
	// const { world } = useRapier();

	useFrame( () => {
		const playerThing = world.getRigidBody(props.something.current.handle);
		playerThing.setRotation({ x: controlsRef.current.camera.rotation.x, y:controlsRef.current.camera.rotation.y, z: controlsRef.current.camera.rotation, w: 0 })

		const velocity = 0.4;
		if ( moveForward ) {
			playerThing.lockRotations(true);
			playerThing.applyImpulse({x:0, y:0, z:0.1}, true);
			controlsRef.current.moveForward( velocity );
			if(p2pcf){
				let position = [controlsRef.current.camera.position.x, controlsRef.current.camera.position.y, controlsRef.current.camera.position.z ];
				let rotation = [controlsRef.current.camera.rotation.x, controlsRef.current.camera.rotation.y, controlsRef.current.camera.rotation.z ];
				let message = `{ "${p2pcf.clientId}": [{ "position" : [`+ position +`]},{ "rotation" : [`+ rotation +`]}]}`;
				p2pcf.broadcast(new TextEncoder().encode(message));
			}
		} else if ( moveLeft ) {
			playerThing.lockRotations(true);
			playerThing.applyImpulse({x:0.1, y:0, z:0}, true);
			controlsRef.current.moveRight( -velocity );
			if(p2pcf){
				let position = [controlsRef.current.camera.position.x, controlsRef.current.camera.position.y, controlsRef.current.camera.position.z ];
				let rotation = [controlsRef.current.camera.rotation.x, controlsRef.current.camera.rotation.y, controlsRef.current.camera.rotation.z ];
				let message = `{ "${p2pcf.clientId}": [{ "position" : [`+ position +`]},{ "rotation" : [`+ rotation +`]}]}`;
				p2pcf.broadcast(new TextEncoder().encode(message));
			}
		} else if ( moveBackward ) {
			playerThing.lockRotations(true);
			playerThing.applyImpulse({x:0, y:0, z:-0.1}, true);
			controlsRef.current.moveForward( -velocity );
			if(p2pcf){
				let position = [controlsRef.current.camera.position.x, controlsRef.current.camera.position.y, controlsRef.current.camera.position.z ];
				let rotation = [controlsRef.current.camera.rotation.x, controlsRef.current.camera.rotation.y, controlsRef.current.camera.rotation.z ];
				let message = `{ "${p2pcf.clientId}": [{ "position" : [`+ position +`]},{ "rotation" : [`+ rotation +`]}]}`;
				p2pcf.broadcast(new TextEncoder().encode(message));
			}
		} else if ( moveRight ) {
			playerThing.lockRotations(true);
			playerThing.applyImpulse({x:-0.1, y:0, z:-0}, true);
			controlsRef.current.moveRight( velocity );
			// rigidBody.applyImpulse(controlsRef.current.vec);
			if(p2pcf){
				let position = [controlsRef.current.camera.position.x, controlsRef.current.camera.position.y, controlsRef.current.camera.position.z ];
				let rotation = [controlsRef.current.camera.rotation.x, controlsRef.current.camera.rotation.y, controlsRef.current.camera.rotation.z ];
				let message = `{ "${p2pcf.clientId}": [{ "position" : [`+ position +`]},{ "rotation" : [`+ rotation +`]}]}`;
				p2pcf.broadcast(new TextEncoder().encode(message));
			}
		} else if ( jump ) {
		}
	} );

	const onKeyDown = function ( event, props ) {
		switch ( event.code ) {
			case 'ArrowUp':
			case 'KeyW':
				setMoveForward( true );
				break;

			case 'ArrowLeft':
			case 'KeyA':
				setMoveLeft( true );
				break;

			case 'ArrowDown':
			case 'KeyS':
				setMoveBackward( true );
				break;

			case 'ArrowRight':
			case 'KeyD':
				setMoveRight( true );
				break;
			case "Space":
				window.addEventListener('keydown', (e) => {
					if (e.keyCode === 32 && e.target === document.body) {
						e.preventDefault();
					}  
				});	
				setJump(true);
                break;
			default:
				return;
		}
	};

	const onKeyUp = function ( event ) {
		switch ( event.code ) {
			case 'ArrowUp':
			case 'KeyW':
				setMoveForward( false );
				break;

			case 'ArrowLeft':
			case 'KeyA':
				setMoveLeft( false );
				break;

			case 'ArrowDown':
			case 'KeyS':
				setMoveBackward( false );
				break;

			case "Space":
				setJump(false);
				break;
	
			case 'ArrowRight':
			case 'KeyD':
				setMoveRight( false );
				break;

			default:
				return;
		}
	};

	document.addEventListener( 'keydown', onKeyDown );
	document.addEventListener( 'keyup', onKeyUp );
	return (
		<PointerLockControls
			onUpdate={ () => {
				if ( controlsRef.current ) {
					controlsRef.current.addEventListener( 'lock', () => {
						console.log( 'lock' );
						isLocked.current = true;
					} );
					controlsRef.current.addEventListener( 'unlock', () => {
						console.log( 'unlock' );
						isLocked.current = false;
					} );
				}
			} }
			onChange={ () => {
				if(p2pcf && controlsRef){
					let position = [controlsRef.current.camera.position.x, controlsRef.current.camera.position.y, controlsRef.current.camera.position.z ];
					let rotation = [controlsRef.current.camera.rotation.x, controlsRef.current.camera.rotation.y, controlsRef.current.camera.rotation.z ];
					let message = `{ "${p2pcf.clientId}": [{ "position" : [`+ position +`]},{ "rotation" : [`+ rotation +`]}]}`;
					p2pcf.broadcast(new TextEncoder().encode(message));
				}		
			}}
			ref={ controlsRef }
		/>
	);
};

export default Controls;
