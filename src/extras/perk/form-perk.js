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
import ValueUtil from "../util/value-util.js";
import {Perk, Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	Form Perk Class
// =============================================================================

export default class FormPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"form",
		"order":			310,
		"depends":			"ValidationPerk",
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return FormPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		FormPerk.#__vault.set(unit, {
			"lastItems":	{},
		});

		// Upgrade unit
		unit.upgrade("inventory", "form.cancelSubmit", false);
		unit.upgrade("skill", "form.build", FormPerk.#_build);
		unit.upgrade("spell", "form.submit", FormPerk.#_submit);

		// Add event handlers
		unit.use("event.add", "afterTransform", {"handler":FormPerk.#FormPerk_onAfterTransform, "order":FormPerk.info["order"]});
		unit.use("event.add", "doClear", {"handler":FormPerk.#FormPerk_onDoClear, "order":FormPerk.info["order"]});
		unit.use("event.add", "beforeFill", {"handler":FormPerk.#FormPerk_onBeforeFill, "order":FormPerk.info["order"]});
		unit.use("event.add", "doFill", {"handler":FormPerk.#FormPerk_onDoFill, "order":FormPerk.info["order"]});
		unit.use("event.add", "doCollect", {"handler":FormPerk.#FormPerk_onDoCollect, "order":FormPerk.info["order"]});
		unit.use("event.add", "afterCollect", {"handler":FormPerk.#FormPerk_onAfterCollect, "order":FormPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #FormPerk_onAfterTransform(sender, e, ex)
	{

		FormUtil.hideConditionalElements(this);

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onDoClear(sender, e, ex)
	{

		if (this.get("setting", "form.options.autoClear", true))
		{
			let target = Util.safeGet(e.detail, "target", "");
			let options = Object.assign({"target":target, "triggerEvent":"change"}, e.detail.options);

			ValueUtil.clearFields(this, options);
		}

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onBeforeFill(sender, e, ex)
	{

		if (e.detail.refill)
		{
			e.detail.items = FormPerk.#__vault.get(this)["lastItems"];
		}

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onDoFill(sender, e, ex)
	{

		if (this.get("setting", "form.options.autoFill", true))
		{
			let rootNode = ( e.detail && "selector" in e.detail ? Util.scopedSelectorAll(this, e.detail.rootNode)[0] : this );
			ValueUtil.setFields(rootNode, e.detail.items, {"resources":this.get("inventory", "resource.resources"), "triggerEvent":true});
			FormUtil.showConditionalElements(this, e.detail.items);
		}

		FormPerk.#__vault.get(this)["lastItems"] = e.detail.items;

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onDoCollect(sender, e, ex)
	{

		if (this.get("setting", "form.options.autoCollect", true))
		{
			e.detail.items = ValueUtil.getFields(this);
		}

	}

	// -------------------------------------------------------------------------

	static #FormPerk_onAfterCollect(sender, e, ex)
	{

		// Collect only submittable data
		if (this.get("setting", "form.options.autoCrop", true))
		{
			e.detail.items = FormPerk.#__collectData(this, e.detail.items);
		}

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
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
	static #_build(unit, element, items, options)
	{

		FormUtil.build(element, items, options);

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Submit the form.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_submit(unit, options)
	{

		options = options || {};
		unit.set("inventory", "form.cancelSubmit", false);

		// Collect values
		await FormPerk.#__collect(unit, options);

		// Validate values
		if (unit.get("setting", "form.options.autoValidate", true))
		{
			options["validatorName"] = options["validatorName"] || unit.get("setting", "form.options.validatorName");
			await unit.cast("validation.validate", options);
			if (!unit.get("inventory", "validation.validationResult.result"))
			{
				unit.set("inventory", "form.cancelSubmit", true);
			}
		}
		// Submit values
		console.debug(`FormPerk.#_submit(): Submitting unit. name=${unit.tagName}, id=${unit.id}`);
		await unit.cast("event.trigger", "beforeSubmit", options);
		if (!unit.get("inventory", "form.cancelSubmit"))
		{
			await unit.cast("event.trigger", "doSubmit", options);
			console.debug(`FormPerk.#_submit(): Submitted unit. name=${unit.tagName}, id=${unit.id}`);
			await unit.cast("event.trigger", "afterSubmit", options);
		}

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
	static async #__collect(unit, options)
	{

		console.debug(`FormPerk.#__collect(): Collecting data. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "beforeCollect", options);
		await unit.cast("event.trigger", "doCollect", options);
		console.debug(`FormPerk.#__collect(): Collected data. name=${unit.tagName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		await unit.cast("event.trigger", "afterCollect", options);

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
	static #__collectData(unit, items)
	{

		let submitItem = {};

		// Collect values only from nodes that has [bm-submit] attribute.
		let nodes = Util.scopedSelectorAll(unit, "[bm-submit]");
		nodes = Array.prototype.slice.call(nodes, 0);
		nodes.forEach((elem) => {
			let key = elem.getAttribute("bm-bind");
			submitItem[key] = items[key];
		});

		return submitItem;

	}

}
