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
//import PreferenceOrganizer from "../organizer/preference-organizer.js";

// =============================================================================
//	Error manager class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function ErrorManager(settings)
{

	return Reflect.construct(BM.Component, [settings], this.constructor);

}

BM.ClassUtil.inherit(ErrorManager, BM.Component);

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Preference items.
 *
 * @type	{Object}
 */
/*
Object.defineProperty(PreferenceManager.prototype, "items", {
	get()
	{
		return PreferenceOrganizer._store.items;
	},
})
*/

// -------------------------------------------------------------------------
//  Protected
// -------------------------------------------------------------------------

/**
 * Get component options.  Need to override.
 *
 * @return  {Object}		Options.
 */
ErrorManager.prototype._getSettings = function()
{

	return {
		// Settings
		"settings": {
			"name":						"ErrorManager",
		},

		// Events
		"events": {
			"this": {
				"handlers": {
					"error": 			this.onError
				}
			}
		},

		// Errors
		"errors": {
			"targets": 					["*"]
		},
	}

}

// -------------------------------------------------------------------------

/**
 * Handle an exception.
 *
 */
ErrorManager.prototype.onError = function(sender, e, ex)
{

//	try
	{
		console.log("@@@error", e.detail.error.message);

		if (document.querySelector("#msg"))
		{
			document.querySelector("#msg").innerText = e.detail.error.message;
		}
	}
//	catch()
	{
	}
	/*
	let statusCode = e.object.status;
	let handlers = this._settings.get("handlers");
	Object.keys(handlers["statusCode"]).forEach((code) => {
		if (statusCode === code)
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
					document.querySelector("bm-router").openRoute(routeInfo, {"jump":true});
					break;
				}
			});
		}
	});
	*/

}

// -------------------------------------------------------------------------

customElements.define("bm-error", ErrorManager);
