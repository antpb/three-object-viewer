<?php 
/** Functions **/

/**
* Registers JavaScript and CSS for threeobjectloaderinit
* @uses "wp_enqueue_script" action
*/
function threeobjectviewer_register_threeobjectloaderinit() {
    $dependencies = [];
    $version = '0.1.0';

    wp_register_script(
        'threeobjectloaderinit',
        plugins_url("/inc/threeobjectloaderinit/index.js", __DIR__ ),
        $dependencies,
        $version
    );
    wp_register_style(
        'threeobjectloaderinit',
        plugins_url("/inc/threeobjectloaderinit/index.css", __DIR__ ),
        [],
        $version
    );
}

/**
* Enqueue JavaScript and CSS for threeobjectloaderinit
* @uses "wp_enqueue_script" action
*/
function threeobjectviewer_enqueue_threeobjectloaderinit() {
    $handle = 'threeobjectloaderinit';
    wp_enqueue_script(
        'threeobjectloaderinit',
    );
    wp_enqueue_style(
        'threeobjectloaderinit'
    );
}

add_filter('upload_mimes', __NAMESPACE__ . '\threeobjectviewer_add_file_types_to_uploads', 10, 4);
/**
* Adds glb vrm and usdz types to allowed uploads.
*/
function threeobjectviewer_add_file_types_to_uploads($file_types){
  $new_filetypes = array();
  // Potentially need to restore as model/gltf-binary in the future.  
  // $new_filetypes['glb'] = 'model/gltf-binary';
  $new_filetypes['glb'] = 'application/octet-stream';
  $new_filetypes['vrm'] = 'application/octet-stream';
  $new_filetypes['usdz'] = 'model/vnd.usdz+zip';
  $file_types = array_merge($file_types, $new_filetypes );

  return $file_types;
}

add_filter( 'wp_check_filetype_and_ext',  __NAMESPACE__ . '\three_object_viewer_check_for_usdz', 10, 4 );
function three_object_viewer_check_for_usdz( $types, $file, $filename, $mimes ) {
    if ( false !== strpos( $filename, '.usdz' ) ) {
        $types['ext']  = 'usdz';
        $types['type'] = 'model/vnd.usdz+zip';
    }
    if ( false !== strpos( $filename, '.glb' ) ) {
        $types['ext']  = 'glb';
        $types['type'] = 'application/octet-stream';
    }
    if ( false !== strpos( $filename, '.vrm' ) ) {
        $types['ext']  = 'vrm';
        $types['type'] = 'application/octet-stream';
    }
    return $types;
}

add_action('wp_enqueue_scripts', __NAMESPACE__ . '\threeobjectviewer_frontend_assets');

/**
 * Enqueue block frontend JavaScript
 */
function threeobjectviewer_frontend_assets() {

	$default_frontend_js = "../build/assets/js/blocks.frontend-versepress.js";
    $frontend_js = apply_filters( 'three-object-environment-frontend-js', $default_frontend_js );

    $current_user = wp_get_current_user();
    $vrm = wp_get_attachment_url($current_user->avatar);
    $user_data_passed = array(
        'userId' => $current_user->user_login,
        'inWorldName' => $current_user->in_world_name,
        'banner' => $current_user->custom_banner,
        'vrm' => $vrm,
     );
     
    $three_object_plugin = plugins_url() . '/three-object-viewer/build/';

    // $user_data_passed = array(
    //     'userId' => 'something',
    //     'userName' => 'someone',
    //     'vrm' => 'somefile.vrm',
    //  );
    global $post;
    $post_slug = $post->post_name;

    // wp_register_script( 'threeobjectloader-frontend', plugin_dir_url( __FILE__ ) . $frontend_js, ['wp-element', 'wp-data', 'wp-hooks'], '', true );
    wp_localize_script( 'threeobjectloader-frontend', 'userData', $user_data_passed );
    wp_localize_script( 'threeobjectloader-frontend', 'threeObjectPlugin', $three_object_plugin );

	wp_enqueue_script( 
		"threeobjectloader-frontend"
	);

    wp_register_script( 'versepress-frontend', plugin_dir_url( __FILE__ ) . $frontend_js, ['wp-element', 'wp-data', 'wp-hooks'], '', true );
    wp_localize_script( 'versepress-frontend', 'userData', $user_data_passed );
    wp_localize_script( 'versepress-frontend', 'postSlug', $post_slug );
    wp_localize_script( 'versepress-frontend', 'threeObjectPlugin', $three_object_plugin );

	wp_enqueue_script( 
		"versepress-frontend"
	);

}

add_action('enqueue_block_assets', __NAMESPACE__ . '\threeobjectviewer_editor_assets');

/**
 * Enqueue block frontend JavaScript
 */
function threeobjectviewer_editor_assets() {


    $DEFAULT_BLOCKS = [
                        'three-object-viewer/three-portal-block',
                         'three-object-viewer/three-html-block',
                         'three-object-viewer/model-block',
                         'three-object-viewer/sky-block',
                         'three-object-viewer/npc-block',
                         'three-object-viewer/three-image-block',
                         'three-object-viewer/three-video-block',
                         'three-object-viewer/three-audio-block',
                         'three-object-viewer/spawn-point-block' 
                    ];
    $ALLOWED_BLOCKS = apply_filters( 'three-object-environment-inner-allowed-blocks', $DEFAULT_BLOCKS );

    wp_localize_script( 'three-object-viewer-three-object-block-editor-script', 'allowed_blocks', $ALLOWED_BLOCKS );

}

