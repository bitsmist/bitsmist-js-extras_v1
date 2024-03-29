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
//	Object Resource Handler class
// =============================================================================

export default class ObjectResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(unit, resourceName, options)
	{

		let defaults = {"autoLoad":true, "autoFetch":false, "autoSubmit":false};
		super(unit, resourceName, Object.assign(defaults, options));

		if (options["items"])
		{
			this.data = options["items"];
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	_load(id, parameters)
	{

		return this._data;

	}

    // -------------------------------------------------------------------------

	_update(id, data, parameters)
	{

		this.data = data;

	}

}
