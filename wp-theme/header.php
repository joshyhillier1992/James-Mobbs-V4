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
$is_project = is_singular('case_study');
?>

<!-- Blob + backdrop at body root -->
<div id="blob-container" class="blob-logo">
  <div id="blob-canvas-wrapper" class="blob-logo__canvas">
    <div id="blob-logo"><span>JM</span></div>
    <button id="close-blob" aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
        <line x1="3" y1="3" x2="15" y2="15"/><line x1="15" y1="3" x2="3" y2="15"/>
      </svg>
    </button>
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
      <a href="<?php echo esc_url(get_post_type_archive_link('case_study')); ?>"
         class="main-nav__item<?php echo (is_singular('case_study') || is_post_type_archive('case_study')) ? ' main-nav__item--active' : ''; ?>">Case Studies</a>
      <a href="<?php echo esc_url(get_page_link(get_page_by_path('showreel'))); ?>"
         class="main-nav__item<?php echo is_page('showreel') ? ' main-nav__item--active' : ''; ?>">Showreel</a>
      <a href="<?php echo esc_url(get_page_link(get_page_by_path('about'))); ?>"
         class="main-nav__item<?php echo is_page('about') ? ' main-nav__item--active' : ''; ?>">About</a>
    </nav>

    <a href="#contact" class="cta-pill">Contact</a>

    <button class="menu-toggle" type="button" aria-label="Open menu" id="menu-open">
      <span></span><span></span>
    </button>
  </div>
</header>
