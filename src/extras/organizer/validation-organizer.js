// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Validation organizer class
// =============================================================================

export default class ValidationOrganizer extends BITSMIST.v1.Organizer
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

		// Add methods
		component.addValidator = function(validatorName, options) { return ValidationOrganizer._addValidator(this, validatorName, options); }

		// Init vars
		component._validators = {};
		component._validationResult = {};

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
//			BITSMIST.v1.Util.warn(validationName, `ValidationOrganizer.organize(): Validator not specified. name=${component.name}`);

			if (validationName)
			{
				let item = BITSMIST.v1.Util.safeGet(settings, "item");
				let rules = component.settings.get("validations." + validationName + ".rules");
				let options = component.settings.get("validations." + validationName + ".handlerOptions");
				let method = (conditions === "doCheckValidity" ? "checkValidity" : "reportValidity" );

				BITSMIST.v1.Util.assert(component._validators[validationName], `ValidationOrganizer.organize(): Validator not found. name=${component.name}, validationName=${validationName}`);
				component._validators[validationName][method](item, rules, options);
			}
			break;
		default:
			let validations = settings["validations"];
			if (validations)
			{
				Object.keys(validations).forEach((validatorName) => {
					ValidationOrganizer._addValidator(component, validatorName, validations[validatorName]);
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

}
