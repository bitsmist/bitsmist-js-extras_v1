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
			"FormOrganizer":			{"settings":{"attach":true}},
		}
	});

	// super()
	return BITSMIST.v1.Component.prototype.start.call(this, settings);

}

// -----------------------------------------------------------------------------

/**
 * Change a template html.
 *
 * @param	{String}		templateName		Template name.
 * @param	{Object}		options				Options.
 *
 * @return  {Promise}		Promise.
 */
Form.prototype.switchTemplate = function(templateName, options)
{

	return BITSMIST.v1.Component.prototype.switchTemplate.call(this, templateName, options).then(() => {
		FormUtil.hideConditionalElements(this);
	});

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
Form.prototype.clear = function(options)
{

	let target = BITSMIST.v1.Util.safeGet(options, "target", "");

	return FormUtil.clearFields(this, target);

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

	let item = ("item" in options ? options["item"] : this._item);

	return Promise.resolve().then(() => {
		FormUtil.showConditionalElements(this, item);
		return this.trigger("beforeFill", options);
	}).then(() => {
		FormUtil.setFields(rootNode, item, {"masters":this.resources, "triggerEvent":"change"});

		return this.trigger("afterFill", options);
	});

}