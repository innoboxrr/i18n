# i18n

**A tiny translation runtime for JavaScript. No dependencies, no build step.**

Load translations, pick a locale, resolve keys. That is the whole surface.

```js
import t, { addTranslations, setLocale } from 'innoboxrr-i18n';

addTranslations({
  en: { 'Hello :name': 'Hello :name' },
  es: { 'Hello :name': 'Hola :name' },
});

setLocale('es-MX');
t('Hello :name', { name: 'Homero' });   // → Hola Homero
```

## API

| Export | What it does |
|---|---|
| `t(key, replace?)` *(default)* | The translation of `key` in the current locale, or `key` itself when there is none. `:name` placeholders are replaced from `replace`, every occurrence. |
| `addTranslations(source)` | Adds translations to the ones already loaded. A key loaded later wins. |
| `setTranslations(source)` | Replaces everything loaded so far. |
| `setLocale(locale)` / `getLocale()` | The current locale. An empty value is ignored. |
| `hasTranslation(key)` | Whether `key` has a non-empty translation in the current locale. |

`source` is either an object keyed by locale, or Vite's eager glob over JSON files:

```js
addTranslations(import.meta.glob('/resources/locales/*.json', { eager: true }));
```

## Several sources

A module can ship its own translations and the application can load its own on top. Load the module's first, so the application has the last word:

```js
import { translations as catalog } from 'acme-catalog';

addTranslations(catalog);
addTranslations(import.meta.glob('/resources/locales/*.json', { eager: true }));
setLocale(document.documentElement.lang);
```

An empty translation (`"Create": ""`, which is what `locale-gen` writes for a new key) means *not translated yet*: it never overrides a translation loaded before it, and with nothing else `t()` shows the key instead of a blank.

## Locale matching

- The locale is the file name: `/resources/locales/es.json` is `es`. The rest of the path is ignored.
- `es-MX` uses the `es` translations and overrides them with `es-MX` where both exist.
- `es` falls back to a regional variant (`es-MX`) when there is no plain `es`.
- Case and `_` do not matter: `es_MX.json` matches `setLocale('es-mx')`.

| | |
|---|---|
| **Zero dependencies** | Plain ES modules |
| **Framework agnostic** | Works anywhere — Vue, React, vanilla |
| **Parameter replacement** | `:name` placeholders, same convention as Laravel |

## Install

```bash
npm install innoboxrr-i18n
```

Pairs naturally with [`innoboxrr-locale-generator`](https://github.com/innoboxrr/innoboxrr-locale-generator), which collects the `t('…')` keys of a project into these JSON files.

---

Part of [Innobox R&R](https://github.com/innoboxrr) — 52 open-source packages extracted from production work. **[innobox.systems](https://innobox.systems)**

## Documentación / Documentation

Documentación completa del ecosistema, en español y en inglés / Full ecosystem documentation, in Spanish and English: <https://innoboxrr.github.io/docs/interfaz/http-rutas-i18n>
