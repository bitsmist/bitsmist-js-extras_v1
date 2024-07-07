// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Store, Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	Multi Chainable Store Class
// =============================================================================

export default class MultiStore extends Store
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	#__stores = [];

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
     * Add the store.
     *
	 * @param	{Store}			store				Store to add.
     */
	add(store)
	{

		this.#__stores.push(store);

	}

	// -----------------------------------------------------------------------------

	clear()
	{

		this.#__stores = [];

	}

	// -----------------------------------------------------------------------------

	clone()
	{

		let items = {};

		for (let i = 0; i < this.#__stores.length; i++)
		{
			Util.deepMerge(items, this.#__stores[i].items);
		}

		return items;

	}

	// -------------------------------------------------------------------------

	get(key, defaultValue)
	{

		let isFound = false;
		let value;

		for (let i = 0; i < this.#__stores.length; i++)
		{
			if (this.#__stores[i].has(key))
			{
				value = this.#__stores[i].get(key);
				isFound = true;
				break;
			}
		}

		return ( isFound ? value : defaultValue );

	}

	// -------------------------------------------------------------------------

	merge(newItems, merger)
	{

		throw TypeError("MultiStore is read only.");

	}

	// -------------------------------------------------------------------------

	set(key, value, options)
	{

		throw TypeError("MultiStore is read only.");

	}

	// -----------------------------------------------------------------------------

	remove(key)
	{

		throw TypeError("MultiStore is read only.");

	}

	// -----------------------------------------------------------------------------

	has(key)
	{

		let isFound = false;

		for (let i = 0; i < this.#__stores.length; i++)
		{
			if (this.#__stores[i].has(key))
			{
				isFound = true;
				break;
			}
		}

		return isFound;

	}

}
