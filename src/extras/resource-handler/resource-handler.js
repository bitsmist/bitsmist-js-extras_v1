// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

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
	constructor(component, resourceName, options)
	{

		this._name = resourceName;
		this._component = component;
		this._options = new BITSMIST.v1.Store({"items":Object.assign({}, options)});
		this._data;
		this._items;
		this._item;
		this._target = {};
		this._currentIndex = 0;

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Name.
	 *
	 * @type	{String}
	 */
	get name()
	{

		return this._name;

	}

	set name(value)
	{

		this._name = value;

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
		this._items = this.__reshapeItems(value);
		this._item = ( Array.isArray(this._items) ? this._items[this._currentIndex] : this._items );

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
	 * Item.
	 *
	 * @type	{Object}
	 */
	get item()
	{

		return this._item;

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
	 * Get data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	get(id, parameters)
	{

		return Promise.resolve().then(() => {
			return this._get(id, parameters);
		}).then((data) => {
			this.data = data;

			return this._data;
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Delete data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	delete(id, parameters)
	{

		return Promise.resolve().then(() => {
			return this._delete(id, parameters);
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Insert data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	post(id, data, parameters)
	{

		data = this.__reshapeData(data);

		return Promise.resolve().then(() => {
			return this._post(id, data, parameter);
		});

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
	put(id, data, parameters)
	{

		data = this.__reshapeData(data);

		return Promise.resolve().then(() => {
			return this._put(id, data, parameters);
		});

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
	 * Get data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_get(id, parameters)
	{
	}

    // -------------------------------------------------------------------------

	/**
	 * Delete data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_delete(id, parameters)
	{
	}

    // -------------------------------------------------------------------------

	/**
	 * Insert data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_post(id, data, parameters)
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
	_put(id, data, parameters)
	{
	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get and reshape items from raw data on get.
	 *
	 * @param	{Object}		data				Raw data from which items are retrieved.
	 *
	 * @return  {Object}		Reshaped items.
	 */
	__reshapeItems(data)
	{

		// Get items
		let itemsField = this._options.get("fieldOptions.items");
		let items = ( itemsField ? BITSMIST.v1.Util.safeGet(data, itemsField) : data );

		// Reshape
		if (this._options.get("reshapeOptions.get.reshape"))
		{
			let reshaper = this._options.get("reshapeOptions.get.reshaper", this.__reshaper_get.bind(this));
			items = reshaper(items);
		}

		return items;

	}

	// -------------------------------------------------------------------------

	/**
	 * Reshape request data on post/put.
	 *
	 * @param	{Object}		data				Data to reshape.
	 *
	 * @return  {Object}		Reshaped data.
	 */
	__reshapeData(data)
	{

		if (this._options.get("reshapeOptions.put.reshape"))
		{
			let reshaper = this._options.get("reshapeOptions.put.reshaper", () => { return data; });
			data = reshaper(data);
		}

		return data;

	}

	// -------------------------------------------------------------------------

	/**
     * Reshape items on get.
     *
     * @param	{Object}		target				Target to reshape.
	 *
	 * @return  {Object}		Master object.
     */
	__reshaper_get(target)
	{

		let idField = this._options.get("fieldOptions.id");

		let items = target.reduce((result, current) => {
			let id = current[idField];
			result[id] = current;

			return result;
		}, {});

		return items;

	}

}
