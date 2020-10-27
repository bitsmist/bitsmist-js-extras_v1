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
//	Resource util class
// =============================================================================

export default class ResourceUtil
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
	constructor(resourceName, options)
	{

		this._name = resourceName;
		this._options = options;
		this._data;
		this._parameters = {};

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
	get(id, parameters)
	{

		return new Promise((resolve, reject) => {
			let method = "GET";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._name, id, parameters, urlOptions);

			BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options}).then((xhr) => {
				resolve((this._convertResponseData(xhr.responseText, dataType)));
			});
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
	delete(id, parameters)
	{

		return new Promise((resolve, reject) => {
			let method = "DELETE";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._name, id, parameters, urlOptions);

			BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options}).then((xhr) => {
				resolve((this._convertResponseData(xhr.responseText, dataType)));
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Insert data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		items				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	insert(id, items, parameters)
	{

		return new Promise((resolve, reject) => {
			let method = "POST";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._name, id, parameters, urlOptions);

			BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(items, dataType)}).then((xhr) => {
				resolve((this._convertResponseData(xhr.responseText, dataType)));
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Update data.
	 *
	 * @param	{String}		id					Target id.
	 * @param	{Object}		items				Data to update.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	update(id, items, parameters)
	{

		return new Promise((resolve, reject) => {
			let method = "PUT";
			let headers = this._getOption("headers", method);
			let options = this._getOption("options", method);
			let urlOptions = this._getOption("url", method);
			let dataType = urlOptions["dataType"];

			let url = this._buildApiUrl(this._name, id, parameters, urlOptions);

			BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:method, headers:headers, options:options, data:this._convertRequestData(items, dataType)}).then((xhr) => {
				resolve((this._convertResponseData(xhr.responseText, dataType)));
			});
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Convert request data to specified format.
	 *
	 * @param	{Object}		items				Data to convert.
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

		let settings = ("settings" in this._options ? this._options["settings"] : {});
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

		let baseUrl = options["baseUrl"];
		let scheme = options["scheme"];
		let host = options["host"];
		let dataType = options["dataType"];
		let version = options["version"];
		let format = ( options["format"] ? options["format"] : "@baseUrl@@query@" );;
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
