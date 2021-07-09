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
			// default keys
			let defaultKeys = component.settings.get("keys.defaultKeys");
			if (defaultKeys)
			{
				let actions = KeyOrganizer.__getActions(defaultKeys);
				component.addEventListener("keydown", function(e){KeyOrganizer.onKeyDown.call(this, e, component, defaultKeys, actions);});
				component.addEventListener("keypress", function(e){KeyOrganizer.onKeyPress.call(this, e, component, defaultKeys, actions);});
				component.addEventListener("compositionstart", function(e){KeyOrganizer.onCompositionStart.call(this, e, component, defaultKeys);});
				component.addEventListener("compositionend", function(e){KeyOrganizer.onCompositionEnd.call(this, e, component, defaultKeys);});
			}

			// default buttons
			let defaultButtons = component.settings.get("keys.defaultButtons");
			if (defaultButtons)
			{
				KeyOrganizer.__initElements(component, defaultButtons["submit"], KeyOrganizer.onDefaultSubmit);
				KeyOrganizer.__initElements(component, defaultButtons["cancel"], KeyOrganizer.onDefaultCancel);
				KeyOrganizer.__initElements(component, defaultButtons["clear"], KeyOrganizer.onDefaultClear);
			}
		}

		return settings;

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
 	 * Key down event handler. Handle keys that do not fire keyPress event.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 * @param	{Object}		actions				Action info.
	 */
	static onKeyDown(e, component, options, actions)
	{

		let key  = ( e.key ? e.key : KeyOrganizer.__getKeyfromKeyCode(e.keyCode) );
		key = key.toLowerCase()
		key = ( key == "esc" ? "escape" : key ); // For IE11

		switch (key)
		{
			case "escape":
				KeyOrganizer.onKeyPress(e, component, options, actions);
				break;
		}

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key press event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 * @param	{Object}		actions				Action info.
	 */
	static onKeyPress(e, component, options, actions)
	{

		// Ignore all key input when composing.
		if (component.__isComposing || e.isComposing || e.keyCode == 229)
		{
			return;
		}

		// Get a key
		let key  = ( e.key ? e.key : KeyOrganizer.__getKeyfromKeyCode(e.keyCode) );
		key = key.toLowerCase()
		key = ( key == "esc" ? "escape" : key ); // For IE11

		// Take an action according to the key pressed if specified
		if (actions[key])
		{
			actions[key]["handler"].call(this, e, component, actions[key]["option"]);
		}

		return;

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition start event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static onCompositionStart(e, component, options)
	{

		component.__isComposing = true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition end event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static onCompositionEnd(e, component, options)
	{

		component.__isComposing = false;

	}

	// -------------------------------------------------------------------------

	/**
	 * Default submit.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static onDefaultSubmit(e, component, options)
	{

		component.submit().then(() => {
			if (!component.__cancelSubmit)
			{
				// Modal result
				if (component._isModal)
				{
					component._modalResult["result"] = true;
				}

				// Auto close
				if (options && options["autoClose"])
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
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static onDefaultCancel(e, component, options)
	{

		component.close();

	}

	// -------------------------------------------------------------------------

	/**
	 * Default clear.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static onDefaultClear(e, component, options)
	{

		let target;

		if (options && options["target"])
		{
			target = this.getAttribute(options["target"]);
		}

		component.clear(component, target);

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
				element.addEventListener("click", function(e){handler.call(this, e, component, options);});
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Return an object that holds information about what action is taken when which key is pressed.
	 *
	 * @param	{Object}		defaultKeys			Key options.
	 *
	 * @return 	{Object}		Action info.
	 */
	static __getActions(defaultKeys)
	{

		let actions = {};

		Object.keys(defaultKeys).forEach((key) => {
			let keys = ( Array.isArray(defaultKeys[key]["key"]) ? defaultKeys[key]["key"] : [defaultKeys[key]["key"]])

			for (let i = 0; i < keys.length; i++)
			{
				actions[keys[i]] = {};
				actions[keys[i]]["type"] = key;
				switch (key)
				{
				case "submit":
					actions[keys[i]]["handler"] = KeyOrganizer.onDefaultSubmit;
					actions[keys[i]]["option"] = defaultKeys["submit"];
					break;
				case "clear":
					actions[keys[i]]["handler"] = KeyOrganizer.onDefaultClear;
					actions[keys[i]]["option"] = defaultKeys["clear"];
					break;
				case "cancel":
					actions[keys[i]]["handler"] = KeyOrganizer.onDefaultCancel;
					actions[keys[i]]["option"] = defaultKeys["cancel"];
					break;
				default:
					actions[keys[i]]["handler"] = defaultKeys[key]["handler"];
					actions[keys[i]]["option"] = defaultKeys[key];
					break;
				}
			}
		});

		return actions;

	}

}
