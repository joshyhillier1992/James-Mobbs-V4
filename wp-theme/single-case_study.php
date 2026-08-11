<?php
defined('ABSPATH') || exit;

$email    = function_exists('get_field') ? get_field('email_address', 'option') : 'hello@jamesmobbs.com';
$email    = $email ?: 'hello@jamesmobbs.com';

$tags     = get_field('tags') ?: '';
$client   = get_field('client') ?: '';
$year     = get_field('year') ?: '';
$role     = get_field('role') ?: '';
$duration = get_field('duration') ?: '';
$tag_list = array_filter(array_map('trim', explode(',', $tags)));

$stats   = get_field('stats')   ?: [];
$credits = get_field('credits') ?: [];

$related_query = new WP_Query([
    'post_type'      => 'case_study',
    'posts_per_page' => 3,
    'post__not_in'   => [get_the_ID()],
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
    'no_found_rows'  => true,
]);

// All flexible content blocks as a flat array so we can buffer consecutive images
$blocks = get_field('case_studies') ?: [];

get_header();
?>
<main class="project-page">

  <!-- ── BLOCK 1 · HERO ─────────────────────────────── -->
  <section class="block block--hero">
    <?php if (!empty($tag_list)) : ?>
    <div class="project-hero__tags">
      <?php foreach ($tag_list as $i => $tag) : ?>
        <span class="project-hero__tag<?php echo $i === 0 ? ' project-hero__tag--primary' : ''; ?>">
          <?php echo esc_html($tag); ?>
        </span>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <h1 class="project-hero__title"><?php the_title(); ?></h1>

    <?php if ($client || $year || $role || $duration) : ?>
    <div class="project-hero__meta">
      <?php if ($client) : ?>
        <span class="project-hero__meta-item"><strong>Client</strong> <?php echo esc_html($client); ?></span>
        <?php if ($year || $role || $duration) : ?><span class="project-hero__meta-sep"></span><?php endif; ?>
      <?php endif; ?>
      <?php if ($year) : ?>
        <span class="project-hero__meta-item"><strong>Year</strong> <?php echo esc_html($year); ?></span>
        <?php if ($role || $duration) : ?><span class="project-hero__meta-sep"></span><?php endif; ?>
      <?php endif; ?>
      <?php if ($role) : ?>
        <span class="project-hero__meta-item"><strong>Role</strong> <?php echo esc_html($role); ?></span>
        <?php if ($duration) : ?><span class="project-hero__meta-sep"></span><?php endif; ?>
      <?php endif; ?>
      <?php if ($duration) : ?>
        <span class="project-hero__meta-item"><strong>Duration</strong> <?php echo esc_html($duration); ?></span>
      <?php endif; ?>
    </div>
    <?php endif; ?>
  </section>


  <!-- ── FLEXIBLE CONTENT BLOCKS ────────────────────── -->
  <?php
  $img_buf = [];

  // Flush buffered consecutive images.
  // Exactly 5 → designed masonry grid. Any other count → individual full-width blocks.
  // Runs > 5 are split: first 5 as masonry, remainder recurse.
  $flush_images = function (array $imgs) use (&$flush_images) {
      if (empty($imgs)) return;
      $n = count($imgs);
      if ($n > 5) {
          $flush_images(array_slice($imgs, 0, 5));
          $flush_images(array_slice($imgs, 5));
          return;
      }
      if ($n === 5) {
          echo '<section class="block block--gallery"><div class="masonry-grid">';
          foreach ($imgs as $url) {
              echo '<div class="masonry-item" style="background-image:url(\'' . esc_url($url) . '\')"></div>';
          }
          echo '</div></section>';
      } else {
          foreach ($imgs as $url) {
              echo '<section class="block block--image"><img src="' . esc_url($url) . '" alt="" class="block__img" loading="lazy"></section>';
          }
      }
  };

  foreach ($blocks as $block) :
      $layout = $block['acf_fc_layout'] ?? '';

      // Accumulate consecutive image blocks — don't render them yet
      if ($layout === 'image') :
          $img_id  = $block['image'] ?? 0;
          $img_url = $img_id ? wp_get_attachment_image_url($img_id, 'cs-hero') : '';
          if ($img_url) $img_buf[] = $img_url;
          continue;
      endif;

      // Flush any buffered images before rendering the next non-image block
      if (!empty($img_buf)) { $flush_images($img_buf); $img_buf = []; }

      if ($layout === 'hero') :
          $img_id     = $block['hero_image']        ?? 0;
          $img_mob_id = $block['hero_image_mobile'] ?? 0;
          $img_url    = $img_id     ? wp_get_attachment_image_url($img_id, 'cs-hero')     : '';
          $mob_url    = $img_mob_id ? wp_get_attachment_image_url($img_mob_id, 'cs-hero') : $img_url;
      ?>
      <!-- Block · Hero Image -->
      <section class="block block--carousel">
        <div class="hero-carousel" aria-label="Project images" data-no-autoplay>
          <div class="carousel__viewport">
            <div class="carousel__track" id="js-track">
              <?php if ($img_url) : ?>
              <article class="carousel__slide is-active" data-index="0">
                <svg class="carousel__sweep" aria-hidden="true"><path class="carousel__sweep-cw"/><path class="carousel__sweep-ccw"/></svg>
                <div class="carousel__frame">
                  <div class="carousel__media"
                       style="background-image:url('<?php echo esc_url($img_url); ?>')"
                       data-mobile-bg="<?php echo esc_url($mob_url); ?>"></div>
                  <div class="carousel__media-fade"></div>
                </div>
              </article>
              <?php endif; ?>
            </div>
          </div>
        </div>
      </section>

      <?php elseif ($layout === 'carousel') :
          $carousel_images = $block['carousel_images'] ?: [];
      ?>
      <!-- Block · Image Carousel -->
      <section class="block block--carousel">
        <div class="hero-carousel" aria-label="Project images" data-no-autoplay>
          <div class="carousel__viewport">
            <div class="carousel__track" id="js-track">
              <?php foreach ($carousel_images as $ci => $row) :
                $ci_id  = $row['image'] ?? 0;
                $ci_url = $ci_id ? wp_get_attachment_image_url($ci_id, 'cs-hero') : '';
                if (!$ci_url) continue;
              ?>
              <article class="carousel__slide<?php echo $ci === 0 ? ' is-active' : ''; ?>" data-index="<?php echo $ci; ?>">
                <svg class="carousel__sweep" aria-hidden="true"><path class="carousel__sweep-cw"/><path class="carousel__sweep-ccw"/></svg>
                <div class="carousel__frame">
                  <div class="carousel__media" style="background-image:url('<?php echo esc_url($ci_url); ?>')"></div>
                  <div class="carousel__media-fade"></div>
                </div>
              </article>
              <?php endforeach; ?>
            </div>
          </div>
        </div>
      </section>

      <?php elseif ($layout === 'standfirst') :
          $heading = $block['block_heading'] ?? '';
          $body    = $block['standfirst']    ?? '';
      ?>
      <!-- Block · Text / Prose -->
      <section class="block block--text">
        <?php if ($heading) : ?><h2 class="block__heading"><?php echo esc_html($heading); ?></h2><?php endif; ?>
        <?php if ($body)    : ?><div class="block__body"><?php echo wp_kses_post($body); ?></div><?php endif; ?>
      </section>

      <?php elseif ($layout === 'text_and_image') :
          $heading  = $block['split_heading']  ?? '';
          $copy     = $block['copy']           ?? '';
          $img_id   = $block['image']          ?? 0;
          $img_url  = $img_id ? wp_get_attachment_image_url($img_id, 'cs-hero') : '';
          $reversed = $block['reverse_layout'] ?? false;
      ?>
      <!-- Block · Split 50/50 -->
      <section class="block block--split<?php echo $reversed ? ' is-reversed' : ''; ?>">
        <?php if ($img_url) : ?>
          <div class="split__media" style="background-image:url('<?php echo esc_url($img_url); ?>')"></div>
        <?php endif; ?>
        <div class="split__content">
          <?php if ($heading) : ?><h2 class="split__heading"><?php echo esc_html($heading); ?></h2><?php endif; ?>
          <?php if ($copy)    : ?><div class="split__body"><?php echo wp_kses_post(wpautop($copy)); ?></div><?php endif; ?>
        </div>
      </section>

      <?php elseif ($layout === 'video') :
          $video_url     = $block['video_url']     ?? '';
          $video_img_id  = $block['video_image']   ?? 0;
          $video_img_url = $video_img_id ? wp_get_attachment_image_url($video_img_id, 'cs-hero') : '';
          $caption       = $block['video_caption'] ?? '';
          // Extract the embed iframe src so JS can build an autoplay URL on click
          $video_src = '';
          if ($video_url && preg_match('/src=["\']([^"\']+)["\']/', $video_url, $m)) {
              $video_src = $m[1];
          }
      ?>
      <!-- Block · Video -->
      <section class="block block--video">
        <?php if ($caption) : ?><p class="block__label"><?php echo esc_html($caption); ?></p><?php endif; ?>
        <div class="video-wrap">
          <?php if ($video_img_url) : ?>
          <div class="video-placeholder<?php echo $video_src ? ' js-video-thumb' : ''; ?>"
               <?php if ($video_src) : ?>data-src="<?php echo esc_attr($video_src); ?>"<?php endif; ?>
               style="background-image:url('<?php echo esc_url($video_img_url); ?>')">
            <?php if ($video_src) : ?>
            <button class="video-play-btn" aria-label="Play video">
              <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
                <path d="M0 0L22 13L0 26V0Z" fill="white"/>
              </svg>
            </button>
            <?php endif; ?>
          </div>
          <?php elseif ($video_url) : ?>
          <div class="video-embed"><?php echo $video_url; ?></div>
          <?php endif; ?>
        </div>
      </section>

      <?php elseif ($layout === 'testimonial') :
          $quote      = $block['testimonal'] ?? '';
          $credit     = $block['credit']     ?? '';
          $avatar_id  = $block['avatar']     ?? 0;
          $avatar_url = $avatar_id ? wp_get_attachment_image_url($avatar_id, 'thumbnail') : '';
          $initials   = '';
          if ($credit) {
              $words    = array_filter(explode(' ', $credit));
              $initials = strtoupper(substr($words[0] ?? '', 0, 1) . substr(end($words) ?? '', 0, 1));
          }
      ?>
      <!-- Block · Testimonial -->
      <section class="block block--testimonial">
        <blockquote>
          <?php if ($quote) : ?>
            <p class="testimonial__quote">"<?php echo esc_html($quote); ?>"</p>
          <?php endif; ?>
          <cite class="testimonial__cite">
            <?php if ($avatar_url) : ?>
              <img src="<?php echo esc_url($avatar_url); ?>" alt="" class="testimonial__avatar-img" />
            <?php else : ?>
              <div class="testimonial__avatar"><?php echo esc_html($initials); ?></div>
            <?php endif; ?>
            <div>
              <p class="testimonial__name"><?php echo esc_html($credit); ?></p>
            </div>
          </cite>
        </blockquote>
      </section>

      <?php elseif ($layout === 'gallery') :
          $gallery_images = $block['gallery_images'] ?: [];
      ?>
      <!-- Block · Masonry Gallery (manually added via ACF) -->
      <?php if (!empty($gallery_images)) : ?>
      <section class="block block--gallery">
        <div class="masonry-grid">
          <?php foreach ($gallery_images as $gi) :
            $gi_id  = $gi['image'] ?? 0;
            $gi_url = $gi_id ? wp_get_attachment_image_url($gi_id, 'cs-hero') : '';
            if (!$gi_url) continue;
          ?>
          <div class="masonry-item" style="background-image:url('<?php echo esc_url($gi_url); ?>')"></div>
          <?php endforeach; ?>
        </div>
      </section>
      <?php endif; ?>

      <?php endif; ?>

  <?php endforeach; ?>

  <?php // Flush any images that were still buffered at end of blocks
  if (!empty($img_buf)) { $flush_images($img_buf); } ?>


  <!-- ── BLOCK · PROJECT STATS ──────────────────────── -->
  <?php if (!empty($stats)) : ?>
  <div class="block block--stats-row">
    <?php foreach ($stats as $stat) : ?>
    <div class="stat">
      <span class="stat__number"><?php echo esc_html($stat['stat_number']); ?></span>
      <span class="stat__label"><?php echo esc_html($stat['stat_label']); ?></span>
    </div>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>


  <!-- ── BLOCK · CREDITS ────────────────────────────── -->
  <?php if (!empty($credits)) : ?>
  <section class="block block--credits">
    <p class="block__label">Credits</p>
    <div class="credits-grid">
      <?php foreach ($credits as $credit) : ?>
      <div class="credit-item">
        <span class="credit-item__role"><?php echo esc_html($credit['credit_role']); ?></span>
        <p class="credit-item__name"><?php echo esc_html($credit['credit_name']); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; ?>


  <!-- ── BLOCK · RELATED PROJECTS ──────────────────── -->
  <?php if ($related_query->have_posts()) : ?>
  <section class="block block--related">
    <p class="block__label">More Work</p>
    <div class="related-grid">
      <?php while ($related_query->have_posts()) : $related_query->the_post();
        $rel_img_id   = get_field('homepage_image');
        $rel_img_url  = $rel_img_id ? wp_get_attachment_image_url($rel_img_id, 'cs-card') : '';
        $rel_tags     = get_field('tags') ?: '';
        $rel_tag_list = array_filter(array_map('trim', explode(',', $rel_tags)));
        $rel_type     = $rel_tag_list ? reset($rel_tag_list) : '';
      ?>
      <a href="<?php the_permalink(); ?>" class="related-card">
        <?php if ($rel_img_url) : ?>
          <div class="related-card__thumb" style="background-image:url('<?php echo esc_url($rel_img_url); ?>')"></div>
        <?php endif; ?>
        <div class="related-card__body">
          <?php if ($rel_type) : ?><span class="related-card__type"><?php echo esc_html($rel_type); ?></span><?php endif; ?>
          <h3 class="related-card__title"><?php the_title(); ?></h3>
        </div>
      </a>
      <?php endwhile; wp_reset_postdata(); ?>
    </div>
  </section>
  <?php endif; ?>


  <!-- ── Project-level CTA ───────────────────────── -->
  <div class="project-cta" id="contact">
    <h2 class="project-cta__heading">Got a similar project?</h2>
    <p class="project-cta__sub">James is available for live events, broadcast and brand work worldwide.</p>
    <a href="mailto:<?php echo esc_attr($email); ?>" class="cta-pill">Get in Touch</a>
  </div>

</main>

<?php get_footer(); ?>
