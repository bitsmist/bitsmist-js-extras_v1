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

// =============================================================================
//	Multi Chainable store class
// =============================================================================

export default class MultiStore extends BM.Store
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(options)
	{

		super(options);

		// Init vars
		this._stores = [];

	}

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

		this._stores.push(store);

	}

	// -----------------------------------------------------------------------------

	clear()
	{

		this._stores = [];

	}

	// -----------------------------------------------------------------------------

	clone()
	{

		let items = {};

		for (let i = 0; i < this._stores.length; i++)
		{
			BM.Util.deepMerge(items, this._stores[i].items);
		}

		return items;

	}

	// -------------------------------------------------------------------------

	get(key, defaultValue)
	{

		let isFound = false;
		let value;

		for (let i = 0; i < this._stores.length; i++)
		{
			if (this._stores[i].has(key))
			{
				value = this._stores[i].get(key);
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

		for (let i = 0; i < this._stores.length; i++)
		{
			if (this._stores[i].has(key))
			{
				isFound = true;
				break;
			}
		}

		return isFound;

	}

}
