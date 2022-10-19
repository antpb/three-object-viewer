import { Raycaster, Vector3 } from 'three';
import { useXR, Interactive } from '@react-three/xr';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Controls from './Controls';

import { useCallback, useRef, useState, useEffect } from 'react';
import { RigidBody, MeshCollider, useRapier, usePhysics, useRigidBody, BallCollider, CapsuleCollider, RigidBodyApi } from '@react-three/rapier';
import defaultVRM from '../../../inc/avatars/mummy.vrm';
import { VRM, VRMUtils, VRMSchema, VRMLoaderPlugin  } from '@pixiv/three-vrm'

export default function Player( props ) {

	const { camera, scene } = useThree();
	const participantObject = scene.getObjectByName("playerOne");
	const [ rapierId, setRapierId ] = useState("");
	const [ contactPoint, setContactPoint ] = useState("");
	const [ headPoint, setHeadPoint ] = useState("");
	const rigidRef = useRef();

	useFrame( () => {
		if(participantObject){
			var posY = participantObject.parent.position.y;
			// var posY = participantObject.userData.vrm.firstPerson.humanoid.humanBones.head.position.y;
			// camera.position.setY( posY + 1.5 );
			camera.position.setY( posY + 1.5 );
			// console.log(camera.rotation.y);
			// participantObject.rotation.set([0, camera.rotation.y, 0]);
			// participantObject.rotation.set(camera.rotation);
		}
	} );

	// Participant VRM.
	const fallbackURL = threeObjectPlugin + defaultVRM;
	const playerURL = userData.vrm ? userData.vrm : fallbackURL;

	const someSceneState = useLoader( GLTFLoader, playerURL, ( loader ) => {
		loader.register( ( parser ) => {
            return new VRMLoaderPlugin( parser );
        } );
	} );

	if(someSceneState?.userData?.gltfExtensions?.VRM){
		const playerController = someSceneState.userData.vrm;
		// VRMUtils.rotateVRM0( playerController );
		// console.log("vrm", playerController);
		useEffect(()=>{
			console.log(playerController.firstPerson.humanoid.humanBones.head.node);
			setHeadPoint(playerController.firstPerson.humanoid.humanBones.head.node.position.y);
		}, [])
		playerController.firstPerson.humanoid.humanBones.head.node.scale.set([0,0,0]);
		// console.log(playerController);
		// const rotationVRM = playerController.scene.rotation.y;
		// playerController.scene.rotation.set( 0, rotationVRM, 0 );
		// playerController.scene.scale.set( 1, 1, 1 );

		return (
			<>
				{playerController && 
					(	
					<>
						<RigidBody 
							colliders={false}
							linearDamping={100}
							angularDamping={0}
							friction={0}
							ref={rigidRef}
							mass={0}
							type={"dynamic"}
							onCollisionEnter={ ({manifold, target}) => {
								// console.log("data1", target.colliderSet.map.data[1]);
								// console.log(manifold.solverContactPoint(0));
								// console.log("handle", target.handle);
								setRapierId(target.colliderSet.map.data[1]);
								setContactPoint(manifold.solverContactPoint(0));
							}}
							// onCollisionExit={ () => {
							// 	console.log('Collision at world position');
							// }}
						>
							<CapsuleCollider
								position={[0, 0.5, 0]}
								args={[1, 1]}
							/>
							<Controls
								id={rapierId}
								point={contactPoint}
								something={rigidRef}
							/>
							<primitive name="playerOne" object={ playerController.scene } />
						</RigidBody>
					</>
					)
				}
			</>
		);
	}
}
