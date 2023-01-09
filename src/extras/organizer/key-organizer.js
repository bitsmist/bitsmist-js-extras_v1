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
	 * @param	{Component}		component			Component.
	 * @param	{Object}		settings			Settings.
	 */
	static init(component, settings)
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
			// Init keys
			let actions = KeyOrganizer.__getActions(keys);
			component.addEventListener("keydown", function(e){KeyOrganizer.onKeyDown.call(this, e, component);});
			component.addEventListener("keyup", function(e){KeyOrganizer.onKeyUp.call(this, e, component, keys, actions);});
			// component.addEventListener("compositionstart", function(e){KeyOrganizer.onCompositionStart.call(this, e, component, keys);});
			// component.addEventListener("compositionend", function(e){KeyOrganizer.onCompositionEnd.call(this, e, component, keys);});

			// Init buttons
			Object.keys(keys).forEach((key) => {
				KeyOrganizer.__initButtons(component, key, keys[key]);
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
 	 * Key down event handler. Check if it is in composing mode or not.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 */
	static onKeyDown(e, component)
	{

		component.__isComposing = ( e.keyCode === 229 ? true : false );

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key up event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 * @param	{Object}		actions				Action info.
	 */
	static onKeyUp(e, component, options, actions)
	{

		// Ignore all key input when composing.
		if (component.__isComposing)
		{
			return;
		}

		let key  = ( e.key ? e.key : KeyOrganizer.__getKeyfromKeyCode(e.keyCode) );
		switch (key)
		{
			case "Esc":		key = "Escape";		break;
			case "Down": 	key = "ArrowDown";	break;
			case "Up": 		key = "ArrowUp";	break;
			case "Left": 	key = "ArrowLeft";	break;
			case "Right": 	key = "ArrowRight";	break;
		}
		key = key.toLowerCase()

		// Take an action according to the key pressed
		if (actions[key])
		{
			actions[key]["handler"].call(this, e, component, actions[key]["option"]);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition start event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	/*
	static onCompositionStart(e, component, options)
	{

		component.__isComposing = true;

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Composition end event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	/*
	static onCompositionEnd(e, component, options)
	{

		component.__isComposing = false;

	}
	*/

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Default submit.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static _defaultSubmit(e, component, options)
	{

		return component.submit().then(() => {
			if (!component.cancelSubmit)
			{
				// Modal result
				if (component.isModal)
				{
					component.modalResult["result"] = true;
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
	static _defaultCancel(e, component, options)
	{

		return component.close();

	}

	// -------------------------------------------------------------------------

	/**
	 * Default clear.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static _defaultClear(e, component, options)
	{

		let target;

		if (this.hasAttribute("bm-cleartarget"))
		{
			target = this.getAttribute("bm-cleartarget");
		}

		return component.clear({"target":target});

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
	 * @param	{String}		action				Action.
	 * @param	{Object}		options				Options.
	 */
	static __initButtons(component, action, options)
	{

		if (options && options["rootNode"])
		{
			let handler = ( options["handler"] ? options["handler"] : KeyOrganizer.__getDefaultHandler(action) );
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
	 * @param	{Object}		settings			Key settings.
	 *
	 * @return 	{Object}		Action info.
	 */
	static __getActions(settings)
	{

		let actions = {};

		Object.keys(settings).forEach((key) => {
			let keys = ( Array.isArray(settings[key]["key"]) ? settings[key]["key"] : [settings[key]["key"]])

			for (let i = 0; i < keys.length; i++)
			{
				actions[keys[i]] = {};
				actions[keys[i]]["type"] = key;
				actions[keys[i]]["handler"] = ( settings[key]["handler"] ? settings[key]["handler"] : KeyOrganizer.__getDefaultHandler(key) );
				actions[keys[i]]["option"] = settings[key];
			}
		});

		return actions;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return a default handler for the action.
	 *
	 * @param	{String}		action				Action.
	 *
	 * @return 	{Function}		Handler.
	 */
	static __getDefaultHandler(action)
	{

		let handler;

		switch (action)
		{
		case "submit":
			handler = KeyOrganizer._defaultSubmit;
			break;
		case "clear":
			handler = KeyOrganizer._defaultClear;
			break;
		case "cancel":
			handler = KeyOrganizer._defaultCancel;
			break;
		}

		return handler;

	}

}
