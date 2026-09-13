import { beforeEach, describe, expect, it } from 'vitest'

import t, { addTranslations, getLocale, hasTranslation, setLocale, setTranslations } from '../index.js'

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

    it('no da por traducida una clave vacia', () => {
        setTranslations({ en: { Pending: '' } })

        expect(hasTranslation('Pending')).toBe(false)
    })

})

describe('eleccion del idioma', () => {

    /**
     * Se buscaba el idioma como subcadena de la ruta, y "es" esta dentro de
     * "resources" y de "locales": setLocale('es') se quedaba con en.json.
     */
    it('elige por el nombre del archivo, no por la ruta', () => {
        setTranslations({
            '/resources/locales/en.json': { default: { Welcome: 'Welcome' } },
            '/resources/locales/es.json': { default: { Welcome: 'Bienvenido' } },
        })

        setLocale('es')

        expect(t('Welcome')).toBe('Bienvenido')
    })

    it('una variante regional usa su idioma base y lo sobrescribe', () => {
        setTranslations({
            es: { Welcome: 'Bienvenido', Car: 'Coche' },
            'es-MX': { Car: 'Carro' },
        })

        setLocale('es-MX')

        expect(t('Welcome')).toBe('Bienvenido')
        expect(t('Car')).toBe('Carro')
    })

    it('el idioma base encuentra su unica variante', () => {
        setTranslations({ '/lang/es-MX.json': { default: { Welcome: 'Bienvenido' } } })

        setLocale('es')

        expect(t('Welcome')).toBe('Bienvenido')
    })

    it('no distingue mayusculas ni guion bajo', () => {
        setTranslations({ '/lang/es_MX.json': { default: { Welcome: 'Bienvenido' } } })

        setLocale('ES-mx')

        expect(t('Welcome')).toBe('Bienvenido')
    })

    it('un idioma sin traducciones devuelve las claves', () => {
        setLocale('fr')

        expect(t('Welcome')).toBe('Welcome')
    })

})

describe('addTranslations()', () => {

    /**
     * locale-gen escribe las claves nuevas con "": sin esto, cada clave aun sin
     * traducir salia como un hueco en la pantalla.
     */
    it('una traduccion vacia muestra la clave', () => {
        setTranslations({ es: { 'Create :name': '' } })
        setLocale('es')

        expect(t('Create :name', { name: 'Post' })).toBe('Create Post')
    })

    it('suma las traducciones de varios origenes', () => {
        setTranslations({ es: { Create: 'Crear' } })
        addTranslations({ '/resources/locales/es.json': { default: { Welcome: 'Bienvenido' } } })
        setLocale('es')

        expect(t('Create')).toBe('Crear')
        expect(t('Welcome')).toBe('Bienvenido')
    })

    it('lo cargado despues gana, salvo que venga vacio', () => {
        setTranslations({ es: { Create: 'Crear', Delete: 'Eliminar' } })
        addTranslations({ es: { Create: 'Nuevo', Delete: '' } })
        setLocale('es')

        expect(t('Create')).toBe('Nuevo')
        expect(t('Delete')).toBe('Eliminar')
    })

    it('mantiene el idioma elegido', () => {
        setLocale('es-ES')
        addTranslations({ 'es-ES': { Extra: 'Adicional' } })

        expect(t('Extra')).toBe('Adicional')
        expect(t('Welcome')).toBe('Bienvenido')
    })

    it('setTranslations descarta lo anterior', () => {
        setTranslations({ es: { Create: 'Crear' } })
        setTranslations({ es: { Welcome: 'Bienvenido' } })
        setLocale('es')

        expect(t('Create')).toBe('Create')
    })

    it('ignora entradas que no son traducciones', () => {
        setTranslations({ es: null, en: 'nada', fr: { Welcome: 42 } })
        setLocale('fr')

        expect(t('Welcome')).toBe('Welcome')
    })

})
