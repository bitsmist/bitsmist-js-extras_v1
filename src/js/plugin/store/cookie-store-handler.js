// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import CookieUtil from '../../util/cookie-util';
import Plugin from '../plugin';

// =============================================================================
//	Cookie store handler class
// =============================================================================

export default class CookieStoreHandler extends Plugin
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
			"doLoadStore": this.onDoLoadStore,
			"doSaveStore": this.onDoSaveStore,
		}

		this._cookie = new CookieUtil(this._options["cookieOptions"]);
		this._cookieName = this.getOption("cookieOptions.name", "preferences");

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	* Do load store event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onDoLoadStore(sender, e)
	{

		return new Promise((resolve, reject) => {
			let preferences = this._cookie.get(this._cookieName);

			resolve(preferences);
		});

	}

	// -------------------------------------------------------------------------

	/**
	* Do save store event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onDoSaveStore(sender, e)
	{

		this._cookie.set(this._cookieName, e.detail.preferences);

	}

}
