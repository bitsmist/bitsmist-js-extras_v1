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
//	Dialog Perk class
// =============================================================================

export default class DialogPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Skills
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

		console.debug(`DialogPerk._open(): Opening component. name=${component.name}, id=${component.id}`);
		return component.skills.use("event.trigger", "beforeOpen", options).then(() => {
			//if (!component._cancelOpen)
			if (!component.inventory.get("dialog.cancelOpen"))
			{
				return Promise.resolve().then(() => {
					// Show backdrop
					if (component.settings.get("dialog.backdropOptions.show"))
					{
						return DialogPerk.__showBackdrop(component, component.settings.get("dialog.backdropOptions"));
					}
				}).then(() => {
					// Setup
					if (BM.Util.safeGet(options, "autoSetupOnOpen", component.settings.get("dialog.options.autoSetupOnOpen", true)))
					{
						return component.skills.use("basic.setup", options);
					}
				}).then(() => {
					// Refresh
					if (BM.Util.safeGet(options, "autoRefreshOnOpen", component.settings.get("dialog.options.autoRefreshOnOpen", true)))
					{
						return component.skills.use("basic.refresh", options);
					}
				}).then(() => {
					return component.skills.use("event.trigger", "doOpen", options);
				}).then(() => {
					console.debug(`DialogPerk._open(): Opened component. name=${component.name}, id=${component.id}`);
					return component.skills.use("event.trigger", "afterOpen", options);
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Open component modal.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _openModal(component, options)
	{

		console.debug(`DialogPerk._openModal(): Opening component modal. name=${component.name}, id=${component.id}`);

		return new Promise((resolve, reject) => {
			component.stats.set("dialog.isModal", true);
			component.stats.set("dialog.modalResult", {"result":false});
			component.vault.set("dialog.modalPromise", {"resolve":resolve,"reject":reject});
			return DialogPerk._open(component, options);
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
		component.inventory.set("dialog.cancelClose", false);

		console.debug(`DialogPerk._close(): Closing component. name=${component.name}, id=${component.id}`);
		return component.skills.use("event.trigger", "beforeClose", options).then(() => {
			if (!component.inventory.get("dialog.cancelClose"))
			{
				return component.skills.use("event.trigger", "doClose", options).then(() => {
					// Hide backdrop
					if (component.settings.get("dialog.backdropOptions.show"))
					{
						DialogPerk.__removeCloseOnClickHandlers();
						return DialogPerk.__hideBackdrop(component, component.settings.get("dialog.backdropOptions"));
					}
				}).then(() => {
					if (component.stats.get("dialog.isModal"))
					{
						component.vault.get("dialog.modalPromise").resolve(component.stats.get("dialog.modalResult"));
					}
					console.debug(`DialogPerk._close(): Closed component. name=${component.name}, id=${component.id}`);

					return component.skills.use("event.trigger", "afterClose", options);
				});
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static DialogPerk_onAfterReady(sender, e, ex)
	{

		if (this.settings.get("dialog.options.autoOpen"))
		{
			console.debug(`DialogPerk.DialogPerk_onAfterReady(): Automatically opening component. name=${this.name}, id=${this.id}`);

			//return this.open();
			return this.skills.use("dialog.open");
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "DialogPerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"dialog",
			"order":		800,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add skills to component;
		component.skills.set("dialog.open", function(...args) { return DialogPerk._open(...args); });
		component.skills.set("dialog.openModal", function(...args) { return DialogPerk._openModal(...args); });
		component.skills.set("dialog.close", function(...args) { return DialogPerk._close(...args); });

		// Add inventory items to component
		component.inventory.set("dialog.cancelClose");

		// Add vault items to component
		component.vault.set("dialog.modalPromise");
		component.vault.set("dialog.backdrop");
		component.vault.set("dialog.backdropPromise", Promise.resolve());

		// Add stats to component
		component.stats.set("dialog.isModal", false);
		component.inventory.set("dialog.modalResult", {});

		// Add event handlers to component
		this._addPerkHandler(component, "afterReady", DialogPerk.DialogPerk_onAfterReady);

	}

	// -------------------------------------------------------------------------
	// 	Privates
	// -------------------------------------------------------------------------

	/**
	 * Create the backdrop if not exists.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __createBackdrop(component, options)
	{

		if (!DialogPerk._backdrop)
		{
			// Create the backdrop
			document.body.insertAdjacentHTML('afterbegin', '<div class="backdrop"></div>');
			DialogPerk._backdrop = document.body.firstElementChild;
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

		DialogPerk.__createBackdrop(component);

		return component.vault.get("dialog.backdropPromise").then(() => {
			component.vault.set("dialog.backdropPromise", new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk._backdrop).getPropertyValue("visibility"); // Recalc styles

				let addClasses = ["show"].concat(component.settings.get("dialog.backdropOptions.showOptions.addClasses", []));
				DialogPerk._backdrop.classList.add(...addClasses);
				DialogPerk._backdrop.classList.remove(...component.settings.get("dialog.backdropOptions.showOptions.removeClasses", []));

				let effect = DialogPerk.__getEffect();
				if (effect)
				{
					// Transition/Animation
					DialogPerk._backdrop.addEventListener(`${effect}end`, () => {
						if (BM.Util.safeGet(options, "closeOnClick", true))
						{
							DialogPerk.__installCloseOnClickHandler(component);
						}
						resolve();
					}, {"once":true});
				}
				else
				{
					// No Transition/Animation
					if (BM.Util.safeGet(options, "closeOnClick", true))
					{
						DialogPerk.__installCloseOnClickHandler(component);
					}

					resolve();
				}
			}));

			let sync =BM.Util.safeGet(options, "showOptions.sync", BM.Util.safeGet(options, "sync"));
			if (sync)
			{
				return component.vault.get("dialog.backdropPromise");
			}
		});

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

		return component.vault.get("dialog.backdropPromise").then(() => {
			component.vault.set("dialog.backdropPromise",  new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk._backdrop).getPropertyValue("visibility"); // Recalc styles

				let removeClasses = ["show"].concat(component.settings.get("dialog.backdropOptions.hideOptions.removeClasses", []));
				DialogPerk._backdrop.classList.remove(...removeClasses);
				DialogPerk._backdrop.classList.add(...component.settings.get("dialog.backdropOptions.hideOptions.addClasses", []));

				let effect = DialogPerk.__getEffect();
				if (effect)
				{
					DialogPerk._backdrop.addEventListener(`${effect}end`, () => {
						resolve();
					}, {"once":true});
				}
				else
				{
					resolve();
				}
			}));

			let sync =BM.Util.safeGet(options, "hideOptions.sync", BM.Util.safeGet(options, "sync"));
			if (sync)
			{
				return component.vault.get("dialog.backdropPromise");
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Install the event handler to the backdrop to close the component when clicked.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __installCloseOnClickHandler(component, options)
	{

		DialogPerk._backdrop.onclick = (e) => {
			if (e.target === e.currentTarget)
			{
				DialogPerk._close(component, {"reason":"cancel"});
			}
		};

	}

	// -----------------------------------------------------------------------------

	/**
	 * Remove click event handlers from backdrop.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Object}		options				Options.
	 */
	static __removeCloseOnClickHandlers()
	{

		DialogPerk._backdrop.onclick = null;

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

		if (window.getComputedStyle(DialogPerk._backdrop).getPropertyValue('transition-duration') !== "0s")
		{
			effect = "transition";
		}
		else if (window.getComputedStyle(DialogPerk._backdrop).getPropertyValue('animation-name') !== "none")
		{
			effect = "animation";
		}

		return effect;

	}

}
