// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ResourceHandler from "./resource-handler.js";

// =============================================================================
//	Cookie resource handler class
// =============================================================================

export default class CookieResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component.
     * @param	{String}		resourceName		Resource name.
     * @param	{Object}		options				Options.
     */
	constructor(component, resourceName, options)
	{

		let defaults = {"autoLoad":true};
		super(component, resourceName, Object.assign(defaults, options));

		this._name = "CookieResourceHandler";
		this._cookieName = BITSMIST.v1.Util.safeGet(options, "cookieOptions.name", "preferences");

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Get data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_get(id, parameters)
	{

		return this.__getCookie(this._cookieName);

	}

	// -------------------------------------------------------------------------

	/**
	 * Update data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to update.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_put(id, data, parameters)
	{

		this.__setCookie(this._cookieName, data);

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
		let options = this._options.get("cookieOptions");

		cookie += Object.keys(options).reduce((result, current) => {
			result += current + "=" + options[current] + "; ";

			return result;
		}, "");

		document.cookie = cookie;

	}

}
