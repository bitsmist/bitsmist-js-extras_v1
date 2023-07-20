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
import LocaleValueUtil from "../util/locale-value-util.js";

// =============================================================================
//	Locale Handler class
// =============================================================================

export default class LocaleHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{String}		handlerName			Handler name.
     * @param	{Object}		options				Options.
     */
	constructor(unit, options)
	{

		options = options || {};

		this._unit = unit;
		this._options = new BM.Store({"items":options});
		this._messages = new BM.ChainableStore();
		this._valueHandler = this.options.get("valueHandler", LocaleValueUtil);
		this._localeInfo = {};

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Options.
	 *
	 * @type	{Object}
	 */
	get options()
	{

		return this._options;

	}

	// -------------------------------------------------------------------------

	/**
	 * Messages.
	 *
	 * @type	{Object}
	 */
	get messages()
	{

		return this._messages;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Init the handler.
     *
     * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	init(options)
	{

		// Add messages from settings
		let messages = BM.Util.getObject(options["messages"], {"format":this.__getMessageFormat(this._unit)});
		if (messages)
		{
			Object.entries(messages).forEach(([sectionName, sectionValue]) => {
				this._messages.set(sectionName, sectionValue);
			});
		}

		// Load external messages
		return Promise.resolve().then(() => {
			if (this.__hasExternalMessages(this._unit))
			{
				return this.loadMessages();
			}
		}).then(() => {
			// Chain this handler's messages store to unit's locale.messages store
			this._unit.get("inventory", "locale.messages").add(this._messages);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the handler has specified locale data.
	 *
	 * @param	{String}		localeName			Locale name.
	 *
 	 * @return  {Boolean}		True if locale data is available.
	 */
	has(localeName)
	{

		return this._messages.has(localeName);

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the message which belong to the locale name.
	 *
	 * @param	{String}		key					Key.
	 * @param	{String}		localeName			Locale name.
	 *
 	 * @return  {String}		Messages.
	 */
	get(key, localeName)
	{

		key = localeName + ( key ? `.${key}` : "" );

		return this._messages.get(key);

	}

	// -------------------------------------------------------------------------

	/**
	 * Get all messages which belong to the locale name.
	 *
	 * @param	{String}		localeName			Locale name.
	 *
 	 * @return  {String}		Messages.
	 */
	getAll(localeName)
	{

		return this._messages.get(localeName);

	}

	// -------------------------------------------------------------------------

	/**
	 * Localize all the bm-locale fields with i18 messages.
	 *
	 * @param	{HTMLElement}	rootNode			Target root node to localize.
	 * @param	{Object}		options				Options.
	 */
	localize(rootNode, options)
	{

		let messages = (this.getAll(options["localeName"]) || this.getAll(options["fallbackLocaleName"]));

		this._valueHandler.setFields(rootNode, messages, options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the messages file.
	 *
	 * @param	{String}		localeName			Locale name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	loadMessages(localeName, options)
	{

		let promise = Promise.resolve();
		let localeInfo = this._localeInfo[localeName] || {};
		let localeSettings = this._options.items;

		if (localeInfo["status"] === "loaded")
		{
			console.debug(`LocaleHandler.loadMessages(): Messages already loaded. name=${this._unit.tagName}, localeName=${localeName}`);
			return promise;
		}

		switch (localeSettings["type"]) {
		case "messages":
			localeInfo["messages"] = BM.Util.getObject(localeInfo["messages"]);
			localeInfo["status"] = "loaded";
			this._messages.merge(localeInfo["messages"]);
			this._localeInfo[localeName] = localeInfo;
			break;
		case "URL":
		default:
			let url = localeSettings["URL"] || this.__getMessageURL(this._unit, localeName);
			promise = BM.AjaxUtil.loadJSON(url, options).then((messages) => {
				localeInfo["messages"] = messages;
				localeInfo["status"] = "loaded";
				this._messages.merge(messages);
				this._localeInfo[localeName] = localeInfo;
			});
			break;
		}

		return promise;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the external messages file.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {Boolean}		True if the unit has the external messages file.
	 */
	__hasExternalMessages(unit)
	{

		let ret = false;

		if (unit.hasAttribute("bm-localeref") || this._options.get("handlerOptions.localeRef"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to messages file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		localeName			Locale name.
	 *
	 * @return  {String}		URL.
	 */
	__getMessageURL(unit, localeName)
	{

		let path;
		let fileName;
		let query;

		let localeRef = (unit.hasAttribute("bm-localeref") ?  unit.getAttribute("bm-localeref") || true : this._options.get("handlerOptions.localeRef"));
		if (localeRef && localeRef !== true)
		{
			// If URL is specified in ref, use it
			let url = BM.URLUtil.parseURL(localeRef);
			fileName = url.filename;
			path = url.path;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = BM.Util.concatPath([
					unit.get("setting", "system.locale.options.path", unit.get("setting", "system.unit.options.path", "")),
					unit.get("setting", "locale.options.path", unit.get("setting", "unit.options.path", "")),
				]);
			fileName = this._options.get("handlerOptions.fileName", unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()));
			let ext = this.__getMessageFormat(unit);
			query = unit.get("setting", "unit.options.query");

			// Split Locale
			let splitLocale = this._options.get("handlerOptions.splitLocale", unit.get("setting", "system.locale.options.splitLocale", false));
			if (splitLocale)
			{
				fileName = ( localeName ? `${fileName}.${localeName}` : fileName);
			}

			fileName = `${fileName}.messages.${ext}`;
		}

		return BM.Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Return default messages file format.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {String}		"js" or "json".
	 */
	__getMessageFormat(unit)
	{

		return this._options.get("messageFormat",
			unit.get("setting", "locale.options.messageFormat",
				unit.get("setting", "system.locale.options.messageFormat",
					"json")));

	}

}
