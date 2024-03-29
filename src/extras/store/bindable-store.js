// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ValueUtil from "../util/value-util.js";
import {Store, Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	Bindable store class
// =============================================================================

export default class BindableStore extends Store
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(options)
	{

		let defaults = {};
		super(Object.assign(defaults, options));

		this._elems = {};
		this._valueHandler = Util.safeGet(options, "valueHandler", ValueUtil);

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	clear(...args)
	{

		super.clear();

		return this._notify("*", ...args);

	}

	// -------------------------------------------------------------------------

	replace(value, ...args)
	{

		this._items = value;

		Object.keys(this._items).forEach((key) => {
			if (this._elems[key] && this._elems[key]["callback"])
			{
				let value = this._items[key];
				this._items[key] = this._elems[key]["callback"](value, {"changedItem":{[key]:value}});
			}
		});

		return this._notify(value);

	}

	// -------------------------------------------------------------------------

	set(key, value, options, ...args)
	{

		if (this._elems[key] && this._elems[key]["callback"])
		{
			value = this._elems[key]["callback"](value, {"changedItem":{[key]:value}});
		}

		super.set(key, value);

		return this._notify({[key]:value}, ...args);

	}

	// -------------------------------------------------------------------------

	/**
	 * Bind the store to an element.
	 *
	 * @param	{String}		key					Key to bind.
	 * @param	{Element}		elem				HTML Element to bind.
	 * @param	{Function}		callback			Callback function that is called when value is changed.
	 */
	bindTo(key, elem, callback)
	{

		let bound = ( elem.__bm_bindinfo && elem.__bm_bindinfo.bound ? true : false );
		if (!bound)
		{
			this._elems[key] = this._elems[key] || {"elements":[]};
			this._elems[key]["elements"].push(elem);
			this._elems[key]["callback"] = callback;

			let direction = this._options["direction"];
			if (direction === "two-way" || direction === "one-way-reverse")
			{
				// Update store value when element's value changed
				let eventName = this._options["eventName"] || "change";
				elem.addEventListener(eventName, ((e) => {
					if (!e.detail || (e.detail && e.detail["triggeredBy"] !== "store"))
					{
						this.set(key, this._valueHandler.getValue(elem), null, elem);
					}
				}).bind(this));
			}

			elem.__bm_bindinfo = { "bound": true };
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
	 * @param	{HTMLElement}	src					Changed element.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	_notifyAsync(conditions, src, ...args)
	{

		Object.keys(conditions).forEach((key) => {
			if (this._elems[key])
			{
				let value = this.get(key);
				for (let i = 0; i < this._elems[key]["elements"].length; i++)
				{
					if (this._elems[key]["elements"][i] !== src)
					{
						this._valueHandler.setValue(this._elems[key]["elements"][i], value, {
							"resources":this._options["resources"],
							"triggerEvent": true,
							"triggerOptions": {
								"triggeredBy": "store",
							}
						});
					}
				}
			}
		});

		return Promise.resolve();

	}

}
