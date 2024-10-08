// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Unit, URLUtil} from "@bitsmist-js_v1/core";

// =============================================================================
//	Error Server class
// =============================================================================

export default class ErrorServer extends Unit
{

	// -------------------------------------------------------------------------
	//	Settings
	// -------------------------------------------------------------------------

	_getSettings()
	{

		return {
			"basic": {
				"options": {
					"autoRefresh":					false,
				}
			},
			"event": {
				"events": {
					"this": {
						"handlers": {
							"beforeStart":			["ErrorServer_onBeforeStart"],
						}
					}
				}
			},
			"skin": {
				"options": {
					"hasSkin":						false,
				}
			},
			"style": {
				"options": {
					"hasStyle":						false,
				}
			},
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	ErrorServer_onBeforeStart(sender, e, ex)
	{

		// Install error listner
		this.#__initListeners();

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Init error handling listeners.
	 */
	#__initListeners()
	{

		window.addEventListener("unhandledrejection", this.#__rejectionHandler.bind(this));
		window.addEventListener("error", this.#__errorHandler.bind(this));

	}

	// -------------------------------------------------------------------------

	/**
	 * Handle unhandled rejection.
	 *
	 * @param	{Error}			error				Error object.
	 */
	#__rejectionHandler(error)
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
			e.name = this.#__getErrorName(error);
			e.filename = "";
			e.funcname = ""
			e.lineno = "";
			e.colno = "";
			// e.stack = error.reason.stack;
			// e.object = error.reason;
			//
			this.#__handleException(e);
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
	#__errorHandler(error, file, line, col)
	{

		let e = {};

		try
		{
			e.type = "error";
			e.name = this.#__getErrorName(error);
			e.message = error.message;
			e.file = error.filename;
			e.line = error.lineno;
			e.col = error.colno;
			if (error.error)
			{
				e.stack = error.error.stack;
				e.object = error.error;
			}

			this.#__handleException(e);
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
	#__getErrorName(error)
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
	#__handleException(e)
	{

		let statusCode = e.object.status;
		let handlers = this.get("setting", "handlers");
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
							routeInfo["queryParameters"][key] = routeInfo["queryParameters"][key].replace("@URL@", location.href);
						});
						window.location.href = URLUtil.buildURL(routeInfo);
						/*
						let tagName = options["selector"] || "bm-router";
						document.querySelector(tagName).cast("routing.openRoute", routeInfo, {"jump":true});
						*/
						break;
					}
				});
			}
		});

	}

}

customElements.define("bm-error", ErrorServer);
