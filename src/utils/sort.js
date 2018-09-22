export function sortBy (item1, item2) {
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