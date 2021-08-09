// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Observable store class
// =============================================================================

export default class ObservableStore extends BITSMIST.v1.Store
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

		let defaults = {"notifyOnChange":true, "async":false};
		super(Object.assign(defaults, options));

		this._observers = [];

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
	 * Set a value to the store and notify to subscribers if the value has been changed.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 */
	set(key, value, options)
	{

		let changedKeys = [];
		let holder = ( key ? this.get(key) : this._items );

		if (holder && typeof holder === "object")
		{
			this.__deepMerge(holder, value, changedKeys);
		}
		else
		{
			if (this.get(key) != value)
			{
				BITSMIST.v1.Util.safeSet(this._items, key, value);
				changedKeys.push(key);
			}
		}

		let notify = BITSMIST.v1.Util.safeGet(options, "notifyOnChange", BITSMIST.v1.Util.safeGet(this._options, "notifyOnChange"));
		if (notify && changedKeys.length > 0)
		{
			return this.notify(changedKeys);
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

		BITSMIST.v1.Util.assert(typeof handler === "function", `ObservableStore.subscribe(): Notification handler is not a function. id=${id}`, TypeError);

		this._observers.push({"id":id, "handler":handler, "options":options});

	}

	// -------------------------------------------------------------------------

	/**
	 * Unsubscribe from the store.
	 *
	 * @param	{String}		id					Subscriber's id.
	 */
	unsubscribe(id)
	{

		for (let i = 0; i < this._observers.length; i++)
		{
			if (this._obvservers[i].id == id)
			{
				this._observers.splice(i, 1);
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

		if (BITSMIST.v1.Util.safeGet(this._options, "async", false))
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

		for (let i = 0; i < this._observers.length; i++)
		{
			chain = chain.then(() => {
				if (this._filter(conditions, this._observers[i], ...args))
				{
					console.debug(`ObservableStore.notifySync(): Notifying. conditions=${conditions}, observer=${this._observers[i].id}`);
					return this._observers[i]["handler"](conditions, ...args);
				}
			});
		}

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify observers synchronously.
	 *
	 * @param	{String}		type				Notification type(=methodname).
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	notifyAsync(conditions, ...args)
	{

		for (let i = 0; i < this._observers.length; i++)
		{
			if (this._filter(conditions, this._observers[i]["options"], ...args))
			{
				console.debug(`ObservableStore.notifyAsync(): Notifying asynchronously. conditions=${conditions}, observer=${this._observers[i].id}`);
				this._observers[i]["handler"](conditions, ...args);
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

		this._options["notifyOnChange"] = false;

	}

	// -------------------------------------------------------------------------

	/**
	 * Unmute notification.
	 */
	unmute()
	{

		this._options["notifyOnChange"] = true;

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
	__deepMerge(obj1, obj2, changedKeys)
	{

		changedKeys = changedKeys || [];
		let key = "";

		BITSMIST.v1.Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", "ObservableStore.__deepMerge(): Parameters must be an object.", TypeError);

		Object.keys(obj2).forEach((key) => {
			if (Array.isArray(obj1[key]))
			{
				obj1[key] = obj1[key].concat(obj2[key]);
				changedKeys.push(key);
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
				if (obj1[key] != obj2[key])
				{
					obj1[key] = obj2[key];
					changedKeys.push(key);
				}
			}
		});

		return obj1;

	}

}
