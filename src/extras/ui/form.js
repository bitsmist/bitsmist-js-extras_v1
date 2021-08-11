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
	this._item;
	this.__cancelSubmit = false;

	// Init component settings
	settings = Object.assign({}, settings, {
		"settings": {
			"autoClear": true,
		},
	});

	// super()
	return BITSMIST.v1.Pad.prototype.start.call(this, settings);

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
	let rootNode = ( "rootNode" in options ? this.querySelector(options["rootNode"]) : this );

	// Clear fields
	let autoClear = BITSMIST.v1.Util.safeGet(options, "settings.autoClear", this._settings.get("settings.autoClear"));
	if (autoClear)
	{
		this.clear(rootNode);
	}

	return Promise.resolve().then(() => {
		return this.trigger("doTarget", sender, {"options":options});
	}).then(() => {
		return this.trigger("beforeFetch", sender, {"options":options});
	}).then(() => {
		let autoFetch = BITSMIST.v1.Util.safeGet(options, "autoFetch", this._settings.get("settings.autoFetch"));
		if (autoFetch)
		{
			return this.callOrganizers("doFetch", options);
		}
		else
		{
			return this.trigger("doFetch", sender, {"options":options});
		}
	}).then(() => {
		return this.trigger("afterFetch", sender, {"options":options});
	 }).then(() => {
		let resourceName = this.settings.get("settings.resourceName");
		if (resourceName && this.resources && this.resources[resourceName])
		{
			this._item = this.resources[resourceName]._item;
		}
	}).then(() => {
		return this.trigger("beforeFill", sender, {"options":options});
	}).then(() => {
		if (this._item)
		{
			FormUtil.setFields(rootNode, this._item, {"masters":this.resources, "triggerEvent":"change"});
		}

		return this.trigger("afterFill", sender, {"options":options});
	});

}

// -----------------------------------------------------------------------------

/**
 * Clear the form.
 *
 * @param	{Object}		options				Options.
 */
Form.prototype.clear = function(rootNode)
{

	rootNode = ( rootNode ? rootNode : this );

	return FormUtil.clearFields(rootNode);

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
	let invalids;

	return Promise.resolve().then(() => {
		return this.trigger("beforeValidate", sender);
	}).then(() => {
		let autoValidate = BITSMIST.v1.Util.safeGet(options, "autoValidate", this._settings.get("settings.autoValidate"));
		if (autoValidate)
		{
			invalids = FormUtil.checkValidity(this);
			if (invalids.length > 0)
			{
				this.__cancelSubmit = true;
			}
		}
		else
		{
			return this.trigger("doValidate", sender);
		}
	}).then(() => {
		return this.trigger("afterValidate", sender, {"invalids":invalids});
	}).then(() => {
		let autoReportValidity = BITSMIST.v1.Util.safeGet(options, "autoReportValidity", this._settings.get("settings.autoReportValidity"));
		if (autoReportValidity)
		{
			let form = this.querySelector("form");
			if (form && form.reportValidity)
			{
				form.reportValidity();
			}
		}
		else
		{
			return this.trigger("doReportValidate", sender, {"invalids":invalids});
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
	let sender = ( options["sender"] ? options["sender"] : this );
	this.__cancelSubmit = false;

	// Get values from the form
	this._item = FormUtil.getFields(this);

	return Promise.resolve().then(() => {
		return this.validate(options);
	}).then(() => {
		if (!this.__cancelSubmit)
		{
			return Promise.resolve().then(() => {
				return this.trigger("beforeSubmit", sender, {"item":this._item});
			}).then(() => {
				let autoSubmit = BITSMIST.v1.Util.safeGet(options, "autoSubmit", this._settings.get("settings.autoSubmit"));
				if (autoSubmit)
				{
					return this.callOrganizers("doSubmit", options);
				}
				else
				{
					return this.trigger("doSubmit", sender, {"item":this._item});
				}
			}).then(() => {
				return this.trigger("afterSubmit", sender, {"item":this._item});
			});
		}
	});

}
