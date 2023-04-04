// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BindableArrayStore from "../store/bindable-array-store.js";
import BindableStore from "../store/bindable-store.js";
import BM from "../bm";
import FormUtil from "../util/form-util.js";
import MultiStore from "../store/multi-store.js";

// =============================================================================
//	Locale Organizer Class
// =============================================================================

export default class LocaleOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "LocaleOrganizer";

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static LocaleOrganizer_onDoOrganize(sender, e, ex)
	{

		let promises = [];

		this._enumSettings(e.detail.settings["locales"], (sectionName, sectionValue) => {
			promises.push(LocaleOrganizer._addHandler(this, sectionName, sectionValue));
		});

		// Subscribe to the Locale Server if exists
		let server = document.querySelector("bm-locale");
		if (server && this !==  server)
		{
			promises.push(this.waitFor([{"rootNode":"bm-locale"}]).then(() => {
				server.subscribe(this);

				// Synchronize to the server's locales
				this._localName = server.localeName;
				this._fallbackLocaleName = server.fallbackLocaleName;
			}));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onAfterStart(sender, e, ex)
	{

		return LocaleOrganizer._changeLocale(this, this._localeName);

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onBeforeChangeLocale(sender, e, ex)
	{

		let promises = [];

		Object.keys(this._localeHandlers).forEach((handlerName) => {
			if (this._localeHandlers[handlerName].options.get("autoLoad"))
			{
				if (!this._localeHandlers[handlerName].messages.has(e.detail.localeName))
				{
					let loadOptions = {
						"localeName":		e.detail.localeName,
					};

					promises.push(this._localeHandlers[handlerName].loadMessages(loadOptions));
				}
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onDoChangeLocale(sender, e, ex)
	{

		// Localize
		LocaleOrganizer._localize(this, this.rootElement);

		// Refill (Do not refill when starting)
		if (this.state === "ready")
		{
			this.fill();
		}

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onAfterFillRow(sender, e, ex)
	{

		Object.keys(this._localeHandlers).forEach((handlerName) => {
			this._localeHandlers[handlerName].localize(e.detail.element, this.localeName, this.fallbackLocaleName, e.detail.item);
		});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"locales",
			"order":		330,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add properties
		/*
		Object.defineProperty(component, 'localeHandlers', {
			get() { return this._localeHandlers; },
		});
		*/
		Object.defineProperty(component, 'localeMessages', {
			get() { return this._localeMessages; },
		});
		Object.defineProperty(component, 'localeName', {
			get() { return this._localeName; },
			set(value) { this._localeName = value; }
		});
		Object.defineProperty(component, 'fallbackLocaleName', {
			get() { return this._fallbackLocaleName; },
			set(value) { this._fallbackLocaleName = value; }
		});

		// Add methods to component
		component.changeLocale = function(...args) { return LocaleOrganizer._changeLocale(this, ...args); }
		component.localize = function(...args) { return LocaleOrganizer._localize(this, ...args); }
		component.loadMessages = function(...args) { return LocaleOrganizer._loadMessages(this, ...args); }
		component.getLocaleMessage = function(...args) { return LocaleOrganizer._getLocaleMessage(this, ...args); }

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", LocaleOrganizer.LocaleOrganizer_onDoOrganize);
		this._addOrganizerHandler(component, "afterStart", LocaleOrganizer.LocaleOrganizer_onAfterStart);
		this._addOrganizerHandler(component, "beforeChangeLocale", LocaleOrganizer.LocaleOrganizer_onBeforeChangeLocale);
		this._addOrganizerHandler(component, "doChangeLocale", LocaleOrganizer.LocaleOrganizer_onDoChangeLocale);
		if (component.settings.get("locales.settings.autoLocalizeRows"))
		{
			this._addOrganizerHandler(component, "afterFillRow", LocaleOrganizer.LocaleOrganizer_onAfterFillRow);
		}

		// Init vars
		component._localeHandlers = {};
		component._localeMessages = new MultiStore();
		component._localeName = component.settings.get("locales.settings.localeName", component.settings.get("system.localeName", "en"));
		component._fallbackLocaleName = component.settings.get("locales.settings.fallbackLocaleName", component.settings.get("system.fallbackLocaleName", "en"));

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Add the locale handler.
     *
     * @param	{Component}		component			Component.
     * @param	{string}		handlerName			Locale handler name.
     * @param	{array}			options				Options.
	 *
	 * @return 	{Promise}		Promise.
     */
	static _addHandler(component, handlerName, options)
	{

		let handlerClassName = BM.Util.safeGet(options, "handlerClassName", "BITSMIST.v1.LocaleHandler");
		let handler = BM.ClassUtil.createObject(handlerClassName, component, options);
		component._localeHandlers[handlerName] = handler;
		component._localeMessages.add(handler.messages);

		return handler.init(options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Change locale.
	 *
     * @param	{Component}		component			Component.
	 * @param	{String}		localeName			Locale name.
	 */
	static _changeLocale(component, localeName)
	{

		let options = {"localeName":localeName};

		return Promise.resolve().then(() => {
			return component.trigger("beforeChangeLocale", options);
		}).then(() => {
			component._localeName = localeName;
			return component.trigger("doChangeLocale", options);
		}).then(() => {
			return component.trigger("afterChangeLocale", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Localize all the bm-locale fields with i18 messages using each handler.
	 *
     * @param	{Component}		component			Component.
	 * @param	{HTMLElement}	rootNode			Target root node to localize.
	 * @param	{Object}		parameters			Interpolation parameters.
	 */
	static _localize(component, rootNode, parameters)
	{

		rootNode = rootNode || component.rootElement;

		Object.keys(component._localeHandlers).forEach((handlerName) => {
			component._localeHandlers[handlerName].localize(rootNode, component._localeName, component._fallbackLocaleName, parameters);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the messages file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		fileName			File name. Use "" to use default name.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadMessages(component)
	{

		Object.keys(component._localeHandlers).forEach((handlerName) => {
			component._localeHandlers[handlerName].loadMessages();
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the locale message.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		key					Key.
	 * @param	{String}		localeName			Locale name.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _getLocaleMessage(component, key, localeName)
	{

		localeName = localeName || component.localeName;

		let value = component.localeMessages.get(`${localeName}.${key}`);
		if (value === undefined)
		{
			value = component.localeMessages.get(`${component.fallbackLocaleName}.${key}`);
		}

		return value;

	}

}
