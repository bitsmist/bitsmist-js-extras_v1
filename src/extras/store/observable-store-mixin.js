// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import ObservableStore from "../store/observable-store.js";

// =============================================================================
//	ObservableStoreMixin
// =============================================================================

export default ObservableStoreMixin;

const ObservableStoreMixin = (superClass) => class extends superClass {

	constructor(options)
	{

		let defaults = {"notifyOnChange":true, "async":false};
		super(Object.assign(defaults, options));

		Object.assign(this, ObservableStore.prototype);

		this._observers = [];

	}

};
