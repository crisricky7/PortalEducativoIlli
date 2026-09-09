# Copilot instructions for Portal Educativo Los Ilinizas

## Project shape

- This is a multi-page static site for Colegio Los Ilinizas. There is no framework, package manifest, build step, backend, or external runtime dependency.
- Each page is a standalone HTML document at the repository root. The pages share the same header, navigation, footer, metadata pattern, and `assets/css/styles.css` stylesheet.
- `assets/js/main.js` is the only shared script. It handles the sticky header, responsive mobile menu, scroll reveal animations, statistic counters, FAQ accordion, dynamic footer year, back-to-top control, and the contact-form demo.
- `assets/fonts/` contains the self-hosted Inter and Playfair Display fonts. Keep the site free of third-party font and framework requests unless the requirement explicitly changes.
- `assets/img/` contains the logo, favicon, and decorative SVG artwork. `assets/docs/` contains institutional PDFs and admission syllabi; document links are part of the public site content.

## Commands

There are no repository-defined build, test, or lint commands. Use a static server for local verification:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`. Node and PHP alternatives documented in `README.md` are `npx serve .` and `php -S localhost:8000`.

To check one page, start the server and visit that page directly, for example `http://localhost:8000/contacto.html`; verify its navigation, assets, interactive behavior, and links in the browser. For local HTTPS, follow the existing instructions in `README.md` rather than adding another server implementation.

There is no compilation or bundling step. The GitHub Actions workflow at `.github/workflows/pages.yml` uploads the repository root as the Pages artifact and deploys on pushes to `main` (or manually through `workflow_dispatch`).

## Architecture and editing conventions

- Preserve root-relative-to-site paths such as `assets/css/styles.css`, `assets/js/main.js`, `assets/img/...`, and `assets/docs/...`. GitHub Pages serves the site under `/PortalEducativoIlli/`, so changing these to host-root paths can break production.
- When adding or editing a page, follow the existing document structure: Spanish `lang`, responsive metadata, SEO/Open Graph metadata, favicon and local font preloads, shared stylesheet, skip link, shared header/navigation, `<main id="main">`, shared footer, and deferred `main.js`.
- Keep the shared header and footer consistent across every page. Update the active navigation link with both `.is-active` and `aria-current="page"` on the current page; update the academic dropdown and footer links when pages are added or renamed.
- Use the existing CSS design system instead of introducing page-specific styling systems. Reuse the custom properties, `.container`, `.section`, button variants, card/grid utilities, `.reveal` classes, and responsive breakpoints in `styles.css`.
- Use semantic HTML and the established accessibility patterns: a skip link, meaningful landmarks, visible focus styles, `aria-label`/`aria-hidden` for icon-only controls, `aria-expanded` for expandable controls, and `rel="noopener noreferrer"` on external links opened in a new tab.
- Add scroll-animated content with `.reveal`; the shared script supplies the fallback behavior and `styles.css` disables motion under `prefers-reduced-motion`.
- Use `data-count` only for numeric statistics that should animate when visible. Use the existing `.accordion__item`, `.accordion__trigger`, `.accordion__panel`, and `.accordion__panel-inner` structure for FAQ sections.
- Keep JavaScript vanilla and defensive: `main.js` is loaded on every page, so optional features must tolerate their target elements being absent. Do not add framework-specific initialization or assume a page-specific element always exists.
- The contact form is currently a front-end demo. `main.js` prevents submission and displays a local success state; do not describe it as sending email or add a success-shaped backend fallback without implementing a real service.
- Keep content and links aligned with the institutional source described in `README.md`, including the 2026–2027 documents, admission links, Academium portal, and official social/contact links.
- Preserve the existing Spanish-facing copy and visual language: Playfair Display for headings, Inter for body/UI text, and the navy/gold/cream token palette in `styles.css`.

## Deployment-sensitive files

- `.github/workflows/pages.yml` is the production deployment path; changes to its artifact path, permissions, branch trigger, or Pages actions affect publishing.
- `.certs/` contains local development certificates and is excluded from Git. Do not add certificates or other local-only runtime files to the published site.
