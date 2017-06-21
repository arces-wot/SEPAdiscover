function subscribe(){

    // read form data
    queryUrl = document.getElementById("queryURI").value;
    subscUrl = document.getElementById("subscribeURI").value;
    console.log(subscUrl);

    // subscription
    
    // 1 - open connection
    var ws = new WebSocket(subscUrl);
    
    // 2 - send subscription
    ws.onopen = function(){
	wsText = "PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX td:<http://w3c.github.io/wot/w3c-wot-td-ontology.owl#> SELECT ?s ?n WHERE { ?s rdf:type td:Thing . ?s td:hasName ?n }";
	ws.send(JSON.stringify({"subscribe":wsText, "alias":"-"}));
    };
    
    // 3 - handler for received messages
    ws.onmessage = function(event){
	
	// parse the message
	msg = JSON.parse(event.data);

	// store the subscription ID
	if (msg["subscribed"] !== undefined){	   
	    subid = msg["subscribed"];
	    // document.getElementById("spuid").innerHTML = subid;
	} else if (msg["results"] !== undefined){
	    console.log(msg["results"]);
	    console.log(msg["results"]["head"]);
	    console.log(msg["results"]["addedresults"]);

	    // iterate over rows of the results
	    for (var i in msg["results"]["addedresults"]){

		// iterate over columns
		turi = msg["results"]["addedresults"][i][0]["s"]["value"];
		name = msg["results"]["addedresults"][i][0]["n"]["value"];
		var table = document.getElementById("deviceTable");
		var row = table.insertRow(-1);
		var f1 = row.insertCell(0);
		var f2 = row.insertCell(1);
		var f3 = row.insertCell(2);
		f1.innerHTML = turi;
		f2.innerHTML = name;
		f3.innerHTML = '<span class="glyphicon glyphicon-search" aria-hidden="true"></span>';		
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
