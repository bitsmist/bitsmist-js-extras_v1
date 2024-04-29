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
//	Observable store class
// =============================================================================

export default class ObservableStore extends Store
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	#__filter;
	#__observers = [];

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(options)
	{

		let defaults = {"notifyOnChange":true, "async":true};
		super(Object.assign(defaults, options));

		this.filter = Util.safeGet(this.options, "filter", () => { return true; } );

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Filter function.
	 *
	 * @type	{Function}
	 */
	get filter()
	{

		return this.#__filter;

	}

	set filter(value)
	{

		Util.assert(typeof value === "function", () => `Store.filter(setter): Filter is not a function. filter=${value}`, TypeError);

		this.#__filter = value;

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
	 * Set the value to the store and notify to subscribers if the value has been changed.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	set(key, value, options, ...args)
	{

		let changedItem = {};
		let holder = ( key ? this.get(key) : this.items );

		if (holder && typeof holder === "object")
		{
			this.#__deepMerge(holder, value, changedItem);
		}
		else
		{
			if (this.get(key) !== value)
			{
				Util.safeSet(this.items, key, value);
				changedItem[key] = value;
			}
		}

		let notify = Util.safeGet(options, "notifyOnChange", Util.safeGet(this.options, "notifyOnChange"));
		if (notify && Object.keys(changedItem).length > 0)
		{
			return this.notify(changedItem, ...args);
		}

	}

	// -----------------------------------------------------------------------------

	clear(options, ...args)
	{

		super.clear();

		return this.notify("*", ...args);

	}

	// -----------------------------------------------------------------------------

    /**
     * Replace all values in the store.
     *
     * @param   {String}        key                 Key to store.
     * @param   {Object}        value               Value to store.
     */
    replace(value, options, ...args)
    {

        this.items = {};
        this.#__deepMerge(this.items, value);

        let notify = Util.safeGet(options, "notifyOnChange", Util.safeGet(this.options, "notifyOnChange"));
        if (notify)
        {
            return this.notify(value, ...args);
        }

    }

	// -----------------------------------------------------------------------------

	/**
	 * Subscribe to the store.
	 *
	 * @param	{String}		id					Subscriber's id.
	 * @param	{Function}		handler				Handler function on notification.
	 * @param	{Object}		optons				Options passed to the handler on notification.
	 */
	subscribe(id, handler, options)
	{

		Util.assert(typeof handler === "function", () => `ObservableStore.subscribe(): Notification handler is not a function. id=${id}`, TypeError);

		this.#__observers.push({"id":id, "handler":handler, "options":options});

	}

	// -------------------------------------------------------------------------

	/**
	 * Unsubscribe from the store.
	 *
	 * @param	{String}		id					Subscriber's id.
	 */
	unsubscribe(id)
	{

		for (let i = 0; i < this.#__observers.length; i++)
		{
			if (this.#__observers[i].id === id)
			{
				this.#__observers.splice(i, 1);
				break;
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify dispacher. Call notifySync() or notifyAsync() according to the option.
	 *
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	notify(conditions, ...args)
	{

		if (Util.safeGet(this.options, "async", false))
		{
			return this.notifyAsync(conditions, ...args);
		}
		else
		{
			return this.notifySync(conditions, ...args);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify observers.
	 *
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	notifySync(conditions, ...args)
	{

		let chain = Promise.resolve();

		for (let i = 0; i < this.#__observers.length; i++)
		{
			chain = chain.then(() => {
				if (this.#__filter(conditions, this.#__observers[i], ...args))
				{
					console.debug(`ObservableStore.notifySync(): Notifying. conditions=${conditions}, observer=${this.#__observers[i].id}`);
					return this.#__observers[i]["handler"](conditions, this.#__observers[i], ...args);
				}
			});
		}

		return chain;

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
	notifyAsync(conditions, ...args)
	{

		for (let i = 0; i < this.#__observers.length; i++)
		{
			if (this.#__filter(conditions, this.#__observers[i], ...args))
			{
				console.debug(`ObservableStore.notifyAsync(): Notifying asynchronously. conditions=${conditions}, observer=${this.#__observers[i].id}`);
				this.#__observers[i]["handler"](conditions, this.#__observers[i], ...args);
			}
		}

		return Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Mute notification.
	 */
	mute()
	{

		this.options["notifyOnChange"] = false;

	}

	// -------------------------------------------------------------------------

	/**
	 * Unmute notification.
	 */
	unmute()
	{

		this.options["notifyOnChange"] = true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Deep merge two objects.
	 *
	 * @param	{Object}		obj1					Object1.
	 * @param	{Object}		obj2					Object2.
	 *
	 * @return  {Object}		Merged array.
	 */
	#__deepMerge(obj1, obj2, changedItem)
	{

		changedItem = changedItem || {};
		let key = "";

		Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", () => "ObservableStore.#__deepMerge(): Parameters must be an object.", TypeError);

		Object.keys(obj2).forEach((key) => {
			if (Array.isArray(obj1[key]))
			{
				obj1[key] = obj1[key].concat(obj2[key]);
				changedItem[key] = obj1[key];
			}
			else if (
				obj1.hasOwnProperty(key) &&
				obj1[key] && typeof obj1[key] === 'object' &&
				obj2[key] && typeof obj2[key] === 'object' &&
				!(obj1[key] instanceof HTMLElement)
			)
			{
				Util.deepMerge(obj1[key], obj2[key]);
			}
			else
			{
				if (obj1[key] !== obj2[key])
				{
					obj1[key] = obj2[key];
					changedItem[key] = obj1[key];
				}
			}
		});

		return obj1;

	}

}
