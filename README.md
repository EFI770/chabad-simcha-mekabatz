# סיפורים לבית חב״ד

Static Hebrew RTL story library. Public URL: https://efi770.github.io/chabad-simcha-mekabatz/

31 source-linked entries across 15 themes. Search, categories, reading dialog, browser-local favorites, copy with attribution/source, and WhatsApp story/source links. No account, backend, paid dependency or subscription. Existing approved Cloudflare analytics preserved unchanged.

## Content
`catalog.json` is the canonical content; `catalog-data.js` is its generated browser bundle so initial load does not depend on asynchronous JSON fetch. Every entry includes kind, source, source_url and an independently written text. Chabad article summaries are deliberately short; full original stories are linked. See research/SOURCES.md.

## Preservation
Previous index + all 40 prior records preserved in archive/2026-11-09/. Original stories.json, stories-extra.json and app/ remain unchanged. Git history provides rollback.

## Build
No build framework. Keep catalog.json and catalog-data.js in sync. WhatsApp canonical links are precomputed; they send a story/source link, never send a message automatically. Full copy text includes attribution and source but excludes the editorial reflection. Favorites remain on the current browser only.
