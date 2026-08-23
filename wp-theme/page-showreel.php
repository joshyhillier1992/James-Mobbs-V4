<?php
/**
 * Template Name: Showreel
 */
defined('ABSPATH') || exit;

$showreel_url = function_exists('get_field') ? get_field('showreel_url', 'option') : '';
$embed_url    = function_exists('jmv4_vimeo_embed') ? jmv4_vimeo_embed($showreel_url, 0) : '';
$email        = function_exists('get_field') ? get_field('email_address', 'option') : 'hello@jamesmobbs.com';
$email        = $email ?: 'hello@jamesmobbs.com';
$contact_sub  = function_exists('get_field') ? get_field('contact_subtext', 'option') : '';
$contact_sub  = $contact_sub ?: 'Whether it\'s a live show, broadcast package or brand launch — James is available for freelance projects worldwide.';

get_header();
?>

<main class="showreel-page">

  <?php if ($embed_url) : ?>
  <div class="showreel-page__embed">
    <div class="showreel-page__ratio">
      <iframe src="<?php echo esc_url($embed_url); ?>"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
              class="showreel-page__iframe"
              title="James Mobbs Showreel"></iframe>
    </div>
  </div>
  <?php else : ?>
  <p style="text-align:center;color:var(--text-muted);padding:var(--space-4) var(--gutter)">
    No showreel URL set — add it in <strong>WP Admin → Contact Settings → Showreel Vimeo URL</strong>.
  </p>
  <?php endif; ?>

  <div class="showreel-page__contact">
  <div class="about-cta" id="contact">
    <div class="about-cta__text">
      <h2 class="about-cta__heading">Got a project in mind?</h2>
      <p class="about-cta__sub"><?php echo esc_html($contact_sub); ?></p>
    </div>
    <div class="about-cta__actions">
      <a href="mailto:<?php echo esc_attr($email); ?>" class="cta-pill">Send a Message</a>
      <a href="mailto:<?php echo esc_attr($email); ?>" class="contact-email"><?php echo esc_html($email); ?></a>
    </div>
  </div>
  </div>

</main>

<?php get_footer(); ?>
