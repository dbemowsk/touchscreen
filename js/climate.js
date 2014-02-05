// This is an associative array of display names for the available thermostat states
var states = {'off'        : 'Off',
              'on'         : 'On',
              'heat'       : 'Heat',
              'cool'       : 'Cool',
              'auto'       : 'Auto',
              'emerg_heat' : 'Emergency Heat',
              'invalid'    : 'Invalid',
              'fan_on'     : 'On',
              'fan_auto'   : 'Auto',
              'hold'       : 'Hold',
              'run'        : 'Run',
              'vacation'   : 'Vacation',
              'no_vacation': 'Vacation Off'};

// This is a list of the switchable modes used for mode selection
var modes = ['off', 'heat', 'cool', 'auto'];

// This is a list of the switchable fan modes used for fan mode selection
var fanModes = ['fan_auto', 'fan_on'];

$(function() {
  //Add an onClick handler for selecting modes
  $('#mode_select').click(function() { 
    var val = GetKeyFromHash(states, $('#mode_select_val').text());
    var idx = modes.indexOf(val);
    idx++;
    idx = (idx > modes.length - 1) ? 0 : idx;
    $('#mode_select_val').text(states[modes[idx]]);

    //Here we need to send the selected mode value to MH
    var msg = {
      type: "click",
      text: "therm_mode",
      value: modes[idx]
    };
    //Send the command
    $.ts.webSocket.sendToMH(msg);
  });

  //Add an onClick handler for selecting fan modes
  $('#fan_select').click(function() {
    var fansel = GetKeyFromHash(states, $('#fan_select_val').text());
    var idx = fanModes.indexOf(fansel);
    idx++;
    idx = (idx > fanModes.length - 1) ? 0 : idx;
    $('#fan_select_val').text(states[fanModes[idx]]);

    //Here we need to send the selected fan mode value to MH
    var msg = {
      type: "click",
      text: "therm_fan",
      value: fanModes[idx]
    };
    //Send the command
    $.ts.webSocket.sendToMH(msg);
  });

  updateThermInfo();
});

//******************************************************************************
// This function is used to get a key name from a value in a hash
//
// @arg hash - The hash containing the key value pairs
// @arg val - The value to search for in the hash
//
// return the key name for the value in the hash or unknown if not found
//******************************************************************************
function GetKeyFromHash(hash, val) {
  var rtn = "unknown";
  for (var name in hash) {
    if (hash[name] === val) rtn = name;
  }
  return rtn;
}

//******************************************************************************
// This function takes a temperature value and returns a hex rgb color value
// that relates to that temperature.  Colder values return cooler colors in the  
// blue spectrum, and hotter values return warmer colors in the red spectrum. 
//
// @arg temp - The temperature value to convert
// @arg fc - farenheit or celsius
//******************************************************************************
function Temp2RGB(temp, fc) {
  //Convert to farenheit if necessary
  temp = (fc == "C" || fc == "c") ? ((temp * 9 / 5) + 32) : temp;

  var RGB = '#000034';
  if (temp > 99) { RGB = '#670001'; } else
  if (temp > 91.5) { RGB = '#800000'; } else
  if (temp > 83.1) { RGB = '#990002'; } else
  if (temp > 74.6) { RGB = '#c22009'; } else
  if (temp > 66.1) { RGB = '#ee540e'; } else
  if (temp > 57.7) { RGB = '#fdca00'; } else
  if (temp > 49.2) { RGB = '#fcff68'; } else
  if (temp > 40.8) { RGB = '#fefefe'; } else
  if (temp > 32.3) { RGB = '#99cdff'; } else
  if (temp > 23.8) { RGB = '#3c9dd2'; } else
  if (temp > 15.4) { RGB = '#0066cb'; } else
  if (temp > 6.9) { RGB = '#003466'; } else
  if (temp > -1.5) { RGB = '#003466'; } 
    
  return RGB;
}

