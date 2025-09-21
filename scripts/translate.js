import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// note: we import the translate lib dynamically inside translateString to avoid
// loading it during dry-run/simulate runs (some modules may perform network
// actions on import in certain environments).

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../public/locales');

// CLI parsing supporting both --flag and --flag=value
const rawArgs = process.argv.slice(2);
function parseArg(flag, defaultValue) {
  const prefix = `--${flag}`;
  for (const a of rawArgs) {
    if (a === prefix) return 'true';
    if (a.startsWith(prefix + '=')) return a.substring(prefix.length + 1);
  }
  return defaultValue;
}

const langsArg = parseArg('langs', 'id,ja');
const targetLangs = langsArg.split(',').map(s => s.trim()).filter(Boolean);
const preserveTags = parseArg('preserve-tags', 'true') === 'true';
const dryRun = parseArg('dry-run', 'false') === 'true';
const overwrite = parseArg('overwrite', 'false') === 'true';
const skipKeysArg = parseArg('skip-keys', '');
const skipKeys = skipKeysArg ? skipKeysArg.split(',').map(s => s.trim()) : [];
const simulate = dryRun || parseArg('simulate', 'false') === 'true';
const useApi = parseArg('use-api', 'false') === 'true';

// sensible defaults for skipping user-generated content and large blobs
const defaultSkipPatterns = ['comments', 'comment', 'posts', 'post', 'body', 'content', 'username', 'avatar', 'image', 'caption'];
const skipPatterns = new Set([...defaultSkipPatterns, ...skipKeys]);

// Helpers: deep traversal, flatten/unflatten not necessary — we'll mutate in place.
function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

// Placeholder logic to preserve HTML/Markdown tokens
function extractPlaceholders(str) {
  const placeholders = [];
  // match HTML tags like <...> and markdown code fences/backticks and headings (# )
  const tagRegex = /<[^>]+>|`{3}[\s\S]*?`|`[^`]*`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^\)]+\)|(^|\n)#{1,6}\s.*(?=\n|$)/gm;
  let replaced = str.replace(tagRegex, (m) => {
    const idx = placeholders.length;
    placeholders.push(m);
    return `__PLH_${idx}__`;
  });
  return { text: replaced, placeholders };
}

function restorePlaceholders(str, placeholders) {
  return str.replace(/__PLH_(\d+)__/g, (_, i) => placeholders[Number(i)] || '');
}

async function translateString(text, from, to) {
  if (!text) return text;
  if (simulate || !useApi) {
    // don't call external API during dry-run/simulate or when useApi=false — return a visible stub
    return `[[${from}->${to}]] ${text}`;
  }

  // retry wrapper with exponential backoff; dynamically import module only when needed
  const maxRetries = 3;
  let attempt = 0;
  let translator;
  while (attempt <= maxRetries) {
    try {
      if (!translator) {
        const mod = await import('google-translate-api-browser');
        translator = mod.translate;
      }
      const { text: t } = await translator(text, { from, to });
      return t;
    } catch (err) {
      attempt++;
      const msg = err && err.message ? err.message : String(err);
      console.warn(`translate attempt ${attempt} failed: ${msg}`);
      if (attempt > maxRetries) {
        console.error('translate api error, giving up after retries:', msg);
        return text; // fallback
      }
      // backoff
      await new Promise(res => setTimeout(res, 500 * attempt));
    }
  }
  return text;
}

async function processValue(value, fromLang, toLang) {
  if (typeof value === 'string') {
    if (!value.trim()) return value;
    if (preserveTags) {
      const { text, placeholders } = extractPlaceholders(value);
      const translated = await translateString(text, fromLang, toLang);
      return restorePlaceholders(translated, placeholders);
    } else {
      return await translateString(value, fromLang, toLang);
    }
  } else if (Array.isArray(value)) {
    const res = [];
    for (let i = 0; i < value.length; i++) {
      res[i] = await processValue(value[i], fromLang, toLang);
    }
    return res;
  } else if (isObject(value)) {
    const obj = {};
    for (const k of Object.keys(value)) {
      obj[k] = await processValue(value[k], fromLang, toLang);
    }
    return obj;
  }
  return value;
}

async function processFile(sourcePath, relPath) {
  const data = fs.readFileSync(sourcePath, 'utf8');
  let sourceJson;
  try {
    sourceJson = JSON.parse(data);
  } catch (err) {
    console.error(`Skipping ${relPath} — invalid JSON`);
    return null;
  }

  const results = {};

  for (const lang of targetLangs) {
    const targetDir = path.join(localesDir, lang);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, relPath);
    let targetJson = {};
    if (fs.existsSync(targetPath)) {
      try { targetJson = JSON.parse(fs.readFileSync(targetPath, 'utf8')); } catch (e) { /* ignore */ }
    }

    async function recurseAndTranslate(src, tgt, keyPath = []) {
      if (typeof src === 'string') {
        const keyName = keyPath.join('.');
        if (skipKeys.includes(keyName)) {
          return tgt || src;
        }
        if (tgt && !overwrite) return tgt; // preserve existing
        return await processValue(src, 'en', lang);
      } else if (Array.isArray(src)) {
        const arr = [];
        for (let i = 0; i < src.length; i++) {
          arr[i] = await recurseAndTranslate(src[i], (tgt && tgt[i]) || undefined, keyPath.concat(String(i)));
        }
        return arr;
      } else if (isObject(src)) {
        const out = {};
        const keys = Object.keys(src);
        for (const k of keys) {
          out[k] = await recurseAndTranslate(src[k], (tgt && tgt[k]) || undefined, keyPath.concat(k));
        }
        // preserve keys present in target but not in source
        if (tgt && isObject(tgt)) {
          for (const k of Object.keys(tgt)) {
            if (!(k in out)) out[k] = tgt[k];
          }
        }
        return out;
      } else {
        return src;
      }
    }

    const translated = await recurseAndTranslate(sourceJson, targetJson, []);
    results[lang] = { path: targetPath, json: translated };
  }

  return results;
}

function findJsonFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...findJsonFiles(full, base));
    } else if (ent.isFile() && ent.name.endsWith('.json')) {
      files.push(path.relative(base, full));
    }
  }
  return files;
}

async function run() {
  try {
    const enDir = path.join(localesDir, 'en');
    if (!fs.existsSync(enDir)) {
      console.error('No en locale folder found at', enDir);
      process.exit(1);
    }

    const files = findJsonFiles(enDir);
    console.log(`Found ${files.length} JSON file(s) under public/locales/en`);

    const summary = [];

    for (const rel of files) {
      const sourcePath = path.join(enDir, rel);
      console.log('\nProcessing', rel);
      const res = await processFile(sourcePath, rel);
      if (!res) continue;
      for (const lang of Object.keys(res)) {
        const { path: outPath, json } = res[lang];
        summary.push({ file: rel, lang, outPath });
        if (dryRun) {
          console.log(`[dry-run] would write ${outPath}`);
        } else {
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf8');
          console.log(`Wrote ${outPath}`);
        }
      }
    }

    console.log('\nDone. Summary:');
    for (const s of summary) console.log(` - ${s.file} -> ${s.lang} (${s.outPath})`);

  } catch (err) {
    console.error('Error during run:', err);
    process.exit(1);
  }
}

run();
