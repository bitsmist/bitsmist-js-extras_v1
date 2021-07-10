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
		ObservableStore.prototype.set = function set (key, value)
		{

			var changedKeys = [];
			var holder = ( key ? this.get(key) : this._items );

			if (typeof holder == "object")
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

			if (BITSMIST.v1.Util.safeGet(this._options, "notifyOnChange") && changedKeys.length > 0)
			{
				this.notify(changedKeys);
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

					if ((ref = this$1$1)._filter.apply(ref, [ conditions, this$1$1._observers[i]["options"] ].concat( args )))
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

	var ObservableStoreMixin = function (superClass) { return /*@__PURE__*/(function (superClass) {
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
		}(superClass)); };

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
	//	DOM Util class
	// =============================================================================

	var DomUtil = function DomUtil () {};

	DomUtil.setElementValue = function setElementValue (element, value)
	{

		if (value === null || value == undefined)
		{
			value = "";
		}

		var sanitizedValue = value;

		// Target
		var target = element.getAttribute("bm-bindtarget");
		if (target)
		{
			var items = target.split(",");
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
					attr = ( attr ? attr + " " + value : sanitizedValue );
					element.setAttribute(item, attr);
					break;
				}
			}
		}
		else
		{
			// Set value
			if (element.hasAttribute("value"))
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
			}
			else if (element.tagName.toLowerCase() == "select")
			{
				element.value = value;
			}
			else if (element.tagName.toLowerCase() == "fieldset")
			;
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
		}

		// Trigger change event
		var e = document.createEvent("HTMLEvents");
		e.initEvent("change", true, true);
		element.dispatchEvent(e);

	};

	// -----------------------------------------------------------------------------

	/**
		 * Get  a value from a element.
		 *
		 * @param{Object}	element			Html element.
		 *
		 * @return  {string}	Value.
		 */
	DomUtil.getElementValue = function getElementValue (element)
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
		 * Build element.
		 *
		 * @param{HTMLElement}rootNode		Form node.
		 * @param{String}	target			Target.
		 * @param{Object}	item			Values to fill.
		 */
	DomUtil.build = function build (element, item)
	{

		if (element.tagName.toLowerCase() == "select")
		{
			// Select
			element.options.length = 0;

			if ("emptyItem" in item)
			{
				var text = ( "text" in item["emptyItem"] ? item["emptyItem"]["text"] : "");
				var value = ( "value" in item["emptyItem"] ? item["emptyItem"]["value"] : "");
				var option = document.createElement("option");
				option.text = text;
				option.value = value;
				option.setAttribute("selected", "");
				element.appendChild(option);
			}

			Object.keys(item.items).forEach(function (id) {
				var option = document.createElement("option");
				option.text = item.items[id]["title"];
				option.value = id;
				element.appendChild(option);
			});
		}
		else
		{
			// Radio
			Object.keys(item.items).forEach(function (id) {
				var label = document.createElement("label");
				var option = document.createElement("input");
				option.type = "radio";
				option.id = key;
				option.name = key;
				option.value = id;
				option.setAttribute("bm-bind", key);
	//			option.setAttribute("bm-submit", "");
				label.appendChild(option);
				label.appendChild(document.createTextNode(item.items[id]["title"]));
				element.appendChild(label);
			});
		}

	};

	// =============================================================================

	// =============================================================================
	//	Bindable store class
	// =============================================================================

	var BindableStore = /*@__PURE__*/(function (ObservableStore) {
		function BindableStore () {
			ObservableStore.apply(this, arguments);
		}

		if ( ObservableStore ) BindableStore.__proto__ = ObservableStore;
		BindableStore.prototype = Object.create( ObservableStore && ObservableStore.prototype );
		BindableStore.prototype.constructor = BindableStore;

		BindableStore.prototype.bindTo = function bindTo (elem)
		{
			var this$1$1 = this;


			var key = elem.getAttribute("bm-bind");

			// Init element's value
			DomUtil.setElementValue(elem, this.get(key));

			var bound = ( elem.__bm_bindinfo && elem.__bm_bindinfo.bound ? true : false );
			if (!bound && BITSMIST.v1.Util.safeGet(this._options, "2way", true))
			{
				// Change element's value when store value changed
				this.subscribe(key, function () {
					DomUtil.setElementValue(elem, this$1$1.get(key));
				});

				// Set store value when element's value changed
				var eventName = BITSMIST.v1.Util.safeGet(this._options, "eventName", "change");
				elem.addEventListener(eventName, (function () {
					this$1$1.set(key, DomUtil.getElementValue(elem));
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

			return settings;

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

			return Promise.all(promises).then(function () {
				return settings;
			});

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

		PluginOrganizer.init = function init (conditions, component, settings)
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

			return settings;

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
		 * @param	{Object}		conditions			Conditions.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		settings			Settings.
		 */
		PreferenceOrganizer.init = function init (conditions, component, settings)
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
				chain = PreferenceOrganizer.load(component).then(function (preferences) {
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
				return settings;
			});

		};

		// -------------------------------------------------------------------------

		/**
	 	 * Load preferences.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		PreferenceOrganizer.load = function load (component, options)
		{

			var sender = ( options && options["sender"] ? options["sender"] : component );

			return component.trigger("doLoadStore", sender);

		};

		// -------------------------------------------------------------------------

		/**
	 	 * Save preferences.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 *
		 * @return  {Promise}		Promise.
		 */
		PreferenceOrganizer.save = function save (component, options)
		{

			var sender = ( options && options["sender"] ? options["sender"] : component );

			return component.trigger("doSaveStore", sender, {"data":PreferenceOrganizer._store.items});

		};

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
	 	 * Load preferences.
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
	/**
	 * BitsmistJS - Javascript Web Client Framework
	 *
	 * @copyright		Masaki Yasutake
	 * @link			https://bitsmist.com/
	 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
	 */
	// =============================================================================

	// =============================================================================
	//	Resource util class
	// =============================================================================

	var ResourceUtil = function ResourceUtil(resourceName, options)
	{

		this._name = resourceName;
		this._options = options;
		this._data;
		this._parameters = {};

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
	ResourceUtil.prototype.get = function get (id, parameters)
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
		 * @param{String}	id				Target id.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceUtil.prototype.delete = function delete$1 (id, parameters)
	{
			var this$1$1 = this;


		var method = "DELETE";
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
		 * Insert data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	items			Data to insert.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceUtil.prototype.insert = function insert (id, items, parameters)
	{
			var this$1$1 = this;


		var method = "POST";
		var headers = this._getOption("headers", method);
		var options = this._getOption("options", method);
		var urlOptions = this._getOption("url", method);
		var dataType = urlOptions["dataType"];

		var url = this._buildApiUrl(this._name, id, parameters, urlOptions);

		return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(items, dataType)}).then(function (xhr) {
			return this$1$1._convertResponseData(xhr.responseText, dataType);
		});

	};

	    // -------------------------------------------------------------------------

	/**
		 * Update data.
		 *
		 * @param{String}	id				Target id.
		 * @param{Object}	items			Data to update.
		 * @param{Object}	parameters		Query parameters.
		 *
		 * @return  {Promise}	Promise.
		 */
	ResourceUtil.prototype.update = function update (id, items, parameters)
	{
			var this$1$1 = this;


		var method = "PUT";
		var headers = this._getOption("headers", method);
		var options = this._getOption("options", method);
		var urlOptions = this._getOption("url", method);
		var dataType = urlOptions["dataType"];

		var url = this._buildApiUrl(this._name, id, parameters, urlOptions);

		return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(items, dataType)}).then(function (xhr) {
			return this$1$1._convertResponseData(xhr.responseText, dataType);
		});

	};

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
		 * Convert request data to specified format.
		 *
		 * @param{Object}	items			Data to convert.
		 * @param{String}	dataType		Target data type.
		 *
		 * @return  {String}	Converted data.
		 */
	ResourceUtil.prototype._convertRequestData = function _convertRequestData (items, dataType)
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
		 * @param{Object}	items			Data to convert.
		 * @param{String}	dataType		Source data type.
		 *
		 * @return  {String}	Converted data.
		 */
	ResourceUtil.prototype._convertResponseData = function _convertResponseData (items, dataType)
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
		 * @param{String}	target			"ajaxHeaders" or "ajaxOptions"..
		 * @param{String}	method			Method.
		 *
		 * @return  {Object}	Options.
		 */
	ResourceUtil.prototype._getOption = function _getOption (target, method)
	{

		var settings = ("settings" in this._options ? this._options["settings"] : {});
		var options1 = (target in settings && "COMMON" in settings[target] ? settings[target]["COMMON"] : {} );
		var options2 = (target in settings && method in settings[target] ? settings[target][method] : {} );

		return Object.assign(options1, options2);

	};

	// -------------------------------------------------------------------------

	/**
		 * Build url for the api.
		 *
		 * @param{String}	resource		API resource.
		 * @param{String}	id				Id for the resource.
		 * @param{Object}	options			Url options.
		 *
		 * @return  {String}	Url.
		 */
	ResourceUtil.prototype._buildApiUrl = function _buildApiUrl (resourceName, id, parameters, options)
	{

		var baseUrl = options["baseUrl"];
		var scheme = options["scheme"];
		var host = options["host"];
		var dataType = options["dataType"];
		var version = options["version"];
		var format = ( options["format"] ? options["format"] : "@baseUrl@@query@" );	var url = format.
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
		 * @param{Object}	paratemers		Query parameters.
		 *
		 * @return  {String}	Query string.
		 */
	ResourceUtil.prototype._buildUrlQuery = function _buildUrlQuery (parameters)
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

	// =============================================================================

	// =============================================================================
	//	Master util class
	// =============================================================================

	var MasterUtil = /*@__PURE__*/(function (ResourceUtil) {
		function MasterUtil(resourceName, options)
		{

			ResourceUtil.call(this, resourceName, options);

			this._items;

			if ("items" in options)
			{
				var items;
				if (typeof options["items"] === "object")
				{
					items = options["items"];
				}
				else
				{
					var c = window;
					options["items"].split(".").forEach(function (value) {
						c = c[value];
						if (!c)
						{
							throw new ReferenceError(("Master not found. Master=" + (options["items"])));
						}
					});
					items = c;
				}
				this._items = this.__reshapeItems(items);
			}

		}

		if ( ResourceUtil ) MasterUtil.__proto__ = ResourceUtil;
		MasterUtil.prototype = Object.create( ResourceUtil && ResourceUtil.prototype );
		MasterUtil.prototype.constructor = MasterUtil;

		var prototypeAccessors = { items: { configurable: true } };

		// -------------------------------------------------------------------------
		//  Setter/Getter
		// -------------------------------------------------------------------------

		/**
	     * Master items.
	     *
		 * @type	{Object}
	     */
		prototypeAccessors.items.get = function ()
		{

			return this._items;

		};

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
	     * Load master data.
	     */
		MasterUtil.prototype.load = function load ()
		{
			var this$1$1 = this;


			return this.get("list").then(function (data) {
				this$1$1._items = this$1$1.__reshapeItems(data["data"]);
			});

		};

	    // -------------------------------------------------------------------------

		/**
		 * Get master value for the code.
		 *
		 * @param	{String}		code				Code value.
		 *
		 * @return  {String}		Master value.
		 */
		MasterUtil.prototype.getValue = function getValue (code)
		{

			var ret = code;
			var title = this._options["title"];

			if (this._items && code in this._items)
			{
				ret = this._items[code][title];
			}

			return ret;

		};

	    // -------------------------------------------------------------------------

		/**
		 * Get master data for the code.
		 *
		 * @param	{String}		code				Code value.
		 *
		 * @return  {Object}		Master data.
		 */
		MasterUtil.prototype.getItem = function getItem (code)
		{

			var ret;

			if (this._items && code in this._items)
			{
				ret = this._items[code];
			}

			return ret;

		};

	    // -------------------------------------------------------------------------

		/**
		 * Filter data.
		 *
		 * @param	{String}		predicate			Function to judge whether
		 * 												the value should pass the filter.
		 *
		 * @return  {Object}		Filtered data.
		 */
		MasterUtil.prototype.filter = function filter (predicate)
		{
			var this$1$1 = this;


			var ret = Object.keys(this._items).reduce(function (result, key) {
				if (predicate(this$1$1._items[key]))
				{
					result[key] = this$1$1._items[key];
				}

				return result;
			}, {});

			return ret;

		};

		// -------------------------------------------------------------------------
		//  Privates
		// -------------------------------------------------------------------------

		/**
	     * Reshape an array to master util format object.
	     *
	     * @param	{Object}		target				Target to reshape.
		 *
		 * @return  {Object}		Master object.
	     */
		MasterUtil.prototype.__reshapeItems = function __reshapeItems (target)
		{

			var key = this._options["id"];
			var title = this._options["title"];

			var items = target.reduce(function (result, current) {
				var id = current[key];
				result[id] = current;
				result[id]["title"] = current[title];
				return result;
			}, {});

			return items;

		};

		Object.defineProperties( MasterUtil.prototype, prototypeAccessors );

		return MasterUtil;
	}(ResourceUtil));

	// =============================================================================

	// =============================================================================
	//	Master organizer class
	// =============================================================================

	var MasterOrganizer = /*@__PURE__*/(function (superclass) {
		function MasterOrganizer () {
			superclass.apply(this, arguments);
		}

		if ( superclass ) MasterOrganizer.__proto__ = superclass;
		MasterOrganizer.prototype = Object.create( superclass && superclass.prototype );
		MasterOrganizer.prototype.constructor = MasterOrganizer;

		MasterOrganizer.init = function init (conditions, component, settings)
		{

			// Add properties
			Object.defineProperty(component, 'masters', {
				get: function get() { return this._masters; },
			});

			// Add methods
	//		component.addMaster = function(masterName, options, ajaxSettings) { return MasterOrganizer._initMaster(this, masterName, options, ajaxSettings); }

			// Init vars
			component._masters = {};

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
		MasterOrganizer.organize = function organize (conditions, component, settings)
		{
			var this$1$1 = this;


			var promises = [];

			var masters = settings["masters"];
			if (masters)
			{
				// Get ajax settings
				var settings$1 = component.settings.get("ajaxUtil", {});
				settings$1["url"]["COMMON"]["baseUrl"] = component.settings.get("system.apiBaseUrl", "");

				// Process each master
				Object.keys(masters).forEach(function (masterName) {
					promises.push(this$1$1._initMaster(component, masterName, masters[masterName], settings$1));
				});
			}

			return Promise.all(promises).then(function () {
				return settings;
			});

		};

		// -------------------------------------------------------------------------
		//  Protected
		// -------------------------------------------------------------------------

		/**
		 * Init masters.
		 *
		 * @param	{Component}		component			Component.
		 * @param	{String}		masterName			Master name.
		 * @param	{Object}		options				Masters settings.
		 * @param	{Object}		settings			Ajax settings.
		 */
		MasterOrganizer._initMaster = function _initMaster (component, masterName, options, settings)
		{

			component._masters[masterName] = new MasterUtil(masterName, Object.assign({"settings": settings}, options));

			if (options["autoLoad"])
			{
				return component._masters[masterName].load();
			}

		};

		return MasterOrganizer;
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

			return settings;

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

		DatabindingOrganizer.init = function init (conditions, component, settings)
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

			 var data = settings["binds"];

			// Bind data after the HTML is appended
			DatabindingOrganizer.update(component, data);

			return settings;

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

		KeyOrganizer.init = function init (conditions, component, settings)
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
				component.addEventListener("keydown", function(e){KeyOrganizer.onKeyDown.call(this, e, component, keys, actions);});
				component.addEventListener("keypress", function(e){KeyOrganizer.onKeyPress.call(this, e, component, keys, actions);});
				component.addEventListener("compositionstart", function(e){KeyOrganizer.onCompositionStart.call(this, e, component, keys);});
				component.addEventListener("compositionend", function(e){KeyOrganizer.onCompositionEnd.call(this, e, component, keys);});

				// Init buttons
				Object.keys(keys).forEach(function (key) {
					KeyOrganizer.__initButtons(component, key, keys[key]);
				});
			}

			return settings;

		};

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		/**
	 	 * Key down event handler. Handle keys that do not fire keyPress event.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 * @param	{Object}		actions				Action info.
		 */
		KeyOrganizer.onKeyDown = function onKeyDown (e, component, options, actions)
		{

			var key  = ( e.key ? e.key : KeyOrganizer.__getKeyfromKeyCode(e.keyCode) );
			key = key.toLowerCase();
			key = ( key == "esc" ? "escape" : key ); // For IE11

			switch (key)
			{
				case "escape":
					KeyOrganizer.onKeyPress(e, component, options, actions);
					break;
			}

		};

		// -------------------------------------------------------------------------

		/**
	 	 * Key press event handler.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 * @param	{Object}		actions				Action info.
		 */
		KeyOrganizer.onKeyPress = function onKeyPress (e, component, options, actions)
		{

			// Ignore all key input when composing.
			if (component.__isComposing || e.isComposing || e.keyCode == 229)
			{
				return;
			}

			// Get a key
			var key  = ( e.key ? e.key : KeyOrganizer.__getKeyfromKeyCode(e.keyCode) );
			key = key.toLowerCase();
			key = ( key == "esc" ? "escape" : key ); // For IE11

			// Take an action according to the key pressed if specified
			if (actions[key])
			{
				actions[key]["handler"].call(this, e, component, actions[key]["option"]);
			}

			return;

		};

		// -------------------------------------------------------------------------

		/**
		 * Composition start event handler.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		KeyOrganizer.onCompositionStart = function onCompositionStart (e, component, options)
		{

			component.__isComposing = true;

		};

		// -------------------------------------------------------------------------

		/**
		 * Composition end event handler.
		 *
		 * @param	{Object}		e					Event info.
		 * @param	{Component}		component			Component.
		 * @param	{Object}		options				Options.
		 */
		KeyOrganizer.onCompositionEnd = function onCompositionEnd (e, component, options)
		{

			component.__isComposing = false;

		};

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

			if (options && options["target"])
			{
				target = this.getAttribute(options["target"]);
			}

			component.clear(component, target);

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

	var prototypeAccessors = { name: { configurable: true },component: { configurable: true } };

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	* Component name.
	*
	* @type{String}
	*/
	prototypeAccessors.name.get = function ()
	{

		return this._options.get("name");

	};

	// -------------------------------------------------------------------------

	/**
	* Component.
	*
	* @type{String}
	*/
	prototypeAccessors.component.get = function ()
	{

		return this._component;

	};

	prototypeAccessors.component.set = function (value)
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

	Object.defineProperties( Plugin.prototype, prototypeAccessors );

	// =============================================================================

	// =============================================================================
	//	Cookie store handler class
	// =============================================================================

	var CookieStoreHandler = /*@__PURE__*/(function (Plugin) {
		function CookieStoreHandler(component, options)
		{

			Plugin.call(this, component, options);

			this._cookieName = this._options.get("cookieOptions.name", "preferences");

		}

		if ( Plugin ) CookieStoreHandler.__proto__ = Plugin;
		CookieStoreHandler.prototype = Object.create( Plugin && Plugin.prototype );
		CookieStoreHandler.prototype.constructor = CookieStoreHandler;

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		/**
		* Do load store event handler.
		*
		* @param	{Object}		sender				Sender.
		* @param	{Object}		e					Event info.
	 	 * @param	{Object}		ex					Extra event info.
		*/
		CookieStoreHandler.prototype.onDoLoadStore = function onDoLoadStore (sender, e, ex)
		{

			var data = this.__getCookie(this._cookieName);

			return data;

		};

		// -------------------------------------------------------------------------

		/**
		* Do save store event handler.
		*
		* @param	{Object}		sender				Sender.
		* @param	{Object}		e					Event info.
	 	 * @param	{Object}		ex					Extra event info.
		*/
		CookieStoreHandler.prototype.onDoSaveStore = function onDoSaveStore (sender, e, ex)
		{

			this.__setCookie(this._cookieName, e.detail.data);

		};

		// -----------------------------------------------------------------------------
		//  Protected
		// -----------------------------------------------------------------------------

		/**
		 * Get plugin options.
		 *
		 * @return  {Object}		Options.
		 */
		CookieStoreHandler.prototype._getOptions = function _getOptions ()
		{

			return {
				"events": {
					"doLoadStore": this.onDoLoadStore,
					"doSaveStore": this.onDoSaveStore,
				}
			};

		};

		// -----------------------------------------------------------------------------
		//  Privates
		// -----------------------------------------------------------------------------

		/**
		* Get cookie.
		*
		* @param	{String}		key					Key.
		*/
		CookieStoreHandler.prototype.__getCookie = function __getCookie (key)
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
		CookieStoreHandler.prototype.__setCookie = function __setCookie (key, value)
		{

			var cookie = key + "=" + encodeURIComponent(JSON.stringify(value)) + "; ";
			var options =this._options.get("cookieOptions", {});

			cookie += Object.keys(options).reduce(function (result, current) {
				result += current + "=" + options[current] + "; ";

				return result;
			}, "");

			document.cookie = cookie;

		};

		return CookieStoreHandler;
	}(Plugin));

	// =============================================================================

	// =============================================================================
	//	Resource handler class
	// =============================================================================

	var ResourceHandler = /*@__PURE__*/(function (Plugin) {
		function ResourceHandler(component, options)
		{
			var this$1$1 = this;


			Plugin.call(this, component, options);

			this._options.set("settings", this._component.settings.get("ajaxUtil", ""));
			this._options.set("settings.url.COMMON.baseUrl", this._component.settings.get("system.apiBaseUrl", ""));
			this._resources = {};
			this._defaultResourceName;

			var resources = this._options.get("resources", []);
			Object.keys(resources).forEach(function (index) {
				var resourceName = resources[index];
				this$1$1.addResource(resourceName, {
					"settings":	this$1$1._options.get("settings", {})
				});
			});

			this.switchResource(resources[0]);

		}

		if ( Plugin ) ResourceHandler.__proto__ = Plugin;
		ResourceHandler.prototype = Object.create( Plugin && Plugin.prototype );
		ResourceHandler.prototype.constructor = ResourceHandler;

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
	     * Add a resource.
	     *
	     * @param	{string}		resourceName		Resource name.
	     * @param	{array}			options				Options.
	     */
		ResourceHandler.prototype.addResource = function addResource (resourceName, options)
		{

			// Create a resource object
			this._resources[resourceName] = new ResourceUtil(resourceName, Object.assign({
				"settings":	options["settings"],
			}));

			// Expose
			this[resourceName] = this._resources[resourceName];

		};

		// -------------------------------------------------------------------------

		/**
	     * Switch to a resource.
	     *
	     * @param	{string}		resourceName		Resource name.
	     */
		ResourceHandler.prototype.switchResource = function switchResource (resourceName)
		{

			this._defaultResourceName = resourceName;

		};

		// -------------------------------------------------------------------------
		//  Event handlers
		// -------------------------------------------------------------------------

		/**
		 * Do fetch event handler.
		 *
		 * @param	{Object}		sender				Sender.
		 * @param	{Object}		e					Event info.
	 	 * @param	{Object}		ex					Extra event info.
		 */
		ResourceHandler.prototype.onDoFetch = function onDoFetch (sender, e, ex)
		{
			var this$1$1 = this;


			var id = BITSMIST.v1.Util.safeGet(e.detail.target, "id");
			var parameters = BITSMIST.v1.Util.safeGet(e.detail.target, "parameters");
			var autoLoad = BITSMIST.v1.Util.safeGet(e.detail.options, "autoLoad", this._options.get("autoLoad"));

			if (autoLoad)
			{
				return this._resources[this._defaultResourceName].get(id, parameters).then(function (data) {
					this$1$1._component.data = data;
					if ("items" in this$1$1._component)
					{
						this$1$1._component.items = this$1$1._options.get("itemsGetter", function(data){return data["data"]})(data);
					}
					else if ("item" in this$1$1._component)
					{
						this$1$1._component.item = this$1$1._options.get("itemGetter", function(data){return data["data"][0]})(data);
					}
				});
			}

		};

		// -------------------------------------------------------------------------

		/**
		* Do submit event handler.
		*
		* @param	{Object}		sender				Sender.
		* @param	{Object}		e					Event info.
	 	* @param	{Object}		ex					Extra event info.
		*/
		ResourceHandler.prototype.onDoSubmit = function onDoSubmit (sender, e, ex)
		{
			var this$1$1 = this;


			var id = BITSMIST.v1.Util.safeGet(e.detail.target, "id");
			BITSMIST.v1.Util.safeGet(e.detail.target, "parameters");
			var items = BITSMIST.v1.Util.safeGet(e.detail, "items");
			var submitData = [];
			var targetKeys = {};
			var component = ex.component;

			// Get target keys to submit
			component.querySelectorAll("[bm-bind]").forEach(function (elem) {
				if (elem.hasAttribute("bm-submit"))
				{
					targetKeys[elem.getAttribute("bm-bind")] = true;
				}
			});

			// Remove unnecessary items
			var loop = function ( i ) {
				var item = {};
				Object.keys(items[i]).forEach(function (key) {
					if (targetKeys[key])
					{
						item[key] = items[i][key];
					}
				});
				submitData.push(item);
			};

			for (var i = 0; i < items.length; i++)
			loop( i );

			// Submit
			return Promise.resolve().then(function () {
				if (id)
				{
					return this$1$1._resources[this$1$1._defaultResourceName].update(id, {items:submitData});
				}
				else
				{
					return this$1$1._resources[this$1$1._defaultResourceName].insert(id, {items:submitData});
				}
			});

		};

		// -----------------------------------------------------------------------------
		//  Protected
		// -----------------------------------------------------------------------------

		/**
		 * Get plugin options.
		 *
		 * @return  {Object}		Options.
		 */
		ResourceHandler.prototype._getOptions = function _getOptions ()
		{

			return {
				"events": {
					"doFetch": this.onDoFetch,
					"doSubmit": this.onDoSubmit,
				}
			};

		};

		return ResourceHandler;
	}(Plugin));

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
	 */
	FormUtil.setFields = function(rootNode, item, masters)
	{
		var this$1$1 = this;


		var fields = rootNode.querySelectorAll("[bm-bind]");
		var elements = Array.prototype.concat([rootNode], Array.prototype.slice.call(fields, 0));
		elements.forEach(function (element) {
			var fieldName = element.getAttribute("bm-bind");
			if (fieldName in item)
			{
				if (element.hasAttribute("bm-master"))
				{
					var type = element.getAttribute("bm-master");
					var value = this$1$1.getMasterValue(masters, type, item[fieldName]);
					this$1$1.setValue(element, value);
				}
				else
				{
					this$1$1.setValue(element, item[fieldName]);
				}
			}
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get form values.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 * @param	{String}		target				Target.
	 *
	 * @return  {Object}		Values.
	 */
	FormUtil.getFields = function(rootNode, target)
	{
		var this$1$1 = this;


		var item = {};
		target = (target ? target : "");

		var elements = rootNode.querySelectorAll(target + " [bm-submit]");
		elements = Array.prototype.slice.call(elements, 0);
		elements.forEach(function (element) {
			var key = element.getAttribute("bm-bind");
			var value = this$1$1.getValue(element);

			//if (value)
			{
				if (Array.isArray(item[key]))
				{
					if (value)
					{
						item[key].push(value);
					}
				}
				else if (item[key])
				{
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
			}
			/*
			else
			{
				item[key] = "";
			}
			*/
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
	 * Build the form.
	 *
	 * @param	{HTMLElement}	rootNode			Form node.
	 * @param	{String}		target				Target.
	 * @param	{Object}		item				Values to fill.
	 */
	FormUtil.buildFields = function(rootNode, fieldName, item)
	{

		var elements = rootNode.querySelectorAll("[bm-bind='" + fieldName + "']");
		elements = Array.prototype.slice.call(elements, 0);
		elements.forEach(function (element) {
			if (element.tagName.toLowerCase() == "select")
			{
				// Select
				element.options.length = 0;

				if ("emptyItem" in item)
				{
					var text = ( "text" in item["emptyItem"] ? item["emptyItem"]["text"] : "");
					var value = ( "value" in item["emptyItem"] ? item["emptyItem"]["value"] : "");
					var option = document.createElement("option");
					option.text = text;
					option.value = value;
					option.setAttribute("selected", "");
					element.appendChild(option);
				}

				Object.keys(item.items).forEach(function (id) {
					var option = document.createElement("option");
					option.text = item.items[id]["title"];
					option.value = id;
					element.appendChild(option);
				});
			}
			else
			{
				// Radio
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
			}
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get master value.
	 *
	 * @param	{array}			masters				Master values.
	 * @param	{string}		type				Master type.
	 * @param	{string}		code				Code value.
	 *
	 * @return  {string}		Master value.
	 */
	FormUtil.getMasterValue = function(masters, type, code)
	{

		var ret = code;
		if (masters && (type in masters))
		{
			ret = masters[type].getValue(code);
		}

		return ret;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Set value to the element.
	 *
	 * @param	{Object}		element				Html element.
	 * @param	{string}		value				Value.
	 */
	FormUtil.setValue = function(element, value)
	{

		if (value === null || value == undefined)
		{
			value = "";
		}

		// Format
		if (element.hasAttribute("bm-format"))
		{
			value = FormatterUtil.format("", element.getAttribute("bm-format"), value);
		}

		var sanitizedValue = FormatterUtil.sanitize(value);

		// Target
		var target = element.getAttribute("bm-target");
		if (target)
		{
			var items = target.split(",");
			for (var i = 0; i < items.length; i++)
			{
				var item = items[i].toLowerCase();
				switch (item)
				{
				case "html":
						element.innerHTML = value;
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
					attr = ( attr ? attr + " " + value : sanitizedValue );
					element.setAttribute(item, attr);
					break;
				}
			}
		}
		else
		{
			// Set value
			if (element.hasAttribute("value"))
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
					element.setAttribute("value", FormatterUtil.sanitize(value));
				}
			}
			else if (element.tagName.toLowerCase() == "select")
			{
				element.value = value;
			}
			else if (element.tagName.toLowerCase() == "fieldset")
			;
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
		}

		// Trigger change event
		var e = document.createEvent("HTMLEvents");
		e.initEvent("change", true, true);
		element.dispatchEvent(e);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get value from the element.
	 *
	 * @param	{Object}		element				Html element.
	 *
	 * @return  {string}		Value.
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

		// Deformat
		if (element.hasAttribute("bm-format"))
		{
			ret = BITSMIST.v1.FormatterUtil.deformat("", element.getAttribute("bm-format"), ret);
		}

		return ret;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Report validity of the form.
	 *
	 * @param	{HTMLElement}	rootNode			Root node to check.
	 *
	 * @return  {Boolean}		True:OK, False:NG.
	 */
	FormUtil.reportValidity = function(rootNode)
	{

		var ret = true;

		var elements = rootNode.querySelectorAll("input");
		elements = Array.prototype.slice.call(elements, 0);
		elements.forEach(function (element) {
			var type = element.getAttribute("type");
			switch (type)
			{
				case "number":
					console.error(element.validity);
					if ((element.validity && element.validity.valid == false) || isNaN(element.value))
					{
						element.style.border = "solid 3px red";
						ret = false;
					}
					break;
			}
		});

		return ret;

	};

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

	/**
	 * Raw data retrieved via api.
	 *
	 * @type	{Object}
	 */
	Object.defineProperty(Form.prototype, 'data', {
		get: function get()
		{
			return this._data;
		},
		set: function set(value)
		{
			this._data= value;
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
		this._id;
		this._parameters;
		this._item = {};
		this.__cancelSubmit = false;
		this._target = {};

		// Init component settings
		settings = Object.assign({}, settings, {
			"settings": {
				"autoClear": true,
			}
		});

		// super()
		return BITSMIST.v1.Pad.prototype.start.call(this, settings);

	};

	// -----------------------------------------------------------------------------

	/**
	 * Build form.
	 *
	 * @param	{Object}		items				Items to fill elements.
	 *
	 * @return  {Promise}		Promise.
	 */
	Form.prototype.build = function(items)
	{
		var this$1$1 = this;


		Object.keys(items).forEach(function (key) {
			FormUtil.buildFields(this$1$1, key, items[key]);
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
		var rootNode = ( "target" in options ? this.querySelector(options["target"]) : this );

		this._target["id"] = ( "id" in options ? options["id"] : this._target["id"] );
		this._target["parameters"] = ( "parameters" in options ? options["parameters"] : this._target["parameters"] );

		// Clear fields
		var autoClear = BITSMIST.v1.Util.safeGet(options, "settings.autoClear", this._settings.get("settings.autoClear"));
		if (autoClear)
		{
			this.clear(rootNode);
		}

		return Promise.resolve().then(function () {
			if (BITSMIST.v1.Util.safeGet(options, "autoLoad", true))
			{
				return Promise.resolve().then(function () {
					return this$1$1.trigger("doTarget", sender, {"target": this$1$1._target, "options":options});
				}).then(function () {
					return this$1$1.trigger("beforeFetch", sender, {"target": this$1$1._target, "options":options});
				}).then(function () {
					return this$1$1.trigger("doFetch", sender, {"target": this$1$1._target, "options":options});
				}).then(function () {
					return this$1$1.trigger("afterFetch", sender, {"target": this$1$1._target, "options":options});
				});
			}
		}).then(function () {
			return this$1$1.trigger("beforeFill", sender);
		}).then(function () {
			FormUtil.setFields(rootNode, this$1$1._item, this$1$1.masters);
			return this$1$1.trigger("afterFill", sender);
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Clear the form.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @param	{string}		target				Target.
	 */
	Form.prototype.clear = function(rootNode, target)
	{

		rootNode = ( rootNode ? rootNode : this );

		return FormUtil.clearFields(rootNode, target);

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

		return Promise.resolve().then(function () {
			return this$1$1.trigger("beforeValidate", sender);
		}).then(function () {
			var ret = true;
			var form = this$1$1.querySelector("form");

			var autoValidate = BITSMIST.v1.Util.safeGet(options, "autoValidate", this$1$1._settings.get("settings.autoValidate"));
			if (autoValidate)
			{
				if (form && form.reportValidity)
				{
					ret = form.reportValidity();
				}
				else
				{
					ret = FormUtil.reportValidity(this$1$1);
				}
			}

			if (!ret)
			{
				this$1$1.__cancelSubmit = true;
			}
			return this$1$1.trigger("afterValidate", sender);
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
		delete options["sender"];
		this.__cancelSubmit = false;
		this._item = this.getFields();
		var itemGetter = BITSMIST.v1.Util.safeGet(options, "itemGetter", this.settings.get("settings.itemGetter", function(item){return [item]}));

		return Promise.resolve().then(function () {
			return this$1$1.validate();
		}).then(function () {
			return this$1$1.trigger("beforeSubmit", sender);
		}).then(function () {
			if (!this$1$1.__cancelSubmit)
			{
				var items = itemGetter(this$1$1._item);
				return this$1$1.trigger("doSubmit", sender, {"target":this$1$1._target, "items":items});
			}
		}).then(function () {
			var items = itemGetter(this$1$1._item);
			return this$1$1.trigger("afterSubmit", sender, {"target":this$1$1._target, "items":items});
		});

	};

	// -----------------------------------------------------------------------------

	/**
	 * Get the form values.
	 *
	 * @return  {array}			Form values.
	 */
	Form.prototype.getFields = function()
	{

		return FormUtil.getFields(this);

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
	Object.defineProperty(List.prototype, 'row', {
		get: function get()
		{
			return this._row;
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

	/**
	 * Raw data retrieved via api.
	 *
	 * @type	{Object}
	 */
	Object.defineProperty(List.prototype, 'data', {
		get: function get()
		{
			return this._data;
		},
		set: function set(value)
		{
			this._data= value;
		}
	});

	// -----------------------------------------------------------------------------
	//  Event handlers
	// -----------------------------------------------------------------------------

	/**
	 * After append event hadler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 * @param	{Object}		ex					Extra event info.
	 */
	List.prototype.onListAfterAppend = function(sender, e, ex)
	{

		this._listRootNode = this.querySelector(this._settings.get("settings.listRootNode"));
		var className = ( this._settings.get("components")[this._settings.get("settings.row")]["className"] ? this._settings.get("components")[this._settings.get("row")]["className"] : this._settings.get("settings.row"));
		this._row = BITSMIST.v1.ClassUtil.createObject(className);
		this._row._parent = this;

		return this._row.start();

	};

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
		this._id;
		this._parameters;
		this._target = {};
		this._data;
		this._items;
		this._listRootNode;
		this._row;
		this._rows;

		// Init component settings
		settings = Object.assign({}, settings, {
			"events": {
				"this": {
					"handlers": {
						"afterAppend": [{
							"handler": this.onListAfterAppend
						}]
					}
				}
			}
		});

		// super()
		return BITSMIST.v1.Pad.prototype.start.call(this, settings);

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

		this._rows = [];
		this._target["id"] = ( "id" in options ? options["id"] : this._target["id"] );
		this._target["parameters"] = ( "parameters" in options ? options["parameters"] : this._target["parameters"] );

		return Promise.resolve().then(function () {
			if (BITSMIST.v1.Util.safeGet(options, "autoLoad", true))
			{
				return Promise.resolve().then(function () {
					return this$1$1.trigger("doTarget", this$1$1, {"target": this$1$1._target, "options":options});
				}).then(function () {
					return this$1$1.trigger("beforeFetch", sender, {"target": this$1$1._target, "options":options});
				}).then(function () {
					return this$1$1.trigger("doFetch", sender, {"target": this$1$1._target, "options":options});
				}).then(function () {
					return this$1$1.trigger("afterFetch", sender, {"target": this$1$1._target, "options":options});
				});
			}
		}).then(function () {
			return this$1$1.trigger("beforeFill", sender);
		}).then(function () {
			if (this$1$1._items)
			{
				return builder.call(this$1$1, fragment);
			}
		}).then(function () {
			var autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this$1$1._settings.get("settings.autoClear"));
			if (autoClear)
			{
				this$1$1.clear();
			}
		}).then(function () {
			this$1$1._listRootNode.appendChild(fragment);
		}).then(function () {
			return this$1$1.trigger("afterFill", sender);
		});

	};

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Build rows synchronously.
	 *
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 *
	 * @return  {Promise}		Promise.
	 */
	List.prototype._buildSync = function(fragment)
	{
		var this$1$1 = this;


		var chain = Promise.resolve();
		var rowEvents = this._row.settings.get("rowevents");
		var template = this._row._templates[this._row.settings.get("settings.templateName")].html;

		var loop = function ( i ) {
			chain = chain.then(function () {
				return this$1$1.__appendRowSync(fragment, i, this$1$1._items[i], template, rowEvents);
			});
		};

		for (var i = 0; i < this$1$1._items.length; i++)
		loop( i );

		return chain;

	};

	// -----------------------------------------------------------------------------

	/**
	 * Build rows asynchronously.
	 *
	 * @param	{DocumentFragment}	fragment		Document fragment.
	 */
	List.prototype._buildAsync = function(fragment)
	{

		var rowEvents = this._row.settings.get("rowevents");
		var template = this._row._templates[this._row.settings.get("settings.templateName")].html;

		for (var i = 0; i < this._items.length; i++)
		{
			this.__appendRowAsync(fragment, i, this._items[i], template, rowEvents);
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
				this$1$1._row.initEvents(elementName, rowEvents[elementName], element);
			});
		}

		// Call event handlers
		return Promise.resolve().then(function () {
			return this$1$1._row.trigger("beforeFillRow", this$1$1, {"item":item, "no":no, "element":element});
		}).then(function () {
			// Fill fields
			FormUtil.setFields(element, item, this$1$1.masters);
		}).then(function () {
			return this$1$1._row.trigger("afterFillRow", this$1$1, {"item":item, "no":no, "element":element});
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
				this$1$1._row.initEvents(elementName, rowEvents[elementName], element);
			});
		}

		// Call event handlers
		this._row.triggerAsync("beforeFillRow", this, {"item":item, "no":no, "element":element});
		FormUtil.setFields(element, item, this.masters);
		this.row.triggerAsync("afterFillRow", this, {"item":item, "no":no, "element":element});

	};

	// =============================================================================

	// =============================================================================
	//	Authentication util class
	// =============================================================================

	var AuthenticationUtil = /*@__PURE__*/(function (ResourceUtil) {
		function AuthenticationUtil(resourceName, options)
		{

			ResourceUtil.call(this, "authentications", options);

		}

		if ( ResourceUtil ) AuthenticationUtil.__proto__ = ResourceUtil;
		AuthenticationUtil.prototype = Object.create( ResourceUtil && ResourceUtil.prototype );
		AuthenticationUtil.prototype.constructor = AuthenticationUtil;

		// -------------------------------------------------------------------------
		//  Methods
		// -------------------------------------------------------------------------

		/**
		 * Authenticate.
		 *
		 * @param	{string}		user				User.
		 * @param	{string}		password			Password.
		 * @param	{array}			options				Options.
		 */
		AuthenticationUtil.prototype.authenticate = function authenticate (user, password, options)
		{
			var this$1$1 = this;


			return new Promise(function (resolve, reject) {
				this$1$1.get("list", {"user":user, "password":password}).then(function (json) {
					if (json.result.resultCount > 0)
					{
						if (options && "redirect" in options)
						{
							location.href = decodeURI(options["redirect"]);
						}
					}
					else
					{
						reject("login failed");
					}
				});
			});

		};

		return AuthenticationUtil;
	}(ResourceUtil));

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

		PreferenceOrganizer._store.set(key, value);

		// Save preferences
		if (BITSMIST.v1.Util.safeGet(options, "autoSave", this.settings.get("preferences.settings.autoSave")))
		{
			PreferenceOrganizer.save(this);
		}

	};

	// -------------------------------------------------------------------------

	/**
	 * Load preferences.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	PreferenceManager.prototype.load = function(options)
	{

		return PreferenceOrganizer.load(this, options);

	};

	// -------------------------------------------------------------------------

	/**
	 * Save preferences.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	PreferenceManager.prototype.save = function()
	{

		return PreferenceOrganizer.save(this, options);

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
	BITSMIST.v1.OrganizerOrganizer.organizers.set("PreferenceOrganizer", {"object":PreferenceOrganizer, "targetWords":"preferences", "targetEvents":["beforeStart"], "order":1200});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("MasterOrganizer", {"object":MasterOrganizer, "targetWords":"masters", "targetEvents":["beforeStart", "afterSpecLoad"], "order":1300});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("ElementOrganizer", {"object":ElementOrganizer, "targetWords":"elements", "targetEvents":["beforeStart"], "order":2100});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("DatabindingOrganizer", {"object":DatabindingOrganizer, "targetWords":"data", "targetEvents":["afterAppend"], "order":2100});
	BITSMIST.v1.OrganizerOrganizer.organizers.set("KeyOrganizer", {"object":KeyOrganizer, "targetWords":"keys", "targetEvents":["afterAppend"], "order":2100});
	window.BITSMIST.v1.Plugin = Plugin;
	window.BITSMIST.v1.CookieStoreHandler = CookieStoreHandler;
	window.BITSMIST.v1.ResourceHandler = ResourceHandler;
	window.BITSMIST.v1.Form = Form;
	window.BITSMIST.v1.List = List;
	window.BITSMIST.v1.AuthenticationUtil = AuthenticationUtil;
	window.BITSMIST.v1.FormatterUtil = FormatterUtil;
	window.BITSMIST.v1.MasterUtil = MasterUtil;
	window.BITSMIST.v1.ResourceUtil = ResourceUtil;

}());
//# sourceMappingURL=bitsmist-js-extras_v1.js.map
