# Chaulas Wale Hakim Ji store

The website for Chaulas Wale Hakim Ji, a Swastha Ayurveda Pvt. Ltd. brand.
Plain HTML, CSS and JavaScript. There is nothing to install or build.

## Files

    index.html            The page that loads everything
    assets/styles.css     All styling
    assets/data.js        All content: products, prices, gift boxes, blog, timeline, FAQs, policies
    assets/app.js         Pages, bag, search, gallery, 3D viewer controls, checkout demo
    assets/viewer3d.js    3D models and renderer
    assets/fonts/         Jost typeface (open licence), hosted with the site
    media/                Logo and product images

## Host it on GitHub Pages

1. Put these files in the root of the repository (index.html must sit at the top level).
2. Commit and push to the `main` branch.
3. On GitHub: Settings, Pages, Source "Deploy from a branch", Branch `main`, folder `/ (root)`, Save.
4. After about a minute the site is at https://tauseefkhan095-gif.github.io/cwhj/

Leave Custom domain empty unless you own a domain and have set up its DNS.

## See it on your computer

Open `index.html` in a browser.

## Change content

Edit `assets/data.js`. Images go in `media/`.

The Our story timeline contains placeholder entries (marked `sample: true`). Replace them with
the family's real dates and events, and remove `sample: true` from each one you confirm.

## What is still a demo

- Prices are demonstration values.
- Checkout takes no payment and places no order. The bag is kept in the browser only.
- Ingredients, directions, licences and reviews are marked as pending until real details are supplied.
- The newsletter and contact forms do not send anything.
- The page asks search engines not to list it (`noindex` in index.html). Remove that line at launch.
