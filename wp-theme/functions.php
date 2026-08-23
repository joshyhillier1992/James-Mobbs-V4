<?php
defined('ABSPATH') || exit;

/* ── Theme Supports ─────────────────────────────── */
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
    add_image_size('cs-hero',     1920, 1080, true);
    add_image_size('cs-card',     800,  600,  true);
    add_image_size('cs-thumb',    400,  300,  true);
});

/* ── Enqueue Assets ─────────────────────────────── */
add_action('wp_enqueue_scripts', function () {
    $uri = get_template_directory_uri();
    $ver = '4.0.0';

    // Google Fonts
    wp_enqueue_style(
        'james-mobbs-fonts',
        'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Alexandria:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap',
        [],
        null
    );

    // Main stylesheet
    wp_enqueue_style('james-mobbs-style', $uri . '/assets/css/style.css', ['james-mobbs-fonts'], $ver);

    // Three.js — must be non-deferred so window.THREE is ready before blob.js
    wp_enqueue_script('three-js', $uri . '/assets/js/three.min.js', [], $ver, false);

    // Carousel
    wp_enqueue_script('james-mobbs-carousel', $uri . '/assets/js/carousel.js', ['three-js'], $ver, true);

    // Pass slide image URLs to carousel.js ambient crossfade
    $slides = jmv4_get_slides_data();
    if (!empty($slides)) {
        wp_localize_script('james-mobbs-carousel', 'JM_SLIDES', $slides);
    }

    // Blob, nav, scroll
    wp_enqueue_script('james-mobbs-blob',   $uri . '/assets/js/blob.js',   ['three-js'], $ver, true);
    wp_enqueue_script('james-mobbs-nav',    $uri . '/assets/js/nav.js',    [],           $ver, true);
    wp_enqueue_script('james-mobbs-scroll', $uri . '/assets/js/scroll.js', [],           $ver, true);

    // Lightbox — only on case study pages and the archive
    if (is_singular('case_study') || is_post_type_archive('case_study')) {
        wp_enqueue_script('james-mobbs-lightbox', $uri . '/assets/js/lightbox.js', [], $ver, true);
    }

    // Per-project variables: accent colour + ambient hero image glow
    if (is_singular('case_study')) {
        $primary  = get_field('header_colour');
        $hero_id  = get_field('homepage_image');
        $hero_url = $hero_id ? wp_get_attachment_image_url($hero_id, 'cs-hero') : '';
        $css = '';
        if ($primary) {
            $css .= ':root{--project-primary:' . esc_attr($primary) . ';}';
        }
        if ($hero_url) {
            // Inject hero image into the fixed gradient element so each project
            // gets a unique ambient glow driven by its own imagery, not a manual colour pick.
            $css .= '.site__gradient{background-image:url(' . esc_url($hero_url) . ');}';
        }
        if ($css) {
            wp_add_inline_style('james-mobbs-style', $css);
        }
    }
});

/* ── Build SLIDES_DATA for carousel ambient ─────── */
function jmv4_get_slides_data() {
    $slides = [];
    $q = new WP_Query([
        'post_type'      => 'case_study',
        'posts_per_page' => 10,
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
        'meta_query'     => [
            ['key' => 'in_carousel', 'value' => '1', 'compare' => '='],
            ['key' => 'homepage_image', 'compare' => 'EXISTS'],
        ],
        'no_found_rows'  => true,
    ]);
    if ($q->have_posts()) {
        while ($q->have_posts()) {
            $q->the_post();
            $img_id  = get_field('homepage_image');
            $img_url = $img_id ? wp_get_attachment_image_url($img_id, 'cs-hero') : '';
            if ($img_url) {
                $slides[] = ['img' => $img_url];
            }
        }
        wp_reset_postdata();
    }
    return $slides;
}

/* ── Remove block editor on CPTs that don't need it */
add_filter('use_block_editor_for_post_type', function ($use, $type) {
    return $type === 'case_study' ? false : $use;
}, 10, 2);

/* ── ACF Options Page ───────────────────────────── */
add_action('acf/init', function () {
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page([
            'page_title' => 'Contact Settings',
            'menu_title' => 'Contact Settings',
            'menu_slug'  => 'contact-settings',
            'capability' => 'edit_posts',
            'redirect'   => false,
        ]);
    }
});

/* ── Includes ───────────────────────────────────── */
require_once get_template_directory() . '/inc/post-types.php';
require_once get_template_directory() . '/inc/acf-fields.php';
