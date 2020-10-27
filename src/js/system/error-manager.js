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
	settings = Object.assign({}, {"name":"ErrorManager", "templateName":"", "autoSetup":false}, settings);
	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	// Init vars
	_this._targets = {};

	// Init error listeners
	_this.__initErrorListeners();

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(ErrorManager, BITSMIST.v1.Component);
customElements.define("bm-error", ErrorManager);

// -----------------------------------------------------------------------------
//  Methods
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

	this._targets[component.uniqueId] = {"object":component, "targets":targets};

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Check if it is a target.
 *
 * @param	{Object}		settings			Settings.
 * @param	{Object}		target				Target component to check.
 */
ErrorManager.prototype.__isTarget = function(settings, target)
{

	return true;

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
			if (error.reason instanceof XMLHttpRequest)
			{
				e.message = error.reason.statusText;
			}
			else
			{
				e.message = error.reason.message;
			}
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
		e.stack = error.reason.stack;
		e.object = error.reason;

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

	console.error("@@@ErrorManager", e);

	Object.keys(this._targets).forEach((key) => {
		if (this.__isTarget(this._targets[key].object, this._targets[key].targets))
		{
			this._targets[key].object.trigger("error", this, {"error":e});
		}
	});

}