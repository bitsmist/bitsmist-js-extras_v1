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
	let localSettings = Object.assign({}, {"name":"SettingManager", "autoSetup":false});

	// Init vars
	BITSMIST.v1.Globals["settings"].items = settings;

	// Start
	return BITSMIST.v1.Component.prototype.start.call(this, localSettings);

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
