<?php

/**
 * Register environment block and set JavaScript translations.
 */
add_action('init', function () {
    if( file_exists(dirname(__FILE__, 3). "/build/block-environment.asset.php") ) {
        $result = register_block_type_from_metadata( __DIR__, [
            'title'           => _x( 'Environment Block', 'block title', 'three-object-viewer' ),
            'description'     => _x( 'A 3D environment component', 'block description', 'three-object-viewer' ),
        ] );
        // if ( ! empty( $result->editor_script ) ) {
        //     wp_set_script_translations($result->editor_script, 'three-object-viewer', plugin_dir_path(__FILE__) . 'languages');
        // }
    }
});
