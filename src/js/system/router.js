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
//	Router class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function Router(settings)
{

	// super()
	settings = Object.assign({}, settings, {"name":"Router", "autoSetup":false});
	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	// Init vars
	_this._routes = _this._routes || [];
	_this._spec;

	// Event handlers
	_this.addEventHandler(_this, "connected", _this.onConnected);

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(Router, BITSMIST.v1.Component);
customElements.define("bm-router", Router);

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Route info.
 *
 * @type	{Object}
 */
Object.defineProperty(Router.prototype, 'routeInfo', {
	get()
	{
		return this._routeInfo;
	}
})

// -----------------------------------------------------------------------------
//	Event handlers
// -----------------------------------------------------------------------------

/**
 * Connected event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 */
Router.prototype.onConnected = function(sender, e)
{

	return new Promise((resolve, reject) => {
		this._routeInfo = this.__loadRouteInfo(window.location.href);
		this.__initPopState();
		this.__initSpec(this._routeInfo["specName"]).then(() => {
			return this.trigger("specLoad", this, {"spec":this._spec});
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Build url from route info.
 *
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 *
 * @return  {string}		Url.
 */
Router.prototype.buildUrl = function(routeInfo)
{

	let url;

	if (routeInfo["url"])
	{
		url = routeInfo["url"];
	}
	else
	{
		url  = ( routeInfo["path"] ? routeInfo["path"] : this._routeInfo["path"] );
		url += ( routeInfo["query"] ? "?" + routeInfo["query"] : "" );
		url += ( routeInfo["queryParameters"] ? this.buildUrlQuery(routeInfo["queryParameters"]) : "" );
	}

	return url;

}

// -----------------------------------------------------------------------------

/**
 * Build query string from the options object.
 *
 * @param	{Object}		options				Query options.
 *
 * @return  {String}		Query string.
 */
Router.prototype.buildUrlQuery = function(options)
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
 */
Router.prototype.loadParameters = function()
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
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 */
Router.prototype.openRoute = function(routeInfo, options)
{

	options = Object.assign({}, options);

	this._open(routeInfo, options);

}

// -----------------------------------------------------------------------------

/**
 * Jump to route.
 *
 * @param	{Object}		options				Query options.
 */
Router.prototype.jumpRoute = function(routeInfo, options)
{

	let url = this.buildUrl(routeInfo);
	this._jump(url);

}

// -----------------------------------------------------------------------------

/**
 * Refresh route.
 *
 * @param	{Object}		options				Query options.
 */
Router.prototype.refreshRoute = function(routeInfo, options)
{

	return this._refresh(routeInfo, options);

}

// -----------------------------------------------------------------------------

/**
 * Update route.
 *
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 */
Router.prototype.updateRoute = function(routeInfo, options)
{

	return this._update(routeInfo, options);

}

// -----------------------------------------------------------------------------

/**
 * Replace current url.
 *
 * @param	{Object}		routeInfo			Route information.
 *
 * @return  {string}		Url.
 */
Router.prototype.replaceRoute = function(routeInfo)
{

	history.replaceState(null, null, this.buildUrl(routeInfo));
	this._routeInfo = this.__loadRouteInfo(window.location.href);

}

// -----------------------------------------------------------------------------
//	Protected
// -----------------------------------------------------------------------------

/**
 * Open route.
 *
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 */
Router.prototype._open = function(routeInfo, options)
{

	options = Object.assign({}, options);
	options["pushState"] = ( options["pushState"] !== undefined ? options["pushState"] : true );
	let url = this.buildUrl(routeInfo);
	let curRouteInfo = Object.assign({}, this._routeInfo);
	let newRouteInfo = this.__loadRouteInfo(url);
	this._routeInfo = this.__loadRouteInfo(url);

	if (!newRouteInfo["name"] || ( curRouteInfo["name"] != newRouteInfo["name"]) )
	{
		this._jump(url);
		return;
	}

	Promise.resolve().then(() => {
		if (options["pushState"])
		{
			history.pushState(null, null, url);
		}
	}).then(() => {
		if ( curRouteInfo["specName"] != newRouteInfo["specName"] )
		{
			// Load another component and open
			return this._update(newRouteInfo, options);
		}
		else
		{
			// Refresh current component
			return this._refresh(routeInfo, options);
		}
	}).then(() => {
		if (routeInfo["dispUrl"])
		{
			// Replace url
			history.replaceState(null, null, routeInfo["dispUrl"]);
		}
	});

}


// -----------------------------------------------------------------------------

/**
 * Jump to url.
 *
 * @param	{String}		url					Url.
 */
Router.prototype._jump = function(url)
{

	location.href = url;

}

// -----------------------------------------------------------------------------

/**
 * Refresh route.
 *
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 */
Router.prototype._refresh = function(routeInfo, options)
{

	let componentName = this._routeInfo["componentName"];
	if (this._components[componentName])
	{
		return this._components[componentName].refresh({"sender":this, "pushState":false});
	}

}

// -----------------------------------------------------------------------------

/**
 * Update route.
 *
 * @param	{Object}		routeInfo			Route information.
 * @param	{Object}		options				Query options.
 */
Router.prototype._update = function(routeInfo, options)
{

	return new Promise((resolve, reject) => {
		this.clearOrganizers();

		Promise.resolve().then(() => {
			return this.__initSpec(routeInfo["specName"]);
		}).then(() => {
			return this.trigger("specLoad", this, {"spec":this._spec});
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------
//	Private
// -----------------------------------------------------------------------------

/**
 * Get route info from the url.
 *
 * @param	{String}		url					Url.
 *
 * @return  {Object}		Route info.
 */
Router.prototype.__loadRouteInfo = function(url)
{

	let routeInfo = {};
	let routeName;
	let parsedUrl = new URL(url, window.location.href);
	let specName;
	let componentName;
	let params = {};

	for (let i = this._routes.length - 1; i >= 0; i--)
	{
		// Check origin
		if ( !this._routes[i]["origin"] || (this._routes[i]["origin"] && parsedUrl.origin == this._routes[i]["origin"]))
		{
			// Check path
			let result = ( !this._routes[i]["path"] ? [] : this._routes[i].re.exec(parsedUrl.pathname));
			if (result)
			{
				routeName = this._routes[i].name;
				specName = ( this._routes[i].specName ? this._routes[i].specName : "" );
				componentName = this._routes[i].componentName;
				for (let j = 0; j < result.length - 1; j++)
				{
					params[this._routes[i].keys[j].name] = result[j + 1];
					let keyName = this._routes[i].keys[j].name;
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
	routeInfo["queryParameters"] = this.loadParameters();

	return routeInfo;

}

// -----------------------------------------------------------------------------

/**
 * Init pop state handling.
 */
Router.prototype.__initPopState = function()
{

	if (window.history && window.history.pushState){
		window.addEventListener("popstate", (event) => {

			let promise;
			let componentName = this._routeInfo["componentName"];
			if (this._components[componentName])
			{
				promise = this._components[componentName].trigger("beforePopState", this);
			}

			Promise.all([promise]).then(() => {
				this.openRoute(this.__loadRouteInfo(window.location.href), {"pushState":false});
			}).then(() => {
				let componentName = this._routeInfo["componentName"];
				if (this._components[componentName])
				{
					this._components[componentName].trigger("popState", this);
				}
			});
		});
	}

}

// -----------------------------------------------------------------------------

/**
 * Load a spec and init.
 */
Router.prototype.__initSpec = function(specName)
{

	return new Promise((resolve, reject) => {
		if (specName)
		{
			let path = this.getAttribute("data-specpath") || "";

			this.loadSpec(specName, path).then((spec) => {
				this._spec = spec;

				this.organize(spec, "spec").then(() => {
					resolve();
				});
			});
		}
		else
		{
			resolve();
		}
	});

}
