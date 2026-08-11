<?php
// Fallback template — redirects to front page for this single-page portfolio.
defined('ABSPATH') || exit;
get_header();
?>
<main style="padding:var(--space-5) var(--gutter)">
  <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
    <h1><?php the_title(); ?></h1>
    <div><?php the_content(); ?></div>
  <?php endwhile; endif; ?>
</main>
<?php get_footer(); ?>
