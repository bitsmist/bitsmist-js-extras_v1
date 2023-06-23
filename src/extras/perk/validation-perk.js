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

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "skill", "validation.addHandler", function(...args) { return ValidationPerk._addHandler(...args); });
		this.upgrade(component, "skill", "validation.validate", function(...args) { return ValidationPerk._validate(...args); });
		this.upgrade(component, "inventory", "validation.validators", {});
		this.upgrade(component, "stats", "validation.validationResult", {});
		this.upgrade(component, "stats", "validation.validationResult", {});
		this.upgrade(component, "event", "doApplySettings", ValidationPerk.ValidationPerk_onDoApplySettings);
		this.upgrade(component, "event", "doValidate", ValidationPerk.ValidationPerk_onDoValidate);
		this.upgrade(component, "event", "doReportValidity", ValidationPerk.ValidationPerk_onDoReportValidity);

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
			let rules = this.get("settings", `validation.handlers.${validatorName}.rules`);
			let options = this.get("settings", `validation.handlers.${validatorName}.handlerOptions`);

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
			let rules = this.get("settings", `validation.handlers.${validatorName}.rules`);
			let options = this.get("settings", `validation.handlers.${validatorName}.handlerOptions`);

			this.get("inventory", `validation.validators.${validatorName}`).reportValidity(items, rules, options);
		}

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
     * Add the validator.
     *
     * @param	{Component}		component			Component.
     * @param	{string}		handlerName			Validation handler name.
     * @param	{array}			options				Options.
     */
	static _addHandler(component, handlerName, options)
	{

		let promise = Promise.resolve();
		let handler = component.get("inventory", `validation.validators.${handlerName}`);

		if (options["handlerClassName"] && !handler)
		{
			handler = BM.ClassUtil.createObject(options["handlerClassName"], component, handlerName, options);
			component.set("inventory", `validation.validators.${handlerName}`, handler);

			promise = handler.init(options);
		}

		return promise;

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
		component.set("stats", "validation.validationResult.result", true);

		return Promise.resolve().then(() => {
			console.debug(`ValidationPerk._validate(): Validating component. name=${component.tagName}, id=${component.id}`);
			return component.use("skill", "event.trigger", "beforeValidate", options);
		}).then(() => {
			return component.use("skill", "event.trigger", "doValidate", options);
		}).then(() => {
			if (component.get("stats", "validation.validationResult.result"))
			{
				console.debug(`ValidationPerk._validate(): Validation Success. name=${component.tagName}, id=${component.id}`);
				return component.use("skill", "event.trigger", "doValidateSuccess", options);
			}
			else
			{
				console.debug(`ValidationPerk._validate(): Validation Failed. name=${component.tagName}, id=${component.id}`);
				return component.use("skill", "event.trigger", "doValidateFail", options);
			}
		}).then(() => {
			if (!component.get("stats", "validation.validationResult.result"))
			{
				return component.use("skill", "event.trigger", "doReportValidity", options);
			}
		}).then(() => {
			return component.use("skill", "event.trigger", "afterValidate", options);
		});

	}

}
