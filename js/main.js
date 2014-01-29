//This holds the current page that we are on
var curr_page = (typeof curr_page == 'undefined') ? "main_menu" : curr_page;

//Send the device back to the main menu page after 10 minutes of inactivity
var IDLE_TIMEOUT = 300; //seconds
var _idleSeconds = 0;

//Reset the idle counter on any mouse click, mouse movement or keypress events
$(document).on('click', function() {
    _idleSeconds = 0;
});

$(document).on('mousemove', function() {
    _idleSeconds = 0;
});

$(document).on('keypress', function() {
    _idleSeconds = 0;
});

$(document).on('tap', function() {
    _idleSeconds = 0;
});

//Check the idle time and update the time in the upper right corner every second
window.setInterval(CheckIdleTime, 1000);

//Update the MisterHouse mode icon in the upper left corner every minute
window.setInterval(function() { GetMhMode('header'); }, 60000);

//******************************************************************************
// This function is the handler for the idle time counter. This gets run once 
// per second. It increments the idle counter and checks the counter against 
// the IDLE_TIMEOUT value and sends the user back to the main menu (if the user
// is not already there) after the timer runs out.  It also lets you use an 
// element "SecondsUntilExpire" to show the timer count on the screen
//******************************************************************************
function CheckIdleTime() {
    _idleSeconds++;
    var oPanel = $("#SecondsUntilExpire");
    if (oPanel)
        oPanel.html((IDLE_TIMEOUT - _idleSeconds) + "");
    if (_idleSeconds >= IDLE_TIMEOUT) {
        //No need to go to the main_menu page if we are already there
        if (curr_page != "main_menu") {
        	//GoPage('main_menu');
        }
        //Reset the counter
        _idleSeconds = 0;
    }
    ShowTime();
}

//******************************************************************************
// This function is the jquery .ready function. Here we initialize the webSocket
// load the initial page and get the current system mode icon and display it in 
// the header
//******************************************************************************
$(function() {
  //App globals and settings
  $.ts = { };
  //Initialize webSocket object
  initWebSocket();
  //Load the initial page
  LoadPage(curr_page);
  //Get the current mh mode and display it
  GetMhMode('header');
});

//******************************************************************************
// This function loads a page into the content area
//
// @arg page_name - The name of the page to load
//******************************************************************************
function LoadPage(page_name) {
  $('#content').load('./' + page_name + '.html');
}

//******************************************************************************
// This function displays the time in the corner
//******************************************************************************
function ShowTime() {
  $("#hdrDateTime").html(formatAMPM());
}

//******************************************************************************
// This function sets the current page variable and loads the page
//
// @arg page_name - The name of the page to load
//******************************************************************************
function GoPage(page_name) {
  curr_page = page_name;
  LoadPage(page_name);
}

//******************************************************************************
// This function is used to set the state of an  object in MisterHouse. If we 
// are setting the system mode (mode_occupied), then refresh the header icon for
// it after setting it. I am using an HTTP GET request as MH returns log 
// information that we don't want displayed, but we can possibly parse it for 
// errors returned 
//
// @arg obj - The MH object to change
// @arg state - the state to change it to
//******************************************************************************
function MhSet(obj, state) {
  var url='./set;Referrer?$' + obj + '=' + state;
  $.get(url, function (data) {
    //alert(data);
    if (obj == "mode_occupied") {
      GetMhMode("page");
    }
  });
}

//******************************************************************************
// This function gets the current mode that MH is in and also gets a list of the 
// availble modes MH uses.  Currently this should be Home, Work and Vacation
// modes. If calling to load the system mode page we will use the available 
// modes to build a table with the mode icons in a row with the icon for the 
// current active mode highlighted.  FOr all calls to this function, the current
// mode retrieved is used to update the current mode icon that is displayed in 
// the header. The ph="header" argument call is here for possible future use.
//
// @arg ph - either "page" or "header"
//******************************************************************************
function GetMhMode(ph) {
  var url = './sub?json(objects=mode_occupied)';

  //Get the current MH mode using a JSON call
  $.get(url, function (data) {
    var mode = data.objects.mode_occupied.state;
    var modes = data.objects.mode_occupied.states;
    var count = Object.keys(modes).length;

    if (ph == "page") {
      //we have requested a system mode page update
      var modesTable = '<table id="modesTable" style="width: 100%" data-transition="fade"><tbody>';
      modesTable += '<tr>';
    
      for (var i = 0;i < count; i++) {
        modesTable += '<td align="center">';
        if (modes[i] != mode) {
          modesTable += '<a href="javascript:MhSet(\'mode_occupied\', \'' + modes[i] + '\');">';
          modesTable += '<img src="images/icons/' + modes[i] + '_mode.png" alt="' + modes[i] + ' mode" width="200" height="200">';
          modesTable += '</a>';
        } else {
          modesTable += '<img src="images/icons/' + mode + '_mode_active.png" alt="Current mode" width="200" height="200" />';
        }
        modesTable += '</td>';
      }
      modesTable += '</tr>';
      modesTable += '</tbody></table>';

      $('#modesList').html(modesTable);
    }
    //Even if we make a call for a system mode page update we might as well update the header image since we have the data
    var modeHdr= '<img src="images/icons/' + mode + '_mode_small.png" alt="' + mode + ' mode" width="32" height="32">';
    $('#hdrMode').html(modeHdr);
  });
}

