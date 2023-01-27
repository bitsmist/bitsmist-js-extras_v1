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
import FormUtil from "../util/form-util.js";
import ObservableStore from "./observable-store.js";

// =============================================================================
//	Bindable store class
// =============================================================================

export default class BindableStore extends ObservableStore
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{Object}		options				Options.
     */
	constructor(options)
	{

		super(options);

		this.filter = (conditions, observerInfo, ...args) => {
			let ret = false;
			if (conditions === "*" || conditions.indexOf(observerInfo.id) > -1)
			{
				ret = true;
			}
			return ret;
		};

	}

	// -------------------------------------------------------------------------
	//  Method
	// -------------------------------------------------------------------------

	/**
	 * Bind the store to a element.
	 *
	 * @param	{Element}		elem				HTML Element.
	 * @param	{String}		key					Key to store.
	 */
	bindTo(elem)
	{

		let key = elem.getAttribute("bm-bind");

		// Init element's value
//		FormUtil.setValue(elem, this.get(key));

		let bound = ( elem.__bm_bindinfo && elem.__bm_bindinfo.bound ? true : false );
		if (!bound && BM.Util.safeGet(this._options, "2way", true))
		{
			// Change element's value when store value changed
			this.subscribe(key, () => {
				FormUtil.setValue(elem, this.get(key));
			});

			// Set store value when element's value changed
			let eventName = BM.Util.safeGet(this._options, "eventName", "change");
			elem.addEventListener(eventName, (() => {
				this.set(key, FormUtil.getValue(elem), {"notifyOnChange":false});
			}).bind(this));

			elem.__bm_bindinfo = { "bound": true };
		}

	}

}
