// state variables
var deviceListSub = null;
var devicePropertiesSub = null;
var devicePropertiesSpuid = null
var deviceEventsSub = null;
var deviceEventsSpuid = null;
var deviceActionsSub = null;
var deviceActionsSpuid = null;
var devices = [];

function init(){
    $("#devicesPanel").removeClass("panel-success");
    $("#devicesEventsPanel").removeClass("panel-success");
    $("#devicesPropPanel").removeClass("panel-success");
    $("#sub1button").removeClass("btn-success");
    $("#sub2button").removeClass("btn-success");
    $("#sub3button").removeClass("btn-success");
    $("#sub1button").removeClass("disabled");
    $("#sub2button").removeClass("disabled");
    $("#sub3button").removeClass("disabled");
    $("#sub1button").prop("disabled", false);
    $("#sub2button").prop("disabled", false);
    $("#sub3button").prop("disabled", false);
    $("#subscribeURI").prop("disabled", false);    
};

function subscribeToDevices(subType){

    // clear previous data in table
    var table = document.getElementById("deviceTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    }
    
    // read form data
    subscUrl = document.getElementById("subscribeURI").value;

    // subscription
    
    // 1 - open connection
    var ws = new WebSocket(subscUrl);
    
    // 2 - send subscription
    ws.onopen = function(){

	wsText = "";
	console.log(subType);
	if (subType === "things"){
	    wsText = "PREFIX wot:<http://www.arces.unibo.it/wot#> " +
		"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
		"PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> "+
		"SELECT ?thingUri ?thingName ?thingStatus " +
		"WHERE { " +
		"?thingUri rdf:type td:Thing . " +
		"?thingUri td:hasName ?thingName . " +
		"?thingUri wot:isDiscoverable ?thingStatus " +
		"}";
	} else if (subType === "sensors"){
	    wsText = "PREFIX wot:<http://www.arces.unibo.it/wot#> " +
		"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
		"PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> "+
		"SELECT ?thingUri ?thingName ?thingStatus " +
		"WHERE { " +
		"?thingUri rdf:type td:Thing . " +
		"?thingUri rdf:type td:Sensor . " +
		"?thingUri td:hasName ?thingName . " +
		"?thingUri wot:isDiscoverable ?thingStatus " +
		"}";
	} else if (subType === "actuators"){
	    wsText = "PREFIX wot:<http://www.arces.unibo.it/wot#> " +
		"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
		"PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> "+
		"SELECT ?thingUri ?thingName ?thingStatus " +
		"WHERE { " +
		"?thingUri rdf:type td:Thing . " +
		"?thingUri rdf:type td:Actuator . " +
		"?thingUri td:hasName ?thingName . " +
		"?thingUri wot:isDiscoverable ?thingStatus " +
		"}";
	};
	$("#subscribeURI").prop("disabled", true);
	$("#devicesPanel").addClass("panel-success");
	$("#eventsPanel").addClass("panel-success");
	ws.send(JSON.stringify({"subscribe":wsText, "alias":"-"}));

    };
    
    // 3 - handler for received messages
    ws.onmessage = function(event){
	
	// parse the message
	msg = JSON.parse(event.data);
	console.log(msg);

	// get and store the subscription ID
	if (msg["subscribed"] !== undefined){

	    // get the subid
	    subid = msg["subscribed"];

	    // store the subid into the html field
	    document.getElementById("spuid").innerHTML = subid;

	    // store the subscription into the global variable
	    deviceListSub = ws;

	    // change the colour of the buttons
	    if (subType === "things"){
		$("#sub1button").addClass("btn-success");			
	    } else if (subType === "sensors"){
		$("#sub2button").addClass("btn-success");
	    } else if (subType === "actuators"){
		$("#sub3button").addClass("btn-success");
	    } 
	    $("#sub3button").addClass("disabled");
	    $("#sub2button").addClass("disabled");
	    $("#sub1button").addClass("disabled");
	    $("#sub1button").prop("disabled", true);
	    $("#sub2button").prop("disabled", true);
	    $("#sub3button").prop("disabled", true);
	    
	} else if (msg["results"] !== undefined){

	    // iterate over rows of the results
	    for (var i in msg["results"]["addedresults"]["bindings"]){

		// iterate over columns
		thingUri = msg["results"]["addedresults"]["bindings"][i]["thingUri"]["value"];
		thingName = msg["results"]["addedresults"]["bindings"][i]["thingName"]["value"];
		thingStatus = msg["results"]["addedresults"]["bindings"][i]["thingStatus"]["value"];

		// get the table and check if it's a new device
		var table = document.getElementById("deviceTable");
		if (!document.getElementById(thingUri)){

		    // determine id for html elements
		    htmlThingId = thingUri.split("#")[1];
		    htmlThingStatus = thingUri.split("#")[1] + "_status";
		    
		    var row = table.insertRow(-1);
		    row.id = thingUri;		
		    var f1 = row.insertCell(0);
		    var f2 = row.insertCell(1);
		    var f3 = row.insertCell(2);		    
		    f1.innerHTML = thingUri;
		    f2.innerHTML = thingName;
		    if (thingStatus === "true"){
			f3.innerHTML = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
		    } else {
			f3.innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
		    }
		    var f4 = row.insertCell(3);
		    f4.innerHTML = '<button type="button" id=\'' + htmlThingId + 'Btn\' class="btn btn-secondary" onclick="javascript:subscribeToDevice(\'' + thingUri + '\');"><span id=\'' + htmlThingStatus + '\' class="glyphicon glyphicon-search" aria-hidden="true"></span></button>';
		}
		else {

		    // determine id for html elements
		    htmlThingId = thingUri.split("#")[1];
		    htmlThingStatus = thingUri.split("#")[1] + "_status";	    
		    if (thingStatus === "true"){
			document.getElementById(htmlThingStatus).innerHTML = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
		    } else {
			document.getElementById(htmlThingStatus).innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
		    }
		    
		}		
	    }
	}
	
    };

    // 4 - handler for closed websocket
    ws.onclose = function(event){
	document.getElementById("spuid").innerHTML = "";
	console.log("[DEBUG] Closing subscription to devices");

	// recolour interface
	$("#devicesPanel").removeClass("panel-success");
	$("#eventsPanel").removeClass("panel-success");
	$("#sub1button").removeClass("btn-success");
	$("#sub2button").removeClass("btn-success");
	$("#sub3button").removeClass("btn-success");
	$("#sub1button").removeClass("disabled");
	$("#sub2button").removeClass("disabled");
	$("#sub3button").removeClass("disabled");
	$("#sub1button").prop("disabled", false);
	$("#sub2button").prop("disabled", false);
	$("#sub3button").prop("disabled", false);
	$("#subscribeURI").prop("disabled", false);
	
    }; 
    
};

function subscribeToDevice(deviceId){

    // modify the panel headings
    deviceNameSections = document.getElementsByClassName("deviceName");
    for (d in deviceNameSections){
	deviceNameSections[d].innerHTML = deviceId;
    };
    
    // get the related button and colour it
    $("#" + deviceId.split("#")[1] + "Btn").addClass("btn-success");
    
    // close open subscriptions for properties
    if (devicePropertiesSub !== null){
	console.log("[DEBUG] Closing previous subscription to properties");
	devicePropertiesSub.close();
    };

    // close open subscriptions for events
    if (deviceEventsSub !== null){
	console.log("[DEBUG] Closing previous subscription to events");
	deviceEventsSub.close();
    };

    // clear previous data in properties table
    var table = document.getElementById("devicePropTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    }

    // clear previous data in events table
    var table = document.getElementById("deviceEventsTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    }

    // change the colour of the panel
    $("#devicePropPanel").removeClass("panel-success");
    $("#devicePropPanel").addClass("panel-success");
    $("#deviceEventsPanel").removeClass("panel-success");
    $("#deviceEventsPanel").addClass("panel-success");
    $("#deviceActionsPanel").removeClass("panel-success");
    $("#deviceActionsPanel").addClass("panel-success");
    
    // prepare the subscription to properties
    subscUrl = document.getElementById("subscribeURI").value;
    propertiesSubText = "PREFIX wot:<http://www.arces.unibo.it/wot#> " +
	"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
	"PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> " +
	"PREFIX dul:<http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> " +
	"SELECT ?property ?propertyName ?propertyValue " +
	"WHERE { " +
	"<" + deviceId + "> td:hasProperty ?property . " +
	"?property td:hasName ?propertyName . " +
	"?property td:hasValueType ?propertyValueType . " +	
	"?propertyValueType dul:hasDataValue ?propertyValue " +
	"}";

    // subscription
    
    // 1 - open connection
    console.log("[DEBUG] Subscribing to device properties");
    var ws2 = new WebSocket(subscUrl);
    
    // 2 - send subscription
    ws2.onopen = function(){
	ws2.send(JSON.stringify({"subscribe":propertiesSubText, "alias":"properties"}));
    };
    
    // 3 - handler for received messages
    ws2.onmessage = function(event){
	
	// parse the message
	msg = JSON.parse(event.data);

	// store the subscription ID
	if (msg["subscribed"] !== undefined){

	    // check if the confirm is for the properties subscription
	    if (msg["alias"] === "properties"){
		
		// get the subid
		subid = msg["subscribed"];
		console.log("[DEBUG] Assigned id " + subid + " to properties subscription");
		
		// store the subid in the html field
		document.getElementById("devicePropertiesSpuid").innerHTML = subid;

		// store the subid
		devicePropertiesSpuid = subid
		
		// save the websocket
		devicePropertiesSub = ws2;
	    };	    
	    
	} else if (msg["results"] !== undefined){

	    if (msg["spuid"] === devicePropertiesSpuid){
		
		// iterate over rows of the results
		for (var i in msg["results"]["addedresults"]["bindings"]){

		    // iterate over columns
		    pUri = msg["results"]["addedresults"]["bindings"][i]["property"]["value"];
		    pName = msg["results"]["addedresults"]["bindings"][i]["propertyName"]["value"];
		    pValue = msg["results"]["addedresults"]["bindings"][i]["propertyValue"]["value"];
		    var table = document.getElementById("devicePropTable");

		    if (!document.getElementById(pUri)){		
			var row = table.insertRow(-1);
			row.id = pUri;
			var f1 = row.insertCell(0);
			var f2 = row.insertCell(1);
			var f3 = row.insertCell(2);
			f3.id = pUri.split("#")[1] + "_value";
			f1.innerHTML = pUri;
			f2.innerHTML = pName;
			f3.innerHTML = pValue;
		    } else {
			f3 = document.getElementById(pUri.split("#")[1] + "_value");
			f3.innerHTML = pValue;
		    }				
		}
	    }
	}	
    };

    // 4 - handler for closed websocket
    ws2.onclose = function(event){

	// debug print
	console.log("[DEBUG] Closing subscription to device property");

	// restore the interface
	$("#devicePropPanel").removeClass("panel-success");
	document.getElementById("devicePropertiesSpuid").innerHTML = "";
	$("#" + deviceId.split("#")[1] + "Btn").removeClass("btn-success");

    };

    // prepare the subscription to events
    eventsSubText = "PREFIX wot:<http://www.arces.unibo.it/wot#> " +
    	"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    	"PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> " +
    	"PREFIX dul:<http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> " +
    	"SELECT ?event ?eventName ?instance ?timestamp ?value " +
    	"WHERE { " +
    	"<" + deviceId + "> td:hasEvent ?event . " +
    	"?event td:hasName ?eventName . " +
    	"?event wot:hasInstance ?instance . " +
    	"?instance wot:hasTimeStamp ?timestamp . " +
	"OPTIONAL { ?instance td:hasOutput ?output ." +
	"?output dul:hasDataValue ?value }" +
    	"}";

    // 1 - open connection
    var ws3 = new WebSocket(subscUrl);
    
    // 2 - send subscription
    console.log("[DEBUG] Subscribing to device events");
    ws3.onopen = function(){
    	ws3.send(JSON.stringify({"subscribe":eventsSubText, "alias":"events"}));
    };
    
    // 3 - handler for received messages
    ws3.onmessage = function(event){
    
    	// parse the message
    	emsg = JSON.parse(event.data);

    	// store the subscription ID
    	if (emsg["subscribed"] !== undefined){

    	    // get the subid
    	    subid = emsg["subscribed"];
	    console.log("[DEBUG] Assigned id " + subid + " to events subscription");

    	    // store the subid in the html field
    	    document.getElementById("deviceEventsSpuid").innerHTML = subid;

	    // store the subid
	    deviceEventsSpuid = subid;
	    
    	    // save the websocket
    	    deviceEventsSub = ws3;
    
    	} else if (emsg["results"] !== undefined){

	    if (emsg["spuid"] === deviceEventsSpuid){

    		// iterate over rows of the results
    		for (var i in emsg["results"]["addedresults"]["bindings"]){
		    
    		    // iterate over columns
    		    eUri = emsg["results"]["addedresults"]["bindings"][i]["event"]["value"];
    		    eName = emsg["results"]["addedresults"]["bindings"][i]["eventName"]["value"];
    		    eInstance = emsg["results"]["addedresults"]["bindings"][i]["instance"]["value"];
		    eTimestamp = emsg["results"]["addedresults"]["bindings"][i]["timestamp"]["value"];
		    if (emsg["results"]["addedresults"]["bindings"][i]["value"] !== undefined){
			eValue = emsg["results"]["addedresults"]["bindings"][i]["value"]["value"];
		    }
    		    var table = document.getElementById("deviceEventsTable");

    		    if (!document.getElementById(eUri)){		
    			var row = table.insertRow(-1);
    			row.id = eUri;
    			var f1 = row.insertCell(0);
    			var f2 = row.insertCell(1);
    			var f3 = row.insertCell(2);
			var f4 = row.insertCell(3);
			var f5 = row.insertCell(4);
    			f3.id = eUri.split("#")[1] + "_instance";
			f4.id = eUri.split("#")[1] + "_timestamp";
			f5.id = eUri.split("#")[1] + "_value";
    			f1.innerHTML = eUri;
    			f2.innerHTML = eName;
			f3.innerHTML = eInstance;
			f4.innerHTML = eTimestamp;
			if (emsg["results"]["addedresults"]["bindings"][i]["value"] !== undefined){
    			    f5.innerHTML = eValue;
			}
    		    } else {
    			f3 = document.getElementById(eUri.split("#")[1] + "_instance");
			f4 = document.getElementById(eUri.split("#")[1] + "_timestamp");
			f5 = document.getElementById(eUri.split("#")[1] + "_value");
			f3.innerHTML = eInstance;
			f4.innerHTML = eTimestamp;
			if (emsg["results"]["addedresults"]["bindings"][i]["value"] !== undefined){
    			    f5.innerHTML = eValue;
			}
    		    }				
    		}
	    }
    	}	
    };

    // 4 - handler for closed websocket
    ws3.onclose = function(event){

    	// debug print
    	console.log("[DEBUG] Closing subscription to device events");

    	// restore the interface
    	$("#deviceEventsPanel").removeClass("panel-success");
    	document.getElementById("deviceEventsSpuid").innerHTML = "";
    	$("#" + deviceId.split("#")[1] + "Btn").removeClass("btn-success");

    };

    // prepare the subscription to actions
    actionsSubText = "PREFIX wot:<http://www.arces.unibo.it/wot#> " +
	"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
	"PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> " +
	"PREFIX dul:<http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> " +
	"SELECT ?action ?actionName " +
	"WHERE { " +
	"<" + deviceId + "> td:hasAction ?action . " +
	"?action td:hasName ?actionName " +
	"}";

    // subscription
    
    // 1 - open connection
    console.log("[DEBUG] Subscribing to device actions");
    var ws4 = new WebSocket(subscUrl);
    
    // 2 - send subscription
    ws4.onopen = function(){
	ws4.send(JSON.stringify({"subscribe":actionsSubText, "alias":"actions"}));
    };
    
    // 3 - handler for received messages
    ws4.onmessage = function(event){
	
	// parse the message
	msg = JSON.parse(event.data);

	// store the subscription ID
	if (msg["subscribed"] !== undefined){

	    // check if the confirm is for the properties subscription
	    if (msg["alias"] === "actions"){
		
		// get the subid
		subid = msg["subscribed"];
		console.log("[DEBUG] Assigned id " + subid + " to actions subscription");
		
		// store the subid in the html field
		document.getElementById("deviceActionsSpuid").innerHTML = subid;

		// store the subid
		deviceActionsSpuid = subid
		
		// save the websocket
		deviceActionsSub = ws3;
	    };	    
	    
	} else if (msg["results"] !== undefined){

	    if (msg["spuid"] === deviceActionsSpuid){
		
		// iterate over rows of the results
		for (var i in msg["results"]["addedresults"]["bindings"]){

		    // iterate over columns
		    aUri = msg["results"]["addedresults"]["bindings"][i]["action"]["value"];
		    aName = msg["results"]["addedresults"]["bindings"][i]["actionName"]["value"];
		    var table = document.getElementById("deviceActionsTable");

		    if (!document.getElementById(aUri)){		
			var row = table.insertRow(-1);
			row.id = aUri;
			var f1 = row.insertCell(0);
			var f2 = row.insertCell(1);
			f1.innerHTML = aUri;
			f2.innerHTML = aName;
		    }
		}
	    }
	}	
    };

    // 4 - handler for closed websocket
    ws4.onclose = function(event){

	// debug print
	console.log("[DEBUG] Closing subscription to device actions");

	// restore the interface
	$("#deviceActionsPanel").removeClass("panel-success");
	document.getElementById("deviceActionsSpuid").innerHTML = "";
	$("#" + deviceId.split("#")[1] + "Btn").removeClass("btn-success");

    };
   
};

function unsubscribe(){

    // close subscription to devices
    if (deviceListSub !== null){
	deviceListSub.close();
	deviceListSub = null;
    };

    // close subscription to properties
    if (devicePropertiesSub !== null){
	devicePropertiesSub.close();
	devicePropertiesSub = null;
    };

    // close subscription to events
    if (deviceEventsSub !== null){
	deviceEventsSub.close();
	deviceEventsSub = null;
    };

    // close subscription to events
    if (deviceActionsSub !== null){
	deviceActionsSub.close();
	deviceActionsSub = null;
    };
    
};

function clearData(){

    // unsubscribe
    unsubscribe();

    // clear previous data in the properties table
    var table = document.getElementById("devicePropTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    };

    // clear previous data in the events table
    var table = document.getElementById("deviceEventsTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    };

    // clear previous data in the main table
    var table = document.getElementById("deviceTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    };

    // clear the panel heading for device properties and events
    deviceNameSections = document.getElementsByClassName("deviceName");
    for (d in deviceNameSections){
	deviceNameSections[d].innerHTML = "";
    };
    
};
