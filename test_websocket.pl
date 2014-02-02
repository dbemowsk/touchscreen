# Category=touchScreen
#@ HTML 5 Touchscreen interface backend using WebSockets
#
# Sean Mathews
# coder at f34r dot com
#
############################################################################

#noloop=start

# map click messages to functions
my %clicks = (
  "power_button" => sub {
    my ( $json ) = @_;
    &::print_log("power_button clicked '$$json'");
    set $v_reload_code ON;
  },
  "some_button" => sub {
    my ( $json ) = @_;
    &::print_log("some_button clicked");
  },
  "hsp" => sub {
    my ( $json ) = @_;
    my $value = $$json->{'value'};
    therm_set_heat_setpoint($value);

    &::print_log("Changed heating setpoint to $value degrees");
    sendUpdate("#hsp", "text", $value);
  },
  "csp" => sub {
    my ( $json ) = @_;
    my $value = $$json->{'value'};
    therm_set_cool_setpoint($value);

    &::print_log("Changed cooling setpoint to $value degrees");
    sendUpdate("#csp", "text", $value);
  },
  "therm_mode" => sub {
    my ( $json ) = @_;
    my $value = $$json->{'value'};
    therm_set_mode($value);

    &::print_log("Changed furnace mode to $value");
    sendUpdate("#mode_select_val", "state", $value);
  },
  "therm_fan" => sub {
    my ( $json ) = @_;
    my $value = $$json->{'value'};
    therm_set_fan_mode($value);

    &::print_log("Changed furnace fan to $value");
    sendUpdate("#fan_select_val", "state", $value);
  }
);

# dispatch routine for "click" command sent a reference to the json object
sub TouchClick {
  # the full json object sent from the browser
  my ( $json ) = @_;

  &::print_log("TouchClick called with '$$json'");

  # get the click argument and use it to find a handler function
  my $click_id = $$json->{'text'};
  if ($clicks{$click_id}) {
      $clicks{$click_id}->($json);
  } else {
      &::print_log("no such click handler: $click_id");
  }
}

# subscribe to click event messages
WebSocket::subscribe('click', \&TouchClick);

#noloop=stop

# This is run on startup or reload. Tell everyone what happend.
if ($Startup or $Reload) {
  &::print_log("notify all WebSockets we restarted");

  sendMessage("RESTART");
}

# here we will handle thermostat changes that need to be sent to all sockets

# Only perform these operations if the thermostat object is initialized
if ($thermostat) {
  # mode changes
  use vars qw($therm_last_mode);
  use vars qw($therm_last_fan);
  use vars qw($therm_last_state);
  use vars qw($therm_last_fan_state);
  use vars qw($therm_last_heat_set);
  use vars qw($therm_last_cool_set);
  use vars qw($therm_last_inside_temp);
  
  my $therm_check_mode;
  my $therm_check_fan;
  my $therm_check_state;
  my $therm_check_fan_state;
  my $therm_check_heat_set;
  my $therm_check_cool_set;
  my $therm_check_inside_temp;
  
  if ($Startup or $Reload) {
    $therm_last_mode = "unknown";
    $therm_last_fan = "unknown";
  }
  
  if ($New_Second) {
    $therm_check_mode = therm_get_mode();
    $therm_check_fan = therm_get_fan_mode();
    $therm_check_state = therm_get_state();
    $therm_check_fan_state = therm_get_fan_state();
    $therm_check_heat_set = therm_get_heat_setpoint();
    $therm_check_cool_set = therm_get_cool_setpoint();
    $therm_check_inside_temp = $thermostat->get_temp();

    # check if a mode change ocurred
    if ($therm_check_mode ne $therm_last_mode) {
      &::print_log("Notify all WebSockets that the thermostat mode has changed");

      sendUpdate("#mode_select_val", "state", $therm_check_mode);
    }
    
    # check if a fan mode change ocurred 
    if ($therm_check_fan ne $therm_last_fan) {
      &::print_log("Notify all WebSockets that the thermostats fan mode has changed");

      sendUpdate("#fan_select_val", "state", $therm_check_fan);
    }

    #check and update the HVAC system's heating and cooling state as it changes
    if ($therm_check_state ne $therm_last_state) {
      &::print_log("Notify all WebSockets that the HVAC system is now in a $therm_check_state state");

      sendOffset("#mode_state", "0", (($therm_check_state eq "heat") ? "0" : (($therm_check_state eq "off") ? "-32" : "-64")));
    }

    #Check and update the HVAC fan state as it changes
    if ($therm_check_fan_state ne $therm_last_fan_state) {
      &::print_log("Notify all WebSockets that the HVAC system's fan is now $therm_check_fan_state");

      sendOffset("#fan_state", "0", (($therm_check_fan_state eq "off") ? "0" : "-32"));
    }

    #Check and update the thermostat's heating setpoint
    if ($therm_check_heat_set ne $therm_last_heat_set) {
      &::print_log("Notify all WebSockets that the thermostat's heating setpoint is now $therm_check_heat_set");

      sendUpdate("#hsp", "text", $therm_check_heat_set);
    }

    #Check and update the thermostat's cooling setpoint
    if ($therm_check_cool_set ne $therm_last_cool_set) {
      &::print_log("Notify all WebSockets that the thermostat's cooling_setpoint is now $therm_check_cool_set");

      sendUpdate("#csp", "text", $therm_check_cool_set);
    }

    #Check and update the thermostat's temperature
    if ($therm_check_inside_temp ne $therm_last_inside_temp) {
      &::print_log("Notify all WebSockets that the thermostat's temperature is now $therm_check_inside_temp");

      sendUpdate("#TempIndoor", "text", $therm_check_inside_temp);
    }

    # save the last known modes and states so we can test for change
    $therm_last_mode        = $therm_check_mode;
    $therm_last_fan         = $therm_check_fan;
    $therm_last_state       = $therm_check_state;
    $therm_last_fan_state   = $therm_check_fan_state;
    $therm_last_heat_set    = $therm_check_heat_set;
    $therm_last_cool_set    = $therm_check_cool_set;
    $therm_last_inside_temp = $therm_check_inside_temp
  }
}

sub sendUpdate {
  my ($id, $datatype, $data) = @_;

  wsSend('type'     => "upd",
         'id'       => $id,
         'datatype' => $datatype,
         'data'     => $data);
}

sub sendOffset {
  my ($id, $xpos, $ypos) = @_;

  wsSend('type'     => "upd",
         'id'       => $id,
         'datatype' => "bgoffset",
         'xpos'     => $xpos,
         'ypos'     => $ypos);
}

sub sendMessage {
  my ($text) = @_;

  wsSend('type' => "msg",
         'text' => $text);
}

sub wsSend {
  my (%wsData) = @_;
  my $wsData = \%wsData;

  my $json_text;
  my $json = JSON->new->allow_nonref;

  $json_text = $json->encode($wsData);
  WebSocket::SendToAll($json_text);
}
