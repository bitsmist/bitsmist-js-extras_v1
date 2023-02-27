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
//	Dialog organizer class
// =============================================================================

export default class DialogOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "DialogOrganizer";

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static DialogOrganizer_onAfterReady(sender, e, ex)
	{

		if (this.settings.get("dialogs.settings.autoOpen"))
		{
			return this.open();
		}

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"dialogs",
			"order":		800,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
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
		component._cancelClose;
		component._cancelOpen;
		component._modalResult;
		component._modalPromise;

		// Add event handlers to component
		this._addOrganizerHandler(component, "afterReady", DialogOrganizer.DialogOrganizer_onAfterReady);

		// Init component settings
		component.settings.set("settings.autoRefresh", false);
		component.settings.set("settings.autoRefreshOnOpen", true);
		component.settings.set("settings.autoSetup", false);
		component.settings.set("settings.autoSetupOnOpen", true);

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

		console.debug(`Opening component. name=${component.name}, id=${component.id}`);
		return component.trigger("beforeOpen", options).then(() => {
			if (!component._cancelOpen)
			{
				return Promise.resolve().then(() => {
					// Show backdrop
					if (component.settings.get("dialogs.backdropOptions.show"))
					{
						DialogOrganizer.__createBackdrop(component);
						return DialogOrganizer.__showBackdrop(component, component.settings.get("dialogs.backdropOptions"));
					}

					// Setup
					if (BM.Util.safeGet(options, "autoSetupOnOpen", component.settings.get("settings.autoSetupOnOpen")))
					{
						return component.setup(options);
					}
				}).then(() => {
					// Refresh
					if (BM.Util.safeGet(options, "autoRefreshOnOpen", component.settings.get("settings.autoRefreshOnOpen")))
					{
						return component.refresh(options);
					}
				}).then(() => {
					return component.trigger("doOpen", options);
				}).then(() => {
					console.debug(`Opened component. name=${component.name}, id=${component.id}`);
					return component.trigger("afterOpen", options);
				});
			}
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
		component._cancelClose = false;

		console.debug(`Closing component. name=${component.name}, id=${component.id}`);
		return component.trigger("beforeClose", options).then(() => {
			if (!component._cancelClose)
			{
				return Promise.resolve().then(() => {
					return component.trigger("doClose", options);
				}).then(() => {
					// Hide backdrop
					if (component.settings.get("dialogs.backdropOptions.show"))
					{
						return DialogOrganizer.__hideBackdrop(component, component.settings.get("dialogs.backdropOptions"));
					}
				}).then(() => {
					if (component._isModal)
					{
						component._modalPromise.resolve(component._modalResult);
					}

						console.debug(`Closed component. name=${component.name}, id=${component.id}`);
					return component.trigger("afterClose", options);
				});
			}
		});

	}

	// -------------------------------------------------------------------------
	// 	Privates
	// -------------------------------------------------------------------------

	/**
	 * Create a backdrop if not exists.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __createBackdrop(component, options)
	{

		if (!DialogOrganizer._backdrop)
		{
			// Create a backdrop
			document.body.insertAdjacentHTML('afterbegin', '<div class="backdrop"></div>');
			DialogOrganizer._backdrop = document.body.firstElementChild;
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Show backdrop.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __showBackdrop(component, options)
	{

		// Add close on click event handler
		if (BM.Util.safeGet(options, "closeOnClick", true))
		{
			DialogOrganizer.__closeOnClick(component);
		}

		DialogOrganizer._backdrop.style.display = "block";

		let promise = new Promise((resolve, reject) => {
			setTimeout(()=>{
				DialogOrganizer._backdrop.classList.add("show", component.tagName.toLowerCase());

				let effect = DialogOrganizer.__getEffect();
				if (effect)
				{
					DialogOrganizer._backdrop.addEventListener(effect + "end", () => {
						resolve();
					}, {"once":true});
				}
				else
				{
					resolve();
				}
			}, 0);
		});

		let sync =BM.Util.safeGet(options, "showOptions.sync", BM.Util.safeGet(options, "sync"));
		if (sync)
		{
			return promise;
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Hide backdrop.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __hideBackdrop(component, options)
	{

		DialogOrganizer._backdrop.classList.remove("show", component.tagName.toLowerCase());

		let promise = new Promise((resolve, reject) => {
			let effect = DialogOrganizer.__getEffect();
			if (effect)
			{
				DialogOrganizer._backdrop.addEventListener(effect + "end", () => {
					DialogOrganizer._backdrop.style.display = "none";
					resolve();
				}, {"once":true});
			}
			else
			{
				DialogOrganizer._backdrop.style.display = "none";
				resolve();
			}
		});

		let sync =BM.Util.safeGet(options, "hideOptions.sync", BM.Util.safeGet(options, "sync"));
		if (sync)
		{
			return promise;
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Install an event handler to close when clicked.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __closeOnClick(component, options)
	{

		DialogOrganizer._backdrop.addEventListener("click", (e) => {
			if (e.target === e.currentTarget)
			{
				component.close({"reason":"cancel"});
			}
		}, {"once":true});

	}

	// -------------------------------------------------------------------------

	/**
	 * Get which effect is applied to backdrop.
	 *
	 * @return 	{String}		Effect ("transition" or "animation").
	 */
	static __getEffect()
	{

		let effect = "";

		if (window.getComputedStyle(DialogOrganizer._backdrop).transition !== "all 0s ease 0s")
		{
			effect = "transition";
		}
		else if (window.getComputedStyle(DialogOrganizer._backdrop).animationName !== "none")
		{
			effect = "animation";
		}

		return effect;

	}

}
