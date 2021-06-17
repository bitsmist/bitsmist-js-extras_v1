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

		super(options);

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
	set(key, value)
	{

		if (this.get(key) != value)
		{
			BITSMIST.v1.Util.safeSet(this._items, key, value);
			this.notifyAsync(key);
		}

	}

	// -----------------------------------------------------------------------------

	subscribe(id, handler, options)
	{

		if (typeof handler !== "function")
		{
			throw TypeError(`Notification handler is not a function. id=${id}`);
		}

		this._observers.push({"id":id, "handler":handler, "options":options});

	}

	// -------------------------------------------------------------------------

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
	 * Notify observers.
	 *
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	notify(conditions, ...args)
	{

		let chain = Promise.resolve();

		for (let i = 0; i < this._observers.length; i++)
		{
			chain = chain.then(() => {
				if (this._filter(conditions, this._observers[i]["options"], ...args))
				{
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
	 */
	notifyAsync(conditions, ...args)
	{

		for (let i = 0; i < this._observers.length; i++)
		{
			if (this._filter(conditions, this._observers[i]["options"], ...args))
			{
				this._observers[i]["handler"](conditions, ...args);
			}
		}

	}

}
