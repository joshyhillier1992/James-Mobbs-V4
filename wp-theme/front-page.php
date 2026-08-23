<?php
defined('ABSPATH') || exit;

// ── Queries ──────────────────────────────────────────────
$carousel_query = new WP_Query([
    'post_type'      => 'case_study',
    'posts_per_page' => 10,
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
    'meta_query'     => [['key' => 'homepage_image', 'compare' => 'EXISTS']],
    'no_found_rows'  => true,
]);

$featured_query = new WP_Query([
    'post_type'      => 'case_study',
    'posts_per_page' => 3,
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
    'meta_query'     => [['key' => 'featured', 'value' => '1', 'compare' => '=']],
    'no_found_rows'  => true,
]);

// Fallback: if no posts are marked featured, use first 3 by menu_order
if (!$featured_query->have_posts()) {
    $featured_query = new WP_Query([
        'post_type'      => 'case_study',
        'posts_per_page' => 3,
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ]);
}

// IDs already shown in case studies grid — exclude from the list below
$featured_ids = [];
if ($featured_query->have_posts()) {
    foreach ($featured_query->posts as $p) {
        $featured_ids[] = $p->ID;
    }
}

// Remaining projects for the "More Work" list
$more_query = new WP_Query([
    'post_type'      => 'case_study',
    'posts_per_page' => 5,
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
    'post__not_in'   => $featured_ids,
    'no_found_rows'  => false,
]);

// Contact info from options
$email       = function_exists('get_field') ? get_field('email_address', 'option') : 'hello@jamesmobbs.com';
$contact_sub = function_exists('get_field') ? get_field('contact_subtext', 'option') : '';
$email       = $email ?: 'hello@jamesmobbs.com';
$contact_sub = $contact_sub ?: 'Whether it\'s a live show, broadcast package or brand launch — James is available for freelance projects worldwide. Get in touch to discuss your next production.';

// Homepage stats
$homepage_stats = function_exists('get_field') ? get_field('homepage_stats') : [];

get_header();
?>

