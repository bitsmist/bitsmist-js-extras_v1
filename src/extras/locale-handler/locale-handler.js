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

		// Chain this handler's messages store to unit's locale.messages store
		this._unit.get("inventory", "locale.messages").add(this._messages);

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

		let splitMessages = BM.Util.safeGet(options, "splitLocale",
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

		switch (this._options.get("type")) {
		case "messages":
			localeInfo["messages"] = BM.Util.getObject(this._options.get("messages"));
			localeInfo["status"] = "loaded";
			this._messages.merge(localeInfo["messages"]);
			this._localeInfo[localeName] = localeInfo;
			break;
		case "URL":
		default:
			let url = this._options.get("URL", this.__getMessageURL(this._unit, localeName));
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
			let ext = this._options.get("messageFormat",
						unit.get("setting", "locale.options.messageFormat",
							unit.get("setting", "system.locale.options.messageFormat", "json")));
			query = unit.get("setting", "unit.options.query");

			// Split Locale
			if (localeName)
			{
				fileName = ( localeName ? `${fileName}.${localeName}` : fileName);
			}

			fileName = `${fileName}.messages.${ext}`;
		}

		return BM.Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

}
