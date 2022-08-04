(function () {
	'use strict';

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

	class ObservableStore extends BITSMIST.v1.ChainableStore
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

			this._filter;
			this._observers = [];

			this.filter = BITSMIST.v1.Util.safeGet(this._options, "filter", () => { return true; } );

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

			BITSMIST.v1.Util.assert(typeof value === "function", `Store.filter(setter): Filter is not a function. filter=${value}`, TypeError);

			this._filter = value;

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

			let changedItem = {};
			let holder = ( key ? this.get(key) : this._items );

			if (holder && typeof holder === "object")
			{
				this.__deepMerge(holder, value, changedItem);
			}
			else
			{
				if (this.get(key) !== value)
				{
					BITSMIST.v1.Util.safeSet(this._items, key, value);
					changedItem[key] = value;
				}
			}

			let notify = BITSMIST.v1.Util.safeGet(options, "notifyOnChange", BITSMIST.v1.Util.safeGet(this._options, "notifyOnChange"));
			if (notify && Object.keys(changedItem).length > 0)
			{
				return this.notify(changedItem);
			}

		}

		// -----------------------------------------------------------------------------

	    /**
	     * Replace all values in the store.
	     *
	     * @param   {String}        key                 Key to store.
	     * @param   {Object}        value               Value to store.
	     */
	    replace(value, options)
	    {

	        this._items = {};
	        this.__deepMerge(this._items, value);

	        let notify = BITSMIST.v1.Util.safeGet(options, "notifyOnChange", BITSMIST.v1.Util.safeGet(this._options, "notifyOnChange"));
	        if (notify)
	        {
	            return this.notify("*");
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
		__deepMerge(obj1, obj2, changedItem)
		{

			changedItem = changedItem || {};

			BITSMIST.v1.Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", "ObservableStore.__deepMerge(): Parameters must be an object.", TypeError);

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
	//	Formatter util class
	// =============================================================================

	function FormatterUtil() {}

	// -----------------------------------------------------------------------------
	//  Methods
	// -----------------------------------------------------------------------------

	/**
	 * Get a formatter.
	 *
	 * @param	{string}		type				Variable type.
	 * @param	{string}		format				Format.
	 * @param	{string}		value				Value.
	 *
	 * @return  {Object}		Formatter function.
	 */
	FormatterUtil.format = function(type, format, value)
	{

		let ret = value;

		switch (format.toLowerCase())
		{
		case "yyyy/mm/dd":
			ret = FormatterUtil.formatDate(format, ret);
			break;
		case "price":
			ret = FormatterUtil.formatPrice(format, ret);
			break;
		}

		return ret;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Format price.
	 *
	 * @param	{integer}		price				Price.
	 *
	 * @return  {string}		Formatted price.
	 */
	FormatterUtil.formatPrice = function(format, price)
	{

		if (price)
		{
			//let locale = "ja-JP";
			//return new Intl.NumberFormat(locale, {style:"currency", currency:"JPY"}).format(price);
			return "¥" + String(parseInt(price)).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
		}
		else
		{
			return "";
		}

	};

	// -----------------------------------------------------------------------------

	/**
	 * Format price.
	 *
	 * @param	{integer}		price				Price.
	 *
	 * @return  {string}		Formatted price.
	 */
	FormatterUtil.formatNumber = function(number)
	{

		if (number)
		{
			return String(parseInt(number)).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
		}
		else
		{
			return "";
		}

	};

	// -----------------------------------------------------------------------------

	/**
	 * Format date.
	 *
	 * @param	{string}		str					Date.
	 *
	 * @return  {string}		Formatted date.
	 */
	FormatterUtil.formatDate = function(format, str)
	{

		var result = "";
		if (str && str.length === 8)
		{
			result = str.substr(0, 4) + "/" + str.substr(4, 2) + "/" + str.substr(6, 2);
		}

		return result;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get a deformatter.
	 *
	 * @param	{string}		type				Variable type.
	 * @param	{string}		format				Format.
	 * @param	{string}		value				Value.
	 *
	 * @return  {Object}		Deformatter function.
	 */
	FormatterUtil.deformat = function(type, format, value)
	{

		let ret = value;

		switch (format)
		{
		case "yyyy/mm/dd":
			ret = FormatterUtil.deformatDate(format, value);
			break;
		case "price":
			ret = FormatterUtil.deformatPrice(format, value);
			break;
		}

		return ret;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Deformat price.
	 *
	 * @param	{string}		value				Price.
	 *
	 * @return  {string}		Deformatted price.
	 */
	FormatterUtil.deformatPrice = function(format, value)
	{

		var result = "";

		if (value)
		{
			result = value.replace(/,/g, "").replace(/\//g, "").replace(/\\/g, "").replace("¥", "");
		}

		return result;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Deformat date.
	 *
	 * @param	{string}		value				Date.
	 *
	 * @return  {string}		Deformatted date.
	 */
	FormatterUtil.deformatDate = function(format, value)
	{

		var result = "";

		if (value)
		{
			result = value.replace(/,/g, "").replace(/\//g, "").replace(/\\/g, "");
		}

		return result;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get current date time.
	 *
	 * @param	{string}		dateDelimiter		Date delimiter.
	 *
	 * @return  {string}		Current date time.
	 */
	FormatterUtil.getNow = function(dateDelimiter)
	{

		dateDelimiter = ( dateDelimiter ? dateDelimiter : "-" );
		var d = new Date();
		var now = d.getFullYear() + dateDelimiter + ("00" + (d.getMonth() + 1)).slice(-2) + dateDelimiter + ("00" + d.getDate()).slice(-2) + " " +
					("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2);

		return now;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get current date.
	 *
	 * @param	{string}		dateDelimiter		Date delimiter.
	 *
	 * @return  {string}		Current date.
	 */
	FormatterUtil.getToday = function(dateDelimiter)
	{

		dateDelimiter = ( dateDelimiter === undefined ? "-" : dateDelimiter );
		var d = new Date();
		var today = d.getFullYear() + dateDelimiter + ("00" + (d.getMonth() + 1)).slice(-2) + dateDelimiter + ("00" + d.getDate()).slice(-2);

		return today;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Sanitize string.
	 *
	 * @param	{String}		value				Value to sanitize.
	 *
	 * @return  {String}		Sanitized string.
	 */
	FormatterUtil.sanitize = function(value)
	{

		if (typeof value === "string")
		{
			return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
		}
		else
		{
			return value;
		}

	};

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
		let elements = BITSMIST.v1.Util.scopedSelectorAll(rootNode, "[bm-visible]");

		// Show elements
		elements.forEach((element) => {
			let condition = element.getAttribute("bm-visible");
			if (BITSMIST.v1.Util.safeEval(condition, item, item))
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
		let elements = BITSMIST.v1.Util.scopedSelectorAll(rootNode, "[bm-visible]");

		// Hide elements
		elements.forEach((element) => {
			element.style.display = "none";
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Fill the form.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 * @param	{Ojbect}		item				Values to fill.
	 * @param	{Object}		masters				Master values.
	 * @param	{Object}		options				Options.
	 */
	FormUtil.setFields = function(rootNode, item, options)
	{

		let masters = BITSMIST.v1.Util.safeGet(options, "masters");
		let triggerEvent = BITSMIST.v1.Util.safeGet(options, "triggerEvent");

		// Get elements with bm-bind attribute
		let elements = BITSMIST.v1.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		elements.push(rootNode);

		elements.forEach((element) => {
			let fieldName = element.getAttribute("bm-bind");
			if (fieldName in item)
			{
				let value = BITSMIST.v1.Util.safeGet(item, fieldName, "");

				// Get master value
				if (element.hasAttribute("bm-bindtext"))
				{
					let arr = element.getAttribute("bm-bindtext").split(".");
					let type = arr[0];
					let field = arr[1] || "";
					value = FormUtil._getMasterValue(masters, type, item[fieldName], field);
				}

				// Format
				if (element.hasAttribute("bm-format"))
				{
					value = FormatterUtil.format("", element.getAttribute("bm-format"), value);
				}

				// Set
				FormUtil.setValue(element, value);

				// Trigger change event
				if (triggerEvent)
				{
					let e = document.createEvent("HTMLEvents");
					e.initEvent(triggerEvent, true, true);
					element.dispatchEvent(e);
				}
			}
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get form values.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 *
	 * @return  {Object}		Values.
	 */
	FormUtil.getFields = function(rootNode)
	{

		let item = {};

		// Get elements with bm-bind attribute
		let elements = BITSMIST.v1.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		elements.push(rootNode);

		elements.forEach((element) => {
			// Get a value from the element
			let key = element.getAttribute("bm-bind");
			let value = FormUtil.getValue(element);

			// Deformat
			if (element.hasAttribute("bm-format"))
			{
				value = BITSMIST.v1.FormatterUtil.deformat("", element.getAttribute("bm-format"), value);
			}

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

	};

	// -----------------------------------------------------------------------------

	/**
	 * Clear the form.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 * @param	{String}		target				Target.
	 */
	FormUtil.clearFields = function(rootNode, target)
	{

		target = (target ? target : "");

		// Get input elements
		let elements = BITSMIST.v1.Util.scopedSelectorAll(rootNode, target + " input");

		elements.forEach((element) => {
			switch (element.type.toLowerCase())
			{
			case "search":
			case "text":
			case "number":
				element.value = "";
				break;
			case "checkbox":
			case "radio":
				element.checked = false;
				break;
			}
		});

		elements = rootNode.querySelectorAll(target + " select");
		elements = Array.prototype.slice.call(elements, 0);
		elements.forEach((element) => {
			element.selectedIndex = -1;
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Set a value to the element.
	 *
	 * @param	{HTMLElement}	element				Html element.
	 * @param	{String}		value				Value.
	 */
	FormUtil.setValue = function(element, value)
	{

		if (value === undefined || value === null)
		{
			value = "";
		}

		// Sanitize
		//value = FormatterUtil.sanitize(value);

		// Set value
		let targets = element.getAttribute("bm-bindtarget");
		if (targets)
		{
			FormUtil._setValue_target(element, targets, value);
		}
		else if (element.hasAttribute("value"))
		{
			FormUtil._setValue_value(element, value);
		}
		else
		{
			FormUtil._setValue_element(element, value);
		}

	};


	// -----------------------------------------------------------------------------

	/**
	 * Build a form element.
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

	/**
	 * Get value from the element.
	 *
	 * @param	{Object}		element				Html element.
	 *
	 * @return  {String}		Value.
	 */
	FormUtil.getValue = function(element)
	{

		let ret = undefined;

		switch (element.tagName.toLowerCase())
		{
		case "input":
			switch (element.type.toLowerCase())
			{
			case "radio":
			case "checkbox":
				if (element.checked)
				{
					ret = ( element.hasAttribute("value") ? element.getAttribute("value") : element.checked );
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
			break;
		}

		return ret;

	};

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Build a select element.
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
			option.setAttribute("selected", "");
			element.appendChild(option);
		}

		Object.keys(items).forEach((id) => {
			let option = document.createElement("option");

			option.text = ( options["text"] ? items[id][options["text"]] : id );
			option.value = ( options["value"] ? items[id][options["value"]] : id );

			element.appendChild(option);
		});

		if ("defaultValue" in options)
		{
			element.value = options["defaultValue"];
		}

	};

	// -----------------------------------------------------------------------------

	/**
	 * Build a radio element.
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

	// -----------------------------------------------------------------------------

	/**
	 * Set a value to the target positions.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{String}		targets				Target poisitions.
	 * @param	{String}		value				Value.
	 */
	FormUtil._setValue_target = function(element, targets, value)
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
				if (value)
				{
					element.outerHTML = value;
				}
				break;
			case "href":
			case "src":
			case "rel":
				if (value.substring(0, 4) === "http" || value.substring(0, 1) === "/")
				{
					element.setAttribute(item, value);
				}
				break;
			default:
				let attr = element.getAttribute(item);
				attr = ( attr ? attr + " " + value : value );
				element.setAttribute(item, attr);
				break;
			}
		}

	};

	// -----------------------------------------------------------------------------

	/**
	 * Set a value to the value attribute.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{String}		value				Value.
	 */
	FormUtil._setValue_value = function(element, value)
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

	};

	// -----------------------------------------------------------------------------

	/**
	 * Set a value to the element.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{String}		value				Value.
	 */
	FormUtil._setValue_element = function(element, value)
	{

		if (element.tagName.toLowerCase() === "select")
		{
			element.value = value;
		}
		else if (element.tagName.toLowerCase() === "input")
		{
			switch (element.type.toLowerCase())
			{
			case "number":
			case "search":
			case "text":
				element.value = value;
				break;
			case "checkbox":
				element.checked = ( value ? true : false );
				break;
			case "radio":
				if (element.value === value)
				{
					element.checked = true;
				}
				break;
			}
		}
		else
		{
			element.innerText = value;
		}

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get master value.
	 *
	 * @param	{array}			masters				Master values.
	 * @param	{String}		type				Master type.
	 * @param	{String}		code				Code value.
	 *
	 * @return  {String}		Master value.
	 */
	FormUtil._getMasterValue = function(masters, type, code, fieldName)
	{

		let ret = code;

		if (masters && (type in masters))
		{
			let item = masters[type].getItem(code);
			if (item)
			{
				ret = item[fieldName];
			}
		}

		return ret;

	};

	// =============================================================================

	// =============================================================================
	//	Bindable store class
	// =============================================================================

	class BindableStore extends ObservableStore
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

			this.filter = (conditions, observerInfo, ...args) => {
				let ret = false;
				if (conditions === "*" || conditions.indexOf(observerInfo.id) > -1)
				{
					ret = true;
				}
				return ret;
			};

		}

		// -------------------------------------------------------------------------
		//  Method
		// -------------------------------------------------------------------------

		/**
		 * Bind the store to a element.
		 *
		 * @param	{Element}		elem				HTML Element.
		 * @param	{String}		key					Key to store.
		 */
		bindTo(elem)
		{

			let key = elem.getAttribute("bm-bind");

			// Init element's value
	//		FormUtil.setValue(elem, this.get(key));

			let bound = ( elem.__bm_bindinfo && elem.__bm_bindinfo.bound ? true : false );
			if (!bound && BITSMIST.v1.Util.safeGet(this._options, "2way", true))
			{
				// Change element's value when store value changed
				this.subscribe(key, () => {
					FormUtil.setValue(elem, this.get(key));
				});

				// Set store value when element's value changed
				let eventName = BITSMIST.v1.Util.safeGet(this._options, "eventName", "change");
				elem.addEventListener(eventName, (() => {
					this.set(key, FormUtil.getValue(elem), {"notifyOnChange":false});
				}).bind(this));

				elem.__bm_bindinfo = { "bound": true };
			}

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
	//	File organizer class
	// =============================================================================

	class FileOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let promises = [];

			let files = settings["files"];
			if (files)
			{
				Object.keys(files).forEach((fileName) => {
					promises.push(BITSMIST.v1.AjaxUtil.loadScript(files[fileName]["href"]));
				});
			}

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
	//	Error organizer class
	// =============================================================================

	class ErrorOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Global init.
		 */
		static globalInit()
		{

			ErrorOrganizer._observers = new BITSMIST.v1.ObservableStore({"filter":ErrorOrganizer.__filter});

			// Install error listner
			document.addEventListener("DOMContentLoaded", () => {
				if (BITSMIST.v1.settings.get("organizers.ErrorOrganizer.settings.captureError", true))
				{
					ErrorOrganizer.__initErrorListeners();
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let errors = settings["errors"];
			if (errors)
			{
				ErrorOrganizer._observers.subscribe(component.uniqueId, component.trigger.bind(component), {"component":component});
			}

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Filter target components to notify.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		target				Target component to check.
		 * @param	{Object}		e					Event object.
		 */
		static __filter(conditions, options, e)
		{

			let result = false;
			let targets = options["component"].settings.get("errors.targets");

			for (let i = 0; i < targets.length; i++)
			{
				if (e.error.name === targets[i] || targets[i] === "*")
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
		static __initErrorListeners()
		{

			window.addEventListener("unhandledrejection", (error) => {
				let e = {};

				//try
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
					e.name = ErrorOrganizer.__getErrorName(error);
					e.filename = "";
					e.funcname = "";
					e.lineno = "";
					e.colno = "";
					// e.stack = error.reason.stack;
					// e.object = error.reason;
				}
				/*
				catch(e)
				{
				}
				*/

				ErrorOrganizer.__handleException(e);

				return false;
				//return true;
			});

			window.addEventListener("error", (error, file, line, col) => {
				let e = {};

				e.type = "error";
				e.name = ErrorOrganizer.__getErrorName(error);
				e.message = error.message;
				e.file = error.filename;
				e.line = error.lineno;
				e.col = error.colno;
				if (error.error)
				{
					e.stack = error.error.stack;
					e.object = error.error;
				}

				ErrorOrganizer.__handleException(e);

				return false;
				//return true;
			});

		}

		// -------------------------------------------------------------------------

		/**
		* Get an error name for the given error object.
		*
		* @param	{Object}		error				Error object.
		*
		* @return  {String}			Error name.
		*/
		static __getErrorName(error)
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
		static __handleException(e)
		{

			return ErrorOrganizer._observers.notifyAsync("error", {"sender":ErrorOrganizer, "error": e});

		}

	}

	// =============================================================================

	// =============================================================================
	//	Element organizer class
	// =============================================================================

	class ElementOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let elements = settings["elements"];
			if (elements)
			{
				Object.keys(elements).forEach((eventName) => {
					component.addEventHandler(eventName, {"handler":ElementOrganizer.onDoOrganize, "options":{"attrs":elements[eventName]}});
				});
			}

		}

		// -----------------------------------------------------------------------------
		//	Event handlers
		// -----------------------------------------------------------------------------

		/**
		 * DoOrganize event handler.
		 *
		 * @param	{Object}		sender				Sender.
		 * @param	{Object}		e					Event info.
		 * @param	{Object}		ex					Extra event info.
		 */
		static onDoOrganize(sender, e, ex)
		{

			let component = ex.component;
			let settings = ex.options["attrs"];

			Object.keys(settings).forEach((elementName) => {
				ElementOrganizer.__initAttr(component, elementName, settings[elementName]);
			});

		}

		// -------------------------------------------------------------------------
		//  Private
		// -------------------------------------------------------------------------

		static __getTargetElements(component, elementName, elementInfo)
		{

			let elements;

			if (elementInfo["rootNode"])
			{
				if (elementInfo["rootNode"] === "this" || elementInfo["rootNode"] === component.tagName.toLowerCase())
				{
					elements = [component];
				}
				else
				{
					elements = component.querySelectorAll(elementInfo["rootNode"]);
				}
			}
			else if (elementName === "this" || elementName === component.tagName.toLowerCase())
			{
				elements = [component];
			}
			else
			{
				elements = component.querySelectorAll("#" + elementName);
			}

			return elements;

		}

		// -------------------------------------------------------------------------


		/**
		 * Init attributes.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		elementInfo			Element info.
		 */
		static __initAttr(component, elementName, elementInfo)
		{

			if (elementInfo)
			{
				let elements = ElementOrganizer.__getTargetElements(component, elementName, elementInfo);
				for (let i = 0; i < elements.length; i++)
				{
					Object.keys(elementInfo).forEach((key) => {
						switch (key)
						{
							case "build":
								let resourceName = elementInfo[key]["resourceName"];
								FormUtil.build(elements[i], component.resources[resourceName].items, elementInfo[key]);
								break;
							case "attribute":
								Object.keys(elementInfo[key]).forEach((attrName) => {
									elements[i].setAttribute(attrName, elementInfo[key][attrName]);
								});
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
						}
					});
				}
			}

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
	//	Resource organizer class
	// =============================================================================

	class ResourceOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 */
		static init(component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'resources', {
				get() { return this._resources; },
			});

			// Add methods
			component.addResource = function(resourceName, options) { return ResourceOrganizer._addResource(this, resourceName, options); };
			component.switchResource = function(resourceName) { return ResourceOrganizer._switchResource(this, resourceName); };

			// Init vars
			component._resources = {};

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let promises = [];

			switch (conditions)
			{
				case "beforeStart":
				case "afterSpecLoad":
					let resources = settings["resources"];
					if (resources)
					{
						Object.keys(resources).forEach((resourceName) => {
							// Add resource
							let apiResourceName = BITSMIST.v1.Util.safeGet(resources[resourceName], "handlerOptions.resourceName", resourceName);
							let resource = ResourceOrganizer._addResource(component, apiResourceName, resources[resourceName]);

							// Load data
							if (resource.options.get("autoLoad"))
							{
								let id = resource.options.get("autoLoadOptions.id");
								let paramters = resource.options.get("autoLoadOptions.parameters");

								promises.push(component._resources[resourceName].get(id, paramters));
							}
						});
					}
					break;
				case "doFetch":
					promises.push(ResourceOrganizer.doFetch(component, settings));
					break;
				case "doSubmit":
					promises.push(ResourceOrganizer.doSubmit(component, settings));
					break;
			}

			return Promise.all(promises);

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
	     * Add a resource.
	     *
	     * @param	{Component}		component			Component.
	     * @param	{string}		resourceName		Resource name.
	     * @param	{array}			options				Options.
	     */
		static _addResource(component, resourceName, options)
		{

			let resource;

			if (options["handlerClassName"])
			{
				resource = BITSMIST.v1.ClassUtil.createObject(options["handlerClassName"], component, resourceName, options["handlerOptions"]);
				component._resources[resourceName] = resource;
			}

			return resource;

		}

		// -------------------------------------------------------------------------

		/**
	     * Switch to another resource.
	     *
	     * @param	{string}		resourceName		Resource name.
	     */
		static _switchResource(resourceName)
		{

			this._defaultResource = this._resources[resourceName];

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Do fetch event handler.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{Object}		options					Options
		 */
		static doFetch(component, options)
		{

			let promises = [];
			let resources = ResourceOrganizer.__getTargetResources(component, options, "autoFetch");

			for (let i = 0; i < resources.length; i++)
			{
				let resourceName = resources[i];
				let id = BITSMIST.v1.Util.safeGet(options, "id", component._resources[resourceName].target["id"]);
				let parameters = BITSMIST.v1.Util.safeGet(options, "parameters", component._resources[resourceName].target["parameters"]);
				component._resources[resourceName].target["id"] = id;
				component._resources[resourceName].target["parameters"] = parameters;

				promises.push(component._resources[resourceName].get(id, parameters));
			}

			return Promise.all(promises).then(() => {
				let resourceName = component.settings.get("settings.resourceName");
				if (resourceName && component._resources[resourceName])
				{
					component.items = component._resources[resourceName].items;
					component.item = component._resources[resourceName].item;
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Do submit event handler.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{Object}		options					Options
		 */
		static doSubmit(component, options)
		{

			let promises = [];
			let submitItem = {};
			let resources = ResourceOrganizer.__getTargetResources(component, options, "autoSubmit");

			// Get target keys to submit
			let nodes = component.querySelectorAll("[bm-submit]");
			nodes = Array.prototype.slice.call(nodes, 0);
			nodes.forEach((elem) => {
				let key = elem.getAttribute("bm-bind");
				submitItem[key] = component.item[key];
			});

			for (let i = 0; i < resources.length; i++)
			{
				let resourceName = resources[i];
				let method = BITSMIST.v1.Util.safeGet(options, "method", component._resources[resourceName].target["method"] || "put"); // Default is "put"
				let id = BITSMIST.v1.Util.safeGet(options, "id", component._resources[resourceName].target["id"]);
				let parameters = BITSMIST.v1.Util.safeGet(options, "parameters", component._resources[resourceName].target["parameters"]);

				promises.push(component._resources[resourceName][method](id, submitItem, parameters));
			}

			return Promise.all(promises);

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Get target resource names.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{Object}		options					Options
		 * @param	{String}		target					Target event
	 	 *
		 * @return  {Array}			Array of target resource names.
		 */
		static __getTargetResources(component, options, target)
		{

			let resources = BITSMIST.v1.Util.safeGet(options, target, component.settings.get("settings." + target, []));

			if (Array.isArray(resources))
			;
			else if (typeof resources === "string")
			{
				resources = [component.settings.get("settings." + target)];
			}
			else if (resources === true)
			{
				if (component.settings.get("settings.resourceName"))
				{
					resources = [component.settings.get("settings.resourceName")];
				}
			}

			return resources;

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
	//	Validation organizer class
	// =============================================================================

	class ValidationOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 */
		static init(component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'validators', {
				get() { return this._validators; },
			});
			Object.defineProperty(component, 'validationResult', {
				get() { return this._validationResult; },
			});

			// Add methods
			component.addValidator = function(validatorName, options) { return ValidationOrganizer._addValidator(this, validatorName, options); };

			// Init vars
			component._validators = {};
			component._validationResult = {};

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			switch (conditions)
			{
			case "doCheckValidity":
			case "doReportValidity":
				let validationName = settings["validationName"];
	//			BITSMIST.v1.Util.warn(validationName, `ValidationOrganizer.organize(): Validator not specified. name=${component.name}`);

				if (validationName)
				{
					let item = BITSMIST.v1.Util.safeGet(settings, "item");
					let rules = component.settings.get("validations." + validationName + ".rules");
					let options = component.settings.get("validations." + validationName + ".handlerOptions");
					let method = (conditions === "doCheckValidity" ? "checkValidity" : "reportValidity" );

					BITSMIST.v1.Util.assert(component._validators[validationName], `ValidationOrganizer.organize(): Validator not found. name=${component.name}, validationName=${validationName}`);
					component._validators[validationName][method](item, rules, options);
				}
				break;
			default:
				let validations = settings["validations"];
				if (validations)
				{
					Object.keys(validations).forEach((validatorName) => {
						ValidationOrganizer._addValidator(component, validatorName, validations[validatorName]);
					});
				}
				break;
			}

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
	     * Add a validator.
	     *
	     * @param	{Component}		component			Component.
	     * @param	{string}		validatorName		Validator name.
	     * @param	{array}			options				Options.
	     */
		static _addValidator(component, validatorName, options)
		{

			let validator;

			if (options["handlerClassName"])
			{
				validator = BITSMIST.v1.ClassUtil.createObject(options["handlerClassName"], component, validatorName, options);
				component._validators[validatorName] = validator;
			}

			return validator;

		}

	}

	// =============================================================================

	// =============================================================================
	//	Databinding organizer class
	// =============================================================================

	class DatabindingOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static init(component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'binds', {
				get() { return this._binds; },
				set(newValue) {
					DatabindingOrganizer.update(this, newValue);
				},
			});

			// Add methods
			component.bindData = function(data) { return DatabindingOrganizer._bindData(this, data); };
			component.update = function(data) { return DatabindingOrganizer._update(this, data); };

			// Init vars
			component._binds = new BindableStore();

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			switch (conditions)
			{
				case "afterAppend":
					DatabindingOrganizer._bindData(component);
					break;
				case "afterFetch":
					let bindings = settings["bindings"];
					if (bindings)
					{

						DatabindingOrganizer.setResource(component, bindings);
					}
					break;
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Set resource to the component.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static setResource(component, settings)
		{

			let resourceName = settings["resourceName"];

			component._binds.replace(component.resources[resourceName].item);

		}

		// -------------------------------------------------------------------------

		/**
		 * Update bindings.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{HTMLElement}	rootNode			Root node.
		 */
		static update(component, data)
		{

			component._binds.items = data;

			// Bind data to elements
			DatabindingOrganizer._bindData(component);

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Bind data and elemnets.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{HTMLElement}	rootNode			Root node.
		 */
		static _bindData(component, rootNode)
		{

			rootNode = ( rootNode ? rootNode : component );

			let nodes = rootNode.querySelectorAll("[bm-bind]");
			nodes = Array.prototype.slice.call(nodes, 0);
			nodes.forEach(elem => {
				component._binds.bindTo(elem);
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
	//	Plugin organizer class
	// =============================================================================

	class PluginOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 */
		static init(component, settings)
		{

			// Init vars
			component._plugins = {};

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let plugins = settings["plugins"];
			if (plugins)
			{
				Object.keys(plugins).forEach((pluginName) => {
					PluginOrganizer._addPlugin(component, pluginName, plugins[pluginName]);
				});
			}

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Add a plugin to the component.
		 *
		 * @param	{String}		pluginName			Plugin name.
		 * @param	{Object}		options				Options for the plugin.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _addPlugin(component, pluginName, options)
		{

			console.debug(`PluginOrganizer._addPlugin(): Adding a plugin. name=${component.name}, pluginName=${pluginName}`);

			options = Object.assign({}, options);
			let className = ( "className" in options ? options["className"] : pluginName );
			let plugin = null;

			// CreatePlugin
			plugin = BITSMIST.v1.ClassUtil.createObject(className, component, options);
			component._plugins[pluginName] = plugin;

			return plugin;

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
	//	Key organizer class
	// =============================================================================

	class KeyOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 */
		static init(component, settings)
		{

			// Init vars
			component.__isComposing = false;

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let keys = settings["keys"];
			if (keys)
			{
				// Init keys
				let actions = KeyOrganizer.__getActions(keys);
				component.addEventListener("keydown", function(e){KeyOrganizer.onKeyDown.call(this, e, component);});
				component.addEventListener("keyup", function(e){KeyOrganizer.onKeyUp.call(this, e, component, keys, actions);});
				// component.addEventListener("compositionstart", function(e){KeyOrganizer.onCompositionStart.call(this, e, component, keys);});
				// component.addEventListener("compositionend", function(e){KeyOrganizer.onCompositionEnd.call(this, e, component, keys);});

				// Init buttons
				Object.keys(keys).forEach((key) => {
					KeyOrganizer.__initButtons(component, key, keys[key]);
				});
			}

		}

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		/**
	 	 * Key down event handler. Check if it is in composing mode or not.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 */
		static onKeyDown(e, component)
		{

			component.__isComposing = ( e.keyCode === 229 ? true : false );

		}

		// -------------------------------------------------------------------------

		/**
	 	 * Key up event handler.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 * @param	{Object}		actions				Action info.
		 */
		static onKeyUp(e, component, options, actions)
		{

			// Ignore all key input when composing.
			if (component.__isComposing)
			{
				return;
			}

			let key  = ( e.key ? e.key : KeyOrganizer.__getKeyfromKeyCode(e.keyCode) );
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
				actions[key]["handler"].call(this, e, component, actions[key]["option"]);
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Composition start event handler.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		/*
		static onCompositionStart(e, component, options)
		{

			component.__isComposing = true;

		}
		*/

		// -------------------------------------------------------------------------

		/**
		 * Composition end event handler.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		/*
		static onCompositionEnd(e, component, options)
		{

			component.__isComposing = false;

		}
		*/

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Default submit.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static _defaultSubmit(e, component, options)
		{

			component.submit().then(() => {
				if (!component.cancelSubmit)
				{
					// Modal result
					if (component._isModal)
					{
						component.modalResult["result"] = true;
					}

					// Auto close
					if (options && options["autoClose"])
					{
						component.close();
					}
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Default cancel.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static _defaultCancel(e, component, options)
		{

			component.close();

		}

		// -------------------------------------------------------------------------

		/**
		 * Default clear.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static _defaultClear(e, component, options)
		{

			let target;

			if (this.hasAttribute("bm-cleartarget"))
			{
				target = this.getAttribute("bm-cleartarget");
			}

			component.clear(target);

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
	 	 * Convert key name from key code.
		 *
		 * @param	{Integer}		code				Key code.
		 */
		static __getKeyfromKeyCode(code)
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
		 * @param	{Component}		component			Component.
		 * @param	{String}		action				Action.
		 * @param	{Object}		options				Options.
		 */
		static __initButtons(component, action, options)
		{

			if (options && options["rootNode"])
			{
				let handler = ( options["handler"] ? options["handler"] : KeyOrganizer.__getDefaultHandler(action) );
				let elements = component.querySelectorAll(options["rootNode"]);
				elements = Array.prototype.slice.call(elements, 0);

				elements.forEach((element) => {
					element.addEventListener("click", function(e){handler.call(this, e, component, options);});
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
		static __getActions(settings)
		{

			let actions = {};

			Object.keys(settings).forEach((key) => {
				let keys = ( Array.isArray(settings[key]["key"]) ? settings[key]["key"] : [settings[key]["key"]]);

				for (let i = 0; i < keys.length; i++)
				{
					actions[keys[i]] = {};
					actions[keys[i]]["type"] = key;
					actions[keys[i]]["handler"] = ( settings[key]["handler"] ? settings[key]["handler"] : KeyOrganizer.__getDefaultHandler(key) );
					actions[keys[i]]["option"] = settings[key];
				}
			});

			return actions;

		}

		// -------------------------------------------------------------------------

		/**
		 * Return a default handler for the action.
		 *
		 * @param	{String}		action				Action.
		 *
		 * @return 	{Function}		Handler.
		 */
		static __getDefaultHandler(action)
		{

			let handler;

			switch (action)
			{
			case "submit":
				handler = KeyOrganizer._defaultSubmit;
				break;
			case "clear":
				handler = KeyOrganizer._defaultClear;
				break;
			case "cancel":
				handler = KeyOrganizer._defaultCancel;
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
	//	Chain organizer class
	// =============================================================================

	class ChainOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let chains = settings["chains"];
			if (chains)
			{
				Object.keys(chains).forEach((eventName) => {
					component.addEventHandler(eventName, {"handler":ChainOrganizer.onDoOrganize, "options":chains[eventName]});
				});
			}

		}

		// -----------------------------------------------------------------------------

		static unorganize(conditions, component, settings)
		{

			let chains = settings["chains"];
			if (chains)
			{
				Object.keys(chains).forEach((eventName) => {
					component.removeEventHandler(eventName, {"handler":ChainOrganizer.onDoOrganize, "options":chains[eventName]});
				});
			}

		}

		// -----------------------------------------------------------------------------
		//	Event handlers
		// -----------------------------------------------------------------------------

		/**
		 * DoOrganize event handler.
		 *
		 * @param	{Object}		sender				Sender.
		 * @param	{Object}		e					Event info.
		 * @param	{Object}		ex					Extra event info.
		 */
		static onDoOrganize(sender, e, ex)
		{

			let component = ex.component;
			let targets = ex.options;
			let promises = [];
			let chain = Promise.resolve();

			for (let i = 0; i < targets.length; i++)
			{
				let method = targets[i]["method"] || "refresh";
				let state = targets[i]["state"] || "ready";
				let sync = targets[i]["sync"];

				let nodes = document.querySelectorAll(targets[i]["rootNode"]);
				nodes = Array.prototype.slice.call(nodes, 0);
				BITSMIST.v1.Util.assert(nodes.length > 0, `ChainOrganizer.onDoOrganizer(): Node not found. name=${component.name}, eventName=${e.type}, rootNode=${targets[i]["rootNode"]}, method=${method}`);

				if (sync)
				{
					chain = chain.then(() => {
						return ChainOrganizer.__execTarget(component, nodes, method, state);
					});
				}
				else
				{
					chain = ChainOrganizer.__execTarget(component, nodes, method, state);
				}
				promises.push(chain);
			}

			return chain.then(() => {
				return Promise.all(promises);
			});

		}

		// -----------------------------------------------------------------------------
		//	Privates
		// -----------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Array}			nodes				Nodes.
		 * @param	{String}		string				Method name to exec.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static __execTarget(component, nodes, method, state)
		{

			let promises = [];

			nodes.forEach((element) => {
				let promise = component.waitFor([{"object":element, "state":state}]).then(() => {
					return element[method]({"sender":component});
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
	//	Dialog organizer class
	// =============================================================================

	class DialogOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static init(component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'modalResult', {
				get() { return this._modalResult; },
			});
			Object.defineProperty(component, 'isModal', {
				get() { return this._isModal; },
			});

			// Add methods
			component.open = function(options) { return DialogOrganizer._open(this, options); };
			component.openModal = function(options) { return DialogOrganizer._openModal(this, options); };
			component.close = function(options) { return DialogOrganizer._close(this, options); };

			// Init vars
			component._isModal = false;
			component._modalResult;
			component._modalPromise;

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			settings["dialog"];

			switch (conditions)
			{
				case "beforeStart":
			//		if (dialog["overrideSettings"])
					{
						component.settings.set("settings.autoRefresh", false);
						component.settings.set("settings.autoRefreshOnOpen", true);
						component.settings.set("settings.autoSetup", false);
						component.settings.set("settings.autoSetupOnOpen", true);
					}
					break;
				case "afterStart":
					if (component.settings.get("settings.autoOpen"))
					{
						component.open();
					}
					break;
			}

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Open component.
		 *
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _open(component, options)
		{

			options = Object.assign({}, options);

			return Promise.resolve().then(() => {
				console.debug(`Opening component. name=${component.name}, id=${component.id}`);
				return component.trigger("beforeOpen", options);
			}).then(() => {
				// Setup
				if (BITSMIST.v1.Util.safeGet(options, "autoSetupOnOpen", component.settings.get("settings.autoSetupOnOpen")))
				{
					return component.setup(options);
				}
			}).then(() => {
				// Refresh
				if (BITSMIST.v1.Util.safeGet(options, "autoRefreshOnOpen", component.settings.get("settings.autoRefreshOnOpen")))
				{
					return component.refresh(options);
				}
			}).then(() => {
				return component.trigger("doOpen", options);
			}).then(() => {
				// Auto focus
				let autoFocus = component.settings.get("settings.autoFocus");
				if (autoFocus)
				{
					let target = ( autoFocus === true ? component : component.querySelector(autoFocus) );
					if (target)
					{
						target.focus();
					}
				}
			}).then(() => {
				return component.trigger("afterOpen", options);
			}).then(() => {
				console.debug(`Opened component. name=${component.name}, id=${component.id}`);
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Open component modally.
		 *
		 * @param	{array}			options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _openModal(component, options)
		{

			console.debug(`Opening component modally. name=${component.name}, id=${component.id}`);

			return new Promise((resolve, reject) => {
				component._isModal = true;
				component._modalResult = {"result":false};
				component._modalPromise = { "resolve": resolve, "reject": reject };
				DialogOrganizer._open(component, options);
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Close component.
		 *
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _close(component, options)
		{

			options = Object.assign({}, options);

			return Promise.resolve().then(() => {
				console.debug(`Closing component. name=${component.name}, id=${component.id}`);
				return component.trigger("beforeClose", options);
			}).then(() => {
				return component.trigger("doClose", options);
			}).then(() => {
				return component.trigger("afterClose", options);
			}).then(() => {
				if (component._isModal)
				{
					component._modalPromise.resolve(component._modalResult);
				}
			}).then(() => {
				console.debug(`Closed component. name=${component.name}, id=${component.id}`);
			});

		}

	}

	// =============================================================================

	// =============================================================================
	//	Preference organizer class
	// =============================================================================

	class PreferenceOrganizer extends BITSMIST.v1.Organizer
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Global init.
		 */
		static globalInit()
		{

			// Init vars
			PreferenceOrganizer._defaults = new BITSMIST.v1.ChainableStore();
			PreferenceOrganizer._store = new ObservableStore({"chain":PreferenceOrganizer._defaults, "filter":PreferenceOrganizer._filter, "async":true});
			PreferenceOrganizer.__loaded =  {};
			PreferenceOrganizer.__loaded["promise"] = new Promise((resolve, reject) => {
				PreferenceOrganizer.__loaded["resolve"] = resolve;
				PreferenceOrganizer.__loaded["reject"] = reject;
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 */
		static init(component, settings)
		{

			// Register a component as an observer
			PreferenceOrganizer._store.subscribe(component.name + "_" + component.uniqueId, PreferenceOrganizer._triggerEvent.bind(component), {"targets":BITSMIST.v1.Util.safeGet(settings, "preferences.targets")});

		}

		// -------------------------------------------------------------------------

		/**
		 * Organize.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static organize(conditions, component, settings)
		{

			let chain = Promise.resolve();

			// Set default preferences
			if (BITSMIST.v1.Util.safeGet(settings, "preferences.defaults"))
			{
				PreferenceOrganizer._defaults.items = component.settings.get("preferences.defaults");
			}

			// Load preferences
			if (BITSMIST.v1.Util.safeGet(settings, "preferences.settings.load"))
			{
				chain = component.resources["preferences"].get().then((preferences) => {
					PreferenceOrganizer._store.merge(preferences);
					PreferenceOrganizer.__loaded.resolve();
				});
			}

			// Wait for preference to be loaded
			let timer;
			return chain.then(() => {
				let timeout = component.settings.get("system.preferenceTimeout", 10000);
				timer = setTimeout(() => {
					throw new ReferenceError(`Time out waiting for loading preferences. name=${component.name}`);
				}, timeout);
				return PreferenceOrganizer.__loaded.promise;
			}).then(() => {
				clearTimeout(timer);
			});

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
	 	 * Trigger preference changed events.
		 *
		 * @param	{Object}		item				Changed items.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _triggerEvent(item)
		{

			let eventName = this.settings.get("preferences.settings.eventName", "doSetup");

			return this.trigger(eventName, {"sender":PreferenceOrganizer, "item":item});

		}

		// -------------------------------------------------------------------------

		/**
		 * Check if it is a target.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Object}		options				Options.
		 */
		static _filter(conditions, options)
		{

			let result = false;
			let target = options["targets"];

			if (target === "*")
			{
				result = true;
			}
			else
			{
				target = ( Array.isArray(target) ? target : [target] );

				for (let i = 0; i < target.length; i++)
				{
					if (conditions[target[i]])
					{
						result = true;
						break;
					}
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
	//	Plugin base class
	// =============================================================================

	class Plugin
	{

		// -------------------------------------------------------------------------
		//  Constructor
		// -------------------------------------------------------------------------

		/**
	     * Constructor.
	     *
		 * @param	{Object}		component			Component to attach.
		 * @param	{Object}		options				Options.
	     */
		constructor(component, options)
		{

			this._component = component;
			this._options = new BITSMIST.v1.Store({"items":Object.assign({}, options)});
			this._options.merge(this._getOptions());
			this._options.set("name", this._options.get("name", this.constructor.name));

			// Add event handlers
			let events = this._options.get("events", {});
			Object.keys(events).forEach((eventName) => {
				component.addEventHandler(eventName, events[eventName], null, this);
			});

			// Expose plugin
			if (this._options.get("expose"))
			{
				let plugin = this;
				Object.defineProperty(component.__proto__, this._options.get("expose"), {
					get()
					{
						return plugin;
					}
				});
			}

		}

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		/**
		* Component name.
		*
		* @type	{String}
		*/
		get name()
		{

			return this._options.get("name");

		}

		// -------------------------------------------------------------------------

		/**
		* Component.
		*
		* @type	{String}
		*/
		get component()
		{

			return this._component;

		}

		set component(value)
		{

			this._component = value;

		}

		// -----------------------------------------------------------------------------
		//  Protected
		// -----------------------------------------------------------------------------

		/**
		 * Get plugin options.  Need to override.
		 *
		 * @return  {Object}		Options.
		 */
		_getOptions()
		{

			return {};

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
		constructor(component, resourceName, options)
		{

			this._resourceName = resourceName;
			this._component = component;
			this._options = new BITSMIST.v1.Store({"items":Object.assign({}, options)});
			this._data;
			this._name = "ResourceHandler";
			this._items = [];
			this._item = {};
			this._target = {};
			this._currentIndex = 0;

		}

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		/**
		 * Resource handler name.
		 *
		 * @type	{String}
		 */
		get name()
		{

			return this._name;

		}

		set name(value)
		{

			this._name = value;

		}

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
			this._items = this.__reshapeItems(value);
			this._item = ( Array.isArray(this._items) ? this._items[this._currentIndex] : this._items );

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
		 * Item.
		 *
		 * @type	{Object}
		 */
		get item()
		{

			return this._item;

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
		 * Get data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		get(id, parameters)
		{

			return Promise.resolve().then(() => {
				return this._get(id, parameters);
			}).then((data) => {
	//			BITSMIST.v1.Util.warn(data, `ResourceHandler.get(): No data returned. name=${this._component.name}, handlerName=${this._name}, resourceName=${this._resourceName}`);

				if (data)
				{
					this.data = data;
				}

				return this._data;
			});

		}

	    // -------------------------------------------------------------------------

		/**
		 * Delete data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		delete(id, parameters)
		{

			return Promise.resolve().then(() => {
				return this._delete(id, parameters);
			});

		}

	    // -------------------------------------------------------------------------

		/**
		 * Insert data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		data				Data to insert.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		post(id, data, parameters)
		{

			data = this.__reshapeData(data);

			return Promise.resolve().then(() => {
				return this._post(id, data, parameters);
			});

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
		put(id, data, parameters)
		{

			data = this.__reshapeData(data);

			return Promise.resolve().then(() => {
				return this._put(id, data, parameters);
			});

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
		 * Get data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_get(id, parameters)
		{
		}

	    // -------------------------------------------------------------------------

		/**
		 * Delete data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_delete(id, parameters)
		{
		}

	    // -------------------------------------------------------------------------

		/**
		 * Insert data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		data				Data to insert.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_post(id, data, parameters)
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
		_put(id, data, parameters)
		{
		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Get and reshape items from raw data on get.
		 *
		 * @param	{Object}		data				Raw data from which items are retrieved.
		 *
		 * @return  {Object}		Reshaped items.
		 */
		__reshapeItems(data)
		{

			// Get items
			let itemsField = this._options.get("fieldOptions.items");
			let items = ( itemsField ? BITSMIST.v1.Util.safeGet(data, itemsField) : data );

			// Reshape
			if (this._options.get("reshapeOptions.get.reshape"))
			{
				let reshaper = this._options.get("reshapeOptions.get.reshaper", this.__reshaper_get.bind(this));
				items = reshaper(items);
			}

			return items;

		}

		// -------------------------------------------------------------------------

		/**
		 * Reshape request data on post/put.
		 *
		 * @param	{Object}		data				Data to reshape.
		 *
		 * @return  {Object}		Reshaped data.
		 */
		__reshapeData(data)
		{

			if (this._options.get("reshapeOptions.put.reshape"))
			{
				let reshaper = this._options.get("reshapeOptions.put.reshaper", () => { return data; });
				data = reshaper(data);
			}

			return data;

		}

		// -------------------------------------------------------------------------

		/**
	     * Reshape items on get.
	     *
	     * @param	{Object}		target				Target to reshape.
		 *
		 * @return  {Object}		Master object.
	     */
		__reshaper_get(target)
		{

			let idField = this._options.get("fieldOptions.id");

			let items = target.reduce((result, current) => {
				let id = current[idField];
				result[id] = current;

				return result;
			}, {});

			return items;

		}

	}

	// =============================================================================

	// =============================================================================
	//	Cookie resource handler class
	// =============================================================================

	class CookieResourceHandler extends ResourceHandler
	{

		// -------------------------------------------------------------------------
		//  Constructor
		// -------------------------------------------------------------------------

		/**
	     * Constructor.
	     *
		 * @param	{Object}		component			Component.
	     * @param	{String}		resourceName		Resource name.
	     * @param	{Object}		options				Options.
	     */
		constructor(component, resourceName, options)
		{

			let defaults = {"autoLoad":true};
			super(component, resourceName, Object.assign(defaults, options));

			this._name = "CookieResourceHandler";
			this._cookieName = BITSMIST.v1.Util.safeGet(options, "cookieOptions.name", "preferences");

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Get data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_get(id, parameters)
		{

			return this.__getCookie(this._cookieName);

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
		_put(id, data, parameters)
		{

			this.__setCookie(this._cookieName, data);

		}

		// -----------------------------------------------------------------------------
		//  Privates
		// -----------------------------------------------------------------------------

		/**
		* Get cookie.
		*
		* @param	{String}		key					Key.
		*/
		__getCookie(key)
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
		__setCookie(key, value)
		{

			let cookie = key + "=" + encodeURIComponent(JSON.stringify(value)) + "; ";
			let options = this._options.get("cookieOptions");

			cookie += Object.keys(options).reduce((result, current) => {
				result += current + "=" + options[current] + "; ";

				return result;
			}, "");

			document.cookie = cookie;

		}

	}

	// =============================================================================

	// =============================================================================
	//	API Resource Handler class
	// =============================================================================

	class ApiResourceHandler extends ResourceHandler
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
		constructor(component, resourceName, options)
		{

			super(component, resourceName, options);

			this._name = "ApiResourceHandler";

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Get data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_get(id, parameters)
		{

			let method = "GET";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options}).then((xhr) => {
				return this._convertResponseData(xhr.responseText, dataType);
			});

		}

	    // -------------------------------------------------------------------------

		/**
		 * Delete data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_delete(id, parameters)
		{

			let method = "DELETE";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			urlOptions["dataType"];

			let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options});

		}

	    // -------------------------------------------------------------------------

		/**
		 * Insert data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		data				Data to insert.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_post(id, data, parameters)
		{

			let method = "POST";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

		}

	    // -------------------------------------------------------------------------

		/**
		 * Update data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		data				Data to insert.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_put(id, data, parameters)
		{

			let method = "PUT";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

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

			let baseUrl = options["baseUrl"] || this._component.settings.get("system.apiBaseUrl", "");
			let scheme = options["scheme"] || "";
			let host = options["host"] || "";
			let dataType = options["dataType"] || "";
			let version = options["version"] || "";
			let format = options["format"] || "";
			let url = format.
						replace("@scheme@", scheme).
						replace("@host@", host).
						replace("@baseUrl@", baseUrl).
						replace("@resource@", resourceName).
						replace("@id@", id).
						replace("@dataType@", dataType).
						replace("@query@", this._buildUrlQuery(parameters)).
						replace("@version@", version);

			return url

		}

		// -------------------------------------------------------------------------

		/**
		 * Build query string from parameters object.
		 *
		 * @param	{Object}		paratemers			Query parameters.
		 *
		 * @return  {String}		Query string.
		 */
		_buildUrlQuery(parameters)
		{

			let query = "";

			if (parameters)
			{
				query = Object.keys(parameters).reduce((result, current) => {
					if (Array.isArray(parameters[current]))
					{
						result += encodeURIComponent(current) + "=" + encodeURIComponent(parameters[current].join()) + "&";
					}
					else if (parameters[current])
					{
						result += encodeURIComponent(current) + "=" + encodeURIComponent(parameters[current]) + "&";
					}

					return result;
				}, "");
			}

			return ( query ? "?" + query.slice(0, -1) : "");

		}

	}

	// =============================================================================

	// =============================================================================
	//	Object Resource Handler class
	// =============================================================================

	class ObjectResourceHandler extends ResourceHandler
	{

		// -------------------------------------------------------------------------
		//  Constructor
		// -------------------------------------------------------------------------

		/**
	     * Constructor.
	     *
		 * @param	{Object}		component			Component.
	     * @param	{String}		resourceName		Resource name.
	     * @param	{Object}		options				Options.
	     */
		constructor(component, resourceName, options)
		{

			let defaults = {"autoLoad":true};
			super(component, resourceName, Object.assign(defaults, options));

			this._name = "ObjectResourceHandler";
			if (options["items"])
			{
				this.data = options["items"];
			}

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Get data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_get(id, parameters)
		{

			return this._data;

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
		_put(id, data, parameters)
		{

			this.data = data;

		}

	}

	// =============================================================================

	// =============================================================================
	//	Linked Resource Handler class
	// =============================================================================

	class LinkedResourceHandler extends ResourceHandler
	{

		// -------------------------------------------------------------------------
		//  Constructor
		// -------------------------------------------------------------------------

		/**
	     * Constructor.
	     *
		 * @param	{Object}		component			Component.
	     * @param	{String}		resourceName		Resource name.
	     * @param	{Object}		options				Options.
	     */
		constructor(component, resourceName, options)
		{

			let defaults = {"autoLoad":true};

			super(component, resourceName, Object.assign(defaults, options));

			this._name = "LinkedResourceHandler";
			this._ref;

		}

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		/**
		 * Fetch target.
		 *
		 * @type	{Object}
		 */
		get target()
		{

			return this._ref.target;

		}

		// -------------------------------------------------------------------------

		/**
		 * Raw data.
		 *
		 * @type	{Object}
		 */
		get data()
		{

			return this._ref.data;

		}

		set data(value)
		{

			this._ref.data = value;

		}

		// -------------------------------------------------------------------------

		/**
		 * Items.
		 *
		 * @type	{Object}
		 */
		get items()
		{

			return this._ref.items;

		}

		// -------------------------------------------------------------------------

		/**
		 * Item.
		 *
		 * @type	{Object}
		 */
		get item()
		{

			return this._ref.item;

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Get data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		_get(id, parameters)
		{

			let handlerOptions = this._options.items;
			let rootNode = handlerOptions["rootNode"];
			let resourceName = handlerOptions["resourceName"];
			handlerOptions["state"];

			this._ref = document.querySelector(rootNode).resources[resourceName];

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

			return this._ref.getText(code);

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

			return this._ref.getItem(code);

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
		constructor(component, validatorName, options)
		{

			this._name = validatorName;
			this._component = component;
			this._options = new BITSMIST.v1.Store({"items":Object.assign({}, options)});

		}

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		/**
		 * Name.
		 *
		 * @type	{String}
		 */
		get name()
		{

			return this._name;

		}

		set name(value)
		{

			this._name = value;

		}

		// -------------------------------------------------------------------------

		/**
		 * Items.
		 *
		 * @type	{Object}
		 */
		/*
		get items()
		{

			return this._items;

		}
		*/

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
		 * Validate.
		 *
		 * @param	{String}		key					Key.
		 * @param	{*}				value				Value.
		 * @param	{Object}		rule				Validation rule.
		 * @param	{Object}		failed				Failed reports.
		 * @param	{Object}		extra				Extra reports.
		 *
	 	 * @return  {Object}		Invalid result.
		 */
		static createValidationResult(key, value, rule, failed, extras)
		{

			let result = {
				"key":			key,
				"value":		value,
				"message":		ValidationHandler._getFunctionValue(key, value, "message", rule),
				"fix":			ValidationHandler._getFunctionValue(key, value, "fix", rule),
				"failed":		failed,
				"extras":		extras,
			};

			return result;

		}

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
		static validate(values, rules, options)
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
						invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
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
						invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
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
						invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
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
						invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
					}
				}
			});

			return invalids;

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
		 * Get a value from a custom function or a value.
		 *
		 * @param	{String}		key					Item name.
		 * @param	{Object}		value				Value to validate.
		 * @param	{String}		target				Target name.
		 * @param	{Object}		rule				Validation rules.
		 */
		static _getFunctionValue(key, value, target, rule)
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

	// =============================================================================
	//	HTML5 Form validation Handler class
	// =============================================================================

	class HTML5FormValidationHandler extends ValidationHandler
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Validate.
		 *
		 * @param	{Object}		values				Values to validate.
		 * @param	{Object}		rules				Validation rules.
		 *
	 	 * @return  {Object}		Invalid results.
		 */
		static validate(form, rules)
		{

			let invalids = {};

			BITSMIST.v1.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
			BITSMIST.v1.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

			let elements = BITSMIST.v1.Util.scopedSelectorAll(form, "input:not([novalidate])");
			elements.forEach((element) => {
				let key = element.getAttribute("bm-bind");
				let value = FormUtil.getValue(element);
				let rule = ( rules && rules[key] ? rules[key] : null );

				let failed = HTML5FormValidationHandler._validateValue(element, key, value, rule);
				if (failed.length > 0)
				{
					invalids[key] = ValidationHandler.createValidationResult(key, value, rule, failed, {"element": element});
					invalids["message"] = invalids["message"] || element.validationMessage;
				}
			});

			return invalids;

		}

		/*
		static validate(form, rules)
		{

			let invalids = [];

			BITSMIST.v1.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
			BITSMIST.v1.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

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
		 * Check validity.
		 *
		 * @param	{Object}		values				Values to validate.
		 * @param	{Object}		rules				Validation rules.
		 * @param	{Object}		options				Validation options.
		 */
		checkValidity(values, rules, options)
		{

			let invalids1 = {};
			let invalids2;
			let form = this._component.querySelector("form");
			if (rules || options)
			{
				// Check allow/disallow list
				let values = FormUtil.getFields(form);
				invalids1 = ValidationHandler.validate(values, rules, options);
			}
			invalids2 = HTML5FormValidationHandler.validate(form, rules);
			let invalids = BITSMIST.v1.Util.deepMerge(invalids1, invalids2);

			this._component.validationResult["result"] = ( Object.keys(invalids).length > 0 ? false : true );
			this._component.validationResult["invalids"] = invalids;

		}

		// -------------------------------------------------------------------------

		/**
		 * Report validity.
		 *
		 * @param	{Object}		values				Values to validate.
		 * @param	{Object}		rules				Validation rules.
		 */
		reportValidity(values, rules)
		{

			let form = this._component.querySelector("form");

			BITSMIST.v1.Util.assert(form, `FormValidationHandler.reportValidity(): Form tag does not exist.`, TypeError);
			BITSMIST.v1.Util.assert(form.reportValidity, `FormValidationHandler.reportValidity(): Report validity not supported.`, TypeError);

			form.reportValidity();

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Validate a single value.
		 *
		 * @param	{HTMLElement}	element				HTML element to validaate.
		 * @param	{String}		key					Item name.
		 * @param	{Object}		value				Value to validate.
		 * @param	{Object}		rules				Validation rules.
		 *
	 	 * @return  {Object}		Failed results.
		 */
		static _validateValue(element, key, value, rules)
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

	// =============================================================================
	//	Object validation Handler class
	// =============================================================================

	class ObjectValidationHandler extends ValidationHandler
	{

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Validate.
		 *
		 * @param	{Object}		values				Values to validate.
		 * @param	{Object}		rules				Validation rules.
		 *
	 	 * @return  {Object}		Invalid results.
		 */
		static validate(values, rules)
		{

			let invalids = {};

			if (rules)
			{
				Object.keys(values).forEach((key) => {
					if (rules[key])
					{
						let failed = ObjectValidationHandler._validateValue(key, values[key], rules[key]);
						if (failed.length > 0)
						{
							invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
						}
					}
				});
			}

			return invalids;

		}

		// -------------------------------------------------------------------------

		/**
		 * Check validity.
		 *
		 * @param	{Object}		values				Values to validate.
		 * @param	{Object}		rules				Validation rules.
		 * @param	{Object}		options				Validation options.
		 */
		checkValidity(values, rules, options)
		{

			let invalids1 = ValidationHandler.validate(values, rules, options); // Check allow/disallow/required
			let invalids2 = ObjectValidationHandler.validate(values, rules);
			let invalids = BITSMIST.v1.Util.deepMerge(invalids1, invalids2);

			this._component.validationResult["result"] = ( Object.keys(invalids).length > 0 ? false : true );
			this._component.validationResult["invalids"] = invalids;

		}

		// -------------------------------------------------------------------------

		/**
		 * Report validity.
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
		 * Validate a single value.
		 *
		 * @param	{String}		key					Item name.
		 * @param	{Object}		value				Value to validate.
		 * @param	{Object}		rules				Validation rules.
		 *
	 	 * @return  {Object}		Failed results.
		 */
		static _validateValue(key, value, rules)
		{

			let failed = [];

			if (rules && rules["constraints"])
			{
				Object.keys(rules["constraints"]).forEach((constraintName) => {
					let result = ObjectValidationHandler._checkConstraint(key, value, constraintName, rules["constraints"][constraintName]);
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
		 * Check a single constraint.
		 *
		 * @param	{String}		key					Item name.
		 * @param	{Object}		value				Value to validate.
		 * @param	{String}		constraintName		Constraint name.
		 * @param	{Object}		rule				Validation rules.
		 *
	 	 * @return  {Object}		Failed result.
		 */
		static _checkConstraint(key, value, constraintName, rule)
		{

			let result;
			let len;
			let num;

			switch (constraintName)
			{
			case "type":
				result = ObjectValidationHandler._checkType(key, value, constraintName, rule);
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
		 * Check a single type constraint.
		 *
		 * @param	{String}		key					Item name.
		 * @param	{Object}		value				Value to validate.
		 * @param	{String}		constraintName		Constraint name.
		 * @param	{Object}		rule				Validation rules.
		 *
	 	 * @return  {Object}		Failed result.
		 */
		static _checkType(key, value, constraintName, rule)
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

	// =============================================================================
	//	Form class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function Form(settings)
	{

		return Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	}

	BITSMIST.v1.ClassUtil.inherit(Form, BITSMIST.v1.Component);

	// -----------------------------------------------------------------------------
	//  Setter/Getter
	// -----------------------------------------------------------------------------

	/**
	 * Data item.
	 *
	 * @type	{Object}
	 */
	Object.defineProperty(Form.prototype, 'item', {
		get()
		{
			return this._item;
		},
		set(value)
		{
			this._item = value;
		}
	});

	// -----------------------------------------------------------------------------

	/**
	 * Flag wheter to cancel submit.
	 *
	 * @type	{Object}
	 */
	Object.defineProperty(Form.prototype, 'cancelSubmit', {
		get()
		{
			return this._cancelSubmit;
		},
		set(value)
		{
			this._cancelSubmit = value;
		}
	});

	// -----------------------------------------------------------------------------
	//  Methods
	// -----------------------------------------------------------------------------

	/**
	 * Start component.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	Form.prototype.start = function(settings)
	{

		// Init vars
		this._item = {};
		this._cancelSubmit = false;

		// Init component settings
		settings = Object.assign({}, settings, {
			"settings": {
				"autoClear":				true,
			},
			"organizers": {
				"ValidationOrganizer":		{"settings":{"attach":true}},
			}
		});

		// super()
		return BITSMIST.v1.Component.prototype.start.call(this, settings);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Change a template html.
	 *
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Form.prototype.switchTemplate = function(templateName, options)
	{

		return BITSMIST.v1.Component.prototype.switchTemplate.call(this, templateName, options).then(() => {
			FormUtil.hideConditionalElements(this);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Build a element.
	 *
	 * @param	{HTMLElement}	element				HTMLElement to build.
	 * @param	{Object}		items				Items to fill elements.
	 * @param	{Object}		options				Options.
	 */
	Form.prototype.build = function(element, items, options)
	{

		FormUtil.build(element, items, options);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Clear the form.
	 *
	 * @param	{String}		target				Target selector.
	 */
	Form.prototype.clear = function(target)
	{

		return FormUtil.clearFields(this, target);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Fill the form.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Form.prototype.fill = function(options)
	{

		options = Object.assign({}, options);
		let rootNode = ( "rootNode" in options ? this.querySelector(options["rootNode"]) : this );

		// Clear fields
		let autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this.settings.get("settings.autoClear"));
		if (autoClear)
		{
			this.clear();
		}

		let item = ("item" in options ? options["item"] : this._item);

		return Promise.resolve().then(() => {
			FormUtil.showConditionalElements(this, item);
			return this.trigger("beforeFill", options);
		}).then(() => {
			FormUtil.setFields(rootNode, item, {"masters":this.resources, "triggerEvent":"change"});

			return this.trigger("afterFill", options);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Validate.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Form.prototype.validate = function(options)
	{

		options = Object.assign({}, options);
		this.validationResult["result"] = true;

		return Promise.resolve().then(() => {
			return this.trigger("beforeValidate");
		}).then(() => {
			return this.callOrganizers("doCheckValidity", {"item":this._item, "validationName":this.settings.get("settings.validationName")});
		}).then(() => {
			return this.trigger("doValidate");
		}).then(() => {
			return this.trigger("afterValidate");
		}).then(() => {
			if (!this.validationResult["result"])
			{
				this._cancelSubmit = true;

				return Promise.resolve().then(() => {
					return this.callOrganizers("doReportValidity", {"validationName":this.settings.get("settings.validationName")});
				}).then(() => {
					return this.trigger("doReportValidatidy");
				});
			}
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Submit the form.
	 *
	 * @return  {Promise}		Promise.
	 */
	Form.prototype.submit = function(options)
	{

		options = Object.assign({}, options);
		this._cancelSubmit = false;

		// Get values from the form
		this._item = FormUtil.getFields(this);

		return Promise.resolve().then(() => {
			return this.validate(options);
		}).then(() => {
			if (!this._cancelSubmit)
			{
				return Promise.resolve().then(() => {
					return this.trigger("beforeSubmit", {"item":this._item});
				}).then(() => {
					return this.callOrganizers("doSubmit", options);
				}).then(() => {
					return this.trigger("doSubmit", {"item":this._item});
				}).then(() => {
					return this.trigger("afterSubmit", {"item":this._item});
				});
			}
		});

	};

	// =============================================================================

	// =============================================================================
	//	List class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function List()
	{

		return Reflect.construct(BITSMIST.v1.Component, [], this.constructor);

	}

	BITSMIST.v1.ClassUtil.inherit(List, BITSMIST.v1.Component);

	// -----------------------------------------------------------------------------
	//  Setter/Getter
	// -----------------------------------------------------------------------------

	/**
	 * Row object.
	 *
	 * @type	{Object}
	 */
	Object.defineProperty(List.prototype, 'rows', {
		get()
		{
			return this._rows;
		},
	});

	// -----------------------------------------------------------------------------

	/**
	 * Data items.
	 *
	 * @type	{Object}
	 */
	Object.defineProperty(List.prototype, 'items', {
		get()
		{
			return this._items;
		},
		set(value)
		{
			this._items = value;
		}
	});

	// -----------------------------------------------------------------------------
	//  Methods
	// -----------------------------------------------------------------------------

	/**
	 * Start component.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	List.prototype.start = function(settings)
	{

		// Init vars
		this._items = [];
		this._activeRowTemplateName = "";
		this._listRootNode;
		this._rows;

		// Init component settings
		settings = Object.assign({}, settings, {
			"settings": {
				"autoClear": true,
			},
		});

		// super()
		return BITSMIST.v1.Component.prototype.start.call(this, settings);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Change template html.
	 *
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	List.prototype.switchTemplate = function(templateName, options)
	{

		return BITSMIST.v1.Component.prototype.switchTemplate.call(this, templateName, options).then(() => {
			FormUtil.hideConditionalElements(this);

			return this.switchRowTemplate(this.settings.get("settings.rowTemplateName"));
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Change a template html.
	 *
	 * @param	{String}		templateName		Template name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	List.prototype.switchRowTemplate = function(templateName, options)
	{

		options = Object.assign({}, options);

		if (this._activeRowTemplateName === templateName)
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(() => {
			console.debug(`List.switchRowTemplate(): Switching a row template. name=${this.name}, rowTemplateName=${templateName}, id=${this.id}`);
			return this.addTemplate(templateName);
		}).then(() => {
			this._activeRowTemplateName = templateName;
		}).then(() => {
			return this.callOrganizers("afterRowAppend", this.settings.items);
		}).then(() => {
			return this.trigger("afterRowAppend", options);
		}).then(() => {
			console.debug(`List.switchRowTemplate(): Switched a row template. name=${this.name}, rowTemplateName=${templateName}, id=${this.id}`);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Clear list.
	 */
	List.prototype.clear = function()
	{

		this._listRootNode.innerHTML = "";

	};

	// -----------------------------------------------------------------------------

	/**
	 * Fill list with data.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	List.prototype.fill = function(options)
	{

		console.debug(`List.fill(): Filling list. name=${this.name}`);

		options = Object.assign({}, options);

		let builder = this._getBuilder(options);
		let fragment = document.createDocumentFragment();
		this._rows = [];

		// Get list root node
		this._listRootNode = this.querySelector(this.settings.get("settings.listRootNode"));
		BITSMIST.v1.Util.assert(this._listRootNode, `List.fill(): List root node not found. name=${this.name}, listRootNode=${this.settings.get("settings.listRootNode")}`);

		return Promise.resolve().then(() => {
			let autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this.settings.get("settings.autoClear"));
			if (autoClear)
			{
				this.clear();
			}
			FormUtil.showConditionalElements(this, this.item);
			return this.trigger("beforeFill", options);
		}).then(() => {
			return builder.call(this, fragment, this._items);
		}).then(() => {
			this._listRootNode.appendChild(fragment);
		}).then(() => {
			return this.trigger("afterFill", options);
		}).then(() => {
			console.debug(`List.fill(): Filled list. name=${this.name}`);
		});

	};

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Fetch data.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Function}		List builder function.
	 */
	List.prototype._getBuilder = function(options)
	{

		let rowAsync = BITSMIST.v1.Util.safeGet(options, "async", this.settings.get("settings.async", true));
		let builder = ( rowAsync ? this._buildAsync : this._buildSync );

		return builder;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Build rows synchronously.
	 *
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 *
	 * @return  {Promise}		Promise.
	 */
	List.prototype._buildSync = function(fragment, items)
	{

		BITSMIST.v1.Util.assert(this._templates[this._activeRowTemplateName], `List._buildSync(): Row template not loaded yet. name=${this.name}, rowTemplateName=${this._activeRowTemplateName}`);

		let chain = Promise.resolve();
		let rowEvents = this.settings.get("rowevents");
		let template = this.templates[this._activeRowTemplateName].html;

		for (let i = 0; i < items.length; i++)
		{
			chain = chain.then(() => {
				return this._appendRowSync(fragment, i, items[i], template, rowEvents);
			});
		}

		return chain;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Build rows asynchronously.
	 *
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 */
	List.prototype._buildAsync = function(fragment, items)
	{

		BITSMIST.v1.Util.assert(this.templates[this._activeRowTemplateName], `List._buildAsync(): Row template not loaded yet. name=${this.name}, rowTemplateName=${this._activeRowTemplateName}`);

		let rowEvents = this.settings.get("rowevents");
		let template = this.templates[this._activeRowTemplateName].html;

		for (let i = 0; i < items.length; i++)
		{
			this._appendRowAsync(fragment, i, items[i], template, rowEvents);
		}

	};

	// -----------------------------------------------------------------------------
	//  Privates
	// -----------------------------------------------------------------------------

	/**
	 * Create a row element.
	 *
	 * @param	{String}		template				Template html.
	 *
	 * @return  {HTMLElement}	Row element.
	 */
	List.prototype._createRow = function(template)
	{

		let ele = document.createElement("div");
		ele.innerHTML = template;
		let element = ele.firstElementChild;
		element.setAttribute("bm-powered", "");

		return element;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Append a new row synchronously.
	 *
	 * @param	{HTMLElement}	rootNode				Root node to append a row.
	 * @param	{integer}		no						Line no.
	 * @param	{Object}		item					Row data.
	 * @param	{String}		template				Template html.
	 * @param	{Object}		rowEvents				Row's event info.
	 *
	 * @return  {Promise}		Promise.
	 */
	List.prototype._appendRowSync = function(rootNode, no, item, template, rowEvents)
	{

		this.triggerAsync("beforeBuildRow", {"item":item});

		let chain = Promise.resolve();
		chain = chain.then(() => {
			// Append a row
			let element = this._createRow(template);
			rootNode.appendChild(element);
			this._rows.push(element);

			// set row elements click event handler
			if (rowEvents)
			{
				Object.keys(rowEvents).forEach((elementName) => {
					this.initEvents(elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			return Promise.resolve().then(() => {
				return this.trigger("beforeFillRow", {"item":item, "no":no, "element":element});
			}).then(() => {
				// Fill fields
				FormUtil.showConditionalElements(element, item);
				FormUtil.setFields(element, item, {"masters":this.resources});
			}).then(() => {
				return this.trigger("afterFillRow", {"item":item, "no":no, "element":element});
			});
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Append a new row asynchronously.
	 *
	 * @param	{HTMLElement}	rootNode				Root node to append a row.
	 * @param	{integer}		no						Line no.
	 * @param	{Object}		item					Row data.
	 * @param	{String}		template				Template html.
	 * @param	{Object}		rowEvents				Row's event info.
	 */
	List.prototype._appendRowAsync = function(rootNode, no, item, template, rowEvents)
	{

		this.triggerAsync("beforeBuildRow", {"item":item});

		// Append a row
		let element = this._createRow(template);
		rootNode.appendChild(element);
		this._rows.push(element);

		// set row elements click event handler
		if (rowEvents)
		{
			Object.keys(rowEvents).forEach((elementName) => {
				this.initEvents(elementName, rowEvents[elementName], element);
			});
		}

		// Call event handlers
		this.triggerAsync("beforeFillRow", {"item":item, "no":no, "element":element});
		FormUtil.showConditionalElements(element, item);
		FormUtil.setFields(element, item, {"masters":this.resources});
		this.triggerAsync("afterFillRow", {"item":item, "no":no, "element":element});

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
	//	TagLoader class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function TagLoader()
	{

		// super()
		return Reflect.construct(HTMLElement, [], this.constructor);

	}

	BITSMIST.v1.ClassUtil.inherit(TagLoader, BITSMIST.v1.Component);

	// -----------------------------------------------------------------------------
	//  Methods
	// -----------------------------------------------------------------------------

	/**
	 * Start components.
	 *
	 * @param	{Object}		settings			Settings.
	 *
	 * @return  {Promise}		Promise.
	 */
	TagLoader.prototype.start = function(settings)
	{

		// Defaults
		let defaults = {
			"settings": {
				"name": "TagLoader",
			},
		};
		settings = ( settings ? BITSMIST.v1.Util.deepMerge(defaults, settings) : defaults );

		// super()
		return BITSMIST.v1.Component.prototype.start.call(this, settings).then(() => {
			if (document.readyState !== "loading")
			{
				BITSMIST.v1.LoaderOrganizer.load(document.body, this.settings);
			}
			else
			{
				document.addEventListener("DOMContentLoaded", () => {
					BITSMIST.v1.LoaderOrganizer.load(document.body, this.settings);
				});
			}
		});

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-tagloader", TagLoader);

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
	//	SettingManager class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function SettingManager()
	{

		// super()
		return Reflect.construct(HTMLElement, [], this.constructor);

	}

	BITSMIST.v1.ClassUtil.inherit(SettingManager, BITSMIST.v1.Component);

	// -----------------------------------------------------------------------------

	/**
	 * Get component settings.
	 *
	 * @return  {Object}		Options.
	 */
	SettingManager.prototype._getSettings = function()
	{

		return {
			"settings": {
				"name":					"SettingManager",
				"autoSetup":			false,
			}
		};

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-setting", SettingManager);

	// =============================================================================

	// =============================================================================
	//	Preference manager class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function PreferenceManager(settings)
	{

		return Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	}

	BITSMIST.v1.ClassUtil.inherit(PreferenceManager, BITSMIST.v1.Component);

	// -----------------------------------------------------------------------------

	/**
	 * Get component settings.
	 *
	 * @return  {Object}		Options.
	 */
	PreferenceManager.prototype._getSettings = function()
	{

		return {
			// Settings
			"settings": {
				"autoRefresh":				false,
				"autoSetup":				false,
				"hasTemplate":				false,
				"name":						"PreferenceManager",
			},

			// Organizers
			"organizers": {
				"ValidationOrganizer":		{"settings":{"attach":true}},
			}
		}

	};

	// -----------------------------------------------------------------------------
	//  Setter/Getter
	// -----------------------------------------------------------------------------

	/**
	 * Preference items.
	 *
	 * @type	{Object}
	 */
	Object.defineProperty(PreferenceManager.prototype, "items", {
		get()
		{
			return PreferenceOrganizer._store.items;
		},
	});

	// -----------------------------------------------------------------------------

	/**
	 * Get a value from store. Return default value when specified key is not available.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	PreferenceManager.prototype.get = function(key, defaultValue)
	{

		return PreferenceOrganizer._store.get(key, defaultValue);

	};

	// -------------------------------------------------------------------------

	/**
	 * Set a value to the store.
	 *
	 * @param	{Object}		values				Values to store.
	 * @param	{Object}		options				Options.
	 */
	PreferenceManager.prototype.set = function(values, options)
	{

		this._validationResult["result"] = true;

		Promise.resolve().then(() => {
			// Validate
			return this.callOrganizers("doCheckValidity", {"item":values, "validationName":this._settings.get("settings.validationName")});
		}).then(() => {
			return this.trigger("doValidate");
		}).then(() => {
			// Validation failed?
			if (!this._validationResult["result"])
			{
				throw new Error(`PreferenceManager.set(): Validation failed. values=${JSON.stringify(values)}, invalids=${JSON.stringify(this._validationResult["invalids"])}`);
			}

			// Store
			PreferenceOrganizer._store.set("", values, options);

			// Save preferences
			if (BITSMIST.v1.Util.safeGet(options, "autoSave", this.settings.get("preferences.settings.autoSave")))
			{
				return this.resources["preferences"].put("", PreferenceOrganizer._store.localItems);
			}
		});

	};

	// -------------------------------------------------------------------------

	customElements.define("bm-preference", PreferenceManager);

	window.BITSMIST = window.BITSMIST || {};
	window.BITSMIST.v1 = window.BITSMIST.v1 || {};
	window.BITSMIST.v1.ObservableStore = ObservableStore;
	window.BITSMIST.v1.BindableStore = BindableStore;
	BITSMIST.v1.OrganizerOrganizer.register("FileOrganizer", {"object":FileOrganizer, "targetWords":"files", "targetEvents":["beforeStart", "afterSpecLoad"], "order":110});
	BITSMIST.v1.OrganizerOrganizer.register("ErrorOrganizer", {"object":ErrorOrganizer, "targetWords":"errors", "targetEvents":["beforeStart", "afterSpecLoad"], "order":120});
	BITSMIST.v1.OrganizerOrganizer.register("ElementOrganizer", {"object":ElementOrganizer, "targetWords":"elements", "targetEvents":["beforeStart"], "order":220});
	BITSMIST.v1.OrganizerOrganizer.register("ResourceOrganizer", {"object":ResourceOrganizer, "targetWords":"resources", "targetEvents":["beforeStart", "afterSpecLoad", "doFetch", "doSubmit"], "order":300});
	BITSMIST.v1.OrganizerOrganizer.register("ValidationOrganizer", {"object":ValidationOrganizer, "targetWords":"validations", "targetEvents":["beforeStart", "afterSpecLoad", "doCheckValidity", "doReportValidity"], "order":310});
	BITSMIST.v1.OrganizerOrganizer.register("DatabindingOrganizer", {"object":DatabindingOrganizer, "targetWords":"data", "targetEvents":["afterAppend"], "order":320});
	BITSMIST.v1.OrganizerOrganizer.register("PluginOrganizer", {"object":PluginOrganizer, "targetWords":"plugins", "targetEvents":["beforeStart", "afterSpecLoad"], "order":800});
	BITSMIST.v1.OrganizerOrganizer.register("KeyOrganizer", {"object":KeyOrganizer, "targetWords":"keys", "targetEvents":["afterAppend"], "order":800});
	BITSMIST.v1.OrganizerOrganizer.register("ChainOrganizer", {"object":ChainOrganizer, "targetWords":"chains", "targetEvents":["beforeStart", "afterSpecLoad"], "order":800});
	BITSMIST.v1.OrganizerOrganizer.register("DialogOrganizer", {"object":DialogOrganizer, "targetWords":"dialog", "targetEvents":["beforeStart", "afterStart"], "order":800});
	BITSMIST.v1.OrganizerOrganizer.register("PreferenceOrganizer", {"object":PreferenceOrganizer, "targetWords":"preferences", "targetEvents":["beforeStart", "afterSpecLoad"], "order":900});
	window.BITSMIST.v1.Plugin = Plugin;
	window.BITSMIST.v1.CookieResourceHandler = CookieResourceHandler;
	window.BITSMIST.v1.ApiResourceHandler = ApiResourceHandler;
	window.BITSMIST.v1.ObjectResourceHandler = ObjectResourceHandler;
	window.BITSMIST.v1.LinkedResourceHandler = LinkedResourceHandler;
	window.BITSMIST.v1.ValidationHandler = ValidationHandler;
	window.BITSMIST.v1.HTML5FormValidationHandler = HTML5FormValidationHandler;
	window.BITSMIST.v1.ObjectValidationHandler = ObjectValidationHandler;
	window.BITSMIST.v1.FormatterUtil = FormatterUtil;
	window.BITSMIST.v1.Form = Form;
	window.BITSMIST.v1.List = List;

})();
//# sourceMappingURL=bitsmist-js-extras_v1.js.map
