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
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function PreferenceManager(settings)
{

	// super()
	settings = Object.assign({}, settings, {"name":"PreferenceManager", "autoSetup":false});
	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	// Init vars
	_this._observers = new BITSMIST.v1.Store({"filter":_this.__isTarget.bind(_this)});
	let preferences = Object.assign({}, settings["defaults"]);
	_this._preferences = new BITSMIST.v1.Store({"items":preferences});

	// Init globals
	BITSMIST.v1.Globals["preferences"].items = _this._preferences._items;

	// Event handlers
	_this.addEventHandler(_this, "afterStart", _this.onAfterStart);
	_this.addEventHandler(_this, "beforeSetup", _this.onBeforeSetup);

	return _this;

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
		return this._preferences.items;
	}
})

// -----------------------------------------------------------------------------
//	Event handlers
// -----------------------------------------------------------------------------

/**
 * After start event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
PreferenceManager.prototype.onAfterStart = function(sender, e, ex)
{

	return Promise.resolve().then(() => {
		return this.load();
	}).then((preferences) => {
		return this._preferences.merge(preferences);
	});

}

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
 * Get a value.
 *
 * @param	{String}		key					Key.
 * @param	{Object}		defaultValue		Value returned when key is not found.
 *
 * @return  {*}				Value.
 */
PreferenceManager.prototype.get = function(key, defaultValue)
{

	return this._preferences.get(key, defaultValue);

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

	this._preferences.set(key, value);

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
			this._preferences.merge(options["newPreferences"]);
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

	return this.trigger("doSaveStore", sender, {"data":this._preferences.items});

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