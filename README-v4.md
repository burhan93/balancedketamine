# Balanced Ketamine: Home page v4

Preview: open `index-v4.html` in a browser.

| File | Purpose |
|---|---|
| `index-v4.html` | Home page (reuses the v3 header/footer + `style-v3.css` design system) |
| `style-v4.css` | Additive styles: SEO/AEO components, media, sticky mobile CTA, 1920 to 320 breakpoints |
| `script-v4.js` | Menu, carousel, form validation + redirect, GA4/Meta events, click-to-load video |
| `images/*.webp` | Labelled PLACEHOLDER images, all to be replaced (same file names and sizes) |
| `robots.txt`, `sitemap.xml` | Home page disallowed and excluded, as specified in the brief |

## Before going live, search the code for `TODO(` and `[`
- **TODO(NAP)**: address, ZIP, hours, phone `(816) 555-0123` (fake 555 number), WhatsApp number, geo coordinates, social `sameAs` URLs
- **Doctor / E-E-A-T**: `Dr. [Full Name], MD`, specialty, credentials, award badge
- **TODO(PRICING)**: session and series prices
- **TODO(DOMAIN)**: `https://www.balancedketamine.com` (canonical, OG, schema, robots, sitemap)
- **TODO(FORM)**: `data-endpoint` on the form (HIPAA-compliant handler)
- **Tracking**: uncomment the GA4 / Meta Pixel snippets in `<head>` and add the IDs
- **Videos**: `data-video-id` attributes (YouTube IDs)
- **Reviews**: paste verified reviews only, plus the real rating and count
- **Medical review**: have the medical director approve all clinical copy

## Note on robots.txt
Disallowing the home page stops search engines from crawling it, so it can't rank
and its schema won't be read. This was done as instructed. Remove `Disallow: /$`
and `Disallow: /index-v4.html` when the page should be indexed.
