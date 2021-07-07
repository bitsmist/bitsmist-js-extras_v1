// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import Plugin from '../plugin';

// =============================================================================
//	Defaultkey Handler class
// =============================================================================

export default class DefaultkeyHandler extends Plugin
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		component			Component which the plugin
	 * 												is attached to.
	 * @param	{Object}		options				Options for the component.
     */
	constructor(component, options)
	{

		super(component, options);

		this.__isComposing = false;

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
	onAfterAppend(sender, e, ex)
	{

		// default keys
		let defaultKeys = this._options.get("features.defaultKeys");
		if (defaultKeys)
		{
			this._component.addEventHandler("keydown", {"handler": this.onKeyDown, "options":defaultKeys}, null, this);
			this._component.addEventHandler("keypress", {"handler":this.onKeyPress, "options":defaultKeys}, null, this);
			this._component.addEventHandler("compositionstart", {"handler":this.onCompositionStart, "options":defaultKeys}, null, this);
			this._component.addEventHandler("compositionend", {"handler":this.onCompositionEnd, "options":defaultKeys}, null, this);
		}

		// default buttons
		let defaultButtons = this._options.get("features.defaultButtons");
		if (defaultButtons)
		{
			this.__initElements(defaultButtons["submit"], this.onDefaultSubmit);
			this.__initElements(defaultButtons["cancel"], this.onDefaultCancel);
			this.__initElements(defaultButtons["clear"], this.onDefaultClear);
		}

	}

	// -------------------------------------------------------------------------
	//  Event handlers (elements)
	// -------------------------------------------------------------------------

	/**
 	 * Key down event handler. Handle keys which do not fire keyPress event.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	onKeyDown(sender, e, ex)
	{

		let key  = ( e.key ? e.key : this.__getKeyfromKeyCode(e.keyCode) );
		key = key.toLowerCase()
		key = ( key == "esc" ? "escape" : key ); // For IE11

		switch (key)
		{
			case "escape":
				this.onKeyPress(sender, e, ex);
				break;
		}

	}

	// -------------------------------------------------------------------------

	/**
 	 * Key press event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	onKeyPress(sender, e, ex)
	{

		// Ignore all key input when composing.
		if (this.__isComposing || e.keyCode == 229)
		{
			return;
		}

		let key  = ( e.key ? e.key : this.__getKeyfromKeyCode(e.keyCode) );
		key = key.toLowerCase()
		key = ( key == "esc" ? "escape" : key ); // For IE11

		if (ex.options.submit && key == ex.options.submit.key)
		{
			// Submit
			this.onDefaultSubmit(sender, e, {"options":ex.options["submit"]});
		}
		else if (ex.options.cancel && key == ex.options.cancel.key)
		{
			// Cancel
			this.onDefaultCancel(sender, e, {"options":ex.options["cancel"]});
		}
		else if (ex.options.clear && key == ex.options.clear.key)
		{
			// Clear
			this.onDefaultClear(sender, e, {"options":ex.options["clear"], "component":component});
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
	onCompositionStart(sender, e, ex)
	{

		this.__isComposing = true;

	}

	// -------------------------------------------------------------------------

	/**
	 * Composition end event handler.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	onCompositionEnd(sender, e, ex)
	{

		this.__isComposing = false;

	}

	// -------------------------------------------------------------------------

	/**
	 * Default submit.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	onDefaultSubmit(sender, e, ex)
	{

		this._component.submit().then(() => {
			if (!this._component.__cancelSubmit)
			{
				// Modal result
				if (this._component._isModal)
				{
					this._component._modalResult["result"] = true;
				}

				// Auto close
				if (ex && ex.options["autoClose"])
				{
					this._component.close();
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
	onDefaultCancel(sender, e, ex)
	{

		this._component.close();

	}

	// -------------------------------------------------------------------------

	/**
	 * Default clear.
	 *
	 * @param	{Object}		sender				Sender.
	 * @param	{Object}		e					Event info.
 	 * @param	{Object}		ex					Extra event info.
	 */
	onDefaultClear(sender, e, ex)
	{

		let target;

		if (ex && ex.options["target"])
		{
			target = sender.getAttribute(ex.options["target"]);
		}

		this._component.clear(ex.component, target);

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
 	 * Convert key name from key code.
	 *
	 * @param	{Integer}		code				Key code.
	 */
	__getKeyfromKeyCode(code)
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
	 * @param	{Object}		options				Options.
	 * @param	{Function}		handler				Handler.
	 */
	__initElements(options, handler)
	{

		if (options)
		{
			let elements = this._component.querySelectorAll(options["rootNode"]);
			elements = Array.prototype.slice.call(elements, 0);
			elements.forEach((element) => {
				this._component.addEventHandler("click", {"handler":handler, "options":options}, element, this);
			});
		}

	}

	// -----------------------------------------------------------------------------
	//  Protected
	// -----------------------------------------------------------------------------

	/**
	 * Get plugin options.
	 *
	 * @return  {Object}		Options.
	 */
	_getOptions()
	{

		return {
			"events": {
				"afterAppend": this.onAfterAppend,
			}
		};

	}

}
