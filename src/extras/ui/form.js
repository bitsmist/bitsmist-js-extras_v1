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

	return Reflect.construct(BITSMIST.v1.Pad, [settings], this.constructor);

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
 * Start component.
 *
 * @param	{Object}		settings			Settings.
 *
 * @return  {Promise}		Promise.
 */
Form.prototype.start = function(settings)
{

	// Init vars
	this._id;
	this._parameters;
	this._item = {};
	this.__cancelSubmit = false;
	this._target = {};

	// Init component settings
	settings = Object.assign({}, settings, {
		"settings": {
			"autoClear": true,
		}
	});

	// super()
	return BITSMIST.v1.Pad.prototype.start.call(this, settings);

}

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
	let rootNode = ( "target" in options ? this.querySelector(options["target"]) : this );

	this._target["id"] = ( "id" in options ? options["id"] : this._target["id"] );
	this._target["parameters"] = ( "parameters" in options ? options["parameters"] : this._target["parameters"] );

	// Clear fields
	let autoClear = BITSMIST.v1.Util.safeGet(options, "settings.autoClear", this._settings.get("settings.autoClear"));
	if (autoClear)
	{
		this.clear(rootNode);
	}

	return Promise.resolve().then(() => {
		if (BITSMIST.v1.Util.safeGet(options, "autoLoad", true))
		{
			return Promise.resolve().then(() => {
				return this.trigger("doTarget", sender, {"target": this._target, "options":options});
			}).then(() => {
				return this.trigger("beforeFetch", sender, {"target": this._target, "options":options});
			}).then(() => {
				return this.trigger("doFetch", sender, {"target": this._target, "options":options});
			}).then(() => {
				return this.trigger("afterFetch", sender, {"target": this._target, "options":options});
			});
		}
	}).then(() => {
		return this.trigger("beforeFill", sender);
	}).then(() => {
		FormUtil.setFields(rootNode, this._item, this.masters);
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
Form.prototype.clear = function(rootNode, target)
{

	rootNode = ( rootNode ? rootNode : this );

	return FormUtil.clearFields(rootNode, target);

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

		let autoValidate = BITSMIST.v1.Util.safeGet(options, "autoValidate", this._settings.get("settings.autoValidate"));
		if (autoValidate)
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
	let itemGetter = BITSMIST.v1.Util.safeGet(options, "itemGetter", this.settings.get("settings.itemGetter", function(item){return [item]}));

	return Promise.resolve().then(() => {
		return this.validate();
	}).then(() => {
		return this.trigger("beforeSubmit", sender);
	}).then(() => {
		if (!this.__cancelSubmit)
		{
			let items = itemGetter(this._item);
			return this.trigger("doSubmit", sender, {"target":this._target, "items":items});
		}
	}).then(() => {
		let items = itemGetter(this._item);
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
