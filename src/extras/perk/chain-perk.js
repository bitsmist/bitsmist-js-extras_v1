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
	//  Properties
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

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("event", "doApplySettings", ChainPerk.onDoApplySettings, {"order":this.info["order"]});

	}

	// -----------------------------------------------------------------------------

	static deinit(unit, options)
	{

		let chains = e.details.setting["chains"];
		if (chains)
		{
			Object.keys(chains).forEach((eventName) => {
				unit.removeEventHandler(eventName, {"handler":ChainPerk.onDoApplySettings, "options":chains[eventName]});
			});
		}

	}

	// -------------------------------------------------------------------------
	//	Event handlers
	// -------------------------------------------------------------------------

	static onDoApplySettings(sender, e, ex)
	{

		let order = ChainPerk.info["order"];

		Object.entries(BM.Util.safeGet(e.detail, "settings.chain.targets", {})).forEach(([sectionName, sectionValue]) => {
			this.use("skill", "event.add", sectionName, {
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
			let status = targets[i]["status"] || "ready";
			let sync = targets[i]["sync"];

			let nodes = this.use("skill", "basic.locateAll", targets[i]);
			BM.Util.warn(nodes.length > 0, `ChainPerk.onDoProcess(): Node not found. name=${this.tagName}, eventName=${e.type}, rootNode=${JSON.stringify(targets[i])}, method=${method}`)

			if (sync)
			{
				chain = chain.then(() => {
					return ChainPerk.__execTarget(this, nodes, method, status);
				});
			}
			else
			{
				chain = ChainPerk.__execTarget(this, nodes, method, status);
			}
			promises.push(chain);
		}

		return Promise.all(promises);

	}

	// -----------------------------------------------------------------------------
	//	Privates
	// -----------------------------------------------------------------------------

	/**
	 * Execute target methods.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Array}			nodes				Nodes.
	 * @param	{String}		skillName			Skill name to exec.
	 * @param	{String}		status				Status to wait.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static __execTarget(unit, nodes, skillName, status)
	{

		let promises = [];

		nodes.forEach((element) => {
			let promise = unit.use("spell", "status.wait", [{"object":element, "status":status}]).then(() => {
				return element.use("spell", skillName, {"sender":unit});
			});
			promises.push(promise);
		});

		return Promise.all(promises);

	}

}
