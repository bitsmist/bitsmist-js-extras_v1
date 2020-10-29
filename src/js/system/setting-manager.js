// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Setting manager class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function SettingManager(settings)
{

	// super()
	settings = Object.assign({}, settings, {"name":"SettingManager", "autoOpen":false, "autoSetup":false});
	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	// Event handlers
	_this.addEventHandler(_this, "connected", _this.onConnected);

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(SettingManager, BITSMIST.v1.Component);
customElements.define("bm-setting", SettingManager);

// -----------------------------------------------------------------------------
//	Event handlers
// -----------------------------------------------------------------------------

/**
 * Connected event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 */
SettingManager.prototype.onConnected = function(sender, e)
{

	this.run();

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start manager.
 *
 * @return  {Promise}		Promise.
 */
SettingManager.prototype.run = function()
{

	// Init globals
	BITSMIST.v1.Globals["settings"].items = this._settings.items;

	return this.open();

}
