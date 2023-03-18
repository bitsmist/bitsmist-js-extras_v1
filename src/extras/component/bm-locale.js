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
import ObservableStore from "../store/observable-store.js";

// =============================================================================
//	Locale Server Class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

export default function LocaleServer(settings)
{

	return Reflect.construct(BM.Component, [settings], this.constructor);

}

BM.ClassUtil.inherit(LocaleServer, BM.Component);

// -----------------------------------------------------------------------------
//	Settings
// -----------------------------------------------------------------------------

LocaleServer.prototype._getSettings = function()
{

	return {
		// Settings
		"settings": {
			"autoClear":				false,
			"autoFill":					false,
			"autoTransform":			false,
			"name":						"LocaleServer",
		},

		// Events
		"events": {
			"this": {
				"handlers": {
					"doFetch":			["LocaleServer_onDoFetch"],
					"beforeStart":		["LocaleServer_onBeforeStart"],
				}
			}
		},
	}

}

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Locale.
 *
 * @type	{Object}
 */
Object.defineProperty(LocaleServer.prototype, 'locale', {
	get()
	{
		return this._locale;
	},
	set(value)
	{
		this._locale = value;
		this._store.notify("*", {"locale":value});
	}
})

// -----------------------------------------------------------------------------
//  Event Handlers
// -----------------------------------------------------------------------------

LocaleServer.prototype.LocaleServer_onBeforeStart = function(sender, e, ex)
{

	this._locale;
	this._store = new ObservableStore({"async":true});

}

LocaleServer.prototype.LocaleServer_onDoFetch = function(sender, e, ex)
{

	this._store.items = e.detail.items;

}

// -----------------------------------------------------------------------------

/**
 * Load a messages file.
 *
 * @param	{Component}		component			Component.
 * @param	{Object}		loadOptions			Load options.
 *
 * @return  {Promise}		Promise.
 */
/*
LocaleServer.prototype._loadMessages = function(component, loadOptions)
{

	console.debug(`LocaleServer._loadSpec(): Loading spec file. name=${component.name}`);

	// Path
	let path = BM.Util.safeGet(loadOptions, "path",
		BM.Util.concatPath([
			component.settings.get("system.appBaseUrl", ""),
		])
	);

	console.log("@@@", component.name, path, loadOptions);

	// Load messages
	return BM.SettingOrganizer.loadFile("messages", path, loadOptions).then((result) => {
		console.log("@@@", result);
		let messages = result[0];

		return messages;
	});

}
*/

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

LocaleServer.prototype.subscribe = function(component, options)
{

	this._store.subscribe(
		component.name + "_" + component.uniqueId,
		this._triggerEvent.bind(component),
	);

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Trigger preference changed events.
 *
 * @param	{Object}		items				Changed items.
 *
 * @return  {Promise}		Promise.
 */
LocaleServer.prototype._triggerEvent = function(items, options)
{

	let sender = BM.Util.safeGet(options, "sender");
	let locale = options["locale"];

	return this.trigger("doLocale", {"sender":sender, "locale":locale});

}

// ----------------------------------------------------------------------------

customElements.define("bm-locale", LocaleServer);
