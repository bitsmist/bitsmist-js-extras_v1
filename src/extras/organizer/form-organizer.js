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
	//	Event handlers
	// -------------------------------------------------------------------------

	static FormOrganizer_onAfterTransform(sender, e, ex)
	{

		FormUtil.hideConditionalElements(this);

	}

	// -------------------------------------------------------------------------

	static FormOrganizer_onDoClear(sender, e, ex)
	{

		let target = BM.Util.safeGet(e.detail, "target", "");

		FormUtil.clearFields(this, {"target":target, "triggerEvent":"change"});

	}

	// -------------------------------------------------------------------------

	static DatabindingOrganizer_onAfterFetch(sender, e, ex)
	{

		this._items = e.detail.items;

	}

	// -------------------------------------------------------------------------

	static FormOrganizer_onDoCollect(sender, e, ex)
	{

		if (this.settings.get("form.settings.autoCollect"))
		{
			e.detail["items"] = FormOrganizer.__collectData(this);
		}

	}

	// -------------------------------------------------------------------------

	static FormOrganizer_onDoFill(sender, e, ex)
	{

		if (this.settings.get("form.settings.autoFill"))
		{
			let rootNode = ( e.detail && "rootNode" in e.detail ? this.querySelector(e.detail["rootNode"]) : this );

			FormUtil.setFields(rootNode, e.detail.items, {"masters":this.resources, "triggerEvent":true});
			FormUtil.showConditionalElements(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"form",
			"order":		310,
			"depends":		"ValidationOrganizer",
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add properties to component
		Object.defineProperty(component, 'cancelSubmit', {
			get() { return this._cancelSubmit; },
		})

		// Add methods to component
		component.build = function(...args) { return FormOrganizer._build(this, ...args); }
		component.submit = function(...args) { return FormOrganizer._submit(this, ...args); }

		// Init component vars
		component._cancelSubmit = false;

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterTransform", FormOrganizer.FormOrganizer_onAfterTransform);
		this._addOrganizerHandler(component, "doClear", FormOrganizer.FormOrganizer_onDoClear);
		this._addOrganizerHandler(component, "doFill", FormOrganizer.FormOrganizer_onDoFill);
		this._addOrganizerHandler(component, "doCollect", FormOrganizer.FormOrganizer_onDoCollect);

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
	 * Collect data from the form.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _collect(component, options)
	{

		return Promise.resolve().then(() => {
			return component.trigger("beforeCollect", options);
		}).then(() => {
			return component.trigger("doCollect", options);
		}).then(() => {
			return component.trigger("afterCollect", options);
		});

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

		return FormOrganizer._collect(component, options).then(() => {
			// Validate values
			if (component.settings.get("form.settings.autoValidate", true))
			{
				options["validatorName"] = component.settings.get("form.settings.validatorName");
				return component.validate(options).then(() => {
					if (!component.validationResult["result"])
					{
						component._cancelSubmit = true;
					}
				});
			}
		}).then(() => {
			// Submit values
			console.debug(`FormOrganizer._submit(): Submitting component. name=${component.name}, id=${component.id}`);
			return component.trigger("beforeSubmit", options).then(() => {
				if (!component._cancelSubmit)
				{
					return Promise.resolve().then(() => {
						return component.trigger("doSubmit", options);
					}).then(() => {
						console.debug(`FormOrganizer._submit(): Submitted component. name=${component.name}, id=${component.id}`);
						component.items = options["items"];
						return component.trigger("afterSubmit", options);
					});
				}
			});
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
