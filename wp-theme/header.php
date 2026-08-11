<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <?php wp_head(); ?>
</head>
<body <?php body_class('site'); ?>>
<?php wp_body_open(); ?>

<div class="site__gradient"></div>

<?php
$showreel_url = function_exists('get_field') ? get_field('showreel_url', 'option') : '';
$showreel_embed = $showreel_url ? add_query_arg(['autoplay' => 1, 'title' => 0, 'byline' => 0, 'portrait' => 0], $showreel_url) : '';
$is_project = is_singular('case_study');
?>

<!-- Blob + backdrop at body root -->
<div id="blob-container" class="blob-logo">
  <div id="blob-canvas-wrapper" class="blob-logo__canvas">
    <div id="blob-logo"><span>JM</span></div>
    <div class="blob-showreel">
      <a href="#" class="blob-showreel__btn"
         data-src="<?php echo esc_url($showreel_embed); ?>">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M6 4l9 5-9 5V4z"/></svg>
        Watch Showreel
      </a>
      <span class="blob-showreel__hint">Press Esc or tap outside to close</span>
      <div class="blob-video-wrap" id="blob-video-wrap">
        <button class="blob-video-close" id="blob-video-close" aria-label="Close video">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/>
          </svg>
        </button>
        <iframe class="blob-video-frame" id="blob-video-frame"
                src="" frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen></iframe>
      </div>
    </div>
    <button id="close-blob"><span>Close</span></button>
  </div>
</div>
<div id="blob-backdrop" class="blob-backdrop"></div>

<div class="site-layout">

<header class="site-header">
  <div class="site-header__inner">
    <div class="site-header__left">
      <?php if ($is_project) : ?>
        <a href="<?php echo esc_url(home_url('/')); ?>" class="nav-back" aria-label="Back to work">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13L5 8l5-5"/>
          </svg>
        </a>
      <?php endif; ?>
      <div id="blob-anchor" class="blob-anchor" aria-hidden="true"></div>
      <span class="site-name">James Mobbs</span>
    </div>

    <nav class="main-nav" aria-label="Main navigation">
      <a href="<?php echo esc_url(home_url('/')); ?>"
         class="main-nav__item<?php echo is_front_page() ? ' main-nav__item--active' : ''; ?>">Home</a>
      <a href="<?php echo esc_url(home_url('/#case-studies')); ?>"
         class="main-nav__item<?php echo is_singular('case_study') ? ' main-nav__item--active' : ''; ?>">Case Studies</a>
      <a href="<?php echo esc_url(get_page_link(get_page_by_path('about'))); ?>"
         class="main-nav__item<?php echo is_page('about') ? ' main-nav__item--active' : ''; ?>">About</a>
    </nav>

    <a href="#contact" class="cta-pill">Contact</a>

    <button class="menu-toggle" type="button" aria-label="Open menu" id="menu-open">
      <span></span><span></span>
    </button>
  </div>
</header>
