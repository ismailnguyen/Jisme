export function sortByString (item1, item2) {
	if (item1 === item2) return 0;
	if (item1 === undefined || item1 === "") return -1;
	if (item2 === undefined || item2 === "") return 1;

	item1 = item1.toLowerCase();
	item2 = item2.toLowerCase();

	if (item1 < item2)
	{
		return -1;
	}

	if (item1 > item2)
	{
		return 1;
	}

	return 0;
}

export function sortByDate (item1, item2) {
	return new Date(item1) - new Date(item2);
}

export function sortByInt(item1, item2) {
	return item1 - item2;
}
