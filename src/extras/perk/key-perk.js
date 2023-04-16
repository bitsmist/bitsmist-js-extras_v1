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
//	Key Perk class
// =============================================================================

export default class KeyPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static KeyPerk_onAfterTransform(sender, e, ex)
	{

		let keys = this.settings.get("keys");
		if (keys)
		{
			// Init keys
			let actions = KeyPerk.__getActions(keys);
			this.addEventListener("keydown", function(e){KeyPerk.KeyPerk_onKeyDown.call(this, e, this);});
			this.addEventListener("keyup", function(e){KeyPerk.KeyPerk_onKeyUp.call(this, e, this, keys, actions);});
			//this.addEventListener("compositionstart", function(e){KeyPerk.onCompositionStart.call(this, e, this, keys);});
			//this.addEventListener("compositionend", function(e){KeyPerk.onCompositionEnd.call(this, e, this, keys);});

			// Init buttons
			this.skills.use("setting.enum", this.settings.get("keys"), (sectionName, sectionValue) => {
				KeyPerk.__initButtons(this, sectionName, sectionValue);
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
	static KeyPerk_onKeyDown(e, component)
	{

		component.inventory.set("key.isComposing", ( e.keyCode === 229 ? true : false ));

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
	static KeyPerk_onKeyUp(e, component, options, actions)
	{

		// Ignore all key input when composing.
		if (component.inventory.get("key.isComposing"))
		{
			return;
		}

		let key  = ( e.key ? e.key : KeyPerk.__getKeyfromKeyCode(e.keyCode) );
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
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "KeyPerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"sections":		"keys",
			"order":		800,
		};

	}

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
		component.inventory.set("key.isComposing", false);

		// Add event handlers to component
		this._addPerkHandler(component, "afterTransform", KeyPerk.KeyPerk_onAfterTransform);

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

		return component.skills.use("form.submit").then(() => {
			if (!component.inventory.get("form.cancelSubmit"))
			{
				// Modal result
				if (component.inventory.get("dialog.isModal"))
				{
					component.stats.set("dialog.modalResult.result", true);
				}

				// Auto close
				if (options && options["autoClose"])
				{
					return component.skills.use("dialog.close", {"reason":"submit"});
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

		return component.skills.use("dialog.close", {"reason":"cancel"});

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

		return component.clear({"target":target, "options":options["options"]});

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
			let handler = ( options["handler"] ? options["handler"] : KeyPerk.__getDefaultHandler(action) );
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
				actions[keys[i]]["handler"] = ( settings[key]["handler"] ? settings[key]["handler"] : KeyPerk.__getDefaultHandler(key) );
				actions[keys[i]]["option"] = settings[key];
			}
		});

		return actions;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return the default handler for the action.
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
			handler = KeyPerk._defaultSubmit;
			break;
		case "clear":
			handler = KeyPerk._defaultClear;
			break;
		case "cancel":
			handler = KeyPerk._defaultCancel;
			break;
		}

		return handler;

	}

}
