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

// =============================================================================
//	Validation Perk Class
// =============================================================================

export default class ValidationPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static ValidationPerk_onDoOrganize(sender, e, ex)
	{

		this.skills.use("setting.enumSettings", e.detail.settings["validators"], (sectionName, sectionValue) => {
			ValidationPerk._addValidator(this, sectionName, sectionValue);
		});

	}

	// -------------------------------------------------------------------------

	static ValidationPerk_onDoValidate(sender, e, ex)
	{

		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			BM.Util.assert(this.inventory.get("validation.validators")[validatorName], `ValidationPerk.organize(): Validator not found. name=${this.name}, validatorName=${validatorName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.settings.get(`validators.${validatorName}.rules`);
			let options = this.settings.get(`validators.${validatorName}.handlerOptions`);

			this.inventory.get("validation.validators")[validatorName].checkValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------

	static ValidationPerk_onDoReportValidity(sender, e, ex)
	{

		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			BM.Util.assert(this.inventory.get("validation.validators")[validatorName], `ValidationPerk.organize(): Validator not found. name=${this.name}, validatorName=${validatorName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.settings.get(`validators.${validatorName}.rules`);
			let options = this.settings.get(`validators.${validatorName}.handlerOptions`);

			this.inventory.get("validation.validators")[validatorName].reportValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "ValidationPerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"sections":		["validators"],
			"order":		310,
		};

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

		// Add skills to component;
		component.skills.set("validation.addValidator", function(...args) { return ValidationPerk._addValidator(...args); });
		component.skills.set("validation.validate", function(...args) { return ValidationPerk._validate(...args); });

		// Add inventory items to Component
		component.inventory.set("validation.validators", {});
		component.inventory.set("validation.validationResult", {});

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", ValidationPerk.ValidationPerk_onDoOrganize);
		this._addPerkHandler(component, "doValidate", ValidationPerk.ValidationPerk_onDoValidate);
		this._addPerkHandler(component, "doReportValidity", ValidationPerk.ValidationPerk_onDoReportValidity);

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
			component.inventory.get("validation.validators")[validatorName] = validator;
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
		component.inventory.set("validation.validationResult", {"result":true});

		return Promise.resolve().then(() => {
			console.debug(`ValidationPerk._validate(): Validating component. name=${component.name}, id=${component.id}`);
			return component.skills.use("event.trigger", "beforeValidate", options);
		}).then(() => {
			return component.skills.use("event.trigger", "doValidate", options);
		}).then(() => {
			if (component.inventory.get("validation.validationResult")["result"])
			{
				console.debug(`ValidationPerk._validate(): Validation Success. name=${component.name}, id=${component.id}`);
				return component.skills.use("event.trigger", "doValidateSuccess", options);
			}
			else
			{
				console.debug(`ValidationPerk._validate(): Validation Failed. name=${component.name}, id=${component.id}`);
				return component.skills.use("event.trigger", "doValidateFail", options);
			}
		}).then(() => {
			if (!component.inventory.get("validation.validationResult")["result"])
			{
				return component.skills.use("event.trigger", "doReportValidity", options);
			}
		}).then(() => {
			return component.skills.use("event.trigger", "afterValidate", options);
		});

	}

}
