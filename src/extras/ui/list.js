// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormUtil from "../util/form-util.js";

// =============================================================================
//	List class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function List()
{

	return Reflect.construct(BITSMIST.v1.Pad, [], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(List, BITSMIST.v1.Pad);

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Row object.
 *
 * @type	{Object}
 */
Object.defineProperty(List.prototype, 'rows', {
	get()
	{
		return this._rows;
	},
})

// -----------------------------------------------------------------------------

/**
 * Data items.
 *
 * @type	{Object}
 */
Object.defineProperty(List.prototype, 'items', {
	get()
	{
		return this._items;
	},
	set(value)
	{
		this._items = value;
	}
})

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Start component.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.start = function(settings)
{

	// Init vars
	this._items = [];
	this._activeRowTemplateName = "";
	this._listRootNode;
	this._rows;

	// Init component settings
	settings = Object.assign({}, settings, {
		"settings": {
			"autoClear": true,
		},
	});

	// super()
	return BITSMIST.v1.Pad.prototype.start.call(this, settings);

}

// -----------------------------------------------------------------------------

/**
 * Change template html.
 *
 * @param	{String}		templateName		Template name.
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.switchTemplate = function(templateName, options)
{

	return BITSMIST.v1.Pad.prototype.switchTemplate.call(this, templateName, options).then(() => {
		return this.switchRowTemplate(this.settings.get("settings.rowTemplateName"));
	});

}

// -----------------------------------------------------------------------------

/**
 * Change a template html.
 *
 * @param	{String}		templateName		Template name.
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.switchRowTemplate = function(templateName, options)
{

	options = Object.assign({}, options);

	if (this._isActiveRowTemplate(templateName))
	{
		return Promise.resolve();
	}

	return Promise.resolve().then(() => {
		console.debug(`List.switchRowTemplate(): Switching a row template. name=${this.name}, rowTemplateName=${templateName}, id=${this.id}`);
		return this.addTemplate(templateName);
	}).then(() => {
		this._activeRowTemplateName = templateName;
	}).then(() => {
		return this.callOrganizers("afterRowAppend", this._settings.items);
	}).then(() => {
		return this.trigger("afterRowAppend", options);
	}).then(() => {
		console.debug(`List.switchRowTemplate(): Switched a row template. name=${this.name}, rowTemplateName=${templateName}, id=${this.id}`);
	});

}

// -----------------------------------------------------------------------------

/**
 * Clear list.
 */
List.prototype.clear = function()
{

	this._listRootNode.innerHTML = "";

}

// -----------------------------------------------------------------------------

/**
 * Fetch data.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.fetch = function(options)
{

	return BITSMIST.v1.Pad.prototype.fetch.call(this, options).then(() => {
		let resourceName = this.settings.get("settings.resourceName");
		if (resourceName && this.resources && this.resources[resourceName])
		{
			this.items = this.resources[resourceName]._items;
		}
	});

}

// -----------------------------------------------------------------------------

/**
 * Fill list with data.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.fill = function(options)
{

	console.debug(`List.fill(): Filling list. name=${this.name}`);

	options = Object.assign({}, options);

	let builder = this._getBuilder(options);
	let fragment = document.createDocumentFragment();
	this._rows = [];

	// Get list root node
	this._listRootNode = this.querySelector(this._settings.get("settings.listRootNode"));
	BITSMIST.v1.Util.assert(this._listRootNode, `List root node not found. name=${this.name}, listRootNode=${this._settings.get("settings.listRootNode")}`);

	return Promise.resolve().then(() => {
		return this.trigger("beforeFill", options);
	}).then(() => {
		return builder.call(this, fragment, this._items);
	}).then(() => {
		let autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this._settings.get("settings.autoClear"));
		if (autoClear)
		{
			this.clear();
		}
	}).then(() => {
		this._listRootNode.appendChild(fragment);
	}).then(() => {
		return this.trigger("afterFill", options);
	});

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------


/**
 * Fetch data.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Function}		List builder function.
 */
List.prototype._getBuilder = function(options)
{

	let rowAsync = BITSMIST.v1.Util.safeGet(options, "async", this._settings.get("settings.async", true));
	let builder = ( rowAsync ? this._buildAsync : this._buildSync );

	return builder;

}

// -----------------------------------------------------------------------------

/**
 * Check if the template is active.
 *
 * @param	{String}		templateName		Template name.
 *
 * @return  {Boolean}		True when active.
 */
List.prototype._isActiveRowTemplate = function(templateName)
{

	let ret = false;

	if (this._activeRowTemplateName == templateName)
	{
		ret = true;
	}

	return ret;

}

// -----------------------------------------------------------------------------

/**
 * Build rows synchronously.
 *
 * @param	{DocumentFragment}	fragment		Document fragment.
 *
 * @return  {Promise}		Promise.
 */
List.prototype._buildSync = function(fragment, items)
{

	let chain = Promise.resolve();
	let rowEvents = this._settings.get("rowevents");
	let template = this._templates[this._activeRowTemplateName].html;

	for (let i = 0; i < items.length; i++)
	{
		chain = chain.then(() => {
			return this._appendRowSync(fragment, i, items[i], template, rowEvents);
		});
	}

	return chain;

}

// -----------------------------------------------------------------------------

/**
 * Build rows asynchronously.
 *
 * @param	{DocumentFragment}	fragment		Document fragment.
 */
List.prototype._buildAsync = function(fragment, items)
{

	let rowEvents = this._settings.get("rowevents");
	let template = this._templates[this._activeRowTemplateName].html;

	for (let i = 0; i < items.length; i++)
	{
		this._appendRowAsync(fragment, i, items[i], template, rowEvents);
	}

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Append a new row synchronously.
 *
 * @param	{HTMLElement}	rootNode				Root node to append a row.
 * @param	{integer}		no						Line no.
 * @param	{Object}		item					Row data.
 * @param	{String}		template				Template html.
 * @param	{Object}		rowEvents				Row's event info.
 *
 * @return  {Promise}		Promise.
 */
List.prototype._appendRowSync = function(rootNode, no, item, template, rowEvents)
{

	// Append a row
	let ele = document.createElement("div");
	ele.innerHTML = template;
	let element = ele.firstElementChild;
	rootNode.appendChild(element);

	this._rows.push(element);

	// set row elements click event handler
	if (rowEvents)
	{
		Object.keys(rowEvents).forEach((elementName) => {
			this.initEvents(elementName, rowEvents[elementName], element);
		});
	}

	// Call event handlers
	return Promise.resolve().then(() => {
		return this.trigger("beforeFillRow", {"item":item, "no":no, "element":element});
	}).then(() => {
		// Fill fields
		FormUtil.setFields(element, item, {"masters":this.resources});
	}).then(() => {
		return this.trigger("afterFillRow", {"item":item, "no":no, "element":element});
	});

}

// -----------------------------------------------------------------------------

/**
 * Append a new row asynchronously.
 *
 * @param	{HTMLElement}	rootNode				Root node to append a row.
 * @param	{integer}		no						Line no.
 * @param	{Object}		item					Row data.
 * @param	{String}		template				Template html.
 * @param	{Object}		rowEvents				Row's event info.
 */
List.prototype._appendRowAsync = function(rootNode, no, item, template, rowEvents)
{

	// Append a row
	let ele = document.createElement("div");
	ele.innerHTML = template;
	let element = ele.firstElementChild;
	rootNode.appendChild(element);

	this._rows.push(element);

	// set row elements click event handler
	if (rowEvents)
	{
		Object.keys(rowEvents).forEach((elementName) => {
			this.initEvents(elementName, rowEvents[elementName], element);
		});
	}

	// Call event handlers
	this.triggerAsync("beforeFillRow", {"item":item, "no":no, "element":element});
	FormUtil.setFields(element, item, {"masters":this.resources});
	this.triggerAsync("afterFillRow", {"item":item, "no":no, "element":element});

}
