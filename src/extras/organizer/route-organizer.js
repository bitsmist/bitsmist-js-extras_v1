// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import { pathToRegexp } from 'path-to-regexp';

// =============================================================================
//	Route organizer class
// =============================================================================

export default class RouteOrganizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(conditions, component, settings)
	{

		component._routes = [];
		component._specs = {};

	}

	// -------------------------------------------------------------------------

	/**
	 * Organizer.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component)
	{

		let routes = component.settings.get("routes");
		if (routes)
		{
			for(let i = 0; i < routes.length; i++)
			{
				RouteOrganizer.addRoute(component, routes[i]);
			}
		}

		let specs = component.settings.get("specs");
		if (specs)
		{
			Object.keys(specs).forEach((key) => {
				component._specs[key] = specs[key];
			});
		}

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

		if (eventName == "*" || eventName == "afterStart" || eventName == "afterSpecLoad")
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	* Add a route.
	*
	* @param	{Object}		routeInfo			Route info.
	* @param	{Boolean}		first				Add to top when true.
	*/
	static addRoute(component, routeInfo, first)
	{

		let keys = [];
		let route = {
			"origin": routeInfo["origin"],
			"name": routeInfo["name"],
			"path": routeInfo["path"],
			"keys": keys,
			"specName": routeInfo["specName"],
			"componentName": routeInfo["componentName"],
			"re": pathToRegexp(routeInfo["path"], keys)
		};

		if (first)
		{
			component._routes.unshift(route);
		}
		else
		{
			component._routes.push(route);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the spec file for this page.
	 *
	 * @param	{String}		specName			Spec name.
	 * @param	{String}		path				Path to spec.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadSpec(specName, path)
	{

//		let urlCommon = BITSMIST.v1.Util.concatPath([path, "common.js"]);
		let url = BITSMIST.v1.Util.concatPath([path, specName + ".js"]);
		let spec;
//		let specCommon;
		let specMerged;
		let promises = [];

		// Load specs
//		promises.push(RouteOrganizer.__loadSpecFile(urlCommon, "{}"));
		promises.push(RouteOrganizer.__loadSpecFile(url));

		return Promise.all(promises).then((result) => {
			// Convert to json
			try
			{
//				specCommon = JSON.parse(result[0]);
//				spec = JSON.parse(result[1]);
				spec = JSON.parse(result[0]);
			}
			catch(e)
			{
				//throw new SyntaxError(`Illegal json string. url=${(specCommon ? url : urlCommon)}`);
				throw new SyntaxError(`Illegal json string. url=${url}`);
			}
//			specMerged = BITSMIST.v1.Util.deepMerge(specCommon, spec);

			//return specMerged;

			return spec;
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Load spec file.
	 *
	 * @param	{String}		url					Spec file url.
	 * @param	{String}		defaultResponse		Response when error.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadSpecFile(url, defaultResponse)
	{

		console.debug(`LoaderMixin.__loadSpec(): Loading spec file. url=${url}`);

		return BITSMIST.v1.AjaxUtil.ajaxRequest({"url":url, "method":"GET"}).then((xhr) => {
			console.debug(`LoaderMixin.__loadSpec(): Loaded spec file. url=${url}`);

			return xhr.responseText;
		}).catch((xhr) => {
			if (defaultResponse)
			{
				return defaultResponse;
			}
		});

	}

}
