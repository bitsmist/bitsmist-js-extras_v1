// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import LocaleValueUtil from "../util/locale-value-util.js";
import {Util, AjaxUtil, URLUtil, Store, ChainableStore} from "@bitsmist-js_v1/core";

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
		this._options = new Store({"items":options});
		this._messages = new ChainableStore();
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

		// Get messages from settings
		if (options["messages"]) {
			let messages = Util.getObject(options["messages"], {"format":this.#__getMessageFormat(this._unit)});
			this._messages.merge(messages);
		}

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
	 * @param	{String}		localeName			Locale name.
	 * @param	{String}		key					Key.
	 *
 	 * @return  {String}		Messages.
	 */
	get(localeName, key)
	{

		key = localeName + ( key ? `.${key}` : "" );

		return this._messages.get(key);

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

		let messages = (this.get(options["localeName"]) || this.get(options["fallbackLocaleName"]));

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

		let splitMessages = Util.safeGet(options, "splitLocale",
								this._options.get("handlerOptions.splitLocale",
									this._unit.get("setting", "system.locale.options.splitLocale")));
		localeName = ( splitMessages ? localeName : "" );
		let localeInfo = this._localeInfo[localeName] || {};
		let promise = Promise.resolve();

		if (localeInfo["status"] === "loaded")
		{
			console.debug(`LocaleHandler.loadMessages(): Messages already loaded. name=${this._unit.tagName}, localeName=${localeName}`);
			return promise;
		}

		if (this.#__hasExternalMessages(this._unit))
		{
			let url = this.#__getMessageURL(this._unit, localeName);
			promise = AjaxUtil.loadJSON(url, options).then((messages) => {
				localeInfo["messages"] = Util.getObject(messages, {"format":this.#__getMessageFormat(this._unit)});
				localeInfo["status"] = "loaded";
				this._messages.merge(messages);
				this._localeInfo[localeName] = localeInfo;
			});
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
	#__hasExternalMessages(unit)
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
	#__getMessageURL(unit, localeName)
	{

		let path;
		let fileName;
		let query;

		let localeRef = (unit.hasAttribute("bm-localeref") ?  unit.getAttribute("bm-localeref") || true : this._options.get("handlerOptions.localeRef"));
		if (localeRef && localeRef !== true)
		{
			// If URL is specified in ref, use it
			let url = URLUtil.parseURL(localeRef);
			fileName = url.filename;
			path = url.path;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = Util.concatPath([
					unit.get("setting", "system.locale.options.path", unit.get("setting", "system.unit.options.path", "")),
					unit.get("setting", "locale.options.path", unit.get("setting", "unit.options.path", "")),
				]);
			fileName = this._options.get("handlerOptions.fileName", unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()));
			let ext = this.#__getMessageFormat(unit);
			query = unit.get("setting", "unit.options.query");

			// Split Locale
			if (localeName)
			{
				fileName = ( localeName ? `${fileName}.${localeName}` : fileName);
			}

			fileName = `${fileName}.messages.${ext}`;
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Return default messages file format.
	 *
	 * @param       {Unit}                  unit                            Unit.
	 *
	 * @return  {String}            "js" or "json".
	 */
	#__getMessageFormat(unit)
	{

		return this._options.get("messageFormat",
			unit.get("setting", "locale.options.messageFormat",
				unit.get("setting", "system.locale.options.messageFormat",
					"json")));

	}

}
