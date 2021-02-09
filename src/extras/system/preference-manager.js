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
//	Preference manager class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function PreferenceManager()
{

	// super()
	return Reflect.construct(BITSMIST.v1.Component, [], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(PreferenceManager, BITSMIST.v1.Component);
customElements.define("bm-preference", PreferenceManager);

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Items.
 *
 * @type	{String}
 */
Object.defineProperty(PreferenceManager.prototype, 'items', {
	get()
	{
		return BITSMIST.v1.Globals["preferences"].items;
	}
})

// -----------------------------------------------------------------------------
//	Event handlers
// -----------------------------------------------------------------------------

/**
 * Before setup event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 *
 * @return  {Promise}		Promise.
 */
PreferenceManager.prototype.onBeforeSetup = function(sender, e, ex)
{

	let settings = e.detail;

	return this._observers.notifySync("setup", settings, settings);

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
PreferenceManager.prototype.start = function(settings)
{

	// Init component settings
	settings = Object.assign({}, settings, {"name":"PreferenceManager", "autoSetup":false});

	// Init vars
	this._observers = new BITSMIST.v1.Store({"filter":this.__isTarget.bind(this)});

	// Start
	return BITSMIST.v1.Component.prototype.start.call(this, settings).then(() => {
		BITSMIST.v1.Globals["preferences"].items = this._settings.items["defaults"];
		this.addEventHandler(this, "beforeSetup", this.onBeforeSetup);
	}).then(() => {
		// Load preferences
		return this.load();
	}).then((preferences) => {
		// Merge preferences
		BITSMIST.v1.Globals["preferences"].merge(preferences);
	});

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
PreferenceManager.prototype.get = function(key, defaultValue)
{

	return BITSMIST.v1.Globals["preferences"].get(key, defaultValue);

}

// -----------------------------------------------------------------------------

/**
 * Set a valuee.
 *
 * @param	{String}		key					Key.
 * @param	{Object}		value				Value to store.
 */
PreferenceManager.prototype.set = function(key, value)
{

	BITSMIST.v1.Globals["preferences"].set(key, value);

}

// -----------------------------------------------------------------------------

/**
 * Apply settings.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
PreferenceManager.prototype.setup = function(options)
{

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	return BITSMIST.v1.Component.prototype.setup.call(this, options).then(() => {
		if (options["newPreferences"])
		{
			BITSMIST.v1.Globals["preferences"].merge(options["newPreferences"]);
			this.save();
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Register target component.
 *
 * @param	{Component}		component			Component to notify.
 * @param	{Object}		targets				Targets.
 *
 * @return  {Promise}		Promise.
 */
PreferenceManager.prototype.register = function(component, targets)
{

	this._observers.set(component.uniqueId, {"object":component, "targets":targets});

}

// -----------------------------------------------------------------------------

/**
 * Deregister target component.
 *
 * @param	{Component}		component			Component to notify.
 *
 * @return  {Promise}		Promise.
 */
PreferenceManager.prototype.deregister = function(component)
{

	this._observers.remove(component.uniqueId);

}

// -------------------------------------------------------------------------

/**
 * Load items.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
PreferenceManager.prototype.load = function(options)
{

	let sender = ( options && options["sender"] ? options["sender"] : this );

	return this.trigger("doLoadStore", sender);

}

// -------------------------------------------------------------------------

/**
 * Save items.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
PreferenceManager.prototype.save = function(options)
{

	let sender = ( options && options["sender"] ? options["sender"] : this );

	return this.trigger("doSaveStore", sender, {"data":BITSMIST.v1.Globals["preferences"].items});

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Check if it is a target.
 *
 * @param	{Object}		conditions			Conditions.
 * @param	{Object}		target				Target to check.
 */
PreferenceManager.prototype.__isTarget = function(conditions, info)
{

	let result = false;
	let target = info["targets"];

	/*
	if (target == "*")
	{
		return true;
	}
	*/

	for (let i = 0; i < target.length; i++)
	{
		if (conditions["newPreferences"].hasOwnProperty(target[i]))
		{
			result = true;
			break;
		}
	}

	return result;

}
