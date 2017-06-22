// state variables
var deviceListSub = null;
var devicePropertySub = null;

function subscribe(){

    // read form data
    subscUrl = document.getElementById("subscribeURI").value;

    // subscription
    
    // 1 - open connection
    var ws = new WebSocket(subscUrl);
    
    // 2 - send subscription
    ws.onopen = function(){
	wsText = "PREFIX wot:<http://www.arces.unibo.it/wot#> " +
	    "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> " +
	    "PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> "+
	    "SELECT ?thingUri ?thingName ?thingStatus " +
	    "WHERE { " +
	    "?thingUri rdf:type td:Thing . " +
	    "?thingUri td:hasName ?thingName . " +
	    "?thingUri wot:isDiscoverable ?thingStatus " +
	    "}";
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
	    
	} else if (msg["results"] !== undefined){

	    // iterate over rows of the results
	    for (var i in msg["results"]["addedresults"]["bindings"]){

		// iterate over columns
		turi = msg["results"]["addedresults"]["bindings"][i]["thingUri"]["value"];
		name = msg["results"]["addedresults"]["bindings"][i]["thingName"]["value"];
		status = msg["results"]["addedresults"]["bindings"][i]["thingStatus"]["value"];
		var table = document.getElementById("deviceTable");
		var row = table.insertRow(-1);
		var f1 = row.insertCell(0);
		var f2 = row.insertCell(1);
		var f3 = row.insertCell(2);
		f1.innerHTML = turi;
		f2.innerHTML = name;
		if (status === "true"){
		    f3.innerHTML = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
		} else {
		    f3.innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
		}
		var f4 = row.insertCell(3);
		f4.innerHTML = '<button type="button" class="btn btn-secondary" onclick="javascript:monitor(\'' + turi + '\');"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></button>';
	    }

	}
	
    };

    // 4 - handler for closed websocket
    ws.onclose = function(event){
	subid = document.getElementById("spuid").value;
	console.log(subid);
	console.log(document.getElementById("spuid"));
	console.log("[INFO] Subscription " + subid + " closed.");
    }; 
    
};

function monitor(deviceId){

    console.log(test);
    
    // close open subscriptions
    if (devicePropertySub !== null){
	console.log("[DEBUG] Closing previous subscription");
	devicePropertySub.close();
    }
    
    
    // prepare the subscription
    subscUrl = document.getElementById("subscribeURI").value;
    subText = "PREFIX wot:<http://www.arces.unibo.it/wot#> PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> PREFIX dul:<http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> SELECT ?p ?pName ?pValue WHERE { <" + deviceId + "> td:hasProperty ?p . ?p td:hasName ?pName . ?p td:hasValueType ?pvt . ?pvt dul:hasDataValue ?pValue }";

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
	console.log(msg);

	// store the subscription ID
	if (msg["subscribed"] !== undefined){	   
	    subid = msg["subscribed"];
	    document.getElementById("deviceSpuid").innerHTML = subid;
	} else if (msg["results"] !== undefined){

	    // iterate over rows of the results
	    for (var i in msg["results"]["addedresults"]["bindings"]){
		
		// iterate over columns
		puri = msg["results"]["addedresults"]["bindings"][i]["p"]["value"];
		pname = msg["results"]["addedresults"]["bindings"][i]["pName"]["value"];
		pvalue = msg["results"]["addedresults"]["bindings"][i]["pValue"]["value"];
		var table = document.getElementById("devicePropTable");
		var row = table.insertRow(-1);
		var f1 = row.insertCell(0);
		var f2 = row.insertCell(1);
		var f3 = row.insertCell(2);
		f1.innerHTML = puri;
		f2.innerHTML = pname;
		f3.innerHTML = pvalue;
	    }

	}
	
    };

    // 4 - handler for closed websocket
    ws2.onclose = function(event){
	subid = document.getElementById("spuid").value;
	document.getElementById("deviceSpuid").innerHTML = "";	
    }; 

    
};
