// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ErrorManager from "./error-manager";
import PreferenceManager from "./preference-manager";
import SettingManager from "./setting-manager";

// =============================================================================
//	App class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function App(settings)
{

	// super()
	settings = Object.assign({}, settings, {"name":"App", "autoOpen":false, "autoSetup":false});
	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	// Init vars
	_this._targets = {};
	_this._preferenceManager = new PreferenceManager(_this._settings.get("preferences"));
	_this._errorManager = new ErrorManager();
	_this._settingManager = new SettingManager(_this._settings.get("globals"));

	// Event handlers
	_this.addEventHandler(_this, "afterConnect", _this.onAfterConnect);

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(App, BITSMIST.v1.Component);
customElements.define("bm-app", App);

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Global preferences.
 *
 * @type	{String}
 */
Object.defineProperty(App.prototype, 'globalPreferences', {
	get()
	{
		return this._preferenceManager;
	}
})

// -----------------------------------------------------------------------------

/**
 * Global settings.
 *
 * @type	{String}
 */
Object.defineProperty(App.prototype, 'globalSettings', {
	get()
	{
		return this._settingManager;
	}
})

// -----------------------------------------------------------------------------
//	Event handlers
// -----------------------------------------------------------------------------

/**
 * After connect event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
App.prototype.onAfterConnect = function(sender, e, ex)
{

	return this.run();

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start application.
 *
 * @return  {Promise}		Promise.
 */
App.prototype.run = function()
{

	// Start managers
	this._settingManager.run();
	this._preferenceManager.run();
	this._errorManager.run();

	return this.open();

}

// -----------------------------------------------------------------------------

/**
 * Add a component.
 *
 * @param	{String}		componentName		Component name.
 * @param	{Object}		options				Options for the component.
 *
 * @return  {Promise}		Promise.
 */
App.prototype.addComponent = function(componentName, options)
{

	return BITSMIST.v1.Globals.addComponent(this, componentName, options);

}
