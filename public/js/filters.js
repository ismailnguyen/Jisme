app.filter('filterByTag', function()
{
	return function(items, currentTag)
	{
		if (currentTag == 'All')
		{
			return items;
		}

		var filtered = [];

		angular.forEach(items, function(item) 
		{
			let tags = item.tags.split(',');
			currentTag = currentTag.trim().toUpperCase();
			
			angular.forEach(tags, function(tag)
			{
				tag = tag.trim().toUpperCase();

				if (tag == currentTag)
				{
					filtered.push(item);
				}
			});
		});

		return filtered;
	};
});

app.filter('filterByDate', function()
{
	return function(items, currentDate)
	{
		currentDate = new Date(currentDate);

		return Array.prototype.filter.call(items, function (item)
		{
			let createdDate = new Date(item.created_date);
			
			return createdDate.getDate() >= currentDate.getDate();
		});
	};
});

app.filter('filterByQuery', function()
{
	return function(items, query)
	{
		let isQueryEmpty = typeof query == 'undefined' || query.length == 0; 

		if (isQueryEmpty)
		{
			return items;
		}

		if (!isQueryEmpty)
		{
			var filtered = [];

			var keywords = query.split(',');

			angular.forEach(keywords, function(keyword)
			{
				keyword = keyword.trim();

				angular.forEach(items, function(item)
				{
					query = query.toUpperCase();

					let platform = item.platform.toUpperCase();
					let displayPlatform = item.displayPlatform.toUpperCase();
					let login = item.login.toUpperCase();
					let password = item.password.toUpperCase();
					let tags = item.tags.toUpperCase();

					if (platform.indexOf(query) >= 0
						|| displayPlatform.indexOf(query) >= 0
						|| login.indexOf(query) >= 0
						|| password.indexOf(query) >= 0
						|| tags.indexOf(query) >= 0)
					{
						filtered.push(item);
					}
				});
			});
			
			return filtered;
		}
	};
});

app.filter('formatPlatform', function()
{
	return function(items)
	{
		var filtered = [];
		
		angular.forEach(items, function(item)
		{
			item['displayPlatform'] = cleanUrl(item.platform);

			item['created_date'] = new Date(item.created_date).toUTCString();

			filtered.push(item);
		});
		
		return filtered;
	};
});

app.filter('orderObject', function()
{
	return function(items, reverse)
	{
		var filtered = [];
		
		angular.forEach(items, function(item)
		{
			filtered.push(item);
		});
		
		filtered.sort(function (a, b)
		{
			return a.localeCompare(b);
		});
		
		if(reverse)
		{
			filtered.reverse();
		}
			
		return filtered;
	};
});
	
app.filter('orderObjectBy', function()
{
	return function(items, field, reverse)
	{
		var filtered = [];
		
		angular.forEach(items, function(item)
		{
			filtered.push(item);
		});
		
		filtered.sort(function (a, b)
		{
			return a[field].localeCompare(b[field]);
		});
		
		if(reverse)
		{
			filtered.reverse();
		}
			
		return filtered;
	};
});

app.filter('distinctTags', function()
{
	return function(items)
	{
		var tags = [];
		
		angular.forEach(items, function(item)
		{
			let listTags = item.tags.split(',');

			angular.forEach(listTags, function(tag)
			{
				tag = tag.trim();
				
				if (tags.indexOf(tag) == -1)
				{
					tags.push(tag);
				}
			});
		});
		
		return tags;
	};
});