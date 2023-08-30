<?php

/**
 * Register mirror block
 */
add_action('init', function () {
    if( file_exists(dirname(__FILE__, 4). "/build/block-environment.asset.php") ) {
        register_block_type_from_metadata(__DIR__);
    }
});
