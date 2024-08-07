// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ArrayStore from "../store/array-store.js";
import ValueUtil from "../util/value-util.js";
import {Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	Bindable store class
// =============================================================================

export default class BindableArrayStore extends ArrayStore
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	#__bindinfo = new WeakMap();
	#__elems = {};
	#__valueHandler;

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(options)
	{

		let defaults = {};
		super(Object.assign(defaults, options));

		this.#__valueHandler = Util.safeGet(options, "valueHandler", ValueUtil);

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	replace(index, value, ...args)
	{

		this.items[index] = value;

		if (this.#__elems[index])
		{
			Object.keys(this.items[index]).forEach((key) => {
				if (this.#__elems[index][key] && this.#__elems[index][key]["callback"])
				{
					let value = this.items[index][key];
					this.items[index][key] = this._elems[index][key]["callback"](value, {"changedItem":{[key]:value}});
				}
			});

			return this._notify({"index":index, "values":value}, ...args);
		}

	}

	// -------------------------------------------------------------------------

	set(index, key, value, options, ...args)
	{

		if (this.#__elems[index][key] && this.#__elems[index][key]["callback"])
		{
			value = this.#__elems[index][key]["callback"](value, {"changedItem":{[key]:value}});
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
			if (!this.#__elems[index])
			{
				this.#__elems[index] = {};
			}
			let info = this.#__elems[index];
			info[key] = this.#__elems[index][key] || {"elements":[]};
			info[key]["elements"].push(elem);
			info[key]["callback"] = callback;

			let direction = this.options["direction"];
			if (direction === "two-way" || direction === "one-way-reverse")
			{
				// Update store value when element's value changed
				let eventName = this.options["eventName"] || "change";
				elem.addEventListener(eventName, ((e) => {
					if (!e.detail || (e.detail && e.detail["triggeredBy"] !== "store"))
					{
						this.set(index, key, this.#__valueHandler.getValue(elem), null, elem);
					}
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

		if (this.options["direction"] !== "one-way-reverse" )
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

		let index = conditions["index"];
		let values = conditions["values"];

		Object.keys(values).forEach((key) => {
			if (this.#__elems[index][key])
			{
				let value = this.get(index, key);
				for (let i = 0; i < this.#__elems[index][key]["elements"].length; i++)
				{
					if (this.#__elems[index][key]["elements"][i] !== src)
					{
						this.#__valueHandler.setValue(this.#__elems[index][key]["elements"][i], value, {
							"resources":this.options["resources"],
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
