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
	constructor(component, options)
	{

		options = options || {};

		this._component = component;
		this._options = new BM.Store({"items":options});
		this._messages = new BM.ChainableStore();
		this._valueHandler = this.options.get("valueHandler", LocaleValueUtil);

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
		Object.entries(options["messages"] || {}).forEach(([sectionName, sectionValue]) => {
			this._messages.set(sectionName, sectionValue);
		});

		// Load external messages
		Promise.resolve().then(() => {
			return this.loadMessages();
		}).then(() => {
			this._component.inventory.get("locale.messages").add(this.messages);
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
	get(key, localeName, ...args)
	{

		key  = localeName + ( key ? `.${key}` : "" );

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

		if (this.__hasExternalMessages(this._component, localeName))
		{
			return BM.AjaxUtil.loadJSON(this.__getMessageURL(this._component, localeName), options).then((messages) => {
				this._messages.merge(messages);
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if the component has the external messages file.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {Boolean}		True if the component has the external messages file.
	 */
	__hasExternalMessages(component)
	{

		let ret = false;

		if (component.hasAttribute("bm-localeref") || this._options.get("localeRef"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to messages file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		localeName			Locale name.
	 *
	 * @return  {String}		URL.
	 */
	__getMessageURL(component, localeName)
	{

		let path;
		let fileName;
		let query;

		let localeRef = (component.hasAttribute("bm-localeref") ?  component.getAttribute("bm-localeref") || true : this._options.get("localeRef"));
		if (localeRef && localeRef !== true)
		{
			// If URL is specified in ref, use it
			let url = BM.Util.parseURL(localeRef);
			fileName = url.filename;
			path = url.path;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = BM.Util.concatPath([
					component.settings.get("system.appBaseUrl", ""),
					component.settings.get("system.localePath", component.settings.get("system.componentPath", "")),
					component.settings.get("setting.path", ""),
				]);

			fileName = this._options.get("fileName", component.settings.get("setting.fileName", component.tagName.toLowerCase()));
		}

		// Split Locale
		let splitLocale = this._options.get("splitLocale", component.settings.get("system.splitLocale", false));
		if (splitLocale)
		{
			fileName = ( localeName ? `${fileName}.${localeName}` : fileName);
		}

		fileName = `${fileName}.messages`;

		return BM.Util.concatPath([path, fileName]) + ( query ? `?${query}` : "" );

	}

}
