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
			"loadPreferences": this.onLoadPreferences,
			"savePreferences": this.onSavePreferences,
		}

		this._cookie = new CookieUtil(this._options["cookieOptions"]);
		this._cookieName = this.getOption("cookieOptions.name", "preferences");

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	* Load preferences handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onLoadPreferences(sender, e)
	{

		return new Promise((resolve, reject) => {
			let preferences = this._cookie.get(this._cookieName);

			resolve(preferences);
		});

	}

	// -------------------------------------------------------------------------

	/**
	* Save preferences event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onSavePreferences(sender, e)
	{

		this._cookie.set(this._cookieName, e.detail.preferences);

	}

}
