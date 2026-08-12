<?php
defined('ABSPATH') || exit;

// Archive template for the case_study CPT — registered at /casestudy/
// Uses the main query (WordPress sets it up automatically for archives)

get_header();
?>
<main class="work-archive">

  <header class="work-archive__header">
    <p class="work-archive__label">Portfolio</p>
    <h1 class="work-archive__title">All Work</h1>
  </header>

  <div class="work-archive__grid">
    <?php
    // Re-query sorted by menu_order (WP archive default is date desc)
    $archive_query = new WP_Query([
        'post_type'      => 'case_study',
        'posts_per_page' => -1,
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ]);

    if ($archive_query->have_posts()) :
        while ($archive_query->have_posts()) : $archive_query->the_post();
            $img_id   = get_field('homepage_image');
            $img_url  = $img_id ? wp_get_attachment_image_url($img_id, 'cs-card') : '';
            $tags     = get_field('tags') ?: '';
            $tag_list = array_filter(array_map('trim', explode(',', $tags)));
            $type_tag = $tag_list ? reset($tag_list) : '';
            $year     = get_field('year') ?: '';
    ?>
    <a href="<?php the_permalink(); ?>" class="work-card"
       <?php if ($img_url) : ?>style="--card-bg: url('<?php echo esc_url($img_url); ?>')"<?php endif; ?>>
      <div class="work-card__media"<?php if ($img_url) echo ' style="background-image:url(\'' . esc_url($img_url) . '\')"'; ?>></div>
      <div class="work-card__body">
        <?php if ($type_tag || $year) : ?>
          <span class="work-card__type"><?php echo esc_html($type_tag); ?><?php if ($type_tag && $year) echo ' · '; ?><?php echo esc_html($year); ?></span>
        <?php endif; ?>
        <h2 class="work-card__title"><?php the_title(); ?></h2>
      </div>
    </a>
    <?php
        endwhile;
        wp_reset_postdata();
    endif;
    ?>
  </div>

</main>

<?php get_footer(); ?>
