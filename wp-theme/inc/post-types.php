<?php
function casestudies_post_type() {
    $labels = [
        'name'                  => _x('Case Studies', 'Post Type General Name', 'james-mobbs-v4'),
        'singular_name'         => _x('Case Study', 'Post Type Singular Name', 'james-mobbs-v4'),
        'menu_name'             => __('Case Studies', 'james-mobbs-v4'),
        'name_admin_bar'        => __('Case Study', 'james-mobbs-v4'),
        'all_items'             => __('All Case Studies', 'james-mobbs-v4'),
        'add_new_item'          => __('Add Case Study', 'james-mobbs-v4'),
        'add_new'               => __('Add New', 'james-mobbs-v4'),
        'new_item'              => __('New Case Study', 'james-mobbs-v4'),
        'edit_item'             => __('Edit Case Study', 'james-mobbs-v4'),
        'update_item'           => __('Update Case Study', 'james-mobbs-v4'),
        'view_item'             => __('View Case Study', 'james-mobbs-v4'),
        'search_items'          => __('Search Case Studies', 'james-mobbs-v4'),
        'not_found'             => __('Not found', 'james-mobbs-v4'),
        'not_found_in_trash'    => __('Not found in Trash', 'james-mobbs-v4'),
        'items_list'            => __('Case Studies list', 'james-mobbs-v4'),
        'items_list_navigation' => __('Case Studies list navigation', 'james-mobbs-v4'),
    ];
    $args = [
        'label'               => __('Case Study', 'james-mobbs-v4'),
        'description'         => __('Project Case Studies', 'james-mobbs-v4'),
        'labels'              => $labels,
        'supports'            => ['title', 'page-attributes'],
        'hierarchical'        => false,
        'public'              => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_position'       => 20,
        'menu_icon'           => 'dashicons-art',
        'show_in_admin_bar'   => true,
        'show_in_nav_menus'   => true,
        'can_export'          => true,
        'has_archive'         => true,
        'exclude_from_search' => false,
        'publicly_queryable'  => true,
        'capability_type'     => 'page',
        'rewrite'             => ['slug' => 'casestudy'],
    ];
    register_post_type('case_study', $args);
}
add_action('init', 'casestudies_post_type', 0);
