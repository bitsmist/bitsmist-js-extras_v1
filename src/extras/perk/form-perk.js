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
import ValueUtil from "../util/value-util.js";

// =============================================================================
//	Form Perk Class
// =============================================================================

export default class FormPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 *
	 * Build the element.
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
		component.inventory.set("form.cancelSubmit", false);

		return FormPerk._collect(component, options).then(() => {
			// Validate values
			if (component.settings.get("form.settings.autoValidate", true))
			{
				options["validatorName"] = options["validatorName"] || component.settings.get("form.settings.validatorName");
				return component.skills.use("validation.validate", options).then(() => {
					if (!component.stats.get("validation.validationResult.result"))
					{
						component.inventory.set("form.cancelSubmit", true);
					}
				});
			}
		}).then(() => {
			// Submit values
			console.debug(`FormPerk._submit(): Submitting component. name=${component.name}, id=${component.id}`);
			return component.skills.use("event.trigger", "beforeSubmit", options).then(() => {
				if (!component.inventory.get("form.cancelSubmit"))
				{
					return Promise.resolve().then(() => {
						return component.skills.use("event.trigger", "doSubmit", options);
					}).then(() => {
						console.debug(`FormPerk._submit(): Submitted component. name=${component.name}, id=${component.id}`);
						return component.skills.use("event.trigger", "afterSubmit", options);
					});
				}
			});
		});

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static FormPerk_onAfterTransform(sender, e, ex)
	{

		FormUtil.hideConditionalElements(this);

	}

	// -------------------------------------------------------------------------

	static FormPerk_onDoClear(sender, e, ex)
	{

		let target = BM.Util.safeGet(e.detail, "target", "");
		let options = Object.assign({"target":target, "triggerEvent":"change"}, e.detail.options);

		ValueUtil.clearFields(this, options);

	}

	// -------------------------------------------------------------------------

	static FormPerk_onBeforeFill(sender, e, ex)
	{

		e.detail.items = e.detail.items || this.inventory.get("form.lastItems");

	}

	// -------------------------------------------------------------------------

	static FormPerk_onDoFill(sender, e, ex)
	{

		if (this.settings.get("form.settings.autoFill", true))
		{
			let rootNode = ( e.detail && "rootNode" in e.detail ? this.querySelector(e.detail.rootNode) : this );
			ValueUtil.setFields(rootNode, e.detail.items, {"resources":this.inventory.get("resource.resources"), "triggerEvent":true});
			FormUtil.showConditionalElements(this, e.detail.items);
		}

		//this._lastItems = e.detail.items;
		this.inventory.set("form.lastItems", e.detail.items);

	}

	// -------------------------------------------------------------------------

	static FormPerk_onDoCollect(sender, e, ex)
	{

		if (this.settings.get("form.settings.autoCollect", true))
		{
			e.detail.items = ValueUtil.getFields(this);
		}

	}

	// -------------------------------------------------------------------------

	static FormPerk_onAfterCollect(sender, e, ex)
	{

		// Collect only submittable data
		if (this.settings.get("form.settings.autoCrop", true))
		{
			e.detail.items = FormPerk.__collectData(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "FormPerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"sections":		"form",
			"order":		310,
			"depends":		"ValidationPerk",
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"form",
			"order":		310,
			"depends":		"ValidationPerk",
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add skills to component;
		component.skills.set("form.build", function(...args) { return FormPerk._build(...args); });
		component.skills.set("form.submit", function(...args) { return FormPerk._submit(...args); });

		// Add inventory items to component
		component.inventory.set("form.cancelSubmit", false);
		component.inventory.set("form.lastItems", {});

		// Add event handlers to component
		this._addPerkHandler(component, "afterTransform", FormPerk.FormPerk_onAfterTransform);
		this._addPerkHandler(component, "doClear", FormPerk.FormPerk_onDoClear);
		this._addPerkHandler(component, "beforeFill", FormPerk.FormPerk_onBeforeFill);
		this._addPerkHandler(component, "doFill", FormPerk.FormPerk_onDoFill);
		this._addPerkHandler(component, "doCollect", FormPerk.FormPerk_onDoCollect);
		this._addPerkHandler(component, "afterCollect", FormPerk.FormPerk_onAfterCollect);

	}

	// -------------------------------------------------------------------------
	//  Protected
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
			return component.skills.use("event.trigger", "beforeCollect", options);
		}).then(() => {
			return component.skills.use("event.trigger", "doCollect", options);
		}).then(() => {
			return component.skills.use("event.trigger", "afterCollect", options);
		});

	}


	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Collect submittable data.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		items				Data to submit.
	 *
	 * @return  {Object}		Collected data.
	 */
	static __collectData(component, items)
	{

		let submitItem = {};

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
