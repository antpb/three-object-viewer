import { useState, useEffect } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { Button, Spinner, ExternalLink } from "@wordpress/components";

export default function App({ getSettings, updateSettings }) {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpenApiKeyVisible, setIsOpenApiKeyVisible] = useState(false);
  const [mediaFrame, setMediaFrame] = useState(null);

  useEffect(() => {
    getSettings().then((response) => {
      setSettings(response);
      setIsLoading(false);
    });
  }, [getSettings]);

  const onSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    await updateSettings(settings);
    setIsSaving(false);
  };

  const openMediaUploader = (settingKey) => {
    if (mediaFrame) {
      mediaFrame.open();
      return;
    }

    const frame = wp.media({
      title: __("Select or Upload Media", "three-object-viewer"),
      button: {
        text: __("Use this media", "three-object-viewer"),
      },
      multiple: false,
    });

    frame.on("select", () => {
      const attachment = frame.state().get("selection").first().toJSON();
      setSettings({ ...settings, [settingKey]: attachment.url });
    });

    setMediaFrame(frame);
    frame.open();
  };

  const clearMedia = (settingKey) => {
    setSettings({ ...settings, [settingKey]: "" });
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="wrap">
      <h1>{__("3OV Settings", "three-object-viewer")}</h1>
      <p>
        {__(
          "Here you can manage the settings for 3OV to tweak global configuration options and save your API keys for connected services.",
          "three-object-viewer"
        )}
      </p>

      <form onSubmit={onSave}>
        <table className="form-table" role="presentation">
          <tbody>
            <tr>
              <th scope="row">
                <label htmlFor="threeovApiKey">{__("3OV Pro API Key", "three-object-viewer")}</label>
              </th>
              <td>
                <input
                  type="text"
                  id="threeovApiKey"
                  value={settings.threeovApiKey || ""}
                  onChange={(event) => setSettings({ ...settings, threeovApiKey: event.target.value })}
                  className="regular-text"
                />
                <p className="description">
                  {
                    <ExternalLink href="https://app.xr.foundation">
                      {__("Sign up for Pro", "three-object-viewer")}
                    </ExternalLink>
                  }
                </p>
              </td>
            </tr>

            <tr>
              <th scope="row">
                <label htmlFor="toyboxApiKey">{__("Toybox API Key", "three-object-viewer")}</label>
              </th>
              <td>
                <input
                  type="text"
                  id="toyboxApiKey"
                  value={settings.toyboxApiKey || ""}
                  onChange={(event) => setSettings({ ...settings, toyboxApiKey: event.target.value })}
                  className="regular-text"
                />
                <p className="description">
                  {
					<>
						<ExternalLink href="https://app.xr.foundation">
						{__("Sign up for Toybox Storage", "three-object-viewer")}
						</ExternalLink>
					</>
                  }
                </p>
              </td>
            </tr>

            <tr>
              <th scope="row">{__("Default Animation", "three-object-viewer")}</th>
              <td>
                <input
                  type="text"
                  value={settings.defaultVRM || ""}
                  readOnly
                  className="regular-text"
                />
                <Button
                  isPrimary
                  onClick={() => openMediaUploader("defaultVRM")}
                >
                  {__("Set Default Animation", "three-object-viewer")}
                </Button>
                {settings.defaultVRM && (
                  <Button
                    isSecondary
                    onClick={() => clearMedia("defaultVRM")}
                  >
                    {__("Clear Default Animation", "three-object-viewer")}
                  </Button>
                )}
              </td>
            </tr>

            <tr>
              <th scope="row">{__("Default Avatar", "three-object-viewer")}</th>
              <td>
                <input
                  type="text"
                  value={settings.defaultAvatar || ""}
                  readOnly
                  className="regular-text"
                />
                <p className="description">
                  {<ExternalLink href="https://3ov.xyz/resource/recommended-avatars/">
                      {__("Compatible Avatars", "three-object-viewer")}
                    </ExternalLink>}
                </p>
                <Button
                  isPrimary
                  onClick={() => openMediaUploader("defaultAvatar")}
                >
                  {__("Set Default Avatar", "three-object-viewer")}
                </Button>
                {settings.defaultAvatar && (
                  <Button
                    isSecondary
                    onClick={() => clearMedia("defaultAvatar")}
                  >
                    {__("Clear Default Avatar", "three-object-viewer")}
                  </Button>
                )}
              </td>
            </tr>

            <tr>
              <th scope="row">
                <label htmlFor="multiplayerWorker">{__("Networking Endpoint URL", "three-object-viewer")}</label>
              </th>
              <td>
                <input
                  type="text"
                  id="multiplayerWorker"
                  value={settings.multiplayerWorker || ""}
                  onChange={(event) => setSettings({ ...settings, multiplayerWorker: event.target.value })}
                  className="regular-text"
                />
                <p className="description">
                  {__(
                    "Use https://p2pcf.sxp.digital/ or host your own CloudFlare Worker using ",
                    "three-object-viewer"
                  )}
                  <ExternalLink href="https://github.com/gfodor/p2pcf">
                    p2pcf
                  </ExternalLink>
                  {__(
                    ". A tutorial for setting up your own worker can be found ",
                    "three-object-viewer"
                  )}
                  <ExternalLink href="https://github.com/gfodor/p2pcf/blob/master/INSTALL.md">
                    {__("here", "three-object-viewer")}
                  </ExternalLink>.
                </p>
              </td>
            </tr>

            <tr>
              <th scope="row">{__("TURN Settings", "three-object-viewer")}</th>
              <td>
                <p className="description">
                  {__(
                    "These settings are used to configure the TURN server for WebRTC connections. You can use the public TURN server or host your own. The public TURN server is hosted at ",
                    "three-object-viewer"
                  )}
                  <code>turn.sxp.digital</code>
                  {__(" but is limited.", "three-object-viewer")}
                </p>
                <p className="description">
                  {__(
                    "A TURN server is used to relay WebRTC connections when a direct connection cannot be established. This is common when two peers are behind different NATs or firewalls.",
                    "three-object-viewer"
                  )}
                </p>
              </td>
            </tr>

            <tr>
              <th scope="row">
                <label htmlFor="turnCredentialRelay">{__("TURN Credential Relay", "three-object-viewer")}</label>
              </th>
              <td>
                <input
                  type="text"
                  id="turnCredentialRelay"
                  value={settings.turnCredentialRelay || ""}
                  onChange={(event) => setSettings({ ...settings, turnCredentialRelay: event.target.value })}
                  className="regular-text"
                />
                <p className="description">
                  {__(
                    "A CloudFlare Worker is used to relay TURN credentials. You can use the public worker at ",
                    "three-object-viewer"
                  )}
                  <code>https://turn.sxp.digital/</code>
                  {__(
                    " or host your own. The public worker is resource limited and should only be used for testing. You can bypass these limits using your API key below or by hosting your own CloudFlare Worker to run the exact same credential handling. A tutorial for setting up your own worker can be found ",
                    "three-object-viewer"
                  )}
                  <ExternalLink href="https://github.com/gfodor/p2pcf/blob/master/INSTALL.md">
                    {__("here", "three-object-viewer")}
                  </ExternalLink>.
                </p>
              </td>
            </tr>

            <tr>
              <th scope="row">
                <label htmlFor="turnServerKey">{__("TURN API Key", "three-object-viewer")}</label>
              </th>
              <td>
                <input
                  type={isOpenApiKeyVisible ? "text" : "password"}
                  id="turnServerKey"
                  value={settings.turnServerKey || ""}
                  onChange={(event) => setSettings({ ...settings, turnServerKey: event.target.value })}
                  className="regular-text"
                />
                <Button
                  isSecondary
                  onClick={() => setIsOpenApiKeyVisible(!isOpenApiKeyVisible)}
                >
                  {isOpenApiKeyVisible
                    ? __("Hide Key", "three-object-viewer")
                    : __("Show Key", "three-object-viewer")
                  }
                </Button>
                <p className="description">
                  {__(
                    "This secret key will bypass limitations of the 3OV public TURN worker. You can use ",
                    "three-object-viewer"
                  )}
                  <ExternalLink href="https://www.metered.ca/">
                    metered.ca
                  </ExternalLink>
                  {__(
                    " to establish a secret key. More info can be found ",
                    "three-object-viewer"
                  )}
                  <ExternalLink href="https://www.metered.ca/docs/turnserver-guides/expiring-turn-credentials/#step-1-obtain-your-metered-domain-and-secret-key">
                    {__("here", "three-object-viewer")}
                  </ExternalLink>.
                </p>
              </td>
            </tr>

            <tr>
              <th scope="row">
                <label htmlFor="multiplayerAccess">{__("Multiplayer Access", "three-object-viewer")}</label>
              </th>
              <td>
                <select
                  id="multiplayerAccess"
                  value={settings.multiplayerAccess || "loggedIn"}
                  onChange={(event) => setSettings({ ...settings, multiplayerAccess: event.target.value })}
                >
                  <option value="loggedIn">{__("TURN for Logged In Only", "three-object-viewer")}</option>
                  <option value="public">{__("TURN Allowed for Public", "three-object-viewer")}</option>
                </select>
              </td>
            </tr>

            <tr>
              <th scope="row">{__("NPC Settings", "three-object-viewer")}</th>
              <td>
                <label htmlFor="enabled">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={settings.enabled || false}
                    onChange={(event) => setSettings({ ...settings, enabled: event.target.checked })}
                  />
                  {__("Enable NPC", "three-object-viewer")}
                </label>
              </td>
            </tr>

            <tr>
              <th scope="row">
                <label htmlFor="networkWorker">{__("AI Endpoint URL", "three-object-viewer")}</label>
              </th>
              <td>
                <input
                  type="text"
                  id="networkWorker"
                  value={settings.networkWorker || ""}
                  onChange={(event) => setSettings({ ...settings, networkWorker: event.target.value })}
                  className="regular-text"
                />
              </td>
            </tr>

            <tr>
              <th scope="row">
                <label htmlFor="openApiKey">{__("OpenAI API Token", "three-object-viewer")}</label>
              </th>
              <td>
                <input
                  type={isOpenApiKeyVisible ? "text" : "password"}
                  id="openApiKey"
                  value={settings.openApiKey || ""}
                  onChange={(event) => setSettings({ ...settings, openApiKey: event.target.value })}
                  className="regular-text"
                />
                <Button
                  isSecondary
                  onClick={() => setIsOpenApiKeyVisible(!isOpenApiKeyVisible)}
                >
                  {isOpenApiKeyVisible
                    ? __("Hide Key", "three-object-viewer")
                    : __("Show Key", "three-object-viewer")
                  }
                </Button>
              </td>
            </tr>

            <tr>
              <th scope="row">
                <label htmlFor="allowPublicAI">{__("AI Access Level", "three-object-viewer")}</label>
              </th>
              <td>
                <select
                  id="allowPublicAI"
                  value={settings.allowPublicAI || "loggedIn"}
                  onChange={(event) => setSettings({ ...settings, allowPublicAI: event.target.value })}
                >
                  <option value="public">{__("Public", "three-object-viewer")}</option>
                  <option value="loggedIn">{__("Logged In", "three-object-viewer")}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="submit">
          <Button
            isPrimary
            type="submit"
            isBusy={isSaving}
          >
            {isSaving
              ? __("Saving...", "three-object-viewer")
              : __("Save Settings", "three-object-viewer")
            }
          </Button>
        </p>
      </form>
    </div>
  );
}