// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Connector class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		settings			Options for the component.
 */
export default function Connector(settings)
{

	// super()
	settings = Object.assign({}, settings, {"name":"Connector"});
	let _this = Reflect.construct(BITSMIST.v1.Component, [settings], this.constructor);

	// Init vars
	_this._targets = [];

	return _this;

}

BITSMIST.v1.ClassUtil.inherit(Connector, BITSMIST.v1.Component);
customElements.define("bm-connector", Connector);

// -----------------------------------------------------------------------------
//  Event handlers
// -----------------------------------------------------------------------------

/**
 * Event handler.
 *
 * @param	{Object}		sender				Sender.
 * @param	{Object}		e					Event info.
 */
Connector.prototype.eventHandler = function(sender, e)
{

	return new Promise((resolve, reject) => {
		let promises = [];
		for (let i = 0; i < this._targets.length; i++)
		{
			//if (sender == this._targets[i].object)
			{
				for (let j = 0; j < this._targets[i].receiversInfo.length; j++)
				{
					if (this.__isTarget(sender))
					{
						let sender = document.querySelector(this._targets[i].senderInfo["rootNode"]);
						let options;
						if (sender.getEventDetails)
						{
							options = sender.getEventDetails(this._targets[i].eventName);
						}
						let ele = document.querySelector(this._targets[i].receiversInfo[j]["rootNode"]);
						ele._component = sender;
						promises.push(ele.trigger(this._targets[i].eventName, sender, options));
					}
				}
			}
		}

		Promise.all(promises).then((result) => {
			console.log("aaa", result);
			resolve(result);
		});
	});

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Connect components.
 *
 * @param	{String}		eventName			Event name.
 * @param	{Object}		senderInfo			Sender info.
 * @param	{Array}			receiversInfo		Array of receivers info.
 */
Connector.prototype.connect = function(eventName, senderInfo, receiversInfo)
{

	console.log("@@@connector connecting", eventName, senderInfo, receiversInfo);

	this._targets.push({
		"eventName": eventName,
		"senderInfo": senderInfo,
		"receiversInfo": receiversInfo,
	});

	this._waitForSender(senderInfo).then((sender) => {
		let options = {};
		sender.addEventHandler(sender, eventName, {"handler":this.eventHandler}, options, this);
		senderInfo["object"] = sender;
		console.log("@@@connecter connected", sender, eventName, senderInfo, receiversInfo);
	});

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Wait for a sender component.
 *
 * @param	{Object}		senderInfo			Sender info.
 */
Connector.prototype._waitForSender = function(senderInfo)
{

	return new Promise((resolve, reject) => {
		this.waitFor([{"rootNode":senderInfo["rootNode"], "status":"connected"}]).then(() => {
			let sender = document.querySelector(senderInfo["rootNode"]);
			resolve(sender);
		});
	});

}

// -----------------------------------------------------------------------------
//  Privates
// -----------------------------------------------------------------------------

/**
 * Check if it is a target.
 *
 * @param	{Object}		settings			Settings.
 * @param	{Object}		target				Target component to check.
 */
Connector.prototype.__isTarget = function(settings, target)
{

	return true;

}
