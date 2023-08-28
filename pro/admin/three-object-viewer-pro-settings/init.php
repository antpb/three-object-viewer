<?php
//Register assets for 3OV Settings
add_action('admin_enqueue_scripts', function () {
    wp_enqueue_media();
    $handle = 'three-object-viewer-pro-settings';
    if( file_exists(dirname(__FILE__, 4). "/build/admin-page-$handle.asset.php" ) ){
        $assets = include dirname(__FILE__, 4). "/build/admin-page-$handle.asset.php";
        $dependencies = $assets['dependencies'];
        wp_register_script(
            $handle,
            plugins_url("/build/admin-page-$handle.js", dirname(__FILE__, 3)),
            $dependencies,
            $assets['version']
        );
        $three_object_plugin = plugins_url() . '/three-object-viewer/build/';
        $three_object_plugin_root = plugins_url() . '/three-object-viewer/';
        wp_localize_script( $handle, 'threeObjectPlugin', $three_object_plugin );
        wp_localize_script( $handle, 'threeObjectPluginRoot', $three_object_plugin_root );
    }
});

//Register API Route to read and update settings.
add_action('rest_api_init', function (){
    //Register route
    register_rest_route( 'three-object-viewer/v1' , '/three-object-viewer-pro-settings/', [
        //Endpoint to get settings from
        [
            'methods' => ['GET'],
			'callback' => function($request){
				return rest_ensure_response( [
					'proKey' => get_option( 'threeov_api_key', false ),
				], 200);
			},
					'permission_callback' => function(){
                return current_user_can('manage_options');
            }
        ],
        //Endpoint to update settings at
        [
            'methods' => ['POST'],
			'callback' => function($request){
				$data = $request->get_json_params();
				update_option( '3ov_ai_openApiKey', $data['proKey'] );
				return rest_ensure_response( $data, 200);
			},
			'permission_callback' => function(){
                return current_user_can('manage_options');
            }
        ]
    ]);
});

//Enqueue assets for 3OV Settings on admin page only
add_action('admin_enqueue_scripts', function ($hook) {
    if ('3ov-settings_page_three-object-viewer-pro-settings' != $hook) {
        return;
    }
    wp_enqueue_script('three-object-viewer-pro-settings');
});

add_action('admin_menu', function () {
    add_submenu_page(
        'three-object-viewer-settings',  // Parent slug
        __('3OV Pro Settings', 'three-object-viewer'),
        __('Pro', 'three-object-viewer'),  // Menu title
        'manage_options',
        'three-object-viewer-pro-settings',
        function () {
            // React root
            echo '<div id="three-object-viewer-pro-settings"></div>';
        }
    );
});
