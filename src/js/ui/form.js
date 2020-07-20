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
//	Form class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function Form()
{

	let _this = Reflect.construct(Pad, [], this.constructor);

	_this._target;
	_this._item = {};
	_this.__isComposing = false;
	_this.__cancelSubmit = false;

	return _this;

}

BITSMIST.v1.LoaderUtil.inherit(Form, Pad);

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Data item.
 *
 * @type	{Object}
 */
Object.defineProperty(Form.prototype, 'item', {
	get()
	{
		return this._item;
	},
	set(value)
	{
		this._item = value;
	}
})

// -----------------------------------------------------------------------------

/**
 * Target.
 *
 * @type	{Object}
 */
Object.defineProperty(Form.prototype, 'target', {
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
 * Build form.
 *
 * @param	{Object}		items				Items to fill elements.
 *
 * @return  {Promise}		Promise.
 */
Form.prototype.build = function(items)
{

	Object.keys(items).forEach((key) => {
		FormUtil.buildFields(this._element, key, items[key]);
	});

}

// -----------------------------------------------------------------------------

/**
 * Fill the form.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Form.prototype.fill = function(options)
{

	return new Promise((resolve, reject) => {
		options = Object.assign({}, this._options, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		// Clear fields
		if (options["autoClear"])
		{
			this.clear();
		}

		Promise.resolve().then(() => {
			this.trigger("target", sender);
		}).then(() => {
			return this.trigger("beforeFetchItem", sender, {"target":this._target});
		}).then(() => {
			return this.trigger("fetchItem", sender);
		}).then(() => {
			return this.trigger("format", sender);
		}).then(() => {
			return this.trigger("beforeFill", sender);
		}).then(() => {
			FormUtil.setFields(this._element, this.item, this.app.masters);
			return this.trigger("fill", sender);
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Clear the form.
 *
 * @param	{Object}		options				Options.
 *
 * @param	{string}		target				Target.
 */
Form.prototype.clear = function(target)
{

	return FormUtil.clearFields(this._element, target);

}

// -----------------------------------------------------------------------------

/**
 * Validate.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Form.prototype.validate = function(options)
{

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );
		delete options["sender"];

		this.trigger("beforeValidate", sender).then(() => {
			let ret = true;
			let form = this._element.querySelector("form");

			if (this.getOption("autoValidate"))
			{
				if (form && form.reportValidity)
				{
					ret = form.reportValidity();
				}
				else
				{
					ret = FormUtil.reportValidity(this._element);
				}
			}

			if (!ret)
			{
				this.__cancelSubmit = true;
			}
			return this.trigger("validate", sender);
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Submit the form.
 *
 * @return  {Promise}		Promise.
 */
Form.prototype.submit = function(options)
{

	return new Promise((resolve, reject) => {
		options = Object.assign({}, options);
		let sender = ( options["sender"] ? options["sender"] : this );
		delete options["sender"];
		this.__cancelSubmit = false;
		this.item = this.getFields();

		this.trigger("formatSubmit", sender).then(() => {
			return this.validate();
		}).then(() => {
			return this.trigger("beforeSubmit", sender);
		}).then(() => {
			if (!this.__cancelSubmit)
			{
				return this.trigger("submit", sender, {"target":this._target, "items":[this.item]});
			}
		}).then(() => {
			resolve();
		});
	});

}

// -----------------------------------------------------------------------------

/**
 * Get the form values.
 *
 * @return  {array}			Form values.
 */
Form.prototype.getFields = function()
{

	return FormUtil.getFields(this._element);

}

