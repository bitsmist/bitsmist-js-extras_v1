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

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("spell", "dialog.open", function(...args) { return DialogPerk._open(...args); });
		unit.upgrade("spell", "dialog.openModal", function(...args) { return DialogPerk._openModal(...args); });
		unit.upgrade("spell", "dialog.close", function(...args) { return DialogPerk._close(...args); });
		unit.upgrade("inventory", "dialog.cancelClose");
		unit.upgrade("vault", "dialog.modalPromise");
		unit.upgrade("vault", "dialog.backdrop");
		unit.upgrade("vault", "dialog.backdropPromise", Promise.resolve());
		unit.upgrade("state", "dialog.isModal", false);
		unit.upgrade("state", "dialog.modalResult", {});
		unit.upgrade("event", "afterReady", DialogPerk.DialogPerk_onAfterReady, {"order":this.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static DialogPerk_onAfterReady(sender, e, ex)
	{

		if (this.get("setting", "dialog.options.autoOpen"))
		{
			console.debug(`DialogPerk.DialogPerk_onAfterReady(): Automatically opening unit. name=${this.tagName}, id=${this.id}`);

			return this.use("spell", "dialog.open");
		}

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Open unit.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _open(unit, options)
	{

		options = options || {};
		unit.set("vault", "dialog.options", options);

		console.debug(`DialogPerk._open(): Opening unit. name=${unit.tagName}, id=${unit.id}`);
		return unit.use("spell", "event.trigger", "beforeOpen", options).then(() => {
			if (!unit.get("inventory", "dialog.cancelOpen"))
			{
				return Promise.resolve().then(() => {
					// Show backdrop
					if (unit.get("setting", "dialog.options.showBackdrop"))
					{
						return DialogPerk.__showBackdrop(unit, unit.get("setting", "dialog.backdropOptions"));
					}
				}).then(() => {
					// Setup
					if (BM.Util.safeGet(options, "autoSetupOnOpen", unit.get("setting", "dialog.options.autoSetupOnOpen", false)))
					{
						return unit.use("spell", "basic.setup", options);
					}
				}).then(() => {
					// Refresh
					if (BM.Util.safeGet(options, "autoRefreshOnOpen", unit.get("setting", "dialog.options.autoRefreshOnOpen", true)))
					{
						return unit.use("spell", "basic.refresh", options);
					}
				}).then(() => {
					return unit.use("spell", "event.trigger", "doOpen", options);
				}).then(() => {
					console.debug(`DialogPerk._open(): Opened unit. name=${unit.tagName}, id=${unit.id}`);
					return unit.use("spell", "event.trigger", "afterOpen", options);
				});
			}
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Open unit modal.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _openModal(unit, options)
	{

		console.debug(`DialogPerk._openModal(): Opening unit modal. name=${unit.tagName}, id=${unit.id}`);

		return new Promise((resolve, reject) => {
			unit.set("state", "dialog.isModal", true);
			unit.set("state", "dialog.modalResult", {"result":false});
			unit.set("vault", "dialog.modalPromise", {"resolve":resolve,"reject":reject});
			return DialogPerk._open(unit, options);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Close unit.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static _close(unit, options)
	{

		options = options || {};
		unit.set("inventory", "dialog.cancelClose", false);

		console.debug(`DialogPerk._close(): Closing unit. name=${unit.tagName}, id=${unit.id}`);
		return unit.use("spell", "event.trigger", "beforeClose", options).then(() => {
			if (!unit.get("inventory", "dialog.cancelClose"))
			{
				return unit.use("spell", "event.trigger", "doClose", options).then(() => {
					// Hide backdrop
					if (unit.get("setting", "dialog.options.showBackdrop"))
					{
						DialogPerk.__removeCloseOnClickHandlers();
						return DialogPerk.__hideBackdrop(unit, unit.get("setting", "dialog.backdropOptions"));
					}
				}).then(() => {
					if (unit.get("state", "dialog.isModal"))
					{
						unit.get("vault", "dialog.modalPromise").resolve(unit.get("state", "dialog.modalResult"));
					}
					console.debug(`DialogPerk._close(): Closed unit. name=${unit.tagName}, id=${unit.id}`);

					return unit.use("spell", "event.trigger", "afterClose", options);
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static __createBackdrop(unit, options)
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static __showBackdrop(unit, options)
	{

		DialogPerk.__createBackdrop(unit);

		return unit.get("vault", "dialog.backdropPromise").then(() => {
			unit.set("vault", "dialog.backdropPromise", new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk._backdrop).getPropertyValue("visibility"); // Recalc styles

				let addClasses = ["show"].concat(unit.get("setting", "dialog.backdropOptions.showOptions.addClasses", []));
				DialogPerk._backdrop.classList.add(...addClasses);
				DialogPerk._backdrop.classList.remove(...unit.get("setting", "dialog.backdropOptions.showOptions.removeClasses", []));

				let effect = DialogPerk.__getEffect();
				if (effect)
				{
					// Transition/Animation
					DialogPerk._backdrop.addEventListener(`${effect}end`, () => {
						if (BM.Util.safeGet(options, "closeOnClick", true))
						{
							DialogPerk.__installCloseOnClickHandler(unit);
						}
						resolve();
					}, {"once":true});
				}
				else
				{
					// No Transition/Animation
					if (BM.Util.safeGet(options, "closeOnClick", true))
					{
						DialogPerk.__installCloseOnClickHandler(unit);
					}

					resolve();
				}
			}));

			let sync =BM.Util.safeGet(options, "showOptions.sync", BM.Util.safeGet(options, "sync"));
			if (sync)
			{
				return unit.get("vault", "dialog.backdropPromise");
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Hide backdrop.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static __hideBackdrop(unit, options)
	{

		return unit.get("vault", "dialog.backdropPromise").then(() => {
			unit.set("vault", "dialog.backdropPromise",  new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk._backdrop).getPropertyValue("visibility"); // Recalc styles

				let removeClasses = ["show"].concat(unit.get("setting", "dialog.backdropOptions.hideOptions.removeClasses", []));
				DialogPerk._backdrop.classList.remove(...removeClasses);
				DialogPerk._backdrop.classList.add(...unit.get("setting", "dialog.backdropOptions.hideOptions.addClasses", []));

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
				return unit.get("vault", "dialog.backdropPromise");
			}
		});

	}

	// -----------------------------------------------------------------------------

	/**
	 * Install the event handler to the backdrop to close the unit when clicked.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static __installCloseOnClickHandler(unit, options)
	{

		DialogPerk._backdrop.onclick = (e) => {
			if (e.target === e.currentTarget)
			{
				DialogPerk._close(unit, {"reason":"cancel"});
			}
		};

	}

	// -----------------------------------------------------------------------------

	/**
	 * Remove click event handlers from backdrop.
	 *
	 * @param	{Unit}			unit				Unit.
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
