// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import DomUtil from "../util/dom-util";
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

		let key = elem.getAttribute("bm-bind");

		// Init element's value
		DomUtil.setElementValue(elem, this.get(key));

		let bound = ( elem.__bm_bindinfo && elem.__bm_bindinfo.bound ? true : false );
		if (!bound && BITSMIST.v1.Util.safeGet(this._options, "2way", true))
		{
			// Change element's value when store value changed
			this.subscribe(key, () => {
				DomUtil.setElementValue(elem, this.get(key));
			});

			// Set store value when element's value changed
			let eventName = BITSMIST.v1.Util.safeGet(this._options, "eventName", "change");
			elem.addEventListener(eventName, (() => {
				this.set(key, DomUtil.getElementValue(elem));
			}).bind(this));

			elem.__bm_bindinfo = { "bound": true };
		}

	}

}
