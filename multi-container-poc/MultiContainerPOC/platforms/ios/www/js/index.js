/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        window.plugins.touchid.isAvailable(
  			function(msg) {
  				alert('ok: ' + msg);
  				window.plugins.touchid.verifyFingerprint(
  					'Scan your fingerprint please', // this will be shown in the native scanner popup
					   function(msg) {alert('ok: ' + msg)}, // success handler: fingerprint accepted
					   function(msg) {alert('not ok: ' + JSON.stringify(msg))} // error handler with errorcode and localised reason
				);
  			},    // success handler: TouchID available
			  function(msg) {alert('not ok: ' + msg)} // error handler: no TouchID available
		);
		
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();



var event = document.createEvent('Event');

// Define that the event name is 'build'.
event.initEvent('build', true, true);

// Listen for the event.
document.addEventListener('build', function (e) {
	alert("test");
}, false);



function fireMsg() { 
	document.dispatchEvent(event);	
}


function startPageCounter() {
	startPage1Counter();
	startPage2Counter();
}

var page1Count = 0;

function startPage1Counter() {
	var self = this;
	setInterval(function(){
		$("#test-page-1-msg").html("Counter = " + self.page1Count);
		self.page1Count++;
		console.log(self.page1Count);
	}, 50);
}

var page2Count = 0;

function startPage2Counter() {
	setInterval(function(){
		$("#test-page-2-msg").html("Counter = " + page2Count);
		page2Count++;
	}, 50);
}
	
$("#test-page-2").click(function() {
	webview.Show("page2.html");
});	

$("#close-test-page-2").click(function() {
	webview.Close();
});


        startPageCounter();