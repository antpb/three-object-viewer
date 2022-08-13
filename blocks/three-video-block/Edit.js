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

import VideoEdit from './components/VideoEdit';

export default function Edit( { attributes, setAttributes, isSelected } ) {

	const onImageSelect = ( imageObject ) => {
		console.log(imageObject);
		setAttributes( { videoUrl: null } );
		setAttributes( { videoUrl: imageObject.url, aspectHeight: imageObject.height, aspectWidth: imageObject.width } );
	};
	const onChangePositionX = ( positionX ) => {
		setAttributes( { positionX: positionX } );
	};
	const onChangePositionY = ( positionY ) => {
		setAttributes( { positionY: positionY } );
	};
	const onChangePositionZ = ( positionZ ) => {
		setAttributes( { positionZ: positionZ } );
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

	const onChangeAutoPlay = ( autoPlaySetting ) => {
		setAttributes( { autoPlay: autoPlaySetting } );
	};


	const { mediaUpload } = wp.editor;

	const ALLOWED_MEDIA_TYPES = [
		'video'
	];

	const MyDropZone = () => {
		const [ hasDropped, setHasDropped ] = useState( false );
		return (
			<div>
				{ hasDropped ? 'Dropped!' : 'Drop an image here or' }
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
						title="Image Object"
						icon={ more }
						initialOpen={ true }
					>
						<PanelRow>
							<span>
								Select an image to render in your environment:
							</span>
						</PanelRow>
						<PanelRow>
							<MediaUpload
								onSelect={ ( imageObject ) =>
									onImageSelect( imageObject )
								}
								type="image"
								label="Image File"
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={ attributes.videoUrl }
								render={ ( { open } ) => (
									<button onClick={ open }>
										{ attributes.videoUrl
											? 'Replace Image'
											: 'Select Image' }
									</button>
								) }
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								label="AutoPlay"
								help={
									attributes.autoPlay
										? 'Item will autoplay.'
										: 'Item will not autoplay.'
								}
								checked={ attributes.autoPlay }
								onChange={ ( e ) => {
									onChangeAutoPlay( e );
								} }
							/>
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
					{ attributes.videoUrl ? (
						<>
							<VideoEdit 
								src={attributes.videoUrl}
								aspectHeight={attributes.aspectHeight}
								aspectWidth={attributes.aspectWidth}
							/>	
						</>) : (
						<div className="glb-preview-container">
							<MyDropZone />

							<div>
								<span>
									Select an image:
								</span>
							<MediaUpload
								onSelect={ ( imageObject ) =>
									onImageSelect( imageObject )
								}
								type="video"
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={ attributes.videoUrl }
								render={ ( { open } ) => (
									<button className="three-object-viewer-button" onClick={ open }>
										{ attributes.videoUrl
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
					{ attributes.videoUrl ? (
					<>
						<VideoEdit 
							src={attributes.videoUrl}
							aspectHeight={attributes.aspectHeight}
							aspectWidth={attributes.aspectWidth}
						/>	
					</>) : (
					<div className="glb-preview-container">
							<MyDropZone />
							<div>
								<span>
									Select an image to render in your environment:
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
								value={ attributes.videoUrl }
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
