// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Plugin from '../plugin';

// =============================================================================
//	Ajax error handler class
// =============================================================================

export default class AjaxErrorHandler extends Plugin
{

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * AFter error event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	onAfterError(sender, e, ex)
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
							document.querySelector("bm-router").openRoute(routeInfo, {"jump":true});
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

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Get plugin options.
	 *
	 * @return  {Object}		Options.
	 */
	_getOptions()
	{

		return {
			"events": {
				"afterError": {
					"handler": this.onAfterError
				}
			}
		};

	}

}
