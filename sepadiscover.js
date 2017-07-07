// state variables
var deviceListSub = null;
var devicePropertiesSub = null;
var devicePropertiesSpuid = null
var deviceEventsSub = null;
var deviceEventsSpuid = null;
var deviceActionsSub = null;
var deviceActionsSpuid = null;
var devices = [];
var activeDevice = null;

// namespace
wot = "http://wot.arces.unibo.it/sepa#";

subText = {};
subText["things"] = "PREFIX wot:<http://wot.arces.unibo.it/sepa#> " +
    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX td:<http://www.w3.org/ns/td#> "+
    "SELECT ?thingUri ?thingName ?thingStatus " +
    "WHERE { " +
    "?thingUri rdf:type td:Thing . " +
    "?thingUri td:hasName ?thingName . " +
    "?thingUri wot:isDiscoverable ?thingStatus " +
    "}";

subText["sensors"] = "PREFIX wot:<http://wot.arces.unibo.it/sepa#> " +
    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX td:<http://www.w3.org/ns/td#> "+
    "SELECT ?thingUri ?thingName ?thingStatus " +
    "WHERE { " +
    "?thingUri rdf:type td:Thing . " +
    "?thingUri rdf:type td:Sensor . " +
    "?thingUri td:hasName ?thingName . " +
    "?thingUri wot:isDiscoverable ?thingStatus " +
    "}";

subText["actuators"] = "PREFIX wot:<http://wot.arces.unibo.it/sepa#> " +
    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX td:<http://www.w3.org/ns/td#> "+
    "SELECT ?thingUri ?thingName ?thingStatus " +
    "WHERE { " +
    "?thingUri rdf:type td:Thing . " +
    "?thingUri rdf:type td:Actuator . " +
    "?thingUri td:hasName ?thingName . " +
    "?thingUri wot:isDiscoverable ?thingStatus " +
    "}";

subText["thingsProperties"] = "PREFIX wot:<http://wot.arces.unibo.it/wot#> " +
    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX td:<http://www.w3.org/ns/td#> " +
    "PREFIX dul:<http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> " +
    "SELECT ?thing ?property ?propertyName ?propertyValue " +
    "WHERE { " +
    "?thing td:hasProperty ?property . " +
    "?property td:hasName ?propertyName . " +
    "?property td:hasValueType ?propertyValueType . " +	
    "?property dul:hasDataValue ?propertyValue " +
    "}";

subText["thingsActions"] = "PREFIX wot:<http://wot.arces.unibo.it/wot#> " +
    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX td:<http://www.w3.org/ns/td#> " +
    "PREFIX dul:<http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> " +
    "SELECT ?thing ?action ?actionName " +
    "WHERE { " +
    "?thing td:hasAction ?action . " +
    "?action td:hasName ?actionName " +
    "}";


subText["thingsEvents"] = "PREFIX wot:<http://wot.arces.unibo.it/sepa#> " +
    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
    "PREFIX td:<http://www.w3.org/ns/td#> " +
    "PREFIX dul:<http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> " +
    "SELECT ?thing ?event ?eventName ?instance ?timestamp ?value " +
    "WHERE { " +
    "?thing td:hasEvent ?event . " +
    "?event td:hasName ?eventName . " +
    "?event wot:hasInstance ?instance . " +
    "?instance wot:hasTimeStamp ?timestamp . " +
    "?instance wot:isGeneratedBy ?thing . " +
    "OPTIONAL { ?instance td:hasOutput ?output ." +
    "?output dul:hasDataValue ?value }" +
    "}";


