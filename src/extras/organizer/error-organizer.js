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
//	Error organizer class
// =============================================================================

export default class ErrorOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Global init.
	 */
	static globalInit()
	{

		ErrorOrganizer._observers = new BITSMIST.v1.ObservableStore({"filter":ErrorOrganizer.__filter});

		// Install error listner
		document.addEventListener("DOMContentLoaded", () => {
			if (BITSMIST.v1.settings.get("organizers.ErrorOrganizer.settings.captureError", true))
			{
				ErrorOrganizer.__initErrorListeners();
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		let errors = component.settings.get("errors");
		if (errors)
		{
			ErrorOrganizer._observers.subscribe(component.uniqueId, component.trigger.bind(component), {"component":component});
		}

		return settings;

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Filter target components to notify.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		target				Target component to check.
	 * @param	{Object}		e					Event object.
	 */
	static __filter(conditions, options, sender, e)
	{

		let result = false;
		let targets = options["component"].settings.get("errors.targets");

		for (let i = 0; i < targets.length; i++)
		{
			if (e.error.name == targets[i])
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
	static __initErrorListeners()
	{

		window.addEventListener("unhandledrejection", (error) => {
			let e = {};

			//try
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
				e.name = ErrorOrganizer.__getErrorName(error);
				e.filename = "";
				e.funcname = ""
				e.lineno = "";
				e.colno = "";
				// e.stack = error.reason.stack;
				// e.object = error.reason;
			}
			/*
			catch(e)
			{
			}
			*/

			ErrorOrganizer.__handleException(e);

			return false;
			//return true;
		});

		window.addEventListener("error", (error, file, line, col) => {
			let e = {};

			e.type = "error";
			e.name = ErrorOrganizer.__getErrorName(error);
			e.message = error.message;
			e.file = error.filename;
			e.line = error.lineno;
			e.col = error.colno;
			if (error.error)
			{
				e.stack = error.error.stack;
				e.object = error.error;
			}

			ErrorOrganizer.__handleException(e);

			return false;
			//return true;
		});

	}

	// -------------------------------------------------------------------------

	/**
	* Get an error name for the given error object.
	*
	* @param	{Object}		error				Error object.
	*
	* @return  {String}			Error name.
	*/
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

	// -------------------------------------------------------------------------

	/**
	* Handle an exeption.
	*
	* @param	{Object}		e					Error object.
	*/
	static __handleException(e)
	{

		return ErrorOrganizer._observers.notifyAsync("error", ErrorOrganizer, {"error": e});

	}

}
