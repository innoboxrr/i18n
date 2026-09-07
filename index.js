/**
 * Traduccion en cliente a partir de los JSON de idioma de Laravel.
 *
 *     import t, { setTranslations, setLocale } from 'innoboxrr-i18n'
 *
 *     setTranslations(import.meta.glob('/resources/lang/*.json', { eager: true }))
 *     setLocale('es-ES')
 *
 *     t('Welcome')
 *     t('Hello :name', { name: 'Ada' })
 */

let translations = {}

let locale = 'en-US'

let messages = null

function resolveMessages(target) {
    for (const key in translations) {
        if (key.includes(target)) {
            // Con el glob eager de Vite cada modulo trae su JSON en .default.
            return translations[key]?.default ?? translations[key]
        }
    }

    return null
}

export function setTranslations(newTranslations) {
    translations = newTranslations ?? {}

    // Antes se llamaba a setLocale(defaultLang) sin mas, de modo que cargar
    // las traducciones descartaba el idioma que ya se hubiera elegido.
    messages = resolveMessages(locale)
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
    return Boolean(messages && key in messages)
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
