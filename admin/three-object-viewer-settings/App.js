import { Suspense, useState, useEffect } from "@wordpress/element";
// import i18n from "@wordpress/i18n";
import { __ } from "@wordpress/i18n";
  
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
		setSaveIndicator(true);
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
			title: __( 'Select or Upload Media', 'three-object-viewer' ),
			button: {
				text: __( 'Use this media', 'three-object-viewer' ),
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
			title: __( 'Select or Upload Media', 'three-object-viewer' ),
			button: {
				text: __( 'Use this media', 'three-object-viewer' ),
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
						<div><h2>{ __( '3OV Settings', 'three-object-viewer') }</h2></div>
						<div><p>{ __( 'Here you can manage the settings for 3OV to tweak global configuration options and save your API keys for connected serivces.', 'three-object-viewer' ) }</p></div>
					</td>
				</tr>
				<tr>
					<td><h3>{ __( 'Avatar Settings', 'three-object-viewer' ) }</h3></td>
				</tr>
				<tr>
					<td>
						<label htmlFor="defaultVRM"><b>{ __( 'Default animation', 'three-object-viewer' ) }</b></label>
					</td>
				</tr>
				<tr>
					<td>
						{ settings.defaultVRM ? settings.defaultVRM : __( "No custom default animation set", 'three-object-viewer' ) }
					</td>
				</tr>
				<tr>
					<td>
						<button type='button' onClick={runUploaderAnimation}>
						{ __( 'Set Default Animation', 'three-object-viewer' ) }
						</button>
					</td>
				</tr>
				<tr>
					<td>
						<button type='button' onClick={clearDefaultAnimation}>
							{ __( 'Clear Default Animation', 'three-object-viewer' ) }
						</button>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="defaultAvatar"><b>Default Avatar</b></label>
						<p>View our  <a href="https://3ov.xyz/resource/recommended-avatars/">Avatar Resource Page</a> for some 3OV compatible avatars.</p>
					</td>
				</tr>
				<tr>
					<td>
						{ settings.defaultAvatar ? settings.defaultAvatar : __( "No custom default avatar set", 'three-object-viewer' ) }
					</td>
				</tr>
				<tr>
					<td>
						<button type='button' onClick={runUploaderDefaultAvatar}>
							{ __( 'Set Default Avatar', 'three-object-viewer' ) }
						</button>
					</td>
				</tr>
				<tr>
					<td>
						<button type='button' onClick={clearDefaultAvatar}>
							{ __( 'Clear Default Avatar', 'three-object-viewer' ) }
						</button>
					</td>
				</tr>
				<tr>
					<td><h3>{__('Networking Settings', 'three-object-viewer' ) }</h3></td>
				</tr>
				<tr>
				<td>
						<label htmlFor="multiplayerWorker">{ __( 'Networking Endpoint URL', 'three-object-viewer' ) }</label>
						<input
							id="multiplayerWorker"
							type="input"
							className="regular-text"
							name="multiplayerWorker"
							autoComplete="off"
							value={settings.multiplayerWorker}
							onChange={(event) => {
								setSettings({ ...settings, multiplayerWorker: event.target.value });
							}}
						/>
						<p>Use <b>https://p2pcf.sxp.digital/</b> or host your own CloudFlare Worker using <a href="https://github.com/gfodor/p2pcf" target="_blank">p2pcf</a>. A tutorial for setting up your own worker can be found <a href="https://github.com/gfodor/p2pcf/blob/master/INSTALL.md" target="_blank">here</a>.</p>
					</td>
				</tr>
				<tr>
					<td>
						<h4><label htmlFor="turnCredentialRelay">{ __( 'TURN Settings', 'three-object-viewer' ) }</label></h4>
						<p>These settings are used to configure the TURN server for WebRTC connections. You can use the public TURN server or host your own. The public TURN server is hosted at <b>turn.sxp.digital</b> but is limited.</p>
						<p>A TURN server is used to relay WebRTC connections when a direct connection cannot be established. This is common when two peers are behind different NATs or firewalls.</p>
					</td>
				</tr>
				<tr>
					<td>
						<tr>
							<td>
								<label htmlFor="turnCredentialRelay">{ __( 'TURN Credential Relay', 'three-object-viewer' ) }</label>
							</td>
						</tr>
						<tr>
							<input
								id="turnCredentialRelay"
								type="text"
								label="TURN Credential Relay"
								name="turnCredentialRelay"
								autoComplete="off"
								value={settings.turnCredentialRelay}
								onChange={(event) => {
									setSettings({ ...settings, turnCredentialRelay: event.target.value });
								}}
							/>
							<p>A CloudFlare Worker is used to relay TURN credentials. You can use the public worker at <b>https://turn.sxp.digital/</b> or host your own.</p>
							<p>The public worker is resource limited and should only be used to test. You can bypass these limits using your API key below or by hosting your own CloudFlare Worker to run the exact same credential handling. A tutorial for setting up your own worker can be found <a href="https://github.com/gfodor/p2pcf/blob/master/INSTALL.md" target="_blank">here</a>.</p>
						</tr>
					</td>
				</tr>
				<tr>
					<td>
						<tr>
							<td>
								<label htmlFor="turnServerKey">{ __( 'Turn API Key', 'three-object-viewer' ) }</label>
							</td>
						</tr>
						<tr>
							<input
								id="turnServerKey"
								type="password"
								label="Turn Server Password"
								name="turnServerKey"
								autoComplete="off"
								value={settings.turnServerKey}
								onChange={(event) => {
									setSettings({ ...settings, turnServerKey: event.target.value });
								}}
							/>
							<p>This secret key will bypass limitations of the 3OV public turn worker. You can use metered.ca to establish a secret key. More info can be found here: <a href="https://www.metered.ca/docs/turnserver-guides/expiring-turn-credentials/#step-1-obtain-your-metered-domain-and-secret-key">https://www.metered.ca/docs/turnserver-guides/expiring-turn-credentials/#step-1-obtain-your-metered-domain-and-secret-key</a></p>
						</tr>
					</td>
				</tr>
				<tr>
					<td>
						<tr>
							<select
								id="multiplayerAccess"
								name="Multiplayer Access"
								label="Multiplayer TURN Access"
								value={settings.multiplayerAccess}
								defaultValue={'loggedIn'}
								onChange={(event) => {
									setSettings({ ...settings, multiplayerAccess: event.target.value });
								}}
							>
								<option value="loggedIn">{ __( 'TURN for Logged In Only', 'three-object-viewer' ) }</option>
								<option value="public">{ __( 'TURN allowed for Public', 'three-object-viewer' ) }</option>
							</select>
						</tr>
					</td>
				</tr>
				<tr>
					<td><h3>{__('AI Settings', 'three-object-viewer' ) }</h3></td>
				</tr>
				<tr>
					<td>{ __( 'NPC Settings', 'three-object-viewer' ) }</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="enabled">{ __( 'Enable', 'three-object-viewer' ) }</label>
						<input
							id="enabled"
							type="checkbox"
							name="enabled"
							value={settings.enabled}
							checked={settings.enabled}
							onChange={(event) => {
								setSettings({ ...settings, enabled: event.target.checked });
							}}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="networkWorker">{ __( 'AI Endpoint URL', 'three-object-viewer' ) }</label>
						<input
							id="networkWorker"
							type="input"
							className="regular-text"
							name="networkWorker"
							autoComplete="off"
							value={settings.networkWorker}
							onChange={(event) => {
								setSettings({ ...settings, networkWorker: event.target.value });
							}}
						/>
					</td>
				</tr>
				<tr>
					<td>
						<label htmlFor="openApiKey">{ __( 'OpenAI API Token', 'three-object-viewer' ) }</label>
						{isOpenApiKeyVisible ? (
							<input
							id="openApiKey"
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
						<label htmlFor="aiType">{ __( 'AI Access Level', 'three-object-viewer' ) }</label>
						<select
							id="aiType"
							name="aiType"
							value={settings.allowPublicAI}
							onChange={(event) => {
								setSettings({ ...settings, allowPublicAI: event.target.value });
							}}
						>
							<option value="public">{ __( 'Public', 'three-object-viewer' ) }</option>
							<option value="loggedIn">{ __( 'Logged In', 'three-object-viewer' ) }</option>
						</select>
					</td>
				</tr>
				<tr>
					<td>
						<input id="save" className="button button-small button-primary" type="submit" name="enabled" onClick={onSave} />
						{saveIndicator && <span style={{color: "green", paddingLeft: "10px"}} className="save-indicator">{__('Saving...', 'three-object-viewer' ) }</span>}
					</td>
				</tr>
			</tbody>
		</table>
		</form>
		</>	
	);
}
