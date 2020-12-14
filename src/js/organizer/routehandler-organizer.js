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
//	Route handler organizer class
// =============================================================================

export default class RouteHandlerOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Organizer.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(component, settings)
	{

		RouteHandlerOrganizer.addRouteHandler(component);

		return Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		eventName			Event name.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(eventName)
	{

		let ret = false;

		if (eventName == "afterAppend")
		{
			ret = true;
		}

		return ret;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Add route handler.
	 *
	 * @param	{Component}		component			Component.
	 */
	static addRouteHandler(component)
	{

		component.querySelectorAll("[data-routepath]").forEach((element) => {
			component.addEventHandler(element, "click", (sender, e, ex) => {
				let routeInfo = {
					"path": element.getAttribute("data-routepath"),
				};

				document.querySelector("bm-router").openRoute(routeInfo);
			});
		});

	}

}
