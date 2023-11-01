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
//	RollCall Perk Class
// =============================================================================

export default class RollCallPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__records = {};
	static #__info = {
		"section":		"rollcall",
		"order":		330,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return RollCallPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("skill", "rollcall.register", function(...args) { return RollCallPerk.#_register(...args); });
		unit.upgrade("spell", "rollcall.call", function(...args) { return RollCallPerk.#_call(...args); });
		unit.upgrade("event", "doApplySettings", RollCallPerk.#RollCallPerk_onDoApplySettings, {"order":RollCallPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static #RollCallPerk_onDoApplySettings(sender, e, ex)
	{

		Object.entries(BM.Util.safeGet(e.detail, "settings.rollcall.members", {})).forEach(([sectionName, sectionValue]) => {
			let name = sectionValue["name"] || sectionName;
			RollCallPerk.#_register(this, name, sectionValue);
		});

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Call unit.
	 *
	 * @param	{Unit}			unit				Compoent to register.
	 * @param	{Object}		optios				Options.
	 */
	static #_call(unit, name, options)
	{

		if (!RollCallPerk.#__records[name])
		{
			let waitInfo = {};
			let timeout = BITSMIST.v1.Unit.get("setting", "system.status.options.waitForTimeout", 10000);
			let promise = new Promise((resolve, reject) => {
				waitInfo["resolve"] = resolve;
				waitInfo["reject"] = reject;
				waitInfo["timer"] = setTimeout(() => {
					reject(`RollCallPerk.call(): Timed out after ${timeout} milliseconds waiting for ${name}`);
				}, timeout);
			});
			waitInfo["promise"] = promise;

			RollCallPerk.#__createEntry(name, null, waitInfo);
		}

		let entry = RollCallPerk.#__records[name];

		return Promise.resolve().then(() => {
			if (BM.Util.safeGet(options, "waitForDOMContentLoaded"))
			{
				return unit.get("inventory", "promise.documentReady");
			}
		}).then(() => {
			if (BM.Util.safeGet(options, "waitForAttendance"))
			{
				return entry.waitInfo.promise;
			}
		}).then(() => {
			return entry.object;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Register unit.
	 *
	 * @param	{Unit}			unit				Compoent to register.
	 * @param	{String}		name				Register as this name.
	 */
	static #_register(unit, name)
	{

		if (!RollCallPerk.#__records[name])
		{
			RollCallPerk.#__createEntry(name);
		}

		let entry = RollCallPerk.#__records[name];
		entry.object = unit;
		entry.waitInfo.resolve();
		if (entry.waitInfo["timer"])
		{
			clearTimeout(entry.waitInfo["timer"]);
		}

	}

	// -------------------------------------------------------------------------
	// 	Privates
	// -------------------------------------------------------------------------

	static #__createEntry(name, unit, waitInfo)
	{

		waitInfo = waitInfo || {
			"promise":	Promise.resolve(),
			"resolve":	()=>{}, // dummy function
			"reject":	()=>{}, // dummy function
			"timer":	null,
		};

		let record = {
			"object":	 	unit,
			"waitInfo":		waitInfo,
		};

		RollCallPerk.#__records[name] = record;

		return record;

	}

}
