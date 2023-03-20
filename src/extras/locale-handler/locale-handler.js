// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BM from "../bm";

// =============================================================================
//	Locale Handler class
// =============================================================================

export default class LocaleHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{String}		handlerName			Handler name.
     * @param	{Object}		options				Options.
     */
	constructor(component, options)
	{

		options = options || {};

		this._component = component;
		this._options = new BM.Store({"items":options});
		this._fallbackLocale = options["fallbackLocale"] || "en";
		this._locale = options["locale"];
		this._messages = new BM.Store();

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Name.
	 *
	 * @type	{String}
	 */
	get name()
	{

		return "LocaleHandler";

	}

	// -------------------------------------------------------------------------

	/**
	 * Options.
	 *
	 * @type	{Object}
	 */
	get options()
	{

		return this._options;

	}

	// -------------------------------------------------------------------------

	/**
	 * Fallback Locale.
	 *
	 * @type	{String}
	 */
	get fallbackLocale()
	{

		return this._fallbackLocale;

	}

	set fallbackLocale(value)
	{

		this._fallbackLocale = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Locale.
	 *
	 * @type	{String}
	 */
	get locale()
	{

		return this._locale;

	}

	set locale(value)
	{

		this._locale = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Messages.
	 *
	 * @type	{Object}
	 */
	get messages()
	{

		return this._messages;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Get messages which belong to a locale.
	 *
	 * @param	{String}		key					Key.
	 * @param	{String}		locale				Locale.
	 *
 	 * @return  {String}		Messages.
	 */
	get(key, locale)
	{

		let key1 = (locale || this._locale) + ( key ? "." + key : "" );
		let key2 = (this._fallbackLocale) + ( key ? "." + key : "" );

		return this._messages.get(key1, this._messages.get(key2));

	}

	// -------------------------------------------------------------------------

	/**
	 * Get a translated message.
	 *
	 * @param	{String}		locale				Locale.
	 *
	 * @param	{String}		key					Key.
	 *
 	 * @return  {String}		Translated message.
	 */
	t(key, locale)
	{

		locale = locale || this._locale;

		return this._messages.get(`${locale}.${key}`, this._messages.get(`${this._fallbackLocale}.${key}`));

	}

}
