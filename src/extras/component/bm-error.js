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
import ObservableStore from "../store/observable-store.js";

// =============================================================================
//	Error Server class
// =============================================================================

export default class ErrorServer extends BM.Component
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoTransform":			false,
				}
			},
			"event": {
				"events": {
					"this": {
						"handlers": {
							"beforeStart":		["ErrorServer_onBeforeStart"],
						}
					}
				}
			},
			"skin": {
				"options": {
					"skinRef":					false,
					"styleRef":					false,
				}
			}
			/*
			"rollcall": {
				"members": {
					"ErrorServer": {
						"rootNode":				this.tagName,
					},
				}
			},
			*/
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	ErrorServer_onBeforeStart(sender, e, ex)
	{

		this._observers = new BM.ObservableStore({"filter":this.__filter});

		// Install error listner
		this.__initListeners();

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Filter target components to notify.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		observerInfo		Observer info.
	 */
	__filter(conditions, observerInfo, ...args)
	{

		let result = false;
		let targets = observerInfo["options"]["component"].get("settings", "errors.targets");
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

	// -------------------------------------------------------------------------

	/**
	 * Init error handling listeners.
	 */
	__initListeners()
	{

		window.addEventListener("unhandledrejection", this.__rejectionHandler.bind(this));
		window.addEventListener("error", this.__errorHandler.bind(this));

	}

	// -------------------------------------------------------------------------

	/**
	 * Handle unhandled rejection.
	 *
	 * @param	{Error}			error				Error object.
	 */
	__rejectionHandler(error)
	{

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
			e.name = this.__getErrorName(error);
			e.filename = "";
			e.funcname = ""
			e.lineno = "";
			e.colno = "";
			// e.stack = error.reason.stack;
			// e.object = error.reason;
			//
			this.__handleException(e);
		}
		catch(e)
		{
			console.error("An error occurred in error handler", e);
		}

		//return false;
		return true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Handle error.
	 *
	 * @param	{Error}			error				Error object.
	 * @param	{String}		file				File name.
	 * @param	{Number}		line				Line no.
	 * @param	{Number}		col					Col no.
	 */
	__errorHandler(error, file, line, col)
	{

		let e = {};

		try
		{
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
		}
		catch(e)
		{
			console.error("An error occurred in error handler", e);
		}

		//return false;
		return true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get an error name for the given error object.
	 *
	 * @param	{Object}		error				Error object.
	 *
	 * @return  {String}		Error name.
	 */
	__getErrorName(error)
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

	// -------------------------------------------------------------------------

	/**
	 * Handle an exeption.
	 *
	 * @param	{Object}		e					Error object.
	 */
	__handleException(e)
	{

		//window.stop();

		let statusCode = e.object.status;
		let handlers = this.get("settings", "handlers");
		Object.keys(handlers["statusCode"]).forEach((code) => {
			if (statusCode == code)
			{
				Object.keys(handlers["statusCode"][code]).forEach((command) => {
					let options = handlers["statusCode"][code][command];
					switch (command)
					{
					case "route":
						let routeInfo = options["routeInfo"];
						Object.keys(routeInfo["queryParameters"]).forEach((key) => {
							routeInfo["queryParameters"][key] = routeInfo["queryParameters"][key].replace("@url@", location.href);
						});
						window.location.href = BM.URLUtil.buildURL(routeInfo, {"jump":true});
						/*
						let tagName = options["rootNode"] || "bm-router";
						document.querySelector(tagName).use("skill", "routing.openRoute", routeInfo, {"jump":true});
						*/
						break;
					}
				});
			}
		});

		return this._observers.notifyAsync("error", {"sender":this, "error": e});

	}

}

customElements.define("bm-error", ErrorServer);