<main>

  <!-- ── Hero Carousel ──────────────────────────────── -->
  <section class="hero-carousel" aria-label="Featured work">
    <div class="carousel__ambient" id="js-ambient"></div>
    <div class="carousel__ambient-b" id="js-ambient-b"></div>
    <div class="carousel__viewport">
      <div class="carousel__track" id="js-track">

        <?php
        $slide_index = 0;
        if ($carousel_query->have_posts()) :
            while ($carousel_query->have_posts()) : $carousel_query->the_post();
                $img_id      = get_field('homepage_image');
                $img_mob_id  = get_field('homepage_image_mobile');
                $img_url     = $img_id ? wp_get_attachment_image_url($img_id, 'cs-hero') : '';
                $img_mob_url = $img_mob_id ? wp_get_attachment_image_url($img_mob_id, 'cs-hero') : $img_url;
                $tags        = get_field('tags') ?: '';
                $excerpt     = get_field('homepage_excerpt') ?: '';
                $tag_list    = array_filter(array_map('trim', explode(',', $tags)));
                $permalink   = get_permalink();
                $is_first    = ($slide_index === 0);
        ?>
        <article class="carousel__slide<?php echo $is_first ? ' is-active' : ''; ?>" data-index="<?php echo $slide_index; ?>">
          <svg class="carousel__sweep" aria-hidden="true">
            <path class="carousel__sweep-cw"/>
            <path class="carousel__sweep-ccw"/>
          </svg>
          <a href="<?php echo esc_url($permalink); ?>" class="carousel__frame">
            <div class="carousel__media"
                 style="background-image:url('<?php echo esc_url($img_url); ?>')"
                 data-mobile-bg="<?php echo esc_url($img_mob_url); ?>"></div>
            <div class="carousel__media-fade"></div>
            <footer class="carousel__info">
              <div class="carousel__info-top">
                <?php if (!empty($tag_list)) : ?>
                  <span class="carousel__tag"><?php echo esc_html(implode(' · ', $tag_list)); ?></span>
                <?php endif; ?>
              </div>
              <h2 class="carousel__title"><?php the_title(); ?></h2>
              <?php if ($excerpt) : ?>
                <p class="carousel__standfirst"><?php echo esc_html($excerpt); ?></p>
              <?php endif; ?>
            </footer>
          </a>
        </article>
        <?php
                $slide_index++;
            endwhile;
            wp_reset_postdata();
        endif;
        ?>

      </div><!-- /track -->
    </div><!-- /viewport -->
  </section>


  <!-- ── Case Studies ──────────────────────────────── -->
  <section class="case-studies" id="case-studies" aria-labelledby="cs-heading">
    <div class="case-studies__header">
      <h2 class="section-title" id="cs-heading">Case Studies</h2>
      <a href="<?php echo esc_url(get_post_type_archive_link('case_study')); ?>" class="projects__view-all__link" style="margin:0">
        <span class="projects__view-all__title">View All</span>
        <span class="projects__view-all__arrow" aria-hidden="true">→</span>
      </a>
    </div>

    <div class="case-studies__grid">
      <?php
      $card_index = 0;
      if ($featured_query->have_posts()) :
          while ($featured_query->have_posts()) : $featured_query->the_post();
              $img_id   = get_field('homepage_image');
              $img_url  = $img_id ? wp_get_attachment_image_url($img_id, 'cs-card') : '';
              $tags     = get_field('tags') ?: '';
              $year     = get_field('year') ?: '';
              $tag_list = array_filter(array_map('trim', explode(',', $tags)));
              $overline = $tag_list ? esc_html(reset($tag_list)) : '';
              if ($year) $overline .= ($overline ? ' · ' : '') . esc_html($year);
              $excerpt  = get_field('homepage_excerpt') ?: '';
              $is_wide  = ($card_index === 0);
      ?>
      <a href="<?php the_permalink(); ?>" class="case-card<?php echo $is_wide ? ' case-card--wide' : ''; ?>"
         <?php if ($img_url) : ?>style="--card-bg:url('<?php echo esc_url($img_url); ?>')"<?php endif; ?>>
        <?php if ($img_url) : ?>
          <div class="case-card__media" style="background-image:url('<?php echo esc_url($img_url); ?>')"></div>
        <?php endif; ?>
        <div class="case-card__content">
          <?php if ($overline) : ?>
            <p class="case-card__overline"><?php echo $overline; ?></p>
          <?php endif; ?>
          <h3 class="case-card__title"><?php the_title(); ?></h3>
          <?php if ($excerpt) : ?>
            <p class="case-card__meta"><?php echo esc_html($excerpt); ?></p>
          <?php endif; ?>
        </div>
      </a>
      <?php
              $card_index++;
          endwhile;
          wp_reset_postdata();
      endif;
      ?>
    </div>
  </section>


  <!-- ── More Projects (showcase list) ───────── -->
  <?php if ($more_query->have_posts()) : ?>
  <section class="projects" aria-label="More projects">
    <div class="projects__header">
      <h2 class="section-title">More Work</h2>
    </div>
    <div class="projects__showcase">
      <div class="projects__preview-wrap" id="js-proj-preview" aria-hidden="true">
        <div class="projects__preview-img" id="js-proj-preview-img"></div>
      </div>

      <ol class="projects__list">
        <?php
        $list_num = 1;
        while ($more_query->have_posts()) : $more_query->the_post();
            $img_id   = get_field('homepage_image');
            $img_url  = $img_id ? wp_get_attachment_image_url($img_id, 'cs-thumb') : '';
            $tags     = get_field('tags') ?: '';
            $tag_list = array_filter(array_map('trim', explode(',', $tags)));
            $type_tag = $tag_list ? reset($tag_list) : '';
        ?>
        <li class="project-item">
          <a href="<?php the_permalink(); ?>" class="project-item__link"
             <?php if ($img_url) : ?>data-preview-bg="url('<?php echo esc_url($img_url); ?>')"<?php endif; ?>>
            <span class="project-item__num"><?php echo str_pad($list_num, 2, '0', STR_PAD_LEFT); ?></span>
            <span class="project-item__title"><?php the_title(); ?></span>
            <?php if ($type_tag) : ?>
              <span class="project-item__type"><?php echo esc_html($type_tag); ?></span>
            <?php endif; ?>
          </a>
        </li>
        <?php
            $list_num++;
        endwhile;
        wp_reset_postdata();
        ?>
      </ol>

      <div class="projects__view-all">
        <a href="<?php echo esc_url(get_post_type_archive_link('case_study')); ?>" class="projects__view-all__link">
          <span class="projects__view-all__title">More</span>
          <span class="projects__view-all__arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  </section>
  <?php endif; ?>


  <!-- ── Stats ─────────────────────────────────────── -->
  <?php if (!empty($homepage_stats)) : ?>
  <div class="stats-bar" aria-label="Studio at a glance">
    <?php foreach ($homepage_stats as $stat) : ?>
    <div class="stat">
      <span class="stat__number"><?php echo esc_html($stat['stat_number']); ?></span>
      <span class="stat__label"><?php echo esc_html($stat['stat_label']); ?></span>
    </div>
    <?php endforeach; ?>
  </div>
  <?php else : ?>
  <!-- Fallback stats — update via WP Admin → Contact Settings → Homepage Stats -->
  <div class="stats-bar" aria-label="Studio at a glance">
    <div class="stat"><span class="stat__number">12+</span><span class="stat__label">Years Experience</span></div>
    <div class="stat"><span class="stat__number">200+</span><span class="stat__label">Projects Delivered</span></div>
    <div class="stat"><span class="stat__number">40+</span><span class="stat__label">Global Clients</span></div>
    <div class="stat"><span class="stat__number">8</span><span class="stat__label">Industry Awards</span></div>
  </div>
  <?php endif; ?>


  <!-- ── Contact ────────────────────────────────────── -->
  <section class="contact-section" id="contact" aria-label="Get in touch">
    <div class="contact-section__text">
      <span class="contact-section__label">Let's Work Together</span>
      <h2 class="contact-section__heading">Got a project in mind?</h2>
      <p class="contact-section__sub"><?php echo esc_html($contact_sub); ?></p>
    </div>
    <div class="contact-section__actions">
      <a href="mailto:<?php echo esc_attr($email); ?>" class="cta-pill">Send a Message</a>
      <a href="mailto:<?php echo esc_attr($email); ?>" class="contact-email"><?php echo esc_html($email); ?></a>
    </div>
  </section>

</main>

<?php get_footer(); ?>
