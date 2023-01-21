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
//	Dialog organizer class
// =============================================================================

export default class DialogOrganizer extends BITSMIST.v1.Organizer
{

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static attach(component, options)
	{

		// Add properties to component
		Object.defineProperty(component, 'modalResult', {
			get() { return this._modalResult; },
		});
		Object.defineProperty(component, 'isModal', {
			get() { return this._isModal; },
		});

		// Add methods to component
		component.open = function(options) { return DialogOrganizer._open(this, options); }
		component.openModal = function(options) { return DialogOrganizer._openModal(this, options); }
		component.close = function(options) { return DialogOrganizer._close(this, options); }

		// Init component vars
		component._isModal = false;
		component._modalResult;
		component._modalPromise;

		// Add event handlers to component
		this._addOrganizerHandler(component, "beforeStart", DialogOrganizer.onBeforeStart);
		this._addOrganizerHandler(component, "afterStart", DialogOrganizer.onAfterStart);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static onBeforeStart(sender, e, ex)
	{

		this.settings.set("settings.autoRefresh", false);
		this.settings.set("settings.autoRefreshOnOpen", true);
		this.settings.set("settings.autoSetup", false);
		this.settings.set("settings.autoSetupOnOpen", true);

	}

	// -------------------------------------------------------------------------

	static onAfterStart(sender, e, ex)
	{

		if (this.settings.get("settings.autoOpen"))
		{
			return this.open();
		}

	}

	// -------------------------------------------------------------------------
	//  Protected
	// -------------------------------------------------------------------------

	/**
	 * Open component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _open(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`Opening component. name=${component.name}, id=${component.id}`);
			return component.trigger("beforeOpen", options);
		}).then(() => {
			// Setup
			if (BITSMIST.v1.Util.safeGet(options, "autoSetupOnOpen", component.settings.get("settings.autoSetupOnOpen")))
			{
				return component.setup(options);
			}
		}).then(() => {
			// Refresh
			if (BITSMIST.v1.Util.safeGet(options, "autoRefreshOnOpen", component.settings.get("settings.autoRefreshOnOpen")))
			{
				return component.refresh(options);
			}
		}).then(() => {
			return component.trigger("doOpen", options);
		}).then(() => {
			// Auto focus
			let autoFocus = component.settings.get("settings.autoFocus");
			if (autoFocus)
			{
				let target = ( autoFocus === true ? component : component.querySelector(autoFocus) );
				if (target)
				{
					target.focus();
				}
			}
		}).then(() => {
			return component.trigger("afterOpen", options);
		}).then(() => {
			console.debug(`Opened component. name=${component.name}, id=${component.id}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Open component modally.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _openModal(component, options)
	{

		console.debug(`Opening component modally. name=${component.name}, id=${component.id}`);

		return new Promise((resolve, reject) => {
			component._isModal = true;
			component._modalResult = {"result":false};
			component._modalPromise = { "resolve": resolve, "reject": reject };
			return DialogOrganizer._open(component, options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Close component.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _close(component, options)
	{

		options = options || {};

		return Promise.resolve().then(() => {
			console.debug(`Closing component. name=${component.name}, id=${component.id}`);
			return component.trigger("beforeClose", options);
		}).then(() => {
			return component.trigger("doClose", options);
		}).then(() => {
			return component.trigger("afterClose", options);
		}).then(() => {
			if (component._isModal)
			{
				component._modalPromise.resolve(component._modalResult);
			}
		}).then(() => {
			console.debug(`Closed component. name=${component.name}, id=${component.id}`);
		});

	}

}
