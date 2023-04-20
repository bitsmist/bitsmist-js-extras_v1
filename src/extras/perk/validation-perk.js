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
			component.inventory.set(`validation.validators.${validatorName}`, validator);
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
		component.stats.set("validation.validationResult.result", true);

		return Promise.resolve().then(() => {
			console.debug(`ValidationPerk._validate(): Validating component. name=${component.tagName}, id=${component.id}`);
			return component.skills.use("event.trigger", "beforeValidate", options);
		}).then(() => {
			return component.skills.use("event.trigger", "doValidate", options);
		}).then(() => {
			if (component.stats.get("validation.validationResult.result"))
			{
				console.debug(`ValidationPerk._validate(): Validation Success. name=${component.tagName}, id=${component.id}`);
				return component.skills.use("event.trigger", "doValidateSuccess", options);
			}
			else
			{
				console.debug(`ValidationPerk._validate(): Validation Failed. name=${component.tagName}, id=${component.id}`);
				return component.skills.use("event.trigger", "doValidateFail", options);
			}
		}).then(() => {
			if (!component.stats.get("validation.validationResult.result"))
			{
				return component.skills.use("event.trigger", "doReportValidity", options);
			}
		}).then(() => {
			return component.skills.use("event.trigger", "afterValidate", options);
		});

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static ValidationPerk_onDoOrganize(sender, e, ex)
	{

		Object.entries(this.settings.get("validation.handlers", {})).forEach(([sectionName, sectionValue]) => {
			ValidationPerk._addValidator(this, sectionName, sectionValue);
		});

	}

	// -------------------------------------------------------------------------

	static ValidationPerk_onDoValidate(sender, e, ex)
	{


		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			BM.Util.assert(this.inventory.get(`validation.validators.${validatorName}`), `ValidationPerk.organize(): Validator not found. name=${this.name}, validatorName=${validatorName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.settings.get(`validation.handlers.${validatorName}.rules`);
			let options = this.settings.get(`validation.handlers.${validatorName}.handlerOptions`);

			this.inventory.get(`validation.validators.${validatorName}`).checkValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------

	static ValidationPerk_onDoReportValidity(sender, e, ex)
	{

		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			BM.Util.assert(this.inventory.get(`validation.validators.${validatorName}`), `ValidationPerk.organize(): Validator not found. name=${this.name}, validatorName=${validatorName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.settings.get(`validation.handlers.${validatorName}.rules`);
			let options = this.settings.get(`validation.handlers.${validatorName}.handlerOptions`);

			this.inventory.get(`validation.validators.${validatorName}`).reportValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"validation",
			"order":		310,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add skills to component;
		component.skills.set("validation.addValidator", function(...args) { return ValidationPerk._addValidator(...args); });
		component.skills.set("validation.validate", function(...args) { return ValidationPerk._validate(...args); });

		// Add inventory items to component
		component.inventory.set("validation.validators", {});

		// Add stats to component
		component.stats.set("validation.validationResult", {});

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", ValidationPerk.ValidationPerk_onDoOrganize);
		this._addPerkHandler(component, "doValidate", ValidationPerk.ValidationPerk_onDoValidate);
		this._addPerkHandler(component, "doReportValidity", ValidationPerk.ValidationPerk_onDoReportValidity);

	}

}
