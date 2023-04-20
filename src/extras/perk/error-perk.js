// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BM from "../bm";

// =============================================================================
//	Error Perk class
// =============================================================================

export default class ErrorPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static PreferencePerk_onDoStart(sender, e, ex)
	{

		if (document.querySelector("bm-error") && this !==  document.querySelector("bm-error"))
		{
			return this.waitFor([{"rootNode":"bm-error"}]).then(() => {
				document.querySelector("bm-error").subscribe(this, this.settings.get("errors"));
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"error",
			"order":		120,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/*
	static globalInit()
	{

		ErrorPerk._observers = new BM.ObservableStore({"filter":ErrorPerk.__filter});

		// Install error listner
		document.addEventListener("DOMContentLoaded", () => {
			if (BM.settings.get("perks.ErrorPerk.settings.captureError", true))
			{
				ErrorPerk.__initErrorListeners();
			}
		});

	}
	*/

	// -------------------------------------------------------------------------

	/*
	static init(component, options)
	{

		let errors = BM.Util.safeGet(options, "setting.errors");
		if (errors)
		{
			ErrorPerk._observers.subscribe(component.uniqueId, component.trigger.bind(component), {"component":component});
		}

	}
	*/

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Filter target components to notify.
	 *
	 * @param	{Component}		component			Component.
 	 * @param	{Object}		observerInfo		Observer info.
	 */
	/*
	static __filter(conditions, observerInfo, ...args)
	{

		let result = false;
		let targets = observerInfo["options"]["component"].settings.get("errors.targets");
		let e = args[0]["error"];

		for (let i = 0; i < targets.length; i++)
		{
			if (e.name === targets[i] || targets[i] === "*")
			{
				result = true;
				break;
			}
		}

		return result;

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Init error handling listeners.
	 */
	/*
	static __initErrorListeners()
	{

		window.addEventListener("unhandledrejection", (error) => {
			let e = {};

			try
			{
				if (error.reason)
				{
					if (error.reason instanceof XMLHttpRequest)
					{
						e.message = error.reason.statusText;
						e.stack = error.reason.stack;
						e.object = error.reason;
					}
					else
					{
						e.message = error.reason.message;
						e.object = error.reason;
					}
				}
				else
				{
					e.message = error;
				}
				e.type = error.type;
				e.name = ErrorPerk.__getErrorName(error);
				e.filename = "";
				e.funcname = ""
				e.lineno = "";
				e.colno = "";
				// e.stack = error.reason.stack;
				// e.object = error.reason;
				//
				ErrorPerk.__handleException(e);
			}
			catch(e)
			{
				console.error("An error occurred in error handler", e);
			}

			return false;
			//return true;
		});

		window.addEventListener("error", (error, file, line, col) => {
			let e = {};

			try
			{
				e.type = "error";
				e.name = ErrorPerk.__getErrorName(error);
				e.message = error.message;
				e.file = error.filename;
				e.line = error.lineno;
				e.col = error.colno;
				if (error.error)
				{
					e.stack = error.error.stack;
					e.object = error.error;
				}

				ErrorPerk.__handleException(e);
			}
			catch(e)
			{
				console.error("An error occurred in error handler", e);
			}

			return false;
			//return true;
		});

	}
	*/

	// -------------------------------------------------------------------------

	/**
	* Get an error name for the given error object.
	*
	* @param	{Object}		error				Error object.
	*
	* @return  {String}			Error name.
	*/
	/*
	static __getErrorName(error)
	{

		let name;
		let e;

		if (error.reason instanceof XMLHttpRequest)		e = error.reason;
		else if (error.reason)	e = error.reason;
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
	*/

	// -------------------------------------------------------------------------

	/**
	* Handle an exeption.
	*
	* @param	{Object}		e					Error object.
	*/
	/*
	static __handleException(e)
	{

		return ErrorPerk._observers.notifyAsync("error", {"sender":ErrorPerk, "error": e});

	}
	*/

}
