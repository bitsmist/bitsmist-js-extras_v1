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
		"sectionName":		"rollcall",
		"order":			330,
	};
	static #__skills = {
		"register":			RollCallPerk.#_register,
	};
	static #__spells = {
		"call":				RollCallPerk.#_call,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return RollCallPerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get skills()
	{

		return RollcallPerk.#__skills;

	}

	// -------------------------------------------------------------------------

	static get spells()
	{

		return RollcallPerk.#__spells;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Add event handlers
		unit.use("event.add", "doApplySettings", {"handler":RollCallPerk.#RollCallPerk_onDoApplySettings, "order":RollCallPerk.info["order"]});

	}

	// -------------------------------------------------------------------------
	//	Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static #RollCallPerk_onDoApplySettings(sender, e, ex)
	{

		Object.entries(BM.Util.safeGet(e.detail, "settings.rollcall.members", {})).forEach(([sectionName, sectionValue]) => {
			let name = sectionValue["name"] || sectionName;
			RollCallPerk.#_register(this, name, sectionValue);
		});

	}

	// -------------------------------------------------------------------------
	//  Skills (Unit)
	// -------------------------------------------------------------------------

	/**
	 * Call unit.
	 *
	 * @param	{Unit}			unit				Compoent to register.
	 * @param	{Object}		optios				Options.
	 */
	static async #_call(unit, name, options)
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

		if (BM.Util.safeGet(options, "waitForDOMContentLoaded"))
		{
			await unit.get("inventory", "promise.documentReady");
		}
		if (BM.Util.safeGet(options, "waitForAttendance"))
		{
			await entry.waitInfo.promise;
		}

		return entry.object;

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