function init(){

    // reset panels colours
    $("#devicesPanel").removeClass("panel-success");
    $("#devicesEventsPanel").removeClass("panel-success");
    $("#devicesPropPanel").removeClass("panel-success");    
    $("#devicesActionsPanel").removeClass("panel-success");

    // reset buttons colours
    $("#sub1button").removeClass("btn-success");
    $("#sub2button").removeClass("btn-success");
    $("#sub3button").removeClass("btn-success");

    // reset buttons colours
    $("#sub1button").removeClass("disabled");
    $("#sub2button").removeClass("disabled");
    $("#sub3button").removeClass("disabled");

    // re-enable subscribe buttons
    $("#sub1button").prop("disabled", false);
    $("#sub2button").prop("disabled", false);
    $("#sub3button").prop("disabled", false);

    // re-enable subscribe uri bar
    $("#subscribeURI").prop("disabled", false);
    $("#updateURI").prop("disabled", false);

    // clear the areas for subscription ids
    document.getElementById("spuid").innerHTML = "";
    document.getElementById("devicePropertiesSpuid").innerHTML = "";
    document.getElementById("deviceEventsSpuid").innerHTML = "";
    document.getElementById("deviceActionsSpuid").innerHTML = "";
};


function subscribeToDevices(subType){

    // clear previous data in table
    var table = document.getElementById("deviceTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    }
    
    // read form data
    subscUrl = document.getElementById("subscribeURI").value;

    ///////////////////////////////////////////////////
    //
    // First subscription: things
    //
    ///////////////////////////////////////////////////
    
    // subscription
    
    // 1 - open connection
    var ws = new WebSocket(subscUrl);
    
    // 2 - send subscription
    ws.onopen = function(){

	console.log(subType);
	wsText = subText[subType];
	$("#subscribeURI").prop("disabled", true);
	$("#updateURI").prop("disabled", true);
	$("#devicesPanel").addClass("panel-success");
	$("#eventsPanel").addClass("panel-success");
	ws.send(JSON.stringify({"subscribe":wsText, "alias":subType}));

    };
    
    // 3 - handler for received messages
    ws.onmessage = function(event){
	
	// parse the message
	msg = JSON.parse(event.data);

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

	    console.log(msg["results"]);
	    
	    // iterate over rows of the removed results
	    for (var i in msg["results"]["removedresults"]["bindings"]){

		// iterate over columns
		thingUri = msg["results"]["addedresults"]["bindings"][i]["thingUri"]["value"];

		// get the table and check if it's a new device
		var table = document.getElementById("deviceTable");
		if (document.getElementById(thingUri)){
		    console.log("RIMOZIONE RIGA");
		    document.getElementById(thingUri).remove();
		}
		
	    };
	    
	    // iterate over rows of the results
	    for (var i in msg["results"]["addedresults"]["bindings"]){

		// iterate over columns
		thingUri = msg["results"]["addedresults"]["bindings"][i]["thingUri"]["value"];
		thingName = msg["results"]["addedresults"]["bindings"][i]["thingName"]["value"];
		thingStatus = msg["results"]["addedresults"]["bindings"][i]["thingStatus"]["value"];
		console.log(thingStatus);

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
		    f1.innerHTML = thingUri.replace(wot, "wot:");
		    f2.innerHTML = thingName;
		    if (thingStatus === "true"){
			f3.innerHTML = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
		    } else {
			f3.innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
		    };
		}
		// else {

		//     // determine id for html elements
		//     htmlThingId = thingUri.split("#")[1];
		//     htmlThingStatus = thingUri.split("#")[1] + "_status";	    
		//     if (thingStatus === "true"){
		// 	document.getElementById(htmlThingStatus).innerHTML = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
		//     } else {
		// 	document.getElementById(htmlThingStatus).innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
		//     }
		    
		// }		
	    }
	}
	
    };

    // 4 - handler for closed websocket
    ws.onclose = function(event){

	// debug print
	console.log("[DEBUG] Closing subscription to devices");
	
	// reset the sub id area
	document.getElementById("spuid").innerHTML = "";

	// recolour interface
	$("#devicesPanel").removeClass("panel-success");
	$("#eventsPanel").removeClass("panel-success");
	$("#sub1button").removeClass("btn-success");
	$("#sub2button").removeClass("btn-success");
	$("#sub3button").removeClass("btn-success");

	// re-enable disabled fields
	$("#sub1button").removeClass("disabled");
	$("#sub2button").removeClass("disabled");
	$("#sub3button").removeClass("disabled");
	$("#sub1button").prop("disabled", false);
	$("#sub2button").prop("disabled", false);
	$("#sub3button").prop("disabled", false);
	$("#subscribeURI").prop("disabled", false);
	$("#updateURI").prop("disabled", false);
	
    }; 

    ///////////////////////////////////////////////////
    //
    // Second subscription: things properties
    //
    ///////////////////////////////////////////////////

    // 1 - open connection
    console.log("[DEBUG] Subscribing to device properties");
    var ws2 = new WebSocket(subscUrl);
    
    // 2 - send subscription
    ws2.onopen = function(){
    	ws2.send(JSON.stringify({"subscribe":subText["thingsProperties"], "alias":"properties"}));
    };
    
    // 3 - handler for received messages
    ws2.onmessage = function(event){
	
    	// parse the message
    	msg = JSON.parse(event.data);
    	console.log("WS2 - " + msg);

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
    		devicePropertiesSpuid = subid;

    		// store the websocket
    		devicePropertiesSub = ws2;

    		// colour the panel
    		$("#devicePropPanel").addClass("panel-success");
		
    	    };	    
	    
    	} else if (msg["results"] !== undefined){

    	    if (msg["spuid"] === devicePropertiesSpuid){
		
    		// iterate over rows of the results
    		for (var i in msg["results"]["addedresults"]["bindings"]){

    		    // iterate over columns
    		    tUri = msg["results"]["addedresults"]["bindings"][i]["thing"]["value"];
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
    			var f4 = row.insertCell(3);
    			f4.id = pUri.split("#")[1] + "_value";
    			f1.innerHTML = tUri.replace(wot, "wot:");
    			f2.innerHTML = pUri.replace(wot, "wot:");
    			f3.innerHTML = pName;
    			f4.innerHTML = pValue;
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

    	// forget the active device
    	activeDevice = null;

    };

    ///////////////////////////////////////////////////
    //
    // Third subscription: things events
    //
    ///////////////////////////////////////////////////

    // 1 - open connection
    var ws3 = new WebSocket(subscUrl);
    
    // 2 - send subscription
    console.log("[DEBUG] Subscribing to device events");
    ws3.onopen = function(){
    	ws3.send(JSON.stringify({"subscribe":subText["thingsEvents"], "alias":"events"}));
    };
    
    // 3 - handler for received messages
    ws3.onmessage = function(event){
    
    	// parse the message
    	emsg = JSON.parse(event.data);
    	console.log("WS3 - " + emsg);

    	// store the subscription ID
    	if (emsg["subscribed"] !== undefined){

    	    if (emsg["alias"] === "events"){
	    
    		// get the subid
    		subid = emsg["subscribed"];
    		console.log("[DEBUG] Assigned id " + subid + " to events subscription");
		
    		// store the subid in the html field
    		document.getElementById("deviceEventsSpuid").innerHTML = subid;
		
    		// store the subid
    		deviceEventsSpuid = subid;
		
    		// save the websocket
    		deviceEventsSub = ws3;
		
    		// colour the panel
    		$("#deviceEventsPanel").addClass("panel-success");
    	    }
	    
    	} else if (emsg["results"] !== undefined){

    	    if (emsg["spuid"] === deviceEventsSpuid){

		// // iterate over rows of the removed results
		// for (var i in emsg["results"]["removedresults"]["bindings"]){
		//     if (document.getElementById(eUri.split("#")[1] + tUri.split("#")[1])){
		// 	document.getElementById(eUri.split("#")[1] + tUri.split("#")[1]).remove();
		//     }
		// };
		
    		// iterate over rows of the results
    		for (var i in emsg["results"]["addedresults"]["bindings"]){
		    
    		    // iterate over columns
    		    tUri = emsg["results"]["addedresults"]["bindings"][i]["thing"]["value"];
    		    eUri = emsg["results"]["addedresults"]["bindings"][i]["event"]["value"];
    		    eTimestamp = emsg["results"]["addedresults"]["bindings"][i]["timestamp"]["value"];
    		    if (emsg["results"]["addedresults"]["bindings"][i]["value"] !== undefined){
    			eValue = emsg["results"]["addedresults"]["bindings"][i]["value"]["value"];
    		    }
    		    var table = document.getElementById("deviceEventsTable");
		    if (!document.getElementById(eUri.split("#")[1] + tUri.split("#")[1])){
    			var row = table.insertRow(-1);
    			row.id = eUri.split("#")[1] + tUri.split("#")[1];
    			var f1 = row.insertCell(0);
    			var f2 = row.insertCell(1);
    			var f3 = row.insertCell(2);
    			var f4 = row.insertCell(3);
    			f3.id = eUri.split("#")[1] + tUri.split("#")[1] + "_timestamp";
    			f4.id = eUri.split("#")[1] + tUri.split("#")[1] + "_value";
    			f1.innerHTML = tUri.replace(wot, "wot:");
    			f2.innerHTML = eUri.replace(wot, "wot:");
    			f3.innerHTML = eTimestamp;
    			if (emsg["results"]["addedresults"]["bindings"][i]["value"] !== undefined){
    			    f4.innerHTML = eValue;
    			}
		    }
		    else {			
			f4 = document.getElementById(eUri.split("#")[1] + tUri.split("#")[1] + "_timestamp");
			f5 = document.getElementById(eUri.split("#")[1] + tUri.split("#")[1] + "_value");
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

    };

    ///////////////////////////////////////////
    //
    // fourth subscription: actions
    //
    ///////////////////////////////////////////
    
    // 1 - open connection
    console.log("[DEBUG] Subscribing to device actions");
    var ws4 = new WebSocket(subscUrl);
    
    // 2 - send subscription
    ws4.onopen = function(){
    	ws4.send(JSON.stringify({"subscribe":subText["thingsActions"], "alias":"actions"}));
    };
    
    // 3 - handler for received messages
    ws4.onmessage = function(event){
	
    	// parse the message
    	msg = JSON.parse(event.data);
    	console.log("WS4 - " + msg);

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
    		deviceActionsSub = ws4;

    		// colour the panel
    		$("#deviceActionsPanel").addClass("panel-success");		
    	    };	    
	    
    	} else if (msg["results"] !== undefined){

    	    if (msg["spuid"] === deviceActionsSpuid){
		
    		// iterate over rows of the results
    		for (var i in msg["results"]["addedresults"]["bindings"]){

    		    // iterate over columns
    		    tUri = msg["results"]["addedresults"]["bindings"][i]["thing"]["value"];		   
    		    aUri = msg["results"]["addedresults"]["bindings"][i]["action"]["value"];
    		    aName = msg["results"]["addedresults"]["bindings"][i]["actionName"]["value"];
    		    var table = document.getElementById("deviceActionsTable");

    		    if (!document.getElementById(aUri)){		
    			var row = table.insertRow(-1);
    			row.id = aUri;
    			var f1 = row.insertCell(0);
    			var f2 = row.insertCell(1);
    			var f3 = row.insertCell(2);
    			var f4 = row.insertCell(3);
    			var f5 = row.insertCell(4);
    			f1.innerHTML = tUri.replace(wot, "wot:");
    			f2.innerHTML = aUri.replace(wot, "wot:");
    			f3.innerHTML = aName;
    			f4id = "input_" + aUri.split("#")[1];
    			f4.innerHTML = '<input type="text" class="form-control" aria-describedby="basic-addon1" id=' + f4id + ' />';
    			f5.innerHTML = "<button action='button' class='btn btn-secondary btn-sm' onclick='javascript:invokeAction(" + '"' + tUri + '"' + ","  + '"' + aUri + '"' + ");'><span class='glyphicon glyphicon-play-circle' aria-hidden='true'>&nbsp;</span>Invoke</button>";
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


//////////////////////////////////////////////
//
// Functions to clear the interface
//
//////////////////////////////////////////////

function clearData(){

    // unsubscribe
    unsubscribe("all");

    // empty tables
    emptyTables("all");

    // empty panels
    emptyPanelHeadFoot("all");
    
};

function emptyTables(req){

    table = document.getElementById("deviceTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    };
    
    table = document.getElementById("deviceActionsTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    };
    
    table = document.getElementById("deviceEventsTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    };
    
    table = document.getElementById("devicePropTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    };

}

function emptyPanelHeadFoot(req){

    // main panel
    if (req === "all"){
	$("#devicesPanel").removeClass("panel-success");
	document.getElementById("spuid").innerHTML = "";
    }

    // clear actions panel
    $("#deviceActionsPanel").removeClass("panel-success");
    document.getElementById("deviceActionsSpuid").innerHTML = "";
    
    // clear events panel
    $("#deviceEventsPanel").removeClass("panel-success");
    document.getElementById("deviceEventsSpuid").innerHTML = "";
    
    // clear props panel
    $("#devicePropPanel").removeClass("panel-success");
    document.getElementById("devicePropertiesSpuid").innerHTML = "";

    // clear the device name from every panel
    deviceNameSections = document.getElementsByClassName("deviceName");
    for (d in deviceNameSections){
	deviceNameSections[d].innerHTML = "";
    };
    
}


function invokeAction(thingId, actionId){

    // read the URI to send SPARQL update
    updateURI = document.getElementById("updateURI").value;

    // read the input
    actionInputField = "input_" + actionId.split("#")[1];
    actionInput = document.getElementById(actionInputField).value;

    // build the sparql update
    su = "PREFIX wot:<http://wot.arces.unibo.it/sepa#> " +
	"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
	"PREFIX dul:<http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> " + 
	"PREFIX td:<http://www.w3.org/ns/td#> "+
	"DELETE { <" + actionId + "> wot:hasInstance ?oldInstance . " +
	"?oldInstance rdf:type wot:ActionInstance . " +
	"?oldInstance wot:hasTimeStamp ?aOldTimeStamp . " +
	"?oldInstance td:hasInput ?oldInput . " +
	"?oldInput dul:hasDataValue ?oldValue } " +
	"INSERT { <" + actionId + "> wot:hasInstance ?newInstance . " +
	"?newInstance rdf:type wot:ActionInstance . " +
	"?newInstance wot:hasTimeStamp ?time . " +
	"?newInstance td:hasInput ?newInput . " +
	"?newInput dul:hasDataValue '" + actionInput + "' } " +
	"WHERE { <" + actionId + "> rdf:type td:Action . " +
	"<" + thingId + "> td:hasAction ?action . " +
	"<" + thingId + "> wot:isDiscoverable 'true' . " +
	"BIND(now() AS ?time) . " +
	"BIND(IRI(concat('http://wot.arces.unibo.it/sepa#Action_',STRUUID())) AS ?newInstance) . " +
	"BIND(IRI(concat('http://wot.arces.unibo.it/sepa#ActionInput_',STRUUID())) AS ?newInput) . " +
	"OPTIONAL{ <" + actionId + "> wot:hasInstance ?oldInstance. " +
	"?oldInstance rdf:type wot:ActionInstance. " +
	"?oldInstance wot:hasTimeStamp ?aOldTimeStamp . " +
	"?oldInstance td:hasInput ?oldInput . " +
	"?oldInput dul:hasDataValue ?oldValue}}";
    
    // send the sparql update
    var req = $.ajax({
	url: updateURI,
	crossOrigin: true,
	method: 'POST',
	contentType: "application/sparql-update",
	data: su,	
	error: function(event){
	    d = new Date();
	    ts = d.toLocaleFormat("%y/%m/%d %H:%M:%S");
	    console.log("[DEBUG] Connection failed!");
	    return false;
	},
	success: function(data){
	    d = new Date();
	    ts = d.toLocaleFormat("%y/%m/%d %H:%M:%S");
	}
    });
    
    // eventually wait/subscribe for results
    
}
