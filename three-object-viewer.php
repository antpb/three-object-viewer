<?php
/**
* Plugin Name:       Three Object Viewer
* Plugin URI:        https://3ov.xyz/
* Description:       A plugin for viewing 3D files with support for WebXR and Open Metaverse Interoperability GLTF Extensions.
* Version:           1.7.1
* Requires at least: 5.7
* Requires PHP:      7.1.0
* Author:            antpb
* Author URI:        https://antpb.com
* License:           GPL v2 or later
* License URI:       https://www.gnu.org/licenses/gpl-2.0.html
* Text Domain:       three-object-viewer
* Domain Path:       /languages
*/
namespace threeObjectViewer;
require_once 'php/Plugin.php';
use threeObjectViewer\Core\Plugin;
$main = new Plugin();
$main->init();
register_activation_hook( __FILE__, array( 'threeObjectViewer\MainOptions', 'my_plugin_activate' ) );

define('THREEOV_PLUGIN_VERSION', '1.7.1');

class MainOptions
{
	public static function my_plugin_activate() {
		if( ! get_option( '3ov_ai_enabled' ) ) {
			update_option( '3ov_ai_enabled', true );
		}
		if( ! get_option( '3ov_mp_networkWorker' ) ) {
			update_option( '3ov_mp_networkWorker', 'https://alchemy.sxp.digital' );
		}
		// if 3ov_ai_openApiKey is not set, set it to empty string
		if( ! get_option( '3ov_ai_openApiKey' ) ) {
			update_option( '3ov_ai_openApiKey', '' );
		}
		if( ! get_option( '3ov_ai_allow' ) ) {
			update_option( '3ov_ai_allow', 'loggedIn' );
		}
		// Check and update '3ov_defaultAvatar' option
		if( ! get_option( '3ov_defaultAvatar' ) ) {
			update_option( '3ov_defaultAvatar', '' ); // replace 'default_value' with the value you want to set
		}
		update_option('3ov_plugin_version', THREEOV_PLUGIN_VERSION);
	}
	public static function check_plugin_update() {
		// Get the last known version from options
		$last_known_version = get_option('3ov_plugin_version');

		// If there's no recorded version or the current version is higher than the last known version, the plugin has been updated
		if (!$last_known_version || version_compare(THREEOV_PLUGIN_VERSION, $last_known_version, '>')) {
			self::on_plugin_update();
		}
	}

	public static function on_plugin_update() {
		if( ! get_option( '3ov_ai_enabled' ) ) {
			update_option( '3ov_ai_enabled', true );
		}

		if( ! get_option( '3ov_mp_networkWorker' ) ) {
			update_option( '3ov_mp_networkWorker', 'https://alchemy.sxp.digital' );
		}

		// if 3ov_ai_openApiKey is not set, set it to empty string
		if( ! get_option( '3ov_ai_openApiKey' ) ) {
			update_option( '3ov_ai_openApiKey', '' );
		}

		if( ! get_option( '3ov_ai_allow' ) ) {
			update_option( '3ov_ai_allow', 'loggedIn' );
		}

		if( ! get_option( '3ov_defaultAvatar' ) ) {
			update_option( '3ov_defaultAvatar', '' );
		}

		if( ! get_option( '3ov_defaultVRM' ) ) {
			update_option( '3ov_defaultVRM', '' );
		}

		// Update the version in options
		update_option('3ov_plugin_version', THREEOV_PLUGIN_VERSION);
	}

	/**
	 * Check if pro version is installed
	 */
	public static function threeov_is_pro() {
		if ( file_exists( __DIR__ .'/pro' )) {
			return true;
		} else {
			return false;
		}
	}

}

MainOptions::check_plugin_update();


// Include three-object-block
include_once dirname( __FILE__ ) . '/blocks/three-object-block/init.php';

// Include environment
include_once dirname( __FILE__ ) . '/blocks/environment/init.php';

// Include model
include_once dirname( __FILE__ ) . '/blocks/model-block/init.php';

// Include npc
include_once dirname( __FILE__ ) . '/blocks/npc-block/init.php';

// Include sky
include_once dirname( __FILE__ ) . '/blocks/sky-block/init.php';

// Include image
include_once dirname( __FILE__ ) . '/blocks/three-image-block/init.php';

// Include image
include_once dirname( __FILE__ ) . '/blocks/three-video-block/init.php';

// Include audio
include_once dirname( __FILE__ ) . '/blocks/three-audio-block/init.php';

// Include light
include_once dirname( __FILE__ ) . '/blocks/three-light-block/init.php';

// Include portal
include_once dirname( __FILE__ ) . '/blocks/three-portal-block/init.php';

// Include html
include_once dirname( __FILE__ ) . '/blocks/three-text-block/init.php';

// Include spawn point
include_once dirname( __FILE__ ) . '/blocks/spawn-point-block/init.php';

if ( MainOptions::threeov_is_pro() ) {
	// Include mirror block
	include_once dirname( __FILE__ ) . '/pro/blocks/three-mirror-block/init.php';
	include_once dirname( __FILE__ ) . '/pro/admin/three-object-viewer-pro-settings/init.php';
}


/**
* Include the autoloader
*/
add_action( 'plugins_loaded', function () {
    if ( file_exists(__DIR__ . '/vendor/autoload.php' ) ) {
        include __DIR__ . '/vendor/autoload.php';
    }
}, 1 );

include_once dirname( __FILE__ ). '/inc/functions.php';
include_once dirname( __FILE__ ). '/inc/hooks.php';
include_once dirname( __FILE__ ) . '/admin/three-object-viewer-settings/init.php';
include_once dirname( __FILE__ ) . '/php/Plugin.php';
