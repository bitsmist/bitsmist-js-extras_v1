// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AttendancePerk from "../perk/attendance-perk.js";
import BM from "../bm";
import MultiStore from "../store/multi-store.js";
import LocaleServer from "../component/bm-locale.js";

// =============================================================================
//	Locale Perk Class
// =============================================================================

export default class LocalePerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Skills
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
		component.inventory.get("locale.localizers")[handlerName] = handler;
		component.inventory.get("locale.messages").add(handler.messages);

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
			return component.skills.use("event.trigger", "beforeChangeLocale", options);
		}).then(() => {
			component.inventory.get("locale.localeSettings")["localeName"] = localeName;
			return component.skills.use("event.trigger", "doChangeLocale", options);
		}).then(() => {
			return component.skills.use("event.trigger", "afterChangeLocale", options);
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

		Object.keys(component.inventory.get("locale.localizers")).forEach((handlerName) => {
			component.inventory.get("locale.localizers")[handlerName].localize(
				rootNode,
				Object.assign({"interpolation":interpolation}, component.inventory.get("locale.localeSettings"))
			);
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

		Object.keys(component.inventory.get("locale.localizers")).forEach((handlerName) => {
			component.inventory.get("locale.localizers")[handlerName].loadMessages();
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

		localeName = localeName || component.inventory.get("locale.localeSettings")["localeName"];

		let value = component.inventory.get("locale.messages").get(`${localeName}.${key}`);
		if (value === undefined)
		{
			value = component.inventory.get("locale.messages").get(`${component.inventory.get("locale.localeSettings.fallbackLocaleName")}.${key}`);
		}

		return value;

	}


	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static LocalePerk_onDoOrganize(sender, e, ex)
	{

		let promises = [];

		this.skills.use("setting.enumSettings", e.detail.settings["localizers"], (sectionName, sectionValue) => {
			promises.push(LocalePerk._addLocalizer(this, sectionName, sectionValue));
		});

		// Subscribe to the Locale Server if exists
		if (!(this instanceof LocaleServer))
		{
			promises.push(AttendancePerk.call("LocaleServer", {"waitForDOMContentLoaded":true, "waitForAttendance":false}).then((server) => {
				if (server)
				{
					return this.skills.use("state.waitFor", [{"object":server}]).then(() => {
						server.subscribe(this);

						// Synchronize to the server's locales
						let localeSettings = server.inventory.get("locale.localeSettings");
						this.inventory.get("locale.localeSettings")["localeName"] = localeSettings["localeName"];
						this.inventory.get("locale.localeSettings")["fallbackLocaleName"] = localeSettings["fallbackLocaleName"];
						this.inventory.get("locale.localeSettings")["currencyName"] = localeSettings["currencyName"];
					});
				}
			}));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onAfterStart(sender, e, ex)
	{

		return LocalePerk._changeLocale(this, this.inventory.get("locale.localeSettings")["localeName"]);

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onBeforeChangeLocale(sender, e, ex)
	{

		let promises = [];

		Object.keys(this.inventory.get("locale.localizers")).forEach((handlerName) => {
			if (this.inventory.get("locale.localizers")[handlerName].options.get("autoLoad"))
			{
				if (!this.inventory.get("locale.localizers")[handlerName].messages.has(e.detail.localeName))
				{
					let loadOptions = {
						"localeName":		e.detail.localeName,
					};

					promises.push(this.inventory.get("locale.localizers")[handlerName].loadMessages(loadOptions));
				}
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onDoChangeLocale(sender, e, ex)
	{

		// Localize
		LocalePerk._localize(this, this.rootElement);

		// Refill (Do not refill when starting)
		if (this.stats.get("state.state") === "ready")
		{
			this.fill();
		}

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onAfterFillRow(sender, e, ex)
	{

		// Localize a row
		LocalePerk._localize(this, e.detail.element, e.detail.item);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "LocalePerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"sections":		"localizers",
			"order":		330,
		};

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

		// Add skills to component;
		component.skills.set("locale.changeLocale", function(...args) { return LocalePerk._changeLocale(...args); });
		component.skills.set("locale.localize", function(...args) { return LocalePerk._localize(...args); });
		component.skills.set("locale.loadMessages", function(...args) { return LocalePerk._loadMessages(...args); });
		component.skills.set("locale.getLocaleMessage", function(...args) { return LocalePerk._getLocaleMessage(...args); });
		component.skills.set("locale.addLocalizer", function(...args) { return LocalePerk._addLocalizer(...args); });

		// Add inventory items to Component
		component.inventory.set("locale.localizers", {});
		component.inventory.set("locale.messages", new MultiStore());
		component.inventory.set("locale.localeSettings", {
			"localeName":			component.settings.get("localizers.settings.localeName", component.settings.get("system.localeName", navigator.language)),
			"fallbackLocaleName":	component.settings.get("localizers.settings.fallbackLocaleName", component.settings.get("system.fallbackLocaleName", "en")),
			"currencyName":			component.settings.get("localizers.settings.currencyName", component.settings.get("system.currencyName", "USD")),
		});

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", LocalePerk.LocalePerk_onDoOrganize);
		this._addPerkHandler(component, "afterStart", LocalePerk.LocalePerk_onAfterStart);
		this._addPerkHandler(component, "beforeChangeLocale", LocalePerk.LocalePerk_onBeforeChangeLocale);
		this._addPerkHandler(component, "doChangeLocale", LocalePerk.LocalePerk_onDoChangeLocale);
		if (component.settings.get("localizers.settings.autoLocalizeRows"))
		{
			this._addPerkHandler(component, "afterFillRow", LocalePerk.LocalePerk_onAfterFillRow);
		}

	}

}
