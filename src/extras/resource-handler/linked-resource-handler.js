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

		let defaults = {"autoLoad":true};

		super(component, resourceName, Object.assign(defaults, options));

		this._ref;

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

		let handlerOptions = this._options.get("handlerOptions");
		let rootNode = handlerOptions["rootNode"];
		let resourceName = handlerOptions["resourceName"];
		let state = handlerOptions["state"];

		let options = { "rootNode": rootNode };
		if (state)
		{
			options["state"] = state;
		}

		return BITSMIST.v1.StateOrganizer.waitFor([options]).then(() => {
			this._ref = document.querySelector(rootNode).resources[resourceName];
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