//******************************************************************************
// This function generates the time string that is displayed in the upper right
// corner of the window.
//******************************************************************************
function formatAMPM() {
  var d = new Date(),
  minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
  hours = d.getHours() > 12 ? d.getHours() - 12 : d.getHours(),
  ampm = d.getHours() >= 12 ? 'pm' : 'am',
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  
  return days[d.getDay()]+' '+months[d.getMonth()]+' '+d.getDate()+' '+d.getFullYear()+' '+hours+':'+minutes+ampm;
}


//******************************************************************************
// This is to hijack the javascript alert function to place alerts on the bottom 
// status bar.  It also sets a timeout function that will clear the status bar 
// after a defined timeout period
//
// @arg msg - The message to be displayed.
// @arg timeout - An optional timeout period can be passed to tell how long the 
//                message should stay in the status bar before being cleared. if
//                no timeout is specified, the default is 20 seconds.
//******************************************************************************
function alert(msg, timeout) {
  // Set the timeout value
  timeout = timeout || 20000
  // Display the message
  $('#AlertMsg').html(msg);
  setTimeout(function() { $('#AlertMsg').html('&nbsp;'); }, timeout);
}

//******************************************************************************
// webSocket object
//
// define some constants for later use
// initialize webSocket object and methods
// create a websocket connection and define its event functions
//
// Sean Mathews
// coder at f34r dot com
//
//******************************************************************************
function initWebSocket()
{
  // create our connection url and add to our touchscreen(ts) object
  $.ts.wsUri = "ws://" + window.location.hostname + ":3000/";

  // start the connection. async so it wont happen just yet
  $.ts.webSocket = new WebSocket($.ts.wsUri);

  // connect establish event
  $.ts.webSocket.onopen = function(evt) {
    console.log("WebSocket connected");
  };

  // connection close event
  $.ts.webSocket.onclose = function(evt) {
    console.log("WebSocket closed");
  };

  // connection message event
  $.ts.webSocket.onmessage = function(evt) {
    console.log("WebSocket message: " + evt.data);
    alert("WebSocket message: " + evt.data);
    // check for a restart event
    if(evt.data === "RESTART") {
       alert("MH just told me it restarted. Is all ok?");
    }

    //check for a thermostat mode event
    if(therm_mode = /^THERM_MODE:(.*)/.exec(evt.data)) {
      if (val = $('#mode_select_val')) {
        if (val.text() != states[therm_mode[1]]) {
          val.text(states[therm_mode[1]]);
          alert("Mode changed to " + states[therm_mode[1]]);
        }
      }
    }

    //check for a thermostat fan event
    if(therm_fan = /^THERM_FAN:(.*)/.exec(evt.data)) {
      if (val = $('#fan_select_val')) {
        if (val.text() != states[therm_fan[1]]) {
          val.text(states[therm_fan[1]]);
          alert("Fan mode changed to " + states[therm_fan[1]]);
        }
      }
    }

    //check for a thermostat state event
    if(therm_state = /^THERM_STATE:(.*)/.exec(evt.data)) {
      if (mode_state = $('#mode_state')) {
        switch (therm_state[1]) {
          case "off":
            var offset = '-32';
            break;
          case "heat":
            var offset = '0';
            break;
          case "cool":
            var offset = '-64';
            break;
        }
        mode_state.css('background-position', '0 ' + offset + 'px');
      }
    }

    //check for a thermostat state event
    if(therm_fan_state = /^THERM_FAN_STATE:(.*)/.exec(evt.data)) {
      if (mode_fan = $('#fan_state')) {
        var offset = '0';
        if (therm_fan_state[1] == 'on') {
          offset = '-32';
        }
        mode_fan.css('background-position', '0 ' + offset + 'px');
      }
    }
  };

  // connection error event
  $.ts.webSocket.onerror = function(evt) {
    console.log("WebSocket error");
  };

  // sendToMH send a json message to MH
  //
  // var msg = {
  // event: "click",
  // data: "power"
  // };
  // $.ts.webSocket.sendToMH(msg);
  //
  $.ts.webSocket.sendToMH = function (msg) {
    console.log("WebSocket sendToMH");
    $.ts.webSocket.send(JSON.stringify(msg));
  };
}
