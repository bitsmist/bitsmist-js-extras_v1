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

		this._options["events"] = {
			"append": this.onAppend,
		}

		this.__isComposing = false;

	}

	// -------------------------------------------------------------------------
	//  Event handlers
	// -------------------------------------------------------------------------

	/**
	* Init after append completed.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	onAppend(sender, e)
	{

		// default keys
		let defaultKeys = this._options["features"]["defaultKeys"];
		if (defaultKeys)
		{
			this._component.addEventHandler(this._component.element, "keydown", this.__defaultKey, {"options":defaultKeys}, this);
			this._component.addEventHandler(this._component.element, "compositionstart", this.__compositionStart, {"options":defaultKeys}, this);
			this._component.addEventHandler(this._component.element, "compositionend", this.__compositionEnd, {"options":defaultKeys}, this);
		}

		// default buttons
		let defaultButtons = this._options["features"]["defaultButtons"];
		if (defaultButtons)
		{
			let initElements = (options, handler) => {
				if (options)
				{
					let elements = this._component._element.querySelectorAll(options["rootNode"]);
					elements = Array.prototype.slice.call(elements, 0);
					elements.forEach((element) => {
						this._component.addEventHandler(element, "click", handler, {"options":options}, this);
					});
				}
			};

			initElements(defaultButtons["submit"], this.__defaultSubmit);
			initElements(defaultButtons["cancel"], this.__defaultCancel);
			initElements(defaultButtons["clear"], this.__defaultClear);
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	* Default key event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	__defaultKey(sender, e)
	{

		// Ignore all key input when composing.
		if (this.__isComposing || e.keyCode == 229)
		{
			return;
		}

		let key = e.key.toLowerCase()
		key = ( key == "esc" ? "escape" : key ); // For IE11

		if (e.extraDetail.options.submit && key == e.extraDetail.options.submit.key)
		{
			// Submit
			e.extraDetail = {"options":e.extraDetail.options.submit};
			this.__defaultSubmit(sender, e);
		}
		else if (e.extraDetail.options.cancel && key == e.extraDetail.options.cancel.key)
		{
			// Cancel
			e.extraDetail = {"options":e.extraDetail.options.cancel};
			this.__defaultCancel(sender, e);
		}
		else if (e.extraDetail.options.clear && key == e.extraDetail.options.clear.key)
		{
			// Clear
			e.extraDetail = {"options":e.extraDetail.options.clear};
			this.__defaultClear(sender, e);
		}

	}

	// -------------------------------------------------------------------------

	/**
	* Composition start event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	__compositionStart(sender, e)
	{

		this.__isComposing = true;

	}

	// -------------------------------------------------------------------------

	/**
	* Composition end event handler.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	__compositionEnd(sender, e)
	{

		this.__isComposing = false;

	}

	// -------------------------------------------------------------------------

	/**
	* Default submit.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	__defaultSubmit(sender, e)
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
				if (e.extraDetail["options"] && e.extraDetail["options"] && e.extraDetail["options"]["autoClose"])
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
	*/
	__defaultCancel(sender, e)
	{

		this._component.close();

	}

	// -------------------------------------------------------------------------

	/**
	* Default clear.
	*
	* @param	{Object}		sender				Sender.
	* @param	{Object}		e					Event info.
	*/
	__defaultClear(sender, e)
	{

		let target;

		if (e.extraDetail["options"] && e.extraDetail["options"] && e.extraDetail["options"]["target"])
		{
			target = sender.getAttribute(e.extraDetail["options"]["target"]);
		}

		this._component.clear(target);

	}

}
