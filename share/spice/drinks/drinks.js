function ddg_spice_drinks(api_result) {
    "use strict";

    if(!api_result || api_result.length === 0 || !api_result[0].name) {
        return;
    }

    api_result[0].isArray = $.isArray(api_result[0].ingredients);

    Spice.add({
        data: api_result[0],
	name: "Drinks",
	meta: {
            sourceUrl: api_result[0].url,
            sourceName: 'Drink Project'
	},
	normalize: function(item) {
	    return {
		description: item.procedure,
		title: item.name,
		infoboxTitle: 'Ingredients'
	    };
	},
        templates: {
	    group: 'info',
	    options: {
		infobox: Spice.drinks.infobox
	    }
        }
    });
}
