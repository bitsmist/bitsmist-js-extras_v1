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

	return Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

}

BITSMIST.v1.ClassUtil.inherit(Form, BITSMIST.v1.Component);

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
 * Flag wheter to cancel submit.
 *
 * @type	{Object}
 */
Object.defineProperty(Form.prototype, 'cancelSubmit', {
	get()
	{
		return this._cancelSubmit;
	},
	set(value)
	{
		this._cancelSubmit = value;
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
	this._item = {};
	this._cancelSubmit = false;

	// Init component settings
	settings = Object.assign({}, settings, {
		"settings": {
			"autoClear":				true,
		},
		"organizers": {
			"ValidationOrganizer":		{"settings":{"attach":true}},
		}
	});

	// super()
	return BITSMIST.v1.Component.prototype.start.call(this, settings);

}

// -----------------------------------------------------------------------------

/**
 * Build a element.
 *
 * @param	{HTMLElement}	element				HTMLElement to build.
 * @param	{Object}		items				Items to fill elements.
 * @param	{Object}		options				Options.
 */
Form.prototype.build = function(element, items, options)
{

	FormUtil.build(element, items, options);

}

// -----------------------------------------------------------------------------

/**
 * Clear the form.
 *
 * @param	{String}		target				Target selector.
 */
Form.prototype.clear = function(target)
{

	return FormUtil.clearFields(this, target);

}

// -----------------------------------------------------------------------------

/**
 * Fetch data.
 *
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Form.prototype.fetch = function(options)
{

	return BITSMIST.v1.Component.prototype.fetch.call(this, options).then(() => {
		let resourceName = this.settings.get("settings.resourceName");
		if (resourceName && this.resources && this.resources[resourceName])
		{
			this._item = this.resources[resourceName]._item;
		}
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
	let rootNode = ( "rootNode" in options ? this.querySelector(options["rootNode"]) : this );

	// Clear fields
	let autoClear = BITSMIST.v1.Util.safeGet(options, "autoClear", this.settings.get("settings.autoClear"));
	if (autoClear)
	{
		this.clear();
	}

	return Promise.resolve().then(() => {
		return this.trigger("beforeFill", options);
	}).then(() => {
		FormUtil.setFields(rootNode, this._item, {"masters":this.resources, "triggerEvent":"change"});

		return this.trigger("afterFill", options);
	});

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
	this.validationResult["result"] = true;

	return Promise.resolve().then(() => {
		return this.trigger("beforeValidate");
	}).then(() => {
		return this.callOrganizers("doCheckValidity", {"item":this._item, "validationName":this.settings.get("settings.validationName")});
	}).then(() => {
		return this.trigger("doValidate");
	}).then(() => {
		return this.trigger("afterValidate");
	}).then(() => {
		if (!this.validationResult["result"])
		{
			this._cancelSubmit = true;

			return Promise.resolve().then(() => {
				return this.callOrganizers("doReportValidity", {"validationName":this.settings.get("settings.validationName")});
			}).then(() => {
				return this.trigger("doReportValidatidy");
			});
		}
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
	this._cancelSubmit = false;

	// Get values from the form
	this._item = FormUtil.getFields(this);

	return Promise.resolve().then(() => {
		return this.validate(options);
	}).then(() => {
		if (!this._cancelSubmit)
		{
			return Promise.resolve().then(() => {
				return this.trigger("beforeSubmit", {"item":this._item});
			}).then(() => {
				return this.callOrganizers("doSubmit", options);
			}).then(() => {
				return this.trigger("doSubmit", {"item":this._item});
			}).then(() => {
				return this.trigger("afterSubmit", {"item":this._item});
			});
		}
	});

}
