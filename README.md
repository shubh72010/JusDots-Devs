# JusDots

<p align="left">
  <img src="JusDots.png" alt="JusDots logo" width="96" />
</p>

JusDots is the public site for a small Android app lineup focused on privacy, utility, and lightweight design.
It presents each app as a real product, not a repo placeholder, with dedicated pages, release feeds, and GitHub-backed stats.

## Apps

| App | Purpose | Repo |
| --- | --- | --- |
| JusBrowse | Privacy-first browser built on GeckoView | `shubh72010/JusBrowse-GeckoView` |
| JusChatz | Anonymous encrypted chat | `R37BGXRPG/JusChatz_by_JusDots` |
| DotNotes | Privacy-focused notes and checklists | `shubh72010/DotNotes` |
| Origin Camera | Minimal camera app | `rKyzen/Origin-Camera` |
| Origin Launcher | Lightweight home screen launcher | `rKyzen/Origin-Launcher` |
| JusPlayer | Music player, published under the `Greeny-Goblins` codename | `shubh72010/Greeny-Goblins` |

## What This Site Is

JusDots is a product portal:

- homepage overview for the full lineup
- dedicated pages for each app
- aggregated releases across all repos
- technical docs and research pages
- GitHub-backed metrics with local caching and expiration

## Site Map

- `index.html` - homepage and product overview
- `browse.html` - JusBrowse page
- `chat.html` - JusChatz page
- `notes.html` - DotNotes page
- `releases.html` - releases browser
- `docs.html` - technical documentation
- `research.html` - engineering notes

## Visual Direction

The site uses a dark editorial presentation with rounded cards, soft elevation, and restrained motion.
The goal is to feel intentional and product-led, not like a stock landing page.

## Runtime Data

The site loads repo data from GitHub at runtime and caches it locally with expiration.

- stars
- latest release tag
- APK size
- release lists

If GitHub is unavailable, the cached data is reused until it expires.

## Local Preview

Open `index.html` directly in a browser, or serve the directory with any static server.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- GitHub Releases API

## Notes

- This repository is the site itself, not a starter template.
- The documentation pages are intentionally product-oriented and describe the shipped apps.
- Release metadata and counts are derived from the GitHub repos listed above.
