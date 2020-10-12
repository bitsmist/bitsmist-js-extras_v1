// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormUtil from '../util/form-util';
import Pad from './pad';

// =============================================================================
//	List class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function List(settings)
{

	let _this = Reflect.construct(Pad, [settings], this.constructor);

	_this._id;
	_this._parameters;
	_this._items;
	_this._data;
	_this._row;
	_this._rows;
	_this._listRootNode;

	// Set row's autoOpen option to true
	_this.settings.get("components")[_this.settings.get("row")]["autoOpen"] = true;

	// Init when template appended
	_this.addEventHandler(_this, "append", _this.__initListOnAppend);

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(List, Pad);

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

/**
 * Raw data retrieved via api.
 *
 * @type	{Object}
 */
Object.defineProperty(List.prototype, 'data', {
	get()
	{
		return this._data;
	},
	set(value)
	{
		this._data= value;
	}
})

// -----------------------------------------------------------------------------
//  Methods
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
 * Fill list with data.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.fill = function(options)
{

	console.debug(`List.fill(): Filling list. name=${this.name}`);

	return new Promise((resolve, reject) => {
		this._rows = [];
		options = Object.assign({}, this.settings.items, options);
		let fragment = document.createDocumentFragment();

		Promise.resolve().then(() => {
			return this.trigger("target", this);
		}).then(() => {
			this._id = ( options["id"] ? options["id"] : this._id );
			this._parameters = (options["parameters"] ? options["parameters"] : this._parameters );
			return this.trigger("beforeFetch", this, {"id":this._id, "parameters":this._parameters});
		}).then(() => {
			return this.trigger("fetch", this);
		}).then(() => {
			return this.trigger("beforeFill", this);
		}).then(() => {
			if (this.items)
			{
				if (this.settings.get("async"))
				{
					return this._buildAsync(fragment);
				}
				else
				{
					this._buildSync(fragment);
				}
			}
		}).then(() => {
			if (options["autoClear"])
			{
				this.clear();
			}
		}).then(() => {
			this._listRootNode.appendChild(fragment);
		}).then(() => {
			return this.trigger("fill", this);
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Build rows synchronously.
 *
 * @param	{DocumentFragment}	fragment		Document fragment.
 */
List.prototype._buildSync = function(fragment)
{

	for (let i = 0; i < this.items.length; i++)
	{
		this.__appendRowSync(fragment, i);
	}

}

// -----------------------------------------------------------------------------

/**
 * Build rows asynchronously.
 *
 * @param	{DocumentFragment}	fragment		Document fragment.
 *
 * @return  {Promise}		Promise.
 */
List.prototype._buildAsync = function(fragment)
{

	let chain = Promise.resolve();

	for (let i = 0; i < this.items.length; i++)
	{
		chain = chain.then(() => {
			return this.__appendRowAsync(fragment, i);
		});
	}

	return chain;

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Init after template appended.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 */
List.prototype.__initListOnAppend = function(sender, e)
{

	this._row = this._components[this._settings.get("row")];
	if (!this._row)
	{
		throw new ReferenceError(`Row component does not exist. name=${this.name}, row=${this._settings.get("row")}`);
	}

	this._listRootNode = this._element.querySelector(this._settings.get("listRootNode"));

}

// -----------------------------------------------------------------------------

/**
 * Append a new row asynchronously.
 *
 * @param	{HTMLElement}	rootNode				Root node to append a row.
 * @param	{integer}		no						Line no.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.__appendRowAsync = function(rootNode, no)
{

	return new Promise((resolve, reject) => {
		// Append a row
		let element = this._row.clone();
		rootNode.appendChild(element);

		this._rows.push(element);

		// set row click event handler
		let clickHandler = this._row.getEventHandler(this._row.settings.get("events.click"));
		if (clickHandler)
		{
			this._row.addEventHandler(element, "click", clickHandler, {"item":this.items[no], "no":no, "element":element});
		}

		// set row elements click event handler
		Object.keys(this._row.settings.get("elements")).forEach((elementName) => {
			this._row.setHtmlEventHandlers(elementName, {"item":this.items[no], "no":no, "element":element}, element);
		});

		// Call event handlers
		let chain = Promise.resolve();
		chain = chain.then(() => {
			return this._row.trigger("formatRow", this, {"item":this.items[no], "no":no, "element":element});
		}).then(() => {
			return this._row.trigger("beforeFillRow", this, {"item":this.items[no], "no":no, "element":element});
		}).then(() => {
			// Fill fields
			FormUtil.setFields(element, this.items[no], this.app.masters);
		}).then(() => {
			return this._row.trigger("fillRow", this, {"item":this.items[no], "no":no, "element":element});
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Append a new row synchronously.
 *
 * @param	{HTMLElement}	rootNode				Root node to append a row.
 * @param	{integer}		no						Line no.
 */
List.prototype.__appendRowSync = function(rootNode, no)
{

	// Append a row
	let element = this._row.clone();
	rootNode.appendChild(element);

	this._rows.push(element);

	// set row click event handler
	let clickHandler = this._row.getEventHandler(this._row.settings.get("events.click"));
	if (clickHandler)
	{
		this._row.addEventHandler(element, "click", clickHandler, {"item":this.items[no], "no":no, "element":element});
	}

	// set row elements click event handler
	Object.keys(this._row.settings.get("elements")).forEach((elementName) => {
		this._row.setHtmlEventHandlers(elementName, {"item":this.items[no], "no":no, "element":element}, element);
	});

	// Call event handlers
	this._row.trigger("formatRow", this, {"item":this.items[no], "no":no, "element":element});
	this._row.trigger("beforeFillRow", this, {"item":this.items[no], "no":no, "element":element});
	FormUtil.setFields(element, this.items[no], this.app.masters);
	this.row.trigger("fillRow", this, {"item":this.items[no], "no":no, "element":element});

}
