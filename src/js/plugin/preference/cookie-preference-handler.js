// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import CookieUtil from '../../util/cookie-util';

// =============================================================================
//	Cookie preference handler class
// =============================================================================

//export default class CookiePreferenceHandler extends BITSMIST.v1.Plugin
export default class CookiePreferenceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component which the plugin
	 * 												is attached to.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(component, options)
	{

//		super(component, options);

		this._component = component;
		this._options = options;
		this._events = {
			"load": this.onLoad,
			"setup": this.onSetup,
		}

		this._cookie = new CookieUtil(this._options["cookieOptions"]);

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
		this._component.app.preferences = Object.assign(this._component.app.preferences, settings);

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

		let options = Object.assign({},this._component.app.preferences, e.detail.newPreferences);
		return this.saveCookie(options);

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
