const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('all local page and asset references resolve', () => {
  assert.equal(htmlFiles.length, 10);
  for (const file of htmlFiles) {
    const html = read(file);
    const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
    for (const reference of references) {
      if (/^(?:https?:|mailto:|tel:|#|data:)/.test(reference)) continue;
      const localPath = decodeURIComponent(reference.split(/[?#]/)[0]);
      assert.ok(fs.existsSync(path.join(root, localPath)), `${file}: missing ${reference}`);
    }
  }
});

test('telephone links use valid international numbers', () => {
  for (const file of htmlFiles) {
    const links = [...read(file).matchAll(/href="(tel:[^"]+)"/g)].map((match) => match[1]);
    assert.ok(links.length > 0, `${file}: expected at least one telephone link`);
    for (const link of links) assert.match(link, /^tel:\+593\d{9}$/, `${file}: invalid ${link}`);
  }
});

test('navigation and footer links are consistent and not duplicated', () => {
  for (const file of htmlFiles) {
    const html = read(file);
    const nav = html.match(/<ul class="nav__list">([\s\S]*?)<\/ul>/)?.[1] || '';
    assert.match(nav, /href="lista-de-utiles\.html"/, `${file}: utility-list page missing from main nav`);

    const footer = html.match(/<footer class="footer">([\s\S]*?)<\/footer>/)?.[1] || '';
    const links = [...footer.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
      .map((match) => `${match[1]}|${match[2].replace(/<[^>]+>/g, '').trim()}`);
    assert.equal(new Set(links).size, links.length, `${file}: duplicated footer link`);
  }
});

test('EGB Superior and BGU have separate pages and navigation entries', () => {
  assert.ok(htmlFiles.includes('egb-superior.html'));
  assert.ok(htmlFiles.includes('bachillerato.html'));

  for (const file of htmlFiles) {
    const html = read(file);
    const dropdown = html.match(/<div class="dropdown"[\s\S]*?<\/div>/)?.[0] || '';
    assert.match(dropdown, /href="egb-superior\.html"[^>]*>EGB Superior/);
    assert.match(dropdown, /href="bachillerato\.html"[^>]*>Bachillerato/);
    assert.doesNotMatch(dropdown, /Superior\s*\/\s*BGU/);
  }

  const superior = read('egb-superior.html');
  const bgu = read('bachillerato.html');
  assert.match(superior, /<h1>EGB Superior<\/h1>/);
  assert.match(superior, /8º(?:–|-)10º de EGB/);
  assert.doesNotMatch(superior, /<title>[^<]*(?:\/|BGU)[^<]*<\/title>/);
  assert.match(bgu, /<h1>Bachillerato(?: General Unificado)?<\/h1>/);
  assert.match(bgu, /1º(?:–|-)3º BGU/);
  assert.doesNotMatch(bgu, /<title>[^<]*EGB Superior[^<]*<\/title>/);
});

test('interactive controls expose synchronized accessible state', () => {
  const script = read('assets/js/main.js');
  assert.match(script, /aria-label.*Cerrar menú de navegación/);
  assert.match(script, /dropdown.*aria-expanded|aria-expanded.*dropdown/s);
  assert.match(script, /panel\.setAttribute\('aria-hidden'/);
  assert.match(script, /aria-controls/);
});

test('content remains useful without JavaScript', () => {
  const home = read('index.html');
  for (const target of [...home.matchAll(/data-count="([^"]+)"[^>]*>([^<]+)</g)]) {
    assert.equal(target[2].trim(), target[1], `counter ${target[1]} lacks a useful fallback`);
  }
  const css = read('assets/css/styles.css');
  assert.match(css, /\.js\s+\.accordion__panel\s*\{/);
});

test('contact form validates and prepares a real email handoff', () => {
  const html = read('contacto.html');
  const script = read('assets/js/main.js');
  assert.doesNotMatch(html, /<form[^>]+action="#"/);
  assert.doesNotMatch(html, /¡Mensaje enviado!/);
  assert.match(html, /aria-live="polite"/);
  assert.match(script, /checkValidity\(\)/);
  assert.match(script, /mailto:/);
});
