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

export default class CookiePreferenceHandler extends BITSMIST.v1.Plugin
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

		super(component, options);

		this._options["events"] = {
			"loadStore": this.onLoadStore,
			"saveStore": this.onSaveStore,
		}

		this._cookie = new CookieUtil(this._options["cookieOptions"]);
		this._cookieName = this.getOption("cookieOptions.name", "preferences");

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	* Load store event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onLoadStore(sender, e)
	{

		return new Promise((resolve, reject) => {
			let preferences = this._cookie.get(this._cookieName);

			resolve(preferences);
		});

	}

	// -------------------------------------------------------------------------

	/**
	* Save store event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onSaveStore(sender, e)
	{

		this._cookie.set(this._cookieName, e.detail.preferences);

	}

}
