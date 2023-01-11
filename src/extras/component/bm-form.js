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
//  Settings
// -----------------------------------------------------------------------------

Form.prototype._getSettings = function(settings)
{

	return {
		"settings": {
			"autoClear":				true,
		},
		"organizers": {
			"FormOrganizer":			{"settings":{"attach":true}},
		},
		"events": {
			"this": {
				"handlers": {
					"beforeStart": 		[this.onBeforeStart],
					"afterTransform":	[this.onAfterTransform],
					"doClear": 			[this.onDoClear],
					"doFill": 			[this.onDoFill]
				}
			}
		},
	};

}

// -----------------------------------------------------------------------------
//  Setter/Getter
// -----------------------------------------------------------------------------

/**
 * Data item.
 *
 * @type	{Object}
 */
Object.defineProperty(Form.prototype, 'items', {
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
//  Event Handlers
// -----------------------------------------------------------------------------

/**
 * Before start event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
Form.prototype.onBeforeStart = function(sender, e, ex)
{

	this._items = {};

}

// -----------------------------------------------------------------------------

/**
 * After transform event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
Form.prototype.onAfterTransform = function(sender, e, ex)
{

	FormUtil.hideConditionalElements(this);

}

// -----------------------------------------------------------------------------

/**
 * Do clear event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
Form.prototype.onDoClear = function(sender, e, ex)
{

	let target = BITSMIST.v1.Util.safeGet(e.detail, "target", "");

	return FormUtil.clearFields(this, target);

}

// -----------------------------------------------------------------------------

/**
 * Do fill event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 * @param	{Object}		ex					Extra event info.
 */
Form.prototype.onDoFill = function(sender, e, ex)
{

	let rootNode = ( e.detail && "rootNode" in e.detail ? this.querySelector(e.detail["rootNode"]) : this );
	let items = BITSMIST.v1.Util.safeGet(e.detail, "items", this._items);

	FormUtil.setFields(rootNode, items, {"masters":this.resources, "triggerEvent":"change"});
	FormUtil.showConditionalElements(this, items);

}

// -----------------------------------------------------------------------------
//  Methods
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
