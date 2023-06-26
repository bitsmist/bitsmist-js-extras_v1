// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BM from "../bm";
import MultiStore from "../store/multi-store.js";
import LocaleServer from "../component/bm-locale.js";

// =============================================================================
//	Locale Perk Class
// =============================================================================

export default class LocalePerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"locale",
			"order":		215,
			"depends":		"AliasPerk",
			//"depends":		"RollCallPerk",
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "skill", "locale.localize", function(...args) { return LocalePerk._localize(...args); });
		this.upgrade(component, "skill", "locale.translate", function(...args) { return LocalePerk._getLocaleMessage(...args); });
		this.upgrade(component, "spell", "locale.apply", function(...args) { return LocalePerk._applyLocale(...args); });
		this.upgrade(component, "spell", "locale.summon", function(...args) { return LocalePerk._loadMessages(...args); });
		this.upgrade(component, "spell", "locale.addHandler", function(...args) { return LocalePerk._addHandler(...args); });
		this.upgrade(component, "inventory", "locale.localizers", {});
		this.upgrade(component, "inventory", "locale.messages", new MultiStore());
		this.upgrade(component, "state", "locale", {
			"localeName":			component.get("settings", "locale.options.localeName", component.get("settings", "system.localeName", navigator.language)),
			"fallbackLocaleName":	component.get("settings", "locale.options.fallbackLocaleName", component.get("settings", "system.fallbackLocaleName", "en")),
			"currencyName":			component.get("settings", "locale.options.currencyName", component.get("settings", "system.currencyName", "USD")),
		});
		this.upgrade(component, "event", "doApplySettings", LocalePerk.LocalePerk_onDoApplySettings);
		this.upgrade(component, "event", "doSetup", LocalePerk.LocalePerk_onDoSetup);
		this.upgrade(component, "event", "beforeApplyLocale", LocalePerk.LocalePerk_onBeforeApplyLocale);
		this.upgrade(component, "event", "doApplyLocale", LocalePerk.LocalePerk_onDoApplyLocale);
		if (component.get("settings", "locale.options.autoLocalizeRows"))
		{
			this.upgrade(component, "event", "afterFillRow", LocalePerk.LocalePerk_onAfterFillRow);
		}

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	/*
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
			promises.push(this.use("spell", "rollcall.call", "LocaleServer", {"waitForDOMContentLoaded":true, "waitForAttendance":false}).then((server) => {
				if (server)
				{
					return this.use("spell", "state.wait", [{"object":server, "state":"starting"}]).then(() => {
						server.subscribe(this);
						this.set("vault", "locale.server", server);

						// Synchronize to the server's locales
						let localeSettings = server.get("state", "locale");
						this.set("state", "locale.localeName", localeSettings["localeName"]);
						this.set("state", "locale.fallbackLocaleName", localeSettings["fallbackLocaleName"]);
						this.set("state", "locale.currencyName", localeSettings["currencyName"]);
					});
				}
			}));
		}

		return Promise.all(promises);

	}
	*/

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
			promises.push(this.get("inventory", "promise.documentReady").then(() => {
				let rootNode = this.use("skill", "alias.resolve", "LocaleServer")["rootNode"] || "bm-locale";
				let server = document.querySelector(rootNode);
				if (server)
				{
					return this.use("spell", "state.wait", [{"object":server, "state":"ready"}]).then(() => {
						server.subscribe(this);
						this.set("vault", "locale.server", server);

						// Synchronize to the server's locales
						let localeSettings = server.get("state", "locale");
						this.set("state", "locale.localeName", localeSettings["localeName"]);
						this.set("state", "locale.fallbackLocaleName", localeSettings["fallbackLocaleName"]);
						this.set("state", "locale.currencyName", localeSettings["currencyName"]);
					});
				}
			}));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onDoSetup(sender, e, ex)
	{

		if (!(this instanceof LocaleServer))
		{
			return LocalePerk._applyLocale(this, {"localeName":this.get("state", "locale.localeName")});
		}

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onBeforeApplyLocale(sender, e, ex)
	{

		let promises = [];

		Object.keys(this.get("inventory", "locale.localizers")).forEach((handlerName) => {
			if (this.get("inventory", `locale.localizers.${handlerName}`).options.get("autoLoad") &&
				!this.get("inventory", `locale.localizers.${handlerName}`).messages.has(e.detail.localeName))
			{
				promises.push(this.get("inventory", `locale.localizers.${handlerName}`).loadMessages(e.detail.localeName));
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
		if (this.get("state", "state.state") === "ready")
		{
			return this.use("spell", "basic.fill");
		}

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onAfterFillRow(sender, e, ex)
	{

		// Localize a row
		LocalePerk._localize(this, e.detail.element, e.detail.item);

	}

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

		if (!component.get("inventory", `locale.localizers.${handlerName}`))
		{
			let handlerClassName = BM.Util.safeGet(options, "handlerClassName", "BITSMIST.v1.LocaleHandler");
			let handler = BM.ClassUtil.createObject(handlerClassName, component, options);
			component.set("inventory", `locale.localizers.${handlerName}`, handler);

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
			return component.use("spell", "event.trigger", "beforeApplyLocale", options);
		}).then(() => {
			component.set("state", "locale.localeName", options["localeName"]);
			return component.use("spell", "event.trigger", "doApplyLocale", options);
		}).then(() => {
			return component.use("spell", "event.trigger", "afterApplyLocale", options);
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

		Object.keys(component.get("inventory", "locale.localizers")).forEach((handlerName) => {
			component.get("inventory", `locale.localizers.${handlerName}`).localize(
				rootNode,
				Object.assign({"interpolation":interpolation}, component.get("state", "locale"))
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

		let promises = [];

		Object.keys(component.get("inventory", "locale.localizers")).forEach((handlerName) => {
			promises.push(component.get("inventory", `locale.localizers.${handlerName}`).loadMessages(localeName, options));
		});

		return promises;

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

		localeName = localeName || component.get("state", "locale.localeName");

		let value = component.get("inventory", "locale.messages").get(`${localeName}.${key}`);
		if (value === undefined)
		{
			value = component.get("inventory", "locale.messages").get(`${component.get("state", "locale.fallbackLocaleName")}.${key}`);
		}

		return value;

	}

}
