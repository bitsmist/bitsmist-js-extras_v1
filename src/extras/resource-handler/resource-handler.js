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
		this._reshaper = ( options["reshaper"] ? options["reshaper"] : this.__reshapeItems );

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

		return this._namme;

	}

	set name(value)
	{

		this._name = value;

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

	/**
	 * Reshaper function to reshape retrieved data.
	 *
	 * @type	{Function}
	 */
	get reshaper()
	{

		return this._reshaper;

	}

	set reshaper(value)
	{

		this._reshaper = value;

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

		let itemsField = this._options.get("fieldOptions.items");
		this._items = ( itemsField ? BITSMIST.v1.Util.safeGet(this._data, itemsField) : this._data );

		// Reshape
		if (this._options.get("reshape"))
		{
			this._items = this._reshaper(this._items);
		}

		return Promise.resolve(this._data);

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
	}

    // -------------------------------------------------------------------------

	/**
	 * Insert data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		items				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	insert(id, items, parameters)
	{
	}

    // -------------------------------------------------------------------------

	/**
	 * Update data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		items				Data to update.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	update(id, items, parameters)
	{
	}

    // -------------------------------------------------------------------------

	/**
	 * Get resource value for the code.
	 *
	 * @param	{String}		code				Code value.
	 *
	 * @return  {String}		Resource value.
	 */
	getValue(code)
	{

		let ret = code;
		let title = this._options.get("title");

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

		let idField = this._options.get("fieldOptions.id");

		let items = target.reduce((result, current) => {
			let id = current[idField];
			result[id] = current;

			return result;
		}, {});

		return items;

	}

}
