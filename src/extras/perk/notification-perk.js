// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import {Perk, Util} from "@bitsmist-js_v1/core";

// =============================================================================
//	Notification Perk class
// =============================================================================

export default class NotificationPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__info = {
		"sectionName":	"notification",
		"order":		800,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return NotificationPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Init unit vault
		NotificationPerk.#__vault.set(unit, {
			"observers":		[],
			"filter":			Util.safeGet(options, "settings.notification.options.filter", () => { return true; } ),
			"handler":			Util.safeGet(options, "settings.notification.options.handler", NotificationPerk.#__triggerEvent ),
			"cast":				Util.safeGet(options, "settings.notification.options.cast"),
			"use":				Util.safeGet(options, "settings.notification.options.use"),
		});

		// Upgrade unit
		unit.upgrade("skill", "notification.subscribe", NotificationPerk.#_subscribe);
		unit.upgrade("skill", "notification.unsubscribe", NotificationPerk.#_unsubscribe);
		unit.upgrade("skill", "notification.notify", NotificationPerk.#_notifySync);
		unit.upgrade("spell", "notification.notify", NotificationPerk.#_notifyAsync);

	}

	// -----------------------------------------------------------------------------

	static deinit(unit, options)
	{
	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Subscribe.
	 *
	 * @param	{String}		id					Subscriber's id.
	 * @param	{Function}		handler				Handler function on notification.
	 * @param	{Object}		optons				Options passed to the handler on notification.
	 */
	static #_subscribe(unit, subscriber, options)
	{

		let id = `${subscriber.tagName}_${subscriber.uniqueId}`;
		let handler = Util.safeGet(options, "handler", NotificationPerk.#__vault.get(unit)["handler"]).bind(unit);

		NotificationPerk.#__vault.get(unit)["observers"].push({"id":id, "unit":subscriber, "handler":handler, "options":options});

	}

	// -------------------------------------------------------------------------

	/**
	 * Unsubscribe.
	 *
	 * @param	{String}		id					Subscriber's id.
	 */
	static #_unsubscribe(unit, id)
	{

		let observers = NotificationPerk.#__vault.get(unit)["observers"];

		for (let i = 0; i < observers.length; i++)
		{
			if (observers[i].id === id)
			{
				observers.splice(i, 1);
				break;
			}
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify observers.
	 *
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #_notifyAsync(unit, conditions, ...args)
	{

		let chain = Promise.resolve();
		let observers = NotificationPerk.#__vault.get(unit)["observers"];
		let filter = NotificationPerk.#__vault.get(unit)["filter"];

		for (let i = 0; i < observers.length; i++)
		{
			chain = chain.then(() => {
				if (filter(conditions, observers[i], ...args))
				{
					console.debug(`NotificationPerk.#_notifyAsync(): Notifying asynchronously. name=${unit.tagName}, conditions=${conditions}, observer=${observers[i].id}`);
					return observers[i]["handler"](conditions, observers[i], ...args);
				}
			});
		}

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Notify observers synchronously.
	 *
	 * @param	{Object}		conditions			Current conditions.
	 * @param	{Object}		...args				Arguments to callback function.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #_notifySync(unit, conditions, ...args)
	{

		let observers = NotificationPerk.#__vault.get(unit)["observers"];
		let filter = NotificationPerk.#__vault.get(unit)["filter"];

		for (let i = 0; i < observers.length; i++)
		{
			if (filter(conditions, observers[i], ...args))
			{
				console.debug(`NotificationPerk.#_notifySync(): Notifying synchronously. name=${unit.tagName}, conditions=${conditions}, observer=${observers[i].id}`);
				observers[i]["handler"](conditions, observers[i], ...args);
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Trigger an event.
	 *
	 * @param	{String}		conditions			Notify conditions.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static #__triggerEvent(conditions, observerInfo, ...args)
	{

		let spell = NotificationPerk.#__vault.get(this)["cast"];
		let observer = observerInfo["unit"];

		if (spell)
		{
			return observer.cast(spell, conditions);
		}

	}

}