//******************************************************************************
// This function gets the current thermostat information and updates the page
//
//******************************************************************************
function updateThermInfo() {
  var url;

  //Get updated thermostat information every 15 seconds
  //window.setTimeout(updateThermInfo, 15000);

  url = './sub?json(subs=therm_get_mode)';

  //Get the current thermostat mode
  $.getJSON(url, function (data) {
    mode = data.subs.therm_get_mode;
  $('#mode_select_val').html(states[mode]);
  });

  url = './sub?json(subs=therm_get_state)';
  
  //Get the current HVAC state
  $.getJSON(url, function (data) {
    state = data.subs.therm_get_state;

    switch (state) {
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
    $('#mode_state').css('background-position', '0 ' + offset + 'px');
  });

  url = './sub?json(subs=therm_get_fan_mode)';

  //Get the current fan mode
  $.getJSON(url, function (data) {
    mode = data.subs.therm_get_fan_mode;  
  
    $('#fan_select_val').html(states[mode]);
  });

  url = './sub?json(subs=therm_get_fan_state)';

  //Get the current fan state
  $.getJSON(url, function (data) {
    state = data.subs.therm_get_fan_state;

    var offset = '0';
    if (state == 'on') {
      offset = '-32';
    }
    $('#fan_state').css('background-position', '0 ' + offset + 'px');
  });

  url = './sub?json(subs=therm_get_heat_setpoint)';

  //Get the current heating setpoint
  $.getJSON(url, function (data) {
    hsp = data.subs.therm_get_heat_setpoint;
  
    //Update the spinner's valuenow and set the displayed heating setpoint  
    $('#hsp').attr('aria-valuenow', hsp);
    $('#hsp').html(hsp);
    //Once we update the values we need to start the spinbutton controls
    if (typeof spin1 != 'object') {
      var spin1 = new spinbutton('hsp', 'hsp_up', 'hsp_down', 1, function() {
        //Here we need to send the heating setpoint value to MH
        var msg = {
          type: "click",
          text: "hsp",
          value: this.valNow
        };
        //Send the command
        $.ts.webSocket.sendToMH(msg);
      });
    }
  });

  url = './sub?json(subs=therm_get_cool_setpoint)';

  //Get the current cooling setpoint
  $.getJSON(url, function (data) {
    csp = data.subs.therm_get_cool_setpoint;

    //Update the spinner's valuenow and set the displayed heating setpoint
    $('#csp').attr('aria-valuenow', csp);  
    $('#csp').html(csp);
    //Once we update the values we need to start the spinbutton controls
    if (typeof spin2 != 'object') {
      var spin2 = new spinbutton('csp', 'csp_up', 'csp_down', 1, function() {
        //Here we need to send the cooling setpoint value to MH
        var msg = {
          type: "click",
          text: "csp",
          value: this.valNow
        };
        //Send the command
        $.ts.webSocket.sendToMH(msg);
      });
    }
  });
}

//******************************************************************************
// This function gathers the weather data and displays it on the right half of 
// the climate page.
//
//******************************************************************************
function updateWeather() {
  //Get updated weather information every 30 seconds
  window.setTimeout(updateWeather, 30000);

  var timeOfDay;
  var weatherImage;
  var url = './sub?json(vars=Time_Of_Day)';
  
  $.getJSON(url, function (data) {
    timeOfDay = data.vars.Time_Of_Day;
  });

  var out = '';
  var cloudImg = "";
  var uom_temp, uom_wind, uom_rain, uom_baro, disp_heat_index;

  url = './sub?json(config_parms)';

  $.getJSON(url, function (data) {
    // Get the temperature unit of measure (F)arenheit or (C)elsius
    uom_temp = data.config_parms.weather_uom_temp;

    // Get the wind unit of measure
    uom_wind = data.config_parms.weather_uom_wind;

    // Get the rain unit of measure
    uom_rain = data.config_parms.weather_uom_rain;

    // Get the barometer unit of measure
    uom_baro = data.config_parms.weather_uom_baro;

    // Check if we should display the heat index
    disp_heat_index = data.config_parms.weather_use_heatindex
  });

  url = './sub?json(weather)';

  //get the weather data
  $.getJSON(url, function (data) {
    //We should not use the "Clouds" value if we have a "Condition" value set
    var conditionIsSet = false;

    //Now loop through the weather data
    $.each(data.Weather, function(key, value) {
      //check if we have a page element to update
      var el = $('#' + key);
      out += "["+key+"] = "+value+"\n";
      if (el.length > 0) {
        value = (value == "null") ? "?" : value;
        if (key.match(/^Temp/) || key.match(/^WindChill$/)) {
          el.html(value + " &deg;" + uom_temp);
          el.css('color', Temp2RGB(value, uom_temp));
          if (key.match(/^WindChill$/)) {
            if ((value < 40 && uom_temp == "F") || (value < 5 && uom_temp == "C")) {
              $('#WindChillData').removeClass('hidden');
            } else {
              $('#HeatIndexData').removeClass('hidden');
            }
          }
        } else if (key.match(/^Conditions$/)) {
          //if the returned condition text contains spaces, replace them with underscores
          value = value.replace(/ /, "_");
          weatherImage = value;
          cloudEle = key;
          conditionIsSet = true;
        } else if (key.match(/^HumidOutdoor$/)) {
          el.html(value + " %");
          // Now show the block
          $('#HumidOut').removeClass('hidden');
        } else if (key.match(/^HumidIndoor$/)) {
          el.html(value + " %");
          // Now show the block
          $('#HumidIn').removeClass('hidden');
        } else if (key.match(/^Barom.*/)) {
          el.html(value + " " + uom_baro + " and " + data.Weather.BaromDelta);
        } else if (key.match(/^WindDirection$/) && data.Weather.WindDirection != "no wind") {
          el.html(value + " at " + data.Weather.WindAvgSpeed + " " + uom_wind);
        } else {
          el.html(value);
        }
      }

      if (!conditionIsSet && key.match(/^Clouds/)) {
        weatherImage = value.replace(/ /, "_");
        cloudEle = key;
      }
    });

    //If all is done and there is a weather image, display its coresponding time of day image
    if (weatherImage != "") {
     SetWeatherImage(cloudEle,timeOfDay, weatherImage);
    } 
  });
}
//******************************************************************************
// This function displays the weather background image using the time of the day
// and the conditions/clouds data.  It first checks to see if an image based on
// the time of day and conditions/clouds data exists and uses that if it does.
// If a time of day image does not exist, it tries to use an image based only on
// the conditions/clouds data.
// 
// @arg el - The element that the image should be added to
// @arg timeOfDay - Time of the day (morning, afternoon, evening or night)
// @arg value - The formatted conditions/clouds data
//
//******************************************************************************
function SetWeatherImage(el,timeOfDay, value) {
  img = './images/weather/' + timeOfDay + '_' + value + '.png';
  el = $('#Conditions');
  el.css('background-size', '256px 256px');
  el.css('background-repeat', 'no-repeat');
  el.css('background-position', 'center 20px');

  $.get(img).done(function(data) {
    // Since MH will pass a "Missing Page" when the image is not found, check
    // for that and load the alternate image if found.
    if (data.match(/[/s/S]*<title>Missing Page<\/title>/i)) {
      img = './images/weather/' + value + '.png';
    }
    el.css('background-image', 'url(' + img + ')');
  }).fail(function() {
    // If by chance we did get an actual 404 error that brings us here, process
    // it as if it were a missing image and load the alternate.
    img = './images/weather/' + value + '.png';
    el.css('background-image', 'url(' + img + ')');
  });
}
