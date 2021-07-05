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
//	Key organizer class
// =============================================================================

export default class KeyOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Init.
	 *
	 * @param	{Object}		conditions			Conditions.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(conditions, component, settings)
	{

		/*
		// Add properties
		Object.defineProperty(component, 'masters', {
			get() { return this._masters; },
		});

		// Add methods
		component.addMaster = function(masterName, options, ajaxSettings) { return MasterOrganizer._initMaster(this, masterName, options, ajaxSettings); }
		*/

		// Init vars
		component.__isComposing = false;

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

		let keys = settings["keys"];
		if (keys)
		{
			component.addEventHandler("afterAppend", {"handler":KeyOrganizer.onAfterAppend, "options":{"keys":keys}});
		}

		return settings;

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	 * After append event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	static onAfterAppend(sender, e, ex)
	{

		let component = ex.component;

		// default keys
		let defaultKeys = component.settings.get("keys.defaultKeys");
		if (defaultKeys)
		{
//			console.log("@@@defaulKeys", defaultKeys);
			component.addEventHandler("keydown", {"handler": KeyOrganizer.onKeyDown, "options":defaultKeys}, null, this);
			component.addEventHandler("keypress", {"handler":KeyOrganizer.onKeyPress, "options":defaultKeys}, null, this);
			component.addEventHandler("compositionstart", {"handler":KeyOrganizer.onCompositionStart, "options":defaultKeys}, null, this);
			component.addEventHandler("compositionend", {"handler":KeyOrganizer.onCompositionEnd, "options":defaultKeys}, null, this);
		}

		// default buttons
		let defaultButtons = component.settings.get("keys.defaultButtons");
		if (defaultButtons)
		{
//			console.log("@@@defaulButtons", defaultButtons);
			KeyOrganizer.__initElements(component, defaultButtons["submit"], KeyOrganizer.onDefaultSubmit);
			KeyOrganizer.__initElements(component, defaultButtons["cancel"], KeyOrganizer.onDefaultCancel);
			KeyOrganizer.__initElements(component, defaultButtons["clear"], KeyOrganizer.onDefaultClear);
		}

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key down event handler. Handle keys which do not fire keyPress event.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	static onKeyDown(sender, e, ex)
	{

		let key  = ( e.key ? e.key : KeyOrganizer.__getKeyfromKeyCode(e.keyCode) );
		key = key.toLowerCase()
		key = ( key == "esc" ? "escape" : key ); // For IE11

		switch (key)
		{
			case "escape":
				KeyOrganizer.onKeyPress(sender, e, ex);
				break;
		}

//		console.log("@@@onKeyDown" ,key);

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key press event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	static onKeyPress(sender, e, ex)
	{

		let component = ex.component;

		// Ignore all key input when composing.
		if (component.__isComposing || e.keyCode == 229)
		{
			return;
		}

		let key  = ( e.key ? e.key : KeyOrganizer.__getKeyfromKeyCode(e.keyCode) );
		key = key.toLowerCase()
		key = ( key == "esc" ? "escape" : key ); // For IE11

//		console.log("@@@onKeyPress" ,key);

		if (ex.options.submit && key == ex.options.submit.key)
		{
			// Submit
			KeyOrganizer.onDefaultSubmit(sender, e, {"options":ex.options["submit"], "component":component});
		}
		else if (ex.options.cancel && key == ex.options.cancel.key)
		{
			// Cancel
			KeyOrganizer.onDefaultCancel(sender, e, {"options":ex.options["cancel"], "component":component});
		}
		else if (ex.options.clear && key == ex.options.clear.key)
		{
			// Clear
			KeyOrganizer.onDefaultClear(sender, e, {"options":ex.options["clear"], "component":component});
		}

		return;

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition start event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	static onCompositionStart(sender, e, ex)
	{

//		console.log("@@@onCompositionStart");

		ex.component.__isComposing = true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition end event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	static onCompositionEnd(sender, e, ex)
	{

//		console.log("@@@onCompositionEnd");

		ex.component.__isComposing = false;

	}

	// -------------------------------------------------------------------------

	/**
	 * Default submit.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	static onDefaultSubmit(sender, e, ex)
	{

		let component = ex.component;

		component.submit().then(() => {
			if (!component.__cancelSubmit)
			{
				// Modal result
				if (component._isModal)
				{
					component._modalResult["result"] = true;
				}

				// Auto close
				if (ex && ex.options["autoClose"])
				{
					component.close();
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Default cancel.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	static onDefaultCancel(sender, e, ex)
	{

		ex.component.close();

	}

	// -------------------------------------------------------------------------

	/**
	 * Default clear.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	static onDefaultClear(sender, e, ex)
	{

		let target;

		if (ex && ex.options["target"])
		{
			target = sender.getAttribute(ex.options["target"]);
		}

		ex.component.clear(ex.component, target);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
 	 * Convert key name from key code.
	 *
	 * @param	{Integer}		code				Key code.
	 */
	static __getKeyfromKeyCode(code)
	{

		let ret;

		switch(code)
		{
			case 13:
				ret = "Enter";
				break;
			default:
				ret = String.fromCharCode(code);
				break;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Init buttons.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 * @param	{Function}		handler				Handler.
	 */
	static __initElements(component, options, handler)
	{

		if (options)
		{
			let elements = component.querySelectorAll(options["rootNode"]);
			elements = Array.prototype.slice.call(elements, 0);
			elements.forEach((element) => {
				component.addEventHandler("click", {"handler":handler, "options":options}, element, this);
			});
		}

	}

}
