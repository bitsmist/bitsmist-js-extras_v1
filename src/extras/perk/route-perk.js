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
	//  Properties
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

		// Upgrade component
		this.upgrade(component, "skill", "routing.addRoute", function(...args) { return RoutePerk._addRoute(...args); });
		this.upgrade(component, "skill", "routing.switch", function(...args) { return RoutePerk._switchRoute(...args); });
		this.upgrade(component, "skill", "routing.openRoute", function(...args) { return RoutePerk._open(...args); });
		this.upgrade(component, "skill", "routing.jumpRoute", function(...args) { return RoutePerk._jumpRoute(...args); });
		this.upgrade(component, "skill", "routing.updateRoute", function(...args) { return RoutePerk._updateRoute(...args); });
		this.upgrade(component, "skill", "routing.refreshRoute", function(...args) { return RoutePerk._refreshRoute(...args); });
		this.upgrade(component, "skill", "routing.replaceRoute", function(...args) { return RoutePerk._replaceRoute(...args); });
		this.upgrade(component, "skill", "routing.normalizeRoute", function(...args) { return RoutePerk._normalizeROute(...args); });
		this.upgrade(component, "vault", "routing.routes", []);
		this.upgrade(component, "stat", "routing.routeInfo", {});
		this.upgrade(component, "event", "doApplySettings", RoutePerk.RoutePerk_onDoApplySettings);
		this.upgrade(component, "event", "doStart", RoutePerk.RoutePerk_onDoStart);
		this.upgrade(component, "event", "afterReady", RoutePerk.RoutePerk_onAfterReady);
		this.upgrade(component, "event", "doValidateFail", RoutePerk.RoutePerk_onDoValidateFail);
		this.upgrade(component, "event", "doReportValidity", RoutePerk.RoutePerk_onDoReportValidity);

		// Init popstate handler
		RoutePerk.__initPopState(component);

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static RoutePerk_onDoApplySettings(sender, e, ex)
	{

		// Routings
		Object.entries(BM.Util.safeGet(e.detail, "settings.routing.routes", {})).forEach(([sectionName, sectionValue]) => {
			RoutePerk._addRoute(this, sectionName, sectionValue);
		});

		// Set current route info.
		this.set("stat", "routing.routeInfo", RoutePerk.__loadRouteInfo(this, window.location.href));

	}

	// -------------------------------------------------------------------------

	static RoutePerk_onDoStart(sender, e, ex)
	{

		let routeName = this.get("stat", "routing.routeInfo.name");
		if (routeName)
		{
			let options = {
				"query": this.get("setting", "setting.query")
			};

			return this.use("skill", "routing.switch", routeName, options);
		}
		else
		{
			console.error("route not found");
		}

	}

	// -------------------------------------------------------------------------

	static RoutePerk_onAfterReady(sender, e, ex)
	{

		return this.use("skill", "routing.openRoute");

	}

	// -------------------------------------------------------------------------

	static RoutePerk_onDoValidateFail(sender, e, ex)
	{

		// Try to fix URL when validation failed
		if (this.get("setting", "routing.options.autoFix"))
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
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Add the route.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		title				Route title.
	 * @param	{Object}		routeInfo			Route info.
	 * @param	{Boolean}		first				Add to top when true.
	 */
	static _addRoute(component, title, routeInfo, first)
	{

		let keys = [];
		let route = {
			"title":		title,
			"name":			routeInfo["name"] || title,
			"origin":		routeInfo["origin"],
			"path":			routeInfo["path"],
			"settingRef":	routeInfo["settingRef"],
			"setting":		routeInfo["setting"],
			"extenderRef":	routeInfo["extenderRef"],
			"extender":		routeInfo["extender"],
			"routeOptions":	routeInfo["routeOptions"],
			"_re": 			pathToRegexp(routeInfo["path"], keys),
			"_keys":		keys,
		};

		if (first)
		{
			component.get("vault", "routing.routes").unshift(route);
		}
		else
		{
			component.get("vault", "routing.routes").push(route);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the extender file for this page.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		routeName			Route name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadSettings(component, routeName, options)
	{

		return Promise.resolve().then(() => {
			if (RoutePerk.__hasExternalSettings(component, routeName))
			{
				return BM.AjaxUtil.loadJSON(RoutePerk.__getSettingsURL(component, routeName), Object.assign({"bindTo":this._component}, options)).then((settings) => {
					component.set("stat", "routing.routeInfo.setting", settings);
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the extender file for this page.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		routeName			Route name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadExtender(component, routeName, options)
	{

		Promise.resolve().then(() => {
			if (RoutePerk.__hasExternalExtender(component, routeName))
			{
				return BM.AjaxUtil.loadText(RoutePerk.__getExtenderURL(component, routeName)).then((extender) => {
					component.set("stat", "routing.routeInfo.extender", extender);
				});
			}
		}).then(() => {
			let extender = component.get("stat", "routing.routeInfo.extender");
			if (extender)
			{
				new Function(`"use strict";${extender}`)();
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the route speicific settings file and init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		routeName			Route name.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _switchRoute(component, routeName, options)
	{

		BM.Util.assert(routeName, "RoutePerk._switchRoute(): A route name not specified.", TypeError);

		let newSettings;
		return Promise.resolve().then(() => {
			return RoutePerk._loadSettings(component, routeName);
		}).then(() => {
			return RoutePerk._loadExtender(component);
		}).then(() => {
			newSettings = component.get("stat", "routing.routeInfo.setting");
			component.use("skill", "setting.merge", newSettings);

			return component.use("skill", "setting.apply", {"settings":newSettings});
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

		// Current route info
		let curRouteInfo = component.get("stat", "routing.routeInfo");

		let newURL;
		let newRouteInfo;
		if (routeInfo)
		{
			newURL = BM.URLUtil.buildURL(routeInfo, options);
			newRouteInfo = RoutePerk.__loadRouteInfo(component, newURL);
		}
		else
		{
			newURL = window.location.href;
			newRouteInfo = curRouteInfo;
		}

		// Jump to another page
		if (options["jump"] || !newRouteInfo["name"]
				|| ( curRouteInfo["name"] != newRouteInfo["name"]) // <--- remove this when _update() is ready.
		)
		{
			RoutePerk._jumpRoute(component, {"url":newURL});
			return;
		}

		return Promise.resolve().then(() => {
			// Replace URL
			let pushState = BM.Util.safeGet(options, "pushState", ( routeInfo ? true : false ));
			if (pushState)
			{
				history.pushState(RoutePerk.__getState("_open.pushState"), null, newURL);
			}
			component.set("stat", "routing.routeInfo", newRouteInfo);
			/*
		}).then(() => {
			// Load other component when new route name is different from the current route name.
			if (curRouteInfo["name"] != newRouteInfo["name"])
			{
				return RoutePerk._updateRoute(component, curRouteInfo, newRouteInfo, options);
			}
			*/
		}).then(() => {
			// Validate URL
			if (component.get("setting", "routing.options.autoValidate"))
			{
				let validateOptions = {
					"validatorName":	component.get("setting", "routing.options.validatorName"),
					"items":			BM.URLUtil.loadParameters(newURL),
					"url":				newURL,
				};
				return component.use("skill", "validation.validate", validateOptions);
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

		let url = BM.URLUtil.buildURL(routeInfo, options)
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

		return RoutePerk._switchRoute(component, newRouteInfo["name"]);

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

		return component.use("skill", "basic.refresh", options);

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

		history.replaceState(RoutePerk.__getState("replaceRoute", window.history.state), null, BM.URLUtil.buildURL(routeInfo, options));
		component.set("stat", "routing.routeInfo", RoutePerk.__loadRouteInfo(component, window.location.href));

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
			return component.use("skill", "event.trigger", "beforeNormalizeURL");
		}).then(() => {
			return component.use("skill", "event.trigger", "doNormalizeURL");
		}).then(() => {
			return component.use("skill", "event.trigger", "afterNormalizeURL");
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if the component has the external settings file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {Boolean}		True if the component has the external settings file.
	 */
	static __hasExternalSettings(component, routeName)
	{

		let ret = false;

		if (!component.get("stat", "routing.routeInfo.setting"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to settings file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {String}		URL.
	 */
	static __getSettingsURL(component, routeName)
	{

		let path;
		let fileName;
		let query;

		let settingRef = component.get("stat", "routing.routeInfo.settingRef");
		if (settingRef && settingRef !== true)
		{
			// If URL is specified in ref, use it
			let url = BM.Util.parseURL(settingRef);
			fileName = url.filename;
			path = url.path;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = BM.Util.concatPath([
					component.get("setting", "system.appBaseUrl", ""),
					component.get("setting", "system.componentPath", ""),
					component.get("setting", "setting.path", ""),
				]);
			let ext = component.get("setting", "routing.options.settingFormat",
					component.get("setting", "system.settingFormat",
						"json"));
			fileName = component.get("setting", "setting.fileName", component.tagName.toLowerCase()) + "." + routeName + ".settings." + ext;
  			query = component.get("setting", "setting.query");
		}

		return BM.Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the component has the external extender file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {Boolean}		True if the component has the external extender file.
	 */
	static __hasExternalExtender(component, routeName)
	{

		let ret = false;

		if (component.get("stat", "routing.routeInfo.extenderRef"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to extender file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {String}		URL.
	 */
	static __getExtenderURL(component, routeName)
	{

		let path;
		let fileName;
		let query;

		let extenderRef = component.get("stat", "routing.routeInfo.extenderRef");
		if (extenderRef && extenderRef !== true)
		{
			// If URL is specified in ref, use it
			let url = BM.Util.parseURL(extenderRef);
			path = url.path;
			fileName = url.filename;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = path || BM.Util.concatPath([
					component.get("setting", "system.appBaseUrl", ""),
					component.get("setting", "system.componentPath", ""),
					component.get("setting", "setting.path", ""),
				]);
			fileName = fileName || component.get("setting", "setting.fileName", component.tagName.toLowerCase()) + "." + routeName + ".js";
			query = component.get("setting", "setting.query");
		}

		return BM.Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

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

		let parsedURL = new URL(url, window.location.href);
		let routeInfo = {
			"url":				url,
			"path":				parsedURL.pathname,
			"query":			parsedURL.search,
			"parsedURL":		parsedURL,
			"queryParameters":	BM.URLUtil.loadParameters(url),
		};

		// Find the matching route
		let routes = component.get("vault", "routing.routes");
		for (let i = routes.length - 1; i >= 0; i--)
		{
			// Check origin
			if (routes[i]["origin"] && parsedURL.origin != routes[i]["origin"])
			{
				continue;
			}

			// Check path
			let result = (!routes[i]["path"] ? [] : routes[i]._re.exec(parsedURL.pathname));
			if (result)
			{
				let params = {};
				for (let j = 0; j < result.length - 1; j++)
				{
					params[routes[i]._keys[j].name] = result[j + 1];
				}
				routeInfo["title"] = routes[i].title;
				let routeName = RoutePerk.__interpolate(routes[i].name, params);
				routeInfo["name"] = routeName;
				let settingRef = BM.Util.safeGet(routes[i], `routeOptions.${routeName}.settingRef`, routes[i].settingRef);
				routeInfo["settingRef"] = RoutePerk.__interpolate(settingRef, params);
				let setting = BM.Util.safeGet(routes[i], `routeOptions.${routeName}.setting`, routes[i].setting);
				routeInfo["setting"] = BM.Util.getObject(setting, {"format":RoutePerk.__getSettingFormat(component)});
				let extenderRef = BM.Util.safeGet(routes[i], `routeOptions.${routeName}.extenderRef`, routes[i].extenderRef);
				routeInfo["extenderRef"] = RoutePerk.__interpolate(extenderRef, params);
				routeInfo["extender"] = BM.Util.safeGet(routes[i], `routeOptions.${routeName}.extender`, routes[i].extender);
				routeInfo["routeParameters"] = params;
				break;
			}
		}

		return routeInfo;

	}

	// -------------------------------------------------------------------------

	/**
	 * Interpolate string using parameters.
	 *
	 * @param	{String}		targtet				Target string.
	 * @param	{Object}		params				Interplolation parameters.
	 *
	 * @return  {Object}		Replaced value.
	 */
	static __interpolate(target, params)
	{

		let ret = target;

		if (params && typeof(target) === "string" && target.indexOf("${") > -1)
		{
			let re = new RegExp(`\\$\\{(${Object.keys(params).join("|")})\\}`,"gi");

			ret = target.replace(re, function(match, p1){
				return params[p1];
			});
		}

		return ret

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
				return component.use("skill", "event.trigger", "beforePopState");
			}).then(() => {
				return RoutePerk._open(component, {"url":window.location.href}, {"pushState":false});
			}).then(() => {
				return component.use("skill", "event.trigger", "afterPopState");
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
		let newParams = BM.URLUtil.loadParameters(url);

		// Fix invalid paramters
		Object.keys(component.get("stat", "validation.validationResult.invalids")).forEach((key) => {
			let item = component.get("stat", `validation.validationResult.invalids.${key}`);

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
			component.set("stat", "validation.validationResult.result", true);
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

		Object.keys(component.get("stat", "validation.validationResult.invalids")).forEach((key) => {
			let item = component.get("stat", `validation.validationResult.invalids.${key}`);

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

	// -------------------------------------------------------------------------

	/**
	 * Return default setting file format.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {String}		"js" or "json".
	 */
	static __getSettingFormat(component)
	{

		return component.get("setting", "routing.options.settingFormat",
				component.get("setting", "system.settingFormat",
					"json"));

	}

}
