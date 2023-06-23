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
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"form",
			"order":		310,
			"depends":		"ValidationPerk",
		};

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

		if (this.get("settings", "form.options.autoClear", true))
		{
			let target = BM.Util.safeGet(e.detail, "target", "");
			let options = Object.assign({"target":target, "triggerEvent":"change"}, e.detail.options);

			ValueUtil.clearFields(this, options);
		}

	}

	// -------------------------------------------------------------------------

	static FormPerk_onBeforeFill(sender, e, ex)
	{

		e.detail.items = e.detail.items || this.get("vault", "form.lastItems");

	}

	// -------------------------------------------------------------------------

	static FormPerk_onDoFill(sender, e, ex)
	{

		if (this.get("settings", "form.options.autoFill", true))
		{
			let rootNode = ( e.detail && "rootNode" in e.detail ? BM.Util.scopedSelectorAll(this._root, e.detail.rootNode)[0] : this );
			ValueUtil.setFields(rootNode, e.detail.items, {"resources":this.get("inventory", "resource.resources"), "triggerEvent":true});
			FormUtil.showConditionalElements(this, e.detail.items);
		}

		this.set("vault", "form.lastItems", e.detail.items);

	}

	// -------------------------------------------------------------------------

	static FormPerk_onDoCollect(sender, e, ex)
	{

		if (this.get("settings", "form.options.autoCollect", true))
		{
			e.detail.items = ValueUtil.getFields(this);
		}

	}

	// -------------------------------------------------------------------------

	static FormPerk_onAfterCollect(sender, e, ex)
	{

		// Collect only submittable data
		if (this.get("settings", "form.options.autoCrop", true))
		{
			e.detail.items = FormPerk.__collectData(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "skill", "form.build", function(...args) { return FormPerk._build(...args); });
		this.upgrade(component, "skill", "form.submit", function(...args) { return FormPerk._submit(...args); });
		this.upgrade(component, "stats", "form.cancelSubmit", false);
		this.upgrade(component, "vault", "form.lastItems", {});
		this.upgrade(component, "event", "afterTransform", FormPerk.FormPerk_onAfterTransform);
		this.upgrade(component, "event", "doClear", FormPerk.FormPerk_onDoClear);
		this.upgrade(component, "event", "beforeFill", FormPerk.FormPerk_onBeforeFill);
		this.upgrade(component, "event", "doFill", FormPerk.FormPerk_onDoFill);
		this.upgrade(component, "event", "doCollect", FormPerk.FormPerk_onDoCollect);
		this.upgrade(component, "event", "afterCollect", FormPerk.FormPerk_onAfterCollect);

	}

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
		component.set("stats", "form.cancelSubmit", false);

		return FormPerk.__collect(component, options).then(() => {
			// Validate values
			if (component.get("settings", "form.options.autoValidate", true))
			{
				options["validatorName"] = options["validatorName"] || component.get("settings", "form.options.validatorName");
				return component.use("skill", "validation.validate", options).then(() => {
					if (!component.get("stats", "validation.validationResult.result"))
					{
						component.set("stats", "form.cancelSubmit", true);
					}
				});
			}
		}).then(() => {
			// Submit values
			console.debug(`FormPerk._submit(): Submitting component. name=${component.tagName}, id=${component.id}`);
			return component.use("skill", "event.trigger", "beforeSubmit", options).then(() => {
				if (!component.get("stats", "form.cancelSubmit"))
				{
					return Promise.resolve().then(() => {
						return component.use("skill", "event.trigger", "doSubmit", options);
					}).then(() => {
						console.debug(`FormPerk._submit(): Submitted component. name=${component.tagName}, id=${component.id}`);
						return component.use("skill", "event.trigger", "afterSubmit", options);
					});
				}
			});
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Collect data from the form.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __collect(component, options)
	{

		return Promise.resolve().then(() => {
			return component.use("skill", "event.trigger", "beforeCollect", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doCollect", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "afterCollect", options);
		});

	}

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
		let nodes = BM.Util.scopedSelectorAll(component._root, "[bm-submit]");
		nodes = Array.prototype.slice.call(nodes, 0);
		nodes.forEach((elem) => {
			let key = elem.getAttribute("bm-bind");
			submitItem[key] = items[key];
		});

		return submitItem;

	}

}
