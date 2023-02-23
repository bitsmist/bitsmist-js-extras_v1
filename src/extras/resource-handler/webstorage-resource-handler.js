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
//	Web Storage handler class
// =============================================================================

export default class WebstorageResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(component, resourceName, options)
	{

		let defaults = {};
		super(component, resourceName, Object.assign(defaults, options));

		this._name = "WebstorageResourceHandler";

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	_get(id, parameters)
	{

		let data;
		let rawData = localStorage.getItem(id);
		if (rawData)
		{
			data = JSON.parse(rawData);
		}

		return data;

	}

	// -------------------------------------------------------------------------

	_delete(id, parameters)
	{

		localStorage.removeItem(id);

	}

	// -------------------------------------------------------------------------

	_post(id, data, parameters)
	{

		localStorage.setItem(id, JSON.stringify(data));

	}

	// -------------------------------------------------------------------------

	_put(id, data, parameters)
	{

		localStorage.setItem(id, JSON.stringify(data));

	}

}
