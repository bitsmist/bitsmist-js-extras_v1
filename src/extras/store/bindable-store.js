e/ =============================================================================
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

	clear(...args)
	{

		super.clear();

		return this._notify("*", ...args);

	}

	// -------------------------------------------------------------------------

	replace(value, ...args)
	{

		super.replace(value);

		Object.keys(this.items).forEach((key) => {
			if (this.#__elems[key] && this.#__elems[key]["callback"])
			{
				let value = this.items[key];
				this.items[key] = this._elems[key]["callback"](value, {"changedItem":{[key]:value}});
			}
		});

		return this._notify(value, ...args);

	}

	// -------------------------------------------------------------------------

	set(key, value, options, ...args)
	{

		if (this.#__elems[key] && this.#__elems[key]["callback"])
		{
			value = this.#__elems[key]["callback"](value, {"changedItem":{[key]:value}});
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

		let bound = ( this.#__bindinfo.get(elem) && this.#__bindinfo.get(elem)["bound"] ? true : false );
		if (!bound)
		{
			this.#__elems[key] = this.#__elems[key] || {"elements":[]};
			this.#__elems[key]["elements"].push(elem);
			this.#__elems[key]["callback"] = callback;

			let direction = this.options["direction"];
			if (direction === "two-way" || direction === "one-way-reverse")
			{
				// Update store value when element's value changed
				let eventName = this.options["eventName"] || "change";
				elem.addEventListener(eventName, ((e) => {
					if (!e.detail || (e.detail && e.detail["triggeredBy"] !== "store"))
					{
						this.set(key, this.#__valueHandler.getValue(elem));
					}
				}).bind(this));
			}

			this.#__bindinfo.set(elem, {"bound": true});
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

		Object.keys(conditions).forEach((key) => {
			if (this.#__elems[key])
			{
				let value = this.get(key);
				for (let i = 0; i < this.#__elems[key]["elements"].length; i++)
				{
					if (this.#__elems[key]["elements"][i] !== src)
					{
						this.#__valueHandler.setValue(this.#__elems[key]["elements"][i], value, {
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
