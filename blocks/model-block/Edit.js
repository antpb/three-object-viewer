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
	TextareaControl,
} from '@wordpress/components';
import { more } from '@wordpress/icons';

import ModelEdit from './components/ModelEdit';

export default function Edit( { attributes, setAttributes, isSelected } ) {

	const onChangePositionX = ( positionX ) => {
		setAttributes( { positionX: positionX } );
	};
	const onChangePositionY = ( positionY ) => {
		setAttributes( { positionY: positionY } );
	};
	const onChangePositionZ = ( positionZ ) => {
		setAttributes( { positionZ: positionZ } );
	};

	const onChangeAlt = ( altValue ) => {
		setAttributes( { alt: altValue } );
	};

	const onChangeRotationX = ( rotationX ) => {
		setAttributes( { rotationX: rotationX } );
	};
	const onChangeRotationY = ( rotationY ) => {
		setAttributes( { rotationY: rotationY } );
	};
	const onChangeRotationZ = ( rotationZ ) => {
		setAttributes( { rotationZ: rotationZ } );
	};

	const onChangeScaleX = ( scaleX ) => {
		setAttributes( { scaleX: scaleX } );
	};
	const onChangeScaleY = ( scaleY ) => {
		setAttributes( { scaleY: scaleY } );
	};
	const onChangeScaleZ = ( scaleZ ) => {
		setAttributes( { scaleZ: scaleZ } );
	};

	const onChangeAnimations = ( animations ) => {
		setAttributes( { animations: animations } );
	};

	const onImageSelect = ( imageObject ) => {
		setAttributes( { threeObjectUrl: null } );
		setAttributes( { threeObjectUrl: imageObject.url } );
	};

	const onChangeCollidable = ( collidableSetting ) => {
		setAttributes( { collidable: collidableSetting } );
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
							<TextareaControl
								label="Model Alt Text"
								help="Describe your model to provide context for screen readers."
								value={ attributes.alt }
								onChange={ ( value ) =>
									onChangeAlt( value )
								}
							/>
						</PanelRow>
						<PanelRow>                            
							<legend className="blocks-base-control__label">
                                { __( 'Position', 'three-object-viewer' ) }
                            </legend>
						</PanelRow>
						<PanelRow>
							<TextControl
								className="position-inputs"
								label="X"
								// help="position x"
								value={ attributes.positionX }
								onChange={ ( value ) =>
									onChangePositionX( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Y"
								// help="position y"
								value={ attributes.positionY }
								onChange={ ( value ) =>
									onChangePositionY( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Z"
								// help="position z"
								value={ attributes.positionZ }
								onChange={ ( value ) =>
									onChangePositionZ( value )
								}
							/>
						</PanelRow>
						<PanelRow>                            
							<legend className="blocks-base-control__label">
                                { __( 'Rotation', 'three-object-viewer' ) }
                            </legend>
						</PanelRow>
						<PanelRow>
							<TextControl
								className="position-inputs"
								label="X"
								// help="position x"
								value={ attributes.rotationX }
								onChange={ ( value ) =>
									onChangeRotationX( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Y"
								// help="position y"
								value={ attributes.rotationY }
								onChange={ ( value ) =>
									onChangeRotationY( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Z"
								// help="position z"
								value={ attributes.rotationZ }
								onChange={ ( value ) =>
									onChangeRotationZ( value )
								}
							/>
						</PanelRow>
						<PanelRow>                            
							<legend className="blocks-base-control__label">
                                { __( 'Scale', 'three-object-viewer' ) }
                            </legend>
						</PanelRow>
						<PanelRow>
							<TextControl
								className="position-inputs"
								label="X"
								// help="position x"
								value={ attributes.scaleX }
								onChange={ ( value ) =>
									onChangeScaleX( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Y"
								// help="position y"
								value={ attributes.scaleY }
								onChange={ ( value ) =>
									onChangeScaleY( value )
								}
							/>
							<TextControl
								className="position-inputs"
								label="Z"
								// help="position z"
								value={ attributes.scaleZ }
								onChange={ ( value ) =>
									onChangeScaleZ( value )
								}
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
						scaleX={ attributes.scaleX }
						scaleY={ attributes.scaleY }
						scaleZ={ attributes.scaleZ }
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
