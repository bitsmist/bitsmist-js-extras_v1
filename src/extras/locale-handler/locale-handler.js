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

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	/**
	 * Name.
	 *
	 * @type	{String}
	 */
	get name()
	{

		return "LocaleHandler";

	}

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

		this._component._enumSettings(options["messages"], (sectionName, sectionValue) => {
			this._messages.set(sectionName, sectionValue);
		});

		if (this.__hasExternalMessages(this._component))
		{
			return this.__loadExternalMessages(this._component);
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

		LocaleValueUtil.setFields(rootNode, messages, options);

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
	//static loadMessages(component, fileName, loadOptions)
	loadMessages(loadOptions)
	{

		console.debug(`LocaleHandler._loadMessages(): Loading the messages file. name=${this._component.name}`);

		let component = this._component;

		// Filename
		let fileName = BM.Util.safeGet(loadOptions, "fileName",
			this._options.get("fileName",
				component.settings.get("settings.fileName",
					component.tagName.toLowerCase()) + ".messages"));

		// Split Locale
		let splitLocale = BM.Util.safeGet(loadOptions, "splitLocale",
			this._options.get("splitLocale",
				component.settings.get("system.settings.splitLocale", false)));
		if (splitLocale)
		{
			let localeName = BM.Util.safeGet(loadOptions, "localeName");
			fileName = ( localeName ? `${fileName}.${localeName}` : fileName);
		}

		// Path
		let path = BM.Util.safeGet(loadOptions, "path",
			BM.Util.concatPath([
				component.settings.get("system.appBaseUrl", ""),
				component.settings.get("system.localePath", component.settings.get("system.componentPath", "")),
				this._options.get("path", component.settings.get("settings.path", "")),
			])
		);

		// Load messages
		return BM.SettingOrganizer.loadFile(fileName, path, loadOptions).then((messages) => {
			this._messages.merge(messages);
		});

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
	 * Load an external messages file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		localeName			Locale name to load.
	 *
	 * @return  {Promise}		Promise.
	 */
	__loadExternalMessages(component, localeName)
	{

		let loadOptions = {"localeName":localeName};
		let localeRef = ( component.hasAttribute("bm-localeref") ?
			component.getAttribute("bm-localeref") || true :
			this._options.get("localeRef")
		);

		if (localeRef && localeRef !== true)
		{
			let url = BM.Util.parseURL(localeRef);
			loadOptions["fileName"] = url.filenameWithoutExtension;
			loadOptions["path"] = url.path;
			loadOptions["query"] = url.query;
		}

		//return LocaleHandler._loadMessages(component, fileName, loadOptions);
		return this.loadMessages(loadOptions);

	}

}
