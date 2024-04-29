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
//	Array Store class
// =============================================================================

export default class ArrayStore extends Store
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options.
     */
	constructor(options)
	{

		let defaults = {};
		super(Object.assign(defaults, options));

		this.items = Util.safeGet(this.options, "items", []);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Items.
	 *
	 * @type	{String}
	 */
	get items()
	{

		return super.items;

	}

	set items(value)
	{

		Util.assert(Array.isArray(value), () => `ArrayStore.items(setter): Items is not an array. items=${value}`, TypeError);

		super.items = value;

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
     * Clear.
     */
	clear()
	{

		this.items = [];

	}

	// -------------------------------------------------------------------------

	/**
     * Clone contents as an object.
     *
	 * @return  {Object}		Cloned items.
     */
	clone()
	{

		return Util.deepMerge([], this.items);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get the value from store. Return default value when specified key is not available.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	get(index, key, defaultValue)
	{

		return Util.safeGet(this.items[index], key, defaultValue);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Set the value to the store. If key is empty, it sets the value to the root.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	set(index, key, value, options)
	{

		Util.safeSet(this._items[index], key, value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Remove from the list.
	 *
	 * @param	{String}		key					Key to store.
	 */
	remove(index, key)
	{

		Util.safeRemove(this.items[index], key);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Check if the store has specified key.
	 *
	 * @param	{String}		key					Key to check.
	 *
	 * @return	{Boolean}		True:exists, False:not exists.
	 */
	has(index, key)
	{

		return Util.safeHas(this.items[index], key);

	}

}
