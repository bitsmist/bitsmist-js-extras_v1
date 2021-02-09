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
 */
export default function SettingManager()
{

	// super()
	return Reflect.construct(BITSMIST.v1.Component, [], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(SettingManager, BITSMIST.v1.Component);
customElements.define("bm-setting", SettingManager);

// -----------------------------------------------------------------------------
//  Event handlers
// -----------------------------------------------------------------------------

/**
 * After append event hadler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
SettingManager.prototype.onAfterStart = function(sender, e, ex)
{

	BITSMIST.v1.Globals["settings"].items = this._settings.items["globals"];

}

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
SettingManager.prototype.start = function(settings)
{

	// Init component settings
	settings = Object.assign({}, settings, {"name":"SettingManager", "autoSetup":false});

	// Start
	return BITSMIST.v1.Component.prototype.start.call(this, settings);

}
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

	return BITSMIST.v1.Globals["settings"].get(key, defaultValue);

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

	BITSMIST.v1.Globals["settings"].set(key, value);

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Inject event handlers.
 */
SettingManager.prototype._injectEvents = function()
{

	this.addEventHandler(this, "afterStart", this.onAfterStart);

}
