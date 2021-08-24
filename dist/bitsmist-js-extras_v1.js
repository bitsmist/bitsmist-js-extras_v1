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

			this._observers = [];

		}

		if ( superclass ) ObservableStore.__proto__ = superclass;
		ObservableStore.prototype = Object.create( superclass && superclass.prototype );
		ObservableStore.prototype.constructor = ObservableStore;

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

			var changedKeys = [];
			var holder = ( key ? this.get(key) : this._items );

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

			var notify = BITSMIST.v1.Util.safeGet(options, "notifyOnChange", BITSMIST.v1.Util.safeGet(this._options, "notifyOnChange"));
			if (notify && changedKeys.length > 0)
			{
				return this.notify(changedKeys);
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
				if (this._obvservers[i].id == id)
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
		ObservableStore.prototype.__deepMerge = function __deepMerge (obj1, obj2, changedKeys)
		{

			changedKeys = changedKeys || [];

			BITSMIST.v1.Util.assert(obj1 && typeof obj1 === "object" && obj2 && typeof obj2 === "object", "ObservableStore.__deepMerge(): Parameters must be an object.", TypeError);

			Object.keys(obj2).forEach(function (key) {
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

		};

		return ObservableStore;
	}(BITSMIST.v1.Store));

	// =============================================================================

	// =============================================================================
	//	ObservableStoreMixin
	// =============================================================================

	function ObservableStoreMixin (superClass) { return /*@__PURE__*/(function (superClass) {
			function anonymous(options)
		{

			var defaults = {"notifyOnChange":true, "async":false};
			superClass.call(this, Object.assign(defaults, options));

			Object.assign(this, ObservableStore.prototype);

			this._observers = [];

		}

			if ( superClass ) anonymous.__proto__ = superClass;
			anonymous.prototype = Object.create( superClass && superClass.prototype );
			anonymous.prototype.constructor = anonymous;

			return anonymous;
		}(superClass)); }

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
		if (str && str.length == 8)
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

		if (typeof value == "string")
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
		var fields = rootNode.querySelectorAll("[bm-bind]");
		var elements = Array.prototype.concat([rootNode], Array.prototype.slice.call(fields, 0));

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
		var elements = rootNode.querySelectorAll("[bm-bind]");
		elements = Array.prototype.slice.call(elements, 0);

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

		var elements = rootNode.querySelectorAll(target + " input");
		elements = Array.prototype.slice.call(elements, 0);
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

		if (value === undefined || value == null)
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

	/**
	 * Report validity of the form.
	 *
	 * @param	{HTMLElement}	rootNode			Root node to check.
	 *
	 * @return  {Array of HTMLElements}				Failed elements.
	 */
	FormUtil.checkValidity = function(rootNode)
	{

		var invalids = [];

		var elements = rootNode.querySelectorAll("input");
		elements = Array.prototype.slice.call(elements, 0);

		elements.forEach(function (element) {
			if (!element.checkValidity())
			{
				invalids.push(element);
			}
		});

		return invalids;

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
				if (value.substring(0, 4) == "http" || value.substring(0, 1) == "/")
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
			(element.tagName.toLowerCase() == "input" && element.type.toLowerCase() == "checkbox") ||
			(element.tagName.toLowerCase() == "input" && element.type.toLowerCase() == "radio")
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
				if (element.getAttribute("value") == value)
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

		if (element.tagName.toLowerCase() == "select")
		{
			element.value = value;
		}
		else if (element.tagName.toLowerCase() == "input")
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
				if (element.value == value)
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
				if (conditions == "*" || conditions.indexOf(observerInfo.id) > -1)
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

			var errors = component.settings.get("errors");
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
		ErrorOrganizer.__filter = function __filter (conditions, options, sender, e)
		{

			var result = false;
			var targets = options["component"].settings.get("errors.targets");

			for (var i = 0; i < targets.length; i++)
			{
				if (e.error.name == targets[i])
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

			return ErrorOrganizer._observers.notifyAsync("error", ErrorOrganizer, {"error": e});

		};

		return ErrorOrganizer;
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

			var plugins = component.settings.get("plugins");
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

			console.debug(("PluginOrganizer._addPlugin(): Adding a plugin. componentName=" + (component.name) + ", pluginName=" + pluginName));

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

								promises.push(component.resources[resourceName].get(id, paramters));
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
				var id = BITSMIST.v1.Util.safeGet(options, "id", component.resources[resourceName].target["id"]);
				var parameters = BITSMIST.v1.Util.safeGet(options, "parameters", component.resources[resourceName].target["parameters"]);

				promises.push(component.resources[resourceName].get(id, parameters));
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
			component.querySelectorAll("[bm-submit]").forEach(function (elem) {
				var key = elem.getAttribute("bm-bind");
				submitItem[key] = component.item[key];
			});

			for (var i = 0; i < resources.length; i++)
			{
				var resourceName = resources[i];
				var method = BITSMIST.v1.Util.safeGet(options, "method", component.resources[resourceName].target["method"] || "put"); // Default is "put"
				var id = BITSMIST.v1.Util.safeGet(options, "id", component.resources[resourceName].target["id"]);
				var parameters = BITSMIST.v1.Util.safeGet(options, "parameters", component.resources[resourceName].target["parameters"]);

				promises.push(component.resources[resourceName][method](id, submitItem, parameters));
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

			var resources = BITSMIST.v1.Util.safeGet(options, target, component._settings.get("settings." + target, []));

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
	var ObservableChainableStore = /*@__PURE__*/(function (superclass) {
		function ObservableChainableStore () {
			superclass.apply(this, arguments);
		}if ( superclass ) ObservableChainableStore.__proto__ = superclass;
		ObservableChainableStore.prototype = Object.create( superclass && superclass.prototype );
		ObservableChainableStore.prototype.constructor = ObservableChainableStore;

		

		return ObservableChainableStore;
	}(ObservableStoreMixin(BITSMIST.v1.ChainableStore)));
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
			PreferenceOrganizer._store = new ObservableChainableStore({"chain":PreferenceOrganizer._defaults, "filter":PreferenceOrganizer._filter, "async":true});
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
			if (component.settings.get("preferences.defaults"))
			{
				PreferenceOrganizer._defaults.items = component.settings.get("preferences.defaults");
			}

			// Load preferences
			if (component.settings.get("preferences.settings.load"))
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
		 * @param	{Array}			keys				Changed keys.
		 *
		 * @return  {Promise}		Promise.
		 */
		PreferenceOrganizer._triggerEvent = function _triggerEvent (keys)
		{

			var eventName = this.settings.get("preferences.settings.eventName", "doSetup");

			return this.trigger(eventName, PreferenceOrganizer, {"keys":keys});

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

			if (target == "*")
			{
				result = true;
			}
			else
			{
				target = ( Array.isArray(target) ? target : [target] );
				conditions = ( Array.isArray(conditions) ? conditions : [conditions] );

				for (var i = 0; i < target.length; i++)
				{
					if (conditions.indexOf(target[i]) > -1)
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
				if (elementInfo["rootNode"] == "this" || elementInfo["rootNode"] == component.tagName.toLowerCase())
				{
					elements = [component];
				}
				else
				{
					elements = component.querySelectorAll(elementInfo["rootNode"]);
				}
			}
			else if (elementName == "this" || elementName == component.tagName.toLowerCase())
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

			component._binds.replace(component.resources[resourceName]._item);

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

			component.binds.items = data;

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

			rootNode.querySelectorAll("[bm-bind]").forEach(function (elem) {
				component.binds.bindTo(elem);
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

			component.__isComposing = ( e.keyCode == 229 ? true : false );

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
				if (!component.__cancelSubmit)
				{
					// Modal result
					if (component._isModal)
					{
						component._modalResult["result"] = true;
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
	//	Plugin base class
	// =============================================================================

	var Plugin = function Plugin(component, options)
	{
		var this$1$1 = this;


		this._component = component;
		this._options = new BITSMIST.v1.Store({"items":Object.assign({}, this._getOptions(), options)});
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

	var prototypeAccessors$1 = { name: { configurable: true },component: { configurable: true } };

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	* Component name.
	*
	* @type{String}
	*/
	prototypeAccessors$1.name.get = function ()
	{

		return this._options.get("name");

	};

	// -------------------------------------------------------------------------

	/**
	* Component.
	*
	* @type{String}
	*/
	prototypeAccessors$1.component.get = function ()
	{

		return this._component;

	};

	prototypeAccessors$1.component.set = function (value)
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

	Object.defineProperties( Plugin.prototype, prototypeAccessors$1 );

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

		this._name = resourceName;
		this._component = component;
		this._options = new BITSMIST.v1.Store({"items":Object.assign({}, options)});
		this._data;
		this._items = [];
		this._item = {};
		this._target = {};
		this._currentIndex = 0;

	};

	var prototypeAccessors = { name: { configurable: true },target: { configurable: true },data: { configurable: true },items: { configurable: true },item: { configurable: true },options: { configurable: true } };

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
		 * Fetch target.
		 *
		 * @type{Object}
		 */
	prototypeAccessors.target.get = function ()
	{

		return this._target;

	};

	// -------------------------------------------------------------------------

	/**
		 * Raw data.
		 *
		 * @type{Object}
		 */
	prototypeAccessors.data.get = function ()
	{

		return this._data;

	};

	prototypeAccessors.data.set = function (value)
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
	prototypeAccessors.items.get = function ()
	{

		return this._items;

	};

	// -------------------------------------------------------------------------

	/**
		 * Item.
		 *
		 * @type{Object}
		 */
	prototypeAccessors.item.get = function ()
	{

		return this._item;

	};

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
			this$1$1.data = data;

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

	Object.defineProperties( ResourceHandler.prototype, prototypeAccessors );

	// =============================================================================

	// =============================================================================
	//	Cookie resource handler class
	// =============================================================================

	var CookieResourceHandler = /*@__PURE__*/(function (ResourceHandler) {
		function CookieResourceHandler(component, resourceName, options)
		{

			ResourceHandler.call(this, component, resourceName, options);

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

			var url = this._buildApiUrl(this._name, id, parameters, urlOptions);

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

			var url = this._buildApiUrl(this._name, id, parameters, urlOptions);

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

			var url = this._buildApiUrl(this._name, id, parameters, urlOptions);

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

			var url = this._buildApiUrl(this._name, id, parameters, urlOptions);

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
		LinkedResourceHandler.prototype.get = function get (id, parameters)
		{
			var this$1$1 = this;


			var handlerOptions = this._options.get("handlerOptions");
			var rootNode = handlerOptions["rootNode"];
			var resourceName = handlerOptions["resourceName"];
			var state = handlerOptions["state"];

			var options = { "rootNode": rootNode };
			if (state)
			{
				options["state"] = state;
			}

			return BITSMIST.v1.StateOrganizer.waitFor([options]).then(function () {
				this$1$1._ref = document.querySelector(rootNode).resources[resourceName];
			});

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

		return Reflect.construct(BITSMIST.v1.Pad, [settings], this.constructor);

	}

	BITSMIST.v1.ClassUtil.inherit(Form, BITSMIST.v1.Pad);

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
		this.__cancelSubmit = false;

		// Init component settings
		settings = Object.assign({}, settings, {
			"settings": {
				"autoClear": true,
			},
		});

		// super()
		return BITSMIST.v1.Pad.prototype.start.call(this, settings);

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


		return BITSMIST.v1.Pad.prototype.fetch.call(this, options).then(function () {
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
		var sender = ( options["sender"] ? options["sender"] : this );
		var rootNode = ( "rootNode" in options ? this.querySelector(options["rootNode"]) : this );

		// Clear fields
		var autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this._settings.get("settings.autoClear"));
		if (autoClear)
		{
			this.clear();
		}

		return Promise.resolve().then(function () {
			return this$1$1.trigger("beforeFill", sender, {"options":options});
		}).then(function () {
			FormUtil.setFields(rootNode, this$1$1._item, {"masters":this$1$1.resources, "triggerEvent":"change"});

			return this$1$1.trigger("afterFill", sender, {"options":options});
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
		var sender = ( options["sender"] ? options["sender"] : this );
		var invalids;

		return Promise.resolve().then(function () {
			return this$1$1.trigger("beforeValidate", sender);
		}).then(function () {
			var autoCheckValidate = BITSMIST.v1.Util.safeGet(options, "autoValidate", this$1$1._settings.get("settings.autoCheckValidate"));
			if (autoCheckValidate)
			{
				invalids = FormUtil.checkValidity(this$1$1);
				if (invalids.length > 0)
				{
					this$1$1.__cancelSubmit = true;
				}
			}
		}).then(function () {
			return this$1$1.trigger("doValidate", sender);
		}).then(function () {
			return this$1$1.trigger("afterValidate", sender, {"invalids":invalids});
		}).then(function () {
			var autoReportValidity = BITSMIST.v1.Util.safeGet(options, "autoReportValidity", this$1$1._settings.get("settings.autoReportValidity"));
			if (autoReportValidity)
			{
				var form = this$1$1.querySelector("form");
				if (form && form.reportValidity)
				{
					form.reportValidity();
				}
			}
		}).then(function () {
			return this$1$1.trigger("doReportValidate", sender, {"invalids":invalids});
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
		var sender = ( options["sender"] ? options["sender"] : this );
		this.__cancelSubmit = false;

		// Get values from the form
		this._item = FormUtil.getFields(this);

		return Promise.resolve().then(function () {
			var autoValidate = BITSMIST.v1.Util.safeGet(options, "autoValidate", this$1$1._settings.get("settings.autoValidate"));
			if (autoValidate)
			{
				return this$1$1.validate(options);
			}
		}).then(function () {
			if (!this$1$1.__cancelSubmit)
			{
				return Promise.resolve().then(function () {
					return this$1$1.trigger("beforeSubmit", sender, {"item":this$1$1._item});
				}).then(function () {
					return this$1$1.callOrganizers("doSubmit", options);
				}).then(function () {
					return this$1$1.trigger("doSubmit", sender, {"item":this$1$1._item});
				}).then(function () {
					return this$1$1.trigger("afterSubmit", sender, {"item":this$1$1._item});
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

		return Reflect.construct(BITSMIST.v1.Pad, [], this.constructor);

	}

	BITSMIST.v1.ClassUtil.inherit(List, BITSMIST.v1.Pad);

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
		return BITSMIST.v1.Pad.prototype.start.call(this, settings);

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


		return BITSMIST.v1.Pad.prototype.switchTemplate.call(this, templateName, options).then(function () {
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
		var sender = ( options["sender"] ? options["sender"] : this );

		if (this._isActiveRowTemplate(templateName))
		{
			return Promise.resolve();
		}

		return Promise.resolve().then(function () {
			console.debug(("List.switchRowTemplate(): Switching a row template. name=" + (this$1$1.name) + ", rowTemplateName=" + templateName + ", id=" + (this$1$1.id)));
			return this$1$1.addTemplate(templateName);
		}).then(function () {
			this$1$1._activeRowTemplateName = templateName;
		}).then(function () {
			return this$1$1.callOrganizers("afterRowAppend", this$1$1._settings.items);
		}).then(function () {
			return this$1$1.trigger("afterRowAppend", sender, {"options":options});
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


		return BITSMIST.v1.Pad.prototype.fetch.call(this, options).then(function () {
			var resourceName = this$1$1.settings.get("settings.resourceName");
			if (resourceName && this$1$1.resources && this$1$1.resources[resourceName])
			{
				this$1$1.items = this$1$1.resources[resourceName]._items;
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
		var sender = ( options["sender"] ? options["sender"] : this );

		var rowAsync = BITSMIST.v1.Util.safeGet(options, "async", this._settings.get("settings.async", true));
		var builder = ( rowAsync ? this._buildAsync : this._buildSync );
		var fragment = document.createDocumentFragment();
		this._listRootNode = this.querySelector(this._settings.get("settings.listRootNode"));
		this._rows = [];

		return Promise.resolve().then(function () {
			return this$1$1.trigger("beforeFill", sender, {"options":options});
		}).then(function () {
			return builder.call(this$1$1, fragment, this$1$1._items);
		}).then(function () {
			var autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this$1$1._settings.get("settings.autoClear"));
			if (autoClear)
			{
				this$1$1.clear();
			}
		}).then(function () {
			this$1$1._listRootNode.appendChild(fragment);
		}).then(function () {
			return this$1$1.trigger("afterFill", sender, {"options":options});
		});

	};

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Check if the template is active.
	 *
	 * @param	{String}		templateName		Template name.
	 *
	 * @return  {Boolean}		True when active.
	 */
	List.prototype._isActiveRowTemplate = function(templateName)
	{

		var ret = false;

		if (this._activeRowTemplateName == templateName)
		{
			ret = true;
		}

		return ret;

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


		var chain = Promise.resolve();
		var rowEvents = this._settings.get("rowevents");
		var template = this._templates[this._activeRowTemplateName].html;

		var loop = function ( i ) {
			chain = chain.then(function () {
				return this$1$1.__appendRowSync(fragment, i, items[i], template, rowEvents);
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

		var rowEvents = this._settings.get("rowevents");
		var template = this._templates[this._activeRowTemplateName].html;

		for (var i = 0; i < items.length; i++)
		{
			this.__appendRowAsync(fragment, i, items[i], template, rowEvents);
		}

	};

	// -----------------------------------------------------------------------------
	//  Privates
	// -----------------------------------------------------------------------------

	/**
	 * Append a new row synchronously.
	 *
	 * @param	{HTMLElement}	rootNode				Root node to append a row.
	 * @param	{integer}		no						Line no.
	 * @param	{Object}		item					Row data.
	 * @param	{String}		template				Template html.
	 * @param	{Object}		clickHandler			Row's click handler info.
	 * @param	{Object}		eventElements			Elements' event info.
	 *
	 * @return  {Promise}		Promise.
	 */
	List.prototype.__appendRowSync = function(rootNode, no, item, template, rowEvents)
	{
		var this$1$1 = this;


		// Append a row
		var ele = document.createElement("div");
		ele.innerHTML = template;
		var element = ele.firstElementChild;
		rootNode.appendChild(element);

		this._rows.push(element);

		// set row elements click event handler
		if (rowEvents)
		{
			Object.keys(rowEvents).forEach(function (elementName) {
				this$1$1.initEvents(elementName, rowEvents[elementName], element);
			});
		}

		// Call event handlers
		return Promise.resolve().then(function () {
			return this$1$1.trigger("beforeFillRow", this$1$1, {"item":item, "no":no, "element":element});
		}).then(function () {
			// Fill fields
			FormUtil.setFields(element, item, {"masters":this$1$1.resources});
		}).then(function () {
			return this$1$1.trigger("afterFillRow", this$1$1, {"item":item, "no":no, "element":element});
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
	 * @param	{Object}		clickHandler			Row's click handler info.
	 * @param	{Object}		eventElements			Elements' event info.
	 */
	List.prototype.__appendRowAsync = function(rootNode, no, item, template, rowEvents)
	{
		var this$1$1 = this;


		// Append a row
		var ele = document.createElement("div");
		ele.innerHTML = template;
		var element = ele.firstElementChild;
		rootNode.appendChild(element);

		this._rows.push(element);

		// set row elements click event handler
		if (rowEvents)
		{
			Object.keys(rowEvents).forEach(function (elementName) {
				this$1$1.initEvents(elementName, rowEvents[elementName], element);
			});
		}

		// Call event handlers
		this.triggerAsync("beforeFillRow", this, {"item":item, "no":no, "element":element});
		FormUtil.setFields(element, item, {"masters":this.resources});
		this.triggerAsync("afterFillRow", this, {"item":item, "no":no, "element":element});

	};

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

		return Reflect.construct(BITSMIST.v1.Pad, [settings], this.constructor);

	}

	BITSMIST.v1.ClassUtil.inherit(PreferenceManager, BITSMIST.v1.Component);

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
	 * @param	{String}		key					Key to store.
	 * @param	{Object}		value				Value to store.
	 * @param	{Object}		options				Options.
	 */
	PreferenceManager.prototype.set = function(key, value, options)
	{

		PreferenceOrganizer._store.set(key, value, options);

		// Save preferences
		if (BITSMIST.v1.Util.safeGet(options, "autoSave", this.settings.get("preferences.settings.autoSave")))
		{
			return this.resources["preferences"].put("", PreferenceOrganizer._store.localItems);
		}

	};

	// -------------------------------------------------------------------------

	customElements.define("bm-preference", PreferenceManager);

	window.BITSMIST = window.BITSMIST || {};
	window.BITSMIST.v1 = window.BITSMIST.v1 || {};
	window.BITSMIST.v1.ObservableStore = ObservableStore;
	window.BITSMIST.v1.ObservableStoreMixin = ObservableStoreMixin;
	window.BITSMIST.v1.BindableStore = BindableStore;
	BITSMIST.v1.OrganizerOrganizer.organizers.set("ErrorOrganizer", {"object":ErrorOrganizer, "targetWords":"errors", "targetEvents":["beforeStart"], "order":100});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("FileOrganizer", {"object":FileOrganizer, "targetWords":"files", "targetEvents":["afterSpecLoad"], "order":200});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("PluginOrganizer", {"object":PluginOrganizer, "targetWords":"plugins", "targetEvents":["beforeStart"], "order":1100});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("ResourceOrganizer", {"object":ResourceOrganizer, "targetWords":"resources", "targetEvents":["beforeStart", "afterSpecLoad", "doFetch", "doSubmit"], "order":1300});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("PreferenceOrganizer", {"object":PreferenceOrganizer, "targetWords":"preferences", "targetEvents":["beforeStart"], "order":1400});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("ElementOrganizer", {"object":ElementOrganizer, "targetWords":"elements", "targetEvents":["beforeStart"], "order":2100});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("DatabindingOrganizer", {"object":DatabindingOrganizer, "targetWords":"data", "targetEvents":["afterAppend"], "order":2100});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("KeyOrganizer", {"object":KeyOrganizer, "targetWords":"keys", "targetEvents":["afterAppend"], "order":2100});
	window.BITSMIST.v1.Plugin = Plugin;
	window.BITSMIST.v1.CookieResourceHandler = CookieResourceHandler;
	window.BITSMIST.v1.ApiResourceHandler = ApiResourceHandler;
	window.BITSMIST.v1.ObjectResourceHandler = ObjectResourceHandler;
	window.BITSMIST.v1.LinkedResourceHandler = LinkedResourceHandler;
	window.BITSMIST.v1.Form = Form;
	window.BITSMIST.v1.List = List;
	window.BITSMIST.v1.FormatterUtil = FormatterUtil;

}());
//# sourceMappingURL=bitsmist-js-extras_v1.js.map
