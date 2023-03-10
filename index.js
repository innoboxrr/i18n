let translations;

let defaultLang = 'en-US';

let locales;

export function setTranslations(newTranslations) {

	translations = newTranslations;

	setLocale(defaultLang);

}

export function setLocale(newLocale, once = false) {

	let found = once;

	for (const key in translations) {

		if (key.includes(newLocale)) {

			locales = translations[key];

			break;

		}

	}

}

export default function (key, replace) {

    let locale;

    if(locales != undefined) {

    	locale = locales['default'][key]
	        ? locales['default'][key]
	        : key

	} else {

    	locale = key;

    }

    _.forEach(replace, (value, key) => {
        
        locale = locale.replace(':' + key, value)

    })

    return locale

};