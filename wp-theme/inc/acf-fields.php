<?php
if (!function_exists('acf_add_local_field_group')) return;

/* ─────────────────────────────────────────────────────
   CASE STUDIES  (applied to case_study CPT)
   V2 fields preserved verbatim; V4 additions appended.
───────────────────────────────────────────────────── */
acf_add_local_field_group([
    'key'      => 'group_5d38537ef29e1',
    'title'    => 'Case Studies',
    'fields'   => [

        // ── Colour ──────────────────────────────────────────
        ['key' => 'field_5d87cebf04854', 'label' => 'Accent Colour', 'name' => 'header_colour', 'type' => 'color_picker',
         'instructions' => 'Drives the project highlight colour (tags, underline, quote marks). Leave blank for the default orange.'],

        // ── Taxonomy / tags ──────────────────────────────────
        [
            'key'          => 'field_5d83abc2d3f7b',
            'label'        => 'Tags',
            'name'         => 'tags',
            'type'         => 'text',
            'instructions' => 'Comma-separated list, e.g. "Live Visuals, Broadcast, Show Package"',
        ],

        // ── V4 Homepage fields ───────────────────────────────
        [
            'key'          => 'field_v4_featured',
            'label'        => 'Featured (Case Studies grid)',
            'name'         => 'featured',
            'type'         => 'true_false',
            'instructions' => 'Tick to show this project in the homepage Case Studies grid.',
            'default_value'=> 0,
            'ui'           => 1,
        ],
        [
            'key'          => 'field_v4_homepage_excerpt',
            'label'        => 'Homepage Excerpt',
            'name'         => 'homepage_excerpt',
            'type'         => 'textarea',
            'instructions' => 'Short paragraph shown on the homepage carousel slide (1–2 sentences).',
            'rows'         => 3,
            'new_lines'    => '',
        ],

        // ── V4 Hero meta ─────────────────────────────────────
        ['key' => 'field_v4_client',   'label' => 'Client',   'name' => 'client',   'type' => 'text'],
        ['key' => 'field_v4_year',     'label' => 'Year',     'name' => 'year',     'type' => 'text'],
        ['key' => 'field_v4_role',     'label' => 'Role',     'name' => 'role',     'type' => 'text'],
        ['key' => 'field_v4_duration', 'label' => 'Duration', 'name' => 'duration', 'type' => 'text'],

        // ── Flexible Content (V2 layouts) ────────────────────
        [
            'key'          => 'field_5d3853f89d46b',
            'label'        => 'Case Studies',
            'name'         => 'case_studies',
            'type'         => 'flexible_content',
            'instructions' => 'Page-builder blocks for the project page.',
            'button_label' => 'Add Block',
            'layouts'      => [

                'layout_5d38539189069' => [
                    'key'    => 'layout_5d38539189069',
                    'name'   => 'hero',
                    'label'  => 'Hero',
                    'display'=> 'block',
                    'min'    => 1,
                    'max'    => 1,
                    'sub_fields' => [
                        ['key' => 'field_5d3858b5fec3e', 'label' => 'Hero Image',        'name' => 'hero_image',        'type' => 'image',    'return_format' => 'id'],
                        ['key' => 'field_5d39a620dc0ac', 'label' => 'Hero Image Mobile', 'name' => 'hero_image_mobile', 'type' => 'image',    'return_format' => 'id', 'instructions' => 'Vertical crop for mobile.'],
                        ['key' => 'field_5d3859d3fec3f', 'label' => 'Hero Title',        'name' => 'hero_title',        'type' => 'text'],
                        ['key' => 'field_5d3859e7fec40', 'label' => 'Hero Subtitle',     'name' => 'hero_subtitle',     'type' => 'text'],
                    ],
                ],

                'layout_5d385a24fec42' => [
                    'key'    => 'layout_5d385a24fec42',
                    'name'   => 'standfirst',
                    'label'  => 'Standfirst / Text',
                    'display'=> 'block',
                    'sub_fields' => [
                        ['key' => 'field_v4_block_heading', 'label' => 'Heading',   'name' => 'block_heading', 'type' => 'text',     'instructions' => 'e.g. "The Brief" — optional.'],
                        ['key' => 'field_5d385a39fec43',    'label' => 'Paragraph', 'name' => 'standfirst',    'type' => 'textarea', 'new_lines' => 'wpautop', 'instructions' => 'Main body text for this block.'],
                    ],
                ],

                'layout_5d385a4efec44' => [
                    'key'    => 'layout_5d385a4efec44',
                    'name'   => 'image',
                    'label'  => 'Full-width Image',
                    'display'=> 'block',
                    'sub_fields' => [
                        ['key' => 'field_5d385a5afec45', 'label' => 'Image', 'name' => 'image', 'type' => 'image', 'return_format' => 'id'],
                    ],
                ],

                'layout_5d385a67fec46' => [
                    'key'    => 'layout_5d385a67fec46',
                    'name'   => 'text_and_image',
                    'label'  => 'Text & Image (50/50)',
                    'display'=> 'block',
                    'sub_fields' => [
                        ['key' => 'field_v4_split_heading',  'label' => 'Heading',         'name' => 'split_heading',   'type' => 'text'],
                        ['key' => 'field_5d385a79fec47',     'label' => 'Copy',            'name' => 'copy',            'type' => 'textarea', 'new_lines' => ''],
                        ['key' => 'field_5d385a99fec48',     'label' => 'Image',           'name' => 'image',           'type' => 'image', 'return_format' => 'id'],
                        ['key' => 'field_5d385aa9fec49',     'label' => 'Reverse Layout?', 'name' => 'reverse_layout',  'type' => 'true_false', 'instructions' => 'Image on the left, text on the right.'],
                    ],
                ],

                'layout_5d385b55fec4b' => [
                    'key'    => 'layout_5d385b55fec4b',
                    'name'   => 'carousel',
                    'label'  => 'Image Carousel',
                    'display'=> 'block',
                    'sub_fields' => [
                        [
                            'key'        => 'field_5d385b6ffec4c',
                            'label'      => 'Carousel Images',
                            'name'       => 'carousel_images',
                            'type'       => 'repeater',
                            'layout'     => 'table',
                            'sub_fields' => [
                                ['key' => 'field_5d385b85fec4d', 'label' => 'Image', 'name' => 'image', 'type' => 'image', 'return_format' => 'id'],
                            ],
                        ],
                    ],
                ],

                'layout_5d385b98fec4e' => [
                    'key'    => 'layout_5d385b98fec4e',
                    'name'   => 'video',
                    'label'  => 'Video',
                    'display'=> 'block',
                    'sub_fields' => [
                        ['key' => 'field_5d385ba8fec4f', 'label' => 'Video URL',     'name' => 'video_url',     'type' => 'oembed', 'instructions' => 'Paste a Vimeo or YouTube URL.'],
                        ['key' => 'field_5d3a0c415bd07', 'label' => 'Video Image',   'name' => 'video_image',   'type' => 'image',  'return_format' => 'id'],
                        ['key' => 'field_5d6d96bb25a99', 'label' => 'Video Caption', 'name' => 'video_caption', 'type' => 'text'],
                    ],
                ],

                'layout_5d385bc3fec50' => [
                    'key'    => 'layout_5d385bc3fec50',
                    'name'   => 'testimonial',
                    'label'  => 'Testimonial',
                    'display'=> 'block',
                    'sub_fields' => [
                        ['key' => 'field_5d385bd8fec51', 'label' => 'Avatar',      'name' => 'avatar',     'type' => 'image', 'return_format' => 'id'],
                        ['key' => 'field_5d385be6fec52', 'label' => 'Testimonial', 'name' => 'testimonal', 'type' => 'textarea'],
                        ['key' => 'field_5d385bf0fec53', 'label' => 'Credit',      'name' => 'credit',     'type' => 'text'],
                    ],
                ],

                'layout_v4_gallery' => [
                    'key'    => 'layout_v4_gallery',
                    'name'   => 'gallery',
                    'label'  => 'Masonry Gallery',
                    'display'=> 'block',
                    'sub_fields' => [
                        [
                            'key'        => 'field_v4_gallery_images',
                            'label'      => 'Gallery Images',
                            'name'       => 'gallery_images',
                            'type'       => 'repeater',
                            'layout'     => 'table',
                            'instructions' => 'Add up to 5 images. The masonry layout is fixed: wide · tall-right · tall-left · small · wide.',
                            'sub_fields' => [
                                ['key' => 'field_v4_gallery_image', 'label' => 'Image', 'name' => 'image', 'type' => 'image', 'return_format' => 'id'],
                            ],
                        ],
                    ],
                ],

            ],
        ],

        // ── V4 Project Stats ─────────────────────────────────
        [
            'key'        => 'field_v4_stats',
            'label'      => 'Project Stats',
            'name'       => 'stats',
            'type'       => 'repeater',
            'layout'     => 'table',
            'max'        => 4,
            'sub_fields' => [
                ['key' => 'field_v4_stat_number', 'label' => 'Number', 'name' => 'stat_number', 'type' => 'text', 'wrapper' => ['width' => '30']],
                ['key' => 'field_v4_stat_label',  'label' => 'Label',  'name' => 'stat_label',  'type' => 'text', 'wrapper' => ['width' => '70']],
            ],
        ],

        // ── V4 Credits ───────────────────────────────────────
        [
            'key'        => 'field_v4_credits',
            'label'      => 'Credits',
            'name'       => 'credits',
            'type'       => 'repeater',
            'layout'     => 'table',
            'sub_fields' => [
                ['key' => 'field_v4_credit_role', 'label' => 'Role', 'name' => 'credit_role', 'type' => 'text', 'wrapper' => ['width' => '40']],
                ['key' => 'field_v4_credit_name', 'label' => 'Name', 'name' => 'credit_name', 'type' => 'text', 'wrapper' => ['width' => '60']],
            ],
        ],

        // ── Homepage images (V2) ─────────────────────────────
        ['key' => 'field_5d83ac8531217', 'label' => 'Homepage Image Mobile', 'name' => 'homepage_image_mobile', 'type' => 'image', 'return_format' => 'id'],
        ['key' => 'field_5d83ac4031216', 'label' => 'Homepage Image',        'name' => 'homepage_image',        'type' => 'image', 'return_format' => 'id'],

    ],
    'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'case_study']]],
    'menu_order'          => 0,
    'position'            => 'acf_after_title',
    'style'               => 'default',
    'label_placement'     => 'top',
    'instruction_placement' => 'label',
    'hide_on_screen'      => ['the_content','excerpt','discussion','comments','revisions','slug','author','format','page_attributes','featured_image','categories','tags','send-trackbacks'],
    'active'              => true,
]);


