// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Ajax error handler class
// =============================================================================

//export default class AjaxErrorHandler extends BITSMIST.v1.Plugin
export default class AjaxErrorHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component which the plugin
	 * 												is attached to.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(component, options)
	{

		//super(component, options);

		this._component = component;
		this._options = options;
		this._events = {
			"error": {
				"handler": this.onError
			}
		}

//		this.target.push("AjaxError");

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * Error event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
	 */
	onError(sender, e)
	{

		return this.handle(e.detail.error);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
     * Handle an exception.
     *
	 * @param	{object}		e					Exception.
     */
	handle(e)
	{

		if (e.name != "AjaxError") return;

		let statusCode = e.object.status;

		Object.keys(this._options["handlers"]["statusCode"]).forEach((code) => {
			if (statusCode == code)
			{
				Object.keys(this._options["handlers"]["statusCode"][code]).forEach((command) => {
					let options = this._options["handlers"]["statusCode"][code][command];
					switch (command)
					{
						case "route":
							if (!("appName" in options))
							{
								options["appName"] = "";
							}
							let routeInfo = options["routeInfo"];
							Object.keys(routeInfo["queryParameters"]).forEach((key) => {
								routeInfo["queryParameters"][key] = routeInfo["queryParameters"][key].replace("@url@", location.href);
							});
							this._component.router.openRoute(routeInfo, {"jump":true});
							break;
						// case "transfer":
						// 	let urlToTransfer = this._options["handlers"]["statusCode"][code][command];
						// 	urlToTransfer = urlToTransfer.replace("@url@", location.href);
						// 	location.href = urlToTransfer;
						// 	break;
						// case "custom":
						// 	break;
					}
				});
			}
		});

	}

}
