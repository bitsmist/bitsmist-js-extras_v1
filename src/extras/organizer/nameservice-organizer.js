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
//	Name Service Organizer Class
// =============================================================================

export default class NameServiceOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "NameServiceOrganizer";

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static NameServiceOrganizer_onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["names"], (sectionName, sectionValue) => {
			NameServiceOrganizer.register(sectionValue["name"], this, sectionValue);
		});

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"names",
			"order":		330,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init vars
		NameServiceOrganizer._records = {};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", NameServiceOrganizer.NameServiceOrganizer_onDoOrganize);

	}

	// -------------------------------------------------------------------------

	/**
	 * Register an organizer.
	 *
	 * @param	{Organizer}		organizer			Organizer to register.
	 */
	static register(name, component)
	{

		if (!NameServiceOrganizer._records[name])
		{
			NameServiceOrganizer._records[name] = {
				"object":	 	component,
				"waitInfo": {
					"promise":	Promise.resolve(),
					"resolve":	()=>{}, // dummy function
					"reject":	()=>{}, // dummy function
					"timer":	null,
				}
			};
		}

		NameServiceOrganizer._records[name].object = component;
		NameServiceOrganizer._records[name].waitInfo.resolve();
		if (NameServiceOrganizer._records[name].waitInfo["timer"])
		{
			clearTimeout(NameServiceOrganizer._records[name].waitInfo["timer"]);
		}

	}

	// -------------------------------------------------------------------------

/*
	static createWaitInfo(component, waitInfo)
	{

		waitInfo = waitInfo || {
			"promise":	Promise.resolve(),
			"resolve":	()=>{}, // dummy function
			"reject":	()=>{}, // dummy function
			"timer":	null,
		};

		NameServiceOrganizer._records[name] = {
			"object":	 	component,
			"waitInfo":		waitInfo,
		};

	}
*/

	// -------------------------------------------------------------------------

	static resolve(name, options)
	{

		if (!NameServiceOrganizer._records[name])
		{
			let waitInfo = {};
			let timeout = BITSMIST.v1.settings.get("system.waitForTimeout", 10000);
			let promise = new Promise((resolve, reject) => {
					waitInfo["resolve"] = resolve;
					waitInfo["reject"] = reject;
					waitInfo["timer"] = setTimeout(() => {
						reject(`NameServiceOrganizer.resolve(): Timed out after ${timeout} milliseconds waiting for ${name}`);
					}, timeout);
				});
			waitInfo["promise"] = promise;

			NameServiceOrganizer._records[name] = {
				"waitInfo": waitInfo
			}
		}

		return NameServiceOrganizer._records[name].waitInfo.promise.then(() => {
			return NameServiceOrganizer._records[name].object;
		});

	}

}
