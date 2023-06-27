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
import ResourceHandler from "./resource-handler.js";

// =============================================================================
//	API Resource Handler class
// =============================================================================

export default class APIResourceHandler extends ResourceHandler
{

	// -------------------------------------------------------------------------
	// 	Protected
	// -------------------------------------------------------------------------

	_load(id, parameters)
	{

		let method = "GET";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("URL", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

		return BM.AjaxUtil.ajaxRequest({URL:url, method:method, headers:headers, options:options}).then((xhr) => {
			return this._convertResponseData(xhr.responseText, dataType);
		});

	}

    // -------------------------------------------------------------------------

	_remove(id, parameters)
	{

		let method = "DELETE";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("URL", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

		return BM.AjaxUtil.ajaxRequest({URL:url, method:method, headers:headers, options:options});

	}

    // -------------------------------------------------------------------------

	_add(id, data, parameters)
	{

		let method = "POST";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("URL", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

		return BM.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

	}

    // -------------------------------------------------------------------------

	_update(id, data, parameters)
	{

		let method = "PUT";
		let headers = this._getOption("headers", method);
		let options = this._getOption("options", method);
		let urlOptions = this._getOption("URL", method);
		let dataType = urlOptions["dataType"];

		let url = this._buildApiUrl(this._resourceName, id, parameters, urlOptions);

		return BM.AjaxUtil.ajaxRequest({URL:url, method:method, headers:headers, options:options, data:this._convertRequestData(data, dataType)});

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

		let settings = this._options.get("ajaxOptions", {});
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

		let baseUrl = options["baseURL"] || this._unit.get("settings", "system.apiBaseURL", "");
		let scheme = options["scheme"] || "";
		let host = options["host"] || "";
		let dataType = options["dataType"] || "";
		let version = options["version"] || "";
		let format = options["format"] || "";
		let url = format.
					replace("@scheme@", scheme).
					replace("@host@", host).
					replace("@baseURL@", baseUrl).
					replace("@resource@", resourceName).
					replace("@id@", id).
					replace("@dataType@", dataType).
					replace("@query@", BM.URLUtil.buildQuery(parameters)).
					replace("@version@", version);

		return url

	}

}
