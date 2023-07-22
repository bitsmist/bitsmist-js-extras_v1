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
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"locale",
			"order":		215,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "skill", "locale.localize", function(...args) { return LocalePerk._localize(...args); });
		this.upgrade(unit, "skill", "locale.translate", function(...args) { return LocalePerk._getLocaleMessage(...args); });
		this.upgrade(unit, "spell", "locale.apply", function(...args) { return LocalePerk._applyLocale(...args); });
		this.upgrade(unit, "spell", "locale.summon", function(...args) { return LocalePerk._loadMessages(...args); });
		this.upgrade(unit, "spell", "locale.addHandler", function(...args) { return LocalePerk._addHandler(...args); });
		this.upgrade(unit, "inventory", "locale.localizers", {});
		this.upgrade(unit, "inventory", "locale.messages", new MultiStore());
		this.upgrade(unit, "state", "locale.active", {
			"localeName":			unit.get("setting", "locale.options.localeName", unit.get("setting", "system.locale.options.localeName", navigator.language.substring(0, 2))),
			"fallbackLocaleName":	unit.get("setting", "locale.options.fallbackLocaleName", unit.get("setting", "system.locale.options.fallbackLocaleName", "en")),
			"currencyName":			unit.get("setting", "locale.options.currencyName", unit.get("setting", "system.locale.options.currencyName", "USD")),
		});
		this.upgrade(unit, "event", "doApplySettings", LocalePerk.LocalePerk_onDoApplySettings);
		this.upgrade(unit, "event", "beforeTransform", LocalePerk.LocalePerk_onBeforeTransform);
		this.upgrade(unit, "event", "beforeApplyLocale", LocalePerk.LocalePerk_onBeforeApplyLocale);
		this.upgrade(unit, "event", "doApplyLocale", LocalePerk.LocalePerk_onDoApplyLocale);
		if (unit.get("setting", "locale.options.autoLocalizeRows"))
		{
			this.upgrade(unit, "event", "afterFillRow", LocalePerk.LocalePerk_onAfterFillRow);
		}

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

		// Connect to the locale server if specified
		let serverNode = this.get("setting", "locale.options.localeServer", this.get("setting", "system.locale.options.localeServer"));
		serverNode = ( serverNode === true ? "bm-locale" : serverNode );
		if (serverNode && !(this instanceof LocaleServer))
		{
			promises.push(this.use("spell", "status.wait", [{"rootNode":serverNode, "status":"ready"}]).then(() => {
				let server = document.querySelector(serverNode);
				server.subscribe(this);
				this.set("vault", "locale.server", server);

				// Synchronize to the server's locales
				let localeSettings = server.get("state", "locale.active");
				this.set("state", "locale.active.localeName", localeSettings["localeName"]);
				this.set("state", "locale.active.fallbackLocaleName", localeSettings["fallbackLocaleName"]);
				this.set("state", "locale.active.currencyName", localeSettings["currencyName"]);
			}));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onBeforeTransform(sender, e, ex)
	{

		return LocalePerk._applyLocale(this, {"localeName":this.get("state", "locale.active.localeName")});

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onBeforeApplyLocale(sender, e, ex)

		return this.use("spell", "locale.summon", e.detail.localeName);

	}

	// -------------------------------------------------------------------------

	static LocalePerk_onDoApplyLocale(sender, e, ex)
	{

		// Localize
		LocalePerk._localize(this, this);

		// Refill (Do not refill when starting)
		if (this.get("state", "status.status") === "ready")
		{
			return this.use("spell", "basic.fill", {"refill":true});
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
     * @param	{Unit}			unit				Unit.
     * @param	{string}		handlerName			Locale handler name.
     * @param	{array}			options				Options.
	 *
	 * @return 	{Promise}		Promise.
     */
	static _addHandler(unit, handlerName, options)
	{

		let promise = Promise.resolve();

		if (!unit.get("inventory", `locale.localizers.${handlerName}`))
		{
			let handlerClassName = BM.Util.safeGet(options, "handlerClassName", "BITSMIST.v1.LocaleHandler");
			let handler = BM.ClassUtil.createObject(handlerClassName, unit, options);
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
	static _applyLocale(unit, options)
	{

		return Promise.resolve().then(() => {
			console.debug(`LocalePerk._applyLocale(): Applying locale. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}, localeName=${options["localeName"]}`);
			return unit.use("spell", "event.trigger", "beforeApplyLocale", options);
		}).then(() => {
			unit.set("state", "locale.active.localeName", options["localeName"]);
			return unit.use("spell", "event.trigger", "doApplyLocale", options);
		}).then(() => {
			console.debug(`LocalePerk._applyLocale(): Applied locale. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}, localeName=${options["localeName"]}`);
			return unit.use("spell", "event.trigger", "afterApplyLocale", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Localize all the bm-locale fields with i18 messages using each handler.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{HTMLElement}	rootNode			Target root node to localize.
	 * @param	{Object}		interpolation		Interpolation parameters.
	 */
	static _localize(unit, rootNode, interpolation)
	{

		rootNode = rootNode || unit;

		Object.keys(unit.get("inventory", "locale.localizers")).forEach((handlerName) => {
			unit.get("inventory", `locale.localizers.${handlerName}`).localize(
				rootNode,
				Object.assign({"interpolation":interpolation}, unit.get("state", "locale.active"))
			);
		});

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
	static _loadMessages(unit, localeName, options)
	{

		let promises = [];

		Object.keys(unit.get("inventory", "locale.localizers")).forEach((handlerName) => {
			promises.push(unit.get("inventory", `locale.localizers.${handlerName}`).loadMessages(localeName, options));
		});

		return Promise.all(promises);

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
	static _getLocaleMessage(unit, key, localeName)
	{

		localeName = localeName || unit.get("state", "locale.active.localeName");

		let value = unit.get("inventory", "locale.messages").get(`${localeName}.${key}`);
		if (value === undefined)
		{
			value = unit.get("inventory", "locale.messages").get(`${unit.get("state", "locale.fallbackLocaleName")}.${key}`);
		}

		return value;

	}

}
