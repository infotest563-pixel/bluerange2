<?php
/**
 * Plugin Name: Image URL to Local Path Filter
 * Description: Converts WordPress image URLs to /images/filename.ext for headless Next.js frontend
 * Version: 1.0.0
 * Author: Your Name
 * 
 * WARNING: This will break WordPress admin media library!
 * Only use if you're 100% sure you want this behavior.
 */

// ─── Config ──────────────────────────────────────────────────────────────────

// Your WordPress uploads URL (change this to match your site)
define('WP_UPLOADS_URL', 'https://dev-bluerange.pantheonsite.io/wp-content/uploads/');

// Only apply transformation to REST API requests (not admin)
// Set to false to apply everywhere (will break admin)
define('ONLY_TRANSFORM_REST_API', true);

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Check if current request is a REST API request
 */
function is_rest_api_request() {
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return true;
    }
    
    $rest_prefix = rest_get_url_prefix();
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    
    return strpos($request_uri, '/' . $rest_prefix . '/') !== false;
}

/**
 * Check if we should transform URLs (based on config)
 */
function should_transform_urls() {
    // Always transform in REST API
    if (is_rest_api_request()) {
        return true;
    }
    
    // If ONLY_TRANSFORM_REST_API is true, don't transform in admin
    if (ONLY_TRANSFORM_REST_API) {
        return !is_admin();
    }
    
    // Transform everywhere
    return true;
}

/**
 * Extract filename from WordPress upload URL
 * e.g. "https://example.com/wp-content/uploads/2023/09/hero.jpg" → "hero.jpg"
 */
function extract_filename_from_url($url) {
    if (empty($url)) {
        return '';
    }
    
    // Parse URL and get path
    $parsed = parse_url($url);
    if (!isset($parsed['path'])) {
        return '';
    }
    
    // Get filename from path
    $path_parts = pathinfo($parsed['path']);
    return $path_parts['basename'] ?? '';
}

/**
 * Convert WordPress upload URL to /images/filename.ext
 */
function convert_to_local_path($url) {
    if (empty($url) || !is_string($url)) {
        return $url;
    }
    
    // Only transform URLs that point to wp-content/uploads
    if (strpos($url, '/wp-content/uploads/') === false) {
        return $url;
    }
    
    // Don't transform if we shouldn't
    if (!should_transform_urls()) {
        return $url;
    }
    
    $filename = extract_filename_from_url($url);
    if (empty($filename)) {
        return $url;
    }
    
    // Sanitize filename (same as Next.js sync script)
    $filename = strtolower($filename);
    $filename = preg_replace('/[^a-z0-9._-]/', '-', $filename);
    
    return '/images/' . $filename;
}

// ─── WordPress Filters ───────────────────────────────────────────────────────

/**
 * Filter: wp_get_attachment_url
 * Transforms attachment URLs (media library)
 */
add_filter('wp_get_attachment_url', function($url) {
    return convert_to_local_path($url);
}, 999);

/**
 * Filter: wp_get_attachment_image_src
 * Transforms image src arrays [url, width, height, is_intermediate]
 */
add_filter('wp_get_attachment_image_src', function($image) {
    if (is_array($image) && isset($image[0])) {
        $image[0] = convert_to_local_path($image[0]);
    }
    return $image;
}, 999);

/**
 * Filter: wp_calculate_image_srcset
 * Transforms srcset URLs (responsive images)
 */
add_filter('wp_calculate_image_srcset', function($sources) {
    if (!is_array($sources)) {
        return $sources;
    }
    
    foreach ($sources as $width => $source) {
        if (isset($source['url'])) {
            $sources[$width]['url'] = convert_to_local_path($source['url']);
        }
    }
    
    return $sources;
}, 999);

/**
 * Filter: the_content
 * Transforms image URLs inside post content HTML
 */
add_filter('the_content', function($content) {
    if (!should_transform_urls()) {
        return $content;
    }
    
    // Replace all wp-content/uploads URLs in HTML
    $content = preg_replace_callback(
        '#https?://[^"\'\s]+/wp-content/uploads/[^"\'\s]+#',
        function($matches) {
            return convert_to_local_path($matches[0]);
        },
        $content
    );
    
    return $content;
}, 999);

/**
 * Filter: post_thumbnail_html
 * Transforms featured image HTML
 */
