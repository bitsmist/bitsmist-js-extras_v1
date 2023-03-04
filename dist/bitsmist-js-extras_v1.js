(function () {
	'use strict';

	if (!window.BITSMIST || !window.BITSMIST.v1 || !window.BITSMIST.v1.Component)
	{
		throw new ReferenceError("Bitsmist Core Library does not exist.");
	}

	var BM = window.BITSMIST.v1;

	// =============================================================================

	// =============================================================================
	//	Observable store class
	// =============================================================================

	class ObservableStore extends BM.ChainableStore
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

			this.filter = BM.Util.safeGet(this._options, "filter", () => { return true; } );

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

			BM.Util.assert(typeof value === "function", `Store.filter(setter): Filter is not a function. filter=${value}`, TypeError);

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
		set(key, value, options, ...args)
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
					BM.Util.safeSet(this._items, key, value);
					changedItem[key] = value;
				}
			}

			let notify = BM.Util.safeGet(options, "notifyOnChange", BM.Util.safeGet(this._options, "notifyOnChange"));
			if (notify && Object.keys(changedItem).length > 0)
			{
				return this.notify(changedItem, ...args);
			}

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
	        this.__deepMerge(this._items, value);

	        let notify = BM.Util.safeGet(options, "notifyOnChange", BM.Util.safeGet(this._options, "notifyOnChange"));
	        if (notify)
	        {
	            return this.notify("*", ...args);
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

			BM.Util.assert(typeof handler === "function", `ObservableStore.subscribe(): Notification handler is not a function. id=${id}`, TypeError);

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

			if (BM.Util.safeGet(this._options, "async", false))
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
				if (this._filter(conditions, this._observers[i], ...args))
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

			BM.Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", "ObservableStore.__deepMerge(): Parameters must be an object.", TypeError);

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
		let elements = BM.Util.scopedSelectorAll(rootNode, "[bm-visible]");

		// Show elements
		elements.forEach((element) => {
			let condition = element.getAttribute("bm-visible");
			if (BM.Util.safeEval(condition, item, item))
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
		let elements = BM.Util.scopedSelectorAll(rootNode, "[bm-visible]");

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

		let masters = BM.Util.safeGet(options, "masters");
		let triggerEvent = BM.Util.safeGet(options, "triggerEvent");

		// Get elements with bm-bind attribute
		let elements = BM.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		elements.push(rootNode);

		elements.forEach((element) => {
			let fieldName = element.getAttribute("bm-bind");
			if (fieldName in item)
			{
				let value = BM.Util.safeGet(item, fieldName, "");

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
		let elements = BM.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		elements.push(rootNode);

		elements.forEach((element) => {
			// Get a value from the element
			let key = element.getAttribute("bm-bind");
			let value = FormUtil.getValue(element);

			// Deformat
			if (element.hasAttribute("bm-format"))
			{
				value = BM.FormatterUtil.deformat("", element.getAttribute("bm-format"), value);
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
		let elements = BM.Util.scopedSelectorAll(rootNode, target + " input");

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
			if (!bound && BM.Util.safeGet(this._options, "2way", true))
			{
				// Change element's value when store value changed
				this.subscribe(key, () => {
					FormUtil.setValue(elem, this.get(key));
				});

				// Set store value when element's value changed
				let eventName = BM.Util.safeGet(this._options, "eventName", "change");
				elem.addEventListener(eventName, (() => {
					this.set(key, FormUtil.getValue(elem), {"notifyOnChange":false});
				}).bind(this));

				elem.__bm_bindinfo = { "bound": true };
			}

		}

	}

	// =============================================================================

	// =============================================================================
	//	File organizer class
	// =============================================================================

	class FileOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "FileOrganizer";

		}

		// -----------------------------------------------------------------------------
		//	Event handlers
		// -----------------------------------------------------------------------------

		static FileOrganizer_onDoOrganize(sender, e, ex)
		{

			let promises = [];

			this._enumSettings(e.detail.settings["files"], (sectionName, sectionValue) => {
				promises.push(BM.AjaxUtil.loadScript(sectionValue["href"]));
			});

			return Promise.all(promises);

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"files",
				"order":		110,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Add event handlers to component
			this._addOrganizerHandler(component, "doOrganize", FileOrganizer.FileOrganizer_onDoOrganize);

		}

	}

	// =============================================================================

	// =============================================================================
	//	Error organizer class
	// =============================================================================

	class ErrorOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "ErrorOrganizer";

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"errors",
				"order":		120,
			};

		}

		// -------------------------------------------------------------------------

		static globalInit()
		{

			ErrorOrganizer._observers = new BM.ObservableStore({"filter":ErrorOrganizer.__filter});

			// Install error listner
			document.addEventListener("DOMContentLoaded", () => {
				if (BM.settings.get("organizers.ErrorOrganizer.settings.captureError", true))
				{
					ErrorOrganizer.__initErrorListeners();
				}
			});

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			let errors = BM.Util.safeGet(options, "settings.errors");
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
	 	 * @param	{Object}		observerInfo		Observer info.
		 */
		static __filter(conditions, observerInfo, ...args)
		{

			let result = false;
			let targets = observerInfo["options"]["component"].settings.get("errors.targets");
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
		static __initErrorListeners()
		{

			window.addEventListener("unhandledrejection", (error) => {
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
					e.name = ErrorOrganizer.__getErrorName(error);
					e.filename = "";
					e.funcname = "";
					e.lineno = "";
					e.colno = "";
					// e.stack = error.reason.stack;
					// e.object = error.reason;
					//
					ErrorOrganizer.__handleException(e);
				}
				catch(e)
				{
					console.error("An error occurred in error handler", e);
				}

				return false;
				//return true;
			});

			window.addEventListener("error", (error, file, line, col) => {
				let e = {};

				try
				{
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
				}
				catch(e)
				{
					console.error("An error occurred in error handler", e);
				}

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

	class ElementOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "ElementOrganizer";

		}

		// -----------------------------------------------------------------------------
		//	Event handlers
		// -----------------------------------------------------------------------------

		static ElementOrganizer_onDoOrganize(sender, e, ex)
		{

			let order = ElementOrganizer.getInfo()["order"];

			this._enumSettings(e.detail.settings["elements"], (sectionName, sectionValue) => {
				this.addEventHandler(sectionName, {
					"handler":	ElementOrganizer.ElementOrganizer_onDoProcess,
					"order":	order,
					"options":	{"attrs":sectionValue}
				});
			});

		}

		// -----------------------------------------------------------------------------

		static ElementOrganizer_onDoProcess(sender, e, ex)
		{

			let settings = ex.options["attrs"];
			let promises = [];

			Object.keys(settings).forEach((elementName) => {
				promises = promises.concat(ElementOrganizer.__initElements(this, e, elementName, settings[elementName]));
			});

			return Promise.all(promises);

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"elements",
				"order":		220,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Init component vars
			component._overlay;
			component._overlayPromise = Promise.resolve();

			// Add event handlers to component
			this._addOrganizerHandler(component, "doOrganize", ElementOrganizer.ElementOrganizer_onDoOrganize);

		}

		// -------------------------------------------------------------------------
		//  Private
		// -------------------------------------------------------------------------

		/**
		 * Get target elements.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		elementInfo			Element info.
		 *
	 	 * @return  {Array}			HTML elements.
		 */
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
					elements = component.rootElement.querySelectorAll(elementInfo["rootNode"]);
				}
			}
			else if (elementName === "this" || elementName === component.tagName.toLowerCase())
			{
				elements = [component];
			}
			else
			{
				elements = component.rootElement.querySelectorAll("#" + elementName);
			}

			return elements;

		}

		// -------------------------------------------------------------------------

		/**
		 * Init elements.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		eventInfo			Event info.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		elementInfo			Element info.
		 */
		static __initElements(component, eventInfo, elementName, elementInfo)
		{

			let ret = [];
			let elements = ElementOrganizer.__getTargetElements(component, elementName, elementInfo);

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
						ElementOrganizer.__showOverlay(component, elementInfo[key]);
						waitForElement = component._overlay;
						break;
					case "hideLoader":
						ElementOrganizer.__hideOverlay(component, elementInfo[key]);
						waitForElement = component._overlay;
						break;
					case "build":
						let resourceName = elementInfo[key]["resourceName"];
						FormUtil.build(elements[i], component.resources[resourceName].items, elementInfo[key]);
						break;
					case "attribute":
						ElementOrganizer.__setAttributes(elements[i], elementInfo[key]);
						break;
					case "class":
						ElementOrganizer.__setClasses(elements[i], elementInfo[key]);
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
					case "rootNode":
					case "waitFor":
						break;
					default:
						console.warn(`ElementOrganizer.__initAttr(): Invalid type. name=${component.name}, eventName=${eventInfo.type}, type=${key}`);
						break;
					}
				});

				// Wait for transition/animation to finish
				if (elementInfo["waitFor"])
				{
					ret.push(ElementOrganizer.__waitFor(component, eventInfo, elementName, elementInfo, waitForElement));
				}
			}

			return ret;

		}

		// -------------------------------------------------------------------------

		/**
		 * Wait for transition to finish.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		eventInfo			Event info.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		elementInfo			Element info.
		 * @param	{HTMLElement}	element				Element.
		 *
	 	 * @return  {Promise}		Promise.
		 */
		static __waitFor(component, eventInfo, elementName, elementInfo, element)
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
				console.warn(`ElementOrganizer.__initAttr(): Invalid waitFor. name=${component.name}, eventName=${eventInfo.type}, waitFor=${elementInfo["waitFor"]}`);
				break;
			}

			BM.Util.warn(inTransition, `ElementOrganizer.__initAttr(): Element not in ${elementInfo["waitFor"]}. name=${component.name}, eventName=${eventInfo.type}, elementName=${elementName}`);

			return new Promise((resolve, reject) => {
				// Timeout timer
				let timer = setTimeout(() => {
					reject(`ElementOrganizer.__initAttr(): Timed out waiting for ${elementInfo["waitFor"]}. name=${component.name}, eventName=${eventInfo.type}, elementName=${elementName}`);
				}, BM.settings.get("system.waitForTimeout", 10000));

				// Resolve when finished
				element.addEventListener(elementInfo["waitFor"] + "end", () => {
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
		static __setAttributes(element, options)
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
					console.warn(`ElementOrganizer.__setAttributes(): Invalid command. element=${element.tagName}, command=${mode}`);
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
		static __setClasses(element, options)
		{

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
					console.warn(`ElementOrganizer.__setClasses(): Invalid command. element=${element.tagName}, command=${mode}`);
					break;
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Create an overlay if not exists.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static __createOverlay(component, options)
		{

			if (!component._overlay)
			{
				component.insertAdjacentHTML('afterbegin', '<div class="overlay"></div>');
				component._overlay = component.firstElementChild;
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Install an event handler to close when clicked.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static __closeOnClick(component, options)
		{

			component._overlay.addEventListener("click", (e) => {
				if (e.target === e.currentTarget && typeof component.close === "function")
				{
					component.close({"reason":"cancel"});
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
		static __getEffect(overlay)
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
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static __showOverlay(component, options)
		{

			ElementOrganizer.__createOverlay(component);

			// Add close on click event handler
			if (BM.Util.safeGet(options, "closeOnClick"))
			{
				ElementOrganizer.__closeOnClick(component);
			}

			window.getComputedStyle(component._overlay).getPropertyValue("visibility"); // Recalc styles

			let addClasses = ["show"].concat(BM.Util.safeGet(options, "addClasses", []));
			component._overlay.classList.add(...addClasses);
			component._overlay.classList.remove(...BM.Util.safeGet(options, "removeClasses", []));

			let effect = ElementOrganizer.__getEffect(component._overlay);
			if (effect)
			{
				component._overlayPromise = new Promise((resolve, reject) => {
					component._overlay.addEventListener(effect + "end", () => {
						resolve();
					}, {"once":true});
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
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static __hideOverlay(component, options)
		{

			component._overlayPromise.then(() => {
				window.getComputedStyle(component._overlay).getPropertyValue("visibility"); // Recalc styles

				let removeClasses = ["show"].concat(BM.Util.safeGet(options, "removeClasses", []));
				component._overlay.classList.remove(...removeClasses);
				component._overlay.classList.add(...BM.Util.safeGet(options, "addClasses", []));
			});
		}

	}

	// =============================================================================

	// =============================================================================
	//	Resource organizer class
	// =============================================================================

	class ResourceOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "ResourceOrganizer";

		}

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		static ResourceOrganizer_onDoOrganize(sender, e, ex)
		{

			let promises = [];

			this._enumSettings(e.detail.settings["resources"], (sectionName, sectionValue) => {
				promises.push(ResourceOrganizer._addResource(this, sectionName, sectionValue));
			});

			return Promise.all(promises);

		}

		// -------------------------------------------------------------------------

		static ResourceOrganizer_onDoFetch(sender, e, ex)
		{

			let promises = [];

			Object.keys(this._resources).forEach((resourceName) => {
				let resource = this._resources[resourceName];
				if (resource.options.get("autoFetch", true))
				{
					resource.target["id"] = BM.Util.safeGet(e.detail, "id", resource.target["id"]);
					resource.target["parameters"] = BM.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

					promises.push(resource.get(resource.target["id"], resource.target["parameters"]).then(() => {
						// Set a property automatically after resource is fetched
						let autoSet = this.settings.get("resources." + resourceName + ".autoSetProperty");
						if (autoSet)
						{
							this[autoSet] = resource.items;
						}
					}));
				}
			});

			return Promise.all(promises);

		}

		// -------------------------------------------------------------------------

		static ResourceOrganizer_onDoSubmit(sender, e, ex)
		{

			let promises = [];
			let submitItem = BM.Util.safeGet(e.detail, "items");

			Object.keys(this._resources).forEach((resourceName) => {
				let resource = this._resources[resourceName];
				if (resource.options.get("autoSubmit", true)) {
					let method = BM.Util.safeGet(e.detail, "method", resource.target["method"] || "put"); // Default is "put"
					let id = BM.Util.safeGet(e.detail, "id", resource.target["id"]);
					let parameters = BM.Util.safeGet(e.detail, "parameters", resource.target["parameters"]);

					promises.push(this._resources[resourceName][method](id, submitItem, parameters));
				}
			});

			return Promise.all(promises);

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"resources",
				"order":		300,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Add properties to component
			Object.defineProperty(component, 'resources', {
				get() { return this._resources; },
			});

			// Add methods to component
			component.addResource = function(resourceName, options) { return ResourceOrganizer._addResource(this, resourceName, options); };
			component.switchResource = function(resourceName) { return ResourceOrganizer._switchResource(this, resourceName); };

			// Init compnoent vars
			component._resources = {};

			// Add event handlers to component
			this._addOrganizerHandler(component, "doOrganize", ResourceOrganizer.ResourceOrganizer_onDoOrganize);
			this._addOrganizerHandler(component, "doFetch", ResourceOrganizer.ResourceOrganizer_onDoFetch);
			this._addOrganizerHandler(component, "doSubmit", ResourceOrganizer.ResourceOrganizer_onDoSubmit);

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
	     * Add resource. Load data if "autoLoad" option is true using added resource.
	     *
	     * @param	{Component}		component			Component.
	     * @param	{string}		resourceName		Resource name.
	     * @param	{array}			options				Options.
		 *
		 * @return 	{Promise}		Promise.
	     */
		static _addResource(component, resourceName, options)
		{

			BM.Util.assert(options["handlerClassName"], `ResourceOrganizer._addResource(): handler class name not specified. name=${component.name}, resourceName=${resourceName}`);

			let resource = BM.ClassUtil.createObject(options["handlerClassName"], component, resourceName, options["handlerOptions"]);
			component._resources[resourceName] = resource;

			if (resource.options.get("autoLoad"))
			{
				let id = resource.options.get("autoLoadOptions.id");
				let parameters = resource.options.get("autoLoadOptions.parameters");

				return resource.get(id, parameters).then(() => {
					// Set a property automatically after resource is fetched
					let autoSet = component.settings.get("resources." + resourceName + ".autoSetProperty");
					if (autoSet)
					{
						component[autoSet] = resource.items;
					}
				});
			}

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

	}

	// =============================================================================

	// =============================================================================
	//	Validation Organizer Class
	// =============================================================================

	class ValidationOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "ValidationOrganizer";

		}

		// -------------------------------------------------------------------------
		//	Event handlers
		// -------------------------------------------------------------------------

		static ValidationOrganizer_onDoOrganize(sender, e, ex)
		{

			this._enumSettings(e.detail.settings["validators"], (sectionName, sectionValue) => {
				ValidationOrganizer._addValidator(this, sectionName, sectionValue);
			});

		}

		// -------------------------------------------------------------------------

		static ValidationOrganizer_onDoValidate(sender, e, ex)
		{

			let validatorName = e.detail.validatorName;
			if (validatorName)
			{
				BM.Util.assert(this._validators[validatorName], `ValidationOrganizer.organize(): Validator not found. name=${this.name}, validatorName=${validatorName}`);

				let items = BM.Util.safeGet(e.detail, "items");
				let rules = this.settings.get("validators." + validatorName + ".rules");
				let options = this.settings.get("validators." + validatorName + ".handlerOptions");

				this._validators[validatorName].checkValidity(items, rules, options);
			}

		}

		// -------------------------------------------------------------------------

		static ValidationOrganizer_onDoReportValidity(sender, e, ex)
		{

			let validatorName = e.detail.validatorName;
			if (validatorName)
			{
				BM.Util.assert(this._validators[validatorName], `ValidationOrganizer.organize(): Validator not found. name=${this.name}, validatorName=${validatorName}`);

				let items = BM.Util.safeGet(e.detail.settings, "items");
				let rules = this.settings.get("validators." + validatorName + ".rules");
				let options = this.settings.get("validators." + validatorName + ".handlerOptions");

				this._validators[validatorName].reportValidity(items, rules, options);
			}

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		["validators"],
				"order":		310,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Add properties to component
			Object.defineProperty(component, 'validators', {
				get() { return this._validators; },
			});
			Object.defineProperty(component, 'validationResult', {
				get() { return this._validationResult; },
			});

			// Add methods to component
			component.addValidator = function(...args) { return ValidationOrganizer._addValidator(this, ...args); };
			component.validate = function(...args) { return ValidationOrganizer._validate(this, ...args); };

			// Init component vars
			component._validators = {};
			component._validationResult = {};

			// Add event handlers to component
			this._addOrganizerHandler(component, "doOrganize", ValidationOrganizer.ValidationOrganizer_onDoOrganize);
			this._addOrganizerHandler(component, "doValidate", ValidationOrganizer.ValidationOrganizer_onDoValidate);
			this._addOrganizerHandler(component, "doReportValidity", ValidationOrganizer.ValidationOrganizer_onDoReportValidity);

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
				validator = BM.ClassUtil.createObject(options["handlerClassName"], component, validatorName, options);
				component._validators[validatorName] = validator;
			}

			return validator;

		}

		// -------------------------------------------------------------------------

		/**
		 * Validate the form.
		 *
	     * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _validate(component, options)
		{

			options = options || {};
			component._validationResult = {"result":true};

			return Promise.resolve().then(() => {
				console.debug(`ValidationOrganizer._validate(): Validating component. name=${component.name}, id=${component.id}`);
				return component.trigger("beforeValidate", options);
			}).then(() => {
				return component.trigger("doValidate", options);
			}).then(() => {
				if (component.validationResult["result"])
				{
					console.debug(`ValidationOrganizer._validate(): Validation Success. name=${component.name}, id=${component.id}`);
					return component.trigger("doValidateSuccess", options);
				}
				else
				{
					console.debug(`ValidationOrganizer._validate(): Validation Failed. name=${component.name}, id=${component.id}`);
					return component.trigger("doValidateFail", options);
				}
			}).then(() => {
				return component.trigger("afterValidate", options);
			}).then(() => {
				if (!component._validationResult["result"])
				{
					return component.trigger("doReportValidity", options);
				}
			});

		}

	}

	// =============================================================================

	// =============================================================================
	//	Form Organizer Class
	// =============================================================================

	class FormOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "FormOrganizer";

		}

		// -------------------------------------------------------------------------
		//	Event handlers
		// -------------------------------------------------------------------------

		static FormOrganizer_onAfterTransform(sender, e, ex)
		{

			FormUtil.hideConditionalElements(this);

		}

		// -------------------------------------------------------------------------

		static FormOrganizer_onDoClear(sender, e, ex)
		{

			let target = BM.Util.safeGet(e.detail, "target", "");

			FormUtil.clearFields(this, target);
			this._items = {};

		}

		// -------------------------------------------------------------------------

		static FormOrganizer_onDoFill(sender, e, ex)
		{

			let rootNode = ( e.detail && "rootNode" in e.detail ? this.querySelector(e.detail["rootNode"]) : this );
			let items = BM.Util.safeGet(e.detail, "items", this._items);

			FormUtil.setFields(rootNode, items, {"masters":this.resources, "triggerEvent":"change"});
			FormUtil.showConditionalElements(this, items);

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"forms",
				"order":		310,
				"depends":		"ValidationOrganizer",
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Add properties to component
			Object.defineProperty(component, 'items', {
				get()		{ return this._items; },
				set(value)	{ this._items = value; },
			});
			Object.defineProperty(component, 'cancelSubmit', {
				get() { return this._cancelSubmit; },
			});

			// Add methods to component
			component.build = function(...args) { return FormOrganizer._build(this, ...args); };
			component.submit = function(...args) { return FormOrganizer._submit(this, ...args); };

			// Init component vars
			component._items = {};
			component._cancelSubmit = false;

			// Add event handlers to component
			this._addOrganizerHandler(component, "afterTransform", FormOrganizer.FormOrganizer_onAfterTransform);
			this._addOrganizerHandler(component, "doClear", FormOrganizer.FormOrganizer_onDoClear);
			this._addOrganizerHandler(component, "doFill", FormOrganizer.FormOrganizer_onDoFill);

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		*
		* Build a element.
		*
	    * @param	{Component}		component			Component.
		* @param	{HTMLElement}	element				HTMLElement to build.
		* @param	{Object}		items				Items to fill elements.
		* @param	{Object}		options				Options.
		*/
		static _build(component, element, items, options)
		{

			FormUtil.build(element, items, options);

		}

		// -------------------------------------------------------------------------

		/**
		 * Submit the form.
		 *
	     * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _submit(component, options)
		{

			options = options || {};
			component._cancelSubmit = false;

			return Promise.resolve().then(() => {
				// Collect values
				if (component.settings.get("forms.settings.autoCollect", true))
				{
					options["items"] = FormOrganizer.__collectData(component);
				}
			}).then(() => {
				// Validate values
				if (component.settings.get("forms.settings.autoValidate", true))
				{
					options["validatorName"] = component.settings.get("forms.settings.validatorName");
					return component.validate(options).then(() => {
						if (!component.validationResult["result"])
						{
							component._cancelSubmit = true;
						}
					});
				}
			}).then(() => {
				// Submit values
				console.debug(`FormOrganizer._submit(): Submitting component. name=${component.name}, id=${component.id}`);
				return component.trigger("beforeSubmit", options).then(() => {
					if (!component._cancelSubmit)
					{
						return Promise.resolve().then(() => {
							return component.trigger("doSubmit", options);
						}).then(() => {
							console.debug(`FormOrganizer._submit(): Submitted component. name=${component.name}, id=${component.id}`);
							component.items = options["items"];
							return component.trigger("afterSubmit", options);
						});
					}
				});
			});

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Colled data from form.
		 *
	     * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Object}		Collected data.
		 */
		static __collectData(component, options)
		{

			let submitItem = {};
			let items = FormUtil.getFields(component);

			// Collect values only from nodes that has [bm-submit] attribute.
			let nodes = component.querySelectorAll("[bm-submit]");
			nodes = Array.prototype.slice.call(nodes, 0);
			nodes.forEach((elem) => {
				let key = elem.getAttribute("bm-bind");
				submitItem[key] = items[key];
			});

			return submitItem;

		}

	}

	// =============================================================================

	// =============================================================================
	//	List Organizer Class
	// =============================================================================

	class ListOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "ListOrganizer";

		}

		// -------------------------------------------------------------------------
		//	Event handlers
		// -------------------------------------------------------------------------

		static ListOrganizer_onAfterTransform(sender, e, ex)
		{

			this._listRootNode = this.querySelector(this.settings.get("lists.settings.listRootNode"));
			BM.Util.assert(this._listRootNode, `List.fill(): List root node not found. name=${this.name}, listRootNode=${this.settings.get("settings.listRootNode")}`);

			return this.transformRow(this.settings.get("lists.settings.rowTemplateName"));

		}

		// -------------------------------------------------------------------------

		static ListOrganizer_onBeforeFill(sender, e, ex)
		{

			this._listRootNode.innerHTML = "";

		}

		// -------------------------------------------------------------------------

		static ListOrganizer_onDoFill(sender, e, ex)
		{

			this._rowElements = [];
			let builder = ( BM.Util.safeGet(e.detail.options, "async", this.settings.get("settings.async", true)) ? ListOrganizer._buildAsync : ListOrganizer._buildSync );
			let fragment = document.createDocumentFragment();
			let items = BM.Util.safeGet(e.detail, "items", this._rows);

			return Promise.resolve().then(() => {
				return builder(this, fragment, items);
			}).then(() => {
				this._listRootNode.appendChild(fragment);
			});

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"lists",
				"order":		310,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Add properties to component
			Object.defineProperty(component, 'rows', {
				get()		{ return this._rows; },
				set(value)	{ this._rows = value; },
			});

			// Add methods to component
			component.transformRow = function(...args) { return ListOrganizer._transformRow(this, ...args); };

			// Init component vars
			component._rows = [];
			component._activeRowTemplateName = "";

			// Add event handlers to component
			this._addOrganizerHandler(component, "afterTransform", ListOrganizer.ListOrganizer_onAfterTransform);
			this._addOrganizerHandler(component, "beforeFill", ListOrganizer.ListOrganizer_onBeforeFill);
			this._addOrganizerHandler(component, "doFill", ListOrganizer.ListOrganizer_onDoFill);

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Change a row template html.
		 *
	     * @param	{Component}		component			Component.
		 * @param	{String}		templateName		Template name.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _transformRow(component, templateName, options)
		{

			options = options || {};

			if (component._activeRowTemplateName === templateName)
			{
				return Promise.resolve();
			}

			return Promise.resolve().then(() => {
				console.debug(`ListOrganizer._transformRow(): Switching a row template. name=${component.name}, rowTemplateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`);
				return component.loadTemplate(templateName);
			}).then(() => {
				component._activeRowTemplateName = templateName;
			}).then(() => {
				return component.trigger("afterRowTransform", options);
			}).then(() => {
				console.debug(`ListOrganizer._transformRow(): Switched a row template. name=${component.name}, rowTemplateName=${templateName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Build rows synchronously.
		 *
		 * @param	{DocumentFragment}	fragment		Document fragment.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _buildSync(component, fragment, items)
		{

			BM.Util.assert(component._templates[component._activeRowTemplateName], `List._buildSync(): Row template not loaded yet. name=${component.name}, rowTemplateName=${component._activeRowTemplateName}`);

			let chain = Promise.resolve();
			//let rowEvents = component.settings.get("lists.rowevents");
			let rowEvents = component.settings.get("rowevents");
			let template = component.templates[component._activeRowTemplateName].html;

			for (let i = 0; i < items.length; i++)
			{
				chain = chain.then(() => {
					return ListOrganizer._appendRowSync(component, fragment, i, items[i], template, rowEvents);
				});
			}

			return chain;

		}

		// -------------------------------------------------------------------------

		/**
		 * Build rows asynchronously.
		 *
		 * @param	{DocumentFragment}	fragment		Document fragment.
		 */
		static _buildAsync(component, fragment, items)
		{

			BM.Util.assert(component.templates[component._activeRowTemplateName], `List._buildAsync(): Row template not loaded yet. name=${component.name}, rowTemplateName=${component._activeRowTemplateName}`);

			//let rowEvents = component.settings.get("lists.rowevents");
			let rowEvents = component.settings.get("rowevents");
			let template = component.templates[component._activeRowTemplateName].html;

			for (let i = 0; i < items.length; i++)
			{
				ListOrganizer._appendRowAsync(component, fragment, i, items[i], template, rowEvents);
			}

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Create a row element.
		 *
		 * @param	{String}		template				Template html.
		 *
		 * @return  {HTMLElement}	Row element.
		 */
		static _createRow(template)
		{

			let ele = document.createElement("tbody");
			ele.innerHTML = template;
			let element = ele.firstElementChild;
			element.setAttribute("bm-powered", "");

			return element;

		}

		// -------------------------------------------------------------------------

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
		static _appendRowSync(component, rootNode, no, item, template, rowEvents)
		{

			component.triggerAsync("beforeBuildRow", {"item":item});

			let chain = Promise.resolve();
			chain = chain.then(() => {
				// Append a row
				let element = ListOrganizer._createRow(template);
				rootNode.appendChild(element);
				component._rowElements.push(element);

				// set row elements click event handler
				if (rowEvents)
				{
					Object.keys(rowEvents).forEach((elementName) => {
						component.initEvents(elementName, rowEvents[elementName], element);
					});
				}

				// Call event handlers
				return Promise.resolve().then(() => {
					return component.trigger("beforeFillRow", {"item":item, "no":no, "element":element});
				}).then(() => {
					// Fill fields
					FormUtil.showConditionalElements(element, item);
					FormUtil.setFields(element, item, {"masters":component.resources});
				}).then(() => {
					return component.trigger("afterFillRow", {"item":item, "no":no, "element":element});
				});
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Append a new row asynchronously.
		 *
		 * @param	{HTMLElement}	rootNode				Root node to append a row.
		 * @param	{integer}		no						Line no.
		 * @param	{Object}		item					Row data.
		 * @param	{String}		template				Template html.
		 * @param	{Object}		rowEvents				Row's event info.
		 */
		static _appendRowAsync(component, rootNode, no, item, template, rowEvents)
		{

			component.triggerAsync("beforeBuildRow", {"item":item});

			// Append a row
			let element = ListOrganizer._createRow(template);
			rootNode.appendChild(element);
			component._rowElements.push(element);

			// set row elements click event handler
			if (rowEvents)
			{
				Object.keys(rowEvents).forEach((elementName) => {
					component.initEvents(elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			component.triggerAsync("beforeFillRow", {"item":item, "no":no, "element":element});
			FormUtil.showConditionalElements(element, item);
			FormUtil.setFields(element, item, {"masters":component.resources});
			component.triggerAsync("afterFillRow", {"item":item, "no":no, "element":element});

		}

	}

	// =============================================================================

	// =============================================================================
	//	Databinding organizer class
	// =============================================================================

	class DatabindingOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "DatabindingOrganizer";

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"binds",
				"order":		320,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
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
				case "afterTransform":
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

	// =============================================================================
	//	Plugin organizer class
	// =============================================================================

	class PluginOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "PluginOrganizer";

		}

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		static PluginOrganizer_onDoOrganize(sender, e, ex)
		{

			this._enumSettings(e.detail.settings["plugins"], (sectionName, sectionValue) => {
				PluginOrganizer._addPlugin(this, sectionName, sectionValue);
			});

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"plugins",
				"order":		800,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Init component vars
			component._plugins = {};

			// Add event handlers to component
			this._addOrganizerHandler(component, "doOrganize", PluginOrganizer.PluginOrganizer_onDoOrganize);

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
		 * @return  {Object}		Added plugin.
		 */
		static _addPlugin(component, pluginName, options)
		{

			console.debug(`PluginOrganizer._addPlugin(): Adding a plugin. name=${component.name}, pluginName=${pluginName}`);

			options = options || {};
			let className = ( "className" in options ? options["className"] : pluginName );
			let plugin = null;

			// CreatePlugin
			plugin = BM.ClassUtil.createObject(className, component, options);
			component._plugins[pluginName] = plugin;

			return plugin;

		}

	}

	// =============================================================================

	// =============================================================================
	//	Key organizer class
	// =============================================================================

	class KeyOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "KeyOrganizer";

		}

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		static KeyOrganizer_onAfterTransform(sender, e, ex)
		{

			let keys = this.settings.get("keys");
			if (keys)
			{
				// Init keys
				let actions = KeyOrganizer.__getActions(keys);
				this.addEventListener("keydown", function(e){KeyOrganizer.KeyOrganizer_onKeyDown.call(this, e, this);});
				this.addEventListener("keyup", function(e){KeyOrganizer.KeyOrganizer_onKeyUp.call(this, e, this, keys, actions);});
				//this.addEventListener("compositionstart", function(e){KeyOrganizer.onCompositionStart.call(this, e, this, keys);});
				//this.addEventListener("compositionend", function(e){KeyOrganizer.onCompositionEnd.call(this, e, this, keys);});

				// Init buttons
				this._enumSettings(this.settings.get("keys"), (sectionName, sectionValue) => {
					KeyOrganizer.__initButtons(this, sectionName, sectionValue);
				});
			}

		}

		// -------------------------------------------------------------------------

		/**
	 	 * Key down event handler. Check if it is in composing mode or not.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 */
		static KeyOrganizer_onKeyDown(e, component)
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
		static KeyOrganizer_onKeyUp(e, component, options, actions)
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
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"keys",
				"order":		800,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Init component vars
			component.__isComposing = false;

			// Add event handlers to component
			this._addOrganizerHandler(component, "afterTransform", KeyOrganizer.KeyOrganizer_onAfterTransform);

		}

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

			return component.submit().then(() => {
				if (!component.cancelSubmit)
				{
					// Modal result
					if (component.isModal)
					{
						component.modalResult["result"] = true;
					}

					// Auto close
					if (options && options["autoClose"])
					{
						component.close({"reason":"submit"});
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

			return component.close({"reason":"cancel"});

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

			return component.clear({"target":target});

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

	// =============================================================================
	//	Chain organizer class
	// =============================================================================

	class ChainOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "ChainOrganizer";

		}

		// -----------------------------------------------------------------------------
		//	Event handlers
		// -----------------------------------------------------------------------------

		static onDoOrganize(sender, e, ex)
		{

			let order = ChainOrganizer.getInfo()["order"];

			this._enumSettings(e.detail.settings["chains"], (sectionName, sectionValue) => {
				this.addEventHandler(sectionName, {
					"handler":ChainOrganizer.onDoProcess,
					"order":	order,
					"options":sectionValue
				});
			});

		}

		// -----------------------------------------------------------------------------

		static onDoProcess(sender, e, ex)
		{

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
				BM.Util.assert(nodes.length > 0, `ChainOrganizer.onDoOrganizer(): Node not found. name=${this.name}, eventName=${e.type}, rootNode=${targets[i]["rootNode"]}, method=${method}`);

				if (sync)
				{
					chain = chain.then(() => {
						return ChainOrganizer.__execTarget(this, nodes, method, state);
					});
				}
				else
				{
					chain = ChainOrganizer.__execTarget(this, nodes, method, state);
				}
				promises.push(chain);
			}

			return Promise.all(promises);

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"chains",
				"order":		800,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Add event handlers to component
			this._addOrganizerHandler(component, "doOrganize", ChainOrganizer.onDoOrganize);

		}

		// -----------------------------------------------------------------------------

		static deinit(component, options)
		{

			let chains = e.details.setting["chains"];
			if (chains)
			{
				Object.keys(chains).forEach((eventName) => {
					component.removeEventHandler(eventName, {"handler":ChainOrganizer.onDoOrganize, "options":chains[eventName]});
				});
			}

		}

		// -----------------------------------------------------------------------------
		//	Privates
		// -----------------------------------------------------------------------------

		/**
		 * Execute target methods.
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

	// =============================================================================
	//	Dialog organizer class
	// =============================================================================

	class DialogOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "DialogOrganizer";

		}

		// -------------------------------------------------------------------------
		//  Event Handlers
		// -------------------------------------------------------------------------

		static DialogOrganizer_onAfterReady(sender, e, ex)
		{

			if (this.settings.get("dialogs.settings.autoOpen"))
			{
				console.debug(`DialogOrganizer.DialogOrganizer_onAfterReady(): Automatically opening component. name=${this.name}, id=${this.id}`);

				return this.open();
			}

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"dialogs",
				"order":		800,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Add properties to component
			Object.defineProperty(component, 'modalResult', {
				get() { return this._modalResult; },
			});
			Object.defineProperty(component, 'isModal', {
				get() { return this._isModal; },
			});

			// Add methods to component
			component.open = function(options) { return DialogOrganizer._open(this, options); };
			component.openModal = function(options) { return DialogOrganizer._openModal(this, options); };
			component.close = function(options) { return DialogOrganizer._close(this, options); };

			// Init component vars
			component._isModal = false;
			component._cancelClose;
			component._cancelOpen;
			component._modalResult;
			component._modalPromise;

			// Add event handlers to component
			this._addOrganizerHandler(component, "afterReady", DialogOrganizer.DialogOrganizer_onAfterReady);

			// Init component settings
			component.settings.set("settings.autoRefresh", false);
			component.settings.set("settings.autoRefreshOnOpen", true);
			component.settings.set("settings.autoSetup", false);
			component.settings.set("settings.autoSetupOnOpen", true);

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

			options = options || {};

			console.debug(`DialogOrganizer._open(): Opening component. name=${component.name}, id=${component.id}`);
			return component.trigger("beforeOpen", options).then(() => {
				if (!component._cancelOpen)
				{
					return Promise.resolve().then(() => {
						// Show backdrop
						if (component.settings.get("dialogs.backdropOptions.show"))
						{
							return DialogOrganizer.__showBackdrop(component, component.settings.get("dialogs.backdropOptions"));
						}
					}).then(() => {
						// Setup
						if (BM.Util.safeGet(options, "autoSetupOnOpen", component.settings.get("settings.autoSetupOnOpen")))
						{
							return component.setup(options);
						}
					}).then(() => {
						// Refresh
						if (BM.Util.safeGet(options, "autoRefreshOnOpen", component.settings.get("settings.autoRefreshOnOpen")))
						{
							return component.refresh(options);
						}
					}).then(() => {
						return component.trigger("doOpen", options);
					}).then(() => {
						console.debug(`DialogOrganizer._open(): Opened component. name=${component.name}, id=${component.id}`);
						return component.trigger("afterOpen", options);
					});
				}
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Open component modal.
		 *
		 * @param	{array}			options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _openModal(component, options)
		{

			console.debug(`DialogOrganizer._openModal(): Opening component modal. name=${component.name}, id=${component.id}`);

			return new Promise((resolve, reject) => {
				component._isModal = true;
				component._modalResult = {"result":false};
				component._modalPromise = { "resolve": resolve, "reject": reject };
				return DialogOrganizer._open(component, options);
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

			options = options || {};
			component._cancelClose = false;

			console.debug(`DialogOrganizer._close(): Closing component. name=${component.name}, id=${component.id}`);
			return component.trigger("beforeClose", options).then(() => {
				if (!component._cancelClose)
				{
					return component.trigger("doClose", options).then(() => {
						// Hide backdrop
						if (component.settings.get("dialogs.backdropOptions.show"))
						{
							return DialogOrganizer.__hideBackdrop(component, component.settings.get("dialogs.backdropOptions"));
						}
					}).then(() => {
						if (component._isModal)
						{
							component._modalPromise.resolve(component._modalResult);
						}

							console.debug(`DialogOrganizer._close(): Closed component. name=${component.name}, id=${component.id}`);
						return component.trigger("afterClose", options);
					});
				}
			});

		}

		// -------------------------------------------------------------------------
		// 	Privates
		// -------------------------------------------------------------------------

		/**
		 * Create a backdrop if not exists.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static __createBackdrop(component, options)
		{

			if (!DialogOrganizer._backdrop)
			{
				// Create a backdrop
				document.body.insertAdjacentHTML('afterbegin', '<div class="backdrop"></div>');
				DialogOrganizer._backdrop = document.body.firstElementChild;
			}

		}

		// -----------------------------------------------------------------------------

		/**
		 * Show backdrop.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static __showBackdrop(component, options)
		{

			DialogOrganizer.__createBackdrop(component);

			let promise = new Promise((resolve, reject) => {
				window.getComputedStyle(DialogOrganizer._backdrop).getPropertyValue("visibility"); // Recalc styles

				let addClasses = ["show"].concat(component.settings.get("dialogs.backdropOptions.showOptions.addClasses", []));
				DialogOrganizer._backdrop.classList.add(...addClasses);
				DialogOrganizer._backdrop.classList.remove(...component.settings.get("dialogs.backdropOptions.showOptions.removeClasses", []));

				let effect = DialogOrganizer.__getEffect();
				if (effect)
				{
					// Transition/Animation
					DialogOrganizer._backdrop.addEventListener(effect + "end", () => {
						if (BM.Util.safeGet(options, "closeOnClick", true))
						{
							DialogOrganizer.__closeOnClick(component);
						}
						resolve();
					}, {"once":true});
				}
				else
				{
					// No Transition/Animation
					if (BM.Util.safeGet(options, "closeOnClick", true))
					{
						DialogOrganizer.__closeOnClick(component);
					}

					resolve();
				}
			});

			let sync =BM.Util.safeGet(options, "showOptions.sync", BM.Util.safeGet(options, "sync"));
			if (sync)
			{
				return promise;
			}

		}

		// -----------------------------------------------------------------------------

		/**
		 * Hide backdrop.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static __hideBackdrop(component, options)
		{

			let promise = new Promise((resolve, reject) => {
				window.getComputedStyle(DialogOrganizer._backdrop).getPropertyValue("visibility"); // Recalc styles

				let removeClasses = ["show"].concat(component.settings.get("dialogs.backdropOptions.hideOptions.removeClasses", []));
				DialogOrganizer._backdrop.classList.remove(...removeClasses);
				DialogOrganizer._backdrop.classList.add(...component.settings.get("dialogs.backdropOptions.hideOptions.addClasses", []));

				let effect = DialogOrganizer.__getEffect();
				if (effect)
				{
					DialogOrganizer._backdrop.addEventListener(effect + "end", () => {
						resolve();
					}, {"once":true});
				}
				else
				{
					resolve();
				}
			});

			let sync =BM.Util.safeGet(options, "hideOptions.sync", BM.Util.safeGet(options, "sync"));
			if (sync)
			{
				return promise;
			}

		}

		// -----------------------------------------------------------------------------

		/**
		 * Install an event handler to close when clicked.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		static __closeOnClick(component, options)
		{

			DialogOrganizer._backdrop.addEventListener("click", (e) => {
				if (e.target === e.currentTarget)
				{
					component.close({"reason":"cancel"});
				}
			}, {"once":true});

		}

		// -------------------------------------------------------------------------

		/**
		 * Get which effect is applied to backdrop.
		 *
		 * @return 	{String}		Effect ("transition" or "animation").
		 */
		static __getEffect()
		{

			let effect = "";

			if (window.getComputedStyle(DialogOrganizer._backdrop).getPropertyValue('transition-duration') !== "0s")
			{
				effect = "transition";
			}
			else if (window.getComputedStyle(DialogOrganizer._backdrop).getPropertyValue('animation-name') !== "none")
			{
				effect = "animation";
			}

			return effect;

		}

	}

	// =============================================================================

	// =============================================================================
	//	Preference organizer class
	// =============================================================================

	class PreferenceOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "PreferenceOrganizer";

		}

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		static PreferenceOrganizer_onDoOrganize(sender, e, ex)
		{

			// Wait for PreferenceManager to be ready
			return this.waitFor([{"rootNode":"bm-preference"}]).then(() => {
				document.querySelector("bm-preference").subscribe(this, this.settings.get("preferences"));
			});

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		"preferences",
				"order":		900,
			};

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Add event handlers to component
			this._addOrganizerHandler(component, "doOrganize", PreferenceOrganizer.PreferenceOrganizer_onDoOrganize);

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

	// =============================================================================
	//	Route organizer class
	// =============================================================================

	class RouteOrganizer extends BM.Organizer
	{

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		static get name()
		{

			return "RouteOrganizer";

		}

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		static RouteOrganizer_onDoOrganize(sender, e, ex)
		{

			// Routings
			this._enumSettings(e.detail.settings["routings"], (sectionName, sectionValue) => {
				RouteOrganizer._addRoute(this, sectionValue);
			});

			// Set current route info.
			this._routeInfo = RouteOrganizer.__loadRouteInfo(this, window.location.href);

			// Specs
			this._enumSettings(e.detail.settings["specs"], (sectionName, sectionValue) => {
				this._specs[sectionName] = sectionValue;
			});

		}

		// -------------------------------------------------------------------------

		static RouteOrganizer_onDoStart(sender, e, ex)
		{

			if (this.routeInfo["specName"])
			{
				let options = {
					"query": this.settings.get("settings.query")
				};

				return this.switchSpec(this.routeInfo["specName"], options);
			}

		};

		// -------------------------------------------------------------------------

		static RouteOrganizer_onAfterReady(sender, e, ex)
		{

			return this.openRoute();

		}

		// -------------------------------------------------------------------------

		static RouteOrganizer_onDoValidateFail(sender, e, ex)
		{

			// Try to fix URL when validation failed
			if (this.settings.get("routings.settings.autoFix"))
			{
				RouteOrganizer.__fixRoute(this, e.detail.url);
			}

		}

		// -------------------------------------------------------------------------

		static RouteOrganizer_onAfterValidate(sender, e, ex)
		{

			// Dump errors when validation failed
			if (!this.validationResult["result"])
			{
				RouteOrganizer.__dumpValidationErrors(this);
				throw new URIError("URL validation failed.");
			}

		}

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		static getInfo()
		{

			return {
				"sections":		["routings", "specs"],
				"order":		900,
				"depends":		"ValidationOrganizer",
			};

		}

		// -------------------------------------------------------------------------

		static globalInit()
		{

			// Set state on the first page
			history.replaceState(RouteOrganizer.__getState("connect"), null, null);

		}

		// -------------------------------------------------------------------------

		static init(component, options)
		{

			// Add properties to component
			Object.defineProperty(component, 'routeInfo', { get() { return this._routeInfo; }, });
			Object.defineProperty(component, 'specs', { get() { return this._specs; }, });
			Object.defineProperty(component, 'spec', { get() { return this._spec; }, });

			// Add methods to component
			component.loadParameters = function(url) { return RouteOrganizer._loadParameters(url); };
			component.switchSpec = function(specName, options) { return RouteOrganizer._switchSpec(this, specName, options); };
			component.openRoute = function(routeInfo, options) { return RouteOrganizer._open(this, routeInfo, options); };
			component.jumpRoute = function(routeInfo, options) { return RouteOrganizer._jumpRoute(this, routeInfo, options); };
			component.updateRoute = function(routeInfo, options) { return RouteOrganizer._updateRoute(this, routeInfo, options); };
			component.refreshRoute = function(routeInfo, options) { return RouteOrganizer._refreshRoute(this, routeInfo, options); };
			component.replaceRoute = function(routeInfo, options) { return RouteOrganizer._replaceRoute(this, routeInfo, options); };
			component.normalizeRoute = function() { return RouteOrganizer._normalizeRoute(this); };

			// Init component vars
			component._routes = [];
			component._specs = {};
			component._spec = new BM.ChainableStore({"chain":component.settings, "writeThrough":true});
			Object.defineProperty(component, "settings", { get() { return this._spec; }, }); // Tweak to see settings through spec

			// Add event handlers to component
			this._addOrganizerHandler(component, "doOrganize", RouteOrganizer.RouteOrganizer_onDoOrganize);
			this._addOrganizerHandler(component, "doStart", RouteOrganizer.RouteOrganizer_onDoStart);
			this._addOrganizerHandler(component, "afterReady", RouteOrganizer.RouteOrganizer_onAfterReady);
			this._addOrganizerHandler(component, "doValidateFail", RouteOrganizer.RouteOrganizer_onDoValidateFail);
			this._addOrganizerHandler(component, "afterValidate", RouteOrganizer.RouteOrganizer_onAfterValidate);

			// Load settings from attributes
			RouteOrganizer._loadAttrSettings(component);

			// Init popstate handler
			RouteOrganizer.__initPopState(component);

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Add a route.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		routeInfo			Route info.
		 * @param	{Boolean}		first				Add to top when true.
		 */
		static _addRoute(component, routeInfo, first)
		{

			let keys = [];
			let route = {
				"origin": routeInfo["origin"],
				"name": routeInfo["name"],
				"path": routeInfo["path"],
				"keys": keys,
				"specName": routeInfo["specName"],
				"componentName": routeInfo["componentName"],
				"re": pathToRegexp(routeInfo["path"], keys)
			};

			if (first)
			{
				component._routes.unshift(route);
			}
			else
			{
				component._routes.push(route);
			}

		}

		// -------------------------------------------------------------------------

		/**
		 * Build url from route info.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		routeInfo			Route information.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {String}		Url.
		 */
		static _buildUrl(component, routeInfo, options)
		{

			let url = "";

			url += ( routeInfo["url"] ? routeInfo["url"] : "" );
			url += ( routeInfo["path"] ? routeInfo["path"] : "" );
			url += ( routeInfo["query"] ? "?" + routeInfo["query"] : "" );

			if (routeInfo["queryParameters"])
			{
				let params = {};
				if (options && options["mergeParameters"])
				{
					params = Object.assign(params, component.routeInfo["queryParameters"]);
				}
				params = Object.assign(params, routeInfo["queryParameters"]);
				url += RouteOrganizer._buildUrlQuery(params);
			}

			return ( url ? url : "/" );

		}

		// -----------------------------------------------------------------------------

		/**
		 * Build query string from the options object.
		 *
		 * @param	{Object}		options				Query options.
		 *
		 * @return	{String}		Query string.
		 */
		static _buildUrlQuery(options)
		{

			let query = "";

			if (options)
			{
				query = Object.keys(options).reduce((result, current) => {
					if (Array.isArray(options[current]))
					{
						result += encodeURIComponent(current) + "=" + encodeURIComponent(options[current].join()) + "&";
					}
					else if (options[current])
					{
						result += encodeURIComponent(current) + "=" + encodeURIComponent(options[current]) + "&";
					}

					return result;
				}, "");
			}

			return ( query ? "?" + query.slice(0, -1) : "");

		}

		// -----------------------------------------------------------------------------

		/**
		 * Create options array from the current url.
		 *
		 * @return  {Array}			Options array.
		 */
		static _loadParameters(url)
		{

			url = url || window.location.href;
			let vars = {};
			let hash;
			let value;

			if (window.location.href.indexOf("?") > -1)
			{
				let hashes = url.slice(url.indexOf('?') + 1).split('&');

				for(let i = 0; i < hashes.length; i++) {
					hash = hashes[i].split('=');
					if (hash[1]){
						value = hash[1].split('#')[0];
					} else {
						value = hash[1];
					}
					vars[hash[0]] = decodeURIComponent(value);
				}
			}

			return vars;

		}

		// -------------------------------------------------------------------------

		/**
		 * Load a spec and init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		specName			Spec name.
		 * @param	{Object}		options				Options.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static _switchSpec(component, specName, options)
		{

			BM.Util.assert(specName, "RouteOrganizer._switchSpec(): A spec name not specified.", TypeError);

			return Promise.resolve().then(() => {
				if (!component._specs[specName])
				{
					return RouteOrganizer._loadSpec(component, specName, options).then((spec) => {
						component._specs[specName] = spec;
					});
				}
			}).then(() => {
				component._spec.items = component._specs[specName];
			}).then(() => {
				if (component.settings.get("settings.hasExtender"))
				{
					return RouteOrganizer._loadExtender(component, specName, options);
				}
			}).then(() => {
				return component.attachOrganizers({"settings":component._specs[component._routeInfo["specName"]]});
			}).then(() => {
				return component.trigger("doOrganize", {"settings":component._specs[component._routeInfo["specName"]]});
			}).then(() => {
				return component.trigger("afterLoadSettings", {"settings":component._specs[component._routeInfo["specName"]]});
			});

		}

		// -----------------------------------------------------------------------------

		/**
		 * Open route.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		routeInfo			Route information.
		 * @param	{Object}		options				Options.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static _open(component, routeInfo, options)
		{

			options = Object.assign({}, options);
			let pushState = BM.Util.safeGet(options, "pushState", ( routeInfo ? true : false ));

			// Current route info
			let curRouteInfo = component._routeInfo;

			let newUrl;
			let newRouteInfo;
			if (routeInfo)
			{
				newUrl = RouteOrganizer._buildUrl(component, routeInfo, options);
				newRouteInfo = RouteOrganizer.__loadRouteInfo(component, newUrl);
			}
			else
			{
				newUrl = window.location.href;
				newRouteInfo = curRouteInfo;
			}

			// Jump to another page
			if (options["jump"] || !newRouteInfo["name"]
					|| ( curRouteInfo["specName"] != newRouteInfo["specName"]) // <--- remove this when _update() is ready.
			)
			{
				RouteOrganizer._jumpRoute(component, {"url":newUrl});
				return;
			}

			return Promise.resolve().then(() => {
				// Replace URL
				if (pushState)
				{
					history.pushState(RouteOrganizer.__getState("_open.pushState"), null, newUrl);
				}
				component._routeInfo = newRouteInfo;
			}).then(() => {
				// Load other component when new spec is different from the current spec
				if (curRouteInfo["specName"] != newRouteInfo["specName"])
				{
					return RouteOrganizer._updateRoute(component, curRouteInfo, newRouteInfo, options);
				}
			}).then(() => {
				// Validate URL
				if (component.settings.get("routings.settings.autoValidate"))
				{
					let validateOptions = {
						"validatorName":	component.settings.get("routings.settings.validatorName"),
						"items":			RouteOrganizer._loadParameters(newUrl),
						"url":				newUrl,
					};
					return component.validate(validateOptions);
				}
			}).then(() => {
				// Refresh
				return RouteOrganizer._refreshRoute(component, newRouteInfo, options);
			}).then(() => {
				// Normalize URL
				return RouteOrganizer._normalizeRoute(component, window.location.href);
			});

		}

		// -----------------------------------------------------------------------------

		/**
		 * Jump to url.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		routeInfo			Route information.
		 * @param	{Object}		options				Options.
		 */
		static _jumpRoute(component, routeInfo, options)
		{

			let url = RouteOrganizer._buildUrl(component, routeInfo, options);
			window.location.href = url;

		}

		// -----------------------------------------------------------------------------

		/**
		 * Update route.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		routeInfo			Route information.
		 * @param	{Object}		options				Options.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static _updateRoute(component, curRouteInfo, newRouteInfo, options)
		{

			return RouteOrganizer._switchSpec(component, newRouteInfo["specName"]);

		}

		// -----------------------------------------------------------------------------

		/**
		 * Refresh route.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		routeInfo			Route information.
		 * @param	{Object}		options				Options.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static _refreshRoute(component, routeInfo, options)
		{

			return component.refresh(options);

		}

		// -----------------------------------------------------------------------------

		/**
		 * Replace current url.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		routeInfo			Route information.
		 * @param	{Object}		options				Options.
		 */
		static _replaceRoute(component, routeInfo, options)
		{

			history.replaceState(RouteOrganizer.__getState("replaceRoute", window.history.state), null, RouteOrganizer._buildUrl(component, routeInfo, options));
			component._routeInfo = RouteOrganizer.__loadRouteInfo(component, window.location.href);

		}

		// -----------------------------------------------------------------------------

		/**
		 * Normalize route.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		url					Url to normalize.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static _normalizeRoute(component, url)
		{

			return Promise.resolve().then(() => {
				return component.trigger("beforeNormalizeURL");
			}).then(() => {
				return component.trigger("doNormalizeURL");
			}).then(() => {
				return component.trigger("afterNormalizeURL");
			});

		}

		// -------------------------------------------------------------------------

		/**
		 * Get settings from element's attribute.
		 *
		 * @param	{Component}		component			Component.
		 */
		static _loadAttrSettings(component)
		{

			// Get spec path from  bm-specpath
			let path = component.getAttribute("bm-specpath");
			if (path)
			{
				component.settings.set("system.specPath", path);
			}

		}

		// -----------------------------------------------------------------------------

		/**
		 * Load the spec file for this page.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		specName			Spec name.
		 * @param	{Object}		loadOptions			Load options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _loadSpec(component, specName, loadOptions)
		{

			let spec;
	//		let specCommon;
			let promises = [];

			console.debug(`RouteOrganizer._loadSpec(): Loading spec file. name=${component.name}, specName=${specName}`);

			// Path
			let path = BM.Util.safeGet(loadOptions, "path",
				BM.Util.concatPath([
					component.settings.get("system.appBaseUrl", ""),
					component.settings.get("system.specPath", "")
				])
			);

			// Load specs
			let options = BM.Util.deepMerge({"type": "js", "bindTo": this}, loadOptions);
			promises.push(BM.SettingOrganizer.loadFile(specName, path, options));

			return Promise.all(promises).then((result) => {
				spec = result[0];
	//			specCommon = result[0];
	//			spec = BM.Util.deepMerge(specCommon, result[1]);

				return spec;
			});

		}

		// -----------------------------------------------------------------------------

		/**
		 * Load the extender file for this page.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		specName			Spec name.
		 * @param	{Object}		loadOptions			Load options.
		 *
		 * @return  {Promise}		Promise.
		 */
		static _loadExtender(component, extenderName, loadOptions)
		{

			console.debug(`RouteOrganizer._loadExtender(): Loading extender file. name=${component.name}, extenderName=${extenderName}`);

			let query = BM.Util.safeGet(loadOptions, "query");
			let path = BM.Util.safeGet(loadOptions, "path",
				BM.Util.concatPath([
					component.settings.get("system.appBaseUrl", ""),
					component.settings.get("system.specPath", "")
				])
			);
			let url = path + extenderName + ".extender.js" + (query ? "?" + query : "");

			return BM.AjaxUtil.loadScript(url);

		}

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
		 * Get route info from the url.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		url					Url.
		 *
		 * @return  {Object}		Route info.
		 */
		static __loadRouteInfo(component, url)
		{

			let routeInfo = {};
			let routeName;
			let parsedUrl = new URL(url, window.location.href);
			let specName;
			let params = {};

			// Find a matching route
			for (let i = component._routes.length - 1; i >= 0; i--)
			{
				// Check origin
				if (component._routes[i]["origin"] && parsedUrl.origin != component._routes[i]["origin"])
				{
					continue;
				}

				// Check path
				let result = ( !component._routes[i]["path"] ? [] : component._routes[i].re.exec(parsedUrl.pathname) );
				if (result)
				{
					routeName = component._routes[i].name;
					specName = ( component._routes[i].specName ? component._routes[i].specName : "" );
					for (let j = 0; j < result.length - 1; j++)
					{
						params[component._routes[i].keys[j].name] = result[j + 1];
						let keyName = component._routes[i].keys[j].name;
						let value = result[j + 1];
						specName = specName.replace("{{:" + keyName + "}}", value);
					}

					break;
				}
			}

			routeInfo["name"] = routeName;
			routeInfo["specName"] = specName;
			routeInfo["url"] = parsedUrl["href"];
			routeInfo["path"] = parsedUrl.pathname;
			routeInfo["query"] = parsedUrl.search;
			routeInfo["parsedUrl"] = parsedUrl;
			routeInfo["routeParameters"] = params;
			routeInfo["queryParameters"] = RouteOrganizer._loadParameters(url);

			return routeInfo;

		}

		// -----------------------------------------------------------------------------

		/**
		 * Init pop state handling.
		 *
		 * @param	{Component}		component			Component.
		 */
		static __initPopState(component)
		{

			window.addEventListener("popstate", (e) => {
				return Promise.resolve().then(() => {
					return component.trigger("beforePopState");
				}).then(() => {
					return RouteOrganizer._open(component, {"url":window.location.href}, {"pushState":false});
				}).then(() => {
					return component.trigger("afterPopState");
				});
			});

		}

		// -----------------------------------------------------------------------------

		/**
		 * Return history state.
		 *
		 * @param	{String}		msg					Message to store in state.
		 * @param	{Object}		options				Optional values to store in state.
		 *
		 * @return	{String}		State.
		 */
		static __getState(msg, options)
		{

			let newState = {
				"msg": msg,
			};

			if (options)
			{
				newState = BM.Util.deepMerge(BM.Util.deepClone(options), newState);
			}

			return newState;

		}

		// -----------------------------------------------------------------------------

		/**
		 * Fix route.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		url					Url to validate.
		 *
		 * @return 	{Promise}		Promise.
		 */
		static __fixRoute(component, url)
		{

			let isOk = true;
			let newParams = RouteOrganizer._loadParameters(url);

			// Fix invalid paramters
			Object.keys(component.validationResult["invalids"]).forEach((key) => {
				let item = component.validationResult["invalids"][key];

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
				RouteOrganizer._replaceRoute(component, {"queryParameters":newParams});

				// Fixed
				component.validationResult["result"] = true;
			}

		}

		// -----------------------------------------------------------------------------

		/**
		 * Dump validation errors.
		 *
		 * @param	{Component}		component			Component.
		 */
		static __dumpValidationErrors(component)
		{

			Object.keys(component.validationResult["invalids"]).forEach((key) => {
				let item = component.validationResult["invalids"][key];

				if (item.failed)
				{
					for (let i = 0; i < item.failed.length; i++)
					{
						console.warn("URL validation failed.",
							"key=" + item.key +
							", value=" + item.value +
							", rule=" + item.failed[i].rule +
							", validity=" + item.failed[i].validity
						);
					}
				}
			});

		}

	}

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
			this._options = new BM.Store({"items":Object.assign({}, options)});
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

			options = options || {};

			this._resourceName = resourceName;
			this._component = component;
			this._options = new BM.Store({"items":options});
			this._data = {};
			this._items = [];
			this._name = "ResourceHandler";
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
	//			BM.Util.warn(data, `ResourceHandler.get(): No data returned. name=${this._component.name}, handlerName=${this._name}, resourceName=${this._resourceName}`);

				this.data = data;

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
			let items = ( itemsField ? BM.Util.safeGet(data, itemsField) : data );

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

	// =============================================================================
	//	Cookie resource handler class
	// =============================================================================

	class CookieResourceHandler extends ResourceHandler
	{

		// -------------------------------------------------------------------------
		//  Constructor
		// -------------------------------------------------------------------------

		constructor(component, resourceName, options)
		{

			let defaults = {"autoLoad":true};
			super(component, resourceName, Object.assign(defaults, options));

			this._name = "CookieResourceHandler";
			this._cookieName = BM.Util.safeGet(options, "cookieOptions.name", "preferences");

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		_get(id, parameters)
		{

			return this.__getCookie(this._cookieName);

		}

		// -------------------------------------------------------------------------

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

		constructor(component, resourceName, options)
		{

			super(component, resourceName, options);

			this._name = "ApiResourceHandler";

		}

		// -------------------------------------------------------------------------
		// 	Protected
		// -------------------------------------------------------------------------

		_get(id, parameters)
		{

			let method = "GET";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BM.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options}).then((xhr) => {
				return this._convertResponseData(xhr.responseText, dataType);
			});

		}

	    // -------------------------------------------------------------------------

		_delete(id, parameters)
		{

			let method = "DELETE";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			urlOptions["dataType"];

			let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BM.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options});

		}

	    // -------------------------------------------------------------------------

		_post(id, data, parameters)
		{

			let method = "POST";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BM.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

		}

	    // -------------------------------------------------------------------------

		_put(id, data, parameters)
		{

			let method = "PUT";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BM.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

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

			let defaults = {"autoLoad":true, "autoFetch":false, "autoSubmit":false};
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

		constructor(component, resourceName, options)
		{

			let defaults = {"autoLoad":true, "autoFetch":false, "autoSubmit":false};
			super(component, resourceName, Object.assign(defaults, options));

			this._name = "LinkedResourceHandler";
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

		_get(id, parameters)
		{

			let rootNode = this._options.get("rootNode");
			let resourceName = this._options.get("resourceName") || this._resourceName;

			return this._component.waitFor([{"rootNode":rootNode}]).then(() => {
				this._ref = document.querySelector(rootNode).resources[resourceName];
				return this._ref;
			});

		}

		// -------------------------------------------------------------------------

		_delete(id, parameters)
		{

			return this._ref.delete(id, parameters);

		}

		// -------------------------------------------------------------------------

		_post(id, data, parameters)
		{

			return this._ref.post(id, data, parameters);

		}

		// -------------------------------------------------------------------------

		_put(id, data, parameters)
		{

			return this._ref.put(id, data, parameters);

		}

	}

	// =============================================================================

	// =============================================================================
	//	Web Storage handler class
	// =============================================================================

	class WebstorageResourceHandler extends ResourceHandler
	{

		// -------------------------------------------------------------------------
		//  Constructor
		// -------------------------------------------------------------------------

		constructor(component, resourceName, options)
		{

			let defaults = {};
			super(component, resourceName, Object.assign(defaults, options));

			this._name = "WebstorageResourceHandler";

		}

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		_get(id, parameters)
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

		_delete(id, parameters)
		{

			localStorage.removeItem(id);

		}

		// -------------------------------------------------------------------------

		_post(id, data, parameters)
		{

			localStorage.setItem(id, JSON.stringify(data));

		}

		// -------------------------------------------------------------------------

		_put(id, data, parameters)
		{

			localStorage.setItem(id, JSON.stringify(data));

		}

	}

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

			options = options || {};

			this._name = validatorName;
			this._component = component;
			this._options = new BM.Store({"items":options});

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

			BM.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
			BM.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

			let elements = BM.Util.scopedSelectorAll(form, "input:not([novalidate])");
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

			BM.Util.assert(form, `FormValidationHandler.checkValidity(): Form tag does not exist.`, TypeError);
			BM.Util.assert(form.checkValidity, `FormValidationHandler.checkValidity(): check validity not supported.`, TypeError);

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
			let invalids = BM.Util.deepMerge(invalids1, invalids2);

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

			BM.Util.assert(form, `FormValidationHandler.reportValidity(): Form tag does not exist.`, TypeError);
			BM.Util.assert(form.reportValidity, `FormValidationHandler.reportValidity(): Report validity not supported.`, TypeError);

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
			let invalids = BM.Util.deepMerge(invalids1, invalids2);

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
	//	Chained Select Class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function ChainedSelect(settings)
	{

		return Reflect.construct(BM.Component, [settings], this.constructor);

	}

	BM.ClassUtil.inherit(ChainedSelect, BM.Component);

	// -----------------------------------------------------------------------------
	//	Settings
	// -----------------------------------------------------------------------------

	ChainedSelect.prototype._getSettings = function()
	{

		return {
			// Settings
			"settings": {
				"name":						"ChainedSelect",
				"autoClear":				true,
				"autoSubmit":				true,
				"useDefaultInput":			true,
				"rootNodes": {
					"newitem": 				".btn-newitem",
					"removeitem":			".btn-removeitem",
					"edititem":				".btn-edititem",
					"select":				"select"
				},
			},

			// Events
			"events": {
				"this": {
					"handlers": {
						"beforeStart":		["ChainedSelect_onBeforeStart"],
						"afterTransform":	["ChainedSelect_onAfterTransform"],
						"doClear":			["ChainedSelect_onDoClear"],
						"doFill":			["ChainedSelect_onDoFill"],
					}
				},
				"cmb-item": {
					"rootNode":				"select",
					"handlers": {
						"change": 			["ChainedSelect_onCmbItemChange"],
					}
				},
				"btn-newitem": {
					"rootNode":				".btn-newitem",
					"handlers": {
						"click":			["ChainedSelect_onBtnNewItemClick"],
					}
				},
				"btn-edititem": {
					"rootNode":				".btn-edititem",
					"handlers": {
						"click":			["ChainedSelect_onBtnEditItemClick"],
					}
				},
				"btn-removeitem": {
					"rootNode":				".btn-removeitem",
					"handlers": {
						"click": 			["ChainedSelect_onBtnRemoveItemClick"],
					}
				}
			},

			// Validators
			"validators": {
			}
		}

	};

	// -----------------------------------------------------------------------------
	//  Setter/Getter
	// -----------------------------------------------------------------------------

	/**
	 * Length.
	 *
	 * @type	{Number}
	 */
	Object.defineProperty(ChainedSelect.prototype, "items", {
		get()
		{
			let length = 0;
			let level = 1;

			while (this.querySelector(":scope .item[data-level='" + level + "'] select"))
			{
				level++;
				length++;
			}

			return length;
		},
	});

	// -----------------------------------------------------------------------------
	//	Event Handlers
	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onBeforeStart = function(sender, e, ex)
	{

		this.rootNodes = this.settings.get("settings.rootNodes");

		if (this.settings.get("settings.useDefaultInput", true))
		{
			this.addEventHandler("beforeAdd", "ChainedSelect_onBeforeAdd");
			this.addEventHandler("doAdd", "ChainedSelect_onDoAdd");
			this.addEventHandler("beforeEdit", "ChainedSelect_onBeforeEdit");
			this.addEventHandler("doEdit", "ChainedSelect_onDoEdit");
			this.addEventHandler("beforeRemove", "ChainedSelect_onBeforeRemove");
			this.addEventHandler("doRemove", "ChainedSelect_onDoRemove");
		}

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onAfterTransform = function(sender, e, ex)
	{

		// Init select elements (disable all)
		this.clear({"fromLevel":1, "toLevel":this.length});

		if (!this.settings.get("settings.isAddable", true))
		{
			this.querySelectorAll(":scope " + this.rootNodes["newitem"]).forEach((element) => {
				element.style.display = "none";
			});
		}

		if (!this.settings.get("settings.isEditable", true))
		{
			this.querySelectorAll(":scope " + this.rootNodes["edititem"]).forEach((element) => {
				element.style.display = "none";
			});
		}

		if (!this.settings.get("settings.isRemovable", true))
		{
			this.querySelectorAll(":scope " + this.rootNodes["removeitem"]).forEach((element) => {
				element.style.display = "none";
			});
		}

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onDoClear = function(sender, e, ex)
	{

		let fromLevel = BM.Util.safeGet(e.detail, "fromLevel", 1);
		let toLevel = BM.Util.safeGet(e.detail, "toLevel", this.length);

		for (let i = fromLevel; i <= toLevel; i++)
		{
			if (this.settings.get("settings.autoClear")) {
				this.querySelector(":scope .item[data-level='" + i + "'] " + this.rootNodes["select"]).options.length = 0;
			}
			this.querySelector(":scope .item[data-level='" + i + "'] " + this.rootNodes["select"]).selectedIndex = -1;
			this._initElement("select", i);
			this._initElement("newitem", i);
			this._initElement("edititem", i);
			this._initElement("removeitem", i);
		}

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onDoFill = function(sender, e, ex)
	{

		let level = BM.Util.safeGet(e.detail, "level", 1);
		this.assignItems(level, this.items);

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onCmbItemChange = function(sender, e, ex)
	{

	return this.selectItem(sender.parentNode.getAttribute("data-level"), sender.value);

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onBtnNewItemClick = function(sender, e, ex)
	{

		if (sender.classList.contains("disabled")) {
			return;
		}

		let level = sender.parentNode.getAttribute("data-level");
		this.modalResult = {"result":false};
		let options = {
			"level":level,
			"validatorName": "",
		};

		return this.trigger("beforeAdd", options).then(() => {
			if (this.modalResult["result"])
			{
				return this.validate(options).then(() => {
					if(this.validationResult["result"])
					{
						return Promise.resolve().then(() => {
							return this.trigger("doAdd", options);
						}).then(() => {
							return this.trigger("afterAdd", options);
						}).then(() => {
							if (this.settings.get("settings.autoSubmit", true))
							{
								return this.submit(options);
							}
						});
					}
				});
			}
		});

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onBtnEditItemClick = function(sender, e, ex)
	{

		if (sender.classList.contains("disabled")) {
			return;
		}

		let level = sender.parentNode.getAttribute("data-level");
		this.modalResult = {"result":false};
		let options = {
			"level":level,
			"validatorName": "",
		};

		return this.trigger("beforeEdit", options).then(() => {
			if (this.modalResult["result"])
			{
				return this.validate(options).then(() => {
					if(this.validationResult["result"])
					{
						return Promise.resolve().then(() => {
							return this.trigger("doEdit", options);
						}).then(() => {
							return this.trigger("afterEdit", options);
						}).then(() => {
							if (this.settings.get("settings.autoSubmit", true))
							{
								return this.submit(options);
							}
						});
					}
				});
			}
		});

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.onChainedSelect_onBtnRemoveItemClick = function(sender, e, ex)
	{

		if (sender.classList.contains("disabled")) {
			return;
		}

		let level = sender.parentNode.getAttribute("data-level");
		this.modalResult = {"result":false};
		let options = {
			"level":level,
			"validatorName": "",
		};

		return this.trigger("beforeRemove", options).then(() => {
			if (this.modalResult["result"])
			{
				return this.validate(options).then(() => {
					if(this.validationResult["result"])
					{
						return Promise.resolve().then(() => {
							return this.trigger("doRemove", options);
						}).then(() => {
							return this.trigger("afterRemove", options);
						}).then(() => {
							if (this.settings.get("settings.autoSubmit", true))
							{
								return this.submit(options);
							}
						});
					}
				});
			}
		});

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onBeforeAdd = function(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			let text = window.prompt("アイテム名を入力してください", "");
			if (text)
			{
				this.modalResult["text"] = text;
				this.modalResult["value"] = text;
				this.modalResult["result"] = true;
			}
			resolve();
		});

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onDoAdd = function(sender, e, ex)
	{

		return this.newItem(e.detail.level, this.modalResult.text, this.modalResult.value);

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onBeforeEdit = function(sender, e, ex)
	{

		let level = parseInt(BM.Util.safeGet(e.detail, "level", 1));
		let selectBox = this.getSelect(level);

		return new Promise((resolve, reject) => {
			let text = window.prompt("アイテム名を入力してください", "");
			if (text)
			{
				this.modalResult["old"] = {
					"text": selectBox.options[selectBox.selectedIndex].text,
					"value": selectBox.value
				};
				this.modalResult["new"] = {
					"text": text,
					"value": text
				};
				this.modalResult["result"] = true;
			}
			resolve();
		});

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onDoEdit = function(sender, e, ex)
	{

		this.editItem(e.detail.level, this.modalResult.new.text, this.modalResult.new.value);

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onBeforeRemove = function(sender, e, ex)
	{

		return new Promise((resolve, reject) => {
			if (window.confirm("削除しますか？"))
			{
				let level = parseInt(BM.Util.safeGet(e.detail, "level", 1));
				let selectBox = this.getSelect(level);

				this.modalResult["text"] = selectBox.options[selectBox.selectedIndex].text;
				this.modalResult["value"] = selectBox.value;
				this.modalResult["result"] = true;
			}
			resolve();
		});

	};

	// -----------------------------------------------------------------------------

	ChainedSelect.prototype.ChainedSelect_onDoRemove = function(sender, e, ex)
	{

		return this.removeItem(e.detail.level);

	};

	// -----------------------------------------------------------------------------
	//	Methods
	// -----------------------------------------------------------------------------

	/**
	 *  Get the specified level select element.
	 *
	 * @param	{Number}		level				Level to retrieve.
	 */
	ChainedSelect.prototype.getSelect = function(level)
	{

		return this.querySelector(":scope [data-level='" + level + "'] " + this.rootNodes["select"]);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Assign objects to a select element.
	 *
	 * @param	{Number}		level				Level.
	 * @param	{Object}		parentObject		Parent object.
	 */
	ChainedSelect.prototype.assignItems = function(level, items)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope [data-level='" + level + "'] > select");
		BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

		items = items || {};

		if (Array.isArray(items))
		{
			// items is an array
			for (let i = 0; i < items.length; i++)
			{
				let item = document.createElement("option");
				if (typeof(items[i] === "object"))
				{
					item.value = BM.Util.safeGet(items[i], "value", items[i]);
					item.text = BM.Util.safeGet(items[i], "text", items[i]);
					let css = BM.Util.safeGet(items[i], "css");
					if (css) {
						Object.keys(css).forEach((style) => {
							item.css[style] = css[style];
						});
					}
				}
				else
				{
					item.value = items[i];
					item.text = items[i];
				}
				selectBox.add(item);
			}
		}
		else
		{
			// items is an object
			Object.keys(items).forEach((key) => {
				let item = document.createElement("option");
				item.value = BM.Util.safeGet(items[key], "value", key);
				item.text = BM.Util.safeGet(items[key], "text", key);
				let css = BM.Util.safeGet(items[key], "css");
				if (css) {
					Object.keys(css).forEach((style) => {
						item.css[style] = css[style];
					});
				}
				selectBox.add(item);
			});
		}

		selectBox.value = "";

		this._initElement("select", level, true);
		this._initElement("newitem", level, true);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Select an item.
	 *
	 * @param	{Number}		level				Level.
	 * @param	{String}		itemId				Item id.
	 */
	ChainedSelect.prototype.selectItem = function(level, itemId)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
		BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

		selectBox.value = itemId;

		this._initElement("edititem", level, true);
		this._initElement("removeitem", level, true);

		// Clear children
		this.clear({"fromLevel":parseInt(level) + 1, "toLevel":this.length});

		// Refresh the child select element
		return Promise.resolve().then(() => {
			level++;
			let nextSelectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
			if (nextSelectBox) {
				this._initElement("newitem", level);
				return this.refresh({"level":level, "value":itemId});
			}
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Create a new item.
	 *
	 * @param	{Number}		level				Level.
	 * @param	{String}		itemName			Item name set as select's text.
	 * @param	{String}		itemId				Item id set as select's value.
	 */
	ChainedSelect.prototype.newItem = function(level, itemName, itemId)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
		BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

		// Backup current index since it changes after an option is added when select has no option.
		let curIndex = selectBox.selectedIndex;

		let item = document.createElement("option");
		item.value = (itemId ? itemId : itemName);
		item.text = itemName;
		selectBox.add(item);

		// Restore index
		selectBox.selectedIndex = curIndex;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Edit an item.
	 *
	 * @param	{Number}		level				Level.
	 * @param	{String}		itemName			Item name set as select's text.
	 * @param	{String}		itemId				Item id set as select's value.
	 */
	ChainedSelect.prototype.editItem = function(level, itemName, itemId)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
		BM.Util.assert(selectBox, `ChainedSelect.editItem(): select not found. name=${this.name}, level=${level}`);

		// Edit the selectbox
		selectBox.options[selectBox.selectedIndex].text = itemName;
		selectBox.options[selectBox.selectedIndex].value = (itemId ? itemId : itemName);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Remove an item.
	 *
	 * @param	{Number}		level				Level.
	 */
	ChainedSelect.prototype.removeItem = function(level)
	{

		// Prerequisite check
		let selectBox = this.querySelector(":scope .item[data-level='" + level + "'] select");
		BM.Util.assert(selectBox, `ChainedSelect.removeItem(): select not found. name=${this.name}, level=${level}`);

		// Remove from the select element
		selectBox.remove(selectBox.selectedIndex);
		selectBox.value = "";
		this._initElement("edititem", level);
		this._initElement("removeitem", level);

		// Reset children select elements
		this.clear({"fromLevel":parseInt(level) + 1, "toLevel":this.length});

	};

	// -----------------------------------------------------------------------------
	//	Protected
	// -----------------------------------------------------------------------------

	/**
	 * Init an element.
	 *
	 * @param	{String}		type				CSS Selector of the element to init.
	 * @param	{Number}		level				Level.
	 * @param	{Boolean}		enable				Enable an element when true. Disable otherwise.
	 */
	ChainedSelect.prototype._initElement = function(type, level, enable)
	{

		type = this.rootNodes[type];

		if (enable)
		{
			this.querySelector(":scope .item[data-level='" + level + "'] " + type).disabled = false;
			this.querySelector(":scope .item[data-level='" + level + "'] " + type).classList.remove("disabled");
		}
		else
		{
			this.querySelector(":scope .item[data-level='" + level + "'] " + type).disabled = true;
			this.querySelector(":scope .item[data-level='" + level + "'] " + type).classList.add("disabled");
		}

	};

	// =============================================================================

	// =============================================================================
	//	Tab Index Class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function TabIndex(settings)
	{

		return Reflect.construct(BM.Component, [settings], this.constructor);

	}

	BM.ClassUtil.inherit(TabIndex, BM.Component);

	// -----------------------------------------------------------------------------
	//	Settings
	// -----------------------------------------------------------------------------

	TabIndex.prototype._getSettings = function()
	{

		return {
			// Settings
			"settings": {
				"autoTransform":		false,
				"name":					"BmTabindex",
			},

			// Events
			"events": {
				"tab-indices": {
					"rootNode": 		"[data-tabindex]",
					"handlers": {
						"click": 		["TabIndex_onTabIndexClick"]
					}
				},
			},
		}

	};

	// -----------------------------------------------------------------------------
	//	Event Handlers
	// -----------------------------------------------------------------------------

	TabIndex.prototype.TabIndex_onTabIndexClick = function(sender, e, ex)
	{

		if (sender.classList.contains("active")) {
			return;
		}

		this.switchIndex(sender.getAttribute("data-tabindex"));

	};

	// -----------------------------------------------------------------------------
	//	Methods
	// -----------------------------------------------------------------------------

	/**
	 * Switch to the specified index.
	 *
	 * @param	{String}		index				Index.
	 */
	TabIndex.prototype.switchIndex = function(index)
	{

		this.querySelector(":scope [data-tabindex].active").classList.remove("active");
		let tabIndex = this.querySelector(":scope [data-tabindex='" + index + "']");
		tabIndex.classList.add("active");

		let container = document.querySelector(this.getAttribute("data-pair"));
		if (container) {
			container.switchContent(index);
		} else {
			console.log("@@@no pair");
		}

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get a current active index.
	 *
	 * @return  {HTMLElement}	Current active element.
	 */
	TabIndex.prototype.getActiveIndex = function()
	{

		return this.querySelector(":scope .active");

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-tabindex", TabIndex);

	// =============================================================================

	// =============================================================================
	//	Tab Content Class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function TabContent(settings)
	{

		return Reflect.construct(BM.Component, [settings], this.constructor);

	}

	BM.ClassUtil.inherit(TabContent, BM.Component);

	// -----------------------------------------------------------------------------
	//	Settings
	// -----------------------------------------------------------------------------

	TabContent.prototype._getSettings = function()
	{

		return {
			// Settings
			"settings": {
				"autoTransform":		false,
				"name":					"BmTabcontent",
			},
		}

	};

	// -----------------------------------------------------------------------------
	//	Methods
	// -----------------------------------------------------------------------------

	/**
	 * Switch to the specified content.
	 *
	 * @param	{String}		index				Index.
	 */
	TabContent.prototype.switchContent = function(index)
	{

		// Deactivate current active content
		this.querySelector(":scope > .active").classList.remove("active");

		// Activate specified content
		this.querySelector(":scope > [data-tabindex='" + index + "']").classList.add("active");
		this.querySelector(":scope > [data-tabindex='" + index + "']").focus();
	//		this.querySelector(":scope nth-child(" + index + ")").classList.add("active");
	//		this.querySelector(":scope > [data-index='" + index + "']").focus();

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get a current active content.
	 *
	 * @return  {HTMLElement}	Current active element.
	 */
	TabContent.prototype.getActiveContent = function()
	{

		return this.querySelector(":scope .active");

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-tabcontent", TabContent);

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

	BM.ClassUtil.inherit(TagLoader, BM.Component);

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
		settings = ( settings ? BM.Util.deepMerge(defaults, settings) : defaults );

		// super()
		return BM.Component.prototype.start.call(this, settings).then(() => {
			if (document.readyState !== "loading")
			{
				BM.LoaderOrganizer.load(document.body, this.settings);
			}
			else
			{
				document.addEventListener("DOMContentLoaded", () => {
					BM.LoaderOrganizer.load(document.body, this.settings);
				});
			}
		});

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-tagloader", TagLoader);

	// =============================================================================

	// =============================================================================
	//	Setting Server Class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function SettingServer()
	{

		// super()
		return Reflect.construct(HTMLElement, [], this.constructor);

	}

	BM.ClassUtil.inherit(SettingServer, BM.Component);

	// -----------------------------------------------------------------------------

	/**
	 * Get component settings.
	 *
	 * @return  {Object}		Options.
	 */
	SettingServer.prototype._getSettings = function()
	{

		return {
			"settings": {
				"name":					"SettingServer",
				"autoSetup":			false,
			}
		};

	};

	// -----------------------------------------------------------------------------

	customElements.define("bm-setting", SettingServer);

	// =============================================================================

	// =============================================================================
	//	Preference Server Class
	// =============================================================================

	// -----------------------------------------------------------------------------
	//  Constructor
	// -----------------------------------------------------------------------------

	/**
	 * Constructor.
	 */
	function PreferenceServer(settings)
	{

		return Reflect.construct(BM.Component, [settings], this.constructor);

	}

	BM.ClassUtil.inherit(PreferenceServer, BM.Component);

	// -----------------------------------------------------------------------------
	//	Settings
	// -----------------------------------------------------------------------------

	/**
	 * Get component settings.
	 *
	 * @return  {Object}		Options.
	 */
	PreferenceServer.prototype._getSettings = function()
	{

		return {
			// Settings
			"settings": {
				"autoClear":				false,
				"autoFill":					false,
				"autoTransform":			false,
				"name":						"PreferenceServer",
			},

			// Events
			"events": {
				"this": {
					"handlers": {
						"beforeStart":		["PreferenceServer_onBeforeStart"],
						"doFetch":			["PreferenceServer_onDoFetch"],
						"beforeSubmit":		["PreferenceServer_onBeforeSubmit"]
					}
				}
			},

			// Forms
			"forms": {
				"settings": {
					"autoValidate":			false,
					"autoCollect":			false,
				}
			}
		}

	};

	// -----------------------------------------------------------------------------
	//  Event Handlers
	// -----------------------------------------------------------------------------

	PreferenceServer.prototype.PreferenceServer_onBeforeStart = function(sender, e, ex)
	{

		this._defaults = new BM.ChainableStore();
		this._store = new ObservableStore({"chain":this._defaults, "filter":this._filter, "async":true});

	};

	// -----------------------------------------------------------------------------

	PreferenceServer.prototype.PreferenceServer_onDoFetch = function(sender, e, ex)
	{

		// Set default preferences
		if (this.settings.get("defaults.preferences"))
		{
			this._defaults.items = this.settings.get("defaults.preferences");
		}

		// Load preferences
		return this.resources["preferences"].get().then((preferences) => {
			this._store.merge(preferences);
			this.items = this._store.items;
		});

	};

	// -----------------------------------------------------------------------------

	PreferenceServer.prototype.PreferenceServer_onBeforeSubmit = function(sender, e, ex)
	{

		this._store.set("", e.detail.items, e.detail.options, ...e.detail.args);

		// Pass items to the latter event handlers
		e.detail.items = this._store.items;

	};

	// -----------------------------------------------------------------------------
	//  Methods
	// -----------------------------------------------------------------------------

	PreferenceServer.prototype.subscribe = function(component, options)
	{

		this._store.subscribe(
			component.name + "_" + component.uniqueId,
			this._triggerEvent.bind(component),
			options,
		);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get a value from store. Return default value when specified key is not available.
	 *
	 * @param	{String}		key					Key to get.
	 * @param	{Object}		defaultValue		Value returned when key is not found.
	 *
	 * @return  {*}				Value.
	 */
	PreferenceServer.prototype.get = function(key, defaultValue)
	{

		return this._store.get(key, defaultValue);

	};

	// -------------------------------------------------------------------------

	/**
	 * Set a value to the store.
	 *
	 * @param	{Object}		values				Values to store.
	 * @param	{Object}		options				Options.
	 */
	PreferenceServer.prototype.set = function(values, options, ...args)
	{

		return this.submit({"items":values, "options":options, "args":args});

	};

	// -----------------------------------------------------------------------------
	//  Privates
	// -----------------------------------------------------------------------------

	/**
	 * Trigger preference changed events.
	 *
	 * @param	{Object}		items				Changed items.
	 *
	 * @return  {Promise}		Promise.
	 */
	PreferenceServer.prototype._triggerEvent = function(items, options)
	{

		let eventName = this.settings.get("preferences.settings.eventName", "doSetup");
		let sender = BM.Util.safeGet(options, "sender");

		return this.trigger(eventName, {"sender":sender, "items":items});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Check if it is a target.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Object}		observerInfo		Observer info.
	 */
	PreferenceServer.prototype._filter = function(conditions, observerInfo, ...args)
	{

		let result = false;
		let target = observerInfo["options"]["targets"];

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

	};

	// ----------------------------------------------------------------------------

	customElements.define("bm-preference", PreferenceServer);

	// =============================================================================
	window.BITSMIST.v1.ObservableStore = ObservableStore;
	window.BITSMIST.v1.BindableStore = BindableStore;
	BM.OrganizerOrganizer.register(FileOrganizer);
	BM.OrganizerOrganizer.register(ErrorOrganizer);
	BM.OrganizerOrganizer.register(ElementOrganizer);
	BM.OrganizerOrganizer.register(ResourceOrganizer);
	BM.OrganizerOrganizer.register(ValidationOrganizer);
	BM.OrganizerOrganizer.register(FormOrganizer);
	BM.OrganizerOrganizer.register(ListOrganizer);
	BM.OrganizerOrganizer.register(DatabindingOrganizer);
	BM.OrganizerOrganizer.register(PluginOrganizer);
	BM.OrganizerOrganizer.register(KeyOrganizer);
	BM.OrganizerOrganizer.register(ChainOrganizer);
	BM.OrganizerOrganizer.register(DialogOrganizer);
	BM.OrganizerOrganizer.register(PreferenceOrganizer);
	BM.OrganizerOrganizer.register(RouteOrganizer);
	window.BITSMIST.v1.Plugin = Plugin;
	window.BITSMIST.v1.CookieResourceHandler = CookieResourceHandler;
	window.BITSMIST.v1.ApiResourceHandler = ApiResourceHandler;
	window.BITSMIST.v1.ObjectResourceHandler = ObjectResourceHandler;
	window.BITSMIST.v1.LinkedResourceHandler = LinkedResourceHandler;
	window.BITSMIST.v1.WebstorageResourceHandler = WebstorageResourceHandler;
	window.BITSMIST.v1.ValidationHandler = ValidationHandler;
	window.BITSMIST.v1.HTML5FormValidationHandler = HTML5FormValidationHandler;
	window.BITSMIST.v1.ObjectValidationHandler = ObjectValidationHandler;
	window.BITSMIST.v1.FormatterUtil = FormatterUtil;
	window.BITSMIST.v1.ChainedSelect = ChainedSelect;
	window.BITSMIST.v1.BmTabindex  = TabIndex;
	window.BITSMIST.v1.BmTabcontent = TabContent;

})();
//# sourceMappingURL=bitsmist-js-extras_v1.js.map
