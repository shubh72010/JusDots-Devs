# JusDots

JusDots is a static developer portal for a small Android app lineup focused on privacy, productivity, and lightweight utility.

## Apps

- `JusBrowse` - privacy-first Android browser built on GeckoView
- `JusChatz` - anonymous encrypted chat
- `DotNotes` - privacy-focused notes app
- `Origin Camera` - minimal camera app
- `Origin Launcher` - lightweight home screen launcher
- `JusPlayer` - music player, published under the `Greeny-Goblins` codename

## Site Structure

- `index.html` - homepage and app overview
- `browse.html` - JusBrowse dedicated page
- `chat.html` - JusChatz dedicated page
- `notes.html` - DotNotes dedicated page
- `releases.html` - aggregated releases feed
- `docs.html` - technical documentation
- `research.html` - research notes

## Assets

- `css/styles.css` - global styling
- `js/main.js` - navigation, search, and GitHub release loading
- `assets/` - screenshots and supporting images

## Local Preview

This project is static HTML, CSS, and JavaScript. Open `index.html` directly in a browser or serve the directory with any static server.

Example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- Release metadata is fetched from GitHub at runtime and cached locally with expiration.
- The homepage and dedicated app pages reuse the same GitHub release data.
- If you want the docs pages updated for the expanded app lineup, that content is still in progress.
