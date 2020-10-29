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
	settings = Object.assign({}, settings, {"name":"PreferenceManager", "autoOpen":false, "autoSetup":false});
	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	// Init vars
	_this._targets = {};

	// Event handlers
	_this.addEventHandler(_this, "connected", _this.onConnected);
	_this.addEventHandler(_this, "beforeSetup", _this.onBeforeSetup);

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(PreferenceManager, BITSMIST.v1.Component);
customElements.define("bm-preference", PreferenceManager);

// -----------------------------------------------------------------------------
//	Event handlers
// -----------------------------------------------------------------------------

/**
 * Connected event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 */
PreferenceManager.prototype.onConnected = function(sender, e)
{

	this.run();

}

// -----------------------------------------------------------------------------

/**
 * Before setup event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 *
 * @return  {Promise}		Promise.
 */
PreferenceManager.prototype.onBeforeSetup = function(sender, e)
{

	let settings = e.detail;

	return new Promise((resolve, reject) => {
		let promises = [];

		Object.keys(this._targets).forEach((componentId) => {
			if (this.__isTarget(settings, this._targets[componentId].targets))
			{
				promises.push(this._targets[componentId].object.setup(settings));
			}
		});

		Promise.all(promises).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start manager.
 *
 * @return  {Promise}		Promise.
 */
PreferenceManager.prototype.run = function()
{

	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return this.load();
		}).then((preferences) => {
			return this._preferences.merge(preferences);
		}).then(() => {
			// Init globals
			BITSMIST.v1.Globals["preferences"].items = Object.assign({}, this._settings.get("defaults"), this._preferences.items);
		}).then(() => {
			return this.open();
		}).then(() => {
			resolve();
		});
	});

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

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		BITSMIST.v1.Component.prototype.setup.call(this, options).then(() => {
			if (options["newPreferences"])
			{
				this._preferences.merge(options["newPreferences"]);
				BITSMIST.v1.Globals["preferences"].items = this._preferences.items;
				this.save();
			}
		}).then(() => {
			resolve();
		});
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

	this._targets[component.uniqueId] = {"object":component, "targets":targets};

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

	return this.trigger("loadStore", sender);

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

	return this.trigger("saveStore", sender, {"preferences":this._preferences.items});

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Init preferences.
 */
PreferenceManager.prototype.__initPreferences = function()
{

	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return this.load();
		}).then((preferences) => {
			return this._preferences.merge(preferences);
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Check if it is a target.
 *
 * @param	{Object}		settings			Settings.
 * @param	{Object}		target				Target component to check.
 */
PreferenceManager.prototype.__isTarget = function(settings, target)
{

	let result = false;

	/*
	if (target == "*")
	{
		return true;
	}
	*/

	for (let i = 0; i < target.length; i++)
	{
		if (settings["newPreferences"].hasOwnProperty(target[i]))
		{
			result = true;
			break;
		}
	}

	return result;

}
