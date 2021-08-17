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
Object.defineProperty(List.prototype, 'row', {
	get()
	{
		return this._row;
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
//  Event handlers
// -----------------------------------------------------------------------------

/**
 * After append event hadler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
List.prototype.onListAfterAppend = function(sender, e, ex)
{

	this._listRootNode = this.querySelector(this._settings.get("settings.listRootNode"));
	let className = ( this._settings.get("components")[this._settings.get("settings.row")]["className"] ? this._settings.get("components")[this._settings.get("row")]["className"] : this._settings.get("settings.row"))
	this._row = BITSMIST.v1.ClassUtil.createObject(className);
	this._row._parent = this;

	return this._row.start();

}

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
	this._listRootNode;
	this._row;
	this._rows;

	// Init component settings
	settings = Object.assign({}, settings, {
		"settings": {
			"autoClear": true,
		},
		"events": {
			"this": {
				"handlers": {
					"afterAppend": [{
						"handler": this.onListAfterAppend
					}]
				}
			}
		}
	});

	// super()
	return BITSMIST.v1.Pad.prototype.start.call(this, settings);

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
 * @return  {Promise}		Promise.
 */
List.prototype.fill = function(options)
{

	console.debug(`List.fill(): Filling list. name=${this.name}`);

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	let rowAsync = BITSMIST.v1.Util.safeGet(options, "async", this._settings.get("settings.async", true));
	let builder = ( rowAsync ? this._buildAsync : this._buildSync );
	let fragment = document.createDocumentFragment();

	this._rows = [];

	return Promise.resolve().then(() => {
		return this.trigger("beforeFill", sender, {"options":options});
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
		return this.trigger("afterFill", sender, {"options":options});
	});

}

// -----------------------------------------------------------------------------
//  Protected
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
	let rowEvents = this._row.settings.get("rowevents");
	let template = this._row._templates[this._row.settings.get("settings.templateName")].html;

	for (let i = 0; i < items.length; i++)
	{
		chain = chain.then(() => {
			return this.__appendRowSync(fragment, i, items[i], template, rowEvents);
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

	let rowEvents = this._row.settings.get("rowevents");
	let template = this._row._templates[this._row.settings.get("settings.templateName")].html;

	for (let i = 0; i < items.length; i++)
	{
		this.__appendRowAsync(fragment, i, items[i], template, rowEvents);
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
 * @param	{Object}		clickHandler			Row's click handler info.
 * @param	{Object}		eventElements			Elements' event info.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.__appendRowSync = function(rootNode, no, item, template, rowEvents)
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
			this._row.initEvents(elementName, rowEvents[elementName], element);
		});
	}

	// Call event handlers
	return Promise.resolve().then(() => {
		return this._row.trigger("beforeFillRow", this, {"item":item, "no":no, "element":element});
	}).then(() => {
		// Fill fields
		FormUtil.setFields(element, item, {"masters":this.resources});
	}).then(() => {
		return this._row.trigger("afterFillRow", this, {"item":item, "no":no, "element":element});
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
 * @param	{Object}		clickHandler			Row's click handler info.
 * @param	{Object}		eventElements			Elements' event info.
 */
List.prototype.__appendRowAsync = function(rootNode, no, item, template, rowEvents)
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
			this._row.initEvents(elementName, rowEvents[elementName], element);
		});
	}

	// Call event handlers
	this._row.triggerAsync("beforeFillRow", this, {"item":item, "no":no, "element":element});
	FormUtil.setFields(element, item, {"masters":this.resources});
	this.row.triggerAsync("afterFillRow", this, {"item":item, "no":no, "element":element});

}
