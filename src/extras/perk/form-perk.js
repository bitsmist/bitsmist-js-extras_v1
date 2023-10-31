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

		if (this.get("setting", "form.options.autoClear", true))
		{
			let target = BM.Util.safeGet(e.detail, "target", "");
			let options = Object.assign({"target":target, "triggerEvent":"change"}, e.detail.options);

			ValueUtil.clearFields(this, options);
		}

	}

	// -------------------------------------------------------------------------

	static FormPerk_onBeforeFill(sender, e, ex)
	{

		if (e.detail.refill)
		{
			e.detail.items = this.get("vault", "form.lastItems");
		}

	}

	// -------------------------------------------------------------------------

	static FormPerk_onDoFill(sender, e, ex)
	{

		if (this.get("setting", "form.options.autoFill", true))
		{
			let rootNode = ( e.detail && "rootNode" in e.detail ? BM.Util.scopedSelectorAll(this, e.detail.rootNode)[0] : this );
			ValueUtil.setFields(rootNode, e.detail.items, {"resources":this.get("inventory", "resource.resources"), "triggerEvent":true});
			FormUtil.showConditionalElements(this, e.detail.items);
		}

		this.set("vault", "form.lastItems", e.detail.items);

	}

	// -------------------------------------------------------------------------

	static FormPerk_onDoCollect(sender, e, ex)
	{

		if (this.get("setting", "form.options.autoCollect", true))
		{
			e.detail.items = ValueUtil.getFields(this);
		}

	}

	// -------------------------------------------------------------------------

	static FormPerk_onAfterCollect(sender, e, ex)
	{

		// Collect only submittable data
		if (this.get("setting", "form.options.autoCrop", true))
		{
			e.detail.items = FormPerk.__collectData(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("skill", "form.build", function(...args) { return FormPerk._build(...args); });
		unit.upgrade("spell", "form.submit", function(...args) { return FormPerk._submit(...args); });
		unit.upgrade("state", "form.cancelSubmit", false);
		unit.upgrade("vault", "form.lastItems", {});
		unit.upgrade("event", "afterTransform", FormPerk.FormPerk_onAfterTransform, {"order":this.info["order"]});
		unit.upgrade("event", "doClear", FormPerk.FormPerk_onDoClear, {"order":this.info["order"]});
		unit.upgrade("event", "beforeFill", FormPerk.FormPerk_onBeforeFill, {"order":this.info["order"]});
		unit.upgrade("event", "doFill", FormPerk.FormPerk_onDoFill, {"order":this.info["order"]});
		unit.upgrade("event", "doCollect", FormPerk.FormPerk_onDoCollect, {"order":this.info["order"]});
		unit.upgrade("event", "afterCollect", FormPerk.FormPerk_onAfterCollect, {"order":this.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 *
	 * Build the element.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{HTMLElement}	element				HTMLElement to build.
	 * @param	{Object}		items				Items to fill elements.
	 * @param	{Object}		options				Options.
	 */
	static _build(unit, element, items, options)
	{

		FormUtil.build(element, items, options);

	}

	// -------------------------------------------------------------------------

	/**
	 * Submit the form.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _submit(unit, options)
	{

		options = options || {};
		unit.set("state", "form.cancelSubmit", false);

		return Promise.resolve().then(() => {
			// Collect values
			return FormPerk.__collect(unit, options);
		}).then(() => {
			// Validate values
			if (unit.get("setting", "form.options.autoValidate", true))
			{
				options["validatorName"] = options["validatorName"] || unit.get("setting", "form.options.validatorName");
				return unit.use("spell", "validation.validate", options).then(() => {
					if (!unit.get("state", "validation.validationResult.result"))
					{
						unit.set("state", "form.cancelSubmit", true);
					}
				});
			}
		}).then(() => {
			// Submit values
			console.debug(`FormPerk._submit(): Submitting unit. name=${unit.tagName}, id=${unit.id}`);
			return unit.use("spell", "event.trigger", "beforeSubmit", options).then(() => {
				if (!unit.get("state", "form.cancelSubmit"))
				{
					return Promise.resolve().then(() => {
						return unit.use("spell", "event.trigger", "doSubmit", options);
					}).then(() => {
						console.debug(`FormPerk._submit(): Submitted unit. name=${unit.tagName}, id=${unit.id}`);
						return unit.use("spell", "event.trigger", "afterSubmit", options);
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
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __collect(unit, options)
	{

		return Promise.resolve().then(() => {
			console.debug(`FormPerk.__collect(): Collecting data. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "beforeCollect", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "doCollect", options);
		}).then(() => {
			console.debug(`FormPerk.__collect(): Collected data. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
			return unit.use("spell", "event.trigger", "afterCollect", options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Collect submittable data.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		items				Data to submit.
	 *
	 * @return  {Object}		Collected data.
	 */
	static __collectData(unit, items)
	{

		let submitItem = {};

		// Collect values only from nodes that has [bm-submit] attribute.
		let nodes = BM.Util.scopedSelectorAll(unit, "[bm-submit]");
		nodes = Array.prototype.slice.call(nodes, 0);
		nodes.forEach((elem) => {
			let key = elem.getAttribute("bm-bind");
			submitItem[key] = items[key];
		});

		return submitItem;

	}

}
