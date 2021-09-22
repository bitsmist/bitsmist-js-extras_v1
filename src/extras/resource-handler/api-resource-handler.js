// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ResourceHandler from "./resource-handler.js";

// =============================================================================
//	API Resource Handler class
// =============================================================================

export default class ApiResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
     * @param	{String}		resourceName		Resource name.
     * @param	{Object}		options				Options.
     */
	constructor(component, resourceName, options)
	{

		super(component, resourceName, options);

		this._name = "ApiResourceHandler";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Get data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_get(id, parameters)
	{

		let method = "GET";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("url", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

		return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options}).then((xhr) => {
			return this._convertResponseData(xhr.responseText, dataType);
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Delete data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_delete(id, parameters)
	{

		let method = "DELETE";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("url", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceNname, id, parameters, urlOptions);

		return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options});

	}

    // -------------------------------------------------------------------------

	/**
	 * Insert data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_post(id, data, parameters)
	{

		let method = "POST";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("url", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceNname, id, parameters, urlOptions);

		return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

	}

    // -------------------------------------------------------------------------

	/**
	 * Update data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		data				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	_put(id, data, parameters)
	{

		let method = "PUT";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("url", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceNname, id, parameters, urlOptions);

		return BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Convert request data to specified format.
	 *
	 * @param	{Object}		data				Data to convert.
	 * @param	{String}		dataType			Target data type.
	 *
	 * @return  {String}		Converted data.
	 */
	_convertRequestData(items, dataType)
	{

		let data;

		switch (dataType)
		{
		case "json":
		default:
			data = JSON.stringify(items);
			break;
		/*
		default:
			data = items.serialize();
			break;
		*/
		}

		return data;

	}

	// -------------------------------------------------------------------------

	/**
	 * Convert response data to object.
	 *
	 * @param	{Object}		items				Data to convert.
	 * @param	{String}		dataType			Source data type.
	 *
	 * @return  {String}		Converted data.
	 */
	_convertResponseData(items, dataType)
	{

		let data;

		switch (dataType)
		{
		case "json":
		default:
			data = JSON.parse(items);
			break;
		}

		return data;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get option for the method.
	 *
	 * @param	{String}		target				"ajaxHeaders" or "ajaxOptions"..
	 * @param	{String}		method				Method.
	 *
	 * @return  {Object}		Options.
	 */
	_getOption(target, method)
	{

		let settings = this._options.get("handlerOptions", {});
		let options1 = (target in settings && "COMMON" in settings[target] ? settings[target]["COMMON"] : {} );
		let options2 = (target in settings && method in settings[target] ? settings[target][method] : {} );

		return Object.assign(options1, options2);

	}

	// -------------------------------------------------------------------------

	/**
	 * Build url for the api.
	 *
	 * @param	{String}		resource			API resource.
	 * @param	{String}		id					Id for the resource.
	 * @param	{Object}		options				Url options.
	 *
	 * @return  {String}		Url.
	 */
	_buildApiUrl(resourceName, id, parameters, options)
	{

		let baseUrl = options["baseUrl"] || this._component.settings.get("system.apiBaseUrl", "");
		let scheme = options["scheme"] || "";
		let host = options["host"] || "";
		let dataType = options["dataType"] || "";
		let version = options["version"] || "";
		let format = options["format"] || "";
		let url = format.
					replace("@scheme@", scheme).
					replace("@host@", host).
					replace("@baseUrl@", baseUrl).
					replace("@resource@", resourceName).
					replace("@id@", id).
					replace("@dataType@", dataType).
					replace("@query@", this._buildUrlQuery(parameters)).
					replace("@version@", version);

		return url

	}

	// -------------------------------------------------------------------------

	/**
	 * Build query string from parameters object.
	 *
	 * @param	{Object}		paratemers			Query parameters.
	 *
	 * @return  {String}		Query string.
	 */
	_buildUrlQuery(parameters)
	{

		let query = "";

		if (parameters)
		{
			query = Object.keys(parameters).reduce((result, current) => {
				if (Array.isArray(parameters[current]))
				{
					result += encodeURIComponent(current) + "=" + encodeURIComponent(parameters[current].join()) + "&";
				}
				else if (parameters[current])
				{
					result += encodeURIComponent(current) + "=" + encodeURIComponent(parameters[current]) + "&";
				}

				return result;
			}, "");
		}

		return ( query ? "?" + query.slice(0, -1) : "");

	}

}
