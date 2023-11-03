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
	//  Private Variables
	// -------------------------------------------------------------------------

	//static #__isComposing = false;
	static #__info = {
		"sectionName":	"key",
		"order":		800,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return KeyPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("inventory", "key.isComposing", false);

		// Add event handlers
		unit.use("event.add", "afterTransform", {"handler":KeyPerk.#KeyPerk_onAfterTransform, "order":KeyPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	static #KeyPerk_onAfterTransform(sender, e, ex)
	{

		let keys = this.get("setting", "key.keys");
		if (keys)
		{
			// Init keys
			let actions = KeyPerk.#__getActions(keys);
			this.addEventListener("keydown", function(e){KeyPerk.#KeyPerk_onKeyDown.call(this, e, this);});
			this.addEventListener("keyup", function(e){KeyPerk.#KeyPerk_onKeyUp.call(this, e, this, keys, actions);});
			//this.addEventListener("compositionstart", function(e){KeyPerk.onCompositionStart.call(this, e, this, keys);});
			//this.addEventListener("compositionend", function(e){KeyPerk.onCompositionEnd.call(this, e, this, keys);});

			// Init buttons
			Object.entries(keys).forEach(([sectionName, sectionValue]) => {
				KeyPerk.#__initButtons(this, sectionName, sectionValue);
			});
		}

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key down event handler. Check if it is in composing mode or not.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 */
	static #KeyPerk_onKeyDown(e, unit)
	{

		unit.set("inventory", "key.isComposing", ( e.keyCode === 229 ? true : false ));

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key up event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 * @param	{Object}		actions				Action info.
	 */
	static #KeyPerk_onKeyUp(e, unit, options, actions)
	{

		// Ignore all key input when composing.
		if (unit.get("inventory", "key.isComposing"))
		{
			return;
		}

		let key  = ( e.key ? e.key : KeyPerk.#__getKeyfromKeyCode(e.keyCode) );
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
			actions[key]["handler"].call(this, e, unit, actions[key]["option"]);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition start event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	/*
	static #onCompositionStart(e, unit, options)
	{

		unit.#__isComposing = true;

	}
	*/

	// -------------------------------------------------------------------------

	/**
	 * Composition end event handler.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	/*
	static #onCompositionEnd(e, unit, options)
	{

		unit.#__isComposing = false;

	}
	*/

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Default submit.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__defaultSubmit(e, unit, options)
	{

		return unit.cast("form.submit").then(() => {
			if (!unit.get("inventory", "form.cancelSubmit"))
			{
				// Modal result
				if (unit.get("inventory", "dialog.isModal"))
				{
					unit.set("inventory", "dialog.modalResult.result", true);
				}

				// Auto close
				if (options && options["autoClose"])
				{
					return unit.cast("dialog.close", {"reason":"submit"});
				}
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Default cancel.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__defaultCancel(e, unit, options)
	{

		return unit.cast("dialog.close", {"reason":"cancel"});

	}

	// -------------------------------------------------------------------------

	/**
	 * Default clear.
	 *
	 * @param	{Object}		e					Event info.
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__defaultClear(e, unit, options)
	{

		let target = "";

		if (this.hasAttribute("bm-cleartarget"))
		{
			target = this.getAttribute("bm-cleartarget");
		}

		return unit.cast("basic.clear", {"target":target, "options":options["options"]});

	}

	// -------------------------------------------------------------------------

	/**
 	 * Convert key name from key code.
	 *
	 * @param	{Integer}		code				Key code.
	 */
	static #__getKeyfromKeyCode(code)
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		action				Action.
	 * @param	{Object}		options				Options.
	 */
	static #__initButtons(unit, action, options)
	{

		if (options && options["rootNode"])
		{
			let handler = ( options["handler"] ? options["handler"] : KeyPerk.#__getDefaultHandler(action) );
			let elements = BM.Util.scopedSelectorAll(unit, options["rootNode"]);

			elements.forEach((element) => {
				element.addEventListener("click", function(e){handler.call(this, e, unit, options);});
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
	static #__getActions(settings)
	{

		let actions = {};

		Object.keys(settings).forEach((key) => {
			let keys = ( Array.isArray(settings[key]["key"]) ? settings[key]["key"] : [settings[key]["key"]])

			for (let i = 0; i < keys.length; i++)
			{
				actions[keys[i]] = {};
				actions[keys[i]]["type"] = key;
				actions[keys[i]]["handler"] = ( settings[key]["handler"] ? settings[key]["handler"] : KeyPerk.#__getDefaultHandler(key) );
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
	static #__getDefaultHandler(action)
	{

		let handler;

		switch (action)
		{
		case "submit":
			handler = KeyPerk.#__defaultSubmit;
			break;
		case "clear":
			handler = KeyPerk.#__defaultClear;
			break;
		case "cancel":
			handler = KeyPerk.#__defaultCancel;
			break;
		}

		return handler;

	}

}
