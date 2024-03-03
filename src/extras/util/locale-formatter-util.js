// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormatterUtil from "./formatter-util.js";

// =============================================================================
//	Locale Formatter util class
// =============================================================================

export default class LocaleFormatterUtil extends FormatterUtil
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static formatPrice(type, typeOption, value, options)
	{


		let locale = ( options && options["localeName"] ? options["localeName"] : navigator.language );
		let currency = ( options && options["currencyName"] ? options["currencyName"] : "USD" );

		//return new Intl.NumberFormat(locale, {
		let ret = new Intl.NumberFormat(locale, {
			style:		"currency",
			currency:	currency
		}).format(value);

		console.log("@@@format", this.constructor.name, type, typeOption, value, options, ret);

		return ret;

	}

	// -------------------------------------------------------------------------

	static formatDate(type, typeOption, value, options)
	{

		let ret = value;

		if (typeOption)
		{
			ret = super.formatDate(type, typeOption, value, options);
		}
		else
		{
			let locale = ( options && options["localeName"] ? options["localeName"] : navigator.language );
			let dt;
			if (value.length === 8)
			{
				dt = new Date(`${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)}`);
			}
			else
			{
				dt = new Date(value);
			}

			ret = new Intl.DateTimeFormat(locale).format(dt);
		}

		return ret || "";

	}

}