/* ─────────────────────────────────────────────────────
   FOOTER / CONTACT SETTINGS  (Options Page)
───────────────────────────────────────────────────── */
acf_add_local_field_group([
    'key'    => 'group_5d6da52ef234b',
    'title'  => 'Footer',
    'fields' => [
        ['key' => 'field_5d6da5837c873', 'label' => 'Footer Title',      'name' => 'footer_title',      'type' => 'text'],
        ['key' => 'field_5d6da5957c874', 'label' => 'Telephone Number',  'name' => 'telephone_number',  'type' => 'number'],
        ['key' => 'field_5d6da5a47c875', 'label' => 'Email Address',     'name' => 'email_address',     'type' => 'email'],
        ['key' => 'field_5d6da5ba7c876', 'label' => 'LinkedIn URL',      'name' => 'linkedin_url',      'type' => 'url'],
        ['key' => 'field_5d6da5c87c877', 'label' => 'Twitter URL',       'name' => 'twitter_url',       'type' => 'url'],
        ['key' => 'field_5d6da5d77c878', 'label' => 'Behance URL',       'name' => 'behance_url',       'type' => 'url'],
        ['key' => 'field_v4_showreel_url','label' => 'Showreel Vimeo URL','name' => 'showreel_url',      'type' => 'url', 'instructions' => 'Vimeo embed URL used in the blob showreel button.'],
        ['key' => 'field_v4_contact_sub', 'label' => 'Contact Subtext',  'name' => 'contact_subtext',   'type' => 'textarea', 'rows' => 3, 'instructions' => 'Paragraph below "Got a project in mind?"'],
    ],
    'location'        => [[['param' => 'options_page', 'operator' => '==', 'value' => 'contact-settings']]],
    'menu_order'      => 0,
    'position'        => 'normal',
    'style'           => 'default',
    'label_placement' => 'top',
    'active'          => true,
]);


