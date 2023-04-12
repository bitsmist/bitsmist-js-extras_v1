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
//	Attendance Organizer Class
// =============================================================================

export default class AttendanceOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "AttendanceOrganizer";

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static AttendanceOrganizer_onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["names"], (sectionName, sectionValue) => {
			AttendanceOrganizer.register(sectionValue["name"], this, sectionValue);
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
		AttendanceOrganizer._records = {};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", AttendanceOrganizer.AttendanceOrganizer_onDoOrganize);

	}

	// -------------------------------------------------------------------------

	/**
	 * Register an organizer.
	 *
	 * @param	{Organizer}		organizer			Organizer to register.
	 */
	static register(name, component)
	{

		if (!AttendanceOrganizer._records[name])
		{
			AttendanceOrganizer._records[name] = {
				"object":	 	component,
				"waitInfo": {
					"promise":	Promise.resolve(),
					"resolve":	()=>{}, // dummy function
					"reject":	()=>{}, // dummy function
					"timer":	null,
				}
			};
		}

		AttendanceOrganizer._records[name].object = component;
		AttendanceOrganizer._records[name].waitInfo.resolve();
		if (AttendanceOrganizer._records[name].waitInfo["timer"])
		{
			clearTimeout(AttendanceOrganizer._records[name].waitInfo["timer"]);
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

		AttendanceOrganizer._records[name] = {
			"object":	 	component,
			"waitInfo":		waitInfo,
		};

	}
*/

	// -------------------------------------------------------------------------

	static call(name, options)
	{

		if (!AttendanceOrganizer._records[name])
		{
			let waitInfo = {};
			let timeout = BITSMIST.v1.settings.get("system.waitForTimeout", 10000);
			let promise = new Promise((resolve, reject) => {
					waitInfo["resolve"] = resolve;
					waitInfo["reject"] = reject;
					waitInfo["timer"] = setTimeout(() => {
						reject(`AttendanceOrganizer.resolve(): Timed out after ${timeout} milliseconds waiting for ${name}`);
					}, timeout);
				});
			waitInfo["promise"] = promise;

			AttendanceOrganizer._records[name] = {
				"waitInfo": waitInfo
			}
		}

		return AttendanceOrganizer._records[name].waitInfo.promise.then(() => {
			return AttendanceOrganizer._records[name].object;
		});

	}

}
