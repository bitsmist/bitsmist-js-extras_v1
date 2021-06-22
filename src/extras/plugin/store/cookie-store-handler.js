// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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

		let data = this.__getCookie(this._cookieName);

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

		this.__setCookie(this._cookieName, e.detail.data);

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

	// -----------------------------------------------------------------------------
	//  Privates
	// -----------------------------------------------------------------------------

	/**
	* Get cookie.
	*
	* @param	{String}		key					Key.
	*/
	__getCookie(key)
	{

		let decoded = document.cookie.split(';').reduce((result, current) => {
			const [key, value] = current.split('=');
			if (key)
			{
				result[key.trim()] = ( value ? decodeURIComponent(value.trim()) : undefined );
			}

			return result;
		}, {});

		return ( decoded[key] ? JSON.parse(decoded[key]) : {});

	}

	// -----------------------------------------------------------------------------

	/**
	* Set cookie.
	*
	* @param	{String}		key					Key.
	* @param	{Object}		value				Value.
	*/
	__setCookie(key, value)
	{

		let cookie = key + "=" + encodeURIComponent(JSON.stringify(value)) + "; ";
		let options =this._options.get("cookieOptions", {})

		cookie += Object.keys(options).reduce((result, current) => {
			result += current + "=" + options[current] + "; ";

			return result;
		}, "");

		document.cookie = cookie;

	}

}
