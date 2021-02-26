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

	// super()
	let _this = Reflect.construct(BITSMIST.v1.Pad, [settings], this.constructor);

	_this._id;
	_this._parameters;
	_this._item = {};
	_this.__cancelSubmit = false;
	_this._target = {};

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

/**
 * Raw data retrieved via api.
 *
 * @type	{Object}
 */
Object.defineProperty(Form.prototype, 'data', {
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
 * Build form.
 *
 * @param	{Object}		items				Items to fill elements.
 *
 * @return  {Promise}		Promise.
 */
Form.prototype.build = function(items)
{

	Object.keys(items).forEach((key) => {
		FormUtil.buildFields(this, key, items[key]);
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

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	this._target["id"] = ( "id" in options ? options["id"] : this._target["id"] );
	this._target["parameters"] = ( "parameters" in options ? options["parameters"] : this._target["parameters"] );

	// Clear fields
	let autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this._settings.get("autoClear"));
	if (autoClear)
	{
		this.clear();
	}

	return Promise.resolve().then(() => {
		return this.trigger("doTarget", sender, {"target": this._target, "options":options});
	}).then(() => {
		return this.trigger("beforeFetch", sender, {"target": this._target, "options":options});
	}).then(() => {
		return this.trigger("doFetch", sender, {"target": this._target, "options":options});
	}).then(() => {
		return this.trigger("afterFetch", sender, {"target": this._target, "options":options});
	}).then(() => {
		return this.trigger("beforeFill", sender);
	}).then(() => {
		FormUtil.setFields(this, this._item, this.masters);
		return this.trigger("afterFill", sender);
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

	return FormUtil.clearFields(this, target);

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

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );

	return Promise.resolve().then(() => {
		return this.trigger("beforeValidate", sender);
	}).then(() => {
		let ret = true;
		let form = this.querySelector("form");

		if (this.settings.get("autoValidate"))
		{
			if (form && form.reportValidity)
			{
				ret = form.reportValidity();
			}
			else
			{
				ret = FormUtil.reportValidity(this);
			}
		}

		if (!ret)
		{
			this.__cancelSubmit = true;
		}
		return this.trigger("afterValidate", sender);
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

	options = Object.assign({}, options);
	let sender = ( options["sender"] ? options["sender"] : this );
	delete options["sender"];
	this.__cancelSubmit = false;
	this._item = this.getFields();

	return Promise.resolve().then(() => {
		return this.validate();
	}).then(() => {
		return this.trigger("beforeSubmit", sender);
	}).then(() => {
		if (!this.__cancelSubmit)
		{
			let items = this.settings.get("itemGetter", function(item){return [item]})(this._item);
			return this.trigger("doSubmit", sender, {"target":this._target, "items":items});
		}
	}).then(() => {
		let items = this.settings.get("itemGetter", function(item){return [item]})(this._item);
		return this.trigger("afterSubmit", sender, {"target":this._target, "items":items});
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

	return FormUtil.getFields(this);

}
