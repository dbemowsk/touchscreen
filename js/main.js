var curr_page = (typeof curr_page == 'undefined') ? "main_menu" : curr_page;

//Update the time in the upper right corner every second
window.setInterval(ShowTime, 1000);

//Update the MisterHouse mode icon in the upper left corner every minute
window.setInterval(function() { GetMhMode('header'); }, 60000);

//******************************************************************************
// This function is the jquery .ready function. Here we load the initial page 
// and get the current system mode icon and display it in the header
//******************************************************************************
$(function() {
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
  var url='./set?$' + obj + '=' + state;
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
