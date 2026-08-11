<?php
/*
Template Name: About
*/
defined('ABSPATH') || exit;

$large_heading    = get_field('large_heading')   ?: 'I design for screens that move.';
$standfirst       = get_field('standfirst')      ?: '';
$first_paragraph  = get_field('first_paragraph') ?: '';
$avatar_id        = get_field('avatar');
$avatar_url       = $avatar_id ? wp_get_attachment_image_url($avatar_id, 'large') : '';
$logos            = get_field('logos')           ?: [];
$article_title    = get_field('article_title')   ?: '';
$article_subtitle = get_field('article_subtitle') ?: '';
$featured_articles = get_field('featured_articles') ?: [];

$email = function_exists('get_field') ? get_field('email_address', 'option') : 'hello@jamesmobbs.com';
$email = $email ?: 'hello@jamesmobbs.com';

get_header();
?>
<main class="about-page">

  <!-- ── Hero ─────────────────────────────────────── -->
  <section class="about-hero">
    <div class="about-hero__text">
      <h1 class="about-hero__heading"><?php echo esc_html($large_heading); ?></h1>
      <?php if ($standfirst) : ?>
        <div class="about-hero__standfirst"><?php echo wpautop(esc_html($standfirst)); ?></div>
      <?php endif; ?>
    </div>
    <?php if ($avatar_url) : ?>
      <div class="about-hero__image">
        <img src="<?php echo esc_url($avatar_url); ?>" alt="James Mobbs" />
      </div>
    <?php endif; ?>
  </section>


  <!-- ── Bio ───────────────────────────────────────── -->
  <?php if ($first_paragraph) : ?>
  <section class="about-bio">
    <div class="about-bio__body">
      <?php echo wpautop(esc_html($first_paragraph)); ?>
    </div>
  </section>
  <?php endif; ?>


  <!-- ── Client Logos ─────────────────────────────── -->
  <?php if (!empty($logos)) : ?>
  <section class="about-clients" aria-label="Clients & Collaborators">
    <h2 class="section-title">Clients &amp; Collaborators</h2>
    <div class="about-clients__grid">
      <?php foreach ($logos as $logo) :
        $logo_id  = $logo['logo_image'];
        $logo_url = $logo_id ? wp_get_attachment_image_url($logo_id, 'medium') : '';
        if (!$logo_url) continue;
      ?>
        <img src="<?php echo esc_url($logo_url); ?>" alt="" class="about-clients__logo" loading="lazy" />
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; ?>


  <!-- ── Featured Articles / Press ────────────────── -->
  <?php if (!empty($featured_articles)) : ?>
  <section class="about-press" aria-label="Press">
    <?php if ($article_title) : ?>
      <h2 class="section-title"><?php echo esc_html($article_title); ?></h2>
    <?php endif; ?>
    <?php if ($article_subtitle) : ?>
      <p class="section-subtitle"><?php echo esc_html($article_subtitle); ?></p>
    <?php endif; ?>
    <div class="about-press__grid">
      <?php foreach ($featured_articles as $article) :
        $img_desktop_id = $article['article_image_desktop'];
        $img_mobile_id  = $article['article_image_mobile'];
        $img_desktop    = $img_desktop_id ? wp_get_attachment_image_url($img_desktop_id, 'large') : '';
        $img_mobile     = $img_mobile_id  ? wp_get_attachment_image_url($img_mobile_id,  'cs-card') : $img_desktop;
        $tag            = $article['article_tag'] ?? '';
        $title          = $article['article_title'] ?? '';
        $url            = $article['article_url'] ?? '';
      ?>
      <a <?php if ($url) : ?>href="<?php echo esc_url($url); ?>" target="_blank" rel="noopener"<?php endif; ?> class="about-press__card">
        <?php if ($img_desktop) : ?>
          <div class="about-press__card-img" style="background-image:url('<?php echo esc_url($img_desktop); ?>')"></div>
        <?php endif; ?>
        <div class="about-press__card-body">
          <?php if ($tag) : ?><span class="about-press__card-tag"><?php echo esc_html($tag); ?></span><?php endif; ?>
          <?php if ($title) : ?><h3 class="about-press__card-title"><?php echo esc_html($title); ?></h3><?php endif; ?>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; ?>


  <!-- ── Contact ────────────────────────────────────── -->
  <section class="contact-section" id="contact" aria-label="Get in touch">
    <div class="contact-section__text">
      <span class="contact-section__label">Let's Work Together</span>
      <h2 class="contact-section__heading">Got a project in mind?</h2>
    </div>
    <div class="contact-section__actions">
      <a href="mailto:<?php echo esc_attr($email); ?>" class="cta-pill">Send a Message</a>
      <a href="mailto:<?php echo esc_attr($email); ?>" class="contact-email"><?php echo esc_html($email); ?></a>
    </div>
  </section>

</main>

<?php get_footer(); ?>
