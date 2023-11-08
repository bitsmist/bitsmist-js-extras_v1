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
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__backdrop;
	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":		"dialog",
		"order":			800,
	};
	static #__spells = {
		"open":				DialogPerk.#_open,
		"openModal":		DialogPerk.#_openModal,
		"close":			DialogPerk.#_close,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return DialogPerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get spells()
	{

		return DialogPerk.#__spells;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		DialogPerk.#__vault.set(unit, {
			"backdrop":			null,
			"backdropPromise":	Promise.resolve(),
			"modalPromise":		null,
		});

		// Upgrade unit
		unit.upgrade("inventory", "dialog.cancelClose");
		unit.upgrade("inventory", "dialog.isModal", false);
		unit.upgrade("inventory", "dialog.modalResult", {});
		unit.upgrade("inventory", "dialog.options");

		// Add event handlers
		unit.use("event.add", "afterReady", {"handler":DialogPerk.#DialogPerk_onAfterReady, "order":DialogPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #DialogPerk_onAfterReady(sender, e, ex)
	{

		if (this.get("setting", "dialog.options.autoOpen"))
		{
			console.debug(`DialogPerk.DialogPerk_onAfterReady(): Automatically opening unit. name=${this.tagName}, id=${this.id}`);

			return this.cast("dialog.open");
		}

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Open unit.
	 *
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static async #_open(unit, options)
	{

		options = options || {};
		unit.set("inventory", "dialog.options", options);

		console.debug(`DialogPerk.#_open(): Opening unit. name=${unit.tagName}, id=${unit.id}`);
		await unit.cast("event.trigger", "beforeOpen", options);
		if (!unit.get("inventory", "dialog.cancelOpen"))
		{
			// Show backdrop
			if (unit.get("setting", "dialog.options.showBackdrop"))
			{
				await DialogPerk.#__showBackdrop(unit, unit.get("setting", "dialog.backdropOptions"));
			}

			// Setup
			if (BM.Util.safeGet(options, "autoSetupOnOpen", unit.get("setting", "dialog.options.autoSetupOnOpen", false)))
			{
				await unit.cast("basic.setup", options);
			}

			// Refresh
			if (BM.Util.safeGet(options, "autoRefreshOnOpen", unit.get("setting", "dialog.options.autoRefreshOnOpen", true)))
			{
				await unit.cast("basic.refresh", options);
			}

			await unit.cast("event.trigger", "doOpen", options);
			console.debug(`DialogPerk.#_open(): Opened unit. name=${unit.tagName}, id=${unit.id}`);
			await unit.cast("event.trigger", "afterOpen", options);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Open unit modal.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #_openModal(unit, options)
	{

		console.debug(`DialogPerk.#_openModal(): Opening unit modal. name=${unit.tagName}, id=${unit.id}`);

		return new Promise((resolve, reject) => {
			unit.set("inventory", "dialog.isModal", true);
			unit.set("inventory", "dialog.modalResult", {"result":false});
			DialogPerk.#__vault.get(unit)["modalPromise"] = {"resolve":resolve,"reject":reject};

			return DialogPerk.#_open(unit, options);
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
	static async #_close(unit, options)
	{

		options = options || {};
		unit.set("inventory", "dialog.cancelClose", false);

		console.debug(`DialogPerk.#_close(): Closing unit. name=${unit.tagName}, id=${unit.id}`);
		await unit.cast("event.trigger", "beforeClose", options);
		if (!unit.get("inventory", "dialog.cancelClose"))
		{
			await unit.cast("event.trigger", "doClose", options)

			// Hide backdrop
			if (unit.get("setting", "dialog.options.showBackdrop"))
			{
				DialogPerk.#__removeCloseOnClickHandlers();
				await DialogPerk.#__hideBackdrop(unit, unit.get("setting", "dialog.backdropOptions"));
			}

			if (unit.get("inventory", "dialog.isModal"))
			{
				DialogPerk.#__vault.get(unit)["modalPromise"].resolve(unit.get("inventory", "dialog.modalResult"));
			}
			console.debug(`DialogPerk.#_close(): Closed unit. name=${unit.tagName}, id=${unit.id}`);

			await unit.cast("event.trigger", "afterClose", options);
		}

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
	static #__createBackdrop(unit, options)
	{

		if (!DialogPerk.#__backdrop)
		{
			// Create the backdrop
			document.body.insertAdjacentHTML('afterbegin', '<div class="backdrop"></div>');
			DialogPerk.#__backdrop = document.body.firstElementChild;
		}

	}

	// -----------------------------------------------------------------------------

	/**
	 * Show backdrop.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Object}		options				Options.
	 */
	static #__showBackdrop(unit, options)
	{

		DialogPerk.#__createBackdrop(unit);

		return DialogPerk.#__vault.get(unit)["backdropPromise"].then(() => {
			DialogPerk.#__vault.get(unit)["backdropPromise"] = new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk.#__backdrop).getPropertyValue("visibility"); // Recalc styles

				let addClasses = ["show"].concat(unit.get("setting", "dialog.backdropOptions.showOptions.addClasses", []));
				DialogPerk.#__backdrop.classList.add(...addClasses);
				DialogPerk.#__backdrop.classList.remove(...unit.get("setting", "dialog.backdropOptions.showOptions.removeClasses", []));

				let effect = DialogPerk.#__getEffect();
				if (effect)
				{
					// Transition/Animation
					DialogPerk.#__backdrop.addEventListener(`${effect}end`, () => {
						if (BM.Util.safeGet(options, "closeOnClick", true))
						{
							DialogPerk.#__installCloseOnClickHandler(unit);
						}
						resolve();
					}, {"once":true});
				}
				else
				{
					// No Transition/Animation
					if (BM.Util.safeGet(options, "closeOnClick", true))
					{
						DialogPerk.#__installCloseOnClickHandler(unit);
					}

					resolve();
				}
			});

			let sync =BM.Util.safeGet(options, "showOptions.sync", BM.Util.safeGet(options, "sync"));
			if (sync)
			{
				return DialogPerk.#__vault.get(unit)["backdropPromise"];
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
	static #__hideBackdrop(unit, options)
	{

		return DialogPerk.#__vault.get(unit)["backdropPromise"].then(() => {
			DialogPerk.#__vault.get(unit)["backdropPromise"] = new Promise((resolve, reject) => {
				window.getComputedStyle(DialogPerk.#__backdrop).getPropertyValue("visibility"); // Recalc styles

				let removeClasses = ["show"].concat(unit.get("setting", "dialog.backdropOptions.hideOptions.removeClasses", []));
				DialogPerk.#__backdrop.classList.remove(...removeClasses);
				DialogPerk.#__backdrop.classList.add(...unit.get("setting", "dialog.backdropOptions.hideOptions.addClasses", []));

				let effect = DialogPerk.#__getEffect();
				if (effect)
				{
					DialogPerk.#__backdrop.addEventListener(`${effect}end`, () => {
						resolve();
					}, {"once":true});
				}
				else
				{
					resolve();
				}
			});

			let sync =BM.Util.safeGet(options, "hideOptions.sync", BM.Util.safeGet(options, "sync"));
			if (sync)
			{
				return DialogPerk.#__vault.get(unit)["backdropPromise"];
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
	static #__installCloseOnClickHandler(unit, options)
	{

		DialogPerk.#__backdrop.onclick = (e) => {
			if (e.target === e.currentTarget)
			{
				DialogPerk.#_close(unit, {"reason":"cancel"});
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
	static #__removeCloseOnClickHandlers()
	{

		DialogPerk.#__backdrop.onclick = null;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get which effect is applied to backdrop.
	 *
	 * @return 	{String}		Effect ("transition" or "animation").
	 */
	static #__getEffect()
	{

		let effect = "";

		if (window.getComputedStyle(DialogPerk.#__backdrop).getPropertyValue('transition-duration') !== "0s")
		{
			effect = "transition";
		}
		else if (window.getComputedStyle(DialogPerk.#__backdrop).getPropertyValue('animation-name') !== "none")
		{
			effect = "animation";
		}

		return effect;

	}

}
