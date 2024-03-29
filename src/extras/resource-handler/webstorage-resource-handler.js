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
//	Web Storage handler class
// =============================================================================

export default class WebStorageResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	_load(id, parameters)
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

	_remove(id, parameters)
	{

		localStorage.removeItem(id);

	}

	// -------------------------------------------------------------------------

	_add(id, data, parameters)
	{

		localStorage.setItem(id, JSON.stringify(data));

	}

	// -------------------------------------------------------------------------

	_update(id, data, parameters)
	{

		localStorage.setItem(id, JSON.stringify(data));

	}

}
