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

	return Reflect.construct(BM.Component, [], this.constructor);

}

BM.ClassUtil.inherit(List, BM.Component);

// -----------------------------------------------------------------------------
//  Settings
// -----------------------------------------------------------------------------

List.prototype._getSettings = function(settings)
{

	return {
		"settings": {
			"autoClear":				true,
		},
		"events": {
			"this": {
				"handlers": {
					"beforeStart": 		[this.onBeforeStart],
					"afterTransform":	[this.onAfterTransform],
					"doClear": 			[this.onDoClear],
					"doFill": 			[this.onDoFill]
				}
			}
		},
	};

}

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
//  Event Handlers
// -----------------------------------------------------------------------------

/**
 * Before start event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
List.prototype.onBeforeStart = function(sender, e, ex)
{

	this._items = [];

}

// -----------------------------------------------------------------------------

/**
 * After transform event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
List.prototype.onAfterTransform = function(sender, e, ex)
{

	this._listRootNode = this.querySelector(this.settings.get("settings.listRootNode"));
	BM.Util.assert(this._listRootNode, `List.fill(): List root node not found. name=${this.name}, listRootNode=${this.settings.get("settings.listRootNode")}`);

	return this.transformRow(this.settings.get("settings.rowTemplateName"));

}

// -----------------------------------------------------------------------------

/**
 * Before start event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
List.prototype.onDoClear = function(sender, e, ex)
{

	this._listRootNode.innerHTML = "";

}

// -----------------------------------------------------------------------------

/**
 * Before start event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
List.prototype.onDoFill = function(sender, e, ex)
{

	this._rows = [];
	let builder = this._getBuilder(e.detail);
	let fragment = document.createDocumentFragment();
	let items = BM.Util.safeGet(e.detail, "items", this._items);

	return Promise.resolve().then(() => {
		return builder.call(this, fragment, items);
	}).then(() => {
		this._listRootNode.appendChild(fragment);
	});

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Change a row template html.
 *
 * @param	{String}		templateName		Template name.
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.transformRow = function(templateName, options)
{

	options = options || {};

	if (this._activeRowTemplateName === templateName)
	{
		return Promise.resolve();
	}

	return Promise.resolve().then(() => {
		console.debug(`List.switchRowTemplate(): Switching a row template. name=${this.name}, rowTemplateName=${templateName}, id=${this.id}, uniqueId=${this.uniqueId}`);
		return this.addTemplate(templateName);
	}).then(() => {
		this._activeRowTemplateName = templateName;
	}).then(() => {
		return this.trigger("afterRowAppend", options);
	}).then(() => {
		console.debug(`List.switchRowTemplate(): Switched a row template. name=${this.name}, rowTemplateName=${templateName}, id=${this.id}, uniqueId=${this.uniqueId}`);
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

	let rowAsync = BM.Util.safeGet(options, "async", this.settings.get("settings.async", true));
	let builder = ( rowAsync ? this._buildAsync : this._buildSync );

	return builder;

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

	BM.Util.assert(this._templates[this._activeRowTemplateName], `List._buildSync(): Row template not loaded yet. name=${this.name}, rowTemplateName=${this._activeRowTemplateName}`);

	let chain = Promise.resolve();
	let rowEvents = this.settings.get("rowevents");
	let template = this.templates[this._activeRowTemplateName].html;

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

	BM.Util.assert(this.templates[this._activeRowTemplateName], `List._buildAsync(): Row template not loaded yet. name=${this.name}, rowTemplateName=${this._activeRowTemplateName}`);

	let rowEvents = this.settings.get("rowevents");
	let template = this.templates[this._activeRowTemplateName].html;

	for (let i = 0; i < items.length; i++)
	{
		this._appendRowAsync(fragment, i, items[i], template, rowEvents);
	}

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Create a row element.
 *
 * @param	{String}		template				Template html.
 *
 * @return  {HTMLElement}	Row element.
 */
List.prototype._createRow = function(template)
{

	let ele = document.createElement("div");
	ele.innerHTML = template;
	let element = ele.firstElementChild;
	element.setAttribute("bm-powered", "");

	return element;

}

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

	this.triggerAsync("beforeBuildRow", {"item":item});

	let chain = Promise.resolve();
	chain = chain.then(() => {
		// Append a row
		let element = this._createRow(template);
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
			FormUtil.showConditionalElements(element, item);
			FormUtil.setFields(element, item, {"masters":this.resources});
		}).then(() => {
			return this.trigger("afterFillRow", {"item":item, "no":no, "element":element});
		});
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

	this.triggerAsync("beforeBuildRow", {"item":item});

	// Append a row
	let element = this._createRow(template);
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
	FormUtil.showConditionalElements(element, item);
	FormUtil.setFields(element, item, {"masters":this.resources});
	this.triggerAsync("afterFillRow", {"item":item, "no":no, "element":element});

}
