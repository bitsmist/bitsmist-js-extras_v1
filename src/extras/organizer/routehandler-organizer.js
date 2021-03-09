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

export default class RouteHandlerOrganizer extends BITSMIST.v1.Organizer
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

		return Promise.resolve(settings);

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
