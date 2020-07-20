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

	_this._target;
	_this._items;
	_this._data;
	_this._row;
	_this._rows;

	// Init system event handlers
	_this.addEventHandler(_this, "append", _this.__initListOnAppend);

	return _this;

}

BITSMIST.v1.LoaderUtil.inherit(List, Pad);

// -----------------------------------------------------------------------------
//  Setter/Getter
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

/**
 * Target.
 *
 * @type	{Object}
 */
Object.defineProperty(List.prototype, 'target', {
	get()
	{
		return this._target;
	},
	set(value)
	{
		this._target = value;
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

	while (this.row._element.firstChild)
	{
		this.row._element.removeChild(this.row._element.firstChild);
	}

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
		this.rows = [];
		options = Object.assign({}, this._options, options);

		Promise.resolve().then(() => {
			return this.trigger("target", this);
		}).then(() => {
			if (options["target"])
			{
				this._target = options["target"];
			}
			return this.trigger("beforeFetchList", this, {"target":this._target});
		}).then(() => {
			return this.trigger("fetchList", this);
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
					this.row._element.appendChild(fragment, options["masters"]);
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
 * Init after clone completed.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 */
List.prototype.__initListOnAppend = function(sender, e)
{

	this.row = this._components[this.getOption("row")];
	this.row._element = this._element.querySelector(this.row.getOption("listRootNode"));

}

// -----------------------------------------------------------------------------

/**
 * Init after filling completed.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 */
List.prototype.__initListOnFill = function(sender, e)
{

	// Set HTML elements' event handlers after filling completed
	Object.keys(this.row._options["elements"]).forEach((elementName) => {
		this.row._initHtmlEvents(elementName);
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
		// Append row
		let element = this.row._dupElement();
		rootNode.appendChild(element);
		this.rows.push(element);
		let i = this.rows.length - 1;

		// Set click event handler
		if (this.row._options["events"]["click"])
		{
			this.row.addEventHandler(element, "click", this.row._options["events"]["click"]["handler"], {"element":element});
		}

		// Call event handlers
		let chain = Promise.resolve();
		chain = chain.then(() => {
			return this.row.trigger("formatRow", this, {"item":this.items[i], "no":i, "element":element});
		}).then(() => {
			return this.row.trigger("beforeFillRow", this, {"item":this.items[i], "no":i, "element":element});
		}).then(() => {
			// Fill fields
			FormUtil.setFields(element, this.items[i], this.app.masters);
			return this.row.trigger("fillRow", this, {"item":this.items[i], "no":i, "element":element});
		}).then(() => {
			resolve();
		});
	});

}
