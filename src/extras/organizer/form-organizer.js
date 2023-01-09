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
//	Form organizer class
// =============================================================================

export default class FormOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(component, settings)
	{

		// Add properties
		Object.defineProperty(component, 'validators', {
			get() { return this._validators; },
		});
		Object.defineProperty(component, 'validationResult', {
			get() { return this._validationResult; },
		})
		Object.defineProperty(component, 'cancelSubmit', {
			get() { return this._cancelSubmit; },
		})

		// Add methods
		component.addValidator = function(validatorName, options) { return FormOrganizer._addValidator(this, validatorName, options); }
		component.validate = function(options) { return FormOrganizer._validate(this, options); }
		component.submit = function(options) { return FormOrganizer._submit(this, options); }

		// Init vars
		component._validators = {};
		component._validationResult = {};
		component._cancelSubmit = false;

	}

	// -------------------------------------------------------------------------

	/**
	 * Organize.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static organize(conditions, component, settings)
	{

		switch (conditions)
		{
		case "doCheckValidity":
		case "doReportValidity":
			let validationName = settings["validationName"];
//			BITSMIST.v1.Util.warn(validationName, `FormOrganizer.organize(): Validator not specified. name=${component.name}`);

			if (validationName)
			{
				BITSMIST.v1.Util.assert(component._validators[validationName], `FormOrganizer.organize(): Validator not found. name=${component.name}, validationName=${validationName}`);

				let items = BITSMIST.v1.Util.safeGet(settings, "items");
				let rules = component.settings.get("validations." + validationName + ".rules");
				let options = component.settings.get("validations." + validationName + ".handlerOptions");
				let method = (conditions === "doCheckValidity" ? "checkValidity" : "reportValidity" );

				component._validators[validationName][method](items, rules, options);
			}
			break;
		default:
			let validations = settings["validations"];
			if (validations)
			{
				Object.keys(validations).forEach((validatorName) => {
					FormOrganizer._addValidator(component, validatorName, validations[validatorName]);
				});
			}
			break;
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
			validator = BITSMIST.v1.ClassUtil.createObject(options["handlerClassName"], component, validatorName, options);
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
			return component.callOrganizers("doCheckValidity", options);
		}).then(() => {
			return component.trigger("doValidate", options);
		}).then(() => {
			return component.trigger("afterValidate", options);
		}).then(() => {
			if (!component._validationResult["result"])
			{
				component._cancelSubmit = true;

				return Promise.resolve().then(() => {
					return component.callOrganizers("doReportValidity", options);
				}).then(() => {
					return component.trigger("doReportValidity", options);
				});
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
					return component.callOrganizers("doSubmit", options);
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
