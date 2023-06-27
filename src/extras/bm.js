if (!window.BITSMIST || !window.BITSMIST.v1 || !window.BITSMIST.v1.Unit)
{
	throw new ReferenceError("Bitsmist Core Library does not exist.");
}

export default window.BITSMIST.v1;
