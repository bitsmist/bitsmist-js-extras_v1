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
import { pathToRegexp } from "path-to-regexp";

// =============================================================================
//	Route Perk class
// =============================================================================

export default class RoutePerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Create options array from the current url.
	 *
	 * @return  {Array}			Options array.
	 */
	static _loadParameters(component, url)
	{

		url = url || window.location.href;
		let vars = {}
		let hash;
		let value;

		if (window.location.href.indexOf("?") > -1)
		{
			let hashes = url.slice(url.indexOf('?') + 1).split('&');

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

	// -------------------------------------------------------------------------

	/**
	 * Load the spec file and init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		specName			Spec name.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _switchSpec(component, specName, options)
	{

		BM.Util.assert(specName, "RoutePerk._switchSpec(): A spec name not specified.", TypeError);

		let newSpec;
		return Promise.resolve().then(() => {
			if (!component.inventory.get(`routings.specs.${specName}`))
			{
				return RoutePerk._loadSpec(component, specName, options);
			}
		}).then((spec) => {
			newSpec = spec;
			component.inventory.get("routing.spec").items = newSpec;
		}).then(() => {
			if (component.settings.get("setting.hasExtender"))
			{
				return RoutePerk._loadExtender(component, specName, options);
			}
		}).then(() => {
			return component.skills.use("perk.attachPerks", {"settings":newSpec});
		}).then(() => {
			return component.skills.use("event.trigger", "doOrganize", {"settings":newSpec});
		}).then(() => {
			return component.skills.use("event.trigger", "afterLoadSettings", {"settings":newSpec});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Open route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _open(component, routeInfo, options)
	{

		options = Object.assign({}, options);
		let pushState = BM.Util.safeGet(options, "pushState", ( routeInfo ? true : false ));

		// Current route info
		let curRouteInfo = component.inventory.get("routing.routeInfo");

		let newUrl;
		let newRouteInfo;
		if (routeInfo)
		{
			newUrl = RoutePerk._buildUrl(component, routeInfo, options);
			newRouteInfo = RoutePerk.__loadRouteInfo(component, newUrl);
		}
		else
		{
			newUrl = window.location.href;
			newRouteInfo = curRouteInfo;
		}

		// Jump to another page
		if (options["jump"] || !newRouteInfo["name"]
				|| ( curRouteInfo["specName"] != newRouteInfo["specName"]) // <--- remove this when _update() is ready.
		)
		{
			RoutePerk._jumpRoute(component, {"url":newUrl});
			return;
		}

		return Promise.resolve().then(() => {
			// Replace URL
			if (pushState)
			{
				history.pushState(RoutePerk.__getState("_open.pushState"), null, newUrl);
			}
			component.inventory.set("routing.routeInfo", newRouteInfo);
		}).then(() => {
			// Load other component when new spec is different from the current spec
			if (curRouteInfo["specName"] != newRouteInfo["specName"])
			{
				return RoutePerk._updateRoute(component, curRouteInfo, newRouteInfo, options);
			}
		}).then(() => {
			// Validate URL
			if (component.settings.get("routing.options.autoValidate"))
			{
				let validateOptions = {
					"validatorName":	component.settings.get("routing.options.validatorName"),
					"items":			RoutePerk._loadParameters(component, newUrl),
					"url":				newUrl,
				};
				return component.skills.use("validation.validate", validateOptions);
			}
		}).then(() => {
			// Refresh
			return RoutePerk._refreshRoute(component, newRouteInfo, options);
		}).then(() => {
			// Normalize URL
			return RoutePerk._normalizeRoute(component, window.location.href);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Jump to url.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 */
	static _jumpRoute(component, routeInfo, options)
	{

		let url = RoutePerk._buildUrl(component, routeInfo, options);
		window.location.href = url;

	}

	// -------------------------------------------------------------------------

	/**
	 * Update route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _updateRoute(component, curRouteInfo, newRouteInfo, options)
	{

		return RoutePerk._switchSpec(component, newRouteInfo["specName"]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _refreshRoute(component, routeInfo, options)
	{

		return component.skills.use("basic.refresh", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Replace current url.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 */
	static _replaceRoute(component, routeInfo, options)
	{

		history.replaceState(RoutePerk.__getState("replaceRoute", window.history.state), null, RoutePerk._buildUrl(component, routeInfo, options));
		component.inventory.set("routing.routeInfo", RoutePerk.__loadRouteInfo(component, window.location.href));

	}

	// -------------------------------------------------------------------------

	/**
	 * Normalize route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		url					Url to normalize.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _normalizeRoute(component, url)
	{

		return Promise.resolve().then(() => {
			return component.skills.use("event.trigger", "beforeNormalizeURL");
		}).then(() => {
			return component.skills.use("event.trigger", "doNormalizeURL");
		}).then(() => {
			return component.skills.use("event.trigger", "afterNormalizeURL");
		});

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static RoutePerk_onDoOrganize(sender, e, ex)
	{

		// Routings
		Object.entries(BM.Util.safeGet(e.detail, "settings.routing.routes", {})).forEach(([sectionName, sectionValue]) => {
			RoutePerk._addRoute(this, sectionValue);
		});

		// Set current route info.
		this.inventory.set("routing.routeInfo", RoutePerk.__loadRouteInfo(this, window.location.href));

		// Specs
		Object.entries(BM.Util.safeGet(e.detail, "settings.routing.specs", {})).forEach(([sectionName, sectionValue]) => {
			this._specs[sectionName] = sectionValue;
			this.inventory.get(`routing.specs.${sectionName}`, sectionValue);
		});

	}

	// -------------------------------------------------------------------------

	static RoutePerk_onDoStart(sender, e, ex)
	{

		let specName = this.inventory.get("routing.routeInfo.specName");
		if (specName)
		{
			let options = {
				"query": this.settings.get("setting.query")
			};

			return this.skills.use("routing.switchSpec", specName, options);
		}

	};

	// -------------------------------------------------------------------------

	static RoutePerk_onAfterReady(sender, e, ex)
	{

		//return this.openRoute();
		return this.skills.use("routing.openRoute");

	}

	// -------------------------------------------------------------------------

	static RoutePerk_onDoValidateFail(sender, e, ex)
	{

		// Try to fix URL when validation failed
		if (this.settings.get("routing.options.autoFix"))
		{
			RoutePerk.__fixRoute(this, e.detail.url);
		}

	}

	// -------------------------------------------------------------------------

	static RoutePerk_onDoReportValidity(sender, e, ex)
	{

		// Dump errors when validation failed
		RoutePerk.__dumpValidationErrors(this);
		throw new URIError("URL validation failed.");

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"routing",
			"order":		900,
			"depends":		"ValidationPerk",
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Set state on the first page
		history.replaceState(RoutePerk.__getState("connect"), null, null);

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add skills to component;
		component.skills.set("routing.loadParameters", function(...args) { return RoutePerk._loadParameters(...args); });
		component.skills.set("routing.switchSpec", function(...args) { return RoutePerk._switchSpec(...args); });
		component.skills.set("routing.openRoute", function(...args) { return RoutePerk._open(...args); });
		component.skills.set("routing.jumpRoute", function(...args) { return RoutePerk._jumpRoute(...args); });
		component.skills.set("routing.updateRoute", function(...args) { return RoutePerk._updateRoute(...args); });
		component.skills.set("routing.refreshRoute", function(...args) { return RoutePerk._refreshRoute(...args); });
		component.skills.set("routing.replaceRoute", function(...args) { return RoutePerk._replaceRoute(...args); });
		component.skills.set("routing.normalizeRoute", function(...args) { return RoutePerk._normalizeROute(...args); });

		// Add inventory items to component
		component.inventory.set("routing.routeInfo", {});
		component.inventory.set("routing.specs", {});
		component.inventory.set("routing.spec", new BM.ChainableStore({"chain":component.settings, "writeThrough":true}));
		Object.defineProperty(component, "settings", { get() { return this.inventory.get("routing.spec"); }, }); // Tweak to see settings through spec

		// Add vault items to component
		component.vault.set("routing.routes", []);

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", RoutePerk.RoutePerk_onDoOrganize);
		this._addPerkHandler(component, "doStart", RoutePerk.RoutePerk_onDoStart);
		this._addPerkHandler(component, "afterReady", RoutePerk.RoutePerk_onAfterReady);
		this._addPerkHandler(component, "doValidateFail", RoutePerk.RoutePerk_onDoValidateFail);
		this._addPerkHandler(component, "doReportValidity", RoutePerk.RoutePerk_onDoReportValidity);

		// Load settings from attributes
		RoutePerk._loadAttrSettings(component);

		// Init popstate handler
		RoutePerk.__initPopState(component);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Add the route.
	 *
	 * @param	{Component}		component			Component.
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
			component.vault.get("routing.routes").unshift(route);
		}
		else
		{
			component.vault.get("routing.routes").push(route);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Build url from route info.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		Url.
	 */
	static _buildUrl(component, routeInfo, options)
	{

		let url = "";

		url += ( routeInfo["url"] ? routeInfo["url"] : "" );
		url += ( routeInfo["path"] ? routeInfo["path"] : "" );
		url += ( routeInfo["query"] ? `?{routeInfo["query"]}` : "" );

		if (routeInfo["queryParameters"])
		{
			let params = {};
			if (options && options["mergeParameters"])
			{
				params = Object.assign(params, component.inventory.get("routing.routeInfo.queryParameters"));
			}
			params = Object.assign(params, routeInfo["queryParameters"]);
			url += RoutePerk._buildUrlQuery(params);
		}

		return ( url ? url : "/" );

	}

	// -------------------------------------------------------------------------

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
					result += `${encodeURIComponent(current)}=${encodeURIComponent(options[current].join())}&`;
				}
				else if (options[current])
				{
					result += `${encodeURIComponent(current)}=${encodeURIComponent(options[current])}&`;
				}

				return result;
			}, "");
		}

		return ( query ? `?${query.slice(0, -1)}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static _loadAttrSettings(component)
	{

		// Get spec path from  bm-specpath
		let path = component.getAttribute("bm-specpath");
		if (path)
		{
			component.settings.set("system.specPath", path);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the spec file for this page.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		specName			Spec name.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadSpec(component, specName, loadOptions)
	{

		let spec;
//		let specCommon;
		let promises = [];

		console.debug(`RoutePerk._loadSpec(): Loading spec file. name=${component.tagName}, specName=${specName}`);

		// Path
		let path = BM.Util.safeGet(loadOptions, "path",
			BM.Util.concatPath([
				component.settings.get("system.appBaseUrl", ""),
				component.settings.get("system.specPath", "")
			])
		);

		// Load specs
		let options = BM.Util.deepMerge({"type": "js", "bindTo": this}, loadOptions);
		promises.push(BM.SettingPerk.__loadFile(specName, path, options));

		return Promise.all(promises).then((result) => {
			spec = result[0];
//			specCommon = result[0];
//			spec = BM.Util.deepMerge(specCommon, result[1]);
			component.inventory.set(`routing.specs.${specName}`, spec);

			return spec;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the extender file for this page.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		specName			Spec name.
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadExtender(component, extenderName, loadOptions)
	{

		console.debug(`RoutePerk._loadExtender(): Loading extender file. name=${component.tagName}, extenderName=${extenderName}`);

		let query = BM.Util.safeGet(loadOptions, "query");
		let path = BM.Util.safeGet(loadOptions, "path",
			BM.Util.concatPath([
				component.settings.get("system.appBaseUrl", ""),
				component.settings.get("system.specPath", "")
			])
		);
		let url = `${path}${extenderName}.extender.js` + (query ? `?${query}` : "");

		return BM.AjaxUtil.loadScript(url);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

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
		let params = {};
		let routes = component.vault.get("routing.routes");

		// Find the matching route
		for (let i = routes.length - 1; i >= 0; i--)
		{
			// Check origin
			if (routes[i]["origin"] && parsedUrl.origin != routes[i]["origin"])
			{
				continue;
			}

			// Check path
			let result = ( !routes[i]["path"] ? [] : routes[i].re.exec(parsedUrl.pathname) );
			if (result)
			{
				routeName = routes[i].name;
				specName = ( routes[i].specName ? routes[i].specName : "" );
				for (let j = 0; j < result.length - 1; j++)
				{
					params[routes[i].keys[j].name] = result[j + 1];
					let keyName = routes[i].keys[j].name;
					let value = result[j + 1];
					specName = specName.replace(`{{:${keyName}}}`, value);
				}

				break;
			}
		}

		routeInfo["name"] = routeName;
		routeInfo["specName"] = specName;
		routeInfo["url"] = parsedUrl["href"];
		routeInfo["path"] = parsedUrl.pathname;
		routeInfo["query"] = parsedUrl.search;
		routeInfo["parsedUrl"] = parsedUrl;
		routeInfo["routeParameters"] = params;
		routeInfo["queryParameters"] = RoutePerk._loadParameters(component, url);

		return routeInfo;

	}

	// -------------------------------------------------------------------------

	/**
	 * Init pop state handling.
	 *
	 * @param	{Component}		component			Component.
	 */
	static __initPopState(component)
	{

		window.addEventListener("popstate", (e) => {
			return Promise.resolve().then(() => {
				return component.skills.use("event.trigger", "beforePopState");
			}).then(() => {
				return RoutePerk._open(component, {"url":window.location.href}, {"pushState":false});
			}).then(() => {
				return component.skills.use("event.trigger", "afterPopState");
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Return history state.
	 *
	 * @param	{String}		msg					Message to store in state.
	 * @param	{Object}		options				Optional values to store in state.
	 *
	 * @return	{String}		State.
	 */
	static __getState(msg, options)
	{

		let newState = {
			"msg": msg,
		};

		if (options)
		{
			newState = BM.Util.deepMerge(BM.Util.deepClone(options), newState);
		}

		return newState;

	}

	// -------------------------------------------------------------------------

	/**
	 * Fix route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		url					Url to validate.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __fixRoute(component, url)
	{

		let isOk = true;
		let newParams = RoutePerk._loadParameters(component, url);

		// Fix invalid paramters
		Object.keys(component.stats.get("validation.validationResult.invalids")).forEach((key) => {
			let item = component.stats.get(`validation.validationResult.invalids.${key}`);

			if (item["fix"] !== undefined)
			{
				newParams[item["key"]] = item["fix"];
			}
			else if (item["failed"][0]["validity"] === "notAllowed")
			{
				delete newParams[item["key"]];
			}
			else
			{
				isOk = false;
			}
		});

		if (isOk)
		{
			// Replace URL
			RoutePerk._replaceRoute(component, {"queryParameters":newParams});

			// Fixed
			component.stats.set("validation.validationResult.result", true);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Dump validation errors.
	 *
	 * @param	{Component}		component			Component.
	 */
	static __dumpValidationErrors(component)
	{

		Object.keys(component.stats.get("validation.validationResult.invalids")).forEach((key) => {
			let item = component.stats.get(`validation.validationResult.invalids.${key}`);

			if (item.failed)
			{
				for (let i = 0; i < item.failed.length; i++)
				{
					console.warn("RoutePerk.__dumpValidationErrors(): URL validation failed.",
						`key=${item.key}, value=${item.value}, rule=${item.failed[i].rule}, validity=${item.failed[i].validity}`);
				}
			}
		});

	}

}
