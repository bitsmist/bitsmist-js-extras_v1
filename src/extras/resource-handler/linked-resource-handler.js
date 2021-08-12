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
//	Linked Resource Handler class
// =============================================================================

export default class LinkedResourceHandler extends ResourceHandler
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

		super(component, resourceName, options);

		this._ref;

		if (options["rootNode"] && options["resourceName"])
		{
			this._ref = document.querySelector(options["rootNode"]).resources[resourceName];
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Fetch target.
	 *
	 * @type	{Object}
	 */
	get target()
	{

		return this._ref.target;

	}

	// -------------------------------------------------------------------------

	/**
	 * Raw data.
	 *
	 * @type	{Object}
	 */
	get data()
	{

		return this._ref.data;

	}

	set data(value)
	{

		this._ref.data = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Items.
	 *
	 * @type	{Object}
	 */
	get items()
	{

		return this._ref.items;

	}

	// -------------------------------------------------------------------------

	/**
	 * Item.
	 *
	 * @type	{Object}
	 */
	get item()
	{

		return this._ref.item;

	}

	// -------------------------------------------------------------------------

	/**
	 * Options.
	 *
	 * @type	{Object}
	 */
	get options()
	{

		return this._ref.options;

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

		return this._ref.get(id, paramters);

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

		return this._ref.delete(id, paramters);

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

		return this._ref.delete(id, data, paramters);

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

		return this._ref.put(id, data, paramters);

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

		return this._ref.getText(code);

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

		return this._ref.getItem(code);

	}

}
