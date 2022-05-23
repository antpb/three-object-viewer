import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import previewOptions from '@wordpress/block-editor/build/components/preview-options';

const Controls = () => {
	const controlsRef = useRef();
	const isLocked = useRef( false );
	const [ moveForward, setMoveForward ] = useState( false );
	const [ moveBackward, setMoveBackward ] = useState( false );
	const [ moveLeft, setMoveLeft ] = useState( false );
	const [ moveRight, setMoveRight ] = useState( false );

	useFrame( () => {
		const velocity = 0.1;
		if ( moveForward ) {
			controlsRef.current.moveForward( velocity );
		} else if ( moveLeft ) {
			controlsRef.current.moveRight( -velocity );
		} else if ( moveBackward ) {
			controlsRef.current.moveForward( -velocity );
		} else if ( moveRight ) {
			controlsRef.current.moveRight( velocity );
		}
	} );

	const onKeyDown = function ( event ) {
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

			// case "Space":
			//   if (canJump === true) velocity.y += 350;
			//   canJump = false;
			//   break;
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
			ref={ controlsRef }
		/>
	);
};

export default Controls;
