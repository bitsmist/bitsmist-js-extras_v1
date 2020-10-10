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
export default function List()
{

	let _this = Reflect.construct(Pad, [], this.constructor);

	_this._id;
	_this._parameters;
	_this._items;
	_this._data;
	_this._row;
	_this._rows;
	_this._listRootNode;

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
			let chain = Promise.resolve();
			if (this.items)
			{
				let fragment = document.createDocumentFragment();
				for (let i = 0; i < this.items.length; i++)
				{
					chain = chain.then(() => {
						return this.__appendRow(fragment);
					});
				}
				chain.then(() => {
					if (options["autoClear"])
					{
						this.clear();
					}
					this._listRootNode.appendChild(fragment, options["masters"]);
				});
			}
			return chain;
		}).then(() => {
			return this.trigger("fill", this);
		}).then(() => {
			this.__initListOnFill();
		}).then(() => {
			resolve();
		});
	});

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
	this._row._element = this._listRootNode;

}

// -----------------------------------------------------------------------------

/**
 * Init after filling completed.
 */
List.prototype.__initListOnFill = function()
{

	// Set HTML elements' event handlers after filling completed
	Object.keys(this._row.settings.get("elements")).forEach((elementName) => {
		this._row.setHtmlEventHandlers(elementName);
	});

}

// -----------------------------------------------------------------------------

/**
 * Append a new row.
 *
 * @param	{HTMLElement}	rootNode				Root node to append a row.
 *
 * @return  {Promise}		Promise.
 */
List.prototype.__appendRow = function(rootNode, masters)
{

	return new Promise((resolve, reject) => {
		let element = this._row.clone();

		this._rows.push(element);
		let i = this._rows.length - 1;

		// Call event handlers
		let chain = Promise.resolve();
		chain = chain.then(() => {
			return this._row.trigger("formatRow", this, {"item":this.items[i], "no":i, "element":element});
		}).then(() => {
			return this._row.trigger("beforeFillRow", this, {"item":this.items[i], "no":i, "element":element});
		}).then(() => {
			// Fill fields
			FormUtil.setFields(element, this.items[i], this.app.masters);
			return this._row.trigger("fillRow", this, {"item":this.items[i], "no":i, "element":element});
		}).then(() => {
			rootNode.appendChild(element);
		}).then(() => {
			// set row click event handler
			let clickHandler = this._row.getEventHandler(this._row.settings.get("events.click"));
			if (clickHandler)
			{
				this._row.addEventHandler(element, "click", clickHandler, {"item":this.items[i], "no":i, "element":element});
			}
		}).then(() => {
			resolve();
		});
	});

}
