import { Suspense, useState, useEffect } from "@wordpress/element";
  
//Main component for admin page app
export default function App({ getSettings, updateSettings }) {
	let frame

	//Track settings state
	const [settings, setSettings] = useState({});
	//Use to show loading spinner
	const [isLoading, setIsLoading] = useState(true);
	const [isOpenApiKeyVisible, setIsOpenApiKeyVisible] = useState(false);
	const [saveIndicator, setSaveIndicator] = useState(false);

	const [defaultVRM, setDefaultVRM] = useState();

	//When app loads, get settings
	useEffect(() => {
		getSettings().then((r) => {
			setSettings(r);
			setIsLoading(false);
		});
	}, [getSettings, setSettings]);

    //Function to update settings via API
	const onSave = async (event) => {
		event.preventDefault();
		setSaveIndicator(true); // Show save indicator
		let response = await updateSettings(settings);
		setSettings(response);

		setTimeout(() => {
			setSaveIndicator(false);
		}, 1500);
	};
	
	const runUploaderAnimation = (event) => {
		event.preventDefault()
	
		// If the media frame already exists, reopen it.
		if (frame) {
			frame.open()
			return
		}
	
		// Create a new media frame
		frame = wp.media({
			title: 'Select or Upload Media',
			button: {
				text: 'Use this media',
			},
			multiple: false,
		})
		frame.on( 'select', function() {
      
			// Get media attachment details from the frame state
			var attachment = frame.state().get('selection').first().toJSON();
			setSettings({ ...settings, defaultVRM: attachment.url });
			// Send the attachment URL to our custom image input field.
		  });
	  
		  
		// Finally, open the modal on click
		frame.open()
	}

	const runUploaderDefaultAvatar = (event) => {
		event.preventDefault()
	
		// If the media frame already exists, reopen it.
		if (frame) {
			frame.open()
			return
		}
	
		// Create a new media frame
		frame = wp.media({
			title: 'Select or Upload Media',
			button: {
				text: 'Use this media',
			},
			multiple: false,
		})
		frame.on( 'select', function() {
      
			// Get media attachment details from the frame state
			var attachment = frame.state().get('selection').first().toJSON();
			setSettings({ ...settings, defaultAvatar: attachment.url });
		  });
	  
		  
		// Finally, open the modal on click
		frame.open()
	}

	//Show a spinner if loading
	if (isLoading) {
		return <div className="spinner" style={{ visibility: "visible" }} />;
	}
	const clearDefaultAnimation = () => {
		setSettings({ ...settings, defaultVRM: "" });
	}

	const clearDefaultAvatar = () => {
		setSettings({ ...settings, defaultAvatar: "" });
	}
	  
	//Show settings if not loading
	return (
		<>
		<form autocomplete="off">
		<table class="form-table">
			<tbody>
				<tr>
					<td>
						<div><h2>3OV Pro Settings</h2></div>
						<div><p>Here you can manage your 3OV Pro features.</p></div>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="proKey">3OV Pro API Token</label>
						{isOpenApiKeyVisible ? (
							<input
							id="proKey"
							type="text"
							name="openApiKey"
							autoComplete="off"
							value={settings.openApiKey}
							onChange={(event) => {
								setSettings({ ...settings, openApiKey: event.target.value });
							}}
							/>
						) : (
							<input
							id="openApiKey"
							type="password"
							name="openApiKey"
							autoComplete="off"
							value={settings.openApiKey}
							onChange={(event) => {
								setSettings({ ...settings, openApiKey: event.target.value });
							}}
							/>
						)}
						<button type="button" onClick={() => setIsOpenApiKeyVisible(!isOpenApiKeyVisible)}>
						{isOpenApiKeyVisible ? 'Hide' : 'Show'} Key
						</button>
					</td>
				</tr>
				{/* Select element with three options for AI type public, or logged in */}
				<tr>
					<td>
						<input id="save" className="button button-small button-primary" type="submit" name="enabled" onClick={onSave} />
						{saveIndicator && <span style={{color: "green", paddingLeft: "10px"}} className="save-indicator">Saving...</span>}
					</td>
				</tr>
			</tbody>
		</table>
		</form>
		</>	
	);
}
