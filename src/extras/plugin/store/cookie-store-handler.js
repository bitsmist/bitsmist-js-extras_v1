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

		this._cookie = new CookieUtil(this._options.get("cookieOptions"));
		this._cookieName = this._options.get("cookieOptions.name", "preferences");

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	* Do load store event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	*/
	onDoLoadStore(sender, e, ex)
	{

		let data = this._cookie.get(this._cookieName);

		return data;

	}

	// -------------------------------------------------------------------------

	/**
	* Do save store event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	*/
	onDoSaveStore(sender, e, ex)
	{

		this._cookie.set(this._cookieName, e.detail.data);

	}

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Get plugin options.
	 *
	 * @return  {Object}		Options.
	 */
	_getOptions()
	{

		return {
			"events": {
				"doLoadStore": this.onDoLoadStore,
				"doSaveStore": this.onDoSaveStore,
			}
		};

	}

}
