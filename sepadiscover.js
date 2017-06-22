// state variables
var deviceListSub = null;
var devicePropertySub = null;
var devices = [];

function init(){
    $("#devicesPanel").removeClass("panel-success");
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
		    f4.innerHTML = '<button type="button" id=\'' + thingUri.split("#")[1] + 'Btn\' class="btn btn-secondary" onclick="javascript:subscribeToDevice(\'' + thingUri + '\');"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></button>';
		}
		else {
		    // TODO
		    console.log("[TODO] Implement editing an existing device");
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

    // modify the panel heading
    document.getElementById("deviceName").innerHTML = deviceId;

    // get the related button and colour it
    $("#" + deviceId.split("#")[1] + "Btn").addClass("btn-success");
    
    // close open subscriptions
    if (devicePropertySub !== null){
	console.log("[DEBUG] Closing previous subscription");
	devicePropertySub.close();
    }

    // clear previous data in table
    var table = document.getElementById("devicePropTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    }

    // change the colour of the panel
    $("#devicePropPanel").removeClass("panel-success");
    $("#devicePropPanel").addClass("panel-success");
    
    // prepare the subscription
    subscUrl = document.getElementById("subscribeURI").value;
    subText = "PREFIX wot:<http://www.arces.unibo.it/wot#> " +
	"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
	"PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> " +
	"PREFIX dul:<http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> " +
	"SELECT ?property ?propertyName ?propertyValue " +
	"WHERE { " +
	"<" + deviceId + "> td:hasProperty ?p . " +
	"?property td:hasName ?propertyName . " +
	"?property td:hasValueType ?propertyValueType . " +
	"?propertyValueType dul:hasDataValue ?propertyValue " +
	"}";

    // subscription
    
    // 1 - open connection
    var ws2 = new WebSocket(subscUrl);
    
    // 2 - send subscription
    ws2.onopen = function(){
	ws2.send(JSON.stringify({"subscribe":subText, "alias":"-"}));
    };
    
    // 3 - handler for received messages
    ws2.onmessage = function(event){
	
	// parse the message
	msg = JSON.parse(event.data);

	// store the subscription ID
	if (msg["subscribed"] !== undefined){

	    // get the subid
	    subid = msg["subscribed"];

	    // store the subid in the html field
	    document.getElementById("deviceSpuid").innerHTML = subid;

	    // save the websocket
	    devicePropertySub = ws2;
	    
	} else if (msg["results"] !== undefined){

	    // iterate over rows of the results
	    for (var i in msg["results"]["addedresults"]["bindings"]){
		
		// iterate over columns
		pUri = msg["results"]["addedresults"]["bindings"][i]["property"]["value"];
		pName = msg["results"]["addedresults"]["bindings"][i]["propertyName"]["value"];
		pValue = msg["results"]["addedresults"]["bindings"][i]["propertyValue"]["value"];
		var table = document.getElementById("devicePropTable");
		var row = table.insertRow(-1);
		var f1 = row.insertCell(0);
		var f2 = row.insertCell(1);
		var f3 = row.insertCell(2);
		f1.innerHTML = pUri;
		f2.innerHTML = pName;
		f3.innerHTML = pValue;
	    }

	}
	
    };

    // 4 - handler for closed websocket
    ws2.onclose = function(event){

	// debug print
	console.log("[DEBUG] Closing subscription to device property");

	// restore the interface
	$("#devicePropPanel").removeClass("panel-success");
	document.getElementById("deviceSpuid").innerHTML = "";
	$("#" + deviceId.split("#")[1] + "Btn").removeClass("btn-success");

    }; 

    
};

function unsubscribe(){

    // close subscription to devices
    if (deviceListSub !== null){
	deviceListSub.close();
    }

    // close subscription to properties
    if (devicePropertySub !== null){
	devicePropertySub.close();
    }

};

function clearData(){

    // unsubscribe
    unsubscribe();

    // clear previous data in table
    var table = document.getElementById("devicePropTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    }

    // clear previous data in table
    var table = document.getElementById("deviceTable");
    while(table.rows.length > 1) {
	table.deleteRow(-1);
    }

    // clear the panel heading for device properties
    document.getElementById("deviceName").innerHTML = "";
    
};
