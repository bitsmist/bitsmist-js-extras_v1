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

	// Init globals
	BITSMIST.v1.Globals["settings"] = _this._settings;

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
 * Get a value.
 *
 * @param	{String}		key					Key.
 * @param	{Object}		defaultValue		Value returned when key is not found.
 *
 * @return  {*}				Value.
 */
SettingManager.prototype.get = function(key, defaultValue)
{

	return this._settings.get(key, defaultValue);

}

// -----------------------------------------------------------------------------

/**
 * Set a valuee.
 *
 * @param	{String}		key					Key.
 * @param	{Object}		value				Value to store.
 */
SettingManager.prototype.set = function(key, value)
{

	this._settings.set(key, value);

}

// -----------------------------------------------------------------------------

/**
 * Start manager.
 *
 * @return  {Promise}		Promise.
 */
SettingManager.prototype.run = function()
{

	return this.open();

}
