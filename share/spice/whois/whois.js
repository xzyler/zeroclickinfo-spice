(function (env) {
    "use strict";

    // turns on/off debugging output
    var is_debug = false;

    // spice callback function
    env.ddg_spice_whois = function(api_output) {
        // for debugging
        if(is_debug) console.log('api_output:', api_output);

	// Check for API error and exit early if found
	// (with error message when in debug mode)
	if (!api_output || api_output.error || !api_output.WhoisRecord) {
	    if(is_debug) console.log("Error with whois API. api_output:", api_output || 'undefined');

	    return Spice.failed('whois');
	}

	// normalize the api output
	api_output = normalize_api_output(api_output);

        // is the domain available?
	var is_avail = is_domain_available(api_output);

	// if the domain isn't available, do we want to show
	// whois information?
	var is_whois_allowed = is_whois_query(DDG.get_query());

	// for debugging
	if(is_debug) console.log("is_avail:", is_avail, "is_whois_allowed:", is_whois_allowed);

	// decide which template to show, if any
	if(is_avail) {
	    // show message saying the domain is available
	    show_available(api_output);
	} else if(is_whois_allowed) {
	    // show whois info for the domain
	    show_whois(api_output);
	} else {
	    // by default, show nothing
	}

    };

    // Returns whether the domain is available,
    // based on the API result that was returned.
    var is_domain_available = function(api_output) {
	return !api_output['registered'];
    };

    // Returns whether we should show whois data if this
    // domain is not available.
    var is_whois_query = function(query) {

	// for debugging
	if(is_debug) console.log('in is_whois_query, query =', query); 

	// show whois results except when the query contains only the domain
	// and no other keywords, which we test by looking for a space in the query.
	return /\s/.test(query.trim());
    };

    var normalize_api_output = function(api_output) {

	// initialize the output object
	var normalized =  {
	    // these fields are not displayed, but are used internally
	    'domainName': '',
	    'registered': false,

	    // these fields are displayed (hence the user-friendly capitalization and spaces)
	    'Registered to': '',
	    'Email': '',
	    'Last updated': '',
	    'Expires': ''
	};
	
	// get the domain name
	normalized['domainName'] = api_output.WhoisRecord.domainName;

	// store whether the domain is registered
	normalized['registered'] = !!api_output.WhoisRecord.registrant;

	// get contact name and email from the registrant,
	// and falling back to the admin and technical contacts
	var contacts = [
	    api_output.WhoisRecord.registrant,
	    api_output.WhoisRecord.administrativeContact,
	    api_output.WhoisRecord.technicalContact
	];  
	normalized['Registered to'] = get_first_by_key(contacts, 'name');
	normalized['Email'] = get_first_by_key(contacts, 'email');

	// trim dates so they are shown without times
	normalized['Last updated'] = api_output.WhoisRecord.updatedDate
	                                 && api_output.WhoisRecord.updatedDate.replace(/^(.*)?\s(.*)?$/, '$1');
	normalized['Expires'] = api_output.WhoisRecord.expiresDate
	                            && api_output.WhoisRecord.expiresDate.replace(/^(.*)?\s(.*)?$/, '$1');

	return normalized;
    };

    // Searches an array of objects for the first value
    // at the specified key.
    var get_first_by_key = function(arr, key) {
	if(!arr || arr.length == 0) return null;

	// find the first object in the array that has a non-empty value at the key
	var first = null;
	arr.forEach( function(obj) {
	    if(obj && typeof obj[key] !== 'undefined' && obj[key] !== '') {
		if(!first) first = obj[key];
	    }
	});

	// return first, which could still be null
	return first;
    }

    // Show message saying that the domain is available.
    var show_available = function(api_output) {
	console.log('api result in show_available', api_output);

	Spice.add({
            id: "whois",
            name: "Whois",
            data: api_output,
            meta: {
                sourceName: "Whois API",
                sourceUrl: 'http://www.whoisxmlapi.com/whois-api-doc.php#whoisserver/WhoisService?rid=2&domainName='
		    + api_output.domainName
		    + '&outputFormat=json'
            },
            templates: {
		group: 'base',
		options:{
                    content: Spice.whois.available,
		    moreAt: true
		}
	    }
        });
    };

    // Show whois info for the domain using the 'record' template.
    var show_whois = function(api_output) {

	Spice.add({
            id: "whois",
            name: "Whois",
            data: {
		'record_data': api_output, 
		'record_keys': ['Registered to', 'Email', 'Last updated', 'Expires']
	    },
            meta: {
                sourceName: "Whois API",
                sourceUrl: 'http://www.whoisxmlapi.com/whois-api-doc.php#whoisserver/WhoisService?rid=2&domainName='
		    + api_output.domainName
		    + '&outputFormat=json'
            },
            templates: {
            	group: 'base',
		options:{
                    content: 'record',
		    moreAt: true
		}
	    }
        });
    };

    
    
}(this));