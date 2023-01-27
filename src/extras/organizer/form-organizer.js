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
//	Form organizer class
// =============================================================================

export default class FormOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"name":			"FormOrganizer",
			"targetWords":	["forms", "validations"],
			"order":		310,
		};

	}

	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Add properties to component
		Object.defineProperty(component, 'validators', {
			get() { return this._validators; },
		});
		Object.defineProperty(component, 'validationResult', {
			get() { return this._validationResult; },
		})
		Object.defineProperty(component, 'cancelSubmit', {
			get() { return this._cancelSubmit; },
		})

		// Add methods to component
		component.addValidator = function(validatorName, options) { return FormOrganizer._addValidator(this, validatorName, options); }
		component.validate = function(options) { return FormOrganizer._validate(this, options); }
		component.submit = function(options) { return FormOrganizer._submit(this, options); }

		// Init component vars
		component._validators = {};
		component._validationResult = {};
		component._cancelSubmit = false;

		// Add event handlers to component
		this._addOrganizerHandler(component, "beforeStart", FormOrganizer.onBeforeStart);
		this._addOrganizerHandler(component, "afterSpecLoad", FormOrganizer.onAfterSpecLoad);
		this._addOrganizerHandler(component, "doValidate", FormOrganizer.onDoValidate);
		this._addOrganizerHandler(component, "doReportValidity", FormOrganizer.onDoReportValidity);

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static onBeforeStart(sender, e, ex)
	{

		let validations = this.settings.get("validations");
		if (validations)
		{
			Object.keys(validations).forEach((validatorName) => {
				FormOrganizer._addValidator(this, validatorName, validations[validatorName]);
			});
		}

	}

	// -----------------------------------------------------------------------------

	static onAfterSpecLoad(sender, e, ex)
	{

		let validations = e.detail.spec["validations"]
		if (validations)
		{
			Object.keys(validations).forEach((validatorName) => {
				FormOrganizer._addValidator(this, validatorName, validations[validatorName]);
			});
		}

	}

	// -----------------------------------------------------------------------------

	static onDoValidate(sender, e, ex)
	{

		let validationName = this.settings.get("settings.validationName");
		if (validationName)
		{
			BM.Util.assert(this._validators[validationName], `FormOrganizer.organize(): Validator not found. name=${this.name}, validationName=${validationName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.settings.get("validations." + validationName + ".rules");
			let options = this.settings.get("validations." + validationName + ".handlerOptions");

			this._validators[validationName].checkValidity(items, rules, options);
		}

	}

	// -----------------------------------------------------------------------------

	static onDoReportValidity(sender, e, ex)
	{

		let validationName = this.settings.get("settings.validationName");
		if (validationName)
		{
			BM.Util.assert(this._validators[validationName], `FormOrganizer.organize(): Validator not found. name=${this.name}, validationName=${validationName}`);

			let items = BM.Util.safeGet(e.detail.settings, "items");
			let rules = this.settings.get("validations." + validationName + ".rules");
			let options = this.settings.get("validations." + validationName + ".handlerOptions");

			this._validators[validationName].reportValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Add a validator.
     *
     * @param	{Component}		component			Component.
     * @param	{string}		validatorName		Validator name.
     * @param	{array}			options				Options.
     */
	static _addValidator(component, validatorName, options)
	{

		let validator;

		if (options["handlerClassName"])
		{
			validator = BM.ClassUtil.createObject(options["handlerClassName"], component, validatorName, options);
			component._validators[validatorName] = validator;
		}

		return validator;

	}

	// -------------------------------------------------------------------------

	/**
	 * Validate the form.
	 *
     * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _validate(component, options)
	{

		options = options || {};
		options["validationName"] = component.settings.get("settings.validationName");
		component._validationResult = {"result":true};

		return Promise.resolve().then(() => {
			return component.trigger("beforeValidate", options);
		}).then(() => {
			return component.trigger("doValidate", options);
		}).then(() => {
			return component.trigger("afterValidate", options);
		}).then(() => {
			if (!component._validationResult["result"])
			{
				component._cancelSubmit = true;

				return component.trigger("doReportValidity", options);
			}
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

		let submitItem = {};
		options = options || {};
		component._cancelSubmit = false;
		let items = FormUtil.getFields(component);

		// Get target keys to submit
		let nodes = component.querySelectorAll("[bm-submit]");
		nodes = Array.prototype.slice.call(nodes, 0);
		nodes.forEach((elem) => {
			let key = elem.getAttribute("bm-bind");
			submitItem[key] = items[key];
		});
		options["items"] = submitItem;

		return Promise.resolve().then(() => {
			if (component.settings.get("settings.autoValidate", true))
			{
				return component.validate(options);
			}
		}).then(() => {
			if (!component._cancelSubmit)
			{
				return Promise.resolve().then(() => {
					return component.trigger("beforeSubmit", options);
				}).then(() => {
					return component.trigger("doSubmit", options);
				}).then(() => {
					component.items = items;
					return component.trigger("afterSubmit", options);
				});
			}
		});

	}

}
