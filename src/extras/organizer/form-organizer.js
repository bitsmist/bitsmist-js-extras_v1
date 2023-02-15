// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import BM from "../bm";
import FormUtil from "../util/form-util.js";

// =============================================================================
//	Form Organizer Class
// =============================================================================

export default class FormOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "FormOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"forms",
			"order":		310,
			"depends":		"ValidationOrganizer",
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add properties to component
		Object.defineProperty(component, 'items', {
			get()		{ return this._items; },
			set(value)	{ this._items = value; },
		});
		Object.defineProperty(component, 'cancelSubmit', {
			get() { return this._cancelSubmit; },
		})

		// Add methods to component
		component.build = function(...args) { return FormOrganizer._build(this, ...args); }
		component.submit = function(...args) { return FormOrganizer._submit(this, ...args); }

		// Init component vars
		component._items = {};
		component._cancelSubmit = false;

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterTransform", FormOrganizer.onAfterTransform);
		this._addOrganizerHandler(component, "doClear", FormOrganizer.onDoClear);
		this._addOrganizerHandler(component, "doFill", FormOrganizer.onDoFill);
//		this._addOrganizerHandler(component, "doCollect", FormOrganizer.onDoCollect);

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static onAfterTransform(sender, e, ex)
	{

		FormUtil.hideConditionalElements(this);

	}

	// -------------------------------------------------------------------------

	static onDoClear(sender, e, ex)
	{

		let target = BM.Util.safeGet(e.detail, "target", "");

		return FormUtil.clearFields(this, target);

	}

	// -------------------------------------------------------------------------

	static onDoFill(sender, e, ex)
	{

		let rootNode = ( e.detail && "rootNode" in e.detail ? this.querySelector(e.detail["rootNode"]) : this );
		let items = BM.Util.safeGet(e.detail, "items", this._items);

		FormUtil.setFields(rootNode, items, {"masters":this.resources, "triggerEvent":"change"});
		FormUtil.showConditionalElements(this, items);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	*
	* Build a element.
	*
    * @param	{Component}		component			Component.
	* @param	{HTMLElement}	element				HTMLElement to build.
	* @param	{Object}		items				Items to fill elements.
	* @param	{Object}		options				Options.
	*/
	static _build(component, element, items, options)
	{

		FormUtil.build(element, items, options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Submit the form.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _submit(component, options)
	{

		options = options || {};
		component._cancelSubmit = false;

		return Promise.resolve().then(() => {
			// Collect values
			if (component.settings.get("forms.settings.autoCollect", false))
			{
				options["items"] = FormOrganizer.__collectData(component);
			}
		}).then(() => {
			// Validate values
			if (component.settings.get("forms.settings.autoValidate"))
			{
				return component.validate(options).then(() => {
					if (!component.validationResult["result"])
					{
						component._cancelSubmit = true;
					}
				});
			}
		}).then(() => {
			// Submit values
			if (!component._cancelSubmit)
			{
				return Promise.resolve().then(() => {
					return component.trigger("beforeSubmit", options);
				}).then(() => {
					return component.trigger("doSubmit", options);
				}).then(() => {
					component.items = options["items"];
					return component.trigger("afterSubmit", options);
				});
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Colled data from form.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Object}		Collected data.
	 */
	static __collectData(component, options)
	{

		let submitItem = {};
		let items = FormUtil.getFields(component);

		// Collect values only from nodes that has [bm-submit] attribute.
		let nodes = component.querySelectorAll("[bm-submit]");
		nodes = Array.prototype.slice.call(nodes, 0);
		nodes.forEach((elem) => {
			let key = elem.getAttribute("bm-bind");
			submitItem[key] = items[key];
		});

		return submitItem;

	}

}
