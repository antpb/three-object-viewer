import { __ } from '@wordpress/i18n';
import React, { useState } from 'react';
import { DropZone } from '@wordpress/components';
import './editor.scss';
import {
	useBlockProps,
	ColorPalette,
	InspectorControls,
	MediaUpload,
} from '@wordpress/block-editor';
import {
	Panel,
	PanelBody,
	PanelRow,
	RangeControl,
	ToggleControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { more } from '@wordpress/icons';

import ModelEdit from './components/ModelEdit';

export default function Edit( { attributes, setAttributes, isSelected } ) {

	const onChangeScale = ( scale ) => {
		setAttributes( { scale: scale } );
	};

	const onChangePosition = ( position ) => {
		setAttributes( { position: position } );
	};

	const onChangeRotation = ( rotation ) => {
		setAttributes( { rotation: rotation } );
	};

	const onChangeAnimations = ( animations ) => {
		setAttributes( { animations: animations } );
	};

	const onImageSelect = ( imageObject ) => {
		setAttributes( { threeObjectUrl: null } );
		setAttributes( { threeObjectUrl: imageObject.url } );
	};

	const onChangeCollidable = ( zoomSetting ) => {
		setAttributes( { hasZoom: zoomSetting } );
	};

	const [ enteredURL, setEnteredURL ] = useState( "" );

	const { mediaUpload } = wp.editor;

	const ALLOWED_MEDIA_TYPES = [
		'model/gltf-binary',
		'application/octet-stream',
	];

	const MyDropZone = () => {
		const [ hasDropped, setHasDropped ] = useState( false );
		return (
			<div>
				{ hasDropped ? 'Dropped!' : 'Drop a glb here or' }
				<DropZone
					onFilesDrop={ ( files ) =>
						mediaUpload( {
							allowedTypes: ALLOWED_MEDIA_TYPES,
							filesList: files,
							onFileChange: ( [ images ] ) => {
								onImageSelect( images );
							},
						} )
					}
				/>
			</div>
		);
	};
	
  function handleClick(objectURL){
		if(objectURL){
			console.log("success good job", objectURL);
			onImageSelect(objectURL);
		}
		console.log("fail", objectURL);
	}
  

	return (
		<div { ...useBlockProps() }>
			<InspectorControls key="setting">
				<Panel header="Settings">
					<PanelBody
						title="GLB Object"
						icon={ more }
						initialOpen={ true }
					>
						<PanelRow>
							<span>
								select a glb file from your media library to
								render an object in the canvas:
							</span>
						</PanelRow>
						<PanelRow>
							<MediaUpload
								onSelect={ ( imageObject ) =>
									onImageSelect( imageObject )
								}
								type="image"
								label="GLB File"
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={ attributes.threeObjectUrl }
								render={ ( { open } ) => (
									<button onClick={ open }>
										{ attributes.threeObjectUrl
											? 'Replace Object'
											: 'Select Object' }
									</button>
								) }
							/>
						</PanelRow>
					</PanelBody>
					<PanelBody
						title="Model Attributes"
						icon={ more }
						initialOpen={ true }
					>
						<PanelRow>
							<TextControl
								label="Loop Animations"
								help="Separate each animation name you wish to loop with a comma"
								value={ attributes.animations }
								onChange={ ( value ) =>
									onChangeAnimations( value )
								}
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label="Scale"
								help="scale"
								value={ attributes.scale }
								onChange={ ( value ) =>
									onChangeScale( value )
								}
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label="Position"
								help="position"
								value={ attributes.position }
								onChange={ ( value ) =>
									onChangePosition( value )
								}
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								label="Rotation"
								help="rotation"
								value={ attributes.position }
								onChange={ ( value ) =>
									onChangeRotation( value )
								}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								label="Collidable"
								help={
									attributes.collidable
										? 'Item is currently collidable.'
										: 'Item is not collidable. Users will walk through it.'
								}
								checked={ attributes.collidable }
								onChange={ ( e ) => {
									onChangeCollidable( e );
								} }
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			</InspectorControls>
			{ isSelected ? (
				<>
					{ attributes.threeObjectUrl ? (
						<ModelEdit
							url={ attributes.threeObjectUrl }
							scale={ attributes.scale }
							animations={ attributes.animations }
							position={ attributes.position }
							rotation={ attributes.rotation }
							collidable={ attributes.collidable }
						/>
					) : (
						<div className="glb-preview-container">
							<MyDropZone />

							<div>
								<span>
									Select a glb file to render in the canvas:
								</span>
								{/* <div className="three-object-block-url-input"> 
									<input onChange={(e) => setEnteredURL(e.target.value)}></input> 
									<button 
										className="three-object-viewer-button" 
										onClick={	handleClick(enteredURL) }
									>
										Use URL
									</button>
								</div> */}
							<MediaUpload
								onSelect={ ( imageObject ) =>
									onImageSelect( imageObject )
								}
								type="image"
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={ attributes.threeObjectUrl }
								render={ ( { open } ) => (
									<button className="three-object-viewer-button" onClick={ open }>
										{ attributes.threeObjectUrl
											? 'Replace Object'
											: 'Select From Media Library' }
									</button>
								) }
							/>
						</div>
						</div>
					) }
				</>
			) : (
				<>
					{ attributes.threeObjectUrl ? (
						<ModelEdit
						url={ attributes.threeObjectUrl }
						scale={ attributes.scale }
						animations={ attributes.animations }
						position={ attributes.position }
						rotation={ attributes.rotation }
						collidable={ attributes.collidable }
					/>
				) : (
						<div className="glb-preview-container">
							<MyDropZone />
							<div>
								<span>
									Select a glb file to render in the canvas:
								</span>
								{/* <div className="three-object-block-url-input"> 
								<input onChange={(e) => console.log(e.target.value) && setEnteredURL(e.target.value)}></input> 
									<button 
										className="three-object-viewer-button" 
										onClick={	handleClick(enteredURL) }
									>
										Use URL
									</button>
								</div> */}
							</div>
							<MediaUpload
								onSelect={ ( imageObject ) =>
									onImageSelect( imageObject )
								}
								type="image"
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={ attributes.threeObjectUrl }
								render={ ( { open } ) => (
									<button className="three-object-viewer-button" onClick={ open }>
										Select From Media Library
									</button>
								) }
							/>
						</div>
					) }
				</>
			) }
		</div>
	);
}
