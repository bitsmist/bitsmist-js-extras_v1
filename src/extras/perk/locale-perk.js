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
import LocaleServer from "../unit/bm-locale.js";

// =============================================================================
//	Locale Perk Class
// =============================================================================

export default class LocalePerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"locale",
		"order":			215,
	};
	static #__skills = {
		"localize":			LocalePerk.#_localize,
		"translate":		LocalePerk.#_getLocaleMessage,
	};
	static #__spells = {
		"apply":			LocalePerk.#_applyLocale,
		"summon":			LocalePerk.#_loadMessages,
		"addHandler":		LocalePerk.#_addHandler,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return LocalePerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get skills()
	{

		return LocalePerk.#__skills;

	}

	// -------------------------------------------------------------------------

	static get spells()
	{

		return LocalePerk.#__spells;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		LocalePerk.#__vault.set(unit, {
			"server":	null,
		});

		// Upgrade unit
		unit.upgrade("inventory", "locale.localizers", {});
		unit.upgrade("inventory", "locale.messages", new MultiStore());
		unit.upgrade("inventory", "locale.active", {
			"localeName":			unit.get("setting", "locale.options.localeName", unit.get("setting", "system.locale.options.localeName", navigator.language.substring(0, 2))),
			"fallbackLocaleName":	unit.get("setting", "locale.options.fallbackLocaleName", unit.get("setting", "system.locale.options.fallbackLocaleName", "en")),
			"currencyName":			unit.get("setting", "locale.options.currencyName", unit.get("setting", "system.locale.options.currencyName", "USD")),
		});

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":LocalePerk.#LocalePerk_onDoApplySettings, "order":LocalePerk.info["order"]});
		unit.use("event.add", "doSetup", {"handler":LocalePerk.#LocalePerk_onDoSetup, "order":LocalePerk.info["order"]});
		unit.use("event.add", "beforeApplyLocale", {"handler":LocalePerk.#LocalePerk_onBeforeApplyLocale, "order":LocalePerk.info["order"]});
		unit.use("event.add", "doApplyLocale", {"handler":LocalePerk.#LocalePerk_onDoApplyLocale, "order":LocalePerk.info["order"]});

		if (unit.get("setting", "locale.options.autoLocalizeRows"))
		{
			unit.use("event.add", "afterFillRow", {"handler":LocalePerk.#LocalePerk_onAfterFillRow, "order":LocalePerk.info["order"]});
		}

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #LocalePerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		// Add locale handlers
		Object.entries(BM.Util.safeGet(e.detail, "settings.locale.handlers", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(LocalePerk.#_addHandler(this, sectionName, sectionValue));
		});

		// Connect to the locale server if specified
		let serverNode = this.get("setting", "locale.options.localeServer", this.get("setting", "system.locale.options.localeServer"));
		serverNode = ( serverNode === true ? "bm-locale" : serverNode );

		if (serverNode && !(this instanceof LocaleServer))
		{
			promises.push(this.cast("status.wait", [serverNode]).then(() => {
				let server = document.querySelector(serverNode);
				server.subscribe(this);
				LocalePerk.#__vault.get(this)["server"] = server;

				// Synchronize to the server's locales
				let localeSettings = server.get("inventory", "locale.active");
				this.set("inventory", "locale.active.localeName", localeSettings["localeName"]);
				this.set("inventory", "locale.active.fallbackLocaleName", localeSettings["fallbackLocaleName"]);
				this.set("inventory", "locale.active.currencyName", localeSettings["currencyName"]);
			}));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static #LocalePerk_onDoSetup(sender, e, ex)
	{

		return LocalePerk.#_applyLocale(this, {"localeName":this.get("inventory", "locale.active.localeName")});

	}

	// -------------------------------------------------------------------------

	static #LocalePerk_onBeforeApplyLocale(sender, e, ex)
	{

		return this.cast("locale.summon", e.detail.localeName);

	}

	// -------------------------------------------------------------------------

	static #LocalePerk_onDoApplyLocale(sender, e, ex)
	{

		// Localize
		LocalePerk.#_localize(this, this);

		// Refill (Do not refill when starting)
		if (this.get("inventory", "status.status") === "ready")
		{
			return this.cast("basic.fill", {"refill":true});
		}

	}

	// -------------------------------------------------------------------------

	static #LocalePerk_onAfterFillRow(sender, e, ex)
	{

		// Localize a row
		LocalePerk.#_localize(this, e.detail.element, e.detail.item);

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Localize all the bm-locale fields with i18 messages using each handler.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{HTMLElement}	rootNode			Target root node to localize.
	 * @param	{Object}		interpolation		Interpolation parameters.
	 */
	static #_localize(unit, rootNode, interpolation)
	{

		rootNode = rootNode || unit;

		Object.keys(unit.get("inventory", "locale.localizers")).forEach((handlerName) => {
			unit.get("inventory", `locale.localizers.${handlerName}`).localize(
				rootNode,
				Object.assign({"interpolation":interpolation}, unit.get("inventory", "locale.active"))
			);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the locale message.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		key					Key.
	 * @param	{String}		localeName			Locale name.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #_getLocaleMessage(unit, key, localeName)
	{

		localeName = localeName || unit.get("inventory", "locale.active.localeName");

		let value = unit.get("inventory", "locale.messages").get(`${localeName}.${key}`);
		if (value === undefined)
		{
			value = unit.get("inventory", "locale.messages").get(`${unit.get("inventory", "locale.fallbackLocaleName")}.${key}`);
		}

		return value;

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
     * Add the localizer.
     *
     * @param	{Unit}			unit				Unit.
     * @param	{string}		handlerName			Locale handler name.
     * @param	{array}			options				Options.
	 *
	 * @return 	{Promise}		Promise.
     */
	static #_addHandler(unit, handlerName, options)
	{

		let promise = Promise.resolve();

		if (!unit.get("inventory", `locale.localizers.${handlerName}`))
		{
			let handlerClassName = BM.Util.safeGet(options, "handlerClassName", "BITSMIST.v1.LocaleHandler");
			let handler = this.createHandler(handlerClassName, unit, options);
			unit.set("inventory", `locale.localizers.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply locale.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static async #_applyLocale(unit, options)
	{

		console.debug(`LocalePerk.#_applyLocale(): Applying locale. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}, localeName=${options["localeName"]}`);
		await unit.cast("event.trigger", "beforeApplyLocale", options);
		unit.set("inventory", "locale.active.localeName", options["localeName"]);
		await unit.cast("event.trigger", "doApplyLocale", options);
		console.debug(`LocalePerk.#_applyLocale(): Applied locale. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}, localeName=${options["localeName"]}`);
		await unit.cast("event.trigger", "afterApplyLocale", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the messages file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		localeName			Locale name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #_loadMessages(unit, localeName, options)
	{

		let promises = [];

		Object.keys(unit.get("inventory", "locale.localizers")).forEach((handlerName) => {
			promises.push(unit.get("inventory", `locale.localizers.${handlerName}`).loadMessages(localeName, options));
		});

		return Promise.all(promises);

	}

}