/* ─────────────────────────────────────────────────────
   ABOUT PAGE
───────────────────────────────────────────────────── */
acf_add_local_field_group([
    'key'    => 'group_5d73d161825de',
    'title'  => 'About Page',
    'fields' => [
        ['key' => 'field_5d73d16786a85', 'label' => 'Large Heading',   'name' => 'large_heading',   'type' => 'textarea'],
        ['key' => 'field_5d87e60f86c91', 'label' => 'Standfirst',      'name' => 'standfirst',      'type' => 'textarea', 'new_lines' => 'wpautop'],
        ['key' => 'field_5d73d17586a86', 'label' => 'First Paragraph', 'name' => 'first_paragraph', 'type' => 'textarea', 'new_lines' => 'wpautop'],
        ['key' => 'field_5d73d18986a87', 'label' => 'Avatar',          'name' => 'avatar',          'type' => 'image', 'return_format' => 'id'],
        [
            'key'        => 'field_5d73d1aa86a88',
            'label'      => 'Logos',
            'name'       => 'logos',
            'type'       => 'repeater',
            'layout'     => 'table',
            'sub_fields' => [
                ['key' => 'field_5d73d1b986a89', 'label' => 'Logo Image', 'name' => 'logo_image', 'type' => 'image', 'return_format' => 'id'],
            ],
        ],
        ['key' => 'field_5d83bc493ea56', 'label' => 'Article Title',    'name' => 'article_title',    'type' => 'text'],
        ['key' => 'field_5d83bc613ea57', 'label' => 'Article Subtitle', 'name' => 'article_subtitle', 'type' => 'text'],
        [
            'key'        => 'field_5d73d1cc86a8a',
            'label'      => 'Featured Articles',
            'name'       => 'featured_articles',
            'type'       => 'repeater',
            'layout'     => 'table',
            'sub_fields' => [
                ['key' => 'field_5d73d1fb86a8d', 'label' => 'Article Image Mobile',  'name' => 'article_image_mobile',  'type' => 'image', 'return_format' => 'id'],
                ['key' => 'field_5d73d21086a8e', 'label' => 'Article Image Desktop', 'name' => 'article_image_desktop', 'type' => 'image', 'return_format' => 'id'],
                ['key' => 'field_5d73d1f286a8c', 'label' => 'Article Tag',           'name' => 'article_tag',           'type' => 'text'],
                ['key' => 'field_5d73d1e886a8b', 'label' => 'Article Title',         'name' => 'article_title',         'type' => 'text'],
                ['key' => 'field_5d73d22186a8f', 'label' => 'Article URL',           'name' => 'article_url',           'type' => 'url'],
            ],
        ],
    ],
    'location'        => [[['param' => 'post_template', 'operator' => '==', 'value' => 'page-about.php']]],
    'menu_order'      => 0,
    'position'        => 'acf_after_title',
    'style'           => 'default',
    'label_placement' => 'top',
    'hide_on_screen'  => ['the_content','excerpt','discussion','comments','revisions','slug','author','format','page_attributes','featured_image','categories','tags','send-trackbacks'],
    'active'          => true,
]);


