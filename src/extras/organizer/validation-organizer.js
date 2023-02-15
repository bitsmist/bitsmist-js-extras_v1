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
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		["validations"],
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
		component._items = {};
		component._validators = {};
		component._validationResult = {};
		component._cancelSubmit = false;

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", ValidationOrganizer.onDoOrganize);
		this._addOrganizerHandler(component, "doValidate", ValidationOrganizer.onDoValidate);
		this._addOrganizerHandler(component, "doReportValidity", ValidationOrganizer.onDoReportValidity);

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["validations"], (sectionName, sectionValue) => {
			ValidationOrganizer._addValidator(this, sectionName, sectionValue);
		});

	}

	// -------------------------------------------------------------------------

	static onDoValidate(sender, e, ex)
	{

		let validationName = this.settings.get("settings.validationName");
		if (validationName)
		{
			BM.Util.assert(this._validators[validationName], `ValidationOrganizer.organize(): Validator not found. name=${this.name}, validationName=${validationName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.settings.get("validations." + validationName + ".rules");
			let options = this.settings.get("validations." + validationName + ".handlerOptions");

			this._validators[validationName].checkValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------

	static onDoReportValidity(sender, e, ex)
	{

		let validationName = this.settings.get("settings.validationName");
		if (validationName)
		{
			BM.Util.assert(this._validators[validationName], `ValidationOrganizer.organize(): Validator not found. name=${this.name}, validationName=${validationName}`);

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

}
