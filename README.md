# i18n

**A tiny translation runtime for JavaScript. No dependencies, no build step.**

Load a translation set, pick a locale, resolve keys. That is the whole surface.

```js
import { setTranslations, setLocale, trans } from 'innoboxrr-i18n';

setTranslations({
  'en-US': { greeting: 'Hello, :name' },
  'es-MX': { greeting: 'Hola, :name' },
});

setLocale('es-MX');
trans('greeting', { name: 'Homero' });   // → Hola, Homero
```

## Why it is this small

Most i18n libraries bring a loader, a formatter, a plural engine and a framework binding. If your translations already come from the backend as a JSON object, you need almost none of that — you need a place to put them and a way to look keys up.

Locale matching is forgiving: `setLocale('es')` resolves against `es-MX` if that is what you loaded, so you do not have to normalise tags before calling it.

| | |
|---|---|
| **Zero dependencies** | Plain ES modules |
| **Framework agnostic** | Works anywhere — Vue, React, vanilla |
| **Partial locale matching** | `es` finds `es-MX` |
| **Parameter replacement** | `:name` placeholders, same convention as Laravel |

## Install

```bash
npm install innoboxrr-i18n
```

Pairs naturally with [`innoboxrr-locale-generator`](https://github.com/innoboxrr/innoboxrr-locale-generator), which produces the translation bundles this consumes.

---

Part of [Innobox R&R](https://github.com/innoboxrr) — 52 open-source packages extracted from production work. **[innobox.systems](https://innobox.systems)**
