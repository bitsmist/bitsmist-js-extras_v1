// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
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
     * @param	{string}		resourceName		Resource name.
     * @param	{array}			options				Options.
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
	 * Get list data.
	 *
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	getList(parameters)
	{

		let url = this._buildApiUrl(this._name, "list", parameters);

		return new Promise((resolve, reject) => {
			let headers = this._getOption("extraHeaders", "GET");
			let options = this._getOption("options", "GET");

			BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:"GET", data:null, headers:headers, options:options}).then((xhr) => {
				this._parameters = (parameters ? parameters : {});
				this._data = JSON.parse(xhr.responseText);
				resolve(this._data);
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Get single data.
	 *
	 * @param	{string}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	getItem(id, parameters)
	{

		let url = this._buildApiUrl(this._name, id, parameters);

		return new Promise((resolve, reject) => {
			let headers = this._getOption("extraHeaders", "GET");
			let options = this._getOption("options", "GET");

			BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:"GET", headers:headers, options:options}).then((xhr) => {
				resolve(JSON.parse(xhr.responseText));
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Delete single data.
	 *
	 * @param	{string}		id					Target id.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	deleteItem(id, parameters)
	{

		let url = this._buildApiUrl(this._name, id, parameters);

		return new Promise((resolve, reject) => {
			let headers = this._getOption("extraHeaders", "DELETE");
			let options = this._getOption("options", "DELETE");

			BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:"DELETE", headers:headers, options:options}).then((xhr) => {
				resolve(JSON.parse(xhr.responseText));
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Insert a single data.
	 *
	 * @param	{string}		id					Target id.
	 * @param	{array}			items				Data to insert.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	insertItem(id, items, parameters)
	{

		let url = this._buildApiUrl(this._name, id, parameters);

		return new Promise((resolve, reject) => {
			let headers = this._getOption("extraHeaders", "POST");
			let options = this._getOption("options", "POST");

			BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:"POST", headers:headers, options:options, data:JSON.stringify(items)}).then((xhr) => {
				resolve(JSON.parse(xhr.responseText));
			});
		});

	}

    // -------------------------------------------------------------------------

	/**
	 * Update a single data.
	 *
	 * @param	{string}		id					Target id.
	 * @param	{array}			items				Data to update.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	updateItem(id, items, parameters)
	{

		let url = this._buildApiUrl(this._name, id, parameters);

		return new Promise((resolve, reject) => {
			let headers = this._getOption("extraHeaders", "PUT");
			let options = this._getOption("options", "PUT");

			BITSMIST.v1.AjaxUtil.ajaxRequest({url:url, method:"PUT", headers:headers, options:options, data:JSON.stringify(items)}).then((xhr) => {
				resolve(JSON.parse(xhr.responseText));
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Upsert a single data.
	 *
	 * @param	{string}		id					Target id.
	 * @param	{array}			items				Data to update.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {Promise}		Promise.
	 */
	upsertItem(id, items, parameters)
	{

		if (id == "new")
		{
			return this.insertItem(id, items, parameters);
		}
		else
		{
			return this.updateItem(id, items, parameters);
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Get option for the method.
	 *
	 * @param	{string}		target				"ajaxHeaders" or "ajaxOptions"..
	 * @param	{string}		method				Method.
	 *
	 * @return  {object}		Options.
	 */
	_getOption(target, method)
	{

		let result;
		let settings = ("settings" in this._options ? this._options["settings"] : {});

		if (settings[target])
		{
			let options1 = ("COMMON" in settings[target] ? settings[target]["COMMON"] : {} );
			let options2 = (method in settings[target] ? settings[target][method] : {} );

			result = Object.assign(options1, options2);
		}

		return result;

	}

	// -------------------------------------------------------------------------

	/**
	 * Build url for the api.
	 *
	 * @param	{String}		resource			API resource.
	 * @param	{String}		id					Id for the resource.
	 * @param	{Object}		parameters			Query parameters.
	 *
	 * @return  {String}		Url.
	 */
	_buildApiUrl(resourceName, id, parameters)
	{

		let url = this._options["baseUrl"] + "/" +  resourceName + "/" + id + ".json" + this._buildUrlQuery(parameters);

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
