// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Cookie util class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		options				Options for the component.
 */
export default function CookieUtil(options)
{

	this._options = ( options ? options : {} );

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Get cookie.
 *
 * @param	{String}		key					Key.
 */
CookieUtil.prototype.get = function(key)
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
 * @param	{Object}		options				Options.
 */
CookieUtil.prototype.set = function(key, value, options)
{

	let cookie = key + "=" + encodeURIComponent(JSON.stringify(value)) + "; ";

	options = ( options ? options : {} );
	if (this._options)
	{
		options = Object.assign(this._options, options);
	}

	cookie += Object.keys(options).reduce((result, current) => {
		result += current + "=" + options[current] + "; ";

		return result;
	}, "");

	document.cookie = cookie;

}
