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
	//  Properties
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

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "spell", "validation.addHandler", function(...args) { return ValidationPerk._addHandler(...args); });
		this.upgrade(unit, "spell", "validation.validate", function(...args) { return ValidationPerk._validate(...args); });
		this.upgrade(unit, "inventory", "validation.validators", {});
		this.upgrade(unit, "state", "validation.validationResult", {});
		this.upgrade(unit, "state", "validation.validationResult", {});
		this.upgrade(unit, "event", "doApplySettings", ValidationPerk.ValidationPerk_onDoApplySettings);
		this.upgrade(unit, "event", "doValidate", ValidationPerk.ValidationPerk_onDoValidate);
		this.upgrade(unit, "event", "doReportValidity", ValidationPerk.ValidationPerk_onDoReportValidity);

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static ValidationPerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];

		Object.entries(BM.Util.safeGet(e.detail, "settings.validation.handlers", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(ValidationPerk._addHandler(this, sectionName, sectionValue));
		});

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static ValidationPerk_onDoValidate(sender, e, ex)
	{

		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			BM.Util.assert(this.get("inventory", `validation.validators.${validatorName}`), `ValidationPerk.ValidationPerk_onDoValidate(): Validator not found. name=${this.tagName}, validatorName=${validatorName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.get("setting", `validation.handlers.${validatorName}.rules`);
			let options = this.get("setting", `validation.handlers.${validatorName}.handlerOptions`);

			this.get("inventory", `validation.validators.${validatorName}`).checkValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------

	static ValidationPerk_onDoReportValidity(sender, e, ex)
	{

		let validatorName = e.detail.validatorName;
		if (validatorName)
		{
			BM.Util.assert(this.get("inventory", `validation.validators.${validatorName}`), `ValidationPerk.ValidationPerk_onDoReportValidity(): Validator not found. name=${this.tagName}, validatorName=${validatorName}`);

			let items = BM.Util.safeGet(e.detail, "items");
			let rules = this.get("setting", `validation.handlers.${validatorName}.rules`);
			let options = this.get("setting", `validation.handlers.${validatorName}.handlerOptions`);

			this.get("inventory", `validation.validators.${validatorName}`).reportValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
     * Add the validator.
     *
     * @param	{Unit}			unit				Unit.
     * @param	{string}		handlerName			Validation handler name.
     * @param	{array}			options				Options.
     */
	static _addHandler(unit, handlerName, options)
	{

		let promise = Promise.resolve();
		let handler = unit.get("inventory", `validation.validators.${handlerName}`);

		if (options["handlerClassName"] && !handler)
		{
			handler = BM.ClassUtil.createObject(options["handlerClassName"], unit, handlerName, options);
			unit.set("inventory", `validation.validators.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Validate the form.
	 *
     * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _validate(unit, options)
	{

		options = options || {};
		unit.set("state", "validation.validationResult.result", true);

		return Promise.resolve().then(() => {
			console.debug(`ValidationPerk._validate(): Validating unit. name=${unit.tagName}, id=${unit.id}`);
			return unit.use("spell", "event.trigger", "beforeValidate", options);
		}).then(() => {
			return unit.use("spell", "event.trigger", "doValidate", options);
		}).then(() => {
			if (unit.get("state", "validation.validationResult.result"))
			{
				console.debug(`ValidationPerk._validate(): Validation Success. name=${unit.tagName}, id=${unit.id}`);
				return unit.use("spell", "event.trigger", "doValidateSuccess", options);
			}
			else
			{
				console.debug(`ValidationPerk._validate(): Validation Failed. name=${unit.tagName}, id=${unit.id}`);
				return unit.use("spell", "event.trigger", "doValidateFail", options);
			}
		}).then(() => {
			if (!unit.get("state", "validation.validationResult.result"))
			{
				return unit.use("spell", "event.trigger", "doReportValidity", options);
			}
		}).then(() => {
			return unit.use("spell", "event.trigger", "afterValidate", options);
		});

	}

}
