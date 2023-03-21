// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BindableArrayStore from "../store/bindable-array-store.js";
import BindableStore from "../store/bindable-store.js";
import BM from "../bm";
import FormUtil from "../util/form-util.js";

// =============================================================================
//	Locale Organizer Class
// =============================================================================

export default class LocaleOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "LocaleOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"locales",
			"order":		320,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add properties
		Object.defineProperty(component, 'localeHandler', {
			get() { return this._localeHandler; },
		});

		// Add methods to component
		component.loadMessages = function(...args) { return LocaleOrganizer._loadMessages(this, ...args); }

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", LocaleOrganizer.LocaleOrganizer_onDoOrganize);
		this._addOrganizerHandler(component, "afterTransform", LocaleOrganizer.LocaleOrganizer_onAfterTransform);
		this._addOrganizerHandler(component, "afterBuildRows", LocaleOrganizer.LocaleOrganizer_onAfterBuildRows);
		this._addOrganizerHandler(component, "doStart", LocaleOrganizer.LocaleOrganizer_onDoStart);
		this._addOrganizerHandler(component, "beforeLocale", LocaleOrganizer.LocaleOrganizer_onBeforeLocale);
		this._addOrganizerHandler(component, "doLocale", LocaleOrganizer.LocaleOrganizer_onDoLocale);

		// Init vars
		let handlerOptions = {
			"localeName": component.settings.get("locales.settings.localeName", component.settings.get("system.localeName", "en")),
			"fallbackLocaleName": component.settings.get("locales.settings.fallbackLocaleName", component.settings.get("system.fallbackLocaleName", "en")),
		};
		component._localeHandler = BM.ClassUtil.createObject(component.settings.get("locales.settings.handlerClassName"), component, handlerOptions);

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static LocaleOrganizer_onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["locales"], (sectionName, sectionValue) => {
			this._localeHandler.messages.set(sectionName, sectionValue);
		});

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onDoStart(sender, e, ex)
	{

		return Promise.resolve().then(() => {
			if (LocaleOrganizer._hasExternalMessages(this))
			{
				return LocaleOrganizer._loadExternalMessages(this);
			}
		}).then(() => {
			// Subscribe to the Locale Server if exists
			if (document.querySelector("bm-locale") && this !==  document.querySelector("bm-locale"))
			{
				return this.waitFor([{"rootNode":"bm-locale"}]).then(() => {
					document.querySelector("bm-locale").subscribe(this);
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onAfterTransform(sender, e, ex)
	{

		FormUtil.setFields(this, this._localeHandler.get(), {"attribute":"bm-locale"});

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onAfterBuildRows(sender, e, ex)
	{

		FormUtil.setFields(this, this._localeHandler.get(), {"attribute":"bm-locale"});

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onBeforeLocale(sender, e, ex)
	{

		if (!this._localeHandler.messages.has(e.detail.localeName) && this.settings.get("locales.settings.autoLoad"))
		{
			let loadOptions = {
				"localeName":		e.detail.localeName,
			};

			return LocaleOrganizer._loadExternalMessages(this, e.detail.localeName);
		}

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onDoLocale(sender, e, ex)
	{

		this._localeHandler.localeName = e.detail.localeName;

		FormUtil.setFields(this, this._localeHandler.get(), {"attribute":"bm-locale"});

	}

	// -------------------------------------------------------------------------
	//  Protected
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
	static _loadMessages(component, fileName, loadOptions)
	{

		console.debug(`LocaleOrganizer._loadMessages(): Loading messages file. name=${component.name}, fileName=${fileName}`);

		// Filename
		fileName = fileName ||
			component.settings.get("locales.settings.fileName",
				component.settings.get("settings.fileName",
					component.tagName.toLowerCase())) + ".messages";

		let splitLocale = BM.Util.safeGet(loadOptions, "splitLocale",
			component.settings.get("locales.settings.splitLocale",
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
				component.settings.get("locales.settings.path", component.settings.get("settings.path", "")),
			])
		);

		// Load messages
		return BM.SettingOrganizer.loadFile(fileName, path, loadOptions).then((messages) => {
			component._localeHandler.messages.merge(messages);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the component has an external messages file.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {Boolean}		True if the component has an external messages file.
	 */
	static _hasExternalMessages(component)
	{

		let ret = false;

		if (component.hasAttribute("bm-localeref") || component.settings.get("locales.settings.localeRef"))
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
	static _loadExternalMessages(component, localeName)
	{

		let fileName;
		let loadOptions = {"localeName":localeName};
		let localeRef = ( component.hasAttribute("bm-localeref") ?
			component.getAttribute("bm-localeref") || true :
			component.settings.get("locales.settings.localeRef")
		);

		if (localeRef !== true)
		{
			let url = BM.Util.parseURL(localeRef);
			fileName = url.filenameWithoutExtension;
			loadOptions["path"] = url.path;
			loadOptions["query"] = url.query;
		}

		return LocaleOrganizer._loadMessages(component, fileName, loadOptions);

	}

}