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
//	Chain organizer class
// =============================================================================

export default class ChainOrganizer extends BM.Organizer
{

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "ChainOrganizer";

	}

	// -----------------------------------------------------------------------------
	//	Event handlers
	// -----------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		this._enumSettings(e.detail.settings["chains"], (sectionName, sectionValue) => {
			this.addEventHandler(sectionName, {"handler":ChainOrganizer.onDoProcess, "options":sectionValue});
		});

	}

	// -----------------------------------------------------------------------------

	static onDoProcess(sender, e, ex)
	{

		let targets = ex.options;
		let promises = [];
		let chain = Promise.resolve();

		for (let i = 0; i < targets.length; i++)
		{
			let method = targets[i]["method"] || "refresh";
			let state = targets[i]["state"] || "ready";
			let sync = targets[i]["sync"];

			let nodes = document.querySelectorAll(targets[i]["rootNode"]);
			nodes = Array.prototype.slice.call(nodes, 0);
			BM.Util.assert(nodes.length > 0, `ChainOrganizer.onDoOrganizer(): Node not found. name=${this.name}, eventName=${e.type}, rootNode=${targets[i]["rootNode"]}, method=${method}`)

			if (sync)
			{
				chain = chain.then(() => {
					return ChainOrganizer.__execTarget(this, nodes, method, state);
				});
			}
			else
			{
				chain = ChainOrganizer.__execTarget(this, nodes, method, state);
			}
			promises.push(chain);
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"chains",
			"order":		800,
		};

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addOrganizerHandler(component, "doOrganize", ChainOrganizer.onDoOrganize);

	}

	// -----------------------------------------------------------------------------

	static deinit(component, options)
	{

		let chains = e.details.setting["chains"];
		if (chains)
		{
			Object.keys(chains).forEach((eventName) => {
				component.removeEventHandler(eventName, {"handler":ChainOrganizer.onDoOrganize, "options":chains[eventName]});
			});
		}

	}

	// -----------------------------------------------------------------------------
	//	Privates
	// -----------------------------------------------------------------------------

	/**
	 * Execute target methods.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{Array}			nodes				Nodes.
	 * @param	{String}		string				Method name to exec.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __execTarget(component, nodes, method, state)
	{

		let promises = [];

		nodes.forEach((element) => {
			let promise = component.waitFor([{"object":element, "state":state}]).then(() => {
				return element[method]({"sender":component});
			});
			promises.push(promise);
		});

		return Promise.all(promises);

	}

}
