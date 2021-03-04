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
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		RouteHandlerOrganizer.addRouteHandler(component);

		return Promise.resolve();

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if event is target.
	 *
	 * @param	{String}		conditions			Event name.
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{Boolean}		True if it is target.
	 */
	static isTarget(conditions, component)
	{

		let ret = false;

		if (conditions == "*" || conditions == "afterAppend")
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
