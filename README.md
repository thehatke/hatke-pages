# hatke-pages

Storefront page scripts for thehatke.com.

These are **public, client-side** scripts loaded by Shopify pages
(phone cases hub, brand pages, accessories-by-model, bundle builders,
category hubs). They contain no secrets — everything here is already
visible to anyone viewing the page source.

## Why this repo exists

These scripts used to live in `thehatke/hatke-bot`. Every edit triggered a
Railway rebuild and restarted the live website chatbot. Moving them here
separates the two: page changes no longer touch the bot.

## How they reach the storefront

Served directly from GitHub via jsDelivr:

```
https://cdn.jsdelivr.net/gh/thehatke/hatke-pages@main/models-page.js
```

Pinned to a commit for cache-busting when needed:

```
https://cdn.jsdelivr.net/gh/thehatke/hatke-pages@<commit-sha>/models-page.js
```

The repo must stay **public** for jsDelivr to serve it.

## Files

| File | Used by |
| --- | --- |
| `models-page.js` | `/pages/phonecases`, the 12 brand pages, `/pages/lens-screenprotectors` |
| `launch-dates.js` | Launch-date table for New badges (loaded alongside `models-page.js`) |
| `buy-bundle.js` | `/pages/buy-2-cases`, `/pages/buy-3-cases`, `/pages/buy-4-cases` |
| `hub-page.js` | `/pages/earpods-cover` and other category hubs |

## Config

Each page sets `window.HM_CONFIG` (or `B3_CONFIG` / `HUB_CONFIG`) before
loading the script. See the header comment in each file.
