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
//	Error manager class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function ErrorManager(settings)
{

	// super()
	settings = Object.assign({}, settings, {"name":"ErrorManager", "autoOpen":false, "autoSetup":false});
	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	// Init vars
	_this._observers = new BITSMIST.v1.Observer();

	// Event handlers
	_this.addEventHandler(_this, "afterConnect", _this.onAfterConnect);

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(ErrorManager, BITSMIST.v1.Component);
customElements.define("bm-error", ErrorManager);

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
ErrorManager.prototype.onAfterConnect = function(sender, e, ex)
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
ErrorManager.prototype.run = function()
{

	this.__initErrorListeners();

	return this.open();

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
ErrorManager.prototype.register = function(component, targets)
{

	this._observers.register(component.uniqueId, {"object":component, "targets":targets});

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Check if it is a target.
 *
 * @param	{Component}		component			Component.
 * @param	{Object}		target				Target component to check.
 * @param	{Object}		e					Error object.
 */
ErrorManager.prototype.__isTarget = function(component, target, e)
{

	let result = false;

	for (let i = 0; i < target.length; i++)
	{
		if (target[i] && e.name == target[i])
		{
			result = true;
		}
	}

	return result;

}

// -----------------------------------------------------------------------------

/**
 * Init error handling listeners.
 */
ErrorManager.prototype.__initErrorListeners = function()
{

	window.addEventListener("unhandledrejection", (error) => {
		let e = {};

		if (error["reason"])
		{
			e.message = ( error.reason instanceof XMLHttpRequest ? error.reason.statusText : error.reason.message );
			e.stack = error.reason.stack;
			e.object = error.reason;
		}
		else
		{
			e.message = error;
		}
		e.type = error.type;
		e.name = this.__getErrorName(error);
		e.filename = "";
		e.funcname = ""
		e.lineno = "";
		e.colno = "";
		// e.stack = error.reason.stack;
		// e.object = error.reason;

		this.__handleException(e);

		return false;
		//return true;
	});

	window.addEventListener("error", (error, file, line, col) => {
		let e = {};

		e.type = "error";
		e.name = this.__getErrorName(error);
		e.message = error.message;
		e.file = error.filename;
		e.line = error.lineno;
		e.col = error.colno;
		if (error.error)
		{
			e.stack = error.error.stack;
			e.object = error.error;
		}

		this.__handleException(e);

		return false;
		//return true;
	});

}

// -----------------------------------------------------------------------------

/**
 * Get an error name for the given error object.
 *
 * @param	{Object}		error				Error object.
 *
 * @return  {String}		Error name.
 */
ErrorManager.prototype.__getErrorName = function(error)
{

	let name;
	let e;

	if (error.reason)		e = error.reason;
	else if (error.error)	e = error.error;
	else					e = error.message;

	if (e.name)									name = e.name;
	else if (e instanceof TypeError)			name = "TypeError";
	else if (e instanceof XMLHttpRequest)		name = "AjaxError";
	else if (e instanceof EvalError)			name = "EvalError";
//	else if (e instanceof InternalError)		name = "InternalError";
	else if (e instanceof RangeError)			name = "RangeError";
	else if (e instanceof ReferenceError)		name = "ReferenceError";
	else if (e instanceof SyntaxError)			name = "SyntaxError";
	else if (e instanceof URIError)				name = "URIError";
	else
	{
		let pos = e.indexOf(":");
		if (pos > -1)
		{
			name = e.substring(0, pos);
		}
	}

	return name;

}

// -----------------------------------------------------------------------------

/**
 * Handle an exeption.
 *
 * @param	{Object}		e					Error object.
 */
ErrorManager.prototype.__handleException = function(e)
{

	return this._observers.notifySync("handle", e, "afterError", this, {"error":e});

}
