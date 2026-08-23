<?php
defined('ABSPATH') || exit;

$all_query = new WP_Query([
    'post_type'      => 'case_study',
    'posts_per_page' => -1,
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
    'no_found_rows'  => true,
]);

get_header();
?>
<main class="archive-page">
  <section class="archive-hero">
    <p class="archive-hero__overline">Selected Work</p>
    <h1 class="archive-hero__heading">Case Studies</h1>
    <p class="archive-hero__sub">A collection of projects spanning live events, brand identity, broadcast, and digital experience.</p>
  </section>

  <?php if ($all_query->have_posts()) : ?>
  <div class="archive-grid">
    <?php
    $idx = 0;
    while ($all_query->have_posts()) : $all_query->the_post();
      $img_id       = get_field('homepage_image');
      $img_id_mob   = get_field('homepage_image_mobile') ?: $img_id;
      $img_url      = $img_id     ? wp_get_attachment_image_url($img_id, 'cs-card')   : '';
      $excerpt      = get_field('homepage_excerpt') ?: '';
      $tags         = get_field('tags') ?: '';
      $tag_list     = array_filter(array_map('trim', explode(',', $tags)));
      $primary_tag  = $tag_list ? reset($tag_list) : '';
      $is_wide      = ($idx % 5 === 0); // first card in each group of 5 is wide
      $idx++;
    ?>
    <a href="<?php the_permalink(); ?>"
       class="archive-card<?php echo $is_wide ? ' archive-card--wide' : ''; ?>"
       <?php if ($img_url) : ?>style="--card-bg:url('<?php echo esc_url($img_url); ?>')"<?php endif; ?>>
      <div class="archive-card__image" <?php if ($img_url) : ?>style="background-image:url('<?php echo esc_url($img_url); ?>')"<?php endif; ?>></div>
      <div class="archive-card__overlay"></div>
      <div class="archive-card__body">
        <?php if ($primary_tag) : ?>
          <span class="archive-card__tag"><?php echo esc_html($primary_tag); ?></span>
        <?php endif; ?>
        <h2 class="archive-card__title"><?php the_title(); ?></h2>
        <?php if ($excerpt) : ?>
          <p class="archive-card__excerpt"><?php echo esc_html($excerpt); ?></p>
        <?php endif; ?>
      </div>
    </a>
    <?php endwhile; wp_reset_postdata(); ?>
  </div>
  <?php endif; ?>
</main>

<?php get_footer(); ?>
