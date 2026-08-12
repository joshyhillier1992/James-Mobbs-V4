<?php
/*
Template Name: About
*/
defined('ABSPATH') || exit;

$large_heading      = get_field('large_heading')      ?: 'I design for screens that move.';
$standfirst         = get_field('standfirst')         ?: '';
$first_paragraph    = get_field('first_paragraph')    ?: '';
$avatar_id          = get_field('avatar');
$avatar_url         = $avatar_id ? wp_get_attachment_image_url($avatar_id, 'large') : '';
$logos              = get_field('logos')              ?: [];
$article_title      = get_field('article_title')      ?: '';
$featured_articles  = get_field('featured_articles')  ?: [];

// New ACF fields
$about_services     = get_field('about_services')     ?: [];
$disciplines_raw    = get_field('about_disciplines')  ?: '';
$availability_raw   = get_field('about_availability') ?: '';
$about_stats        = get_field('about_stats')        ?: [];

// Parse multi-line textareas into arrays
$discipline_lines   = $disciplines_raw
    ? array_filter(array_map('trim', explode("\n", $disciplines_raw)))
    : ['Motion Design', 'Live Event Production', 'Broadcast Graphics', 'Brand Identity', 'Creative Direction', 'UX / Interface Design'];
$availability_lines = $availability_raw
    ? array_filter(array_map('trim', explode("\n", $availability_raw)))
    : ['Freelance Projects', 'Remote Worldwide', 'On-Site — London'];

$email       = function_exists('get_field') ? get_field('email_address', 'option') : 'hello@jamesmobbs.com';
$linkedin    = function_exists('get_field') ? get_field('linkedin_url',  'option') : '';
$email       = $email ?: 'hello@jamesmobbs.com';
$contact_sub = function_exists('get_field') ? get_field('contact_subtext', 'option') : '';
$contact_sub = $contact_sub ?: 'Whether it\'s a live show, broadcast package or brand launch — James is available for freelance projects worldwide.';

