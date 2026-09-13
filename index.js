/**
 * Traduccion en cliente con claves al estilo de Laravel.
 *
 *     import t, { addTranslations, setLocale } from 'innoboxrr-i18n'
 *     import { translations } from 'mi-modulo'
 *
 *     addTranslations(translations)                       // { en: {...}, es: {...} }
 *     addTranslations(import.meta.glob('/resources/locales/*.json', { eager: true }))
 *     setLocale(document.documentElement.lang)
 *
 *     t('Welcome')
 *     t('Hello :name', { name: 'Ada' })
 */

// Un catalogo por idioma, con el nombre normalizado: 'es-mx', 'es', 'en'.
let catalogs = {}

let locale = 'en-US'

let messages = null

function normalize(name) {
    return String(name).replaceAll('_', '-').toLowerCase()
}

/**
 * '/resources/locales/es-MX.json' y 'es-MX' son el mismo idioma: cuenta el
 * nombre del archivo, no la ruta. Antes se buscaba el idioma como subcadena de
 * la ruta entera, y 'es' aparece en "resources" y en "locales": setLocale('es')
 * podia quedarse con en.json.
 */
function localeOf(source) {
    return normalize(String(source).split('/').pop().replace(/\.json$/i, ''))
}

/**
 * El idioma pedido sobre su idioma base: con es-MX se usan las claves de es y
 * las de es-MX ganan. Si solo hay una variante (se pide es y existe es-MX), se
 * usa esa.
 */
function resolveMessages(target) {
    const wanted = normalize(target)
    const language = wanted.split('-')[0]

    const layers = [catalogs[language], wanted === language ? undefined : catalogs[wanted]]
        .filter(Boolean)

    if (layers.length === 0) {
        const variant = Object.keys(catalogs).find((name) => name.split('-')[0] === language)

        if (variant) {
            layers.push(catalogs[variant])
        }
    }

    return layers.length === 0 ? null : Object.assign({}, ...layers)
}

/**
 * Suma traducciones a las que ya hay. Acepta el glob eager de Vite (cada
 * archivo trae su JSON en `.default`) o un objeto por idioma.
 *
 * Varios modulos y la aplicacion pueden aportar las suyas: una clave cargada
 * despues gana. Una traduccion vacia es una clave pendiente de traducir, no un
 * texto en blanco: no pisa la que ya hubiera, y sin otra se muestra la clave.
 */
export function addTranslations(source) {
    for (const [name, value] of Object.entries(source ?? {})) {
        const entries = value && typeof value.default === 'object' ? value.default : value

        if (! entries || typeof entries !== 'object') {
            continue
        }

        const catalog = catalogs[localeOf(name)] ??= {}

        for (const [key, message] of Object.entries(entries)) {
            if (typeof message === 'string' && message !== '') {
                catalog[key] = message
            }
        }
    }

    messages = resolveMessages(locale)
}

/**
 * Sustituye todas las traducciones cargadas.
 *
 * Antes se llamaba a setLocale(defaultLang) sin mas, de modo que cargar las
 * traducciones descartaba el idioma que ya se hubiera elegido.
 */
export function setTranslations(source) {
    catalogs = {}

    addTranslations(source)
}

export function setLocale(newLocale) {
    if (! newLocale) {
        return
    }

    locale = newLocale
    messages = resolveMessages(newLocale)
}

export function getLocale() {
    return locale
}

export function hasTranslation(key) {
    return Boolean(messages && Object.hasOwn(messages, key))
}

export default function t(key, replace) {
    let message = messages?.[key] ?? key

    // Se usaba `_.forEach`, es decir lodash como global sin importarlo: si la
    // aplicacion no lo ponia en window, traducir lanzaba ReferenceError.
    if (replace) {
        for (const [placeholder, value] of Object.entries(replace)) {
            message = message.replaceAll(`:${placeholder}`, value)
        }
    }

    return message
}
