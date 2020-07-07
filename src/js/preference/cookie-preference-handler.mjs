// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import CookieUtil from '../util/cookie-util';

// =============================================================================
//	Cookie preference handler class
// =============================================================================

export default class CookiePreferenceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(componentName, options)
	{

		this._name = componentName;
		this._component = options["component"];
		this._options = options;

		this.events = [
			"init",
			"setup",
		]

		this._cookie = new CookieUtil(this._options.options);

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * Load preference event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	init(sender, e)
	{

		let settings = this.load();
		this._component.globalSettings["preferences"] = Object.assign(this._component.globalSettings["preferences"], settings);

	}

	// -------------------------------------------------------------------------

	/**
	 * Save preference event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	setup(sender, e)
	{

		return this.save(e.detail.newPreferences);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Load settings
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	load(options)
	{

		return this._cookie.get("settings");

	}

	// -------------------------------------------------------------------------

	/**
	 * Save settings
	 *
	 * @param	{Object}		settings			Settings.
	 * @param	{Object}		options				Options.
	 */
	save(settings, options)
	{

		this._cookie.set("settings", settings, options);

	}

}
