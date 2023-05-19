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
	static _addHandler(component, handlerName, options)
	{

		let promise = Promise.resolve();
		let handler = component.inventory.get(`locale.localizers.${handlerName}`);

		if (!handler)
		{
			let handlerClassName = BM.Util.safeGet(options, "handlerClassName", "BITSMIST.v1.LocaleHandler");
			handler = BM.ClassUtil.createObject(handlerClassName, component, options);
			component.inventory.set(`locale.localizers.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply locale.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static _applyLocale(component, options)
	{

		return Promise.resolve().then(() => {
			return component.skills.use("event.trigger", "beforeApplyLocale", options);
		}).then(() => {
			component.stats.set("locale.localeName", options["localeName"]);
			return component.skills.use("event.trigger", "doApplyLocale", options);
		}).then(() => {
			return component.skills.use("event.trigger", "afterApplyLocale", options);
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

		rootNode = rootNode || component;

		Object.keys(component.inventory.get("locale.localizers")).forEach((handlerName) => {
			component.inventory.get(`locale.localizers.${handlerName}`).localize(
				rootNode,
				Object.assign({"interpolation":interpolation}, component.stats.get("locale"))
			);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the messages file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		localeName			Locale name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadMessages(component, localeName, options)
	{

		Object.keys(component.inventory.get("locale.localizers")).forEach((handlerName) => {
			component.inventory.get(`locale.localizers.${handlerName}`).loadMessages(localeName, options);
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

		localeName = localeName || component.stats.get("locale.localeName");

		let value = component.inventory.get("locale.messages").get(`${localeName}.${key}`);
		if (value === undefined)
		{
			value = component.inventory.get("locale.messages").get(`${component.stats.get("locale.fallbackLocaleName")}.${key}`);
		}

		return value;

	}


	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static LocalePerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		// Add locale handlers
		Object.entries(BM.Util.safeGet(e.detail, "settings.locale.handlers", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(LocalePerk._addHandler(this, sectionName, sectionValue));
		});

		// Subscribe to the Locale Server if exists
		if (!(this instanceof LocaleServer))
		{
			promises.push(AttendancePerk.call("LocaleServer", {"waitForDOMContentLoaded":true, "waitForAttendance":false}).then((server) => {
				if (server)
				{
					return this.skills.use("state.wait", [{"object":server, "state":"starting"}]).then(() => {
						server.subscribe(this);
						this.vault.set("locale.server", server);

						// Synchronize to the server's locales
						let localeSettings = server.stats.get("locale");
						this.stats.set("locale.localeName", localeSettings["localeName"]);
						this.stats.set("locale.fallbackLocaleName", localeSettings["fallbackLocaleName"]);
						this.stats.set("locale.currencyName", localeSettings["currencyName"]);
					});
				}
			}));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onDoSetup(sender, e, ex)
	{

		return LocalePerk._applyLocale(this, {"localeName":this.stats.get("locale.localeName")});

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onBeforeApplyLocale(sender, e, ex)
	{

		let promises = [];

		Object.keys(this.inventory.get("locale.localizers")).forEach((handlerName) => {
			if (this.inventory.get(`locale.localizers.${handlerName}`).options.get("autoLoad") &&
				!this.inventory.get(`locale.localizers.${handlerName}`).messages.has(e.detail.localeName))
			{
				promises.push(this.inventory.get(`locale.localizers.${handlerName}`).loadMessages(e.detail.localeName));
			}
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onDoApplyLocale(sender, e, ex)
	{

		// Localize
		LocalePerk._localize(this, this);

		// Refill (Do not refill when starting)
		if (this.stats.get("state.state") === "ready")
		{
			this.skills.use("basic.fill");
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

	static get info()
	{

		return {
			"section":		"locale",
			"order":		330,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add skills to component;
		component.skills.set("locale.apply", function(...args) { return LocalePerk._applyLocale(...args); });
		component.skills.set("locale.localize", function(...args) { return LocalePerk._localize(...args); });
		component.skills.set("locale.summon", function(...args) { return LocalePerk._loadMessages(...args); });
		component.skills.set("locale.translate", function(...args) { return LocalePerk._getLocaleMessage(...args); });
		component.skills.set("locale.addHandler", function(...args) { return LocalePerk._addHandler(...args); });

		// Add inventory items to component
		component.inventory.set("locale.localizers", {});
		component.inventory.set("locale.messages", new MultiStore());

		// Add stats to component
		component.stats.set("locale", {
			"localeName":			component.settings.get("locale.options.localeName", component.settings.get("system.localeName", navigator.language)),
			"fallbackLocaleName":	component.settings.get("locale.options.fallbackLocaleName", component.settings.get("system.fallbackLocaleName", "en")),
			"currencyName":			component.settings.get("locale.options.currencyName", component.settings.get("system.currencyName", "USD")),
		});

		// Add event handlers to component
		this._addPerkHandler(component, "doApplySettings", LocalePerk.LocalePerk_onDoApplySettings);
		this._addPerkHandler(component, "doSetup", LocalePerk.LocalePerk_onDoSetup);
		this._addPerkHandler(component, "beforeApplyLocale", LocalePerk.LocalePerk_onBeforeApplyLocale);
		this._addPerkHandler(component, "doApplyLocale", LocalePerk.LocalePerk_onDoApplyLocale);
		if (component.settings.get("locale.options.autoLocalizeRows"))
		{
			this._addPerkHandler(component, "afterFillRow", LocalePerk.LocalePerk_onAfterFillRow);
		}

	}

}
