// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import RouteOrganizer from '../organizer/route-organizer';

// =============================================================================
//	Router class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function Router()
{

	// super()
	return Reflect.construct(BITSMIST.v1.Component, [], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(Router, BITSMIST.v1.Component);
customElements.define("bm-router", Router);

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start component.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
Router.prototype.start = function(settings)
{

	// Defaults
	let defaults = {
		"name": "Router",
		"autoSetup": false,
		"organizers": {
			"RouteOrganizer": "",
		}
	};
	settings = BITSMIST.v1.Util.deepMerge(defaults, settings);

	// Start
	return BITSMIST.v1.Component.prototype.start.call(this, settings).then(() => {
		this.changeState("routing");

		// Set state on the first page
		history.replaceState(RouteOrganizer.__getDefaultState("connect"), null, null);

		// Init popstate handler
		RouteOrganizer.__initPopState(this);

		// Get settings from attributes
		let path = this.getAttribute("data-specpath") || "";
		if (path)
		{
			this._settings.set("system.specPath", path);
		}

		// Load spec file
		return RouteOrganizer.__initSpec(this, this._routeInfo["specName"]).then(() => {
			this.changeState("routed");
		});
	});

}
