# Portal Educativo — Colegio Los Ilinizas

Rediseño completo del portal educativo de la **Unidad Educativa Particular Los Ilinizas** (https://ilinizas.edu.ec/).

## Problemas resueltos

### 1. Lentitud de carga (causa raíz)
El sitio original corría sobre **WordPress 6.8 + Elementor 3.28.4** con el tema Twenty Twenty-Two, lo que implica:

- Decenas de archivos JS/CSS de Elementor cargados en cada página
- jQuery y librerías de widgets innecesarios
- Google Fonts remoto (render-blocking)
- HTML inflado (~88 KB solo el home)

**Solución:** sitio 100% estático (HTML + CSS + JS vanilla, sin frameworks ni dependencias externas):

| Recurso | Antes | Ahora |
|---|---|---|
| CMS | WordPress + Elementor | HTML estático puro |
| JS | jQuery + Elementor (cientos de KB) | 1 archivo vanilla (~4 KB) |
| CSS | Múltiples hojas de tema/plugins | 1 hoja optimizada |
| Fuentes | Google Fonts remoto | Auto-hospedadas (woff2, 87 KB) |
| Peso página home | ~88 KB HTML + plugins | ~20 KB HTML |

Resultado: carga instantánea, sin peticiones bloqueantes a terceros.

### 2. Diseño desactualizado
El diseño nuevo toma como referencia portales de escuelas secundarias privadas de alto prestigio de EE. UU. y Reino Unido (Eton College, Phillips Exeter Academy, St. Paul's School):

- Tipografía editorial serif (**Playfair Display**) + sans moderna (**Inter**)
- Paleta sobria de élite: azul marino profundo, dorado y crema
- Hero a pantalla completa con silueta de los nevados Ilinizas (homenaje al nombre)
- Tarjetas de programas académicos, bandas de estadísticas animadas
- Navegación limpia con dropdown, footer rico en información
- Animaciones sutiles (scroll reveal, contadores), 100% accesibles (respetan `prefers-reduced-motion`)

### 3. Enlaces externos conservados
Todos los enlaces externos del sitio original se mantienen:

- **Preinscripción en línea:** https://ilinizas.runacode.com/public/preinscripcionesweb
- **Facebook:** https://www.facebook.com/profile.php?id=100044144316444
- **Instagram:** https://www.instagram.com/uelosilinizas/
- **YouTube:** https://www.youtube.com/channel/UCAbHQQJ72726z8gRxhGn6WA
- **WhatsApp:** https://wa.me/593983476998
- **Documentos PDF:** Acuerdo de Costos, Costos Adicionales (locales en `assets/docs/`) y el resto (Propuesta Pedagógica, Consentimientos DECE/Inspección, Contrato) enlazados al sitio actual hasta migrarlos.

## Estructura del proyecto

```
├── index.html                 # Página principal
├── quienes-somos.html         # Historia, misión, visión, valores
├── educacion-inicial.html     # Nivel: Educación Inicial
├── educacion-elemental.html   # Nivel: EGB Elemental
├── egb-media.html             # Nivel: EGB Media
├── egb-superior.html          # Nivel: EGB Superior / BGU
├── inscripciones.html         # Proceso de admisión + FAQ
├── contacto.html              # Formulario, WhatsApp, mapa
└── assets/
    ├── css/styles.css         # Hoja de estilos única
    ├── js/main.js             # JS vanilla (menú, reveal, contadores)
    ├── fonts/                 # Playfair Display + Inter (woff2)
    ├── img/                   # Logo, ilustraciones SVG, favicon
    └── docs/                  # PDFs institucionales (acuerdo, costos)
```

## Cómo ejecutar localmente

Cualquier servidor estático sirve el sitio. Ejemplos:

```bash
# Python
python -m http.server 8000

# Node
npx serve .

# PHP
php -S localhost:8000
```

Luego abre http://localhost:8000

### Ejecutar con HTTPS local (recomendado)

El navegador marca "No seguro" los sitios servidos por HTTP plano. Para ver el portal
con cifrado TLS local ya hay un certificado autofirmado en `.certs/localhost.pfx`
(válido para `localhost` y `127.0.0.1`, 1 año):

```bash
# Servidor HTTPS en el puerto 8443
node -e "const https=require('https'),fs=require('fs');const t={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.pdf':'application/pdf'};https.createServer({pfx:fs.readFileSync('.certs/localhost.pfx'),passphrase:'ilinizas2025'},(req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const f=require('path').join(process.cwd(),p);fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':t[require('path').extname(f)]||'application/octet-stream'});res.end(d);});}).listen(8443,()=>console.log('HTTPS en https://localhost:8443'));"
```

Luego abre **https://localhost:8443** y acepta la advertencia del certificado autofirmado
(botón "Avanzado → Continuar"). Para que el navegador confíe sin advertencia, instala
`.certs/localhost.crt` en el almacén "Entidades de certificación de raíz de confianza".

> Los certificados de `.certs/` son solo para desarrollo local y están excluidos de Git.

### HTTPS en producción

El sitio de producción (ilinizas.edu.ec) ya redirige HTTP → HTTPS (código 301) y su
puerto 443 está activo. Para garantizar un certificado válido y confiable en el hosting:

1. **Certificado Let's Encrypt** (gratuito): si el hosting es cPanel, usa la opción
   "SSL/TLS Status" → "Run AutoSSL", o `certbot --nginx`/`certbot --apache` si tienes
   acceso SSH.
2. **Forzar HTTPS** en `.htaccess` del hosting:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [L,R=301]
   ```
3. **HSTS** (opcional, una vez confirmado que HTTPS funciona estable):
   ```apache
   Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
   ```
4. Verifica con https://www.ssllabs.com/ssltest/ que el certificado tenga grado A/A+.

## Mejoras futuras sugeridas

1. **Conectar el formulario de contacto** a un backend (Formspree, email JS, o endpoint propio).
2. **Migrar los PDFs restantes** (Propuesta Pedagógica, Consentimientos, Contrato) a `assets/docs/`.
3. Sustituir las ilustraciones SVG por fotografías reales del campus para mayor calidez.
4. Añadir noticias/eventos del calendario escolar.
5. Desplegar detrás de un CDN y habilitar compresión gzip/brotli para máxima velocidad.
