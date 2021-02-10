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
import Router from "./router";
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
 * Router.
 *
 * @type	{String}
 */
Object.defineProperty(App.prototype, 'router', {
	get()
	{
		return this._router;
	}
})

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

	// Inject settings

	SettingManager.prototype._injectSettings = (settings) => {
		return Object.assign({}, settings, {"globals":this._settings.items["globals"]});
	};

	PreferenceManager.prototype._injectSettings = (settings) => {
		return Object.assign({}, settings, this._settings.items["preferences"]);
	};

	Router.prototype._injectSettings = (settings) => {
		return Object.assign({}, settings, this._settings.items["router"]);
	};

	// Start
	return BITSMIST.v1.Component.prototype.start.call(this, settings).then(() => {
		if ( document.readyState !== 'loading' )
		{
			this.__install();
		}
		else
		{
			window.addEventListener('DOMContentLoaded', this.__install.bind(this));
		}
	});

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Install components.
 */
App.prototype.__install = function()
{

	let rootNode = ( this.isConnected ? this : document.body );

	rootNode.insertAdjacentHTML("afterbegin", "<bm-setting></bm-setting>");
	this._settingManager = rootNode.children[0];

	rootNode.insertAdjacentHTML("afterbegin", "<bm-error></bm-error>");
	this._errorManager = rootNode.children[0];

	rootNode.insertAdjacentHTML("afterbegin", "<bm-preference></bm-preference>");
	this._preferenceManager = rootNode.children[0];

	this.waitFor([{"name":"SettingManager", "status":"started"}]).then(() => {
		rootNode.insertAdjacentHTML("afterbegin", "<bm-router></bm-router>");
		this._router = rootNode.children[0];

		rootNode.insertAdjacentHTML("afterbegin", "<bm-tagloader></bm-tagloader>");
	});

}
