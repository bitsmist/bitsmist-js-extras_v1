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
//	Key organizer class
// =============================================================================

export default class KeyOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "KeyOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static KeyOrganizer_onAfterTransform(sender, e, ex)
	{

		let keys = this.settings.get("keys");
		if (keys)
		{
			// Init keys
			let actions = KeyOrganizer.__getActions(keys);
			this.addEventListener("keydown", function(e){KeyOrganizer.KeyOrganizer_onKeyDown.call(this, e, this);});
			this.addEventListener("keyup", function(e){KeyOrganizer.KeyOrganizer_onKeyUp.call(this, e, this, keys, actions);});
			//this.addEventListener("compositionstart", function(e){KeyOrganizer.onCompositionStart.call(this, e, this, keys);});
			//this.addEventListener("compositionend", function(e){KeyOrganizer.onCompositionEnd.call(this, e, this, keys);});

			// Init buttons
			this._enumSettings(this.settings.get("keys"), (sectionName, sectionValue) => {
				KeyOrganizer.__initButtons(this, sectionName, sectionValue);
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key down event handler. Check if it is in composing mode or not.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Component}		component			Component.
	 */
	static KeyOrganizer_onKeyDown(e, component)
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
	static KeyOrganizer_onKeyUp(e, component, options, actions)
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
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"keys",
			"order":		800,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Init component vars
		component.__isComposing = false;

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterTransform", KeyOrganizer.KeyOrganizer_onAfterTransform);

	}

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
					component.close({"reason":"submit"});
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

		return component.close({"reason":"cancel"});

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

		let target = "";

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
