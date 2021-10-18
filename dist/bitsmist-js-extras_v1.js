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

	var ObservableStore = /*@__PURE__*/(function (superclass) {
		function ObservableStore(options)
		{


			var defaults = {"notifyOnChange":true, "async":false};
			superclass.call(this, Object.assign(defaults, options));

			this._filter;
			this._observers = [];

			this.filter = BITSMIST.v1.Util.safeGet(this._options, "filter", function () { return true; } );

		}

		if ( superclass ) ObservableStore.__proto__ = superclass;
		ObservableStore.prototype = Object.create( superclass && superclass.prototype );
		ObservableStore.prototype.constructor = ObservableStore;

		var prototypeAccessors = { filter: { configurable: true } };

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		/**
		 * Filter function.
		 *
		 * @type	{Function}
		 */
		prototypeAccessors.filter.get = function ()
		{

			return this._filter;

		};

		prototypeAccessors.filter.set = function (value)
		{

			BITSMIST.v1.Util.assert(typeof value === "function", ("Store.filter(setter): Filter is not a function. filter=" + value), TypeError);

			this._filter = value;

		};

		// -------------------------------------------------------------------------
		//  Method
		// -------------------------------------------------------------------------

		/**
		 * Set a value to the store and notify to subscribers if the value has been changed.
		 *
		 * @param	{String}		key					Key to store.
		 * @param	{Object}		value				Value to store.
		 */
		ObservableStore.prototype.set = function set (key, value, options)
		{

			var changedItem = {};
			var holder = ( key ? this.get(key) : this._items );

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

			var notify = BITSMIST.v1.Util.safeGet(options, "notifyOnChange", BITSMIST.v1.Util.safeGet(this._options, "notifyOnChange"));
			if (notify && Object.keys(changedItem).length > 0)
			{
				return this.notify(changedItem);
			}

		};

		// -----------------------------------------------------------------------------

	    /**
	     * Replace all values in the store.
	     *
	     * @param   {String}        key                 Key to store.
	     * @param   {Object}        value               Value to store.
	     */
	    ObservableStore.prototype.replace = function replace (value, options)
	    {

	        this._items = {};
	        this.__deepMerge(this._items, value);

	        var notify = BITSMIST.v1.Util.safeGet(options, "notifyOnChange", BITSMIST.v1.Util.safeGet(this._options, "notifyOnChange"));
	        if (notify)
	        {
	            return this.notify("*");
	        }

	    };

		// -----------------------------------------------------------------------------

		/**
		 * Subscribe to the store.
		 *
		 * @param	{String}		id					Subscriber's id.
		 * @param	{Function}		handler				Handler function on notification.
		 * @param	{Object}		optons				Options passed to the handler on notification.
		 */
		ObservableStore.prototype.subscribe = function subscribe (id, handler, options)
		{

			BITSMIST.v1.Util.assert(typeof handler === "function", ("ObservableStore.subscribe(): Notification handler is not a function. id=" + id), TypeError);

			this._observers.push({"id":id, "handler":handler, "options":options});

		};

		// -------------------------------------------------------------------------

		/**
		 * Unsubscribe from the store.
		 *
		 * @param	{String}		id					Subscriber's id.
		 */
		ObservableStore.prototype.unsubscribe = function unsubscribe (id)
		{

			for (var i = 0; i < this._observers.length; i++)
			{
				if (this._obvservers[i].id === id)
				{
					this._observers.splice(i, 1);
					break;
				}
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Notify dispacher. Call notifySync() or notifyAsync() according to the option.
		 *
		 * @param	{Object}		conditions			Current conditions.
		 * @param	{Object}		...args				Arguments to callback function.
		 *
		 * @return  {Promise}		Promise.
		 */
		ObservableStore.prototype.notify = function notify (conditions)
		{
			var ref, ref$1;

			var args = [], len = arguments.length - 1;
			while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

			if (BITSMIST.v1.Util.safeGet(this._options, "async", false))
			{
				return (ref = this).notifyAsync.apply(ref, [ conditions ].concat( args ));
			}
			else
			{
				return (ref$1 = this).notifySync.apply(ref$1, [ conditions ].concat( args ));
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Notify observers.
		 *
		 * @param	{Object}		conditions			Current conditions.
		 * @param	{Object}		...args				Arguments to callback function.
		 *
		 * @return  {Promise}		Promise.
		 */
		ObservableStore.prototype.notifySync = function notifySync (conditions)
		{
			var this$1$1 = this;
			var args = [], len = arguments.length - 1;
			while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];


			var chain = Promise.resolve();

			var loop = function ( i ) {
				chain = chain.then(function () {
					var ref, ref$1;

					if ((ref = this$1$1)._filter.apply(ref, [ conditions, this$1$1._observers[i] ].concat( args )))
					{
						console.debug(("ObservableStore.notifySync(): Notifying. conditions=" + conditions + ", observer=" + (this$1$1._observers[i].id)));
						return (ref$1 = this$1$1._observers[i])["handler"].apply(ref$1, [ conditions ].concat( args ));
					}
				});
			};

			for (var i = 0; i < this$1$1._observers.length; i++)
			loop( i );

			return chain;

		};

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
		ObservableStore.prototype.notifyAsync = function notifyAsync (conditions)
		{
			var ref, ref$1;

			var args = [], len = arguments.length - 1;
			while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

			for (var i = 0; i < this._observers.length; i++)
			{
				if ((ref = this)._filter.apply(ref, [ conditions, this._observers[i]["options"] ].concat( args )))
				{
					console.debug(("ObservableStore.notifyAsync(): Notifying asynchronously. conditions=" + conditions + ", observer=" + (this._observers[i].id)));
					(ref$1 = this._observers[i])["handler"].apply(ref$1, [ conditions ].concat( args ));
				}
			}

			return Promise.resolve();

		};

		// -------------------------------------------------------------------------

		/**
		 * Mute notification.
		 */
		ObservableStore.prototype.mute = function mute ()
		{

			this._options["notifyOnChange"] = false;

		};

		// -------------------------------------------------------------------------

		/**
		 * Unmute notification.
		 */
		ObservableStore.prototype.unmute = function unmute ()
		{

			this._options["notifyOnChange"] = true;

		};

		// -------------------------------------------------------------------------

		/**
		 * Deep merge two objects.
		 *
		 * @param	{Object}		obj1					Object1.
		 * @param	{Object}		obj2					Object2.
		 *
		 * @return  {Object}		Merged array.
		 */
		ObservableStore.prototype.__deepMerge = function __deepMerge (obj1, obj2, changedItem)
		{

			changedItem = changedItem || {};

			BITSMIST.v1.Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", "ObservableStore.__deepMerge(): Parameters must be an object.", TypeError);

			Object.keys(obj2).forEach(function (key) {
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

		};

		Object.defineProperties( ObservableStore.prototype, prototypeAccessors );

		return ObservableStore;
	}(BITSMIST.v1.ChainableStore));

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

		var ret = value;

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

		var ret = value;

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
	 * Fill the form.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 * @param	{Ojbect}		item				Values to fill.
	 * @param	{Object}		masters				Master values.
	 * @param	{Object}		options				Options.
	 */
	FormUtil.setFields = function(rootNode, item, options)
	{


		var masters = BITSMIST.v1.Util.safeGet(options, "masters");
		var triggerEvent = BITSMIST.v1.Util.safeGet(options, "triggerEvent");

		// Get elements with bm-bind attribute
		var elements = BITSMIST.v1.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		elements.push(rootNode);

		elements.forEach(function (element) {
			var fieldName = element.getAttribute("bm-bind");
			if (fieldName in item)
			{
				var value = item[fieldName] || "";

				// Get master value
				if (element.hasAttribute("bm-bindtext"))
				{
					var arr = element.getAttribute("bm-bindtext").split(".");
					var type = arr[0];
					var field = arr[1] || "";
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
					var e = document.createEvent("HTMLEvents");
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

		var item = {};

		// Get elements with bm-bind attribute
		var elements = BITSMIST.v1.Util.scopedSelectorAll(rootNode, "[bm-bind]");
		elements.push(rootNode);

		elements.forEach(function (element) {
			// Get a value from the element
			var key = element.getAttribute("bm-bind");
			var value = FormUtil.getValue(element);

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
					var items = [];
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
		var elements = BITSMIST.v1.Util.scopedSelectorAll(rootNode, target + " input");

		elements.forEach(function (element) {
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
		elements.forEach(function (element) {
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
		var targets = element.getAttribute("bm-target");
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

		var ret = undefined;

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

		element.options.length = 0;

		if ("emptyItem" in options)
		{
			var text = ( "text" in options["emptyItem"] ? options["emptyItem"]["text"] : "");
			var value = ( "value" in options["emptyItem"] ? options["emptyItem"]["value"] : "");
			var option = document.createElement("option");
			option.text = text;
			option.value = value;
			option.setAttribute("selected", "");
			element.appendChild(option);
		}

		Object.keys(items).forEach(function (id) {
			var option = document.createElement("option");

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

		Object.keys(item.items).forEach(function (id) {
			var label = document.createElement("label");
			var option = document.createElement("input");
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

		var items = targets.split(",");
		for (var i = 0; i < items.length; i++)
		{
			var item = items[i].toLowerCase();
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
				var attr = element.getAttribute(item);
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

		var ret = code;

		if (masters && (type in masters))
		{
			var item = masters[type].getItem(code);
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

	var BindableStore = /*@__PURE__*/(function (ObservableStore) {
		function BindableStore(options)
		{

			ObservableStore.call(this, options);

			this.filter = function (conditions, observerInfo) {
				var args = [], len = arguments.length - 2;
				while ( len-- > 0 ) args[ len ] = arguments[ len + 2 ];

				var ret = false;
				if (conditions === "*" || conditions.indexOf(observerInfo.id) > -1)
				{
					ret = true;
				}
				return ret;
			};

		}

		if ( ObservableStore ) BindableStore.__proto__ = ObservableStore;
		BindableStore.prototype = Object.create( ObservableStore && ObservableStore.prototype );
		BindableStore.prototype.constructor = BindableStore;

		// -------------------------------------------------------------------------
		//  Method
		// -------------------------------------------------------------------------

		/**
		 * Bind the store to a element.
		 *
		 * @param	{Element}		elem				HTML Element.
		 * @param	{String}		key					Key to store.
		 */
		BindableStore.prototype.bindTo = function bindTo (elem)
		{
			var this$1$1 = this;


			var key = elem.getAttribute("bm-bind");

			// Init element's value
	//		FormUtil.setValue(elem, this.get(key));

			var bound = ( elem.__bm_bindinfo && elem.__bm_bindinfo.bound ? true : false );
			if (!bound && BITSMIST.v1.Util.safeGet(this._options, "2way", true))
			{
				// Change element's value when store value changed
				this.subscribe(key, function () {
					FormUtil.setValue(elem, this$1$1.get(key));
				});

				// Set store value when element's value changed
				var eventName = BITSMIST.v1.Util.safeGet(this._options, "eventName", "change");
				elem.addEventListener(eventName, (function () {
					this$1$1.set(key, FormUtil.getValue(elem), {"notifyOnChange":false});
				}).bind(this));

				elem.__bm_bindinfo = { "bound": true };
			}

		};

		return BindableStore;
	}(ObservableStore));

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

	var FileOrganizer = /*@__PURE__*/(function (superclass) {
		function FileOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) FileOrganizer.__proto__ = superclass;
		FileOrganizer.prototype = Object.create( superclass && superclass.prototype );
		FileOrganizer.prototype.constructor = FileOrganizer;

		FileOrganizer.organize = function organize (conditions, component, settings)
		{

			var promises = [];

			var files = settings["files"];
			if (files)
			{
				Object.keys(files).forEach(function (fileName) {
					promises.push(BITSMIST.v1.AjaxUtil.loadScript(files[fileName]["href"]));
				});
			}

			return Promise.all(promises);

		};

		return FileOrganizer;
	}(BITSMIST.v1.Organizer));

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

	var ErrorOrganizer = /*@__PURE__*/(function (superclass) {
		function ErrorOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) ErrorOrganizer.__proto__ = superclass;
		ErrorOrganizer.prototype = Object.create( superclass && superclass.prototype );
		ErrorOrganizer.prototype.constructor = ErrorOrganizer;

		ErrorOrganizer.globalInit = function globalInit ()
		{

			ErrorOrganizer._observers = new BITSMIST.v1.ObservableStore({"filter":ErrorOrganizer.__filter});

			// Install error listner
			document.addEventListener("DOMContentLoaded", function () {
				if (BITSMIST.v1.settings.get("organizers.ErrorOrganizer.settings.captureError", true))
				{
					ErrorOrganizer.__initErrorListeners();
				}
			});

		};

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
		ErrorOrganizer.organize = function organize (conditions, component, settings)
		{

			var errors = settings["errors"];
			if (errors)
			{
				ErrorOrganizer._observers.subscribe(component.uniqueId, component.trigger.bind(component), {"component":component});
			}

		};

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
		ErrorOrganizer.__filter = function __filter (conditions, options, e)
		{

			var result = false;
			var targets = options["component"].settings.get("errors.targets");

			for (var i = 0; i < targets.length; i++)
			{
				if (e.error.name === targets[i] || targets[i] === "*")
				{
					result = true;
					break;
				}
			}

			return result;

		};

		// -------------------------------------------------------------------------

		/**
		* Init error handling listeners.
		*/
		ErrorOrganizer.__initErrorListeners = function __initErrorListeners ()
		{

			window.addEventListener("unhandledrejection", function (error) {
				var e = {};

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

			window.addEventListener("error", function (error, file, line, col) {
				var e = {};

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

		};

		// -------------------------------------------------------------------------

		/**
		* Get an error name for the given error object.
		*
		* @param	{Object}		error				Error object.
		*
		* @return  {String}			Error name.
		*/
		ErrorOrganizer.__getErrorName = function __getErrorName (error)
		{

			var name;
			var e;

			if (error.reason instanceof XMLHttpRequest)		{ e = error.reason; }
			else if (error.reason)	{ e = error.reason; }
			else if (error.error)	{ e = error.error; }
			else					{ e = error.message; }

			if (e.name)									{ name = e.name; }
			else if (e instanceof TypeError)			{ name = "TypeError"; }
			else if (e instanceof XMLHttpRequest)		{ name = "AjaxError"; }
			else if (e instanceof EvalError)			{ name = "EvalError"; }
		//	else if (e instanceof InternalError)		name = "InternalError";
			else if (e instanceof RangeError)			{ name = "RangeError"; }
			else if (e instanceof ReferenceError)		{ name = "ReferenceError"; }
			else if (e instanceof SyntaxError)			{ name = "SyntaxError"; }
			else if (e instanceof URIError)				{ name = "URIError"; }
			else
			{
				var pos = e.indexOf(":");
				if (pos > -1)
				{
					name = e.substring(0, pos);
				}
			}

			return name;

		};

		// -------------------------------------------------------------------------

		/**
		* Handle an exeption.
		*
		* @param	{Object}		e					Error object.
		*/
		ErrorOrganizer.__handleException = function __handleException (e)
		{

			return ErrorOrganizer._observers.notifyAsync("error", {"sender":ErrorOrganizer, "error": e});

		};

		return ErrorOrganizer;
	}(BITSMIST.v1.Organizer));

	// =============================================================================

	// =============================================================================
	//	Element organizer class
	// =============================================================================

	var ElementOrganizer = /*@__PURE__*/(function (superclass) {
		function ElementOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) ElementOrganizer.__proto__ = superclass;
		ElementOrganizer.prototype = Object.create( superclass && superclass.prototype );
		ElementOrganizer.prototype.constructor = ElementOrganizer;

		ElementOrganizer.organize = function organize (conditions, component, settings)
		{

			var elements = settings["elements"];
			if (elements)
			{
				Object.keys(elements).forEach(function (eventName) {
					component.addEventHandler(eventName, {"handler":ElementOrganizer.onDoOrganize, "options":{"attrs":elements[eventName]}});
				});
			}

		};

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
		ElementOrganizer.onDoOrganize = function onDoOrganize (sender, e, ex)
		{

			var component = ex.component;
			var settings = ex.options["attrs"];

			Object.keys(settings).forEach(function (elementName) {
				ElementOrganizer.__initAttr(component, elementName, settings[elementName]);
			});

		};

		// -------------------------------------------------------------------------
		//  Private
		// -------------------------------------------------------------------------

		ElementOrganizer.__getTargetElements = function __getTargetElements (component, elementName, elementInfo)
		{

			var elements;

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

		};

		// -------------------------------------------------------------------------


		/**
		 * Init attributes.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		elementName			Element name.
		 * @param	{Object}		elementInfo			Element info.
		 */
		ElementOrganizer.__initAttr = function __initAttr (component, elementName, elementInfo)
		{

			if (elementInfo)
			{
				var elements = ElementOrganizer.__getTargetElements(component, elementName, elementInfo);
				var loop = function ( i ) {
					Object.keys(elementInfo).forEach(function (key) {
						switch (key)
						{
							case "build":
								var resourceName = elementInfo[key]["resourceName"];
								FormUtil.build(elements[i], component.resources[resourceName].items, elementInfo[key]);
								break;
							case "attribute":
								Object.keys(elementInfo[key]).forEach(function (attrName) {
									elements[i].setAttribute(attrName, elementInfo[key][attrName]);
								});
								break;
							case "style":
								Object.keys(elementInfo[key]).forEach(function (styleName) {
									elements[i].style[styleName] = elementInfo[key][styleName];
								});
								break;
							case "property":
								Object.keys(elementInfo[key]).forEach(function (propertyName) {
									elements[i][propertyName] = elementInfo[key][propertyName];
								});
								break;
							case "autoFocus":
								elements[i].focus();
								break;
						}
					});
				};

				for (var i = 0; i < elements.length; i++)
				loop( i );
			}

		};

		return ElementOrganizer;
	}(BITSMIST.v1.Organizer));

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

	var ResourceOrganizer = /*@__PURE__*/(function (superclass) {
		function ResourceOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) ResourceOrganizer.__proto__ = superclass;
		ResourceOrganizer.prototype = Object.create( superclass && superclass.prototype );
		ResourceOrganizer.prototype.constructor = ResourceOrganizer;

		ResourceOrganizer.init = function init (component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'resources', {
				get: function get() { return this._resources; },
			});

			// Add methods
			component.addResource = function(resourceName, options, ajaxSettings) { return ResourceOrganizer._addResource(this, resourceName, options); };
			component.switchResource = function(resourceName) { return ResourceOrganizer._switchResource(this, resourceName); };

			// Init vars
			component._resources = {};

		};

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
		ResourceOrganizer.organize = function organize (conditions, component, settings)
		{

			var promises = [];

			switch (conditions)
			{
				case "beforeStart":
				case "afterSpecLoad":
					var resources = settings["resources"];
					if (resources)
					{
						Object.keys(resources).forEach(function (resourceName) {
							// Add resource
							var resource = ResourceOrganizer._addResource(component, resourceName, resources[resourceName]);

							// Load data
							if (resource.options.get("autoLoad"))
							{
								var id = resource.options.get("autoLoad.id");
								var paramters = resource.options.get("autoLoad.parameters");

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

		};

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
		ResourceOrganizer._addResource = function _addResource (component, resourceName, options)
		{

			var resource;

			if (options["handlerClassName"])
			{
				resource = BITSMIST.v1.ClassUtil.createObject(options["handlerClassName"], component, resourceName, options);
				component._resources[resourceName] = resource;
			}

			return resource;

		};

		// -------------------------------------------------------------------------

		/**
	     * Switch to another resource.
	     *
	     * @param	{string}		resourceName		Resource name.
	     */
		ResourceOrganizer._switchResource = function _switchResource (resourceName)
		{

			this._defaultResource = this._resources[resourceName];

		};

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Do fetch event handler.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{Object}		options					Options
		 */
		ResourceOrganizer.doFetch = function doFetch (component, options)
		{

			var promises = [];
			var resources = ResourceOrganizer.__getTargetResources(component, options, "autoFetch");

			for (var i = 0; i < resources.length; i++)
			{
				var resourceName = resources[i];
				var id = BITSMIST.v1.Util.safeGet(options, "id", component._resources[resourceName].target["id"]);
				var parameters = BITSMIST.v1.Util.safeGet(options, "parameters", component._resources[resourceName].target["parameters"]);
				component._resources[resourceName].target["id"] = id;
				component._resources[resourceName].target["parameters"] = parameters;

				promises.push(component._resources[resourceName].get(id, parameters));
			}

			return Promise.all(promises);

		};

		// -------------------------------------------------------------------------

		/**
		 * Do submit event handler.
		 *
		 * @param	{Component}		component				Component.
		 * @param	{Object}		options					Options
		 */
		ResourceOrganizer.doSubmit = function doSubmit (component, options)
		{

			var promises = [];
			var submitItem = {};
			var resources = ResourceOrganizer.__getTargetResources(component, options, "autoSubmit");

			// Get target keys to submit
			var nodes = component.querySelectorAll("[bm-submit]");
			nodes = Array.prototype.slice.call(nodes, 0);
			nodes.forEach(function (elem) {
				var key = elem.getAttribute("bm-bind");
				submitItem[key] = component.item[key];
			});

			for (var i = 0; i < resources.length; i++)
			{
				var resourceName = resources[i];
				var method = BITSMIST.v1.Util.safeGet(options, "method", component._resources[resourceName].target["method"] || "put"); // Default is "put"
				var id = BITSMIST.v1.Util.safeGet(options, "id", component._resources[resourceName].target["id"]);
				var parameters = BITSMIST.v1.Util.safeGet(options, "parameters", component._resources[resourceName].target["parameters"]);

				promises.push(component._resources[resourceName][method](id, submitItem, parameters));
			}

			return Promise.all(promises);

		};

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
		ResourceOrganizer.__getTargetResources = function __getTargetResources (component, options, target)
		{

			var resources = BITSMIST.v1.Util.safeGet(options, target, component.settings.get("settings." + target, []));

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

		};

		return ResourceOrganizer;
	}(BITSMIST.v1.Organizer));

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

	var ValidationOrganizer = /*@__PURE__*/(function (superclass) {
		function ValidationOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) ValidationOrganizer.__proto__ = superclass;
		ValidationOrganizer.prototype = Object.create( superclass && superclass.prototype );
		ValidationOrganizer.prototype.constructor = ValidationOrganizer;

		ValidationOrganizer.init = function init (component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'validators', {
				get: function get() { return this._validators; },
			});
			Object.defineProperty(component, 'validationResult', {
				get: function get() { return this._validationResult; },
			});

			// Add methods
			component.addValidator = function(validatorName, options) { return ValidationOrganizer._addValidator(this, validatorName, options); };

			// Init vars
			component._validators = {};
			component._validationResult = {};

		};

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
		ValidationOrganizer.organize = function organize (conditions, component, settings)
		{

			switch (conditions)
			{
			case "doCheckValidity":
			case "doReportValidity":
				var validationName = settings["validationName"];
	//			BITSMIST.v1.Util.warn(validationName, `ValidationOrganizer.organize(): Validator not specified. name=${component.name}`);

				if (validationName)
				{
					var item = BITSMIST.v1.Util.safeGet(settings, "item");
					var rules = component.settings.get("validations." + validationName + ".rules");
					var options = component.settings.get("validations." + validationName + ".handlerOptions");
					var method = (conditions === "doCheckValidity" ? "checkValidity" : "reportValidity" );

					BITSMIST.v1.Util.assert(component._validators[validationName], ("ValidationOrganizer.organize(): Validator not found. name=" + (component.name) + ", validationName=" + validationName));
					component._validators[validationName][method](item, rules, options);
				}
				break;
			default:
				var validations = settings["validations"];
				if (validations)
				{
					Object.keys(validations).forEach(function (validatorName) {
						ValidationOrganizer._addValidator(component, validatorName, validations[validatorName]);
					});
				}
				break;
			}

		};

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
		ValidationOrganizer._addValidator = function _addValidator (component, validatorName, options)
		{

			var validator;

			if (options["handlerClassName"])
			{
				validator = BITSMIST.v1.ClassUtil.createObject(options["handlerClassName"], component, validatorName, options);
				component._validators[validatorName] = validator;
			}

			return validator;

		};

		return ValidationOrganizer;
	}(BITSMIST.v1.Organizer));

	// =============================================================================

	// =============================================================================
	//	Databinding organizer class
	// =============================================================================

	var DatabindingOrganizer = /*@__PURE__*/(function (superclass) {
		function DatabindingOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) DatabindingOrganizer.__proto__ = superclass;
		DatabindingOrganizer.prototype = Object.create( superclass && superclass.prototype );
		DatabindingOrganizer.prototype.constructor = DatabindingOrganizer;

		DatabindingOrganizer.init = function init (component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'binds', {
				get: function get() { return this._binds; },
				set: function set(newValue) {
					DatabindingOrganizer.update(this, newValue);
				},
			});

			// Add methods
			component.bindData = function(data) { return DatabindingOrganizer._bindData(this, data); };
			component.update = function(data) { return DatabindingOrganizer._update(this, data); };

			// Init vars
			component._binds = new BindableStore();

		};

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
		DatabindingOrganizer.organize = function organize (conditions, component, settings)
		{

			switch (conditions)
			{
				case "afterAppend":
					DatabindingOrganizer._bindData(component);
					break;
				case "afterFetch":
					var bindings = settings["bindings"];
					if (bindings)
					{

						DatabindingOrganizer.setResource(component, bindings);
					}
					break;
			}

		};

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
		DatabindingOrganizer.setResource = function setResource (component, settings)
		{

			var resourceName = settings["resourceName"];

			component._binds.replace(component.resources[resourceName].item);

		};

		// -------------------------------------------------------------------------

		/**
		 * Update bindings.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{HTMLElement}	rootNode			Root node.
		 */
		DatabindingOrganizer.update = function update (component, data)
		{

			component._binds.items = data;

			// Bind data to elements
			DatabindingOrganizer._bindData(component);

		};

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Bind data and elemnets.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{HTMLElement}	rootNode			Root node.
		 */
		DatabindingOrganizer._bindData = function _bindData (component, rootNode)
		{

			rootNode = ( rootNode ? rootNode : component );

			var nodes = rootNode.querySelectorAll("[bm-bind]");
			nodes = Array.prototype.slice.call(nodes, 0);
			nodes.forEach(function (elem) {
				component._binds.bindTo(elem);
			});

		};

		return DatabindingOrganizer;
	}(BITSMIST.v1.Organizer));

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

	var PluginOrganizer = /*@__PURE__*/(function (superclass) {
		function PluginOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) PluginOrganizer.__proto__ = superclass;
		PluginOrganizer.prototype = Object.create( superclass && superclass.prototype );
		PluginOrganizer.prototype.constructor = PluginOrganizer;

		PluginOrganizer.init = function init (component, settings)
		{

			// Init vars
			component._plugins = {};

		};

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
		PluginOrganizer.organize = function organize (conditions, component, settings)
		{

			var plugins = settings["plugins"];
			if (plugins)
			{
				Object.keys(plugins).forEach(function (pluginName) {
					PluginOrganizer._addPlugin(component, pluginName, plugins[pluginName]);
				});
			}

		};

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
		PluginOrganizer._addPlugin = function _addPlugin (component, pluginName, options)
		{

			console.debug(("PluginOrganizer._addPlugin(): Adding a plugin. name=" + (component.name) + ", pluginName=" + pluginName));

			options = Object.assign({}, options);
			var className = ( "className" in options ? options["className"] : pluginName );
			var plugin = null;

			// CreatePlugin
			plugin = BITSMIST.v1.ClassUtil.createObject(className, component, options);
			component._plugins[pluginName] = plugin;

			return plugin;

		};

		return PluginOrganizer;
	}(BITSMIST.v1.Organizer));

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

	var KeyOrganizer = /*@__PURE__*/(function (superclass) {
		function KeyOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) KeyOrganizer.__proto__ = superclass;
		KeyOrganizer.prototype = Object.create( superclass && superclass.prototype );
		KeyOrganizer.prototype.constructor = KeyOrganizer;

		KeyOrganizer.init = function init (component, settings)
		{

			// Init vars
			component.__isComposing = false;

		};

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
		KeyOrganizer.organize = function organize (conditions, component, settings)
		{

			var keys = settings["keys"];
			if (keys)
			{
				// Init keys
				var actions = KeyOrganizer.__getActions(keys);
				component.addEventListener("keydown", function(e){KeyOrganizer.onKeyDown.call(this, e, component);});
				component.addEventListener("keyup", function(e){KeyOrganizer.onKeyUp.call(this, e, component, keys, actions);});
				// component.addEventListener("compositionstart", function(e){KeyOrganizer.onCompositionStart.call(this, e, component, keys);});
				// component.addEventListener("compositionend", function(e){KeyOrganizer.onCompositionEnd.call(this, e, component, keys);});

				// Init buttons
				Object.keys(keys).forEach(function (key) {
					KeyOrganizer.__initButtons(component, key, keys[key]);
				});
			}

		};

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		/**
	 	 * Key down event handler. Check if it is in composing mode or not.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 */
		KeyOrganizer.onKeyDown = function onKeyDown (e, component)
		{

			component.__isComposing = ( e.keyCode === 229 ? true : false );

		};

		// -------------------------------------------------------------------------

		/**
	 	 * Key up event handler.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 * @param	{Object}		actions				Action info.
		 */
		KeyOrganizer.onKeyUp = function onKeyUp (e, component, options, actions)
		{

			// Ignore all key input when composing.
			if (component.__isComposing)
			{
				return;
			}

			var key  = ( e.key ? e.key : KeyOrganizer.__getKeyfromKeyCode(e.keyCode) );
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

		};

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
		KeyOrganizer._defaultSubmit = function _defaultSubmit (e, component, options)
		{

			component.submit().then(function () {
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

		};

		// -------------------------------------------------------------------------

		/**
		 * Default cancel.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		KeyOrganizer._defaultCancel = function _defaultCancel (e, component, options)
		{

			component.close();

		};

		// -------------------------------------------------------------------------

		/**
		 * Default clear.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		KeyOrganizer._defaultClear = function _defaultClear (e, component, options)
		{

			var target;

			if (this.hasAttribute("bm-cleartarget"))
			{
				target = this.getAttribute("bm-cleartarget");
			}

			component.clear(target);

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
	 	 * Convert key name from key code.
		 *
		 * @param	{Integer}		code				Key code.
		 */
		KeyOrganizer.__getKeyfromKeyCode = function __getKeyfromKeyCode (code)
		{

			var ret;

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

		};

		// -------------------------------------------------------------------------

		/**
		 * Init buttons.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		action				Action.
		 * @param	{Object}		options				Options.
		 */
		KeyOrganizer.__initButtons = function __initButtons (component, action, options)
		{

			if (options && options["rootNode"])
			{
				var handler = ( options["handler"] ? options["handler"] : KeyOrganizer.__getDefaultHandler(action) );
				var elements = component.querySelectorAll(options["rootNode"]);
				elements = Array.prototype.slice.call(elements, 0);

				elements.forEach(function (element) {
					element.addEventListener("click", function(e){handler.call(this, e, component, options);});
				});
			}

		};

		// -------------------------------------------------------------------------

		/**
		 * Return an object that holds information about what action is taken when which key is pressed.
		 *
		 * @param	{Object}		settings			Key settings.
		 *
		 * @return 	{Object}		Action info.
		 */
		KeyOrganizer.__getActions = function __getActions (settings)
		{

			var actions = {};

			Object.keys(settings).forEach(function (key) {
				var keys = ( Array.isArray(settings[key]["key"]) ? settings[key]["key"] : [settings[key]["key"]]);

				for (var i = 0; i < keys.length; i++)
				{
					actions[keys[i]] = {};
					actions[keys[i]]["type"] = key;
					actions[keys[i]]["handler"] = ( settings[key]["handler"] ? settings[key]["handler"] : KeyOrganizer.__getDefaultHandler(key) );
					actions[keys[i]]["option"] = settings[key];
				}
			});

			return actions;

		};

		// -------------------------------------------------------------------------

		/**
		 * Return a default handler for the action.
		 *
		 * @param	{String}		action				Action.
		 *
		 * @return 	{Function}		Handler.
		 */
		KeyOrganizer.__getDefaultHandler = function __getDefaultHandler (action)
		{

			var handler;

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

		};

		return KeyOrganizer;
	}(BITSMIST.v1.Organizer));

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

	var ChainOrganizer = /*@__PURE__*/(function (superclass) {
		function ChainOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) ChainOrganizer.__proto__ = superclass;
		ChainOrganizer.prototype = Object.create( superclass && superclass.prototype );
		ChainOrganizer.prototype.constructor = ChainOrganizer;

		ChainOrganizer.organize = function organize (conditions, component, settings)
		{

			var chains = settings["chains"];
			if (chains)
			{
				Object.keys(chains).forEach(function (eventName) {
					component.addEventHandler(eventName, {"handler":ChainOrganizer.onDoOrganize, "options":chains[eventName]});
				});
			}

		};

		// -----------------------------------------------------------------------------

		ChainOrganizer.unorganize = function unorganize (conditions, component, settings)
		{

			var chains = settings["chains"];
			if (chains)
			{
				Object.keys(chains).forEach(function (eventName) {
					component.removeEventHandler(eventName, {"handler":ChainOrganizer.onDoOrganize, "options":chains[eventName]});
				});
			}

		};

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
		ChainOrganizer.onDoOrganize = function onDoOrganize (sender, e, ex)
		{

			var component = ex.component;
			var targets = ex.options;
			var promises = [];
			var chain = Promise.resolve();

			var loop = function ( i ) {
				var method = targets[i]["method"] || "refresh";
				var state = targets[i]["state"] || "started";
				var sync = targets[i]["sync"];

				var nodes = document.querySelectorAll(targets[i]["rootNode"]);
				nodes = Array.prototype.slice.call(nodes, 0);
				BITSMIST.v1.Util.assert(nodes.length > 0, ("ChainOrganizer.onDoOrganizer(): Node not found. name=" + (component.name) + ", eventName=" + (e.type) + ", rootNode=" + (targets[i]["rootNode"]) + ", method=" + method));

				if (sync)
				{
					chain = chain.then(function () {
						return ChainOrganizer.__execTarget(component, nodes, method, state);
					});
				}
				else
				{
					chain = ChainOrganizer.__execTarget(component, nodes, method, state);
				}
				promises.push(chain);
			};

			for (var i = 0; i < targets.length; i++)
			loop( i );

			return chain.then(function () {
				return Promise.all(promises);
			});

		};

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
		ChainOrganizer.__execTarget = function __execTarget (component, nodes, method, state)
		{

			var promises = [];

			nodes.forEach(function (element) {
				var promise = component.waitFor([{"object":element, "state":state}]).then(function () {
					return element[method]({"sender":component});
				});
				promises.push(promise);
			});

			return Promise.all(promises);

		};

		return ChainOrganizer;
	}(BITSMIST.v1.Organizer));

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

	var DialogOrganizer = /*@__PURE__*/(function (superclass) {
		function DialogOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) DialogOrganizer.__proto__ = superclass;
		DialogOrganizer.prototype = Object.create( superclass && superclass.prototype );
		DialogOrganizer.prototype.constructor = DialogOrganizer;

		DialogOrganizer.init = function init (component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'modalResult', {
				get: function get() { return this._modalResult; },
			});
			Object.defineProperty(component, 'isModal', {
				get: function get() { return this._isModal; },
			});

			// Add methods
			component.open = function(options) { return DialogOrganizer._open(this, options); };
			component.openModal = function(options) { return DialogOrganizer._openModal(this, options); };
			component.close = function(options) { return DialogOrganizer._close(this, options); };

			// Init vars
			component._isModal = false;
			component._modalResult;
			component._modalPromise;

		};

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
		DialogOrganizer.organize = function organize (conditions, component, settings)
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

		};

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
		DialogOrganizer._open = function _open (component, options)
		{

			options = Object.assign({}, options);

			return Promise.resolve().then(function () {
				console.debug(("Opening component. name=" + (component.name) + ", id=" + (component.id)));
				return component.trigger("beforeOpen", options);
			}).then(function () {
				// Setup
				if (BITSMIST.v1.Util.safeGet(options, "autoSetupOnOpen", component.settings.get("settings.autoSetupOnOpen")))
				{
					return component.setup(options);
				}
			}).then(function () {
				// Refresh
				if (BITSMIST.v1.Util.safeGet(options, "autoRefreshOnOpen", component.settings.get("settings.autoRefreshOnOpen")))
				{
					return component.refresh(options);
				}
			}).then(function () {
				return component.trigger("doOpen", options);
			}).then(function () {
				// Auto focus
				var autoFocus = component.settings.get("settings.autoFocus");
				if (autoFocus)
				{
					var target = ( autoFocus === true ? component : component.querySelector(autoFocus) );
					if (target)
					{
						target.focus();
					}
				}
			}).then(function () {
				return component.trigger("afterOpen", options);
			}).then(function () {
				console.debug(("Opened component. name=" + (component.name) + ", id=" + (component.id)));
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Open component modally.
		 *
		 * @param	{array}			options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		DialogOrganizer._openModal = function _openModal (component, options)
		{

			console.debug(("Opening component modally. name=" + (component.name) + ", id=" + (component.id)));

			return new Promise(function (resolve, reject) {
				component._isModal = true;
				component._modalResult = {"result":false};
				component._modalPromise = { "resolve": resolve, "reject": reject };
				DialogOrganizer._open(component, options);
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Close component.
		 *
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		DialogOrganizer._close = function _close (component, options)
		{

			options = Object.assign({}, options);

			return Promise.resolve().then(function () {
				console.debug(("Closing component. name=" + (component.name) + ", id=" + (component.id)));
				return component.trigger("beforeClose", options);
			}).then(function () {
				return component.trigger("doClose", options);
			}).then(function () {
				return component.trigger("afterClose", options);
			}).then(function () {
				if (component._isModal)
				{
					component._modalPromise.resolve(component._modalResult);
				}
			}).then(function () {
				console.debug(("Closed component. name=" + (component.name) + ", id=" + (component.id)));
			});

		};

		return DialogOrganizer;
	}(BITSMIST.v1.Organizer));

	// =============================================================================

	// =============================================================================
	//	Preference organizer class
	// =============================================================================

	var PreferenceOrganizer = /*@__PURE__*/(function (superclass) {
		function PreferenceOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) PreferenceOrganizer.__proto__ = superclass;
		PreferenceOrganizer.prototype = Object.create( superclass && superclass.prototype );
		PreferenceOrganizer.prototype.constructor = PreferenceOrganizer;

		PreferenceOrganizer.globalInit = function globalInit ()
		{

			// Init vars
			PreferenceOrganizer._defaults = new BITSMIST.v1.ChainableStore();
			PreferenceOrganizer._store = new ObservableStore({"chain":PreferenceOrganizer._defaults, "filter":PreferenceOrganizer._filter, "async":true});
			PreferenceOrganizer.__loaded =  {};
			PreferenceOrganizer.__loaded["promise"] = new Promise(function (resolve, reject) {
				PreferenceOrganizer.__loaded["resolve"] = resolve;
				PreferenceOrganizer.__loaded["reject"] = reject;
			});

		};

		// -------------------------------------------------------------------------

		/**
		 * Init.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 */
		PreferenceOrganizer.init = function init (component, settings)
		{

			// Register a component as an observer
			PreferenceOrganizer._store.subscribe(component.name + "_" + component.uniqueId, PreferenceOrganizer._triggerEvent.bind(component), {"targets":BITSMIST.v1.Util.safeGet(settings, "preferences.targets")});

		};

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
		PreferenceOrganizer.organize = function organize (conditions, component, settings)
		{

			var chain = Promise.resolve();

			// Set default preferences
			if (BITSMIST.v1.Util.safeGet(settings, "preferences.defaults"))
			{
				PreferenceOrganizer._defaults.items = component.settings.get("preferences.defaults");
			}

			// Load preferences
			if (BITSMIST.v1.Util.safeGet(settings, "preferences.settings.load"))
			{
				chain = component.resources["preferences"].get().then(function (preferences) {
					PreferenceOrganizer._store.merge(preferences);
					PreferenceOrganizer.__loaded.resolve();
				});
			}

			// Wait for preference to be loaded
			var timer;
			return chain.then(function () {
				var timeout = component.settings.get("system.preferenceTimeout", 10000);
				timer = setTimeout(function () {
					throw new ReferenceError(("Time out waiting for loading preferences. name=" + (component.name)));
				}, timeout);
				return PreferenceOrganizer.__loaded.promise;
			}).then(function () {
				clearTimeout(timer);
			});

		};

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
		PreferenceOrganizer._triggerEvent = function _triggerEvent (item)
		{

			var eventName = this.settings.get("preferences.settings.eventName", "doSetup");

			return this.trigger(eventName, {"sender":PreferenceOrganizer, "item":item});

		};

		// -------------------------------------------------------------------------

		/**
		 * Check if it is a target.
		 *
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Object}		options				Options.
		 */
		PreferenceOrganizer._filter = function _filter (conditions, options)
		{

			var result = false;
			var target = options["targets"];

			if (target === "*")
			{
				result = true;
			}
			else
			{
				target = ( Array.isArray(target) ? target : [target] );

				for (var i = 0; i < target.length; i++)
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

		return PreferenceOrganizer;
	}(BITSMIST.v1.Organizer));

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

	var Plugin = function Plugin(component, options)
	{
		var this$1$1 = this;


		this._component = component;
		this._options = new BITSMIST.v1.Store({"items":Object.assign({}, options)});
		this._options.merge(this._getOptions());
		this._options.set("name", this._options.get("name", this.constructor.name));

		// Add event handlers
		var events = this._options.get("events", {});
		Object.keys(events).forEach(function (eventName) {
			component.addEventHandler(eventName, events[eventName], null, this$1$1);
		});

		// Expose plugin
		if (this._options.get("expose"))
		{
			var plugin = this;
			Object.defineProperty(component.__proto__, this._options.get("expose"), {
				get: function get()
				{
					return plugin;
				}
			});
		}

	};

	var prototypeAccessors$2 = { name: { configurable: true },component: { configurable: true } };

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	* Component name.
	*
	* @type{String}
	*/
	prototypeAccessors$2.name.get = function ()
	{

		return this._options.get("name");

	};

	// -------------------------------------------------------------------------

	/**
	* Component.
	*
	* @type{String}
	*/
	prototypeAccessors$2.component.get = function ()
	{

		return this._component;

	};

	prototypeAccessors$2.component.set = function (value)
	{

		this._component = value;

	};

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
		 * Get plugin options.  Need to override.
		 *
		 * @return  {Object}	Options.
		 */
	Plugin.prototype._getOptions = function _getOptions ()
	{

		return {};

	};

	Object.defineProperties( Plugin.prototype, prototypeAccessors$2 );

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

	var ResourceHandler = function ResourceHandler(component, resourceName, options)
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

	};

	var prototypeAccessors$1 = { name: { configurable: true },resourceName: { configurable: true },target: { configurable: true },data: { configurable: true },items: { configurable: true },item: { configurable: true },options: { configurable: true } };

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
		 * Resource handler name.
		 *
		 * @type{String}
		 */
	prototypeAccessors$1.name.get = function ()
	{

		return this._name;

	};

	prototypeAccessors$1.name.set = function (value)
	{

		this._name = value;

	};

	// -------------------------------------------------------------------------

	/**
		 * Resource name.
		 *
		 * @type{String}
		 */
	prototypeAccessors$1.resourceName.get = function ()
	{

		return this._resourceName;

	};

	prototypeAccessors$1.resourceName.set = function (value)
	{

		this._resourceName = value;

	};

	// -------------------------------------------------------------------------

	/**
		 * Fetch target.
		 *
		 * @type{Object}
		 */
	prototypeAccessors$1.target.get = function ()
	{

		return this._target;

	};

	// -------------------------------------------------------------------------

	/**
		 * Raw data.
		 *
		 * @type{Object}
		 */
	prototypeAccessors$1.data.get = function ()
	{

		return this._data;

	};

	prototypeAccessors$1.data.set = function (value)
	{

		this._data = value;
		this._items = this.__reshapeItems(value);
		this._item = ( Array.isArray(this._items) ? this._items[this._currentIndex] : this._items );

	};

	// -------------------------------------------------------------------------

	/**
		 * Items.
		 *
		 * @type{Object}
		 */
	prototypeAccessors$1.items.get = function ()
	{

		return this._items;

	};

	// -------------------------------------------------------------------------

	/**
		 * Item.
		 *
		 * @type{Object}
		 */
	prototypeAccessors$1.item.get = function ()
	{

		return this._item;

	};

	// -------------------------------------------------------------------------

	/**
		 * Options.
		 *
		 * @type{Object}
		 */
	prototypeAccessors$1.options.get = function ()
	{

		return this._options;

	};

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
		 * Get data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceHandler.prototype.get = function get (id, parameters)
	{
			var this$1$1 = this;


		return Promise.resolve().then(function () {
			return this$1$1._get(id, parameters);
		}).then(function (data) {
	//		BITSMIST.v1.Util.warn(data, `ResourceHandler.get(): No data returned. name=${this._component.name}, handlerName=${this._name}, resourceName=${this._resourceName}`);

			if (data)
			{
				this$1$1.data = data;
			}

			return this$1$1._data;
		});

	};

	    // -------------------------------------------------------------------------

	/**
		 * Delete data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceHandler.prototype.delete = function delete$1 (id, parameters)
	{
			var this$1$1 = this;


		return Promise.resolve().then(function () {
			return this$1$1._delete(id, parameters);
		});

	};

	    // -------------------------------------------------------------------------

	/**
		 * Insert data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	data			Data to insert.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceHandler.prototype.post = function post (id, data, parameters)
	{
			var this$1$1 = this;


		data = this.__reshapeData(data);

		return Promise.resolve().then(function () {
			return this$1$1._post(id, data, parameters);
		});

	};

	    // -------------------------------------------------------------------------

	/**
		 * Update data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	data			Data to update.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceHandler.prototype.put = function put (id, data, parameters)
	{
			var this$1$1 = this;


		data = this.__reshapeData(data);

		return Promise.resolve().then(function () {
			return this$1$1._put(id, data, parameters);
		});

	};

	    // -------------------------------------------------------------------------

	/**
		 * Get resource text for the code.
		 *
		 * @param{String}	code			Code value.
		 *
		 * @return  {String}	Resource text.
		 */
	ResourceHandler.prototype.getText = function getText (code)
	{

		var ret = code;
		var title = this._options.get("fieldOptions.text");

		if (this._items && code in this._items)
		{
			ret = this._items[code][title];
		}

		return ret;

	};

	    // -------------------------------------------------------------------------

	/**
		 * Get resource item for the code.
		 *
		 * @param{String}	code			Code value.
		 *
		 * @return  {Object}	Resource data.
		 */
	ResourceHandler.prototype.getItem = function getItem (code)
	{

		var ret;

		if (this._items && code in this._items)
		{
			ret = this._items[code];
		}

		return ret;

	};

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
		 * Get data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceHandler.prototype._get = function _get (id, parameters)
	{
	};

	    // -------------------------------------------------------------------------

	/**
		 * Delete data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceHandler.prototype._delete = function _delete (id, parameters)
	{
	};

	    // -------------------------------------------------------------------------

	/**
		 * Insert data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	data			Data to insert.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceHandler.prototype._post = function _post (id, data, parameters)
	{
	};

	    // -------------------------------------------------------------------------

	/**
		 * Update data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	data			Data to update.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceHandler.prototype._put = function _put (id, data, parameters)
	{
	};

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
		 * Get and reshape items from raw data on get.
		 *
		 * @param{Object}	data			Raw data from which items are retrieved.
		 *
		 * @return  {Object}	Reshaped items.
		 */
	ResourceHandler.prototype.__reshapeItems = function __reshapeItems (data)
	{

		// Get items
		var itemsField = this._options.get("fieldOptions.items");
		var items = ( itemsField ? BITSMIST.v1.Util.safeGet(data, itemsField) : data );

		// Reshape
		if (this._options.get("reshapeOptions.get.reshape"))
		{
			var reshaper = this._options.get("reshapeOptions.get.reshaper", this.__reshaper_get.bind(this));
			items = reshaper(items);
		}

		return items;

	};

	// -------------------------------------------------------------------------

	/**
		 * Reshape request data on post/put.
		 *
		 * @param{Object}	data			Data to reshape.
		 *
		 * @return  {Object}	Reshaped data.
		 */
	ResourceHandler.prototype.__reshapeData = function __reshapeData (data)
	{

		if (this._options.get("reshapeOptions.put.reshape"))
		{
			var reshaper = this._options.get("reshapeOptions.put.reshaper", function () { return data; });
			data = reshaper(data);
		}

		return data;

	};

	// -------------------------------------------------------------------------

	/**
	     * Reshape items on get.
	     *
	     * @param{Object}	target			Target to reshape.
		 *
		 * @return  {Object}	Master object.
	     */
	ResourceHandler.prototype.__reshaper_get = function __reshaper_get (target)
	{

		var idField = this._options.get("fieldOptions.id");

		var items = target.reduce(function (result, current) {
			var id = current[idField];
			result[id] = current;

			return result;
		}, {});

		return items;

	};

	Object.defineProperties( ResourceHandler.prototype, prototypeAccessors$1 );

	// =============================================================================

	// =============================================================================
	//	Cookie resource handler class
	// =============================================================================

	var CookieResourceHandler = /*@__PURE__*/(function (ResourceHandler) {
		function CookieResourceHandler(component, resourceName, options)
		{

			ResourceHandler.call(this, component, resourceName, options);

			this._name = "CookieResourceHandler";
			this._cookieName = BITSMIST.v1.Util.safeGet(options, "cookieOptions.name", "preferences");

		}

		if ( ResourceHandler ) CookieResourceHandler.__proto__ = ResourceHandler;
		CookieResourceHandler.prototype = Object.create( ResourceHandler && ResourceHandler.prototype );
		CookieResourceHandler.prototype.constructor = CookieResourceHandler;

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
		CookieResourceHandler.prototype._get = function _get (id, parameters)
		{

			return this.__getCookie(this._cookieName);

		};

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
		CookieResourceHandler.prototype._put = function _put (id, data, parameters)
		{

			this.__setCookie(this._cookieName, data);

		};

		// -----------------------------------------------------------------------------
		//  Privates
		// -----------------------------------------------------------------------------

		/**
		* Get cookie.
		*
		* @param	{String}		key					Key.
		*/
		CookieResourceHandler.prototype.__getCookie = function __getCookie (key)
		{

			var decoded = document.cookie.split(';').reduce(function (result, current) {
				var ref = current.split('=');
				var key = ref[0];
				var value = ref[1];
				if (key)
				{
					result[key.trim()] = ( value ? decodeURIComponent(value.trim()) : undefined );
				}

				return result;
			}, {});

			return ( decoded[key] ? JSON.parse(decoded[key]) : {});

		};

		// -----------------------------------------------------------------------------

		/**
		* Set cookie.
		*
		* @param	{String}		key					Key.
		* @param	{Object}		value				Value.
		*/
		CookieResourceHandler.prototype.__setCookie = function __setCookie (key, value)
		{

			var cookie = key + "=" + encodeURIComponent(JSON.stringify(value)) + "; ";
			var options = this._options.get("cookieOptions");

			cookie += Object.keys(options).reduce(function (result, current) {
				result += current + "=" + options[current] + "; ";

				return result;
			}, "");

			document.cookie = cookie;

		};

		return CookieResourceHandler;
	}(ResourceHandler));

	// =============================================================================

	// =============================================================================
	//	API Resource Handler class
	// =============================================================================

	var ApiResourceHandler = /*@__PURE__*/(function (ResourceHandler) {
		function ApiResourceHandler(component, resourceName, options)
		{

			ResourceHandler.call(this, component, resourceName, options);

			this._name = "ApiResourceHandler";

		}

		if ( ResourceHandler ) ApiResourceHandler.__proto__ = ResourceHandler;
		ApiResourceHandler.prototype = Object.create( ResourceHandler && ResourceHandler.prototype );
		ApiResourceHandler.prototype.constructor = ApiResourceHandler;

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
		ApiResourceHandler.prototype._get = function _get (id, parameters)
		{
			var this$1$1 = this;


			var method = "GET";
			var headers = this._getOption("headers", method);
			var options = this._getOption("options", method);
			var urlOptions = this._getOption("url", method);
			var dataType = urlOptions["dataType"];

			var url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options}).then(function (xhr) {
				return this$1$1._convertResponseData(xhr.responseText, dataType);
			});

		};

	    // -------------------------------------------------------------------------

		/**
		 * Delete data.
		 *
		 * @param	{String}		id					Target id.
		 * @param	{Object}		parameters			Query parameters.
		 *
		 * @return  {Promise}		Promise.
		 */
		ApiResourceHandler.prototype._delete = function _delete (id, parameters)
		{

			var method = "DELETE";
			var headers = this._getOption("headers", method);
			var options = this._getOption("options", method);
			var urlOptions = this._getOption("url", method);
			urlOptions["dataType"];

			var url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options});

		};

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
		ApiResourceHandler.prototype._post = function _post (id, data, parameters)
		{

			var method = "POST";
			var headers = this._getOption("headers", method);
			var options = this._getOption("options", method);
			var urlOptions = this._getOption("url", method);
			var dataType = urlOptions["dataType"];

			var url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

		};

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
		ApiResourceHandler.prototype._put = function _put (id, data, parameters)
		{

			var method = "PUT";
			var headers = this._getOption("headers", method);
			var options = this._getOption("options", method);
			var urlOptions = this._getOption("url", method);
			var dataType = urlOptions["dataType"];

			var url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

			return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

		};

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
		ApiResourceHandler.prototype._convertRequestData = function _convertRequestData (items, dataType)
		{

			var data;

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

		};

		// -------------------------------------------------------------------------

		/**
		 * Convert response data to object.
		 *
		 * @param	{Object}		items				Data to convert.
		 * @param	{String}		dataType			Source data type.
		 *
		 * @return  {String}		Converted data.
		 */
		ApiResourceHandler.prototype._convertResponseData = function _convertResponseData (items, dataType)
		{

			var data;

			switch (dataType)
			{
			case "json":
			default:
				data = JSON.parse(items);
				break;
			}

			return data;

		};

		// -------------------------------------------------------------------------

		/**
		 * Get option for the method.
		 *
		 * @param	{String}		target				"ajaxHeaders" or "ajaxOptions"..
		 * @param	{String}		method				Method.
		 *
		 * @return  {Object}		Options.
		 */
		ApiResourceHandler.prototype._getOption = function _getOption (target, method)
		{

			var settings = this._options.get("handlerOptions", {});
			var options1 = (target in settings && "COMMON" in settings[target] ? settings[target]["COMMON"] : {} );
			var options2 = (target in settings && method in settings[target] ? settings[target][method] : {} );

			return Object.assign(options1, options2);

		};

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
		ApiResourceHandler.prototype._buildApiUrl = function _buildApiUrl (resourceName, id, parameters, options)
		{

			var baseUrl = options["baseUrl"] || this._component.settings.get("system.apiBaseUrl", "");
			var scheme = options["scheme"] || "";
			var host = options["host"] || "";
			var dataType = options["dataType"] || "";
			var version = options["version"] || "";
			var format = options["format"] || "";
			var url = format.
						replace("@scheme@", scheme).
						replace("@host@", host).
						replace("@baseUrl@", baseUrl).
						replace("@resource@", resourceName).
						replace("@id@", id).
						replace("@dataType@", dataType).
						replace("@query@", this._buildUrlQuery(parameters)).
						replace("@version@", version);

			return url

		};

		// -------------------------------------------------------------------------

		/**
		 * Build query string from parameters object.
		 *
		 * @param	{Object}		paratemers			Query parameters.
		 *
		 * @return  {String}		Query string.
		 */
		ApiResourceHandler.prototype._buildUrlQuery = function _buildUrlQuery (parameters)
		{

			var query = "";

			if (parameters)
			{
				query = Object.keys(parameters).reduce(function (result, current) {
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

		};

		return ApiResourceHandler;
	}(ResourceHandler));

	// =============================================================================

	// =============================================================================
	//	Object Resource Handler class
	// =============================================================================

	var ObjectResourceHandler = /*@__PURE__*/(function (ResourceHandler) {
		function ObjectResourceHandler(component, resourceName, options)
		{

			ResourceHandler.call(this, component, resourceName, options);

			this._name = "ObjectResourceHandler";
			if (options["items"])
			{
				this.data = options["items"];
			}

		}

		if ( ResourceHandler ) ObjectResourceHandler.__proto__ = ResourceHandler;
		ObjectResourceHandler.prototype = Object.create( ResourceHandler && ResourceHandler.prototype );
		ObjectResourceHandler.prototype.constructor = ObjectResourceHandler;

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
		ObjectResourceHandler.prototype._get = function _get (id, parameters)
		{

			return this._data;

		};

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
		ObjectResourceHandler.prototype._put = function _put (id, data, parameters)
		{

			this.data = data;

		};

		return ObjectResourceHandler;
	}(ResourceHandler));

	// =============================================================================

	// =============================================================================
	//	Linked Resource Handler class
	// =============================================================================

	var LinkedResourceHandler = /*@__PURE__*/(function (ResourceHandler) {
		function LinkedResourceHandler(component, resourceName, options)
		{

			var defaults = {"autoLoad":true};

			ResourceHandler.call(this, component, resourceName, Object.assign(defaults, options));

			this._name = "LinkedResourceHandler";
			this._ref;

		}

		if ( ResourceHandler ) LinkedResourceHandler.__proto__ = ResourceHandler;
		LinkedResourceHandler.prototype = Object.create( ResourceHandler && ResourceHandler.prototype );
		LinkedResourceHandler.prototype.constructor = LinkedResourceHandler;

		var prototypeAccessors = { target: { configurable: true },data: { configurable: true },items: { configurable: true },item: { configurable: true } };

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		/**
		 * Fetch target.
		 *
		 * @type	{Object}
		 */
		prototypeAccessors.target.get = function ()
		{

			return this._ref.target;

		};

		// -------------------------------------------------------------------------

		/**
		 * Raw data.
		 *
		 * @type	{Object}
		 */
		prototypeAccessors.data.get = function ()
		{

			return this._ref.data;

		};

		prototypeAccessors.data.set = function (value)
		{

			this._ref.data = value;

		};

		// -------------------------------------------------------------------------

		/**
		 * Items.
		 *
		 * @type	{Object}
		 */
		prototypeAccessors.items.get = function ()
		{

			return this._ref.items;

		};

		// -------------------------------------------------------------------------

		/**
		 * Item.
		 *
		 * @type	{Object}
		 */
		prototypeAccessors.item.get = function ()
		{

			return this._ref.item;

		};

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
		LinkedResourceHandler.prototype._get = function _get (id, parameters)
		{

			var handlerOptions = this._options.get("handlerOptions");
			var rootNode = handlerOptions["rootNode"];
			var resourceName = handlerOptions["resourceName"];
			handlerOptions["state"];

			this._ref = document.querySelector(rootNode).resources[resourceName];

		};

	    // -------------------------------------------------------------------------

		/**
		 * Get resource text for the code.
		 *
		 * @param	{String}		code				Code value.
		 *
		 * @return  {String}		Resource text.
		 */
		LinkedResourceHandler.prototype.getText = function getText (code)
		{

			return this._ref.getText(code);

		};

	    // -------------------------------------------------------------------------

		/**
		 * Get resource item for the code.
		 *
		 * @param	{String}		code				Code value.
		 *
		 * @return  {Object}		Resource data.
		 */
		LinkedResourceHandler.prototype.getItem = function getItem (code)
		{

			return this._ref.getItem(code);

		};

		Object.defineProperties( LinkedResourceHandler.prototype, prototypeAccessors );

		return LinkedResourceHandler;
	}(ResourceHandler));

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

	var ValidationHandler = function ValidationHandler(component, validatorName, options)
	{

		this._name = validatorName;
		this._component = component;
		this._options = new BITSMIST.v1.Store({"items":Object.assign({}, options)});

	};

	var prototypeAccessors = { name: { configurable: true },options: { configurable: true } };

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
		 * Name.
		 *
		 * @type{String}
		 */
	prototypeAccessors.name.get = function ()
	{

		return this._name;

	};

	prototypeAccessors.name.set = function (value)
	{

		this._name = value;

	};

	// -------------------------------------------------------------------------

	/**
		 * Items.
		 *
		 * @type{Object}
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
		 * @type{Object}
		 */
	prototypeAccessors.options.get = function ()
	{

		return this._options;

	};

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
		 * Validate.
		 *
		 * @param{String}	key				Key.
		 * @param{*}			value			Value.
		 * @param{Object}	rule			Validation rule.
		 * @param{Object}	failed			Failed reports.
		 * @param{Object}	extra			Extra reports.
		 *
	 	 * @return  {Object}	Invalid result.
		 */
	ValidationHandler.createValidationResult = function createValidationResult (key, value, rule, failed, extras)
	{

		var result = {
			"key":		key,
			"value":	value,
			"message":	ValidationHandler._getFunctionValue(key, value, "message", rule),
			"fix":		ValidationHandler._getFunctionValue(key, value, "fix", rule),
			"failed":	failed,
			"extras":	extras,
		};

		return result;

	};

	// -------------------------------------------------------------------------

	/**
		 * Validate.
		 *
		 * @param{Object}	values			Values to validate.
		 * @param{Object}	rules			Validation rules.
		 * @param{Object}	options			Validation options.
		 *
	 	 * @return  {Object}	Invalid results.
		 */
	ValidationHandler.validate = function validate (values, rules, options)
	{

		rules = rules || {};
		options = options || {};
		var invalids = {};

		// Allow list
		if (options["allowList"])
		{
			Object.keys(values).forEach(function (key) {
				if (options["allowList"].indexOf(key) === -1)
				{
					var failed = [{"rule":"allowList", "validity":"notAllowed"}];
					invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
				}
			});
		}

		// Allow only in rules
		if (options["allowOnlyInRules"])
		{
			Object.keys(values).forEach(function (key) {
				if (!(key in rules))
				{
					var failed = [{"rule":"allowList", "validity":"notAllowed"}];
					invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
				}
			});
		}

		// Disallow list
		if (options["disallowList"])
		{
			Object.keys(values).forEach(function (key) {
				if (options["disallowList"].indexOf(key) > -1)
				{
					var failed = [{"rule":"disallowList", "validity":"disallowed"}];
					invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
				}
			});
		}

		// Required
		Object.keys(rules).forEach(function (key) {
			if ("constraints" in rules[key] && rules[key]["constraints"] && "required" in rules[key]["constraints"] && rules[key]["constraints"]["required"])
			{
				if (!(key in values))
				{
					var failed = [{"rule":"required", "validity":"valueMissing"}];
					invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
				}
			}
		});

		return invalids;

	};

	// -------------------------------------------------------------------------

	/**
		 * Check validity (Need to override).
		 *
		 * @param{Object}	values			Values to validate.
		 * @param{Object}	rules			Validation rules.
		 * @param{Object}	options			Validation options.
		 */
	ValidationHandler.prototype.checkValidity = function checkValidity (values, rules, options)
	{
	};

	// -------------------------------------------------------------------------

	/**
		 * Report validity (Need to override).
		 *
		 * @param{Object}	values			Values to validate.
		 * @param{Object}	rules			Validation rules.
		 */
	ValidationHandler.prototype.reportValidity = function reportValidity (values, rules)
	{
	};

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
		 * Get a value from a custom function or a value.
		 *
		 * @param{String}	key				Item name.
		 * @param{Object}	value			Value to validate.
		 * @param{String}	target			Target name.
		 * @param{Object}	rule			Validation rules.
		 */
	ValidationHandler._getFunctionValue = function _getFunctionValue (key, value, target, rule)
	{

		var ret;

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

	};

	Object.defineProperties( ValidationHandler.prototype, prototypeAccessors );

	// =============================================================================

	// =============================================================================
	//	HTML5 Form validation Handler class
	// =============================================================================

	var HTML5FormValidationHandler = /*@__PURE__*/(function (ValidationHandler) {
		function HTML5FormValidationHandler () {
			ValidationHandler.apply(this, arguments);
		}

		if ( ValidationHandler ) HTML5FormValidationHandler.__proto__ = ValidationHandler;
		HTML5FormValidationHandler.prototype = Object.create( ValidationHandler && ValidationHandler.prototype );
		HTML5FormValidationHandler.prototype.constructor = HTML5FormValidationHandler;

		HTML5FormValidationHandler.validate = function validate (form, rules)
		{

			var invalids = {};

			BITSMIST.v1.Util.assert(form, "FormValidationHandler.checkValidity(): Form tag does not exist.", TypeError);
			BITSMIST.v1.Util.assert(form.checkValidity, "FormValidationHandler.checkValidity(): check validity not supported.", TypeError);

			var elements = BITSMIST.v1.Util.scopedSelectorAll(form, "input:not([novalidate])");
			elements.forEach(function (element) {
				var key = element.getAttribute("bm-bind");
				var value = FormUtil.getValue(element);
				var rule = ( rules && rules[key] ? rules[key] : null );

				var failed = HTML5FormValidationHandler._validateValue(element, key, value, rule);
				if (failed.length > 0)
				{
					invalids[key] = ValidationHandler.createValidationResult(key, value, rule, failed, {"element": element});
					invalids["message"] = invalids["message"] || element.validationMessage;
				}
			});

			return invalids;

		};

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
		HTML5FormValidationHandler.prototype.checkValidity = function checkValidity (values, rules, options)
		{

			var invalids1 = {};
			var invalids2;
			var form = this._component.querySelector("form");
			if (rules || options)
			{
				// Check allow/disallow list
				var values$1 = FormUtil.getFields(form);
				invalids1 = ValidationHandler.validate(values$1, rules, options);
			}
			invalids2 = HTML5FormValidationHandler.validate(form, rules);
			var invalids = BITSMIST.v1.Util.deepMerge(invalids1, invalids2);

			this._component.validationResult["result"] = ( Object.keys(invalids).length > 0 ? false : true );
			this._component.validationResult["invalids"] = invalids;

		};

		// -------------------------------------------------------------------------

		/**
		 * Report validity.
		 *
		 * @param	{Object}		values				Values to validate.
		 * @param	{Object}		rules				Validation rules.
		 */
		HTML5FormValidationHandler.prototype.reportValidity = function reportValidity (values, rules)
		{

			var form = this._component.querySelector("form");

			BITSMIST.v1.Util.assert(form, "FormValidationHandler.reportValidity(): Form tag does not exist.", TypeError);
			BITSMIST.v1.Util.assert(form.reportValidity, "FormValidationHandler.reportValidity(): Report validity not supported.", TypeError);

			form.reportValidity();

		};

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
		HTML5FormValidationHandler._validateValue = function _validateValue (element, key, value, rules)
		{

			var failed = [];

			var result = element.validity;
			if (!result.valid)
			{
				for (var errorName in result)
				{
					if (errorName !== "valid" && result[errorName])
					{
						failed.push({"validity":errorName});
					}
				}
			}

			return failed;

		};

		return HTML5FormValidationHandler;
	}(ValidationHandler));

	// =============================================================================

	// =============================================================================
	//	Object validation Handler class
	// =============================================================================

	var ObjectValidationHandler = /*@__PURE__*/(function (ValidationHandler) {
		function ObjectValidationHandler () {
			ValidationHandler.apply(this, arguments);
		}

		if ( ValidationHandler ) ObjectValidationHandler.__proto__ = ValidationHandler;
		ObjectValidationHandler.prototype = Object.create( ValidationHandler && ValidationHandler.prototype );
		ObjectValidationHandler.prototype.constructor = ObjectValidationHandler;

		ObjectValidationHandler.validate = function validate (values, rules)
		{

			var invalids = {};

			if (rules)
			{
				Object.keys(values).forEach(function (key) {
					if (rules[key])
					{
						var failed = ObjectValidationHandler._validateValue(key, values[key], rules[key]);
						if (failed.length > 0)
						{
							invalids[key] = ValidationHandler.createValidationResult(key, values[key], rules[key], failed);
						}
					}
				});
			}

			return invalids;

		};

		// -------------------------------------------------------------------------

		/**
		 * Check validity.
		 *
		 * @param	{Object}		values				Values to validate.
		 * @param	{Object}		rules				Validation rules.
		 * @param	{Object}		options				Validation options.
		 */
		ObjectValidationHandler.prototype.checkValidity = function checkValidity (values, rules, options)
		{

			var invalids1 = ValidationHandler.validate(values, rules, options); // Check allow/disallow/required
			var invalids2 = ObjectValidationHandler.validate(values, rules);
			var invalids = BITSMIST.v1.Util.deepMerge(invalids1, invalids2);

			this._component.validationResult["result"] = ( Object.keys(invalids).length > 0 ? false : true );
			this._component.validationResult["invalids"] = invalids;

		};

		// -------------------------------------------------------------------------

		/**
		 * Report validity.
		 *
		 * @param	{Object}		values				Values to validate.
		 * @param	{Object}		rules				Validation rules.
		 */
		ObjectValidationHandler.prototype.reportValidity = function reportValidity (values, rules)
		{
		};

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
		ObjectValidationHandler._validateValue = function _validateValue (key, value, rules)
		{

			var failed = [];

			if (rules && rules["constraints"])
			{
				Object.keys(rules["constraints"]).forEach(function (constraintName) {
					var result = ObjectValidationHandler._checkConstraint(key, value, constraintName, rules["constraints"][constraintName]);
					if (result)
					{
						failed.push(result);
					}
				});
			}

			return failed;

		};

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
		ObjectValidationHandler._checkConstraint = function _checkConstraint (key, value, constraintName, rule)
		{

			var result;
			var len;
			var num;

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
				var re = new RegExp(rule);
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

		};

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
		ObjectValidationHandler._checkType = function _checkType (key, value, constraintName, rule)
		{

			var result;

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
					var parsed = parseInt(value);
					if (isNaN(parsed))
					{
						result = {"rule":"type", "validity":"typeMismatch(number)"};
					}
					break;
				}
			}

			return result;

		};

		return ObjectValidationHandler;
	}(ValidationHandler));

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
		get: function get()
		{
			return this._item;
		},
		set: function set(value)
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
		get: function get()
		{
			return this._cancelSubmit;
		},
		set: function set(value)
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
	 * Fetch data.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	Form.prototype.fetch = function(options)
	{
		var this$1$1 = this;


		return BITSMIST.v1.Component.prototype.fetch.call(this, options).then(function () {
			var resourceName = this$1$1.settings.get("settings.resourceName");
			if (resourceName && this$1$1.resources && this$1$1.resources[resourceName])
			{
				this$1$1._item = this$1$1.resources[resourceName]._item;
			}
		});

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
		var this$1$1 = this;


		options = Object.assign({}, options);
		var rootNode = ( "rootNode" in options ? this.querySelector(options["rootNode"]) : this );

		// Clear fields
		var autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this.settings.get("settings.autoClear"));
		if (autoClear)
		{
			this.clear();
		}

		return Promise.resolve().then(function () {
			return this$1$1.trigger("beforeFill", options);
		}).then(function () {
			FormUtil.setFields(rootNode, this$1$1._item, {"masters":this$1$1.resources, "triggerEvent":"change"});

			return this$1$1.trigger("afterFill", options);
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
		var this$1$1 = this;


		options = Object.assign({}, options);
		this.validationResult["result"] = true;

		return Promise.resolve().then(function () {
			return this$1$1.trigger("beforeValidate");
		}).then(function () {
			return this$1$1.callOrganizers("doCheckValidity", {"item":this$1$1._item, "validationName":this$1$1.settings.get("settings.validationName")});
		}).then(function () {
			return this$1$1.trigger("doValidate");
		}).then(function () {
			return this$1$1.trigger("afterValidate");
		}).then(function () {
			if (!this$1$1.validationResult["result"])
			{
				this$1$1._cancelSubmit = true;

				return Promise.resolve().then(function () {
					return this$1$1.callOrganizers("doReportValidity", {"validationName":this$1$1.settings.get("settings.validationName")});
				}).then(function () {
					return this$1$1.trigger("doReportValidatidy");
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
		var this$1$1 = this;


		options = Object.assign({}, options);
		this._cancelSubmit = false;

		// Get values from the form
		this._item = FormUtil.getFields(this);

		return Promise.resolve().then(function () {
			return this$1$1.validate(options);
		}).then(function () {
			if (!this$1$1._cancelSubmit)
			{
				return Promise.resolve().then(function () {
					return this$1$1.trigger("beforeSubmit", {"item":this$1$1._item});
				}).then(function () {
					return this$1$1.callOrganizers("doSubmit", options);
				}).then(function () {
					return this$1$1.trigger("doSubmit", {"item":this$1$1._item});
				}).then(function () {
					return this$1$1.trigger("afterSubmit", {"item":this$1$1._item});
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
		get: function get()
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
		get: function get()
		{
			return this._items;
		},
		set: function set(value)
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
		var this$1$1 = this;


		return BITSMIST.v1.Component.prototype.switchTemplate.call(this, templateName, options).then(function () {
			return this$1$1.switchRowTemplate(this$1$1.settings.get("settings.rowTemplateName"));
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
		var this$1$1 = this;


		options = Object.assign({}, options);

		if (this._activeRowTemplateName === templateName)
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(function () {
			console.debug(("List.switchRowTemplate(): Switching a row template. name=" + (this$1$1.name) + ", rowTemplateName=" + templateName + ", id=" + (this$1$1.id)));
			return this$1$1.addTemplate(templateName);
		}).then(function () {
			this$1$1._activeRowTemplateName = templateName;
		}).then(function () {
			return this$1$1.callOrganizers("afterRowAppend", this$1$1.settings.items);
		}).then(function () {
			return this$1$1.trigger("afterRowAppend", options);
		}).then(function () {
			console.debug(("List.switchRowTemplate(): Switched a row template. name=" + (this$1$1.name) + ", rowTemplateName=" + templateName + ", id=" + (this$1$1.id)));
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
	 * Fetch data.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	List.prototype.fetch = function(options)
	{
		var this$1$1 = this;


		return BITSMIST.v1.Component.prototype.fetch.call(this, options).then(function () {
			var resourceName = this$1$1.settings.get("settings.resourceName");
			if (resourceName && this$1$1.resources && this$1$1.resources[resourceName])
			{
				this$1$1.items = this$1$1.resources[resourceName].items;
			}
		});

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
		var this$1$1 = this;


		console.debug(("List.fill(): Filling list. name=" + (this.name)));

		options = Object.assign({}, options);

		var builder = this._getBuilder(options);
		var fragment = document.createDocumentFragment();
		this._rows = [];

		// Get list root node
		this._listRootNode = this.querySelector(this.settings.get("settings.listRootNode"));
		BITSMIST.v1.Util.assert(this._listRootNode, ("List.fill(): List root node not found. name=" + (this.name) + ", listRootNode=" + (this.settings.get("settings.listRootNode"))));

		return Promise.resolve().then(function () {
			return this$1$1.trigger("beforeFill", options);
		}).then(function () {
			return builder.call(this$1$1, fragment, this$1$1._items);
		}).then(function () {
			var autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this$1$1.settings.get("settings.autoClear"));
			if (autoClear)
			{
				this$1$1.clear();
			}
		}).then(function () {
			this$1$1._listRootNode.appendChild(fragment);
		}).then(function () {
			return this$1$1.trigger("afterFill", options);
		}).then(function () {
			console.debug(("List.fill(): Filled list. name=" + (this$1$1.name)));
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

		var rowAsync = BITSMIST.v1.Util.safeGet(options, "async", this.settings.get("settings.async", true));
		var builder = ( rowAsync ? this._buildAsync : this._buildSync );

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
		var this$1$1 = this;


		BITSMIST.v1.Util.assert(this._templates[this._activeRowTemplateName], ("List._buildSync(): Row template not loaded yet. name=" + (this.name) + ", rowTemplateName=" + (this._activeRowTemplateName)));

		var chain = Promise.resolve();
		var rowEvents = this.settings.get("rowevents");
		var template = this.templates[this._activeRowTemplateName].html;

		var loop = function ( i ) {
			chain = chain.then(function () {
				return this$1$1._appendRowSync(fragment, i, items[i], template, rowEvents);
			});
		};

		for (var i = 0; i < items.length; i++)
		loop( i );

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

		BITSMIST.v1.Util.assert(this.templates[this._activeRowTemplateName], ("List._buildAsync(): Row template not loaded yet. name=" + (this.name) + ", rowTemplateName=" + (this._activeRowTemplateName)));

		var rowEvents = this.settings.get("rowevents");
		var template = this.templates[this._activeRowTemplateName].html;

		for (var i = 0; i < items.length; i++)
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

		var ele = document.createElement("div");
		ele.innerHTML = template;
		var element = ele.firstElementChild;
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
		var this$1$1 = this;


		this.triggerAsync("beforeBuildRow", {"item":item});

		var chain = Promise.resolve();
		var items = ( this.eventResult["newItems"] ? this.eventResult["newItems"] : [item] );
		var loop = function ( i ) {
			chain = chain.then(function () {
				// Append a row
				var element = this$1$1._createRow(template);
				rootNode.appendChild(element);
				this$1$1._rows.push(element);

				// set row elements click event handler
				if (rowEvents)
				{
					Object.keys(rowEvents).forEach(function (elementName) {
						this$1$1.initEvents(elementName, rowEvents[elementName], element);
					});
				}

				// Call event handlers
				return Promise.resolve().then(function () {
					return this$1$1.trigger("beforeFillRow", {"item":item, "no":no, "element":element});
				}).then(function () {
					// Fill fields
					BITSMIST.v1.TemplateOrganizer._showConditionalElements(element, items[i]);
					FormUtil.setFields(element, item, {"masters":this$1$1.resources});
				}).then(function () {
					return this$1$1.trigger("afterFillRow", {"item":item, "no":no, "element":element});
				});
			});
		};

		for (var i = 0; i < items.length; i++)
		loop( i );

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
		var this$1$1 = this;


		this.triggerAsync("beforeBuildRow", {"item":item});

		var items = ( this.eventResult["newItems"] ? this.eventResult["newItems"] : [item] );
		var loop = function ( i ) {
			// Append a row
			var element = this$1$1._createRow(template);
			rootNode.appendChild(element);
			this$1$1._rows.push(element);

			// set row elements click event handler
			if (rowEvents)
			{
				Object.keys(rowEvents).forEach(function (elementName) {
					this$1$1.initEvents(elementName, rowEvents[elementName], element);
				});
			}

			// Call event handlers
			this$1$1.triggerAsync("beforeFillRow", {"item":items[i], "no":no, "element":element});
			BITSMIST.v1.TemplateOrganizer._showConditionalElements(element, items[i]);
			FormUtil.setFields(element, items[i], {"masters":this$1$1.resources});
			this$1$1.triggerAsync("afterFillRow", {"item":items[i], "no":no, "element":element});
		};

		for (var i = 0; i < items.length; i++)
		loop( i );

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
		var this$1$1 = this;


		// Defaults
		var defaults = {
			"settings": {
				"name": "TagLoader",
			},
		};
		settings = ( settings ? BITSMIST.v1.Util.deepMerge(defaults, settings) : defaults );

		// super()
		return BITSMIST.v1.Component.prototype.start.call(this, settings).then(function () {
			if (document.readyState !== "loading")
			{
				BITSMIST.v1.LoaderOrganizer.load(document.body, this$1$1.settings);
			}
			else
			{
				document.addEventListener("DOMContentLoaded", function () {
					BITSMIST.v1.LoaderOrganizer.load(document.body, this$1$1.settings);
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
		get: function get()
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
		var this$1$1 = this;


		this._validationResult["result"] = true;

		Promise.resolve().then(function () {
			// Validate
			return this$1$1.callOrganizers("doCheckValidity", {"item":values, "validationName":this$1$1._settings.get("settings.validationName")});
		}).then(function () {
			return this$1$1.trigger("doValidate");
		}).then(function () {
			// Validation failed?
			if (!this$1$1._validationResult["result"])
			{
				throw new Error(("PreferenceManager.set(): Validation failed. values=" + (JSON.stringify(values)) + ", invalids=" + (JSON.stringify(this$1$1._validationResult["invalids"]))));
			}

			// Store
			PreferenceOrganizer._store.set("", values, options);

			// Save preferences
			if (BITSMIST.v1.Util.safeGet(options, "autoSave", this$1$1.settings.get("preferences.settings.autoSave")))
			{
				return this$1$1.resources["preferences"].put("", PreferenceOrganizer._store.localItems);
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
	window.BITSMIST.v1.Form = Form;
	window.BITSMIST.v1.List = List;
	window.BITSMIST.v1.FormatterUtil = FormatterUtil;

}());
//# sourceMappingURL=bitsmist-js-extras_v1.js.map
