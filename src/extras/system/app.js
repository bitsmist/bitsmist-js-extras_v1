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
 */
export default function App()
{

	// super()
	return Reflect.construct(BITSMIST.v1.Component, [], this.constructor);

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

/**
 * Components.
 *
 * @type	{String}
 */
Object.defineProperty(App.prototype, 'components', {
	get()
	{
		return this._components;
	}
})

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start component.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
App.prototype.start = function(settings)
{

	// Init component settings
	settings = Object.assign({}, settings, {"name":"App", "autoSetup":false});

	// Init vars
	this._preferenceManager = new PreferenceManager();
	this._errorManager = new ErrorManager();
	this._settingManager = new SettingManager();

	// Start
	return BITSMIST.v1.Component.prototype.start.call(this, settings).then(() => {
		// Start managers
		this._settingManager.start(settings["globals"]);
		this._preferenceManager.start(settings["preferences"]);
		this._errorManager.start();
	});

}
