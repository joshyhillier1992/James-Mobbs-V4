<?php
$email    = function_exists('get_field') ? get_field('email_address', 'option') : 'hello@jamesmobbs.com';
$linkedin = function_exists('get_field') ? get_field('linkedin_url',  'option') : '';
$twitter  = function_exists('get_field') ? get_field('twitter_url',   'option') : '';
$behance  = function_exists('get_field') ? get_field('behance_url',   'option') : '';
$email    = $email ?: 'hello@jamesmobbs.com';
$year     = date('Y');
?>

  <div class="site-colophon">
    <span>&copy; <?php echo esc_html($year); ?> James Mobbs</span>
    <span>Manchester, UK</span>
  </div>

</div><!-- /site-layout -->

<!-- Mobile Nav Drawer -->
<nav class="nav-drawer" id="nav-drawer" aria-label="Mobile navigation" aria-hidden="true">
  <div class="nav-drawer__top">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="brand-pill brand-pill--footer">
      <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/img/jm-logo.svg'); ?>"
           alt="James Mobbs" class="brand-pill__logo" />
    </a>
    <button class="nav-drawer__close" id="menu-close" aria-label="Close menu">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
        <line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/>
      </svg>
    </button>
  </div>
  <div class="nav-drawer__links">
    <a href="<?php echo esc_url(home_url('/')); ?>"
       class="nav-drawer__link<?php echo is_front_page() ? ' is-active' : ''; ?>">Home</a>
    <a href="<?php echo esc_url(home_url('/#case-studies')); ?>"
       class="nav-drawer__link<?php echo is_singular('case_study') ? ' is-active' : ''; ?>">Work</a>
    <a href="<?php echo esc_url(get_page_link(get_page_by_path('about'))); ?>"
       class="nav-drawer__link<?php echo is_page('about') ? ' is-active' : ''; ?>">About</a>
    <a href="#contact" class="nav-drawer__link">Contact</a>
  </div>
  <div class="nav-drawer__bottom">
    <a href="#contact" class="cta-pill">Get in Touch</a>
    <div class="nav-drawer__social">
      <?php if ($linkedin) : ?><a href="<?php echo esc_url($linkedin); ?>" class="nav-drawer__social-link" target="_blank" rel="noopener">LinkedIn</a><?php endif; ?>
      <?php if ($twitter)  : ?><a href="<?php echo esc_url($twitter);  ?>" class="nav-drawer__social-link" target="_blank" rel="noopener">Twitter</a><?php endif; ?>
      <?php if ($behance)  : ?><a href="<?php echo esc_url($behance);  ?>" class="nav-drawer__social-link" target="_blank" rel="noopener">Behance</a><?php endif; ?>
    </div>
  </div>
</nav>

<?php wp_footer(); ?>
</body>
</html>
