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
		this._fallbackLocaleName = options["fallbackLocaleName"] || "en";
		this._localeName = options["localeName"];
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
	 * Fallback Locale Name.
	 *
	 * @type	{String}
	 */
	get fallbackLocaleName()
	{

		return this._fallbackLocaleName;

	}

	set fallbackLocaleName(value)
	{

		this._fallbackLocaleName = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Locale Name.
	 *
	 * @type	{String}
	 */
	get localeName()
	{

		return this._localeName;

	}

	set localeName(value)
	{

		this._localeName = value;

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
	 * Get messages which belong to the locale name.
	 *
	 * @param	{String}		key					Key.
	 * @param	{String}		localeName			Locale name.
	 *
 	 * @return  {String}		Messages.
	 */
	get(key, localeName)
	{

		let key1 = (localeName || this._localeName) + ( key ? "." + key : "" );
		let key2 = (this._fallbackLocaleName) + ( key ? "." + key : "" );

		return this._messages.get(key1, this._messages.get(key2));

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the translated message.
	 *
	 * @param	{String}		key					Key.
	 * @param	{String}		localeName			Locale name.
	 *
 	 * @return  {String}		Translated message.
	 */
	t(key, localeName)
	{

		localeName = localeName || this._localeName;

		return this._messages.get(`${localeName}.${key}`, this._messages.get(`${this._fallbackLocaleName}.${key}`));

	}

}
