// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Perk, Util, AjaxUtil, URLUtil} from "@bitsmist-js_v1/core";
import {pathToRegexp} from "path-to-regexp";

// =============================================================================
//	Route Perk class
// =============================================================================

export default class RoutePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"routing",
		"order":			900,
		"depends":			"ValidationPerk",
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return RoutePerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Set state on the first page
		history.replaceState(RoutePerk.#__getState("connect"), null, null);

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		RoutePerk.#__vault.set(unit, {
			"routes":	[],
		});

		// Upgrade unit
		unit.upgrade("inventory", "routing.routeInfo", {});
		unit.upgrade("skill", "routing.addRoute", RoutePerk.#_addRoute);
		unit.upgrade("skill", "routing.jumpRoute", RoutePerk.#_jumpRoute);
		unit.upgrade("skill", "routing.refreshRoute", RoutePerk.#_refreshRoute);
		unit.upgrade("skill", "routing.replaceRoute", RoutePerk.#_replaceRoute);
		unit.upgrade("spell", "routing.switch", RoutePerk.#_switchRoute);
		unit.upgrade("spell", "routing.openRoute", RoutePerk.#_open);
		unit.upgrade("spell", "routing.updateRoute", RoutePerk.#_updateRoute);
		unit.upgrade("spell", "routing.refreshRoute", RoutePerk.#_refreshRoute);
		unit.upgrade("spell", "routing.normalizeRoute", RoutePerk.#_normalizeRoute);

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":RoutePerk.#RoutePerk_onDoApplySettings, "order":RoutePerk.info["order"]});
		unit.use("event.add", "doStart", {"handler":RoutePerk.#RoutePerk_onDoStart, "order":RoutePerk.info["order"]});
		unit.use("event.add", "afterReady", {"handler":RoutePerk.#RoutePerk_onAfterReady, "order":RoutePerk.info["order"]});
		unit.use("event.add", "doValidateFail", {"handler":RoutePerk.#RoutePerk_onDoValidateFail, "order":RoutePerk.info["order"]});
		unit.use("event.add", "doReportValidity", {"handler":RoutePerk.#RoutePerk_onDoReportValidity, "order":RoutePerk.info["order"]});

		// Init popstate handler
		RoutePerk.#__initPopState(unit);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #RoutePerk_onDoApplySettings(sender, e, ex)
	{

		// Routings
		Object.entries(Util.safeGet(e.detail, "settings.routing.routes", {})).forEach(([sectionName, sectionValue]) => {
			RoutePerk.#_addRoute(this, sectionName, sectionValue);
		});

		// Set current route info.
		this.set("inventory", "routing.routeInfo", RoutePerk.#__loadRouteInfo(this, window.location.href));

	}

	// -------------------------------------------------------------------------

	static #RoutePerk_onDoStart(sender, e, ex)
	{

		let routeName = this.get("inventory", "routing.routeInfo.name");
		if (routeName)
		{
			let options = {
				"query": this.get("setting", "unit.options.query")
			};

			return this.cast("routing.switch", routeName, options);
		}
		else
		{
			throw new Error("route not found");
		}

	}

	// -------------------------------------------------------------------------

	static #RoutePerk_onAfterReady(sender, e, ex)
	{

		return this.cast("routing.openRoute");

	}

	// -------------------------------------------------------------------------

	static #RoutePerk_onDoValidateFail(sender, e, ex)
	{

		// Try to fix URL when validation failed
		if (this.get("setting", "routing.options.autoFix"))
		{
			RoutePerk.#__fixRoute(this, e.detail.url);
		}

	}

	// -------------------------------------------------------------------------

	static #RoutePerk_onDoReportValidity(sender, e, ex)
	{

		// Dump errors when validation failed
		RoutePerk.#__dumpValidationErrors(this);
		throw new URIError("URL validation failed.");

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Add the route.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		title				Route title.
	 * @param	{Object}		routeInfo			Route info.
	 * @param	{Boolean}		first				Add to top when true.
	 */
	static #_addRoute(unit, title, routeInfo, first)
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
			"__re": 			pathToRegexp(routeInfo["path"], keys),
			"__keys":		keys,
		};

		let routes = RoutePerk.#__vault.get(unit)["routes"];
		if (first)
		{
			routes.unshift(route);
		}
		else
		{
			routes.push(route);
		}

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
	static async #_loadSettings(unit, routeName, options)
	{

		let settings = await AjaxUtil.loadJSON(RoutePerk.#__getSettingsURL(unit, routeName), Object.assign({"bindTo":unit}, options));
		unit.set("inventory", "routing.routeInfo.settings", settings);

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
	static async #_loadExtender(unit, routeName, options)
	{

		if (!unit.get("inventory", "routing.routeInfo.extender"))
		{
			let extender = await AjaxUtil.loadText(RoutePerk.#__getExtenderURL(unit, routeName));
			unit.set("inventory", "routing.routeInfo.extender", extender);
		}
		let extender = unit.get("inventory", "routing.routeInfo.extender");
		if (extender)
		{
			new Function(`"use strict";${extender}`)();
		}

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
	static async #_switchRoute(unit, routeName, options)
	{

		Util.assert(routeName, () => "RoutePerk.#_switchRoute(): A route name not specified.", TypeError);

		let newSettings;

		// Load extra settings
		if (RoutePerk.#__hasExternalSettings(unit, routeName))
		{
			await RoutePerk.#_loadSettings(unit, routeName);
		}

		// Load extra codes
		if (RoutePerk.#__hasExternalExtender(unit, routeName))
		{
			await RoutePerk.#_loadExtender(unit);
		}

		// Merge & apply new settings
		newSettings = unit.get("inventory", "routing.routeInfo.settings");
		unit.use("setting.merge", newSettings);
		await unit.cast("setting.apply", {"settings":newSettings});

		// Cast trasform to load & apply CSS
		await unit.cast("basic.transform");

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
	static async #_open(unit, routeInfo, options)
	{

		options = Object.assign({}, options);

		// Current route info
		let curRouteInfo = unit.get("inventory", "routing.routeInfo");

		let newURL;
		let newRouteInfo;
		if (routeInfo)
		{
			newURL = URLUtil.buildURL(routeInfo, options);
			newRouteInfo = RoutePerk.#__loadRouteInfo(unit, newURL);
		}
		else
		{
			newURL = window.location.href;
			newRouteInfo = curRouteInfo;
		}

		// Jump to another page
		if (options["jump"] || !newRouteInfo["name"]
				|| ( curRouteInfo["name"] != newRouteInfo["name"]) // <--- remove this when #_update() is ready.
		)
		{
			window.location.href = newURL;
			//RoutePerk.#_jumpRoute(unit, {"URL":newURL});
			return;
		}

		// Replace URL
		let pushState = Util.safeGet(options, "pushState", ( routeInfo ? true : false ));
		if (pushState)
		{
			history.pushState(RoutePerk.#__getState("_open.pushState"), null, newURL);
		}
		unit.set("inventory", "routing.routeInfo", newRouteInfo);

		/*
		// Update route
		// Load other unit when new route name is different from the current route name.
		if (curRouteInfo["name"] != newRouteInfo["name"])
		{
			await RoutePerk.#_updateRoute(unit, curRouteInfo, newRouteInfo, options);
		}
		*/

		// Validate URL
		if (unit.get("setting", "routing.options.autoValidate"))
		{
			let validateOptions = {
				"validatorName":	unit.get("setting", "routing.options.validatorName"),
				"items":			URLUtil.loadParameters(newURL),
				"url":				newURL,
			};
			await unit.cast("validation.validate", validateOptions);
		}

		// Refresh
		await RoutePerk.#_refreshRoute(unit, newRouteInfo, options);

		// Normalize URL
		await RoutePerk.#_normalizeRoute(unit, window.location.href);

	}

	// -------------------------------------------------------------------------

	/**
	 * Jump to url.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 */
	static #_jumpRoute(unit, routeInfo, options)
	{

		let url = URLUtil.buildURL(routeInfo, options)
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
	static #_updateRoute(unit, curRouteInfo, newRouteInfo, options)
	{

		return RoutePerk.#_switchRoute(unit, newRouteInfo["name"]);

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
	static #_refreshRoute(unit, routeInfo, options)
	{

		return unit.cast("basic.refresh", options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Replace current url.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		routeInfo			Route information.
	 * @param	{Object}		options				Options.
	 */
	static #_replaceRoute(unit, routeInfo, options)
	{

		history.replaceState(RoutePerk.#__getState("replaceRoute", window.history.state), null, URLUtil.buildURL(routeInfo, options));
		unit.set("inventory", "routing.routeInfo", RoutePerk.#__loadRouteInfo(unit, window.location.href));

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
	static async #_normalizeRoute(unit, url)
	{

		await unit.cast("event.trigger", "beforeNormalizeURL");
		await unit.cast("event.trigger", "doNormalizeURL");
		await unit.cast("event.trigger", "afterNormalizeURL");

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
	static #__hasExternalSettings(unit, routeName)
	{

		let ret = false;

		if (!unit.get("inventory", "routing.routeInfo.settings"))
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
	static #__getSettingsURL(unit, routeName)
	{

		let url;
		let settingsRef = unit.get("inventory", "routing.routeInfo.settingsRef");

		if (settingsRef && settingsRef !== true)
		{
			// If URL is specified in ref, use it
			url = settingsRef;
		}
		else
		{
			// Use default path and filename
			let path = Util.concatPath([
					unit.get("setting", "system.unit.options.path", ""),
					unit.get("setting", "unit.options.path", ""),
				]);
			let ext = RoutePerk.#__getSettingFormat(unit);
			let fileName = unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()) + "." + routeName + ".settings." + ext;
  			let query = unit.get("setting", "unit.options.query");

			 url = Util.concatPath([path, fileName]) + (query ? `?${query}` : "");
		}

		return url;

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
	static #__hasExternalExtender(unit, routeName)
	{

		let ret = false;

		if (unit.get("inventory", "routing.routeInfo.extenderRef") || unit.get("inventory", "routing.routeInfo.extender"))
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
	static #__getExtenderURL(unit, routeName)
	{

		let query;
		let extenderRef = unit.get("inventory", "routing.routeInfo.extenderRef");

		if (extenderRef && extenderRef !== true)
		{
			// If URL is specified in ref, use it
			url = settingsRef;
		}
		else
		{
			// Use default path and filename
			let path = path || Util.concatPath([
					unit.get("setting", "system.unit.options.path", ""),
					unit.get("setting", "unit.options.path", ""),
				]);
			let fileName = fileName || unit.get("setting", "unit.options.fileName", unit.tagName.toLowerCase()) + "." + routeName + ".js";
			let query = unit.get("setting", "unit.options.query");

			url = Util.concatPath([path, fileName]) + (query ? `?${query}` : "");
		}

		return url;

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
	static #__loadRouteInfo(unit, url)
	{

		let parsedURL = new URL(url, window.location.href);
		let routeInfo = {
			"URL":				url,
			"path":				parsedURL.pathname,
			"query":			parsedURL.search,
			"parsedURL":		parsedURL,
			"queryParameters":	URLUtil.loadParameters(url),
		};

		// Find the matching route
		let routes = RoutePerk.#__vault.get(unit)["routes"];
		for (let i = routes.length - 1; i >= 0; i--)
		{
			// Check origin
			if (routes[i]["origin"] && parsedURL.origin != routes[i]["origin"])
			{
				continue;
			}

			// Check path
			let result = (!routes[i]["path"] ? [] : routes[i].__re.exec(parsedURL.pathname));
			if (result)
			{
				let params = {};
				for (let j = 0; j < result.length - 1; j++)
				{
					params[routes[i].__keys[j].name] = result[j + 1];
				}
				routeInfo["title"] = routes[i].title;
				let routeName = RoutePerk.#__interpolate(routes[i].name, params);
				routeInfo["name"] = routeName;
				let settingsRef = Util.safeGet(routes[i], `routeOptions.${routeName}.settingsRef`, routes[i].settingsRef);
				routeInfo["settingsRef"] = RoutePerk.#__interpolate(settingsRef, params);
				let settings = Util.safeGet(routes[i], `routeOptions.${routeName}.settings`, routes[i].settings);
				routeInfo["settings"] = Util.getObject(settings, {"format":RoutePerk.#__getSettingFormat(unit)});
				let extenderRef = Util.safeGet(routes[i], `routeOptions.${routeName}.extenderRef`, routes[i].extenderRef);
				routeInfo["extenderRef"] = RoutePerk.#__interpolate(extenderRef, params);
				routeInfo["extender"] = Util.safeGet(routes[i], `routeOptions.${routeName}.extender`, routes[i].extender);
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
	static #__interpolate(target, params)
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
	static #__initPopState(unit)
	{

		window.addEventListener("popstate", async (e) => {
			await unit.cast("event.trigger", "beforePopState");
			await RoutePerk.#_open(unit, {"url":window.location.href}, {"pushState":false});
			await unit.cast("event.trigger", "afterPopState");
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
	static #__getState(msg, options)
	{

		let newState = {
			"msg": msg,
		};

		if (options)
		{
			newState = Util.deepMerge(Util.deepClone(options), newState);
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
	static #__fixRoute(unit, url)
	{

		let isOk = true;
		let newParams = URLUtil.loadParameters(url);

		// Fix invalid paramters
		Object.keys(unit.get("inventory", "validation.validationResult.invalids")).forEach((key) => {
			let item = unit.get("inventory", `validation.validationResult.invalids.${key}`);

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
			RoutePerk.#_replaceRoute(unit, {"queryParameters":newParams});

			// Fixed
			unit.set("inventory", "validation.validationResult.result", true);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Dump validation errors.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static #__dumpValidationErrors(unit)
	{

		Object.keys(unit.get("inventory", "validation.validationResult.invalids")).forEach((key) => {
			let item = unit.get("inventory", `validation.validationResult.invalids.${key}`);

			if (item.failed)
			{
				for (let i = 0; i < item.failed.length; i++)
				{
					console.warn("RoutePerk.#__dumpValidationErrors(): URL validation failed.",
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
	static #__getSettingFormat(unit)
	{

		return unit.get("setting", "routing.options.settingFormat",
				unit.get("setting", "system.setting.options.settingFormat",
					"json"));

	}

}
