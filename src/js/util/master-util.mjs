// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ResourceUtil from './resource-util';

// =============================================================================
//	Master util class
// =============================================================================

export default class MasterUtil extends ResourceUtil
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{String}		resourceName		Resource name.
     * @param	{Object}		options				Options.
     */
	constructor(resourceName, options)
	{

		super(resourceName, options);

		this._items;

		if ("items" in options)
		{
			this._items = this.__reshapeItems(options["items"]);

		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
     * Master items.
     *
	 * @type	{Object}
     */
	get items()
	{

		return this._items;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Load master data.
     */
	load()
	{

		return new Promise((resolve, reject) => {
			this.getList().then((data) => {
				this._items = this.__reshapeItems(data["data"]);

				resolve();
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Get master value for the code.
	 *
	 * @param	{String}		code				Code value.
	 *
	 * @return  {String}		Master value.
	 */
	getValue(code)
	{

		let ret = code;
		let title = this._options["title"];

		if (this._items && code in this._items)
		{
			ret = this._items[code][title];
		}

		return ret;

	}

    // -------------------------------------------------------------------------

	/**
	 * Get master data for the code.
	 *
	 * @param	{String}		code				Code value.
	 *
	 * @return  {Object}		Master data.
	 */
	getItem(code)
	{

		let ret;

		if (this._items && code in this._items)
		{
			ret = this._items[code];
		}

		return ret;

	}

    // -------------------------------------------------------------------------

	/**
	 * Filter data.
	 *
	 * @param	{String}		predicate			Function to judge whether
	 * 												the value should pass the filter.
	 *
	 * @return  {Object}		Filtered data.
	 */
	filter(predicate)
	{

		let ret = Object.keys(this._items).reduce((result, key) => {
			if (predicate(this._items[key]))
			{
				result[key] = this._items[key];
			}

			return result;
		}, {});

		return ret;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
     * Reshape an array to master util format object.
     *
     * @param	{Object}		target				Target to reshape.
	 *
	 * @return  {Object}		Master object.
     */
	__reshapeItems(target)
	{

		let key = this._options["id"];
		let title = this._options["title"];

		let items = target.reduce((result, current) => {
			let id = current[key];
			result[id] = current;
			result[id]["title"] = current[title];
			return result;
		}, {});

		return items;

	}


}
