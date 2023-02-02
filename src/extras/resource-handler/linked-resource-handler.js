// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BM from "../bm";
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

		let defaults = {"autoLoad":true, "autoFetch":false, "autoSubmit":false};
		super(component, resourceName, Object.assign(defaults, options));

		this._name = "LinkedResourceHandler";
		this._ref;

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
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
	//  Methods
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

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	_get(id, parameters)
	{

		let rootNode = this._options.get("rootNode");
		let resourceName = this._options.get("resourceName") || this._resourceName;

		return this._component.waitFor([{"rootNode":rootNode}]).then(() => {
			this._ref = document.querySelector(rootNode).resources[resourceName];
			return this._ref;
		});

	}

}
