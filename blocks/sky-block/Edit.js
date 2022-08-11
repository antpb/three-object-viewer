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

import SkyEdit from './components/SkyEdit';

export default function Edit( { attributes, setAttributes, isSelected } ) {

	const onImageSelect = ( imageObject ) => {
		setAttributes( { skyUrl: null } );
		setAttributes( { skyUrl: imageObject.url } );
	};

	const onChangeCollidable = ( zoomSetting ) => {
		setAttributes( { hasZoom: zoomSetting } );
	};


	const { mediaUpload } = wp.editor;

	const ALLOWED_MEDIA_TYPES = [
		'image'
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
						title="Sky Object"
						icon={ more }
						initialOpen={ true }
					>
						<PanelRow>
							<span>
								Select an image to be used as your skybox. 360 spherical panoramics recommended:
							</span>
						</PanelRow>
						<PanelRow>
							<MediaUpload
								onSelect={ ( imageObject ) =>
									onImageSelect( imageObject )
								}
								type="image"
								label="Sky File"
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={ attributes.skyUrl }
								render={ ( { open } ) => (
									<button onClick={ open }>
										{ attributes.skyUrl
											? 'Replace Sky'
											: 'Select Sky' }
									</button>
								) }
							/>
						</PanelRow>
					</PanelBody>
				</Panel>
			</InspectorControls>
			{ isSelected ? (
				<>
					{ attributes.skyUrl ? (
						<>
							<SkyEdit src={attributes.skyUrl} />	
						</>) : (
						<div className="glb-preview-container">
							<MyDropZone />

							<div>
								<span>
									Select an image to be used as your skybox. 360 spherical panoramics recommended:
								</span>
							<MediaUpload
								onSelect={ ( imageObject ) =>
									onImageSelect( imageObject )
								}
								type="image"
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								value={ attributes.skyUrl }
								render={ ( { open } ) => (
									<button className="three-object-viewer-button" onClick={ open }>
										{ attributes.skyUrl
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
					{ attributes.skyUrl ? (
					<>
						<SkyEdit src={attributes.skyUrl} />	
					</>) : (
					<div className="glb-preview-container">
							<MyDropZone />
							<div>
								<span>
									Select an image to be used as your skybox. 360 spherical panoramics recommended:
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
								value={ attributes.skyUrl }
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
