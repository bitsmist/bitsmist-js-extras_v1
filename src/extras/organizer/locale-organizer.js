// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AttendanceOrganizer from "../organizer/attendance-organizer.js";
import BM from "../bm";
import MultiStore from "../store/multi-store.js";
import LocaleServer from "../component/bm-locale.js";

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

		this._enumSettings(e.detail.settings["localizers"], (sectionName, sectionValue) => {
			promises.push(LocaleOrganizer._addLocalizer(this, sectionName, sectionValue));
		});

		// Subscribe to the Locale Server if exists
		if (!(this instanceof LocaleServer))
		{
			promises.push(AttendanceOrganizer.call("LocaleServer", {"waitForDOMContentLoaded":true, "waitForAttendance":false}).then((server) => {
				if (server)
				{
					return BM.StateOrganizer.waitFor([{"object":server}]).then(() => {
						server.subscribe(this);

						// Synchronize to the server's locales
						this._localeSettings["localeName"] = server._localeSettings["localeName"];
						this._localeSettings["fallbackLocaleName"] = server._localeSettings["fallbackLocaleName"];
						this._localeSettings["currencyName"] = server._localeSettings["currencyName"];
					});
				}
			}));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onAfterStart(sender, e, ex)
	{

		return LocaleOrganizer._changeLocale(this, this._localeSettings["localeName"]);

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onBeforeChangeLocale(sender, e, ex)
	{

		let promises = [];

		Object.keys(this._localizers).forEach((handlerName) => {
			if (this._localizers[handlerName].options.get("autoLoad"))
			{
				if (!this._localizers[handlerName].messages.has(e.detail.localeName))
				{
					let loadOptions = {
						"localeName":		e.detail.localeName,
					};

					promises.push(this._localizers[handlerName].loadMessages(loadOptions));
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

		// Localize a row
		LocaleOrganizer._localize(this, e.detail.element, e.detail.item);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"localizers",
			"order":		330,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add properties to component
		Object.defineProperty(component, 'localizers', {
			get() { return this._localizers; },
		});
		Object.defineProperty(component, 'localeMessages', {
			get() { return this._localeMessages; },
		});
		Object.defineProperty(component, 'localeSettings', {
			get() { return this._localeSettings; },
		});

		// Add methods to component
		component.changeLocale = function(...args) { return LocaleOrganizer._changeLocale(this, ...args); }
		component.localize = function(...args) { return LocaleOrganizer._localize(this, ...args); }
		component.loadMessages = function(...args) { return LocaleOrganizer._loadMessages(this, ...args); }
		component.getLocaleMessage = function(...args) { return LocaleOrganizer._getLocaleMessage(this, ...args); }
		component.addLocalizer = function(...args) { return LocaleOrganizer._addLocalizer(this, ...args); }

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", LocaleOrganizer.LocaleOrganizer_onDoOrganize);
		this._addOrganizerHandler(component, "afterStart", LocaleOrganizer.LocaleOrganizer_onAfterStart);
		this._addOrganizerHandler(component, "beforeChangeLocale", LocaleOrganizer.LocaleOrganizer_onBeforeChangeLocale);
		this._addOrganizerHandler(component, "doChangeLocale", LocaleOrganizer.LocaleOrganizer_onDoChangeLocale);
		if (component.settings.get("localizers.settings.autoLocalizeRows"))
		{
			this._addOrganizerHandler(component, "afterFillRow", LocaleOrganizer.LocaleOrganizer_onAfterFillRow);
		}

		// Init component vars
		component._localizers = {};
		component._localeMessages = new MultiStore();
		component._localeSettings = {
			"localeName":			component.settings.get("localizers.settings.localeName", component.settings.get("system.localeName", navigator.language)),
			"fallbackLocaleName":	component.settings.get("localizers.settings.fallbackLocaleName", component.settings.get("system.fallbackLocaleName", "en")),
			"currencyName":			component.settings.get("localizers.settings.currencyName", component.settings.get("system.currencyName", "USD")),
		};

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Add the localizer.
     *
     * @param	{Component}		component			Component.
     * @param	{string}		handlerName			Locale handler name.
     * @param	{array}			options				Options.
	 *
	 * @return 	{Promise}		Promise.
     */
	static _addLocalizer(component, handlerName, options)
	{

		let handlerClassName = BM.Util.safeGet(options, "handlerClassName", "BITSMIST.v1.LocaleHandler");
		let handler = BM.ClassUtil.createObject(handlerClassName, component, options);
		component._localizers[handlerName] = handler;
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
			component._localeSettings["localeName"] = localeName;
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
	 * @param	{Object}		interpolation		Interpolation parameters.
	 */
	static _localize(component, rootNode, interpolation)
	{

		rootNode = rootNode || component.rootElement;

		Object.keys(component._localizers).forEach((handlerName) => {
			component._localizers[handlerName].localize(rootNode, Object.assign({"interpolation":interpolation}, component._localeSettings));
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

		Object.keys(component._localizers).forEach((handlerName) => {
			component._localizers[handlerName].loadMessages();
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

		localeName = localeName || component.localeSettings["localeName"];

		let value = component.localeMessages.get(`${localeName}.${key}`);
		if (value === undefined)
		{
			value = component.localeMessages.get(`${component.fallbackLocaleName}.${key}`);
		}

		return value;

	}

}
