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

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "skill", "routing.addRoute", function(...args) { return RoutePerk._addRoute(...args); });
		this.upgrade(unit, "skill", "routing.jumpRoute", function(...args) { return RoutePerk._jumpRoute(...args); });
		this.upgrade(unit, "skill", "routing.refreshRoute", function(...args) { return RoutePerk._refreshRoute(...args); });
		this.upgrade(unit, "skill", "routing.replaceRoute", function(...args) { return RoutePerk._replaceRoute(...args); });
		this.upgrade(unit, "spell", "routing.switch", function(...args) { return RoutePerk._switchRoute(...args); });
		this.upgrade(unit, "spell", "routing.openRoute", function(...args) { return RoutePerk._open(...args); });
		this.upgrade(unit, "spell", "routing.updateRoute", function(...args) { return RoutePerk._updateRoute(...args); });
		this.upgrade(unit, "spell", "routing.refreshRoute", function(...args) { return RoutePerk._refreshRoute(...args); });
		this.upgrade(unit, "spell", "routing.normalizeRoute", function(...args) { return RoutePerk._normalizeROute(...args); });
		this.upgrade(unit, "vault", "routing.routes", []);
		this.upgrade(unit, "state", "routing.routeInfo", {});
		this.upgrade(unit, "event", "doApplySettings", RoutePerk.RoutePerk_onDoApplySettings);
		this.upgrade(unit, "event", "doStart", RoutePerk.RoutePerk_onDoStart);
		this.upgrade(unit, "event", "afterReady", RoutePerk.RoutePerk_onAfterReady);
		this.upgrade(unit, "event", "doValidateFail", RoutePerk.RoutePerk_onDoValidateFail);
		this.upgrade(unit, "event", "doReportValidity", RoutePerk.RoutePerk_onDoReportValidity);

		// Init popstate handler
		RoutePerk.__initPopState(unit);

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
		this.set("state", "routing.routeInfo", RoutePerk.__loadRouteInfo(this, window.location.href));

	}

	// -------------------------------------------------------------------------

	static RoutePerk_onDoStart(sender, e, ex)
	{

		let routeName = this.get("state", "routing.routeInfo.name");
		if (routeName)
		{
			let options = {
				"query": this.get("setting", "unit.options.query")
			};

			return this.use("spell", "routing.switch", routeName, options);
		}
		else
		{
			throw new Error("route not found");
		}

	}

	// -------------------------------------------------------------------------

	static RoutePerk_onAfterReady(sender, e, ex)
	{

		return this.use("spell", "routing.openRoute");

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
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		title				Route title.
	 * @param	{Object}		routeInfo			Route info.
	 * @param	{Boolean}		first				Add to top when true.
	 */
	static _addRoute(unit, title, routeInfo, first)
	{

		let keys = [];
		let route = {
			"title":		title,
			"name":			routeInfo["name"] || title,
			"origin":		routeInfo["origin"],
			"path":			routeInfo["path"],
			"settingsRef":	routeInfo["settingsRef"],
			"settings":		routeInfo["settings"],
			"extenderRef":	routeInfo["extenderRef"],
			"extender":		routeInfo["extender"],
			"routeOptions":	routeInfo["routeOptions"],
			"_re": 			pathToRegexp(routeInfo["path"], keys),
			"_keys":		keys,
		};

		let routes = unit.get("vault", "routing.routes");
		if (first)
		{
			routes.unshift(route);
		}
		else
		{
			routes.push(route);
		}
		unit.set("vault", "routing.routes", routes);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the extender file for this page.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadSettings(unit, routeName, options)
	{

		return BM.AjaxUtil.loadJSON(RoutePerk.__getSettingsURL(unit, routeName), Object.assign({"bindTo":this._unit}, options)).then((settings) => {
			unit.set("state", "routing.routeInfo.settings", settings);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the extender file for this page.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _loadExtender(unit, routeName, options)
	{

		return Promise.resolve().then(() => {
			if (!unit.get("state", "routing.routeInfo.extender"))
			{
				return BM.AjaxUtil.loadText(RoutePerk.__getExtenderURL(unit, routeName)).then((extender) => {
					unit.set("state", "routing.routeInfo.extender", extender);
				});
			}
		}).then(() => {
			let extender = unit.get("state", "routing.routeInfo.extender");
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _switchRoute(unit, routeName, options)
	{

		BM.Util.assert(routeName, "RoutePerk._switchRoute(): A route name not specified.", TypeError);

		let newSettings;
		return Promise.resolve().then(() => {
			if (RoutePerk.__hasExternalSettings(unit, routeName))
			{
				return RoutePerk._loadSettings(unit, routeName);
			}
		}).then(() => {
			if (RoutePerk.__hasExternalExtender(unit, routeName))
			{
				return RoutePerk._loadExtender(unit);
			}
		}).then(() => {
			newSettings = unit.get("state", "routing.routeInfo.settings");
			unit.use("skill", "setting.merge", newSettings);

			return unit.use("spell", "setting.apply", {"settings":newSettings});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Open route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _open(unit, routeInfo, options)
	{

		options = Object.assign({}, options);

		// Current route info
		let curRouteInfo = unit.get("state", "routing.routeInfo");

		let newURL;
		let newRouteInfo;
		if (routeInfo)
		{
			newURL = BM.URLUtil.buildURL(routeInfo, options);
			newRouteInfo = RoutePerk.__loadRouteInfo(unit, newURL);
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
			window.location.href = newURL;
			//RoutePerk._jumpRoute(unit, {"URL":newURL});
			return;
		}

		return Promise.resolve().then(() => {
			// Replace URL
			let pushState = BM.Util.safeGet(options, "pushState", ( routeInfo ? true : false ));
			if (pushState)
			{
				history.pushState(RoutePerk.__getState("_open.pushState"), null, newURL);
			}
			unit.set("state", "routing.routeInfo", newRouteInfo);
			/*
		}).then(() => {
			// Load other unit when new route name is different from the current route name.
			if (curRouteInfo["name"] != newRouteInfo["name"])
			{
				return RoutePerk._updateRoute(unit, curRouteInfo, newRouteInfo, options);
			}
			*/
		}).then(() => {
			// Validate URL
			if (unit.get("setting", "routing.options.autoValidate"))
			{
				let validateOptions = {
					"validatorName":	unit.get("setting", "routing.options.validatorName"),
					"items":			BM.URLUtil.loadParameters(newURL),
					"url":				newURL,
				};
				return unit.use("spell", "validation.validate", validateOptions);
			}
		}).then(() => {
			// Refresh
			return RoutePerk._refreshRoute(unit, newRouteInfo, options);
		}).then(() => {
			// Normalize URL
			return RoutePerk._normalizeRoute(unit, window.location.href);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Jump to url.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 */
	static _jumpRoute(unit, routeInfo, options)
	{

		let url = BM.URLUtil.buildURL(routeInfo, options)
		window.location.href = url;

	}

	// -------------------------------------------------------------------------

	/**
	 * Update route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _updateRoute(unit, curRouteInfo, newRouteInfo, options)
	{

		return RoutePerk._switchRoute(unit, newRouteInfo["name"]);

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _refreshRoute(unit, routeInfo, options)
	{

		return unit.use("spell", "basic.refresh", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Replace current url.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 */
	static _replaceRoute(unit, routeInfo, options)
	{

		history.replaceState(RoutePerk.__getState("replaceRoute", window.history.state), null, BM.URLUtil.buildURL(routeInfo, options));
		unit.set("state", "routing.routeInfo", RoutePerk.__loadRouteInfo(unit, window.location.href));

	}

	// -------------------------------------------------------------------------

	/**
	 * Normalize route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		url					Url to normalize.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _normalizeRoute(unit, url)
	{

		return Promise.resolve().then(() => {
			return unit.use("spell", "event.trigger", "beforeNormalizeURL");
		}).then(() => {
			return unit.use("spell", "event.trigger", "doNormalizeURL");
		}).then(() => {
			return unit.use("spell", "event.trigger", "afterNormalizeURL");
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the external settings file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {Boolean}		True if the unit has the external settings file.
	 */
	static __hasExternalSettings(unit, routeName)
	{

		let ret = false;

		if (!unit.get("state", "routing.routeInfo.settings"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to settings file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {String}		URL.
	 */
	static __getSettingsURL(unit, routeName)
	{

		let path;
		let fileName;
		let query;

		let settingsRef = unit.get("state", "routing.routeInfo.settingsRef");
		if (settingsRef && settingsRef !== true)
		{
			// If URL is specified in ref, use it
			let url = BM.URLUtil.parseURL(settingsRef);
			fileName = url.filename;
			path = url.path;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = BM.Util.concatPath([
					unit.get("setting", "system.unit.options.path", ""),
					unit.get("setting", "unit.options.path", ""),
				]);
			let ext = RoutePerk.__getSettingFormat(unit);
			fileName = unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()) + "." + routeName + ".settings." + ext;
  			query = unit.get("setting", "unit.options.query");
		}

		return BM.Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the external extender file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {Boolean}		True if the unit has the external extender file.
	 */
	static __hasExternalExtender(unit, routeName)
	{

		let ret = false;

		if (unit.get("state", "routing.routeInfo.extenderRef") || unit.get("state", "routing.routeInfo.extender"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to extender file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		routeName			Route name.
	 *
	 * @return  {String}		URL.
	 */
	static __getExtenderURL(unit, routeName)
	{

		let path;
		let fileName;
		let query;

		let extenderRef = unit.get("state", "routing.routeInfo.extenderRef");
		if (extenderRef && extenderRef !== true)
		{
			// If URL is specified in ref, use it
			let url = BM.URLUtil.parseURL(extenderRef);
			path = url.path;
			fileName = url.filename;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = path || BM.Util.concatPath([
					unit.get("setting", "system.unit.options.path", ""),
					unit.get("setting", "unit.options.path", ""),
				]);
			fileName = fileName || unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()) + "." + routeName + ".js";
			query = unit.get("setting", "unit.options.query");
		}

		return BM.Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Get route info from the url.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		url					Url.
	 *
	 * @return  {Object}		Route info.
	 */
	static __loadRouteInfo(unit, url)
	{

		let parsedURL = new URL(url, window.location.href);
		let routeInfo = {
			"URL":				url,
			"path":				parsedURL.pathname,
			"query":			parsedURL.search,
			"parsedURL":		parsedURL,
			"queryParameters":	BM.URLUtil.loadParameters(url),
		};

		// Find the matching route
		let routes = unit.get("vault", "routing.routes");
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
				let settingsRef = BM.Util.safeGet(routes[i], `routeOptions.${routeName}.settingsRef`, routes[i].settingsRef);
				routeInfo["settingsRef"] = RoutePerk.__interpolate(settingsRef, params);
				let settings = BM.Util.safeGet(routes[i], `routeOptions.${routeName}.settings`, routes[i].settings);
				routeInfo["settings"] = BM.Util.getObject(settings, {"format":RoutePerk.__getSettingFormat(unit)});
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
	 * @param	{Unit}			unit				Unit.
	 */
	static __initPopState(unit)
	{

		window.addEventListener("popstate", (e) => {
			return Promise.resolve().then(() => {
				return unit.use("spell", "event.trigger", "beforePopState");
			}).then(() => {
				return RoutePerk._open(unit, {"url":window.location.href}, {"pushState":false});
			}).then(() => {
				return unit.use("spell", "event.trigger", "afterPopState");
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		url					Url to validate.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __fixRoute(unit, url)
	{

		let isOk = true;
		let newParams = BM.URLUtil.loadParameters(url);

		// Fix invalid paramters
		Object.keys(unit.get("state", "validation.validationResult.invalids")).forEach((key) => {
			let item = unit.get("state", `validation.validationResult.invalids.${key}`);

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
			RoutePerk._replaceRoute(unit, {"queryParameters":newParams});

			// Fixed
			unit.set("state", "validation.validationResult.result", true);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Dump validation errors.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static __dumpValidationErrors(unit)
	{

		Object.keys(unit.get("state", "validation.validationResult.invalids")).forEach((key) => {
			let item = unit.get("state", `validation.validationResult.invalids.${key}`);

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
	 * Return default settings file format.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {String}		"js" or "json".
	 */
	static __getSettingFormat(unit)
	{

		return unit.get("setting", "routing.options.settingFormat",
				unit.get("setting", "system.setting.options.settingFormat",
					"json"));

	}

}
