export function sortByName (item1, item2) {
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