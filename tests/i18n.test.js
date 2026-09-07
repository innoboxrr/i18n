import { beforeEach, describe, expect, it } from 'vitest'

import t, { getLocale, hasTranslation, setLocale, setTranslations } from '../index.js'

const TRANSLATIONS = {
    '/resources/lang/en-US.json': { default: { Welcome: 'Welcome', 'Hello :name': 'Hello :name' } },
    '/resources/lang/es-ES.json': { default: { Welcome: 'Bienvenido', 'Hello :name': 'Hola :name' } },
}

beforeEach(() => {
    setLocale('en-US')
    setTranslations(TRANSLATIONS)
})

describe('t()', () => {

    it('traduce una clave conocida', () => {
        expect(t('Welcome')).toBe('Welcome')

        setLocale('es-ES')

        expect(t('Welcome')).toBe('Bienvenido')
    })

    it('devuelve la clave cuando no hay traduccion', () => {
        expect(t('Sin traducir')).toBe('Sin traducir')
    })

    it('devuelve la clave cuando no se han cargado traducciones', () => {
        setTranslations({})

        expect(t('Welcome')).toBe('Welcome')
    })

    /**
     * La sustitucion se hacia con `_.forEach`, es decir lodash como global sin
     * importarlo: si la app no lo ponia en window, traducir lanzaba
     * ReferenceError.
     */
    it('sustituye los marcadores sin depender de lodash', () => {
        setLocale('es-ES')

        expect(t('Hello :name', { name: 'Ada' })).toBe('Hola Ada')
    })

    it('sustituye todas las apariciones de un marcador', () => {
        setTranslations({ '/lang/en-US.json': { default: { dup: ':x y :x' } } })

        expect(t('dup', { x: 'z' })).toBe('z y z')
    })

    it('funciona sin argumento de sustitucion', () => {
        expect(t('Welcome', undefined)).toBe('Welcome')
    })

})

describe('setLocale()', () => {

    it('cambia el idioma activo', () => {
        setLocale('es-ES')

        expect(getLocale()).toBe('es-ES')
    })

    it('ignora un idioma vacio', () => {
        setLocale('es-ES')
        setLocale('')

        expect(getLocale()).toBe('es-ES')
    })

    /**
     * setTranslations llamaba a setLocale(defaultLang), asi que cargar las
     * traducciones descartaba el idioma que ya se hubiera elegido.
     */
    it('sobrevive a una recarga de traducciones', () => {
        setLocale('es-ES')
        setTranslations(TRANSLATIONS)

        expect(getLocale()).toBe('es-ES')
        expect(t('Welcome')).toBe('Bienvenido')
    })

})

describe('hasTranslation()', () => {

    it('dice si una clave esta traducida', () => {
        expect(hasTranslation('Welcome')).toBe(true)
        expect(hasTranslation('Sin traducir')).toBe(false)
    })

})
