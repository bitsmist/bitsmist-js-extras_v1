// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import FormUtil from '../util/form-util';

// =============================================================================
//	Form class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 */
export default function Form(settings)
{

	let _this = Reflect.construct(BITSMIST.v1.Pad, [settings], this.constructor);

	_this._id;
	_this._parameters;
	_this._item = {};
	_this.__cancelSubmit = false;

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(Form, BITSMIST.v1.Pad);

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
		options = Object.assign({}, this.settings.items, options);
		let sender = ( options["sender"] ? options["sender"] : this );

		// Clear fields
		if (options["autoClear"])
		{
			this.clear();
		}

		Promise.resolve().then(() => {
			return this.trigger("target", sender);
		}).then(() => {
			this._id = ( options["id"] ? options["id"] : this._id );
			this._parameters = (options["parameters"] ? options["parameters"] : this._parameters );
			return this.trigger("beforeFetch", sender, {"id":this._id, "parameters":this._parameters, "options":options});
		}).then(() => {
			return this.trigger("fetch", sender);
		}).then(() => {
			return this.trigger("format", sender);
		}).then(() => {
			return this.trigger("beforeFill", sender);
		}).then(() => {
			FormUtil.setFields(this._element, this.item, this.masters);
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

			if (this.settings.get("autoValidate"))
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
				let items = this.settings.get("itemGetter", function(item){return [item]})(this.item);
				return this.trigger("submit", sender, {"id":this._id, "parameters":this._parameters, "items":items});
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
