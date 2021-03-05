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

export default class RouteOrganizer extends BITSMIST.v1.Organizer
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
	 *
	 * @return 	{Promise}		Promise.
	 */
	static init(conditions, component, settings)
	{

		// Add properties
		Object.defineProperty(BITSMIST.v1.Component.prototype, 'routeInfo', { get() { return this._routeInfo; }, });
		Object.defineProperty(BITSMIST.v1.Component.prototype, 'specs', { get() { return this._specs; }, });

		// Add methods
		component.loadParameters = function() { return RouteOrganizer._loadParameters(); }
		component.openRoute = function(routeInfo, options) { return RouteOrganizer._openRoute(this, routeInfo, options); }
		component.replaceRoute = function(routeInfo, options) { return RouteOrganizer._replaceRoute(this, routeInfo, options); }
		component.jumpRoute = function(routeInfo, options) { return RouteOrganizer._jumpRoute(this, routeInfo, options); }
		component.refreshRoute = function(routeInfo, options) { return RouteOrganizer._refreshRoute(this, routeInfo, options); }
		component.updateRoute = function(routeInfo, options) { return RouteOrganizer._updateRoute(this, routeInfo, options); }

		// Init vars
		component._routes = [];
		component._specs = {};

		// Set state on the first page
		history.replaceState(RouteOrganizer.__getDefaultState("connect"), null, null);

		// Init popstate handler
		RouteOrganizer.__initPopState(component);

		// Get settings from attributes
		let path = component.getAttribute("data-specpath") || "";
		if (path)
		{
			component.settings.set("system.specPath", path);
		}

	}

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

		// Load route info
		let routes = component.settings.get("routes");
		if (routes)
		{
			for(let i = 0; i < routes.length; i++)
			{
				RouteOrganizer._addRoute(component, routes[i]);
			}

			component._routeInfo = RouteOrganizer.__loadRouteInfo(component, window.location.href);
		}

		// Load spec info
		let specs = component.settings.get("specs");
		if (specs)
		{
			Object.keys(specs).forEach((key) => {
				component._specs[key] = specs[key];
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	* Add a route.
	*
	* @param	{Object}		routeInfo			Route info.
	* @param	{Boolean}		first				Add to top when true.
	*/
	static _addRoute(component, routeInfo, first)
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
	static _loadSpec(specName, path)
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

	/**
	* Build url from route info.
	*
	* @param	{Object}		routeInfo			Route information.
	* @param	{Object}		options				Query options.
	*
	* @return  {string}		Url.
	*/
	static _buildUrl(routeInfo, component)
	{

		let url;

		if (routeInfo["url"])
		{
			url = routeInfo["url"];
		}
		else
		{
			url  = ( routeInfo["path"] ? routeInfo["path"] : component._routeInfo["path"] );
			url += ( routeInfo["query"] ? "?" + routeInfo["query"] : "" );
			url += ( routeInfo["queryParameters"] ? RouteOrganizer._buildUrlQuery(routeInfo["queryParameters"]) : "" );
		}

		return url;

	}

	// -----------------------------------------------------------------------------

	/**
	* Build query string from the options object.
	*
	* @param	{Object}		options				Query options.
	*
	* @return	{String}		Query string.
	*/
	static _buildUrlQuery(options)
	{

		let query = "";

		if (options)
		{
			query = Object.keys(options).reduce((result, current) => {
				if (Array.isArray(options[current]))
				{
					result += encodeURIComponent(current) + "=" + encodeURIComponent(options[current].join()) + "&";
				}
				else if (options[current])
				{
					result += encodeURIComponent(current) + "=" + encodeURIComponent(options[current]) + "&";
				}

				return result;
			}, "");
		}

		return ( query ? "?" + query.slice(0, -1) : "");

	}

	// -----------------------------------------------------------------------------

	/**
	 * Create options array from the current url.
	 *
	 * @return  {Array}			Options array.
	 */
	static _loadParameters()
	{

		let vars = {}
		let hash;
		let value;

		if (window.location.href.indexOf("?") > -1)
		{
			let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

			for(let i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				if (hash[1]){
					value = hash[1].split('#')[0];
				} else {
					value = hash[1];
				}
				vars[hash[0]] = decodeURIComponent(value);
			}
		}

		return vars;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Open route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 */
	static _openRoute(component, routeInfo, options)
	{

		RouteOrganizer.__open(component, routeInfo, options);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Jump to route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 */
	static _jumpRoute(component, routeInfo, options)
	{

		let url = RouteOrganizer._buildUrl(routeInfo, component);
		RouteOrganizer.__jump(component, url);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Refresh route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 */
	static _refreshRoute(component, routeInfo, options)
	{

		return RouteOrganizer.__refresh(component, routeInfo, options);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Update route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 */
	static _updateRoute(component, routeInfo, options)
	{

		return RouteOrganizer.__update(component, routeInfo, options);

	}

	// -----------------------------------------------------------------------------

	/**
	 * Replace current url.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 */
	static _replaceRoute(component, routeInfo)
	{

		history.replaceState(RouteOrganizer.__getDefaultState("replaceRoute"), null, RouteOrganizer._buildUrl(routeInfo, component));
		component._routeInfo = RouteOrganizer.__loadRouteInfo(component, window.location.href);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Open route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 */
	static __open(component, routeInfo, options)
	{

		options = Object.assign({}, options);
		options["pushState"] = ( options["pushState"] !== undefined ? options["pushState"] : true );
		let url = RouteOrganizer._buildUrl(routeInfo, component);
		let curRouteInfo = Object.assign({}, component._routeInfo);
		let newRouteInfo = RouteOrganizer.__loadRouteInfo(component, url);
		component._routeInfo = RouteOrganizer.__loadRouteInfo(component, url);

		if (options["jump"] || !newRouteInfo["name"] || ( curRouteInfo["name"] != newRouteInfo["name"]) )
		{
			RouteOrganizer._jump(component, url);
			return;
		}

		Promise.resolve().then(() => {
			if (options["pushState"])
			{
				history.pushState(RouteOrganizer.__getDefaultState("_open.pushState"), null, url);
			}
		}).then(() => {
			if ( curRouteInfo["specName"] != newRouteInfo["specName"] )
			{
				// Load another component and open
				return RouteOrganizer.__update(component, newRouteInfo, options);
			}
			else
			{
				// Refresh current component
				return RouteOrganizer.__refresh(component, routeInfo, options);
			}
		}).then(() => {
			if (routeInfo["dispUrl"])
			{
				// Replace url
				history.replaceState(RouteOrganizer.__getDefaultState("_open.dispUrl"), null, routeInfo["dispUrl"]);
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	* Jump to url.
	*
	* @param	{String}		url					Url.
	*/
	static __jump(url)
	{

		window.location.href = url;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Refresh route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 */
	static __refresh(component, routeInfo, options)
	{

		let componentName = component._routeInfo["componentName"];
		if (component._components[componentName])
		{
			return component._components[componentName].refresh({"sender":component, "pushState":false});
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Update route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Query options.
	 */
	static __update(component, routeInfo, options)
	{

		return Promise.resolve().then(() => {
			return component.clearOrganizers();
		}).then(() => {
			return RouteOrganizer.__initSpec(component, routeInfo["specName"]);
		});

	}

	// -----------------------------------------------------------------------------

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

		console.debug(`RouteOrganizer.__loadSpec(): Loading spec file. url=${url}`);

		return BITSMIST.v1.AjaxUtil.ajaxRequest({"url":url, "method":"GET"}).then((xhr) => {
			console.debug(`RouteOrganizer.__loadSpec(): Loaded spec file. url=${url}`);

			return xhr.responseText;
		}).catch((xhr) => {
			if (defaultResponse)
			{
				return defaultResponse;
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Get route info from the url.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		url					Url.
	 *
	 * @return  {Object}		Route info.
	 */
	static __loadRouteInfo(component, url)
	{

		let routeInfo = {};
		let routeName;
		let parsedUrl = new URL(url, window.location.href);
		let specName;
		let componentName;
		let params = {};

		for (let i = component._routes.length - 1; i >= 0; i--)
		{
			// Check origin
			if ( !component._routes[i]["origin"] || (component._routes[i]["origin"] && parsedUrl.origin == component._routes[i]["origin"]))
			{
				// Check path
				let result = ( !component._routes[i]["path"] ? [] : component._routes[i].re.exec(parsedUrl.pathname));
				if (result)
				{
					routeName = component._routes[i].name;
					specName = ( component._routes[i].specName ? component._routes[i].specName : "" );
					componentName = component._routes[i].componentName;
					for (let j = 0; j < result.length - 1; j++)
					{
						params[component._routes[i].keys[j].name] = result[j + 1];
						let keyName = component._routes[i].keys[j].name;
						let value = result[j + 1];
						specName = specName.replace("{{:" + keyName + "}}", value);
					}

					break;
				}
			}
		}

		routeInfo["name"] = routeName;
		routeInfo["specName"] = specName;
		routeInfo["componentName"] = componentName;
		routeInfo["url"] = parsedUrl["href"];
		routeInfo["path"] = parsedUrl.pathname;
		routeInfo["query"] = parsedUrl.search;
		routeInfo["parsedUrl"] = parsedUrl;
		routeInfo["routeParameters"] = params;
		routeInfo["queryParameters"] = RouteOrganizer._loadParameters();

		return routeInfo;

	}

	// -----------------------------------------------------------------------------

	/**
	 * Init pop state handling.
	 *
	 * @param	{Component}		component			Component.
	 */
	static __initPopState(component)
	{

		if (window.history && window.history.pushState){
			window.addEventListener("popstate", (e) => {

				if (!e.state)
				{
					return;
				}

				let promise;
				let componentName = component._routeInfo["componentName"];
				if (component._components && component._components[componentName])
				{
					promise = component._components[componentName].trigger("beforePopState", component);
				}

				Promise.all([promise]).then(() => {
					RouteOrganizer.openRoute(component, RouteOrganizer.__loadRouteInfo(component, window.location.href), {"pushState":false});
				}).then(() => {
					let componentName = component._routeInfo["componentName"];
					if (component._components && component._components[componentName])
					{
						component._components[componentName].trigger("afterPopState", component);
					}
				});
			});
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Load a spec and init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		specName			Spec name.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __initSpec(component, specName)
	{

		if (specName && !component._specs[specName])
		{
			return Promise.resolve().then(() => {
				if (!component._specs[specName])
				{
					return RouteOrganizer._loadSpec(specName, component.settings.get("system.specPath")).then((spec) => {;
						component._specs[specName] = spec;
					});
				}
			}).then(() => {
				return component.callOrganizers("afterSpecLoad", component._specs[specName]);
			}).then(() => {
				return component.trigger("afterSpecLoad", component, {"spec":component._specs[component._routeInfo["specName"]]});
			});
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Return history state.
	 *
	 * @param	{String}		msg					Message to store in state..
	 *
	 * @return	{String}		State.
	 */
	static __getDefaultState(msg)
	{

		return msg +  ":" + window.location.href;

	}

}
