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
//	Validation Organizer Class
// =============================================================================

export default class ValidationOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "ValidationOrganizer";

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static ValidationOrganizer_onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["validators"], (sectionName, sectionValue) => {
			ValidationOrganizer._addValidator(this, sectionName, sectionValue);
		});

	}

	// -------------------------------------------------------------------------

	static ValidationOrganizer_onDoValidate(sender, e, ex)
	{

		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			BM.Util.assert(this._validators[validatorName], `ValidationOrganizer.organize(): Validator not found. name=${this.name}, validatorName=${validatorName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.settings.get("validators." + validatorName + ".rules");
			let options = this.settings.get("validators." + validatorName + ".handlerOptions");

			this._validators[validatorName].checkValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------

	static ValidationOrganizer_onDoReportValidity(sender, e, ex)
	{

		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			BM.Util.assert(this._validators[validatorName], `ValidationOrganizer.organize(): Validator not found. name=${this.name}, validatorName=${validatorName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.settings.get("validators." + validatorName + ".rules");
			let options = this.settings.get("validators." + validatorName + ".handlerOptions");

			this._validators[validatorName].reportValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		["validators"],
			"order":		310,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add properties to component
		Object.defineProperty(component, 'validators', {
			get() { return this._validators; },
		});
		Object.defineProperty(component, 'validationResult', {
			get() { return this._validationResult; },
		})

		// Add methods to component
		component.addValidator = function(...args) { return ValidationOrganizer._addValidator(this, ...args); }
		component.validate = function(...args) { return ValidationOrganizer._validate(this, ...args); }

		// Init component vars
		component._validators = {};
		component._validationResult = {};

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", ValidationOrganizer.ValidationOrganizer_onDoOrganize);
		this._addOrganizerHandler(component, "doValidate", ValidationOrganizer.ValidationOrganizer_onDoValidate);
		this._addOrganizerHandler(component, "doReportValidity", ValidationOrganizer.ValidationOrganizer_onDoReportValidity);

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
     * Add the validator.
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
		component._validationResult = {"result":true};

		return Promise.resolve().then(() => {
			console.debug(`ValidationOrganizer._validate(): Validating component. name=${component.name}, id=${component.id}`);
			return component.trigger("beforeValidate", options);
		}).then(() => {
			return component.trigger("doValidate", options);
		}).then(() => {
			if (component.validationResult["result"])
			{
				console.debug(`ValidationOrganizer._validate(): Validation Success. name=${component.name}, id=${component.id}`);
				return component.trigger("doValidateSuccess", options);
			}
			else
			{
				console.debug(`ValidationOrganizer._validate(): Validation Failed. name=${component.name}, id=${component.id}`);
				return component.trigger("doValidateFail", options);
			}
		}).then(() => {
			if (!component._validationResult["result"])
			{
				return component.trigger("doReportValidity", options);
			}
		}).then(() => {
			return component.trigger("afterValidate", options);
		});

	}

}
