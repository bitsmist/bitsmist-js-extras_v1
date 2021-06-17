// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ObservableStore from "./observable-store";

// =============================================================================
//	Bindable store class
// =============================================================================

export default class BindableStore extends ObservableStore
{

	/**
	 * Bind the store to a element.
	 *
	 * @param	{String}		key					Key to store.
	 * @param	{Element}		elem				HTML Element.
	 */
	bindTo(elem)
	{

		let key = elem.getAttribute("data-bind");

		// Init element's value
		elem.value = this.get(key);

		// Change element's value when value changed
		this.subscribe(key, () => {
			elem.value = this.get(key);
		});

		// Set value when element's value changed
		if (BITSMIST.v1.Util.safeGet(this._options, "2way", true))
		{
			let eventName = BITSMIST.v1.Util.safeGet(this._options, "eventName", "change");

			elem.addEventListener(eventName, (() => {
				this.set(key, elem.value);
			}).bind(this));
		}

	}

}
