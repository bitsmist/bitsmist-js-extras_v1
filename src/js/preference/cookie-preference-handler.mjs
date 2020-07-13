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
	 * @param	{Object}		options				Options for the component.
     */
	constructor(options)
	{

		this._component = options["component"];
		this._options = options;
		this._events = {
			"load": {
				"handler": this.onLoad
			},
			"setup": {
				"handler": this.onSetup
			},
		}
		this._cookie = new CookieUtil(this._options["features"]["cookie"]);

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * Load event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onLoad(sender, e)
	{

		let settings = this.loadCookie();
		this._component.globalSettings["preferences"] = Object.assign(this._component.globalSettings["preferences"], settings);

	}

	// -------------------------------------------------------------------------

	/**
	 * Setup event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onSetup(sender, e)
	{

		return this.saveCookie(e.detail.newPreferences);

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
	loadCookie(options)
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
	saveCookie(settings, options)
	{

		this._cookie.set("settings", settings, options);

	}

}
