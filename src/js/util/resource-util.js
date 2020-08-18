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
		this._settings = options["settings"];
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

		let url = this.__buildApiUrl(this._name, "list", parameters);

		return new Promise((resolve, reject) => {
			let headers = this.__getOptions("extraHeaders", "GET");
			let options = this.__getOptions("options", "GET");

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

		let url = this.__buildApiUrl(this._name, id, parameters);

		return new Promise((resolve, reject) => {
			let headers = this.__getOptions("extraHeaders", "GET");
			let options = this.__getOptions("options", "GET");

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

		let url = this.__buildApiUrl(this._name, id, parameters);

		return new Promise((resolve, reject) => {
			let headers = this.__getOptions("extraHeaders", "DELETE");
			let options = this.__getOptions("options", "DELETE");

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

		let url = this.__buildApiUrl(this._name, id, parameters);

		return new Promise((resolve, reject) => {
			let headers = this.__getOptions("extraHeaders", "POST");
			let options = this.__getOptions("options", "POST");

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

		let url = this.__buildApiUrl(this._name, id, parameters);

		return new Promise((resolve, reject) => {
			let headers = this.__getOptions("extraHeaders", "PUT");
			let options = this.__getOptions("options", "PUT");

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
	 * Get options for the method.
	 *
	 * @param	{string}		target				"ajaxHeaders" or "ajaxOptions"..
	 * @param	{string}		method				Method.
	 *
	 * @return  {object}		Options.
	 */
	__getOptions(target, method)
	{

		let result;

		if (this._settings[target])
		{
			let options1 = ("COMMON" in this._settings[target] ? this._settings[target]["COMMON"] : {} );
			let options2 = (method in this._settings[target] ? this._settings[target][method] : {} );

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
	__buildApiUrl(resourceName, id, parameters)
	{

		let url = this._options["baseUrl"] + "/" +  resourceName + "/" + id + ".json" + this.__buildUrlQuery(parameters);

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
	__buildUrlQuery(parameters)
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
