import { Raycaster, Vector3 } from 'three';
import { useXR, Interactive } from '@react-three/xr';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Controls from './Controls';

import { useCallback, useRef, useState } from 'react';
import { RigidBody, MeshCollider, useRapier, usePhysics, useRigidBody, BallCollider, RigidBodyApi } from '@react-three/rapier';
import defaultVRM from '../../../inc/avatars/mummy.vrm';
import { VRM, VRMUtils, VRMSchema, VRMLoaderPlugin  } from '@pixiv/three-vrm'

export default function Player( props ) {

	const { camera, scene } = useThree();
	const participantObject = scene.getObjectByName("playerOne");
	const [ rapierId, setRapierId ] = useState("");
	const [ contactPoint, setContactPoint ] = useState("");
	const rigidRef = useRef();

	useFrame( () => {
		if(participantObject){
			camera.position.setY( participantObject.parent.position.y + 2);	
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
		VRMUtils.rotateVRM0( playerController );
		const rotationVRM = playerController.scene.rotation.y;
		playerController.scene.rotation.set( 0, rotationVRM, 0 );
		playerController.scene.scale.set( 1, 1, 1 );

		return (
			<>
				{playerController && 
					(	
					<>
						<RigidBody 
							colliders={false}
							linearDamping={100}
							friction={1}
							ref={rigidRef}
							mass={1}
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
							<BallCollider
								position={[0, 0.5, 0]}
								args={[1.3]}
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