get_header();
?>
<main class="about-page">


  <!-- ── Hero ───────────────────────────────────────── -->
  <section class="about-hero">
    <div class="about-hero__text">
      <span class="about-hero__tag">Available for Freelance</span>
      <h1 class="about-hero__heading"><?php echo esc_html($large_heading); ?></h1>
      <?php if ($standfirst) : ?>
        <div class="about-hero__intro"><?php echo wp_kses_post($standfirst); ?></div>
      <?php endif; ?>
      <div class="about-hero__actions">
        <a href="mailto:<?php echo esc_attr($email); ?>" class="cta-pill">Get in Touch</a>
        <?php if ($linkedin) : ?>
          <a href="<?php echo esc_url($linkedin); ?>" class="about-hero__link" target="_blank" rel="noopener">LinkedIn →</a>
        <?php endif; ?>
      </div>
    </div>

    <div class="about-hero__photo">
      <?php if ($avatar_url) : ?>
        <img src="<?php echo esc_url($avatar_url); ?>" alt="James Mobbs" loading="eager" />
      <?php else : ?>
        <div class="about-hero__photo-placeholder">JM</div>
      <?php endif; ?>
      <div class="about-hero__photo-caption">
        <span class="about-hero__photo-name">James Mobbs</span>
        <span class="about-hero__photo-role">Motion Designer &amp; Creative Director</span>
      </div>
    </div>
  </section>


  <!-- ── Marquee ticker ─────────────────────────────── -->
  <div class="about-marquee" aria-hidden="true">
    <div class="about-marquee__track">
      <span>Motion Design</span><span class="about-marquee__sep">·</span>
      <span>Live Events</span><span class="about-marquee__sep">·</span>
      <span>Broadcast Graphics</span><span class="about-marquee__sep">·</span>
      <span>Brand Identity</span><span class="about-marquee__sep">·</span>
      <span>Creative Direction</span><span class="about-marquee__sep">·</span>
      <span>Visual Storytelling</span><span class="about-marquee__sep">·</span>
      <span>Stage &amp; Screen</span><span class="about-marquee__sep">·</span>
      <span>UI &amp; UX Design</span><span class="about-marquee__sep">·</span>
      <!-- Duplicate for seamless loop -->
      <span>Motion Design</span><span class="about-marquee__sep">·</span>
      <span>Live Events</span><span class="about-marquee__sep">·</span>
      <span>Broadcast Graphics</span><span class="about-marquee__sep">·</span>
      <span>Brand Identity</span><span class="about-marquee__sep">·</span>
      <span>Creative Direction</span><span class="about-marquee__sep">·</span>
      <span>Visual Storytelling</span><span class="about-marquee__sep">·</span>
      <span>Stage &amp; Screen</span><span class="about-marquee__sep">·</span>
      <span>UI &amp; UX Design</span><span class="about-marquee__sep">·</span>
    </div>
  </div>


  <!-- ── Bio + Sidebar ──────────────────────────────── -->
  <?php if ($first_paragraph) : ?>
  <section class="about-bio">
    <div class="about-bio__body">
      <?php echo wp_kses_post($first_paragraph); ?>
    </div>
    <aside class="about-bio__sidebar">
      <div class="sidebar-card">
        <span class="sidebar-card__label">Disciplines</span>
        <ul class="sidebar-card__list">
          <?php foreach ($discipline_lines as $line) : ?>
            <li><?php echo esc_html($line); ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div class="sidebar-card">
        <span class="sidebar-card__label">Currently Available</span>
        <ul class="sidebar-card__list">
          <?php foreach ($availability_lines as $line) : ?>
            <li><?php echo esc_html($line); ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
    </aside>
  </section>
  <?php endif; ?>


  <!-- ── Services ───────────────────────────────────── -->
  <?php
  $services = !empty($about_services) ? $about_services : [
      ['service_title' => 'Motion Design',  'service_description' => 'From broadcast openers to digital campaigns — animations crafted to move audiences and tell stories that resonate.'],
      ['service_title' => 'Live Events',    'service_description' => 'Real-time graphics for concerts, award shows, and live broadcasts. Designed to perform flawlessly under pressure.'],
      ['service_title' => 'Brand Identity', 'service_description' => 'Identity systems with motion at their core — logos, guidelines, and animated assets that feel alive across every touchpoint.'],
  ];
  ?>
  <section class="about-services">
    <h2 class="section-title">What I Do</h2>
    <div class="about-services__grid">
      <?php foreach ($services as $i => $svc) :
        $icons = [
          '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
          '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
          '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
        ];
        $icon = $icons[$i % count($icons)];
      ?>
      <div class="service-card">
        <div class="service-card__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="1.75" aria-hidden="true">
            <?php echo $icon; ?>
          </svg>
        </div>
        <h3 class="service-card__title"><?php echo esc_html($svc['service_title']); ?></h3>
        <p class="service-card__desc"><?php echo esc_html($svc['service_description']); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </section>


  <!-- ── Stats ──────────────────────────────────────── -->
  <?php
  $stats = !empty($about_stats) ? $about_stats : [
      ['stat_number' => '12+', 'stat_label' => 'Years Experience'],
      ['stat_number' => '200+', 'stat_label' => 'Projects Delivered'],
      ['stat_number' => '40+', 'stat_label' => 'Global Clients'],
  ];
  ?>
  <div class="stats-bar" aria-label="Studio at a glance">
    <?php foreach ($stats as $stat) : ?>
    <div class="stat">
      <span class="stat__number"><?php echo esc_html($stat['stat_number']); ?></span>
      <span class="stat__label"><?php echo esc_html($stat['stat_label']); ?></span>
    </div>
    <?php endforeach; ?>
  </div>


  <!-- ── Client Logos ───────────────────────────────── -->
  <?php if (!empty($logos)) : ?>
  <section class="about-clients" aria-label="Clients &amp; Collaborators">
    <h2 class="section-title">Clients &amp; Collaborators</h2>
    <div class="about-clients__logo-grid">
      <?php foreach ($logos as $logo) :
        $logo_id  = $logo['logo_image'];
        $logo_url = $logo_id ? wp_get_attachment_image_url($logo_id, 'medium') : '';
        if (!$logo_url) continue;
      ?>
        <img src="<?php echo esc_url($logo_url); ?>" alt="" class="about-clients__logo-img" loading="lazy" />
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; ?>


  <!-- ── Press / Articles ───────────────────────────── -->
  <?php if (!empty($featured_articles)) : ?>
  <section class="about-press" aria-label="Press">
    <?php if ($article_title) : ?>
      <h2 class="section-title"><?php echo esc_html($article_title); ?></h2>
    <?php else : ?>
      <h2 class="section-title">Press</h2>
    <?php endif; ?>
    <div class="about-press__grid">
      <?php foreach ($featured_articles as $article) :
        $img_desktop_id = $article['article_image_desktop'];
        $img_desktop    = $img_desktop_id ? wp_get_attachment_image_url($img_desktop_id, 'large') : '';
        $tag            = $article['article_tag'] ?? '';
        $title          = $article['article_title'] ?? '';
        $url            = $article['article_url'] ?? '';
      ?>
      <a <?php if ($url) : ?>href="<?php echo esc_url($url); ?>" target="_blank" rel="noopener"<?php endif; ?> class="about-press__card">
        <?php if ($img_desktop) : ?>
          <div class="about-press__card-img" style="background-image:url('<?php echo esc_url($img_desktop); ?>')"></div>
        <?php endif; ?>
        <div class="about-press__card-body">
          <?php if ($tag)   : ?><span class="about-press__card-tag"><?php echo esc_html($tag); ?></span><?php endif; ?>
          <?php if ($title) : ?><h3 class="about-press__card-title"><?php echo esc_html($title); ?></h3><?php endif; ?>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; ?>


  <!-- ── CTA ────────────────────────────────────────── -->
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


</main>

<?php get_footer(); ?>
