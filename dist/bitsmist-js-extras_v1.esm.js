import { Store, Util, Perk, Unit, AjaxUtil, URLUtil, ChainableStore } from '@bitsmist-js_v1/core';

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
//	Multi Chainable store class
// =============================================================================

class MultiStore extends Store
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
			Util.deepMerge(items, this._stores[i].items);
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
//	Array Store class
// =============================================================================

class ArrayStore extends Store
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

		this.items = Util.safeGet(this._options, "items", []);

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

		return this.clone();

	}

	set items(value)
	{

		Util.assert(Array.isArray(value), () => `ArrayStore.items(setter): Items is not an array. items=${value}`, TypeError);

		this._items = value;

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
     * Clear.
     */
	clear()
	{

		this._items = [];

	}

	// -------------------------------------------------------------------------

	/**
     * Clone contents as an object.
     *
	 * @return  {Object}		Cloned items.
     */
	clone()
	{

		return Util.deepMerge([], this._items);

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

		return Util.safeGet(this._items[index], key, defaultValue);

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

		if (options && options["merge"])
		{
			return Util.safeMerge(this._items[index], key, defaultValue);
		}
		else
		{
			Util.safeSet(this._items[index], key, value);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Remove from the list.
	 *
	 * @param	{String}		key					Key to store.
	 */
	remove(index, key)
	{

		Util.safeRemove(this._items[i], key);

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

		return Util.safeHas(this._items[index], key);

	}

}

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

class ObservableStore extends Store
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(options)
	{

		let defaults = {"notifyOnChange":true, "async":true};
		super(Object.assign(defaults, options));

		this._filter;
		this._observers = [];

		this.filter = Util.safeGet(this._options, "filter", () => { return true; } );

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

		return this._filter;

	}

	set filter(value)
	{

		Util.assert(typeof value === "function", () => `Store.filter(setter): Filter is not a function. filter=${value}`, TypeError);

		this._filter = value;

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
		let holder = ( key ? this.get(key) : this._items );

		if (holder && typeof holder === "object")
		{
			this.#__deepMerge(holder, value, changedItem);
		}
		else
		{
			if (this.get(key) !== value)
			{
				Util.safeSet(this._items, key, value);
				changedItem[key] = value;
			}
		}

		let notify = Util.safeGet(options, "notifyOnChange", Util.safeGet(this._options, "notifyOnChange"));
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

        this._items = {};
        this.#__deepMerge(this._items, value);

        let notify = Util.safeGet(options, "notifyOnChange", Util.safeGet(this._options, "notifyOnChange"));
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
			if (this._obvservers[i].id === id)
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

		if (Util.safeGet(this._options, "async", false))
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
					return this._observers[i]["handler"](conditions, this._observers[i], ...args);
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

		for (let i = 0; i < this._observers.length; i++)
		{
			if (this._filter(conditions, this._observers[i], ...args))
			{
				console.debug(`ObservableStore.notifyAsync(): Notifying asynchronously. conditions=${conditions}, observer=${this._observers[i].id}`);
				this._observers[i]["handler"](conditions, this._observers[i], ...args);
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
	#__deepMerge(obj1, obj2, changedItem)
	{

		changedItem = changedItem || {};

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
//	Formatter Util Class
// =============================================================================

class FormatterUtil
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
 	 * Format the value.
	 *
	 * @param	{string}		format				Format.
	 * @param	{string}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Formatted value.
	 */
	static format(format, value, options)
	{

		options = options || {};
		let ret = value;

		let tokens = FormatterUtil.#__bisect(format, "-");
		let type = tokens[0];
		let typeOption = (tokens.length > 1 ? tokens[1] : "");

		switch (type)
		{
		case "date":
		case "datetime":
		case "time":
			ret = this.formatDate(type, typeOption, value, options);
			break;
		case "price":
			ret = this.formatPrice(type, typeOption, value, options);
			break;
		case "number":
			ret = this.formatNumber(type, typeOption, value, options);
			break;
		default:
			// Interpolation
			if (format.charAt(0) === "`")
			{
				ret = this.interpolateResources(format, value, options);
				ret = this.interpolate(ret, options);
				ret = this.interpolateValue(ret, value, options);
				//ret = ret.replace("${value}", value);
			}
			break;
		}

		return String(ret);

	}

	// -------------------------------------------------------------------------

	/**
	 * Format price.
	 *
	 * @param	{String}		type				Type.
	 * @param	{String}		typeOption			Type specific option.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Formatted value.
	 */
	static formatPrice(type, typeOption, value, options)
	{

		let result = value;

		if (value)
		{
			value = parseInt(value).toLocaleString(navigator.language);
		}

		return result || "";

	}

	// -------------------------------------------------------------------------

	/**
	 * Format price.
	 *
	 * @param	{String}		type				Type.
	 * @param	{String}		typeOption			Type specific option.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {string}		Formatted value.
	 */
	static formatNumber(type, typeOption, value, options)
	{

		let result = value;

		if (value)
		{
			value = parseInt(value).toLocaleString(navigator.language);
		}

		return result || "";

	}

	// -------------------------------------------------------------------------

	/**
	 * Format date.
	 *
	 * @param	{String}		type				Type.
	 * @param	{String}		typeOption			Type specific option.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Formatted value.
	 */
	static formatDate(type, typeOption, value, options)
	{

		let result = value;
		let outFormat = typeOption;

		let dt;
		if (value.length === 8)
		{
			dt = new Date(`${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)}`);
		}
		else
		{
			dt = new Date(value);
		}

		switch (typeOption)
		{
		case "":
			result = dt.toString();
			break;
		default:
			let y = String(dt.getFullYear());
			let m = String(1 + dt.getMonth());
			let d = String(dt.getDate());
			let h = String(dt.getHours());
			let mi = String(dt.getMinutes());
			let s = String(dt.getSeconds());

			result = outFormat;
			result = result.replace(/YYYY/g, y.padStart(4, "0"));
			result = result.replace(/YY/g, y.slice(-2).padStart(2, "0"));
			result = result.replace(/MM/g, m.padStart(2, "0"));
			result = result.replace(/M/g, m.padStart(1, "0"));
			result = result.replace(/DD/g, d.padStart(2, "0"));
			result = result.replace(/D/g, d.padStart(1, "0"));
			result = result.replace(/hh/g, h.padStart(2, "0"));
			result = result.replace(/h/g, h.padStart(1, "0"));
			result = result.replace(/mm/g, mi.padStart(2, "0"));
			result = result.replace(/m/g, mi.padStart(1, "0"));
			result = result.replace(/ss/g, s.padStart(2, "0"));
			result = result.replace(/s/g, s.padStart(1, "0"));
			break;
		}

		return result || "";

	}

	// -------------------------------------------------------------------------

	/**
	 * Deformat the value.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Object}		Deformatted value.
	 */
	static deformat(format, value, options)
	{

		let ret = value;


		switch (format)
		{
		case "date-YYYY-MM-DD":
			ret = value.replace(/-/g, "");
			break;
		case "date-YYYY/MM/DD":
			ret = value.replace(/\//g, "");
			break;
		case "price":
			ret = this.deformatPrice(format, value);
			break;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Deformat price.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Price.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Deformatted price.
	 */
	static deformatPrice(format, value, options)
	{

		var result = "";

		if (value)
		{
			result = value.replace(/,/g, "").replace(/\//g, "").replace(/\\/g, "").replace("¥", "");
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Deformat date.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Date.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Deformatted date.
	 */
	static deformatDate(format, value, options)
	{

		var result = "";

		if (value)
		{
			result = value.replace(/,/g, "").replace(/\//g, "").replace(/\\/g, "");
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get current date time.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		dateDelimiter		Date delimiter.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Current date time.
	 */
	static getNow(format, dateDelimiter, options)
	{

		dateDelimiter = ( dateDelimiter ? dateDelimiter : "-" );
		var d = new Date();
		var now = d.getFullYear() + dateDelimiter + ("00" + (d.getMonth() + 1)).slice(-2) + dateDelimiter + ("00" + d.getDate()).slice(-2) + " " +
					("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2);

		return now;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get current date.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		dateDelimiter		Date delimiter.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Current date.
	 */
	static getToday(format, dateDelimiter, options)
	{

		dateDelimiter = ( dateDelimiter === undefined ? "-" : dateDelimiter );
		var d = new Date();
		var today = d.getFullYear() + dateDelimiter + ("00" + (d.getMonth() + 1)).slice(-2) + dateDelimiter + ("00" + d.getDate()).slice(-2);

		return today;

	}

	// -------------------------------------------------------------------------

	/**
	 * Sanitize string.
	 *
	 * @param	{String}		value				Value to sanitize.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{String}		Sanitized string.
	 */
	static sanitize(value, options)
	{

		if (typeof value === "string")
		{
			return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
		}
		else
		{
			return value;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Interpolate using parameters.
	 *
	 * @param	{String}		format				Format.
	 * @param	{Object}		options				Options
	 *
	 * @return  {Object}		Formatted value.
	 */
	static interpolate(format, options)
	{

		let ret = format;
		let parameters = options["interpolation"];

		if (parameters && format.indexOf("${") > -1)
		{
			ret = ret.replace(/\$\{(.+)\}/g, (_, name) => {
				let tokens = FormatterUtil.#__bisect(name, ":");
				let value = parameters[tokens[0]];

				if (!value)
				{
					value = "${" + name + "}";
				}
				else if (value && tokens.length > 1)
				{
					value = this.format(tokens[1], value, options);
				}

				return value || "";
			});
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Interpolate ${value} using parameters.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Value.
	 * @param	{Object}		options				Options
	 *
	 * @return  {Object}		Formatted value.
	 */
	static interpolateValue(format, value, options)
	{

		let ret = format;

		if (format.indexOf("${value") > -1)
		{
			ret = ret.replace(/\$\{value(.*)\}/g, (_, name) => {
				let tokens = FormatterUtil.#__bisect(name, ":");
				let tmp = value;

				if (tokens.length > 1)
				{
					tmp = this.format(tokens[1], value, options);
				}

				return tmp || "";
			});
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Interpolate using ResourceHandlers.
	 *
	 * @param	{String}		format				Format.
	 * @param	{String}		value				Value.
	 * @param	{Object}		resources			Resources.
	 *
	 * @return  {Object}		Formatted value.
	 */
	static interpolateResources(format, value, options)
	{

		let ret = format;
		let resources = options["resources"];

		if (resources && format.indexOf("#{") > -1)
		{
			ret = format.replace(/\#\{(.+)\}/g, (_, name) => {
				let arr = name.split(".");
				let resourceName = arr[0];
				let key = arr[1];
				return FormatterUtil.#__getResourceValue(resources, resourceName, value, key) || "";
			});
		}

		return ret;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get the resource value that matches given value.
	 *
	 * @param	{array}			resources			Resources.
	 * @param	{String}		resourceName		Resource name.
	 * @param	{String}		value				Code value.
	 * @param	{String}		key					Key.
	 *
	 * @return  {String}		Resource value.
	 */
	static #__getResourceValue(resources, resourceName, value, key)
	{

		let ret = value;

		if (resources && (resourceName in resources))
		{
			let item = resources[resourceName].getItem(value);
			if (item)
			{
				ret = item[key];
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Split the target string into two with the delimiter.
	 *
	 * @param	{String}		target				Target string to divide.
	 * @param	{String}		delimiter			Delimiter char.
	 *
	 * @return  {Arry}			Splitted string.
	 */
	static #__bisect(target, delimiter)
	{

		let ret = [];

		let pos = target.indexOf(delimiter);
		if (pos > -1)
		{
			ret.push(target.substring(0, pos));
			ret.push(target.substring(pos + 1));
		}
		else
		{
			ret.push(target);
		}

		return ret;

	}

}

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
//	Value Util Class
// =============================================================================

class ValueUtil
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Attribute name.
	 *
	 * @type	{String}
	 */
	static get attributeName()
	{

		return "bm-bind";

	}

	// -------------------------------------------------------------------------

	/**
	 * Formatter.
	 *
	 * @type	{Class}
	 */
	static get formatter()
	{

		return FormatterUtil;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Fill fields.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 * @param	{Ojbect}		items				Values to fill.
	 * @param	{Object}		masters				Master values.
	 * @param	{Object}		options				Options.
	 */
	static setFields(rootNode, items, options)
	{

		// Get elements with the attribute
		let elements = Util.scopedSelectorAll(rootNode, `[${this.attributeName}]`);
		if (rootNode.matches(`[${this.attributeName}]`))
		{
			elements.push(rootNode);
		}

		elements.forEach((element) => {
			let value;
			if (element.hasAttribute(`${this.attributeName}-in`))
			{
				value = this.getValue(element);
			}
			else
			{
				value = Util.safeGet(items, element.getAttribute(this.attributeName));
			}

			// Set
			if (value !== undefined)
			{
				this.setValue(element, value, options);
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get fields values.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 *
	 * @return  {Object}		Values.
	 */
	static getFields(rootNode, options)
	{

		let item = {};

		// Get elements with the attribute
		let elements = Util.scopedSelectorAll(rootNode, `[${this.attributeName}]`);
		if (rootNode.matches(`[${this.attributeName}]`))
		{
			elements.push(rootNode);
		}

		elements.forEach((element) => {
			// Get the value from the element
			let key = element.getAttribute(this.attributeName);
			let value = this.getValue(element);

			if (Array.isArray(item[key]))
			{
				// Same key already exists and it is an array
				// ---> add the value to the array
				if (value)
				{
					item[key].push(value);
				}
			}
			else if (item[key])
			{
				// Same key already exists and it is not an array
				// ---> create an array and add existing value and the value to the array
				if (value)
				{
					let items = [];
					items.push(item[key]);
					items.push(value);
					item[key]= items;
				}
			}
			else
			{
				item[key] = value;
			}
		});

		return item;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear fields.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 * @param	{Object}		options				Options.
	 */
	static clearFields(rootNode, options)
	{

		let target = Util.safeGet(options, "target", "");

		// Clear input elements
		let elements = Util.scopedSelectorAll(rootNode, `${target} input`, options);
		elements.forEach((element) => {
			this.clearValue(element, options);
		});

		// Clear select elements
		elements = Util.scopedSelectorAll(rootNode, `${target} select`, options);
		elements.forEach((element) => {
			this.clearValue(element, options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the element.
	 *
	 * @param	{HTMLElement}	element				Html element.
	 * @param	{String}		value				Value.
	 */
	static setValue(element, value, options)
	{

		options = options || {};
		//let result = ( value === undefined || value === null ? "" : String(value) );
		let result = ( value === undefined || value === null ? "" : value );

		// Format
		if (element.hasAttribute(`${this.attributeName}-format`) && !element.hasAttribute(`${this.attributeName}-formatted`))
		{
			result = this.formatter.format(element.getAttribute(`${this.attributeName}-format`), value, options);
			element.setAttribute(`${this.attributeName}-formatted`, "");
		}

		// Interpolate
		if (typeof(result) === "string" && result.charAt(0) === "`")
		{
			result = this.formatter.interpolateResources(result, value, options);
			result = this.formatter.interpolate(result, options);
			result = this.formatter.interpolateValue(result, value, options);
			result = result.replace(/^`|`$/g, '');
	//		ret = ret.replace("${value}", value);
		}

		// Set value
		let targets = element.getAttribute(`${this.attributeName}-out`);
		if (targets)
		{
			this._setValue_target(element, targets, result);
		}
		else if (element.hasAttribute("value"))
		{
			this._setValue_value(element, result);
		}
		else
		{
			this._setValue_element(element, result);
		}

		// Trigger change event
		if (options["triggerEvent"])
		{
			let e = new CustomEvent("change", {"detail":options["triggerOptions"]});
			element.dispatchEvent(e);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Get value from the element.
	 *
	 * @param	{Object}		element				Html element.
	 *
	 * @return  {String}		Value.
	 */
	static getValue(element, options)
	{

		let ret = undefined;

		let target = element.getAttribute(`${this.attributeName}-in`);
		if (target)
		{
			ret = this._getValue_target(element, target);
		}
		else
		{
			ret = this._getValue_element(element);
		}

		// Deformat
		if (element.hasAttribute(`${this.attributeName}-format`))
		{
			ret = this.formatter.deformat(element.getAttribute(`${this.attributeName}-format`), ret);
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear the element.
	 *
	 * @param	{Object}		element				Html element.
	 */
	static clearValue(element, options)
	{

		switch (element.type.toLowerCase())
		{
		case "select-one":
		case "select-multiple":
			element.selectedIndex = -1;
			break;
		case "checkbox":
		case "radio":
			element.checked = false;
			break;
		default:
			element.value = "";
			break;
		}

		// Trigger change event
		if (options && options["triggerEvent"])
		{
			let e = new CustomEvent("change", {"detail":options["triggerOptions"]});
			element.dispatchEvent(e);
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Set the value to the target positions.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{String}		targets				Target poisitions.
	 * @param	{String}		value				Value.
	 */
	static _setValue_target(element, targets, value)
	{

		let items = targets.split(",");
		for (let i = 0; i < items.length; i++)
		{
			let item = items[i].toLowerCase();
			switch (item)
			{
			case "text":
				element.innerText = value;
				break;
			case "html":
				element.innerHTML = value;
				break;
			case "outerhtml":
				element.outerHTML = value;
				break;
			default:
				element.setAttribute(item, value);
				break;
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the value attribute.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{String}		value				Value.
	 */
	static _setValue_value(element, value)
	{

		if (
			(element.tagName.toLowerCase() === "input" && element.type.toLowerCase() === "checkbox") ||
			(element.tagName.toLowerCase() === "input" && element.type.toLowerCase() === "radio")
		)
		{
			if (Array.isArray(value))
			{
				if (value.indexOf(element.getAttribute("value")) > -1)
				{
					element.checked = true;
				}
			}
			else
			{
				if (element.getAttribute("value") === value)
				{
					element.checked = true;
				}
			}
		}
		else
		{
			element.setAttribute("value", value);
		}

	}

	// -------------------------------------------------------------------------

	/**
  	 * Set the value to the element.
 	 *
 	 * @param	{Object}		element				Html element.
	 * @param	{String}		value				Value.
	 */
	static _setValue_element(element, value)
	{

		switch (element.tagName.toLowerCase())
		{
			case "select":
				element.value = value;
				break;
			case "input":
				switch (element.type.toLowerCase())
				{
				case "number":
				case "search":
				case "text":
					element.value = value;
					break;
				case "checkbox":
					element.checked = ( value && value != "0" ? true : false );
					break;
				case "radio":
					if (element.value === value)
					{
						element.checked = true;
					}
					break;
				}
				break;
			default:
				element.innerText = value;
				break;
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the value from the target positions.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{String}		target				Target poisition.
	 *
	 * @return  {String}		Value.
	 */
	static _getValue_target(element, target)
	{

		target = target.toLowerCase();
		let ret;

		switch (target)
		{
		case "text":
			ret = element.innerText;
			break;
		default:
			element.getAttribute(target);
			break;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
  	 * Get the value from the element.
 	 *
 	 * @param	{Object}		element				Html element.
	 *
	 * @return  {String}		Value.
	 */
	static _getValue_element(element)
	{

		let ret;

		switch (element.tagName.toLowerCase())
		{
		case "input":
			switch (element.type.toLowerCase())
			{
			case "radio":
			case "checkbox":
				if (element.checked)
				{
					ret = ( element.hasAttribute("value") ? element.getAttribute("value") : true );
				}
				else
				{
					ret = false;
				}
				break;
			default:
				ret = element.value;
				break;
			}
			break;
		case "select":
			// todo:multiselect
			ret = element.value;
			break;
		default:
			if (element.hasAttribute("selected"))
			{
				ret = element.getAttribute("value");
			}
			else
			{
				ret = element.textContent;
			}
			break;
		}

		return ret;

	}

}

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
//	Bindable store class
// =============================================================================

class BindableStore extends Store
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
//	Bindable store class
// =============================================================================

class BindableArrayStore extends ArrayStore
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

	clear(index, ...args)
	{

		super.clear(...args);

	}

	// -------------------------------------------------------------------------

	replace(index, value, ...args)
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
				elem.addEventListener(eventName, ((e) => {
					if (!e.detail || (e.detail && e.detail["triggeredBy"] !== "store"))
					{
						this.set(index, key, this._valueHandler.getValue(elem), null, elem);
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

		let index = conditions["index"];
		let values = conditions["values"];

		Object.keys(values).forEach((key) => {
			if (this._elems[index][key])
			{
				let value = this.get(index, key);
				for (let i = 0; i < this._elems[index][key]["elements"].length; i++)
				{
					if (this._elems[index][key]["elements"][i] !== src)
					{
						this._valueHandler.setValue(this._elems[index][key]["elements"][i], value, {
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
//	File Perk class
// =============================================================================

class FilePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__info = {
		"sectionName":	"file",
		"order":		110,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return FilePerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":FilePerk.#FilePerk_onDoApplySettings, "order":FilePerk.info["order"]});

	}

	// -----------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -----------------------------------------------------------------------------

	static #FilePerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		Object.entries(Util.safeGet(e.detail, "settings.file.targets", {})).forEach(([sectionName, sectionValue]) => {
			let options = {};
			options["type"] = Unit.get("setting", "system.options.type", "text/javascript");
			promises.push(AjaxUtil.loadScript(sectionValue["href"], options));
		});

		return Promise.all(promises);

	}

}

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
//	Error Perk class
// =============================================================================

class ErrorPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":	"error",
		"order":		120,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ErrorPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #ErrorPerk_onDoStart(sender, e, ex)
	{

		let serverNode = this.get("setting", "error.options.errorServer", this.get("setting", "system.error.options.errorServer"));
		serverNode = ( serverNode === true ? "bm-error" : serverNode );

		return this.cast("status.wait", [serverNode]).then(() => {
			let server = document.querySelector(serverNode);
			server.subscribe(this, Util.safeGet(e.detail, "settings.error"));
			DialogPerk.#__vault.get(unit)["server"] = server;
		});

	}

}

//// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================


// =============================================================================
//	Form util class
// =============================================================================

function FormUtil() {}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Show "bm-visible" elements if condition match.
 *
 * @param	{HTMLElement}	rootNode			Root node.
 * @param	{Object}		item				Item used to judge condition.
 */
FormUtil.showConditionalElements = function(rootNode, item)
{

	// Get elements with bm-visible attribute
	let elements = Util.scopedSelectorAll(rootNode, "[bm-visible]");

	// Show elements
	elements.forEach((element) => {
		let condition = element.getAttribute("bm-visible");
		if (Util.safeEval(condition, item))
		{
			element.style.removeProperty("display");
		}
		else
		{
			element.style.display = "none";
		}
	});

};

// -------------------------------------------------------------------------

/**
 * Hide "bm-visible" elements.
 *
 * @param	{HTMLElement}	rootNode			Root node.
 */
FormUtil.hideConditionalElements = function(rootNode)
{

	// Get elements with bm-visible attribute
	let elements = Util.scopedSelectorAll(rootNode, "[bm-visible]");

	// Hide elements
	elements.forEach((element) => {
		element.style.display = "none";
	});

};

// -----------------------------------------------------------------------------

/**
 * Build the form element.
 *
 * @param	{HTMLElement}	element				Element to build.
 * @param	{Object}		items				Items.
 * @param	{Object}		options				Options.
 */
FormUtil.build = function(element, items, options)
{

	switch (element.tagName.toLowerCase())
	{
	case "select":
		FormUtil._build_select(element, items, options);
		break;
	}

};

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Build the select element.
 *
 * @param	{HTMLElement}	element				Element to build.
 * @param	{Object}		items				Items.
 * @param	{Object}		options				Options.
 */
FormUtil._build_select = function(element, items, options)
{

	options = options || {};
	element.options.length = 0;

	if ("emptyItem" in options)
	{
		let text = ( "text" in options["emptyItem"] ? options["emptyItem"]["text"] : "");
		let value = ( "value" in options["emptyItem"] ? options["emptyItem"]["value"] : "");
		let option = document.createElement("option");
		option.text = text;
		option.value = value;
		element.appendChild(option);
	}

	Object.keys(items).forEach((id) => {
		let option = document.createElement("option");

		option.text = ( options["text"] ? items[id][options["text"]] : id );
		option.value = ( options["value"] ? items[id][options["value"]] : id );

		element.appendChild(option);
	});

	element.selectedIndex = -1;
	if ("defaultValue" in options)
	{
		element.value = options["defaultValue"];
	}

};

// -----------------------------------------------------------------------------

/**
 * Build the radio element.
 *
 * @param	{HTMLElement}	element				Element to build.
 * @param	{Object}		items				Items.
 * @param	{Object}		options				Options.
 */
FormUtil._build_radio = function(rootNode, fieldName, item)
{

	Object.keys(item.items).forEach((id) => {
		let label = document.createElement("label");
		let option = document.createElement("input");
		option.type = "radio";
		option.id = key;
		option.name = key;
		option.value = id;
		option.setAttribute("bm-bind", key);
		option.setAttribute("bm-submit", "");
		label.appendChild(option);
		label.appendChild(document.createTextNode(item.items[id]["title"]));
		element.appendChild(label);
	});

};

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
//	Element Perk class
// =============================================================================

class ElementPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":	"element",
		"order":		220,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ElementPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		ElementPerk.#__vault.set(unit, {
			"overlay":			null,
			"overlayPromise":	Promise.resolve(),
		});

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":ElementPerk.#ElementPerk_onDoApplySettings, "order":ElementPerk.info["order"]});

	}

	// -----------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -----------------------------------------------------------------------------

	static #ElementPerk_onDoApplySettings(sender, e, ex)
	{

		let order = ElementPerk.info["order"];

		Object.entries(Util.safeGet(e.detail, "settings.element.targets", {})).forEach(([sectionName, sectionValue]) => {
			this.use("event.add", sectionName, {
				"handler":	ElementPerk.ElementPerk_onDoProcess,
				"order":	order,
				"options":	{"attrs":sectionValue}
			});
		});

	}

	// -----------------------------------------------------------------------------

	static ElementPerk_onDoProcess(sender, e, ex)
	{

		let settings = ex.options["attrs"];
		let promises = [];

		Object.keys(settings).forEach((elementName) => {
			promises = promises.concat(ElementPerk.#__initElements(this, e, elementName, settings[elementName]));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Private
	// -------------------------------------------------------------------------

	/**
	 * Get target elements.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 *
 	 * @return  {Array}			HTML elements.
	 */
	static #__getTargetElements(unit, elementName, elementInfo)
	{

		let elements;

		if (elementInfo["selector"])
		{
			if (elementInfo["selector"] === "this" || elementInfo["selector"] === unit.tagName.toLowerCase())
			{
				elements = [unit];
			}
			else
			{
				elements = Util.scopedSelectorAll(unit, elementInfo["selector"]);
			}
		}
		else if (elementName === "this" || elementName === unit.tagName.toLowerCase())
		{
			elements = [unit];
		}
		else
		{
			elements = Util.scopedSelectorAll(unit, `#${elementName}`);
		}

		return elements;

	}

	// -------------------------------------------------------------------------

	/**
	 * Init elements.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 */
	static #__initElements(unit, eventInfo, elementName, elementInfo)
	{

		let ret = [];
		let elements = ElementPerk.#__getTargetElements(unit, elementName, elementInfo);

		for (let i = 0; i < elements.length; i++)
		{
			let waitForElement = elements[i];

			Object.keys(elementInfo).forEach((key) => {
				switch (key)
				{
				case "scroll":
					elements[i].scrollTo(elementInfo[key]);
					break;
				case "showLoader":
					ElementPerk.#__showOverlay(unit, elementInfo[key]);
					waitForElement = ElementPerk.#__vault.get(unit)["overlay"];
					break;
				case "hideLoader":
					ElementPerk.#__hideOverlay(unit, elementInfo[key]);
					waitForElement = ElementPerk.#__vault.get(unit)["overlay"];
					break;
				case "build":
					let resourceName = elementInfo[key]["resourceName"];
					FormUtil.build(elements[i], unit.get("inventory", `resource.resources.${resourceName}`).items, elementInfo[key]);
					break;
				case "attribute":
					ElementPerk.#__setAttributes(elements[i], elementInfo[key]);
					break;
				case "class":
					ElementPerk.#__setClasses(elements[i], elementInfo[key]);
					break;
				case "style":
					Object.keys(elementInfo[key]).forEach((styleName) => {
						elements[i].style[styleName] = elementInfo[key][styleName];
					});
					break;
				case "property":
					Object.keys(elementInfo[key]).forEach((propertyName) => {
						elements[i][propertyName] = elementInfo[key][propertyName];
					});
					break;
				case "autoFocus":
					elements[i].focus();
					break;
				case "selector":
				case "waitFor":
					break;
				default:
					console.warn(`ElementPerk.#__initAttr(): Invalid type. name=${unit.tagName}, eventName=${eventInfo.type}, type=${key}`);
					break;
				}
			});

			// Wait for transition/animation to finish
			if (elementInfo["waitFor"])
			{
				ret.push(ElementPerk.#__waitFor(unit, eventInfo, elementName, elementInfo, waitForElement));
			}
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Wait for transition to finish.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		eventInfo			Event info.
	 * @param	{String}		elementName			Element name.
	 * @param	{Object}		elementInfo			Element info.
	 * @param	{HTMLElement}	element				Element.
	 *
 	 * @return  {Promise}		Promise.
	 */
	static #__waitFor(unit, eventInfo, elementName, elementInfo, element)
	{

		let inTransition = false;

		switch (elementInfo["waitFor"])
		{
		case "transition":
			inTransition = (window.getComputedStyle(element).getPropertyValue('transition-duration') !== "0s");
			break;
		case "animation":
			inTransition = (window.getComputedStyle(element).getPropertyValue('animation-name') !== "none");
			break;
		default:
			console.warn(`ElementPerk.#__initAttr(): Invalid waitFor. name=${unit.tagName}, eventName=${eventInfo.type}, waitFor=${elementInfo["waitFor"]}`);
			break;
		}

		Util.warn(inTransition, `ElementPerk.#__initAttr(): Element not in ${elementInfo["waitFor"]}. name=${unit.tagName}, eventName=${eventInfo.type}, elementName=${elementName}`);

		return new Promise((resolve, reject) => {
			// Timeout timer
			let timer = setTimeout(() => {
				reject(`ElementPerk.#__initAttr(): Timed out waiting for ${elementInfo["waitFor"]}. name=${unit.tagName}, eventName=${eventInfo.type}, elementName=${elementName}`);
			}, unit.get("setting", "status.options.waitForTimeout", unit.get("setting", "system.status.options.waitForTimeout", 10000)));

			// Resolve when finished
			element.addEventListener(`${elementInfo["waitFor"]}end`, () => {
				clearTimeout(timer);
				resolve();
			}, {"once":true});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Set attributes to element.
	 *
	 * @param	{HTMLElement}	element				Element to set classes.
	 * @param	{Object}		options				Options.
	 */
	static #__setAttributes(element, options)
	{

		Object.keys(options).forEach((mode) => {
			switch (mode)
			{
			case "add":
				Object.keys(options[mode]).forEach((attrName) => {
					element.setAttribute(attrName, options[mode][attrName]);
				});
				break;
			case "remove":
				for (let i = 0; i < options[mode].length; i++)
				{
					element.removeAttribute(options[mode][i]);
				}				break;
			default:
				console.warn(`ElementPerk.#__setAttributes(): Invalid command. element=${element.tagName}, command=${mode}`);
				break;
			}
		});

	}


	// -------------------------------------------------------------------------

	/**
	 * Set classes to element.
	 *
	 * @param	{HTMLElement}	element				Element to set classes.
	 * @param	{Object}		options				Options.
	 */
	static #__setClasses(element, options)
	{

		setTimeout(() => {
			Object.keys(options).forEach((mode) => {
				switch (mode)
				{
				case "add":
					element.classList.add(options[mode]);
					break;
				case "remove":
					element.classList.remove(options[mode]);
					break;
				case "replace":
					element.setAttribute("class", options[mode]);
					break;
				default:
					console.warn(`ElementPerk.#__setClasses(): Invalid command. element=${element.tagName}, command=${mode}`);
					break;
				}
			});
		}, 1);

	}

	// -------------------------------------------------------------------------

	/**
	 * Create an overlay if not exists.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__createOverlay(unit, options)
	{

		let overlay = ElementPerk.#__vault.get(unit)["overlay"];

		if (!overlay)
		{
			overlay = document.createElement("div");
			overlay.classList.add("overlay");
			unit.get("inventory", "basic.unitRoot").appendChild(overlay);
			ElementPerk.#__vault.get(unit)["overlay"] = overlay;
		}

		return overlay

	}

	// -------------------------------------------------------------------------

	/**
	 * Install an event handler to close when clicked.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__closeOnClick(unit, options)
	{

		ElementPerk.#__vault.get(unit)["overlay"].addEventListener("click", (e) => {
			if (e.target === e.currentTarget && typeof unit.close === "function")
			{
				unit.close({"reason":"cancel"});
			}
		}, {"once":true});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get which effect is applied to overlay.
	 *
	 * @param	{HTMLElement}	overlay				Overlay element.
	 *
	 * @return 	{String}		Effect ("transition" or "animation").
	 */
	static #__getEffect(overlay)
	{

		let effect = "";

		if (window.getComputedStyle(overlay).getPropertyValue('transition-duration') !== "0s")
		{
			effect = "transition";
		}
		else if (window.getComputedStyle(overlay).getPropertyValue('animation-name') !== "none")
		{
			effect = "animation";
		}

		return effect;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Show overlay.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__showOverlay(unit, options)
	{

		let overlay = ElementPerk.#__createOverlay(unit);

		// Add close on click event handler
		if (Util.safeGet(options, "closeOnClick"))
		{
			ElementPerk.#__closeOnClick(unit);
		}

		window.getComputedStyle(overlay).getPropertyValue("visibility"); // Recalc styles

		let addClasses = ["show"].concat(Util.safeGet(options, "addClasses", []));
		overlay.classList.add(...addClasses);
		overlay.classList.remove(...Util.safeGet(options, "removeClasses", []));

		let effect = ElementPerk.#__getEffect(overlay);
		if (effect)
		{
			ElementPerk.#__vault.get(unit)["overlayPromise"].then(() => {
				ElementPerk.#__vault.get(unit)["overlayPromise"] = new Promise((resolve, reject) => {
					overlay.addEventListener(`${effect}end`, () => {
						resolve();
					}, {"once":true});
				});
			});
		}
		else
		{
			effect = Promise.resolve();
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Hide overlay.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__hideOverlay(unit, options)
	{

		let overlay = ElementPerk.#__vault.get(unit)["overlay"];

		ElementPerk.#__vault.get(unit)["overlayPromise"].then(() => {
			window.getComputedStyle(overlay).getPropertyValue("visibility"); // Recalc styles

			let removeClasses = ["show"].concat(Util.safeGet(options, "removeClasses", []));
			overlay.classList.remove(...removeClasses);
			overlay.classList.add(...Util.safeGet(options, "addClasses", []));
		});
	}

}

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
//	Resource Perk class
// =============================================================================

class ResourcePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__info = {
		"sectionName":		"resource",
		"order":			300,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ResourcePerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("inventory", "resource.resources", {});
		unit.upgrade("spell", "resource.addHandler", ResourcePerk.#_addHandler);

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":ResourcePerk.#ResourcePerk_onDoApplySettings, "order":ResourcePerk.info["order"]});
		unit.use("event.add", "doFetch", {"handler":ResourcePerk.#ResourcePerk_onDoFetch, "order":ResourcePerk.info["order"]});
		unit.use("event.add", "doSubmit", {"handler":ResourcePerk.#ResourcePerk_onDoSubmit, "order":ResourcePerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #ResourcePerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		Object.entries(Util.safeGet(e.detail, "settings.resource.handlers", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(ResourcePerk.#_addHandler(this, sectionName, sectionValue));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static #ResourcePerk_onDoFetch(sender, e, ex)
	{

		let promises = [];

		Object.keys(this.get("inventory", "resource.resources")).forEach((resourceName) => {
			let resource = this.get("inventory", `resource.resources.${resourceName}`);
			if (resource.options.get("autoFetch", true))
			{
				resource.target["id"] = Util.safeGet(e.detail, "id", resource.target["id"]);
				resource.target["parameters"] = Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

				promises.push(resource.load(resource.target["id"], resource.target["parameters"]).then(() => {
					e.detail.items = resource.items;
				}));
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static #ResourcePerk_onDoSubmit(sender, e, ex)
	{

		let promises = [];
		let submitItem = Util.safeGet(e.detail, "items");

		Object.keys(this.get("inventory", "resource.resources")).forEach((resourceName) => {
			let resource = this.get("inventory", `resource.resources.${resourceName}`);
			if (resource.options.get("autoSubmit", true)) {
				let method = Util.safeGet(e.detail, "method", resource.target["method"] || "update"); // Default is "update"
				let id = Util.safeGet(e.detail, "id", resource.target["id"]);
				let parameters = Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

				promises.push(this.get("inventory", `resource.resources.${resourceName}`)[method](id, submitItem, parameters));
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
     * Add resource.
     *
     * @param	{Unit}			unit				Unit.
     * @param	{string}		handlerName			Resource handler name.
     * @param	{array}			options				Options.
	 *
	 * @return 	{Promise}		Promise.
     */
	static #_addHandler(unit, handlerName, options)
	{

		Util.assert(options["handlerClassName"], () => `ResourcePerk.#_addHandler(): handler class name not specified. name=${unit.tagName}, handlerName=${handlerName}`);

		let promise = Promise.resolve();
		let handler = unit.get("inventory", `resource.resources.${handlerName}`);

		if (!handler)
		{
			handler = this.createHandler(options["handlerClassName"], unit, handlerName, options);
			unit.set("inventory", `resource.resources.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

	}

}

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
//	Validation Perk Class
// =============================================================================

class ValidationPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__info = {
		"sectionName":		"validation",
		"order":			310,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ValidationPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("inventory", "validation.validators", {});
		unit.upgrade("inventory", "validation.validationResult", {});
		unit.upgrade("spell", "validation.addHandler", ValidationPerk.#_addHandler);
		unit.upgrade("spell", "validation.validate", ValidationPerk.#_validate);

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":ValidationPerk.ValidationPerk_onDoApplySettings, "order":ValidationPerk.info["order"]});
		unit.use("event.add", "doValidate", {"handler":ValidationPerk.ValidationPerk_onDoValidate, "order":ValidationPerk.info["order"]});
		unit.use("event.add", "doReportValidity", {"handler":ValidationPerk.ValidationPerk_onDoReportValidity, "order":ValidationPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static ValidationPerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		Object.entries(Util.safeGet(e.detail, "settings.validation.handlers", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(ValidationPerk.#_addHandler(this, sectionName, sectionValue));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static ValidationPerk_onDoValidate(sender, e, ex)
	{

		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			Util.assert(this.get("inventory", `validation.validators.${validatorName}`), () => `ValidationPerk.ValidationPerk_onDoValidate(): Validator not found. name=${this.tagName}, validatorName=${validatorName}`);

			let items = Util.safeGet(e.detail, "items");
			let rules = this.get("setting", `validation.handlers.${validatorName}.rules`);
			let options = this.get("setting", `validation.handlers.${validatorName}.handlerOptions`);

			this.get("inventory", `validation.validators.${validatorName}`).checkValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------

	static ValidationPerk_onDoReportValidity(sender, e, ex)
	{

		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			Util.assert(this.get("inventory", () => `validation.validators.${validatorName}`), `ValidationPerk.ValidationPerk_onDoReportValidity(): Validator not found. name=${this.tagName}, validatorName=${validatorName}`);

			let items = Util.safeGet(e.detail, "items");
			let rules = this.get("setting", `validation.handlers.${validatorName}.rules`);
			let options = this.get("setting", `validation.handlers.${validatorName}.handlerOptions`);

			this.get("inventory", `validation.validators.${validatorName}`).reportValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------
	//  Spells (unit)
	// -------------------------------------------------------------------------

	/**
     * Add the validator.
     *
     * @param	{Unit}			unit				Unit.
     * @param	{string}		handlerName			Validation handler name.
     * @param	{array}			options				Options.
     */
	static #_addHandler(unit, handlerName, options)
	{

		let promise = Promise.resolve();
		let handler = unit.get("inventory", `validation.validators.${handlerName}`);

		if (options["handlerClassName"] && !handler)
		{
			handler = this.createHandler(options["handlerClassName"], unit, handlerName, options);
			unit.set("inventory", `validation.validators.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Validate the form.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #_validate(unit, options)
	{

		options = options || {};
		unit.set("inventory", "validation.validationResult.result", true);

		return Promise.resolve().then(() => {
			console.debug(`ValidationPerk._validate(): Validating unit. name=${unit.tagName}, id=${unit.uniqueId}`);
			return unit.cast("event.trigger", "beforeValidate", options);
		}).then(() => {
			return unit.cast("event.trigger", "doValidate", options);
		}).then(() => {
			if (unit.get("inventory", "validation.validationResult.result"))
			{
				console.debug(`ValidationPerk._validate(): Validation Success. name=${unit.tagName}, id=${unit.uniqueId}`);
				return unit.cast("event.trigger", "doValidateSuccess", options);
			}
			else
			{
				console.debug(`ValidationPerk._validate(): Validation Failed. name=${unit.tagName}, id=${unit.uniqueId}`);
				return unit.cast("event.trigger", "doValidateFail", options);
			}
		}).then(() => {
			if (!unit.get("inventory", "validation.validationResult.result"))
			{
				return unit.cast("event.trigger", "doReportValidity", options);
			}
		}).then(() => {
			return unit.cast("event.trigger", "afterValidate", options);
		});

	}

}

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
//	Form Perk Class
// =============================================================================

class FormPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"form",
		"order":			310,
		"depends":			"ValidationPerk",
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return FormPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		FormPerk.#__vault.set(unit, {
			"lastItems":	{},
		});

		// Upgrade unit
		unit.upgrade("inventory", "form.cancelSubmit", false);
		unit.upgrade("skill", "form.build", FormPerk.#_build);
		unit.upgrade("spell", "form.submit", FormPerk.#_submit);

		// Add event handlers
		unit.use("event.add", "afterTransform", {"handler":FormPerk.#FormPerk_onAfterTransform, "order":FormPerk.info["order"]});
		unit.use("event.add", "doClear", {"handler":FormPerk.#FormPerk_onDoClear, "order":FormPerk.info["order"]});
		unit.use("event.add", "beforeFill", {"handler":FormPerk.#FormPerk_onBeforeFill, "order":FormPerk.info["order"]});
		unit.use("event.add", "doFill", {"handler":FormPerk.#FormPerk_onDoFill, "order":FormPerk.info["order"]});
		unit.use("event.add", "doCollect", {"handler":FormPerk.#FormPerk_onDoCollect, "order":FormPerk.info["order"]});
		unit.use("event.add", "afterCollect", {"handler":FormPerk.#FormPerk_onAfterCollect, "order":FormPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #FormPerk_onAfterTransform(sender, e, ex)
	{

		FormUtil.hideConditionalElements(this);

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onDoClear(sender, e, ex)
	{

		if (this.get("setting", "form.options.autoClear", true))
		{
			let target = Util.safeGet(e.detail, "target", "");
			let options = Object.assign({"target":target, "triggerEvent":"change"}, e.detail.options);

			ValueUtil.clearFields(this, options);
		}

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onBeforeFill(sender, e, ex)
	{

		if (e.detail.refill)
		{
			e.detail.items = FormPerk.#__vault.get(this)["lastItems"];
		}

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onDoFill(sender, e, ex)
	{

		if (this.get("setting", "form.options.autoFill", true))
		{
			let rootNode = ( e.detail && "selector" in e.detail ? Util.scopedSelectorAll(this, e.detail.rootNode)[0] : this );
			ValueUtil.setFields(rootNode, e.detail.items, {"resources":this.get("inventory", "resource.resources"), "triggerEvent":true});
			FormUtil.showConditionalElements(this, e.detail.items);
		}

		FormPerk.#__vault.get(this)["lastItems"] = e.detail.items;

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onDoCollect(sender, e, ex)
	{

		if (this.get("setting", "form.options.autoCollect", true))
		{
			e.detail.items = ValueUtil.getFields(this);
		}

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onAfterCollect(sender, e, ex)
	{

		// Collect only submittable data
		if (this.get("setting", "form.options.autoCrop", true))
		{
			e.detail.items = FormPerk.#__collectData(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 *
	 * Build the element.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{HTMLElement}	element				HTMLElement to build.
	 * @param	{Object}		items				Items to fill elements.
	 * @param	{Object}		options				Options.
	 */
	static #_build(unit, element, items, options)
	{

		FormUtil.build(element, items, options);

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Submit the form.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_submit(unit, options)
	{

		options = options || {};
		unit.set("inventory", "form.cancelSubmit", false);

		// Collect values
		await FormPerk.#__collect(unit, options);

		// Validate values
		if (unit.get("setting", "form.options.autoValidate", true))
		{
			options["validatorName"] = options["validatorName"] || unit.get("setting", "form.options.validatorName");
			await unit.cast("validation.validate", options);
			if (!unit.get("inventory", "validation.validationResult.result"))
			{
				unit.set("inventory", "form.cancelSubmit", true);
			}
		}
		// Submit values
		console.debug(`FormPerk.#_submit(): Submitting unit. name=${unit.tagName}, id=${unit.id}`);
		await unit.cast("event.trigger", "beforeSubmit", options);
		if (!unit.get("inventory", "form.cancelSubmit"))
		{
			await unit.cast("event.trigger", "doSubmit", options);
			console.debug(`FormPerk.#_submit(): Submitted unit. name=${unit.tagName}, id=${unit.id}`);
			await unit.cast("event.trigger", "afterSubmit", options);
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Collect data from the form.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #__collect(unit, options)
	{

		console.debug(`FormPerk.#__collect(): Collecting data. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeCollect", options);
		await unit.cast("event.trigger", "doCollect", options);
		console.debug(`FormPerk.#__collect(): Collected data. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "afterCollect", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Collect submittable data.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		items				Data to submit.
	 *
	 * @return  {Object}		Collected data.
	 */
	static #__collectData(unit, items)
	{

		let submitItem = {};

		// Collect values only from nodes that has [bm-submit] attribute.
		let nodes = Util.scopedSelectorAll(unit, "[bm-submit]");
		nodes = Array.prototype.slice.call(nodes, 0);
		nodes.forEach((elem) => {
			let key = elem.getAttribute("bm-bind");
			submitItem[key] = items[key];
		});

		return submitItem;

	}

}

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
//	List Perk Class
// =============================================================================

class ListPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"list",
		"order":			310,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ListPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		ListPerk.#__vault.set(unit, {
			"lastItems":	{},
			"listRootNode":	null,
		});

		// Upgrade unit
		unit.upgrade("inventory", "list.active.skinName", "");
		unit.upgrade("skill", "list.get", ListPerk.#_getItems);
		unit.upgrade("skill", "list.update", ListPerk.#_updateRow);
		unit.upgrade("skill", "list.add", ListPerk.#_addRow);
		unit.upgrade("spell", "list.transformRow", ListPerk.#_transformRow);

		// Add event handlers
		unit.use("event.add", "afterTransform", {"handler":ListPerk.#ListPerk_onAfterTransform, "order":ListPerk.info["order"]});
		unit.use("event.add", "doClear", {"handler":ListPerk.#ListPerk_onDoClear, "order":ListPerk.info["order"]});
		unit.use("event.add", "beforeFill", {"handler":ListPerk.#ListPerk_onBeforeFill, "order":ListPerk.info["order"]});
		unit.use("event.add", "doFill", {"handler":ListPerk.#ListPerk_onDoFill, "order":ListPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #ListPerk_onAfterTransform(sender, e, ex)
	{

		let rootNode = this.get("setting", "list.options.listRootNode");
		let unitRoot = this.get("inventory", "basic.unitRoot");
		ListPerk.#__vault.get(this)["listRootNode"] = ( rootNode ? Util.scopedSelectorAll(unitRoot, rootNode)[0] : unitRoot );
		Util.assert(ListPerk.#__vault.get(this)["listRootNode"], () => `List.ListPerk_onAfterTransform(): List root node not found. name=${this.tagName}, listRootNode=${this.get("setting", "setting.listRootNode")}`);

		return ListPerk.#_transformRow(this, this.get("setting", "list.options.rowSkinName", "row"));

	}

	// -------------------------------------------------------------------------

	static #ListPerk_onDoClear(sender, e, ex)
	{

		ListPerk.#__vault.get(this)["listRootNode"].innerHTML = "";
		this.set("inventory", "list.rows", []);

	}

	// -------------------------------------------------------------------------

	static #ListPerk_onBeforeFill(sender, e, ex)
	{

		if (e.detail.refill)
		{
			e.detail.items = ListPerk.#__vault.get(this)["lastItems"];
		}

	}

	// -------------------------------------------------------------------------

	static async #ListPerk_onDoFill(sender, e, ex)
	{

		let builder = ( Util.safeGet(e.detail.options, "async", this.get("setting", "list.options.async", true)) ? ListPerk.#__buildAsync : ListPerk.#__buildSync );
		let fragment = document.createDocumentFragment();
		this.set("inventory", "list.rows", []);

		await this.cast("event.trigger", "beforeBuildRows");

		await builder(this, fragment, e.detail.items, e.detail);
		ListPerk.#__vault.get(this)["listRootNode"].replaceChildren(fragment);
		ListPerk.#__vault.get(this)["lastItems"] = e.detail.items;

		await this.cast("event.trigger", "afterBuildRows");

	}

	// -------------------------------------------------------------------------
	//  Skills (Units)
	// -------------------------------------------------------------------------

	static #_addRow(unit, items, options)
	{

		let builder = (unit.get("setting", "list.options.async", true) ? ListPerk.#__buildAsync : ListPerk.#__buildSync);
		builder(unit, ListPerk.#__vault.get(unit)["listRootNode"], items, options);
		/*
		let activeRowSkinName = unit.get("inventory", "list.active.skinName");
		let skinInfo = unit.get("inventory", "skin.skins");
		let skin = skinInfo[activeRowSkinName].HTML;
		let rowEvents = unit.get("setting", "list.rowevents");

		// Install row element event handlers
		if (rowEvents)
		{
			Object.keys(rowEvents).forEach((elementName) => {
				unit.use("event.init", elementName, rowEvents[elementName], element);
			});
		}

		// Call event handlers
		unit.use("event.triggerSync", "beforeFillRow", options);
		FormUtil.showConditionalElements(element, options["item"]);
		if (unit.get("setting", "list.options.autoFill", true))
		{
			ValueUtil.setFields(element, options["item"], {"resources":unit.get("inventory", "resource.resources")});
		}
		unit.use("event.triggerSync", "doFillRow", options);
		unit.use("event.triggerSync", "afterFillRow", options);

		let element = ListPerk.#__createRow(skin);
//		this._listRootNode.appendChild(element);
		ListPerk.#__vault.get(unit)["listRootNode"].appendChild(element);
		*/

	}

	// -------------------------------------------------------------------------

	static async #_updateRow(unit, index, item)
	{

		let options = {
			"no":		index,
			"item":		item,
		};
		let rows = unit.get("inventory", "list.rows");
		let element = rows[index];

		if (unit.get("setting", "list.options.async", true))
		{
			// Async
			await unit.cast("event.trigger", "beforeFillRow", options);
			FormUtil.showConditionalElements(element, item);
			if (unit.get("setting", "list.options.autoFill", true))
			{
				ValueUtil.setFields(element, item, {"resources":unit.get("inventory", "inventory", "resource.resources")});
			}
			await unit.cast("event.trigger", "doFillRow", options);
			await unit.cast("event.trigger", "afterFillRow", options);
		} else {
			// Sync
			unit.use("event.triggerSync", "beforeFillRow", options);
			FormUtil.showConditionalElements(element, item);
			if (unit.get("setting", "list.options.autoFill", true))
			{
				ValueUtil.setFields(element, item, {"resources":unit.get("inventory", "resource.resources")});
			}
			unit.use("event.triggerSync", "doFillRow", options);
			unit.use("event.triggerSync", "afterFillRow", options);
		}

	}

	// -------------------------------------------------------------------------

	static #_getItems(unit, options)
	{

		let items = [];
		let rows = unit.get("inventory", "list.rows");
		let shaper = (options && options["shaper"]) || ((item) => {return item});

		for (let i = 0; i < rows.length; i++)
		{
			let item = ValueUtil.getFields(rows[i]);
			shaper(item);
			items.push(item);
		}

		return items;

	}

	// -------------------------------------------------------------------------
	//  Spells (Units)
	// -------------------------------------------------------------------------

	/**
	 * Change the row skin.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{String}		skinName			Skin name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_transformRow(unit, skinName, options)
	{

		options = options || {};

		if (unit.get("inventory", "list.active.skinName") === skinName)
		{
			return Promise.resolve();
		}

		console.debug(`ListPerk.#_transformRow(): Switching the row skin. name=${unit.tagName}, rowSkinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("skin.summon", skinName);
		unit.set("inventory", "list.active.skinName", skinName);
		await unit.cast("event.trigger", "afterTransformRow", options);
		console.debug(`ListPerk.#_transformRow(): Switched the row skin. name=${unit.tagName}, rowSkinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

	}

	// -------------------------------------------------------------------------
	//  Private
	// -------------------------------------------------------------------------

	/**
	 * Build rows synchronously.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 * @param	{Object}		items				Items.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #__buildSync(unit, fragment, items, options)
	{

		let skinInfo = unit.get("inventory", "skin.skins");
		let activeRowSkinName = unit.get("inventory", "list.active.skinName");
		let rows = unit.get("inventory", "list.rows", []);

		Util.assert(skinInfo[activeRowSkinName], () => `List.#__buildSync(): Row skin not loaded yet. name=${unit.tagName}, rowSkinName=${activeRowSkinName}`);

		let rowEvents = unit.get("setting", "list.rowevents");
		let skin = skinInfo[activeRowSkinName].HTML;

		let chain = Promise.resolve();
		for (let i = 0; i < items.length; i++)
		{
			chain = chain.then(async () => {
				options["no"] = i;
				options["item"] = items[i];

				// Append a row
				let element = ListPerk.#__createRow(skin);
				fragment.appendChild(element);
				options["element"] = element;
				rows.push(element);

				// Install row element event handlers
				if (rowEvents)
				{
					Object.keys(rowEvents).forEach((elementName) => {
						unit.use("event.init", elementName, rowEvents[elementName], element);
					});
				}

				await unit.cast("event.trigger", "beforeFillRow", options);
				if (unit.get("setting", "list.options.autoFill", true))
				{
					// Fill fields
					FormUtil.showConditionalElements(element, options["item"]);
					ValueUtil.setFields(element, options["item"], {"resources":unit.get("inventory", "inventory", "resource.resources")});
				}
				await unit.cast("event.trigger", "doFillRow", options);
				await unit.cast("event.trigger", "afterFillRow", options);
			});
		}


		return chain.then(() => {
			unit.set("inventory", "list.rows", rows);

			delete options["no"];
			delete options["item"];
			delete options["element"];
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Build rows asynchronously.
	 *
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 */
	static #__buildAsync(unit, fragment, items, options)
	{

		options = options || {};
		items = items || [];
		let skinInfo = unit.get("inventory", "skin.skins");
		let activeRowSkinName = unit.get("inventory", "list.active.skinName");
		let rows = unit.get("inventory", "list.rows", []);

		Util.assert(skinInfo[activeRowSkinName], () => `List.#__buildAsync(): Row skin not loaded yet. name=${unit.tagName}, rowSkinName=${activeRowSkinName}`);

		let rowEvents = unit.get("setting", "list.rowevents");
		let skin = skinInfo[activeRowSkinName].HTML;

		for (let i = 0; i < items.length; i++)
		{
			options["no"] = i;
			options["item"] = items[i];

			// Append a row
			let element = ListPerk.#__createRow(skin);
			fragment.appendChild(element);
			options["element"] = element;
			rows.push(element);

			// Install row element event handlers
			if (rowEvents)
			{
				Object.keys(rowEvents).forEach((elementName) => {
					unit.use("event.init", elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			unit.use("event.triggerSync", "beforeFillRow", options);
			FormUtil.showConditionalElements(element, options["item"]);
			if (unit.get("setting", "list.options.autoFill", true))
			{
				ValueUtil.setFields(element, options["item"], {"resources":unit.get("inventory", "resource.resources")});
			}
			unit.use("event.triggerSync", "doFillRow", options);
			unit.use("event.triggerSync", "afterFillRow", options);
		}

		unit.set("inventory", "list.rows", rows);

		delete options["no"];
		delete options["item"];
		delete options["element"];

	}

	// -------------------------------------------------------------------------

	/**
	 * Create a row element.
	 *
	 * @param	{String}		skin					Skin.
	 *
	 * @return  {HTMLElement}	Row element.
	 */
	static #__createRow(skin)
	{

		let ele = document.createElement("tbody");
		ele.innerHTML = skin;
		let element = ele.firstElementChild;
		element.setAttribute("bm-powered", "");

		return element;

	}

	// -------------------------------------------------------------------------

	/**
	 * Collect submittable data.
	 *
     * @param	{Unit}			unit				Unit.
	 *
	 * @return  {Object}		Collected data.
	 */
	static #__collectData(unit)
	{

		let nodes = Util.scopedSelectorAll(unit, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		nodes.forEach((elem) => {
			let key = elem.getAttribute("bm-bind");
			items[key];
		});

		return submitItem;

	}

}

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
//	Databinding Perk class
// =============================================================================

class DatabindingPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"databinding",
		"order":			320,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return DatabindingPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		if (unit.get("setting", "databinding.options.dataType", "single") === "single")
		{
			// Init unit vault
			DatabindingPerk.#__vault.set(unit, {"store": new BindableStore({
					"resources":	unit.get("inventory", "resource.resources"),
					"direction":	unit.get("setting", "databinding.options.direction", "two-way"),
				})
			});

			// Upgrade unit (single)
			unit.upgrade("skill", "databinding.bindData", DatabindingPerk.#_bindData);

			// Add event handlers
			unit.use("event.add", "beforeTransform", {"handler":DatabindingPerk.#DatabindingPerk_onBeforeTransform, "order":DatabindingPerk.info["order"]});
			unit.use("event.add", "doFill", {"handler":DatabindingPerk.#DatabindingPerk_onDoFill, "order":DatabindingPerk.info["order"]});
		}
		else
		{
			// Init unit vault
			DatabindingPerk.#__vault.set(unit, {"store": new BindableArrayStore({
					"resources":	unit.get("inventory", "resource.resources"),
					"direction":	unit.get("setting", "databinding.options.direction", "two-way"),
				})
			});

			// Upgrade unit (multiple)
			unit.upgrade("skill", "databinding.bindData", DatabindingPerk.#_bindDataArray);

			// Add event handlers
			unit.use("event.add", "doFillRow", {"handler":DatabindingPerk.#DatabindingPerk_onDoFillRow, "order":DatabindingPerk.info["order"]});
		}

		// Add event handlers
		unit.use("event.add", "doClear", {"handler":DatabindingPerk.#DatabindingPerk_onDoClear, "order":DatabindingPerk.info["order"]});
		unit.use("event.add", "doCollect", {"handler":DatabindingPerk.#DatabindingPerk_onDoCollect, "order":DatabindingPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #DatabindingPerk_onBeforeTransform(sender, e, ex)
	{

		DatabindingPerk.#_bindData(this);

	}

	// -------------------------------------------------------------------------

	static #DatabindingPerk_onDoClear(sender, e, ex)
	{

		DatabindingPerk.#__vault.get(this)["store"].clear();

	}

	// -------------------------------------------------------------------------

	static #DatabindingPerk_onDoFill(sender, e, ex)
	{

		if (e.detail.items)
		{
			DatabindingPerk.#__vault.get(this)["store"].replace(e.detail.items);
			FormUtil.showConditionalElements(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------

	static #DatabindingPerk_onDoFillRow(sender, e, ex)
	{

		DatabindingPerk.#_bindDataArray(this, e.detail.no, e.detail.element, e.detail.callbacks);
		DatabindingPerk.#__vault.get(this)["store"].replace(e.detail.no, e.detail.item);

	}

	// -------------------------------------------------------------------------

	static #DatabindingPerk_onDoCollect(sender, e, ex)
	{

		if (this.get("setting", "databinding.options.autoCollect", true))
		{
			e.detail.items = DatabindingPerk.#__vault.get(this)["store"].items;
		}

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Bind data and elements.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{HTMLElement}	rootNode			Root node.
	 */
	static #_bindData(unit, rootNode)
	{

		rootNode = ( rootNode ? rootNode : unit );

		let nodes = Util.scopedSelectorAll(rootNode, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		if (rootNode.matches("[bm-bind]"))
		{
			nodes.push(rootNode);
		}

		nodes.forEach(elem => {
			// Get the callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingPerk.#__getCallback(unit, key);

			// Bind
			DatabindingPerk.#__vault.get(unit)["store"].bindTo(key, elem, callback);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Bind array data and elements.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Integer}		index				Array index.
	 * @param	{HTMLElement}	rootNode			Root node.
	 */
	static #_bindDataArray(unit, index, rootNode)
	{

		rootNode = ( rootNode ? rootNode : unit );

		let nodes = Util.scopedSelectorAll(rootNode, "[bm-bind]");
		nodes = Array.prototype.slice.call(nodes, 0);
		if (rootNode.matches("[bm-bind]"))
		{
			nodes.push(rootNode);
		}

		nodes.forEach(elem => {
			// Get the callback function from settings
			let key = elem.getAttribute("bm-bind");
			let callback = DatabindingPerk.#__getCallback(unit, key);

			// Bind
			DatabindingPerk.#__vault.get(unit)["store"].bindTo(index, key, elem, callback);
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get the callback function from settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		key					Field name.
	 */
	static #__getCallback(unit, key)
	{

		let callback;

		Object.entries(unit.get("setting", "databinding", {})).forEach(([sectionName, sectionValue]) => {
			if (sectionValue["callback"])
			{
				const pattern = sectionValue["key"] || sectionName;
				const r = new RegExp(pattern);
				if (r.test(key))
				{
					callback = sectionValue["callback"];
				}
			}
		});

		return callback;

	}

}

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
//	Locale Server Class
// =============================================================================

class LocaleServer extends Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoRefresh":					false,
				}
			},
			"event": {
				"events": {
					"this": {
						"handlers": {
							"beforeStart":			["LocaleServer_onBeforeStart"],
							"doApplyLocale":		["LocaleServer_onDoApplyLocale"],
						}
					}
				}
			},
			"locale": {
				"handlers": {
					"default": {
						"handlerClassName":			"LocaleHandler",
					}
				}
			},
			"skin": {
				"options": {
					"hasSkin":						false,
				}
			},
			"style": {
				"options": {
					"hasStyle":					false,
					"styleRef":					false,
				}
			},
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	LocaleServer_onBeforeStart(sender, e, ex)
	{

		this._store = new ObservableStore({"async":true});

	}

	// -------------------------------------------------------------------------

	LocaleServer_onDoApplyLocale(sender, e, ex)
	{

		// Set locale attribute
		if (this.get("setting", "options.autoAttribute"))
		{
			let rootNode = this.get("setting", "options.autoAttribute.rootNode");
			let targetElement = ( rootNode ? document.querySelector(rootNode) : document.body );
			let attribName = this.get("setting", "options.autoAttribute.attributeName", "data-locale");

			targetElement.setAttribute(attribName, this.get("inventory", "locale.active.localeName"));
		}

		// Notify locale change to clients
		return this._store.notify("*", e.detail);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Subscribe to the Server. Get a notification when prefrence changed.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	subscribe(unit, options)
	{

		this._store.subscribe(
			`${unit.tagName}_${unit.uniqueId}`,
			this.#__triggerEvent.bind(unit),
		);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Trigger preference changed events.
	 *
	 * @param	{String}		conditions			Notify conditions.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	#__triggerEvent(conditions, observerInfo, options)
	{

		return this.cast("locale.apply", {"localeName":options.localeName});

	}

}

customElements.define("bm-locale", LocaleServer);

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
//	Locale Perk Class
// =============================================================================

class LocalePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"locale",
		"order":			215,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return LocalePerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		LocalePerk.#__vault.set(unit, {
			"server":	null,
		});

		// Upgrade unit
		unit.upgrade("inventory", "locale.localizers", {});
		unit.upgrade("inventory", "locale.messages", new MultiStore());
		unit.upgrade("inventory", "locale.active", {
			"localeName":			unit.get("setting", "locale.options.localeName", unit.get("setting", "system.locale.options.localeName", navigator.language.substring(0, 2))),
			"fallbackLocaleName":	unit.get("setting", "locale.options.fallbackLocaleName", unit.get("setting", "system.locale.options.fallbackLocaleName", "en")),
			"currencyName":			unit.get("setting", "locale.options.currencyName", unit.get("setting", "system.locale.options.currencyName", "USD")),
		});
		unit.upgrade("skill", "locale.localize", LocalePerk.#_localize);
		unit.upgrade("skill", "locale.translate", LocalePerk.#_getLocaleMessage);
		unit.upgrade("spell", "locale.apply", LocalePerk.#_applyLocale);
		unit.upgrade("spell", "locale.summon", LocalePerk.#_loadMessages);
		unit.upgrade("spell", "locale.addHandler", LocalePerk.#_addHandler);

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":LocalePerk.#LocalePerk_onDoApplySettings, "order":LocalePerk.info["order"]});
		unit.use("event.add", "doSetup", {"handler":LocalePerk.#LocalePerk_onDoSetup, "order":LocalePerk.info["order"]});
		unit.use("event.add", "beforeApplyLocale", {"handler":LocalePerk.#LocalePerk_onBeforeApplyLocale, "order":LocalePerk.info["order"]});
		unit.use("event.add", "doApplyLocale", {"handler":LocalePerk.#LocalePerk_onDoApplyLocale, "order":LocalePerk.info["order"]});

		if (unit.get("setting", "locale.options.autoLocalizeRows"))
		{
			unit.use("event.add", "afterFillRow", {"handler":LocalePerk.#LocalePerk_onAfterFillRow, "order":LocalePerk.info["order"]});
		}

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #LocalePerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		// Add locale handlers
		Object.entries(Util.safeGet(e.detail, "settings.locale.handlers", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(LocalePerk.#_addHandler(this, sectionName, sectionValue));
		});

		// Connect to the locale server if specified
		let serverNode = this.get("setting", "locale.options.localeServer", this.get("setting", "system.locale.options.localeServer"));
		serverNode = ( serverNode === true ? "bm-locale" : serverNode );

		if (serverNode && !(this instanceof LocaleServer))
		{
			promises.push(this.cast("status.wait", [serverNode]).then(() => {
				let server = document.querySelector(serverNode);
				server.subscribe(this);
				LocalePerk.#__vault.get(this)["server"] = server;

				// Synchronize to the server's locales
				let localeSettings = server.get("inventory", "locale.active");
				this.set("inventory", "locale.active.localeName", localeSettings["localeName"]);
				this.set("inventory", "locale.active.fallbackLocaleName", localeSettings["fallbackLocaleName"]);
				this.set("inventory", "locale.active.currencyName", localeSettings["currencyName"]);
			}));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static #LocalePerk_onDoSetup(sender, e, ex)
	{

		return LocalePerk.#_applyLocale(this, {"localeName":this.get("inventory", "locale.active.localeName")});

	}

	// -------------------------------------------------------------------------

	static #LocalePerk_onBeforeApplyLocale(sender, e, ex)
	{

		return this.cast("locale.summon", e.detail.localeName);

	}

	// -------------------------------------------------------------------------

	static #LocalePerk_onDoApplyLocale(sender, e, ex)
	{

		// Localize
		LocalePerk.#_localize(this, this);

		// Refill (Do not refill when starting)
		if (this.get("inventory", "status.status") === "ready")
		{
			return this.cast("basic.fill", {"refill":true});
		}

	}

	// -------------------------------------------------------------------------

	static #LocalePerk_onAfterFillRow(sender, e, ex)
	{

		// Localize a row
		LocalePerk.#_localize(this, e.detail.element, e.detail.item);

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Localize all the bm-locale fields with i18 messages using each handler.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{HTMLElement}	rootNode			Target root node to localize.
	 * @param	{Object}		interpolation		Interpolation parameters.
	 */
	static #_localize(unit, rootNode, interpolation)
	{

		rootNode = rootNode || unit;

		Object.keys(unit.get("inventory", "locale.localizers")).forEach((handlerName) => {
			unit.get("inventory", `locale.localizers.${handlerName}`).localize(
				rootNode,
				Object.assign({"interpolation":interpolation}, unit.get("inventory", "locale.active"))
			);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the locale message.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		key					Key.
	 * @param	{String}		localeName			Locale name.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #_getLocaleMessage(unit, key, localeName)
	{

		localeName = localeName || unit.get("inventory", "locale.active.localeName");

		let value = unit.get("inventory", "locale.messages").get(`${localeName}.${key}`);
		if (value === undefined)
		{
			value = unit.get("inventory", "locale.messages").get(`${unit.get("inventory", "locale.fallbackLocaleName")}.${key}`);
		}

		return value;

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
     * Add the localizer.
     *
     * @param	{Unit}			unit				Unit.
     * @param	{string}		handlerName			Locale handler name.
     * @param	{array}			options				Options.
	 *
	 * @return 	{Promise}		Promise.
     */
	static #_addHandler(unit, handlerName, options)
	{

		let promise = Promise.resolve();

		if (!unit.get("inventory", `locale.localizers.${handlerName}`))
		{
			let handlerClassName = Util.safeGet(options, "handlerClassName", "LocaleHandler");
			let handler = this.createHandler(handlerClassName, unit, options);
			unit.set("inventory", `locale.localizers.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply locale.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static async #_applyLocale(unit, options)
	{

		console.debug(`LocalePerk.#_applyLocale(): Applying locale. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}, localeName=${options["localeName"]}`);
		await unit.cast("event.trigger", "beforeApplyLocale", options);
		unit.set("inventory", "locale.active.localeName", options["localeName"]);
		await unit.cast("event.trigger", "doApplyLocale", options);
		console.debug(`LocalePerk.#_applyLocale(): Applied locale. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}, localeName=${options["localeName"]}`);
		await unit.cast("event.trigger", "afterApplyLocale", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the messages file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		localeName			Locale name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #_loadMessages(unit, localeName, options)
	{

		let promises = [];

		Object.keys(unit.get("inventory", "locale.localizers")).forEach((handlerName) => {
			promises.push(unit.get("inventory", `locale.localizers.${handlerName}`).loadMessages(localeName, options));
		});

		return Promise.all(promises);

	}

}

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
//	Key Perk class
// =============================================================================

class KeyPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	//static #__isComposing = false;
	static #__info = {
		"sectionName":	"key",
		"order":		800,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return KeyPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("inventory", "key.isComposing", false);

		// Add event handlers
		unit.use("event.add", "afterTransform", {"handler":KeyPerk.#KeyPerk_onAfterTransform, "order":KeyPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #KeyPerk_onAfterTransform(sender, e, ex)
	{

		let keys = this.get("setting", "key.keys");
		if (keys)
		{
			// Init keys
			let actions = KeyPerk.#__getActions(keys);
			this.addEventListener("keydown", function(e){KeyPerk.#KeyPerk_onKeyDown.call(this, e, this);});
			this.addEventListener("keyup", function(e){KeyPerk.#KeyPerk_onKeyUp.call(this, e, this, keys, actions);});
			//this.addEventListener("compositionstart", function(e){KeyPerk.onCompositionStart.call(this, e, this, keys);});
			//this.addEventListener("compositionend", function(e){KeyPerk.onCompositionEnd.call(this, e, this, keys);});

			// Init buttons
			Object.entries(keys).forEach(([sectionName, sectionValue]) => {
				KeyPerk.#__initButtons(this, sectionName, sectionValue);
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key down event handler. Check if it is in composing mode or not.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 */
	static #KeyPerk_onKeyDown(e, unit)
	{

		unit.set("inventory", "key.isComposing", ( e.keyCode === 229 ? true : false ));

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key up event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 * @param	{Object}		actions				Action info.
	 */
	static #KeyPerk_onKeyUp(e, unit, options, actions)
	{

		// Ignore all key input when composing.
		if (unit.get("inventory", "key.isComposing"))
		{
			return;
		}

		let key  = ( e.key ? e.key : KeyPerk.#__getKeyfromKeyCode(e.keyCode) );
		switch (key)
		{
			case "Esc":		key = "Escape";		break;
			case "Down": 	key = "ArrowDown";	break;
			case "Up": 		key = "ArrowUp";	break;
			case "Left": 	key = "ArrowLeft";	break;
			case "Right": 	key = "ArrowRight";	break;
		}
		key = key.toLowerCase();

		// Take an action according to the key pressed
		if (actions[key])
		{
			actions[key]["handler"].call(this, e, unit, actions[key]["option"]);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition start event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	/*
	static #onCompositionStart(e, unit, options)
	{

		unit.#__isComposing = true;

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Composition end event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	/*
	static #onCompositionEnd(e, unit, options)
	{

		unit.#__isComposing = false;

	}
	*/

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Default submit.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static async #__defaultSubmit(e, unit, options)
	{

		await unit.cast("form.submit");

		if (!unit.get("inventory", "form.cancelSubmit"))
		{
			// Modal result
			if (unit.get("inventory", "dialog.isModal"))
			{
				unit.set("inventory", "dialog.modalResult.result", true);
			}

			// Auto close
			if (options && options["autoClose"])
			{
				await unit.cast("dialog.close", {"reason":"submit"});
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Default cancel.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__defaultCancel(e, unit, options)
	{

		return unit.cast("dialog.close", {"reason":"cancel"});

	}

	// -------------------------------------------------------------------------

	/**
	 * Default clear.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__defaultClear(e, unit, options)
	{

		let target = "";

		if (this.hasAttribute("bm-cleartarget"))
		{
			target = this.getAttribute("bm-cleartarget");
		}

		return unit.cast("basic.clear", {"target":target, "options":options["options"]});

	}

	// -------------------------------------------------------------------------

	/**
 	 * Convert key name from key code.
	 *
	 * @param	{Integer}		code				Key code.
	 */
	static #__getKeyfromKeyCode(code)
	{

		let ret;

		switch(code)
		{
			case 13:
				ret = "Enter";
				break;
			default:
				ret = String.fromCharCode(code);
				break;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Init buttons.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		action				Action.
	 * @param	{Object}		options				Options.
	 */
	static #__initButtons(unit, action, options)
	{

		if (options && options["selector"])
		{
			let handler = ( options["handler"] ? options["handler"] : KeyPerk.#__getDefaultHandler(action) );
			let elements = Util.scopedSelectorAll(unit, options["selector"]);

			elements.forEach((element) => {
				element.addEventListener("click", function(e){handler.call(this, e, unit, options);});
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Return an object that holds information about what action is taken when which key is pressed.
	 *
	 * @param	{Object}		settings			Key settings.
	 *
	 * @return 	{Object}		Action info.
	 */
	static #__getActions(settings)
	{

		let actions = {};

		Object.keys(settings).forEach((key) => {
			let keys = ( Array.isArray(settings[key]["key"]) ? settings[key]["key"] : [settings[key]["key"]]);

			for (let i = 0; i < keys.length; i++)
			{
				actions[keys[i]] = {};
				actions[keys[i]]["type"] = key;
				actions[keys[i]]["handler"] = ( settings[key]["handler"] ? settings[key]["handler"] : KeyPerk.#__getDefaultHandler(key) );
				actions[keys[i]]["option"] = settings[key];
			}
		});

		return actions;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return the default handler for the action.
	 *
	 * @param	{String}		action				Action.
	 *
	 * @return 	{Function}		Handler.
	 */
	static #__getDefaultHandler(action)
	{

		let handler;

		switch (action)
		{
		case "submit":
			handler = KeyPerk.#__defaultSubmit;
			break;
		case "clear":
			handler = KeyPerk.#__defaultClear;
			break;
		case "cancel":
			handler = KeyPerk.#__defaultCancel;
			break;
		}

		return handler;

	}

}

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
//	Chain Perk class
// =============================================================================

class ChainPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__info = {
		"sectionName":	"chain",
		"order":		800,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return ChainPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":ChainPerk.#ChainPerk_onDoApplySettings, "order":ChainPerk.info["order"]});

	}

	// -----------------------------------------------------------------------------

	static deinit(unit, options)
	{

		let chains = e.details.setting["chains"];
		if (chains)
		{
			Object.keys(chains).forEach((eventName) => {
				unit.removeEventHandler(eventName, {"handler":ChainPerk.#ChainPerk_onDoApplySettings, "options":chains[eventName]});
			});
		}

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #ChainPerk_onDoApplySettings(sender, e, ex)
	{

		let order = ChainPerk.info["order"];

		Object.entries(Util.safeGet(e.detail, "settings.chain.targets", {})).forEach(([sectionName, sectionValue]) => {
			this.use("event.add", sectionName, {
				"handler":	ChainPerk.#ChainPerk_onDoProcess,
				"order":	order,
				"options":	sectionValue
			});
		});

	}

	// -----------------------------------------------------------------------------

	static #ChainPerk_onDoProcess(sender, e, ex)
	{

		let targets = ex.options;
		let promises = [];
		let chain = Promise.resolve();

		for (let i = 0; i < targets.length; i++)
		{
			let method = targets[i]["skillName"] || "basic.refresh";
			let status = targets[i]["status"] || "ready";
			let sync = targets[i]["sync"];

			let nodes = this.use("basic.locateAll", targets[i]);
			Util.warn(nodes.length > 0, `ChainPerk.onDoProcess(): Node not found. name=${this.tagName}, eventName=${e.type}, rootNode=${JSON.stringify(targets[i])}, method=${method}`);

			if (sync)
			{
				chain = chain.then(() => {
					return ChainPerk.#__execTarget(this, nodes, method, status);
				});
			}
			else
			{
				chain = ChainPerk.#__execTarget(this, nodes, method, status);
			}
			promises.push(chain);
		}

		return Promise.all(promises);

	}

	// -----------------------------------------------------------------------------
	//	Privates
	// -----------------------------------------------------------------------------

	/**
	 * Execute target methods.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Array}			nodes				Nodes.
	 * @param	{String}		skillName			Skill name to exec.
	 * @param	{String}		status				Status to wait.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static #__execTarget(unit, nodes, skillName, status)
	{

		let promises = [];

		nodes.forEach((element) => {
			let promise = unit.cast("status.wait", [{"object":element, "status":status}]).then(() => {
				return element.cast(skillName, {"sender":unit});
			});
			promises.push(promise);
		});

		return Promise.all(promises);

	}

}

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
//	Dialog Perk class
// =============================================================================

let DialogPerk$1 = class DialogPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__backdrop;
	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"dialog",
		"order":			800,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return DialogPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		DialogPerk.#__vault.set(unit, {
			"backdrop":			null,
			"backdropPromise":	Promise.resolve(),
			"modalPromise":		null,
		});

		// Upgrade unit
		unit.upgrade("inventory", "dialog.cancelClose");
		unit.upgrade("inventory", "dialog.isModal", false);
		unit.upgrade("inventory", "dialog.modalResult", {});
		unit.upgrade("inventory", "dialog.options");
		unit.upgrade("spell", "dialog.open", DialogPerk.#_open);
		unit.upgrade("spell", "dialog.openModal", DialogPerk.#_openModal);
		unit.upgrade("spell", "dialog.close", DialogPerk.#_close);

		// Add event handlers
		unit.use("event.add", "afterReady", {"handler":DialogPerk.#DialogPerk_onAfterReady, "order":DialogPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #DialogPerk_onAfterReady(sender, e, ex)
	{

		if (this.get("setting", "dialog.options.autoOpen"))
		{
			console.debug(`DialogPerk.DialogPerk_onAfterReady(): Automatically opening unit. name=${this.tagName}, id=${this.id}`);

			return this.cast("dialog.open");
		}

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Open unit.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_open(unit, options)
	{

		options = options || {};
		unit.set("inventory", "dialog.options", options);

		console.debug(`DialogPerk.#_open(): Opening unit. name=${unit.tagName}, id=${unit.id}`);
		await unit.cast("event.trigger", "beforeOpen", options);
		if (!unit.get("inventory", "dialog.cancelOpen"))
		{
			// Show backdrop
			if (unit.get("setting", "dialog.options.showBackdrop"))
			{
				await DialogPerk.#__showBackdrop(unit, unit.get("setting", "dialog.backdropOptions"));
			}

			// Setup
			if (Util.safeGet(options, "autoSetupOnOpen", unit.get("setting", "dialog.options.autoSetupOnOpen", false)))
			{
				await unit.cast("basic.setup", options);
			}

			// Refresh
			if (Util.safeGet(options, "autoRefreshOnOpen", unit.get("setting", "dialog.options.autoRefreshOnOpen", true)))
			{
				await unit.cast("basic.refresh", options);
			}

			await unit.cast("event.trigger", "doOpen", options);
			console.debug(`DialogPerk.#_open(): Opened unit. name=${unit.tagName}, id=${unit.id}`);
			await unit.cast("event.trigger", "afterOpen", options);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Open unit modal.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #_openModal(unit, options)
	{

		console.debug(`DialogPerk.#_openModal(): Opening unit modal. name=${unit.tagName}, id=${unit.id}`);

		return new Promise((resolve, reject) => {
			unit.set("inventory", "dialog.isModal", true);
			unit.set("inventory", "dialog.modalResult", {"result":false});
			DialogPerk.#__vault.get(unit)["modalPromise"] = {"resolve":resolve,"reject":reject};

			return DialogPerk.#_open(unit, options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Close unit.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_close(unit, options)
	{

		options = options || {};
		unit.set("inventory", "dialog.cancelClose", false);

		console.debug(`DialogPerk.#_close(): Closing unit. name=${unit.tagName}, id=${unit.id}`);
		await unit.cast("event.trigger", "beforeClose", options);
		if (!unit.get("inventory", "dialog.cancelClose"))
		{
			await unit.cast("event.trigger", "doClose", options);

			// Hide backdrop
			if (unit.get("setting", "dialog.options.showBackdrop"))
			{
				DialogPerk.#__removeCloseOnClickHandlers();
				await DialogPerk.#__hideBackdrop(unit, unit.get("setting", "dialog.backdropOptions"));
			}

			if (unit.get("inventory", "dialog.isModal"))
			{
				DialogPerk.#__vault.get(unit)["modalPromise"].resolve(unit.get("inventory", "dialog.modalResult"));
			}
			console.debug(`DialogPerk.#_close(): Closed unit. name=${unit.tagName}, id=${unit.id}`);

			await unit.cast("event.trigger", "afterClose", options);
		}

	}

	// -------------------------------------------------------------------------
	// 	Privates
	// -------------------------------------------------------------------------

	/**
	 * Create the backdrop if not exists.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__createBackdrop(unit, options)
	{

		if (!DialogPerk.#__backdrop)
		{
			// Create the backdrop
			document.body.insertAdjacentHTML('afterbegin', '<div class="backdrop"></div>');
			DialogPerk.#__backdrop = document.body.firstElementChild;
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Show backdrop.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__showBackdrop(unit, options)
	{

		DialogPerk.#__createBackdrop(unit);

		return DialogPerk.#__vault.get(unit)["backdropPromise"].then(() => {
			DialogPerk.#__vault.get(unit)["backdropPromise"] = new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk.#__backdrop).getPropertyValue("visibility"); // Recalc styles

				let addClasses = ["show"].concat(unit.get("setting", "dialog.backdropOptions.showOptions.addClasses", []));
				DialogPerk.#__backdrop.classList.add(...addClasses);
				DialogPerk.#__backdrop.classList.remove(...unit.get("setting", "dialog.backdropOptions.showOptions.removeClasses", []));

				let effect = DialogPerk.#__getEffect();
				if (effect)
				{
					// Transition/Animation
					DialogPerk.#__backdrop.addEventListener(`${effect}end`, () => {
						if (Util.safeGet(options, "closeOnClick", true))
						{
							DialogPerk.#__installCloseOnClickHandler(unit);
						}
						resolve();
					}, {"once":true});
				}
				else
				{
					// No Transition/Animation
					if (Util.safeGet(options, "closeOnClick", true))
					{
						DialogPerk.#__installCloseOnClickHandler(unit);
					}

					resolve();
				}
			});

			let sync =Util.safeGet(options, "showOptions.sync", Util.safeGet(options, "sync"));
			if (sync)
			{
				return DialogPerk.#__vault.get(unit)["backdropPromise"];
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Hide backdrop.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__hideBackdrop(unit, options)
	{

		return DialogPerk.#__vault.get(unit)["backdropPromise"].then(() => {
			DialogPerk.#__vault.get(unit)["backdropPromise"] = new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk.#__backdrop).getPropertyValue("visibility"); // Recalc styles

				let removeClasses = ["show"].concat(unit.get("setting", "dialog.backdropOptions.hideOptions.removeClasses", []));
				DialogPerk.#__backdrop.classList.remove(...removeClasses);
				DialogPerk.#__backdrop.classList.add(...unit.get("setting", "dialog.backdropOptions.hideOptions.addClasses", []));

				let effect = DialogPerk.#__getEffect();
				if (effect)
				{
					DialogPerk.#__backdrop.addEventListener(`${effect}end`, () => {
						resolve();
					}, {"once":true});
				}
				else
				{
					resolve();
				}
			});

			let sync = Util.safeGet(options, "hideOptions.sync", Util.safeGet(options, "sync"));
			if (sync)
			{
				return DialogPerk.#__vault.get(unit)["backdropPromise"];
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Install the event handler to the backdrop to close the unit when clicked.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__installCloseOnClickHandler(unit, options)
	{

		DialogPerk.#__backdrop.onclick = (e) => {
			if (e.target === e.currentTarget)
			{
				DialogPerk.#_close(unit, {"reason":"cancel"});
			}
		};

	}

	// -----------------------------------------------------------------------------

	/**
	 * Remove click event handlers from backdrop.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__removeCloseOnClickHandlers()
	{

		DialogPerk.#__backdrop.onclick = null;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get which effect is applied to backdrop.
	 *
	 * @return 	{String}		Effect ("transition" or "animation").
	 */
	static #__getEffect()
	{

		let effect = "";

		if (window.getComputedStyle(DialogPerk.#__backdrop).getPropertyValue('transition-duration') !== "0s")
		{
			effect = "transition";
		}
		else if (window.getComputedStyle(DialogPerk.#__backdrop).getPropertyValue('animation-name') !== "none")
		{
			effect = "animation";
		}

		return effect;

	}

};

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
//	Preference Perk class
// =============================================================================

class PreferencePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"preference",
		"order":			900,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return PreferencePerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		PreferencePerk.#__vault.set(unit, {
			"server":	null,
		});

		// Upgrade unit
		unit.upgrade("skill", "preference.get", PreferencePerk.#_getPreferences);
		unit.upgrade("spell", "preference.set", PreferencePerk.#_setPreferences);
		unit.upgrade("spell", "preference.apply", PreferencePerk.#_applyPreferences);

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":PreferencePerk.#PreferencePerk_onDoApplySettings, "order":PreferencePerk.info["order"]});
		unit.use("event.add", "doSetup", {"handler":PreferencePerk.#PreferencePerk_onDoSetup, "order":PreferencePerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #PreferencePerk_onDoApplySettings(sender, e, ex)
	{

		let serverNode = this.get("setting", "preference.options.preferenceServer", this.get("setting", "system.preference.options.preferenceServer"));
		serverNode = ( serverNode === true ? "bm-preference" : serverNode );

		Util.assert(serverNode, () => `Preference Server node not specified in settings. name=${this.tagName}`);

		return this.cast("status.wait", [serverNode]).then(() => {
			let server = document.querySelector(serverNode);
			server.subscribe(this, Util.safeGet(e.detail, "settings.preference"));
			PreferencePerk.#__vault.get(this)["server"] = server;
		});

	}

	// -------------------------------------------------------------------------

	static #PreferencePerk_onDoSetup(sender, e, ex)
	{

		return this.cast("preference.apply", {"preferences":PreferencePerk.#__vault.get(this)["server"].items});

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Get preferences.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{String}		target				Preference name to get.
	 * @param	{*}				defaultValue		Value returned when key is not found.
	 */
	static #_getPreferences(unit, key, defaultValue)
	{

		if (key)
		{
			return PreferencePerk.#__vault.get(unit)["server"].getPreference(key, defaultValue);
		}
		else
		{
			return PreferencePerk.#__vault.get(unit)["server"].items;
		}

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Apply preferences.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static async #_applyPreferences(unit, options)
	{

		console.debug(`PreferencePerk.#_applyPreferences(): Applying preferences. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeApplyPreferences", options);
		await unit.cast("event.trigger", "doApplyPreferences", options);
		console.debug(`PreferencePerk.#_applyPreferences(): Applied preferences. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "afterApplyPreferences", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply preferences.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		preferences 		Preferences to set.
	 * @param	{Object}		options				Options.
	 */
	static #_setPreferences(unit, preferences, options)
	{

		return PreferencePerk.#__vault.get(unit)["server"].setPreference(preferences, options, {"sender":unit});

	}

}

/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError("Missing parameter name at ".concat(i));
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at ".concat(j));
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at ".concat(j));
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError("Unbalanced pattern at ".concat(i));
            if (!pattern)
                throw new TypeError("Missing pattern at ".concat(i));
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^".concat(escapeString(options.delimiter || "/#?"), "]+?");
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            return value;
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
    };
    var consumeText = function () {
        var result = "";
        var value;
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || defaultPattern,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || "",
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}
/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
    if (!keys)
        return path;
    var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
    var index = 0;
    var execResult = groupsRegex.exec(path.source);
    while (execResult) {
        keys.push({
            // Use parenthesized substring match if available, index otherwise
            name: execResult[1] || index++,
            prefix: "",
            suffix: "",
            modifier: "",
            pattern: "",
        });
        execResult = groupsRegex.exec(path.source);
    }
    return path;
}
/**
 * Transform an array into a regexp.
 */
function arrayToRegexp(paths, keys, options) {
    var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
    return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
/**
 * Create a path regexp from string input.
 */
function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegexp(tokens, keys, options) {
    if (options === void 0) { options = {}; }
    var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
    var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
    var delimiterRe = "[".concat(escapeString(delimiter), "]");
    var route = start ? "^" : "";
    // Iterate over the tokens and create our regexp string.
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (typeof token === "string") {
            route += escapeString(encode(token));
        }
        else {
            var prefix = escapeString(encode(token.prefix));
            var suffix = escapeString(encode(token.suffix));
            if (token.pattern) {
                if (keys)
                    keys.push(token);
                if (prefix || suffix) {
                    if (token.modifier === "+" || token.modifier === "*") {
                        var mod = token.modifier === "*" ? "?" : "";
                        route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
                    }
                    else {
                        route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
                    }
                }
                else {
                    if (token.modifier === "+" || token.modifier === "*") {
                        route += "((?:".concat(token.pattern, ")").concat(token.modifier, ")");
                    }
                    else {
                        route += "(".concat(token.pattern, ")").concat(token.modifier);
                    }
                }
            }
            else {
                route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
            }
        }
    }
    if (end) {
        if (!strict)
            route += "".concat(delimiterRe, "?");
        route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
    }
    else {
        var endToken = tokens[tokens.length - 1];
        var isEndDelimited = typeof endToken === "string"
            ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1
            : endToken === undefined;
        if (!strict) {
            route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
        }
        if (!isEndDelimited) {
            route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
        }
    }
    return new RegExp(route, flags(options));
}
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp)
        return regexpToRegexp(path, keys);
    if (Array.isArray(path))
        return arrayToRegexp(path, keys, options);
    return stringToRegexp(path, keys, options);
}

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
//	Route Perk class
// =============================================================================

class RoutePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"routing",
		"order":			900,
		"depends":			"ValidationPerk",
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return RoutePerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Set state on the first page
		history.replaceState(RoutePerk.#__getState("connect"), null, null);

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		RoutePerk.#__vault.set(unit, {
			"routes":	[],
		});

		// Upgrade unit
		unit.upgrade("inventory", "routing.routeInfo", {});
		unit.upgrade("skill", "routing.add", RoutePerk.#_addRoute);
		unit.upgrade("skill", "routing.jump", RoutePerk.#_jumpRoute);
		unit.upgrade("skill", "routing.replace", RoutePerk.#_replaceRoute);
		unit.upgrade("spell", "routing.switch", RoutePerk.#_switchRoute);
		unit.upgrade("spell", "routing.open", RoutePerk.#_open);
		unit.upgrade("spell", "routing.update", RoutePerk.#_updateRoute);
		unit.upgrade("spell", "routing.refresh", RoutePerk.#_refreshRoute);
		unit.upgrade("spell", "routing.normalize", RoutePerk.#_normalizeRoute);

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":RoutePerk.#RoutePerk_onDoApplySettings, "order":RoutePerk.info["order"]});
		unit.use("event.add", "doStart", {"handler":RoutePerk.#RoutePerk_onDoStart, "order":RoutePerk.info["order"]});
		unit.use("event.add", "afterReady", {"handler":RoutePerk.#RoutePerk_onAfterReady, "order":RoutePerk.info["order"]});
		unit.use("event.add", "doValidateFail", {"handler":RoutePerk.#RoutePerk_onDoValidateFail, "order":RoutePerk.info["order"]});
		unit.use("event.add", "doReportValidity", {"handler":RoutePerk.#RoutePerk_onDoReportValidity, "order":RoutePerk.info["order"]});

		// Init popstate handler
		RoutePerk.#__initPopState(unit);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #RoutePerk_onDoApplySettings(sender, e, ex)
	{

		// Routings
		Object.entries(Util.safeGet(e.detail, "settings.routing.routes", {})).forEach(([sectionName, sectionValue]) => {
			RoutePerk.#_addRoute(this, sectionName, sectionValue);
		});

		// Set current route info.
		this.set("inventory", "routing.routeInfo", RoutePerk.#__loadRouteInfo(this, window.location.href));

	}

	// -------------------------------------------------------------------------

	static #RoutePerk_onDoStart(sender, e, ex)
	{

		let routeName = this.get("inventory", "routing.routeInfo.name");
		if (routeName)
		{
			let options = {
				"query": this.get("setting", "unit.options.query")
			};

			return this.cast("routing.switch", routeName, options);
		}
		else
		{
			throw new Error("route not found");
		}

	}

	// -------------------------------------------------------------------------

	static #RoutePerk_onAfterReady(sender, e, ex)
	{

		return this.cast("routing.open");

	}

	// -------------------------------------------------------------------------

	static #RoutePerk_onDoValidateFail(sender, e, ex)
	{

		// Try to fix URL when validation failed
		if (this.get("setting", "routing.options.autoFix"))
		{
			RoutePerk.#__fixRoute(this, e.detail.url);
		}

	}

	// -------------------------------------------------------------------------

	static #RoutePerk_onDoReportValidity(sender, e, ex)
	{

		// Dump errors when validation failed
		RoutePerk.#__dumpValidationErrors(this);
		throw new URIError("URL validation failed.");

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Add the route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		title				Route title.
	 * @param	{Object}		routeInfo			Route info.
	 * @param	{Boolean}		first				Add to top when true.
	 */
	static #_addRoute(unit, title, routeInfo, first)
	{

		let keys = [];
		let route = {
			"title":		title,
			"name":			routeInfo["name"] || title,
			"origin":		routeInfo["origin"],
			"path":			routeInfo["path"],
			"settingsRef":	routeInfo["settingsRef"],
			"settings":		routeInfo["settings"],
			"extenderRef":	routeInfo["extenderRef"],
			"extender":		routeInfo["extender"],
			"routeOptions":	routeInfo["routeOptions"],
			"__re": 			pathToRegexp(routeInfo["path"], keys),
			"__keys":		keys,
		};

		let routes = RoutePerk.#__vault.get(unit)["routes"];
		if (first)
		{
			routes.unshift(route);
		}
		else
		{
			routes.push(route);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the extender file for this page.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_loadSettings(unit, routeName, options)
	{

		let settings = await AjaxUtil.loadJSON(RoutePerk.#__getSettingsURL(unit, routeName), Object.assign({"bindTo":unit}, options));
		unit.set("inventory", "routing.routeInfo.settings", settings);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the extender file for this page.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_loadExtender(unit, routeName, options)
	{

		if (!unit.get("inventory", "routing.routeInfo.extender"))
		{
			let extender = await AjaxUtil.loadText(RoutePerk.#__getExtenderURL(unit, routeName));
			unit.set("inventory", "routing.routeInfo.extender", extender);
		}
		let extender = unit.get("inventory", "routing.routeInfo.extender");
		if (extender)
		{
			new Function(`"use strict";${extender}`)();
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the route speicific settings file and init.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static async #_switchRoute(unit, routeName, options)
	{

		Util.assert(routeName, () => "RoutePerk.#_switchRoute(): A route name not specified.", TypeError);

		let newSettings;

		// Load extra settings
		if (RoutePerk.#__hasExternalSettings(unit, routeName))
		{
			await RoutePerk.#_loadSettings(unit, routeName);
		}

		// Load extra codes
		if (RoutePerk.#__hasExternalExtender(unit, routeName))
		{
			await RoutePerk.#_loadExtender(unit);
		}

		// Merge & apply new settings
		newSettings = unit.get("inventory", "routing.routeInfo.settings");
		unit.use("setting.merge", newSettings);
		await unit.cast("setting.apply", {"settings":newSettings});

		// Cast trasform to load & apply CSS
		await unit.cast("basic.transform");

	}

	// -------------------------------------------------------------------------

	/**
	 * Open route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static async #_open(unit, routeInfo, options)
	{

		options = Object.assign({}, options);

		// Current route info
		let curRouteInfo = unit.get("inventory", "routing.routeInfo");

		let newURL;
		let newRouteInfo;
		if (routeInfo)
		{
			newURL = URLUtil.buildURL(routeInfo, options);
			newRouteInfo = RoutePerk.#__loadRouteInfo(unit, newURL);
		}
		else
		{
			newURL = window.location.href;
			newRouteInfo = curRouteInfo;
		}

		// Jump to another page
		if (options["jump"] || !newRouteInfo["name"]
				|| ( curRouteInfo["name"] != newRouteInfo["name"]) // <--- remove this when #_update() is ready.
		)
		{
			window.location.href = newURL;
			//RoutePerk.#_jumpRoute(unit, {"URL":newURL});
			return;
		}

		// Replace URL
		let pushState = Util.safeGet(options, "pushState", ( routeInfo ? true : false ));
		if (pushState)
		{
			history.pushState(RoutePerk.#__getState("_open.pushState"), null, newURL);
		}
		unit.set("inventory", "routing.routeInfo", newRouteInfo);

		/*
		// Update route
		// Load other unit when new route name is different from the current route name.
		if (curRouteInfo["name"] != newRouteInfo["name"])
		{
			await RoutePerk.#_updateRoute(unit, curRouteInfo, newRouteInfo, options);
		}
		*/

		// Validate URL
		if (unit.get("setting", "routing.options.autoValidate"))
		{
			let validateOptions = {
				"validatorName":	unit.get("setting", "routing.options.validatorName"),
				"items":			URLUtil.loadParameters(newURL),
				"url":				newURL,
			};
			await unit.cast("validation.validate", validateOptions);
		}

		// Refresh
		await RoutePerk.#_refreshRoute(unit, newRouteInfo, options);

		// Normalize URL
		await RoutePerk.#_normalizeRoute(unit, window.location.href);

	}

	// -------------------------------------------------------------------------

	/**
	 * Jump to url.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 */
	static #_jumpRoute(unit, routeInfo, options)
	{

		let url = URLUtil.buildURL(routeInfo, options);
		window.location.href = url;

	}

	// -------------------------------------------------------------------------

	/**
	 * Update route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static #_updateRoute(unit, curRouteInfo, newRouteInfo, options)
	{

		return RoutePerk.#_switchRoute(unit, newRouteInfo["name"]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static #_refreshRoute(unit, routeInfo, options)
	{

		return unit.cast("basic.refresh", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Replace current url.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 */
	static #_replaceRoute(unit, routeInfo, options)
	{

		history.replaceState(RoutePerk.#__getState("replaceRoute", window.history.state), null, URLUtil.buildURL(routeInfo, options));
		unit.set("inventory", "routing.routeInfo", RoutePerk.#__loadRouteInfo(unit, window.location.href));

	}

	// -------------------------------------------------------------------------

	/**
	 * Normalize route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		url					Url to normalize.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static async #_normalizeRoute(unit, url)
	{

		await unit.cast("event.trigger", "beforeNormalizeURL");
		await unit.cast("event.trigger", "doNormalizeURL");
		await unit.cast("event.trigger", "afterNormalizeURL");

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the external settings file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {Boolean}		True if the unit has the external settings file.
	 */
	static #__hasExternalSettings(unit, routeName)
	{

		let ret = false;

		if (!unit.get("inventory", "routing.routeInfo.settings"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to settings file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {String}		URL.
	 */
	static #__getSettingsURL(unit, routeName)
	{

		let url;
		let settingsRef = unit.get("inventory", "routing.routeInfo.settingsRef");

		if (settingsRef && settingsRef !== true)
		{
			// If URL is specified in ref, use it
			url = settingsRef;
		}
		else
		{
			// Use default path and filename
			let path = Util.concatPath([
					unit.get("setting", "system.unit.options.path", ""),
					unit.get("setting", "unit.options.path", ""),
				]);
			let ext = RoutePerk.#__getSettingFormat(unit);
			let fileName = unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()) + "." + routeName + ".settings." + ext;
  			let query = unit.get("setting", "unit.options.query");

			 url = Util.concatPath([path, fileName]) + (query ? `?${query}` : "");
		}

		return url;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the external extender file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {Boolean}		True if the unit has the external extender file.
	 */
	static #__hasExternalExtender(unit, routeName)
	{

		let ret = false;

		if (unit.get("inventory", "routing.routeInfo.extenderRef") || unit.get("inventory", "routing.routeInfo.extender"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to extender file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {String}		URL.
	 */
	static #__getExtenderURL(unit, routeName)
	{
		let extenderRef = unit.get("inventory", "routing.routeInfo.extenderRef");

		if (extenderRef && extenderRef !== true)
		{
			// If URL is specified in ref, use it
			url = settingsRef;
		}
		else
		{
			// Use default path and filename
			let path = path || Util.concatPath([
					unit.get("setting", "system.unit.options.path", ""),
					unit.get("setting", "unit.options.path", ""),
				]);
			let fileName = fileName || unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()) + "." + routeName + ".js";
			let query = unit.get("setting", "unit.options.query");

			url = Util.concatPath([path, fileName]) + (query ? `?${query}` : "");
		}

		return url;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get route info from the url.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		url					Url.
	 *
	 * @return  {Object}		Route info.
	 */
	static #__loadRouteInfo(unit, url)
	{

		let parsedURL = new URL(url, window.location.href);
		let routeInfo = {
			"URL":				url,
			"path":				parsedURL.pathname,
			"query":			parsedURL.search,
			"parsedURL":		parsedURL,
			"queryParameters":	URLUtil.loadParameters(url),
		};

		// Find the matching route
		let routes = RoutePerk.#__vault.get(unit)["routes"];
		for (let i = routes.length - 1; i >= 0; i--)
		{
			// Check origin
			if (routes[i]["origin"] && parsedURL.origin != routes[i]["origin"])
			{
				continue;
			}

			// Check path
			let result = (!routes[i]["path"] ? [] : routes[i].__re.exec(parsedURL.pathname));
			if (result)
			{
				let params = {};
				for (let j = 0; j < result.length - 1; j++)
				{
					params[routes[i].__keys[j].name] = result[j + 1];
				}
				routeInfo["title"] = routes[i].title;
				let routeName = RoutePerk.#__interpolate(routes[i].name, params);
				routeInfo["name"] = routeName;
				let settingsRef = Util.safeGet(routes[i], `routeOptions.${routeName}.settingsRef`, routes[i].settingsRef);
				routeInfo["settingsRef"] = RoutePerk.#__interpolate(settingsRef, params);
				let settings = Util.safeGet(routes[i], `routeOptions.${routeName}.settings`, routes[i].settings);
				routeInfo["settings"] = Util.getObject(settings, {"format":RoutePerk.#__getSettingFormat(unit)});
				let extenderRef = Util.safeGet(routes[i], `routeOptions.${routeName}.extenderRef`, routes[i].extenderRef);
				routeInfo["extenderRef"] = RoutePerk.#__interpolate(extenderRef, params);
				routeInfo["extender"] = Util.safeGet(routes[i], `routeOptions.${routeName}.extender`, routes[i].extender);
				routeInfo["routeParameters"] = params;
				break;
			}
		}

		return routeInfo;

	}

	// -------------------------------------------------------------------------

	/**
	 * Interpolate string using parameters.
	 *
	 * @param	{String}		targtet				Target string.
	 * @param	{Object}		params				Interplolation parameters.
	 *
	 * @return  {Object}		Replaced value.
	 */
	static #__interpolate(target, params)
	{

		let ret = target;

		if (params && typeof(target) === "string" && target.indexOf("${") > -1)
		{
			let re = new RegExp(`\\$\\{(${Object.keys(params).join("|")})\\}`,"gi");

			ret = target.replace(re, function(match, p1){
				return params[p1];
			});
		}

		return ret

	}

	// -------------------------------------------------------------------------

	/**
	 * Init pop state handling.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static #__initPopState(unit)
	{

		window.addEventListener("popstate", async (e) => {
			await unit.cast("event.trigger", "beforePopState");
			await RoutePerk.#_open(unit, {"url":window.location.href}, {"pushState":false});
			await unit.cast("event.trigger", "afterPopState");
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Return history state.
	 *
	 * @param	{String}		msg					Message to store in state.
	 * @param	{Object}		options				Optional values to store in state.
	 *
	 * @return	{String}		State.
	 */
	static #__getState(msg, options)
	{

		let newState = {
			"msg": msg,
		};

		if (options)
		{
			newState = Util.deepMerge(Util.deepClone(options), newState);
		}

		return newState;

	}

	// -------------------------------------------------------------------------

	/**
	 * Fix route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		url					Url to validate.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static #__fixRoute(unit, url)
	{

		let isOk = true;
		let newParams = URLUtil.loadParameters(url);

		// Fix invalid paramters
		Object.keys(unit.get("inventory", "validation.validationResult.invalids")).forEach((key) => {
			let item = unit.get("inventory", `validation.validationResult.invalids.${key}`);

			if (item["fix"] !== undefined)
			{
				newParams[item["key"]] = item["fix"];
			}
			else if (item["failed"][0]["validity"] === "notAllowed")
			{
				delete newParams[item["key"]];
			}
			else
			{
				isOk = false;
			}
		});

		if (isOk)
		{
			// Replace URL
			RoutePerk.#_replaceRoute(unit, {"queryParameters":newParams});

			// Fixed
			unit.set("inventory", "validation.validationResult.result", true);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Dump validation errors.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static #__dumpValidationErrors(unit)
	{

		Object.keys(unit.get("inventory", "validation.validationResult.invalids")).forEach((key) => {
			let item = unit.get("inventory", `validation.validationResult.invalids.${key}`);

			if (item.failed)
			{
				for (let i = 0; i < item.failed.length; i++)
				{
					console.warn("RoutePerk.#__dumpValidationErrors(): URL validation failed.",
						`key=${item.key}, value=${item.value}, rule=${item.failed[i].rule}, validity=${item.failed[i].validity}`);
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Return default settings file format.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {String}		"js" or "json".
	 */
	static #__getSettingFormat(unit)
	{

		return unit.get("setting", "routing.options.settingFormat",
				unit.get("setting", "system.setting.options.settingFormat",
					"json"));

	}

}

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
//	Resource Handler class
// =============================================================================

class ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{String}		resourceName		Resource name.
     * @param	{Object}		options				Options.
     */
	constructor(unit, resourceName, options)
	{

		options = options || {};

		this._resourceName = resourceName;
		this._unit = unit;
		this._options = new Store({"items":options});
		this._data = {};
		this._items = [];
		this._target = {};
		this._currentIndex = 0;

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Resource name.
	 *
	 * @type	{String}
	 */
	get resourceName()
	{

		return this._resourceName;

	}

	set resourceName(value)
	{

		this._resourceName = value;

	}

	// -------------------------------------------------------------------------

	/**
	 * Fetch target.
	 *
	 * @type	{Object}
	 */
	get target()
	{

		return this._target;

	}

	// -------------------------------------------------------------------------

	/**
	 * Raw data.
	 *
	 * @type	{Object}
	 */
	get data()
	{

		return this._data;

	}

	set data(value)
	{

		this._data = value;
		this._items = this.#__reshapeItems(value);

	}

	// -------------------------------------------------------------------------

	/**
	 * Items.
	 *
	 * @type	{Object}
	 */
	get items()
	{

		return this._items;

	}

	// -------------------------------------------------------------------------

	/**
	 * Options.
	 *
	 * @type	{Object}
	 */
	get options()
	{

		return this._options;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Init the handler.
     *
     * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	init(options)
	{

		if (this._options.get("autoLoad"))
		{
			let id = this._options.get("autoLoadOptions.id");
			let parameters = this._options.get("autoLoadOptions.parameters");

			return this.load(id, parameters);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	load(id, parameters)
	{

		return Promise.resolve().then(() => {
			return this._load(id, parameters);
		}).then((data) => {
//			Util.warn(data, `ResourceHandler.load(): No data returned. name=${this._unit.tagName}, handlerName=${this._name}, resourceName=${this._resourceName}`);

			this.data = data;

			return this._data;
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Remove data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	remove(id, parameters)
	{

		return this._remove(id, parameters);

	}

    // -------------------------------------------------------------------------

	/**
	 * Add data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	add(id, data, parameters)
	{

		return this._add(id, this.#__reshapeData(data), parameters);

	}

    // -------------------------------------------------------------------------

	/**
	 * Update data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to update.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	update(id, data, parameters)
	{

		return this._update(id, this.#__reshapeData(data), parameters);

	}

    // -------------------------------------------------------------------------

	/**
	 * Get resource text for the code.
	 *
	 * @param	{String}		code				Code value.
	 *
	 * @return  {String}		Resource text.
	 */
	getText(code)
	{

		let ret = code;
		let title = this._options.get("fieldOptions.text");

		if (this._items && code in this._items)
		{
			ret = this._items[code][title];
		}

		return ret;

	}

    // -------------------------------------------------------------------------

	/**
	 * Get resource item for the code.
	 *
	 * @param	{String}		code				Code value.
	 *
	 * @return  {Object}		Resource data.
	 */
	getItem(code)
	{

		let ret;

		if (this._items && code in this._items)
		{
			ret = this._items[code];
		}

		return ret;

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Load data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_load(id, parameters)
	{
	}

    // -------------------------------------------------------------------------

	/**
	 * Remove data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_remove(id, parameters)
	{
	}

    // -------------------------------------------------------------------------

	/**
	 * Add data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_add(id, data, parameters)
	{
	}

    // -------------------------------------------------------------------------

	/**
	 * Update data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to update.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_update(id, data, parameters)
	{
	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get and reshape items from raw data on load.
	 *
	 * @param	{Object}		data				Raw data from which items are retrieved.
	 *
	 * @return  {Object}		Reshaped items.
	 */
	#__reshapeItems(data)
	{

		// Get items
		let itemsField = this._options.get("fieldOptions.items");
		let items = ( itemsField ? Util.safeGet(data, itemsField) : data );

		// Reshape
		if (this._options.get("reshapeOptions.load.reshape"))
		{
			let reshaper = this._options.get("reshapeOptions.load.reshaper", this.#__reshaper_load.bind(this));
			items = reshaper(items);
		}

		return items;

	}

	// -------------------------------------------------------------------------

	/**
	 * Reshape request data on add/update.
	 *
	 * @param	{Object}		data				Data to reshape.
	 *
	 * @return  {Object}		Reshaped data.
	 */
	#__reshapeData(data)
	{

		if (this._options.get("reshapeOptions.update.reshape"))
		{
			let reshaper = this._options.get("reshapeOptions.update.reshaper", () => { return data; });
			data = reshaper(data);
		}

		return data;

	}

	// -------------------------------------------------------------------------

	/**
     * Reshape items on load.
     *
     * @param	{Object}		target				Target to reshape.
	 *
	 * @return  {Object}		Master object.
     */
	#__reshaper_load(target)
	{

		let items;

		if (target)
		{
			let idField = this._options.get("fieldOptions.id");
			items = target.reduce((result, current) => {
				let id = current[idField];
				result[id] = current;

				return result;
			}, {});
		}

		return items;

	}

}

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
//	Cookie resource handler class
// =============================================================================

class CookieResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(unit, resourceName, options)
	{

		let defaults = {"autoLoad":true, "autoFetch":false};
		super(unit, resourceName, Object.assign(defaults, options));

		this._cookieName = Util.safeGet(options, "cookieOptions.name", "preferences");

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	_load(id, parameters)
	{

		return this.#__getCookie(this._cookieName);

	}

	// -------------------------------------------------------------------------

	_add(id, data, parameters)
	{

		this.#__setCookie(this._cookieName, data);

	}

	// -------------------------------------------------------------------------

	_update(id, data, parameters)
	{

		this.#__setCookie(this._cookieName, data);

	}

	// -----------------------------------------------------------------------------
	//  Privates
	// -----------------------------------------------------------------------------

	/**
	* Get cookie.
	*
	* @param	{String}		key					Key.
	*/
	#__getCookie(key)
	{

		let decoded = document.cookie.split(';').reduce((result, current) => {
			const [key, value] = current.split('=');
			if (key)
			{
				result[key.trim()] = ( value ? decodeURIComponent(value.trim()) : undefined );
			}

			return result;
		}, {});

		return ( decoded[key] ? JSON.parse(decoded[key]) : {});

	}

	// -----------------------------------------------------------------------------

	/**
	* Set cookie.
	*
	* @param	{String}		key					Key.
	* @param	{Object}		value				Value.
	*/
	#__setCookie(key, value)
	{

		let cookie = key + `=${encodeURIComponent(JSON.stringify(value))}; `;
		let options = this._options.get("cookieOptions");

		cookie += Object.keys(options).reduce((result, current) => {
			result += `${current}=${options[current]}; `;

			return result;
		}, "");

		document.cookie = cookie;

	}

}

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
//	API Resource Handler class
// =============================================================================

class APIResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	// 	Protected
	// -------------------------------------------------------------------------

	_load(id, parameters)
	{

		let method = "GET";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("URL", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

		return AjaxUtil.ajaxRequest({URL:url, method:method, headers:headers, options:options}).then((xhr) => {
			return this._convertResponseData(xhr.responseText, dataType);
		});

	}

    // -------------------------------------------------------------------------

	_remove(id, parameters)
	{

		let method = "DELETE";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("URL", method);
		urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

		return AjaxUtil.ajaxRequest({URL:url, method:method, headers:headers, options:options});

	}

    // -------------------------------------------------------------------------

	_add(id, data, parameters)
	{

		let method = "POST";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("URL", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

		return AjaxUtil.ajaxRequest({URL:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

	}

    // -------------------------------------------------------------------------

	_update(id, data, parameters)
	{

		let method = "PUT";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("URL", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

		return AjaxUtil.ajaxRequest({URL:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Convert request data to specified format.
	 *
	 * @param	{Object}		data				Data to convert.
	 * @param	{String}		dataType			Target data type.
	 *
	 * @return  {String}		Converted data.
	 */
	_convertRequestData(items, dataType)
	{

		let data;

		switch (dataType)
		{
		case "json":
		default:
			data = JSON.stringify(items);
			break;
		/*
		default:
			data = items.serialize();
			break;
		*/
		}

		return data;

	}

	// -------------------------------------------------------------------------

	/**
	 * Convert response data to object.
	 *
	 * @param	{Object}		items				Data to convert.
	 * @param	{String}		dataType			Source data type.
	 *
	 * @return  {String}		Converted data.
	 */
	_convertResponseData(items, dataType)
	{

		let data;

		switch (dataType)
		{
		case "json":
		default:
			data = JSON.parse(items);
			break;
		}

		return data;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get option for the method.
	 *
	 * @param	{String}		target				"ajaxHeaders" or "ajaxOptions"..
	 * @param	{String}		method				Method.
	 *
	 * @return  {Object}		Options.
	 */
	_getOption(target, method)
	{

		let settings = this._options.get("ajaxOptions", {});
		let options1 = (target in settings && "COMMON" in settings[target] ? settings[target]["COMMON"] : {} );
		let options2 = (target in settings && method in settings[target] ? settings[target][method] : {} );

		return Object.assign(options1, options2);

	}

	// -------------------------------------------------------------------------

	/**
	 * Build url for the api.
	 *
	 * @param	{String}		resource			API resource.
	 * @param	{String}		id					Id for the resource.
	 * @param	{Object}		options				Url options.
	 *
	 * @return  {String}		Url.
	 */
	_buildApiUrl(resourceName, id, parameters, options)
	{

		let baseUrl = options["baseURL"] || "";
		let scheme = options["scheme"] || "";
		let host = options["host"] || "";
		let dataType = options["dataType"] || "";
		let version = options["version"] || "";
		let format = options["format"] || "";
		let url = format.
					replace("@scheme@", scheme).
					replace("@host@", host).
					replace("@baseURL@", baseUrl).
					replace("@resource@", resourceName).
					replace("@id@", id).
					replace("@dataType@", dataType).
					replace("@query@", URLUtil.buildQuery(parameters)).
					replace("@version@", version);

		return url

	}

}

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
//	Object Resource Handler class
// =============================================================================

class ObjectResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(unit, resourceName, options)
	{

		let defaults = {"autoLoad":true, "autoFetch":false, "autoSubmit":false};
		super(unit, resourceName, Object.assign(defaults, options));

		if (options["items"])
		{
			this.data = options["items"];
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	_load(id, parameters)
	{

		return this._data;

	}

    // -------------------------------------------------------------------------

	_update(id, data, parameters)
	{

		this.data = data;

	}

}

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
//	Linked Resource Handler class
// =============================================================================

class LinkedResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(unit, resourceName, options)
	{

		let defaults = {"autoLoad":true, "autoFetch":false, "autoSubmit":false};
		super(unit, resourceName, Object.assign(defaults, options));

		this._ref;

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	get data()
	{

		return this._ref.data;

	}

	set data(value)
	{

		//return this._ref.data = value;
		//throw TypeError("LinkedResourceHandler is read only.");

	}

	// -------------------------------------------------------------------------

	get items()
	{

		return this._ref.items;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	getText(code)
	{

		return this._ref.getText(code);

	}

    // -------------------------------------------------------------------------

	getItem(code)
	{

		return this._ref.getItem(code);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	_load(id, parameters)
	{

		let rootNode = this._options.get("selector");
		let resourceName = this._options.get("resourceName") || this._resourceName;

		return this._unit.cast("status.wait", [rootNode]).then(() => {
			this._ref = document.querySelector(rootNode).get("inventory", "resource.resources")[resourceName];
			return this._ref;
		});

	}

	// -------------------------------------------------------------------------

	_remove(id, parameters)
	{

//		return this._ref.delete(id, parameters);
		throw TypeError("LinkedResourceHandler is read only.");

	}

	// -------------------------------------------------------------------------

	_add(id, data, parameters)
	{

		//return this._ref.post(id, data, parameters);
		throw TypeError("LinkedResourceHandler is read only.");

	}

	// -------------------------------------------------------------------------

	//_put(id, data, parameters)
	_update(id, data, parameters)
	{

//		return this._ref.put(id, data, parameters);
		throw TypeError("LinkedResourceHandler is read only.");

	}

}

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
//	Web Storage handler class
// =============================================================================

class WebStorageResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	_load(id, parameters)
	{

		let data;
		let rawData = localStorage.getItem(id);
		if (rawData)
		{
			data = JSON.parse(rawData);
		}

		return data;

	}

	// -------------------------------------------------------------------------

	_remove(id, parameters)
	{

		localStorage.removeItem(id);

	}

	// -------------------------------------------------------------------------

	_add(id, data, parameters)
	{

		localStorage.setItem(id, JSON.stringify(data));

	}

	// -------------------------------------------------------------------------

	_update(id, data, parameters)
	{

		localStorage.setItem(id, JSON.stringify(data));

	}

}

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
//	Locale Formatter util class
// =============================================================================

class LocaleFormatterUtil extends FormatterUtil
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static formatPrice(type, typeOption, value, options)
	{

		let locale = ( options && options["localeName"] ? options["localeName"] : navigator.language );
		let currency = ( options && options["currencyName"] ? options["currencyName"] : "USD" );

		return new Intl.NumberFormat(locale, {
			style:		"currency",
			currency:	currency
		}).format(value);

	}

	// -------------------------------------------------------------------------

	static formatDate(type, typeOption, value, options)
	{

		let ret = value;

		if (typeOption)
		{
			ret = super.formatDate(type, typeOption, value, options);
		}
		else
		{
			let locale = ( options && options["localeName"] ? options["localeName"] : navigator.language );
			let dt;
			if (value.length === 8)
			{
				dt = new Date(`${value.substr(0, 4)}-${value.substr(4, 2)}-${value.substr(6, 2)}`);
			}
			else
			{
				dt = new Date(value);
			}

			ret = new Intl.DateTimeFormat(locale).format(dt);
		}

		return ret || "";

	}

}

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
//	Locale Value Util Class
// =============================================================================

class LocaleValueUtil extends ValueUtil
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Attribute name.
	 *
	 * @type	{String}
	 */
	static get attributeName()
	{

		return "bm-locale";

	}

	// -------------------------------------------------------------------------

	/**
	 * Formatter.
	 *
	 * @type	{Class}
	 */
	static get formatter()
	{

		return LocaleFormatterUtil;

	}

}

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
//	Locale Handler class
// =============================================================================

class LocaleHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{String}		handlerName			Handler name.
     * @param	{Object}		options				Options.
     */
	constructor(unit, options)
	{

		options = options || {};

		this._unit = unit;
		this._options = new Store({"items":options});
		this._messages = new ChainableStore();
		this._valueHandler = this.options.get("valueHandler", LocaleValueUtil);
		this._localeInfo = {};

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Options.
	 *
	 * @type	{Object}
	 */
	get options()
	{

		return this._options;

	}

	// -------------------------------------------------------------------------

	/**
	 * Messages.
	 *
	 * @type	{Object}
	 */
	get messages()
	{

		return this._messages;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Init the handler.
     *
     * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	init(options)
	{

		// Chain this handler's messages store to unit's locale.messages store
		this._unit.get("inventory", "locale.messages").add(this._messages);

		// Get messages from settings
		if (options["messages"]) {
			let messages = Util.getObject(options["messages"], {"format":this.#__getMessageFormat(this._unit)});
			this._messages.merge(messages);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the handler has specified locale data.
	 *
	 * @param	{String}		localeName			Locale name.
	 *
 	 * @return  {Boolean}		True if locale data is available.
	 */
	has(localeName)
	{

		return this._messages.has(localeName);

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the message which belong to the locale name.
	 *
	 * @param	{String}		localeName			Locale name.
	 * @param	{String}		key					Key.
	 *
 	 * @return  {String}		Messages.
	 */
	get(localeName, key)
	{

		key = localeName + ( key ? `.${key}` : "" );

		return this._messages.get(key);

	}

	// -------------------------------------------------------------------------

	/**
	 * Localize all the bm-locale fields with i18 messages.
	 *
	 * @param	{HTMLElement}	rootNode			Target root node to localize.
	 * @param	{Object}		options				Options.
	 */
	localize(rootNode, options)
	{

		let messages = (this.get(options["localeName"]) || this.get(options["fallbackLocaleName"]));

		this._valueHandler.setFields(rootNode, messages, options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the messages file.
	 *
	 * @param	{String}		localeName			Locale name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	loadMessages(localeName, options)
	{

		let splitMessages = Util.safeGet(options, "splitLocale",
								this._options.get("handlerOptions.splitLocale",
									this._unit.get("setting", "system.locale.options.splitLocale")));
		localeName = ( splitMessages ? localeName : "" );
		let localeInfo = this._localeInfo[localeName] || {};
		let promise = Promise.resolve();

		if (localeInfo["status"] === "loaded")
		{
			console.debug(`LocaleHandler.loadMessages(): Messages already loaded. name=${this._unit.tagName}, localeName=${localeName}`);
			return promise;
		}

		if (this.#__hasExternalMessages(this._unit))
		{
			let url = this.#__getMessageURL(this._unit, localeName);
			promise = AjaxUtil.loadJSON(url, options).then((messages) => {
				localeInfo["messages"] = Util.getObject(messages, {"format":this.#__getMessageFormat(this._unit)});
				localeInfo["status"] = "loaded";
				this._messages.merge(messages);
				this._localeInfo[localeName] = localeInfo;
			});
		}

		return promise;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the external messages file.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {Boolean}		True if the unit has the external messages file.
	 */
	#__hasExternalMessages(unit)
	{

		let ret = false;

		if (unit.hasAttribute("bm-localeref") || this._options.get("handlerOptions.localeRef"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to messages file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		localeName			Locale name.
	 *
	 * @return  {String}		URL.
	 */
	#__getMessageURL(unit, localeName)
	{

		let path;
		let fileName;
		let query;

		let localeRef = (unit.hasAttribute("bm-localeref") ?  unit.getAttribute("bm-localeref") || true : this._options.get("handlerOptions.localeRef"));
		if (localeRef && localeRef !== true)
		{
			// If URL is specified in ref, use it
			let url = URLUtil.parseURL(localeRef);
			fileName = url.filename;
			path = url.path;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = Util.concatPath([
					unit.get("setting", "system.locale.options.path", unit.get("setting", "system.unit.options.path", "")),
					unit.get("setting", "locale.options.path", unit.get("setting", "unit.options.path", "")),
				]);
			fileName = this._options.get("handlerOptions.fileName", unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()));
			let ext = this.#__getMessageFormat(unit);
			query = unit.get("setting", "unit.options.query");

			// Split Locale
			if (localeName)
			{
				fileName = ( localeName ? `${fileName}.${localeName}` : fileName);
			}

			fileName = `${fileName}.messages.${ext}`;
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Return default messages file format.
	 *
	 * @param       {Unit}                  unit                            Unit.
	 *
	 * @return  {String}            "js" or "json".
	 */
	#__getMessageFormat(unit)
	{

		return this._options.get("messageFormat",
			unit.get("setting", "locale.options.messageFormat",
				unit.get("setting", "system.locale.options.messageFormat",
					"json")));

	}

}

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
//	LocaleServer Handler class
// =============================================================================

class LocaleServerHandler extends LocaleHandler
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	init(options)
	{

		let serverNode = this._unit.get("setting", "locale.options.localeServer", this._unit.get("setting", "system.locale.options.localeServer"));
		serverNode = ( serverNode === true ? "bm-locale" : serverNode );

		Util.assert(serverNode, () => `Locale Server node not specified in settings. name=${this._unit.tagName}`);

		return this._unit.cast("status.wait", [serverNode]).then(() => {
			let server = document.querySelector(serverNode);
			this._messages.chain(server.get("inventory", "locale.messages"));
		});

	}

	// -------------------------------------------------------------------------

	loadMessages(localeName, options)
	{
	}

}

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
//	Validation Handler class
// =============================================================================

class ValidationHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{String}		validatorName		Validator name.
     * @param	{Object}		options				Options.
     */
	constructor(unit, validatorName, options)
	{

		options = options || {};

		this._unit = unit;
		this._options = new Store({"items":options});

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Options.
	 *
	 * @type	{Object}
	 */
	get options()
	{

		return this._options;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Init the handler.
     *
     * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	init(options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Check validity (Need to override).
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 * @param	{Object}		options				Validation options.
	 */
	checkValidity(values, rules, options)
	{
	}

	// -------------------------------------------------------------------------

	/**
	 * Report validity (Need to override).
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 */
	reportValidity(values, rules)
	{
	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Validate.
	 *
	 * @param	{Object}		values				Values to validate.
	 * @param	{Object}		rules				Validation rules.
	 * @param	{Object}		options				Validation options.
	 *
 	 * @return  {Object}		Invalid results.
	 */
	_validate(values, rules, options)
	{

		rules = rules || {};
		options = options || {};
		let invalids = {};

		// Allow list
		if (options["allowList"])
		{
			Object.keys(values).forEach((key) => {
				if (options["allowList"].indexOf(key) === -1)
				{
					let failed = [{"rule":"allowList", "validity":"notAllowed"}];
					invalids[key] = this._createValidationResult(key, values[key], rules[key], failed);
				}
			});
		}

		// Allow only in rules
		if (options["allowOnlyInRules"])
		{
			Object.keys(values).forEach((key) => {
				if (!(key in rules))
				{
					let failed = [{"rule":"allowList", "validity":"notAllowed"}];
					invalids[key] = this._createValidationResult(key, values[key], rules[key], failed);
				}
			});
		}

		// Disallow list
		if (options["disallowList"])
		{
			Object.keys(values).forEach((key) => {
				if (options["disallowList"].indexOf(key) > -1)
				{
					let failed = [{"rule":"disallowList", "validity":"disallowed"}];
					invalids[key] = this._createValidationResult(key, values[key], rules[key], failed);
				}
			});
		}

		// Required
		Object.keys(rules).forEach((key) => {
			if ("constraints" in rules[key] && rules[key]["constraints"] && "required" in rules[key]["constraints"] && rules[key]["constraints"]["required"])
			{
				if (!(key in values))
				{
					let failed = [{"rule":"required", "validity":"valueMissing"}];
					invalids[key] = this._createValidationResult(key, values[key], rules[key], failed);
				}
			}
		});

		return invalids;

	}

	// -------------------------------------------------------------------------

	/**
	 * Create validation result object.
	 *
	 * @param	{String}		key					Key.
	 * @param	{*}				value				Value.
	 * @param	{Object}		rule				Validation rule.
	 * @param	{Object}		failed				Failed reports.
	 * @param	{Object}		extra				Extra reports.
	 *
 	 * @return  {Object}		Invalid result.
	 */
	_createValidationResult(key, value, rule, failed, extras)
	{

		let result = {
			"key":			key,
			"value":		value,
			"message":		this._getFunctionValue(key, value, "message", rule),
			"fix":			this._getFunctionValue(key, value, "fix", rule),
			"failed":		failed,
			"extras":		extras,
		};

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the value from the custom function or the value.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{String}		target				Target name.
	 * @param	{Object}		rule				Validation rules.
	 */
	_getFunctionValue(key, value, target, rule)
	{

		let ret;

		if (rule && target in rule)
		{
			if (typeof rule[target] === "function")
			{
				ret = rule[target](key, value, rule);
			}
			else
			{
				ret = rule[target];
			}
		}

		return ret;

	}

}

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
//	HTML5 Form validation Handler class
// =============================================================================

class HTML5FormValidationHandler extends ValidationHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	constructor(unit, validatorName, options)
	{

		super(unit, validatorName, options);

		this._valueHandler = this.options.get("valueHandler", ValueUtil);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	checkValidity(values, rules, options)
	{

		let invalids1 = {};
		let invalids2;
		let form = Util.scopedSelectorAll(this._unit, "form")[0];
		if (rules || options)
		{
			// Check allow/disallow list
			let values = this._valueHandler.getFields(form);
			invalids1 = super._validate(values, rules, options);
		}
		invalids2 = this._validate(form, rules);
		let invalids = Util.deepMerge(invalids1, invalids2);

		this._unit.set("inventory", "validation.validationResult.result", (Object.keys(invalids).length > 0 ? false : true ));
		this._unit.set("inventory", "validation.validationResult.invalids", invalids);

	}

	// -------------------------------------------------------------------------

	reportValidity(values, rules)
	{

		let form = Util.scopedSelectorAll(this._unit, "form")[0];

		Util.assert(form, () => `FormValidationHandler.reportValidity(): Form tag does not exist.`, TypeError);
		Util.assert(form.reportValidity, () => `FormValidationHandler.reportValidity(): Report validity not supported.`, TypeError);

		form.reportValidity();

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	_validate(form, rules)
	{

		let invalids = {};

		Util.assert(form, () => `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
		Util.assert(form.checkValidity, () => `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

		let elements = Util.scopedSelectorAll(form, "input:not([novalidate])");
		elements.forEach((element) => {
			let key = element.getAttribute("bm-bind");
			let value = this._valueHandler.getValue(element);
			let rule = ( rules && rules[key] ? rules[key] : null );

			let failed = this._validateValue(element, key, value, rule);
			if (failed.length > 0)
			{
				invalids[key] = this._createValidationResult(key, value, rule, failed, {"element": element});
				invalids["message"] = invalids["message"] || element.validationMessage;
			}
		});

		return invalids;

	}

	/*
	validate(form, rules)
	{

		let invalids = [];

		Util.assert(form, () => `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
		Util.assert(form.checkValidity, () => `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

		if (!form.checkValidity())
		{
			let invalid = {"element":form, "message":form.validationMessage};
			invalids.push(invalid);
		}

		return invalids;

	}
	*/

	// -------------------------------------------------------------------------


	/**
	 * Validate the single value.
	 *
	 * @param	{HTMLElement}	element				HTML element to validaate.
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{Object}		rules				Validation rules.
	 *
 	 * @return  {Object}		Failed results.
	 */
	_validateValue(element, key, value, rules)
	{

		let failed = [];

		let result = element.validity;
		if (!result.valid)
		{
			for (const errorName in result)
			{
				if (errorName !== "valid" && result[errorName])
				{
					failed.push({"validity":errorName});
				}
			}
		}

		return failed;

	}

}

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
//	Object validation Handler class
// =============================================================================

class ObjectValidationHandler extends ValidationHandler
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	checkValidity(values, rules, options)
	{

		let invalids1 = super._validate(values, rules, options); // Check allow/disallow/required
		let invalids2 = this._validate(values, rules);
		let invalids = Util.deepMerge(invalids1, invalids2);

		this._unit.set("inventory", "validation.validationResult.result", ( Object.keys(invalids).length > 0 ? false : true ));
		this._unit.set("inventory", "validation.validationResult.invalids", invalids);

	}

	// -------------------------------------------------------------------------

	reportValidity(values, rules)
	{
	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	_validate(values, rules)
	{

		let invalids = {};

		if (rules)
		{
			Object.keys(values).forEach((key) => {
				if (rules[key])
				{
					let failed = this._validateValue(key, values[key], rules[key]);
					if (failed.length > 0)
					{
						invalids[key] = this._createValidationResult(key, values[key], rules[key], failed);
					}
				}
			});
		}

		return invalids;

	}

	// -------------------------------------------------------------------------

	/**
	 * Validate the single value.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{Object}		rules				Validation rules.
	 *
 	 * @return  {Object}		Failed results.
	 */
	_validateValue(key, value, rules)
	{

		let failed = [];

		if (rules && rules["constraints"])
		{
			Object.keys(rules["constraints"]).forEach((constraintName) => {
				let result = this._checkConstraint(key, value, constraintName, rules["constraints"][constraintName]);
				if (result)
				{
					failed.push(result);
				}
			});
		}

		return failed;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check the single constraint.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{String}		constraintName		Constraint name.
	 * @param	{Object}		rule				Validation rules.
	 *
 	 * @return  {Object}		Failed result.
	 */
	_checkConstraint(key, value, constraintName, rule)
	{

		let result;
		let len;
		let num;

		switch (constraintName)
		{
		case "type":
			result = this._checkType(key, value, constraintName, rule);
			break;
		case "required":
			if (!value)
			{
				result = {"rule":"required", "validity":"valueMissing"};
			}
			break;
		case "minlength":
			len = String(value).length;
			if (len < rule)
			{
				result = {"rule":"minlength", "validity":"tooShort(min:" + rule + ")"};
			}
			break;
		case "maxlength":
			len = String(value).length;
			if (len > rule)
			{
				result = {"rule":"maxlength", "validity":"tooLong(max:" + rule + ")"};
			}
			break;
		case "min":
			num = parseInt(value);
			if (num < rule)
			{
				result = {"rule":"min", "validity":"rangeUnderflow(min:" + rule + ")"};
			}
			break;
		case "max":
			num = parseInt(value);
			if (num > rule)
			{
				result = {"rule":"max", "validity":"rangeOverflow(max:" + rule + ")"};
			}
			break;
		case "pattern":
			let re = new RegExp(rule);
			if (!re.test(value))
			{
				result = {"rule":"pattern", "validity":"patternMismatch(pattern:" + rule + ")"};
			}
			break;
		case "valids":
			if (rule.indexOf(value) === -1)
			{
				result = {"rule":"valids", "validity":"validsMismatch"};
			}
			break;
		case "custom":
			if (!rule(key, value, rule))
			{
				result = {"rule":"custom", "validity":"customMismatch"};
			}
			break;
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Check the single type constraint.
	 *
	 * @param	{String}		key					Item name.
	 * @param	{Object}		value				Value to validate.
	 * @param	{String}		constraintName		Constraint name.
	 * @param	{Object}		rule				Validation rules.
	 *
 	 * @return  {Object}		Failed result.
	 */
	_checkType(key, value, constraintName, rule)
	{

		let result;

		if (value)
		{
			switch (rule)
			{
			case "object":
				if (typeof value !== "object")
				{
					result = {"rule":"type", "validity":"typeMismatch(object)"};
				}
				break;
			case "function":
				if (typeof value !== "function")
				{
					result = {"rule":"type", "validity":"typeMismatch(function)"};
				}
				break;
			case "string":
				if (typeof value !== "string")
				{
					result = {"rule":"type", "validity":"typeMismatch(string)"};
				}
				break;
			case "number":
				let parsed = parseInt(value);
				if (isNaN(parsed))
				{
					result = {"rule":"type", "validity":"typeMismatch(number)"};
				}
				break;
			}
		}

		return result;

	}

}

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
//	Preference Server Class
// =============================================================================

class PreferenceServer extends Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoRefresh":					false,
				}
			},
			"event": {
				"events": {
					"this": {
						"handlers": {
							"beforeStart":			["PreferenceServer_onBeforeStart"],
							"beforeSubmit":			["PreferenceServer_onBeforeSubmit"],
							"doReportValidity":		["PreferenceServer_onDoReportValidity"]
						}
					}
				}
			},
			"form": {
				"options": {
					"autoCollect":					false,
					"autoCrop":						false,
				}
			},
			"skin": {
				"options": {
					"hasSkin":						false,
				}
			},
			"style": {
				"options": {
					"hasStyle":						false,
				}
			},
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Preferences.
	 *
	 * @type	{Object}
	 */
	get items()
	{

		return this._store.items;

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	PreferenceServer_onBeforeStart = function(sender, e, ex)
	{

		this._store = new ObservableStore({"items":this.get("setting", "options.defaults"), "filter":this._filter, "async":true});

		Object.keys(this.get("inventory", "resource.resources", {})).forEach((key) => {
			this._store.merge(this.get("inventory", `resource.resources.${key}`).items);
		});

	}

	// -------------------------------------------------------------------------

	PreferenceServer_onBeforeSubmit = function(sender, e, ex)
	{

		this._store.set("", e.detail.items, e.detail.options, ...e.detail.args);

		// Pass items to the latter event handlers
		e.detail.items = this._store.items;

	}

	// -------------------------------------------------------------------------

	PreferenceServer_onDoReportValidity = function(sender, e, ex)
	{

		let msg = `Invalid preference value. name=${this.tagName}`;
		Object.keys(this.get("inventory", "validation.validationResult.invalids")).forEach((key) => {
			msg += "\n\tkey=" + this.get("inventory", `validation.validationResult.invalids.${key}.key`) + ", value=" + this.get("inventory", `validation.validationResult.invalids.${key}.value`);
		});
		console.error(msg);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Subscribe to the Server. Get a notification when prefrence changed.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	subscribe(unit, options)
	{

		this._store.subscribe(
			`${unit.tagName}_${unit.uniqueId}`,
			this._triggerEvent.bind(unit),
			options,
		);

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the value from store. Return default value when specified key is not available.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	getPreference(key, defaultValue)
	{

		return this._store.get(key, defaultValue);

	}

	// -------------------------------------------------------------------------

	/**
	 * Set the value to the store.
	 *
	 * @param	{Object}		values				Values to store.
	 * @param	{Object}		options				Options.
	 */
	setPreference(values, options, ...args)
	{

		let validatorName = this.get("setting", "options.validatorName");

		return this.cast("form.submit", {"items":values, "options":options, "args":args, "validatorName":validatorName});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Trigger preference changed events.
	 *
	 * @param	{Object}		items				Changed items.
	 *
	 * @return  {Promise}		Promise.
	 */
	_triggerEvent(changedItems, observerInfo, options)
	{

		let sender = Util.safeGet(options, "sender", this);

		return this.cast("preference.apply", {"sender":sender, "preferences":changedItems});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if it is the target.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Object}		observerInfo		Observer info.
	 */
	_filter(conditions, observerInfo, ...args)
	{

		let result = false;
		let target = observerInfo["options"]["targets"];
		target = ( Array.isArray(target) ? target : [target] );

		for (let i = 0; i < target.length; i++)
		{
			if (conditions[target[i]])
			{
				result = true;
				break;
			}
		}

		return result;

	}

}

customElements.define("bm-preference", PreferenceServer);

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
//	Error Server class
// =============================================================================

class ErrorServer extends Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoRefresh":					false,
				}
			},
			"event": {
				"events": {
					"this": {
						"handlers": {
							"beforeStart":			["ErrorServer_onBeforeStart"],
						}
					}
				}
			},
			"skin": {
				"options": {
					"hasSkin":						false,
				}
			},
			"style": {
				"options": {
					"hasStyle":						false,
				}
			},
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	ErrorServer_onBeforeStart(sender, e, ex)
	{

		this._observers = new ObservableStore({"filter":this.#__filter});

		// Install error listner
		this.#__initListeners();

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Filter target units to notify.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		observerInfo		Observer info.
	 */
	#__filter(conditions, observerInfo, ...args)
	{

		let result = false;
		let targets = observerInfo["options"]["unit"].get("setting", "errors.targets");
		let e = args[0]["error"];

		for (let i = 0; i < targets.length; i++)
		{
			if (e.name === targets[i] || targets[i] === "*")
			{
				result = true;
				break;
			}
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Init error handling listeners.
	 */
	#__initListeners()
	{

		window.addEventListener("unhandledrejection", this.#__rejectionHandler.bind(this));
		window.addEventListener("error", this.#__errorHandler.bind(this));

	}

	// -------------------------------------------------------------------------

	/**
	 * Handle unhandled rejection.
	 *
	 * @param	{Error}			error				Error object.
	 */
	#__rejectionHandler(error)
	{

		let e = {};

		try
		{
			if (error.reason)
			{
				if (error.reason instanceof XMLHttpRequest)
				{
					e.message = error.reason.statusText;
					e.stack = error.reason.stack;
					e.object = error.reason;
				}
				else
				{
					e.message = error.reason.message;
					e.object = error.reason;
				}
			}
			else
			{
				e.message = error;
			}
			e.type = error.type;
			e.name = this.#__getErrorName(error);
			e.filename = "";
			e.funcname = "";
			e.lineno = "";
			e.colno = "";
			// e.stack = error.reason.stack;
			// e.object = error.reason;
			//
			this.#__handleException(e);
		}
		catch(e)
		{
			console.error("An error occurred in error handler", e);
		}

		//return false;
		return true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Handle error.
	 *
	 * @param	{Error}			error				Error object.
	 * @param	{String}		file				File name.
	 * @param	{Number}		line				Line no.
	 * @param	{Number}		col					Col no.
	 */
	#__errorHandler(error, file, line, col)
	{

		let e = {};

		try
		{
			e.type = "error";
			e.name = this.#__getErrorName(error);
			e.message = error.message;
			e.file = error.filename;
			e.line = error.lineno;
			e.col = error.colno;
			if (error.error)
			{
				e.stack = error.error.stack;
				e.object = error.error;
			}

			this.#__handleException(e);
		}
		catch(e)
		{
			console.error("An error occurred in error handler", e);
		}

		//return false;
		return true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get an error name for the given error object.
	 *
	 * @param	{Object}		error				Error object.
	 *
	 * @return  {String}		Error name.
	 */
	#__getErrorName(error)
	{

		let name;
		let e;

		if (error.reason instanceof XMLHttpRequest)		e = error.reason;
		else if (error.reason)	e = error.reason;
		else if (error.error)	e = error.error;
		else					e = error.message;

		if (e.name)									name = e.name;
		else if (e instanceof TypeError)			name = "TypeError";
		else if (e instanceof XMLHttpRequest)		name = "AjaxError";
		else if (e instanceof EvalError)			name = "EvalError";
	//	else if (e instanceof InternalError)		name = "InternalError";
		else if (e instanceof RangeError)			name = "RangeError";
		else if (e instanceof ReferenceError)		name = "ReferenceError";
		else if (e instanceof SyntaxError)			name = "SyntaxError";
		else if (e instanceof URIError)				name = "URIError";
		else
		{
			let pos = e.indexOf(":");
			if (pos > -1)
			{
				name = e.substring(0, pos);
			}
		}

		return name;

	}

	// -------------------------------------------------------------------------

	/**
	 * Handle an exeption.
	 *
	 * @param	{Object}		e					Error object.
	 */
	#__handleException(e)
	{

		//window.stop();

		let statusCode = e.object.status;
		let handlers = this.get("setting", "handlers");
		Object.keys(handlers["statusCode"]).forEach((code) => {
			if (statusCode == code)
			{
				Object.keys(handlers["statusCode"][code]).forEach((command) => {
					let options = handlers["statusCode"][code][command];
					switch (command)
					{
					case "route":
						let routeInfo = options["routeInfo"];
						Object.keys(routeInfo["queryParameters"]).forEach((key) => {
							routeInfo["queryParameters"][key] = routeInfo["queryParameters"][key].replace("@URL@", location.href);
						});
						window.location.href = URLUtil.buildURL(routeInfo);
						/*
						let tagName = options["selector"] || "bm-router";
						document.querySelector(tagName).cast("routing.openRoute", routeInfo, {"jump":true});
						*/
						break;
					}
				});
			}
		});

		return this._observers.notifyAsync("error", {"sender":this, "error": e});

	}

}

customElements.define("bm-error", ErrorServer);

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
//	Router Class
// =============================================================================

class Router extends Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoRefresh":					false,
					"autoFetch":					false,
					"autoClear":					false,
					"autoFill":						false,
				}
			},
			"skin": {
				"options": {
					"hasSkin":						false,
				}
			},
			"style": {
				"options": {
					"hasStyle":						false,
				}
			},
			"routing": {
			},
		}

	}

}

customElements.define("bm-router", Router);

// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================


// Export to global BITSMIST.V1
if (!globalThis.BITSMIST.V1.EXTRAS)
{
	globalThis.BITSMIST.V1.$EXTRAS = {};
	globalThis.BITSMIST.V1.$EXTRAS.Router = Router;
	globalThis.BITSMIST.V1.$EXTRAS.BindableArrayStore = BindableArrayStore;
	globalThis.BITSMIST.V1.$EXTRAS.BindableStore = BindableStore;
	globalThis.BITSMIST.V1.$EXTRAS.ObservableStore = ObservableStore;
	globalThis.BITSMIST.V1.$EXTRAS.MultiStore = MultiStore;
	globalThis.BITSMIST.V1.$EXTRAS.ArrayStore = ArrayStore;
	globalThis.BITSMIST.V1.$EXTRAS.ValueUtil = ValueUtil;
	globalThis.BITSMIST.V1.$EXTRAS.FormatterUtil = FormatterUtil;
	globalThis.BITSMIST.V1.$EXTRAS.LocaleFormatterUtil = LocaleFormatterUtil;
	globalThis.BITSMIST.V1.$EXTRAS.LocaleValueUtil = LocaleValueUtil;
	globalThis.BITSMIST.V1.$EXTRAS.PreferenceServer = PreferenceServer;
	globalThis.BITSMIST.V1.$EXTRAS.LocaleServer = LocaleServer;
	globalThis.BITSMIST.V1.$EXTRAS.ErrorServer = ErrorServer;
}

// Register Perks
Perk.registerPerk(FilePerk);
Perk.registerPerk(ErrorPerk);
Perk.registerPerk(ElementPerk);
Perk.registerPerk(ResourcePerk);
Perk.registerPerk(ValidationPerk);
Perk.registerPerk(FormPerk);
Perk.registerPerk(ListPerk);
Perk.registerPerk(DatabindingPerk);
Perk.registerPerk(LocalePerk);
Perk.registerPerk(KeyPerk);
Perk.registerPerk(ChainPerk);
Perk.registerPerk(DialogPerk$1);
Perk.registerPerk(PreferencePerk);
Perk.registerPerk(RoutePerk);

// Register Handlers
ResourcePerk.registerHandler(CookieResourceHandler);
ResourcePerk.registerHandler(APIResourceHandler);
ResourcePerk.registerHandler(ObjectResourceHandler);
ResourcePerk.registerHandler(LinkedResourceHandler);
ResourcePerk.registerHandler(WebStorageResourceHandler);
LocalePerk.registerHandler(LocaleHandler);
LocalePerk.registerHandler(LocaleServerHandler);
ValidationPerk.registerHandler(ValidationHandler);
ValidationPerk.registerHandler(HTML5FormValidationHandler);
ValidationPerk.registerHandler(ObjectValidationHandler);

export { ArrayStore, BindableArrayStore, BindableStore, ErrorServer, FormatterUtil, LocaleFormatterUtil, LocaleServer, LocaleValueUtil, MultiStore, ObservableStore, PreferenceServer, Router, ValueUtil };
//# sourceMappingURL=bitsmist-js-extras_v1.esm.js.map
