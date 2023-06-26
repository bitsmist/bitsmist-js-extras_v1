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
	//  Properties
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

		// Upgrade component
		this.upgrade(component, "spell", "dialog.open", function(...args) { return DialogPerk._open(...args); });
		this.upgrade(component, "spell", "dialog.openModal", function(...args) { return DialogPerk._openModal(...args); });
		this.upgrade(component, "spell", "dialog.close", function(...args) { return DialogPerk._close(...args); });
		this.upgrade(component, "inventory", "dialog.cancelClose");
		this.upgrade(component, "vault", "dialog.modalPromise");
		this.upgrade(component, "vault", "dialog.backdrop");
		this.upgrade(component, "vault", "dialog.backdropPromise", Promise.resolve());
		this.upgrade(component, "stats", "dialog.isModal", false);
		this.upgrade(component, "stats", "dialog.modalResult", {});
		this.upgrade(component, "event", "afterReady", DialogPerk.DialogPerk_onAfterReady);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static DialogPerk_onAfterReady(sender, e, ex)
	{

		if (this.get("settings", "dialog.options.autoOpen"))
		{
			console.debug(`DialogPerk.DialogPerk_onAfterReady(): Automatically opening component. name=${this.tagName}, id=${this.id}`);

			//return this.open();
			return this.use("spell", "dialog.open");
		}

	}

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

		console.debug(`DialogPerk._open(): Opening component. name=${component.tagName}, id=${component.id}`);
		return component.use("spell", "event.trigger", "beforeOpen", options).then(() => {
			if (!component.get("inventory", "dialog.cancelOpen"))
			{
				return Promise.resolve().then(() => {
					// Show backdrop
					if (component.get("settings", "dialog.backdropOptions.show"))
					{
						return DialogPerk.__showBackdrop(component, component.get("settings", "dialog.backdropOptions"));
					}
				}).then(() => {
					// Setup
					if (BM.Util.safeGet(options, "autoSetupOnOpen", component.get("settings", "dialog.options.autoSetupOnOpen", true)))
					{
						return component.use("spell", "basic.setup", options);
					}
				}).then(() => {
					// Refresh
					if (BM.Util.safeGet(options, "autoRefreshOnOpen", component.get("settings", "dialog.options.autoRefreshOnOpen", true)))
					{
						return component.use("spell", "basic.refresh", options);
					}
				}).then(() => {
					return component.use("spell", "event.trigger", "doOpen", options);
				}).then(() => {
					console.debug(`DialogPerk._open(): Opened component. name=${component.tagName}, id=${component.id}`);
					return component.use("spell", "event.trigger", "afterOpen", options);
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

		console.debug(`DialogPerk._openModal(): Opening component modal. name=${component.tagName}, id=${component.id}`);

		return new Promise((resolve, reject) => {
			component.set("stats", "dialog.isModal", true);
			component.set("stats", "dialog.modalResult", {"result":false});
			component.set("vault", "dialog.modalPromise", {"resolve":resolve,"reject":reject});
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
		component.set("inventory", "dialog.cancelClose", false);

		console.debug(`DialogPerk._close(): Closing component. name=${component.tagName}, id=${component.id}`);
		return component.use("spell", "event.trigger", "beforeClose", options).then(() => {
			if (!component.get("inventory", "dialog.cancelClose"))
			{
				return component.use("spell", "event.trigger", "doClose", options).then(() => {
					// Hide backdrop
					if (component.get("settings", "dialog.backdropOptions.show"))
					{
						DialogPerk.__removeCloseOnClickHandlers();
						return DialogPerk.__hideBackdrop(component, component.get("settings", "dialog.backdropOptions"));
					}
				}).then(() => {
					if (component.get("stats", "dialog.isModal"))
					{
						component.get("vault", "dialog.modalPromise").resolve(component.get("stats", "dialog.modalResult"));
					}
					console.debug(`DialogPerk._close(): Closed component. name=${component.tagName}, id=${component.id}`);

					return component.use("spell", "event.trigger", "afterClose", options);
				});
			}
		});

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

		return component.get("vault", "dialog.backdropPromise").then(() => {
			component.set("vault", "dialog.backdropPromise", new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk._backdrop).getPropertyValue("visibility"); // Recalc styles

				let addClasses = ["show"].concat(component.get("settings", "dialog.backdropOptions.showOptions.addClasses", []));
				DialogPerk._backdrop.classList.add(...addClasses);
				DialogPerk._backdrop.classList.remove(...component.get("settings", "dialog.backdropOptions.showOptions.removeClasses", []));

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
				return component.get("vault", "dialog.backdropPromise");
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

		return component.get("vault", "dialog.backdropPromise").then(() => {
			component.set("vault", "dialog.backdropPromise",  new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk._backdrop).getPropertyValue("visibility"); // Recalc styles

				let removeClasses = ["show"].concat(component.get("settings", "dialog.backdropOptions.hideOptions.removeClasses", []));
				DialogPerk._backdrop.classList.remove(...removeClasses);
				DialogPerk._backdrop.classList.add(...component.get("settings", "dialog.backdropOptions.hideOptions.addClasses", []));

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
				return component.get("vault", "dialog.backdropPromise");
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