/* ─────────────────────────────────────────────────────
   FRONT PAGE
───────────────────────────────────────────────────── */
acf_add_local_field_group([
    'key'    => 'group_5d83b5b146196',
    'title'  => 'Front Page',
    'fields' => [
        ['key' => 'field_5d83b9d1d656c', 'label' => 'Name',                 'name' => 'name',                 'type' => 'textarea'],
        ['key' => 'field_5d83b9e07c2b3', 'label' => 'Strapline',            'name' => 'strapline',            'type' => 'text'],
        ['key' => 'field_5d83ba851182c', 'label' => 'Case Study Title',     'name' => 'case_study_title',     'type' => 'text'],
        ['key' => 'field_5d83ba8d1182d', 'label' => 'Case Study Strapline', 'name' => 'case_study_strapline', 'type' => 'text'],
        ['key' => 'field_v4_stats_bar',  'label' => 'Homepage Stats',       'name' => 'homepage_stats',
            'type'       => 'repeater',
            'layout'     => 'table',
            'max'        => 4,
            'instructions' => 'Stats shown in the bar below the More Work section.',
            'sub_fields' => [
                ['key' => 'field_v4_hp_stat_num',   'label' => 'Number', 'name' => 'stat_number', 'type' => 'text', 'wrapper' => ['width' => '30']],
                ['key' => 'field_v4_hp_stat_label', 'label' => 'Label',  'name' => 'stat_label',  'type' => 'text', 'wrapper' => ['width' => '70']],
            ],
        ],
    ],
    'location'        => [[['param' => 'page_type', 'operator' => '==', 'value' => 'front_page']]],
    'menu_order'      => 0,
    'position'        => 'normal',
    'style'           => 'default',
    'label_placement' => 'top',
    'hide_on_screen'  => ['the_content','excerpt','discussion','comments','revisions','slug','author','format','page_attributes','featured_image','categories','tags','send-trackbacks'],
    'active'          => true,
]);
