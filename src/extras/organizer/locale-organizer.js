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
		this._addOrganizerHandler(component, "beforeLocale", LocaleOrganizer.LocaleOrganizer_onBeforeLocale);
		this._addOrganizerHandler(component, "doLocale", LocaleOrganizer.LocaleOrganizer_onDoLocale);

		// Init vars
		let handlerOptions = {
			"locale": component.settings.get("locales.settings.locale", component.settings.get("system.locale", "en")),
			"fallbackLocale": component.settings.get("locales.settings.fallbackLocale", component.settings.get("system.fallbackLocale", "en")),
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

		return LocaleOrganizer._loadExternalMessages(this).then(() => {
			// If Locale Server exists, subscribe to it.
			let server = document.querySelector("bm-locale");
			if (server && this !==  server)
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

		let splitLocale = this.settings.get("locales.settings.splitLocale", this.settings.get("system.splitLocale", false));
		if (splitLocale && !this._localeHandler.messages.has(e.detail.locale))
		{
			let loadOptions = {
				"splitLocale":	splitLocale,
				"locale":		e.detail.locale,
			};

			return this.loadMessages("messages", loadOptions);
		}

	}

	// -------------------------------------------------------------------------

	static LocaleOrganizer_onDoLocale(sender, e, ex)
	{

		this._localeHandler.locale = e.detail.locale;

		FormUtil.setFields(this, this._localeHandler.get(), {"attribute":"bm-locale"});

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Load the messages file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		fileName			File name.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadMessages(component, fileName, loadOptions)
	{

		console.debug(`LocaleOrganizer._loadMessages(): Loading messages file. name=${component.name}, fileName=${fileName}`);

		// Filename
		fileName = fileName || "messages";
		if (loadOptions["splitLocale"])
		{
			let locale = BM.Util.safeGet(loadOptions, "locale");
			fileName = `${fileName}.${loadOptions["locale"]}`;
		}

		// Path
		let path = BM.Util.safeGet(loadOptions, "path",
			BM.Util.concatPath([
				component.settings.get("system.appBaseUrl", ""),
				component.settings.get("system.localePath", ""),
				component.settings.get("locales.settings.path", "")
			])
		);

		// Load messages
		return BM.SettingOrganizer.loadFile(fileName, path, loadOptions).then((messages) => {
			component._localeHandler.messages.merge(messages);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load an external messages file.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadExternalMessages(component)
	{

		let localeRef;
		let promise = Promise.resolve();

		if (component.hasAttribute("bm-localeref"))
		{
			localeRef = component.getAttribute("bm-localeref") || true;
		}
		else
		{
			localeRef = component.settings.get("locales.settings.localeRef");
		}

		if (localeRef)
		{
			let fileName;
			let loadOptions = {};

			if (localeRef === true)
			{
				fileName = component.settings.get("locales.settings.fileName", "messages");
			}
			else
			{
				let url = BM.Util.parseURL(component.getAttribute("bm-localeref"));
				fileName = url.filenameWithoutExtension;
				loadOptions["path"] = url.path;
				loadOptions["query"] = url.query;
			}

			loadOptions["splitLocale"] = component.settings.get("locales.settings.splitLocale", component.settings.get("system.settings.splitLocale", false));

			promise = LocaleOrganizer._loadMessages(component, fileName, loadOptions);
		}

		return promise

	}

}