add_filter('post_thumbnail_html', function($html) {
    if (!should_transform_urls()) {
        return $html;
    }
    
    $html = preg_replace_callback(
        '#https?://[^"\'\s]+/wp-content/uploads/[^"\'\s]+#',
        function($matches) {
            return convert_to_local_path($matches[0]);
        },
        $html
    );
    
    return $html;
}, 999);

// ─── REST API Filters ────────────────────────────────────────────────────────

/**
 * Filter: rest_prepare_attachment
 * Transforms media URLs in REST API responses
 */
add_filter('rest_prepare_attachment', function($response, $post, $request) {
    $data = $response->get_data();
    
    // Transform source_url
    if (isset($data['source_url'])) {
        $data['source_url'] = convert_to_local_path($data['source_url']);
    }
    
    // Transform guid
    if (isset($data['guid']['rendered'])) {
        $data['guid']['rendered'] = convert_to_local_path($data['guid']['rendered']);
    }
    
    // Transform media_details sizes
    if (isset($data['media_details']['sizes']) && is_array($data['media_details']['sizes'])) {
        foreach ($data['media_details']['sizes'] as $size => $details) {
            if (isset($details['source_url'])) {
                $data['media_details']['sizes'][$size]['source_url'] = 
                    convert_to_local_path($details['source_url']);
            }
        }
    }
    
    $response->set_data($data);
    return $response;
}, 999, 3);

/**
 * Filter: rest_prepare_post
 * Transforms image URLs in post REST API responses
 */
add_filter('rest_prepare_post', 'transform_rest_post_images', 999, 3);
add_filter('rest_prepare_page', 'transform_rest_post_images', 999, 3);

function transform_rest_post_images($response, $post, $request) {
    $data = $response->get_data();
    
    // Transform content.rendered
    if (isset($data['content']['rendered'])) {
        $data['content']['rendered'] = preg_replace_callback(
            '#https?://[^"\'\s]+/wp-content/uploads/[^"\'\s]+#',
            function($matches) {
                return convert_to_local_path($matches[0]);
            },
            $data['content']['rendered']
        );
    }
    
    // Transform excerpt.rendered
    if (isset($data['excerpt']['rendered'])) {
        $data['excerpt']['rendered'] = preg_replace_callback(
            '#https?://[^"\'\s]+/wp-content/uploads/[^"\'\s]+#',
            function($matches) {
                return convert_to_local_path($matches[0]);
            },
            $data['excerpt']['rendered']
        );
    }
    
    // Transform featured_media URL in _embedded
    if (isset($data['_embedded']['wp:featuredmedia'][0]['source_url'])) {
        $data['_embedded']['wp:featuredmedia'][0]['source_url'] = 
            convert_to_local_path($data['_embedded']['wp:featuredmedia'][0]['source_url']);
    }
    
    $response->set_data($data);
    return $response;
}

/**
 * Filter: acf/format_value
 * Transforms ACF image field URLs
 */
add_filter('acf/format_value/type=image', function($value, $post_id, $field) {
    if (!should_transform_urls()) {
        return $value;
    }
    
    // ACF returns array with 'url' key
    if (is_array($value) && isset($value['url'])) {
        $value['url'] = convert_to_local_path($value['url']);
        
        // Also transform sizes
        if (isset($value['sizes']) && is_array($value['sizes'])) {
            foreach ($value['sizes'] as $size => $url) {
                $value['sizes'][$size] = convert_to_local_path($url);
            }
        }
    }
    
    // ACF can also return just the URL string
    if (is_string($value)) {
        $value = convert_to_local_path($value);
    }
    
    return $value;
}, 999, 3);

// ─── Admin Notice ────────────────────────────────────────────────────────────

/**
 * Show warning in WordPress admin
 */
add_action('admin_notices', function() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    $class = 'notice notice-warning';
    $message = '<strong>Image URL Filter Active:</strong> Image URLs are being transformed to /images/ paths. ';
    
    if (ONLY_TRANSFORM_REST_API) {
        $message .= 'This only affects REST API responses (admin should work normally).';
    } else {
        $message .= '<strong>WARNING:</strong> This affects the entire site including admin. Media library may not work correctly.';
    }
    
    printf('<div class="%1$s"><p>%2$s</p></div>', esc_attr($class), $message);
});
