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

	get data()
	{

		return this._ref.data;

	}

	set data(value)
	{

//		throw TypeError("LinkedResourceHandler is read only.");

	}

	// -------------------------------------------------------------------------

	get items()
	{

		return this._ref.items;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	getText(code)
	{

		return this._ref.getText(code);

	}

    // -------------------------------------------------------------------------

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

		return this._component.skills.use("state.wait", [{"rootNode":rootNode}]).then(() => {
			this._ref = document.querySelector(rootNode).inventory.get("resource.resources")[resourceName];
			return this._ref;
		});

	}

	// -------------------------------------------------------------------------

	_delete(id, parameters)
	{

//		return this._ref.delete(id, parameters);
		throw TypeError("LinkedResourceHandler is read only.");

	}

	// -------------------------------------------------------------------------

	_post(id, data, parameters)
	{

		//return this._ref.post(id, data, parameters);
		throw TypeError("LinkedResourceHandler is read only.");

	}

	// -------------------------------------------------------------------------

	_put(id, data, parameters)
	{

//		return this._ref.put(id, data, parameters);
		throw TypeError("LinkedResourceHandler is read only.");

	}

}
