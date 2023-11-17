// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Util, Store} from "@bitsmist-js_v1/core";

// =============================================================================
//	Resource Handler class
// =============================================================================

export default class ResourceHandler
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
	constructor(unit, resourceName, options)
	{

		options = options || {};

		this._resourceName = resourceName;
		this._unit = unit;
		this._options = new Store({"items":options});
		this._data = {};
		this._items = [];
		this._target = {};
		this._currentIndex = 0;

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Resource name.
	 *
	 * @type	{String}
	 */
	get resourceName()
	{

		return this._resourceName;

	}

	set resourceName(value)
	{

		this._resourceName = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Fetch target.
	 *
	 * @type	{Object}
	 */
	get target()
	{

		return this._target;

	}

	// -------------------------------------------------------------------------

	/**
	 * Raw data.
	 *
	 * @type	{Object}
	 */
	get data()
	{

		return this._data;

	}

	set data(value)
	{

		this._data = value;
		this._items = this.#__reshapeItems(value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Items.
	 *
	 * @type	{Object}
	 */
	get items()
	{

		return this._items;

	}

	// -------------------------------------------------------------------------

	/**
	 * Options.
	 *
	 * @type	{Object}
	 */
	get options()
	{

		return this._options;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Init the handler.
     *
     * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	init(options)
	{

		if (this._options.get("autoLoad"))
		{
			let id = this._options.get("autoLoadOptions.id");
			let parameters = this._options.get("autoLoadOptions.parameters");

			return this.load(id, parameters);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	load(id, parameters)
	{

		return Promise.resolve().then(() => {
			return this._load(id, parameters);
		}).then((data) => {
//			Util.warn(data, `ResourceHandler.load(): No data returned. name=${this._unit.tagName}, handlerName=${this._name}, resourceName=${this._resourceName}`);

			this.data = data;

			return this._data;
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Remove data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	remove(id, parameters)
	{

		return this._remove(id, parameters);

	}

    // -------------------------------------------------------------------------

	/**
	 * Add data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	add(id, data, parameters)
	{

		return this._add(id, this.#__reshapeData(data), parameters);

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
	update(id, data, parameters)
	{

		return this._update(id, this.#__reshapeData(data), parameters);

	}

    // -------------------------------------------------------------------------

	/**
	 * Get resource text for the code.
	 *
	 * @param	{String}		code				Code value.
	 *
	 * @return  {String}		Resource text.
	 */
	getText(code)
	{

		let ret = code;
		let title = this._options.get("fieldOptions.text");

		if (this._items && code in this._items)
		{
			ret = this._items[code][title];
		}

		return ret;

	}

    // -------------------------------------------------------------------------

	/**
	 * Get resource item for the code.
	 *
	 * @param	{String}		code				Code value.
	 *
	 * @return  {Object}		Resource data.
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
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Load data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_load(id, parameters)
	{
	}

    // -------------------------------------------------------------------------

	/**
	 * Remove data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_remove(id, parameters)
	{
	}

    // -------------------------------------------------------------------------

	/**
	 * Add data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_add(id, data, parameters)
	{
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
	_update(id, data, parameters)
	{
	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get and reshape items from raw data on load.
	 *
	 * @param	{Object}		data				Raw data from which items are retrieved.
	 *
	 * @return  {Object}		Reshaped items.
	 */
	#__reshapeItems(data)
	{

		// Get items
		let itemsField = this._options.get("fieldOptions.items");
		let items = ( itemsField ? Util.safeGet(data, itemsField) : data );

		// Reshape
		if (this._options.get("reshapeOptions.load.reshape"))
		{
			let reshaper = this._options.get("reshapeOptions.load.reshaper", this.#__reshaper_load.bind(this));
			items = reshaper(items);
		}

		return items;

	}

	// -------------------------------------------------------------------------

	/**
	 * Reshape request data on add/update.
	 *
	 * @param	{Object}		data				Data to reshape.
	 *
	 * @return  {Object}		Reshaped data.
	 */
	#__reshapeData(data)
	{

		if (this._options.get("reshapeOptions.update.reshape"))
		{
			let reshaper = this._options.get("reshapeOptions.update.reshaper", () => { return data; });
			data = reshaper(data);
		}

		return data;

	}

	// -------------------------------------------------------------------------

	/**
     * Reshape items on load.
     *
     * @param	{Object}		target				Target to reshape.
	 *
	 * @return  {Object}		Master object.
     */
	#__reshaper_load(target)
	{

		let items;

		if (target)
		{
			let idField = this._options.get("fieldOptions.id");
			items = target.reduce((result, current) => {
				let id = current[idField];
				result[id] = current;

				return result;
			}, {});
		}

		return items;

	}

}
