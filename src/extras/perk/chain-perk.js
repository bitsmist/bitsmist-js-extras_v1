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
//	Chain Perk class
// =============================================================================

export default class ChainPerk extends BM.Perk
{

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static onDoOrganize(sender, e, ex)
	{

		let order = ChainPerk.info["order"];

		Object.entries(BM.Util.safeGet(e.detail, "settings.chain.targets", {})).forEach(([sectionName, sectionValue]) => {
			this.skills.use("event.add", sectionName, {
				"handler":ChainPerk.onDoProcess,
				"order":	order,
				"options":sectionValue
			});
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
			let method = targets[i]["skillName"] || "basic.refresh";
			let state = targets[i]["state"] || "ready";
			let sync = targets[i]["sync"];

			let nodes = document.querySelectorAll(targets[i]["rootNode"]);
			nodes = Array.prototype.slice.call(nodes, 0);
			BM.Util.assert(nodes.length > 0, `ChainPerk.onDoProcess(): Node not found. name=${this.tagName}, eventName=${e.type}, rootNode=${targets[i]["rootNode"]}, method=${method}`)

			if (sync)
			{
				chain = chain.then(() => {
					return ChainPerk.__execTarget(this, nodes, method, state);
				});
			}
			else
			{
				chain = ChainPerk.__execTarget(this, nodes, method, state);
			}
			promises.push(chain);
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"chain",
			"order":		800,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add event handlers to component
		this._addPerkHandler(component, "doOrganize", ChainPerk.onDoOrganize);

	}

	// -----------------------------------------------------------------------------

	static deinit(component, options)
	{

		let chains = e.details.setting["chains"];
		if (chains)
		{
			Object.keys(chains).forEach((eventName) => {
				component.removeEventHandler(eventName, {"handler":ChainPerk.onDoOrganize, "options":chains[eventName]});
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
	 * @param	{String}		skillName			Skill name to exec.
	 * @param	{String}		state				State to wait.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __execTarget(component, nodes, skillName, state)
	{

		let promises = [];

		nodes.forEach((element) => {
			let promise = component.skills.use("state.wait", [{"object":element, "state":state}]).then(() => {
				return element.skills.use(skillName, {"sender":component});
			});
			promises.push(promise);
		});

		return Promise.all(promises);

	}

}
