import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const files = {
  html: await readFile(new URL("../public/index.html", import.meta.url), "utf8"),
  css: await readFile(new URL("../public/styles.css", import.meta.url), "utf8"),
  js: await readFile(new URL("../public/app.js", import.meta.url), "utf8"),
  robots: await readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
  sitemap: await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
  og: await readFile(new URL("../public/og.png", import.meta.url)),
  worker: await readFile(new URL("../src/index.js", import.meta.url), "utf8")
};

const checks = [
  ["24 tool cards", (files.html.match(/class="tool-card"/g) || []).length === 24],
  ["6 tool groups", (files.html.match(/class="tool-group"/g) || []).length === 6],
  ["no dead placeholder links", !/href=["']#["']/.test(files.html)],
  ["no public GitHub links", !files.html.includes("github.com")],
  ["external links are isolated", !/<a(?=[^>]*target="_blank")(?![^>]*rel="noopener noreferrer")[^>]*>/i.test(files.html)],
  ["canonical custom domain", files.html.includes('<link rel="canonical" href="https://tool.tools365.it.com/">')],
  ["bilingual content", files.html.includes('data-en=') && files.html.includes('data-zh=')],
  ["keyboard search shortcut", files.js.includes('event.key === "/"')],
  ["English is the first-visit default", files.js.includes('? storedLanguage : "en"')],
  ["reduced-motion support", files.css.includes("prefers-reduced-motion")],
  ["sitemap uses canonical domain", files.sitemap.includes("https://tool.tools365.it.com/")],
  ["robots points to sitemap", files.robots.includes("https://tool.tools365.it.com/sitemap.xml")],
  ["social preview image exists", files.og.length > 100_000],
  ["worker adds security headers", files.worker.includes("X-Content-Type-Options")]
];

const structuredData = files.html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
const structuredDataHash = structuredData
  ? `sha256-${createHash("sha256").update(structuredData).digest("base64")}`
  : "missing";
checks.push(["content policy allows structured data", files.worker.includes(structuredDataHash)]);

let failed = 0;
for (const [name, passed] of checks) {
  console.log(`${passed ? "✓" : "✗"} ${name}`);
  if (!passed) failed += 1;
}

if (failed) {
  console.error(`\n${failed} site check${failed === 1 ? "" : "s"} failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} site checks passed.`);
