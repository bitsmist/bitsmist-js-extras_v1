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
import ArrayStore from "../store/array-store.js";
import ValueUtil from "../util/value-util.js";

// =============================================================================
//	Bindable store class
// =============================================================================

export default class BindableArrayStore extends ArrayStore
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(options)
	{

		let defaults = {};
		super(Object.assign(defaults, options));

		this._elems = {};

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	clear()
	{

		super.clear();
		this._elems = {};

	}

	// -------------------------------------------------------------------------

	replace(index, value)
	{

		this._items[index] = value;

		if (this._elems[index])
		{
			Object.keys(this._items[index]).forEach((key) => {
				if (this._elems[index][key] && this._elems[index][key]["callback"])
				{
					let value = this._items[index][key];
					this._items[index][key] = this._elems[index][key]["callback"](value, {"changedItem":{[key]:value}});
				}
			});

			return this._notify({"index":index, "values":value});
		}


	}

	// -------------------------------------------------------------------------

	set(index, key, value, options, ...args)
	{

		if (this._elems[index][key] && this._elems[index][key]["callback"])
		{
			value = this._elems[index][key]["callback"](value, {"changedItem":{[key]:value}});
		}

		super.set(index, key, value);

		return this._notify({"index":index, "values":{[key]:value}}, ...args);

	}

	// -------------------------------------------------------------------------

	/**
	 * Bind the store to an element.
	 *
	 * @param	{String}		key					Key to bind.
	 * @param	{Element}		elem				HTML Element to bind.
	 * @param	{Function}		callback			Callback function that is called when value is changed.
	 */
	bindTo(index, key, elem, callback)
	{

		let bound = ( elem.__bm_bindinfo && elem.__bm_bindinfo.bound ? true : false );
		if (!bound)
		{
			if (!this._elems[index])
			{
				this._elems[index] = {};
			}
			let info = this._elems[index];
			info[key] = this._elems[index][key] || {"elements":[]};
			info[key]["elements"].push(elem);
			info[key]["callback"] = callback;

			let direction = this._options["direction"];
			if (direction === "two-way" || direction === "one-way-reverse")
			{
				// Update store value when element's value changed
				let eventName = this._options["eventName"] || "change";
				elem.addEventListener(eventName, (() => {
					let value = ValueUtil.getValue(elem);

					this.set(index, key, value, null, elem);
				}).bind(this));
			}

			elem.__bm_bindinfo = { "bound": true, "index":index };
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Notify observers.
	 *
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	_notify(conditions, ...args)
	{

		if (this._options["direction"] !== "one-way-reverse" )
		{
			return this._notifyAsync(conditions, ...args);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify observers asynchronously.
	 *
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	_notifyAsync(conditions, ...args)
	{

		let index = conditions["index"];
		let values = conditions["values"];

		Object.keys(values).forEach((key) => {
			if (this._elems[index][key])
			{
				let value = this.get(index, key);
				for (let i = 0; i < this._elems[index][key]["elements"].length; i++)
				{
					ValueUtil.setValue(this._elems[index][key]["elements"][i], value, {"resources":this._options["resources"]});
				}
			}
		});

		return Promise.resolve();

	}

}
