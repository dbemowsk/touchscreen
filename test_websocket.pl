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
  },
  "csp" => sub {
    my ( $json ) = @_;
    my $value = $$json->{'value'};
    therm_set_cool_setpoint($value);
    &::print_log("Changed cooling setpoint to $value degrees");
  },
  "therm_mode" => sub {
    my ( $json ) = @_;
    my $value = $$json->{'value'};
    therm_set_mode($value);
    &::print_log("Changed furnace mode to $value");
  },
  "therm_fan" => sub {
    my ( $json ) = @_;
    my $value = $$json->{'value'};
    therm_set_fan($value);
    &::print_log("Changed furnace fan to $value");
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
  WebSocket::SendToAll("RESTART");
}

# here we will handle thermostat changes that need to be sent to all sockets

# Only perform these operations if the thermostat object is initialized
if ($thermostat) {
  # mode changes
  use vars qw($therm_last_mode);
  use vars qw($therm_last_fan);
  use vars qw($therm_last_state);
  
  my $therm_check_mode;
  my $therm_check_fan;
  my $therm_check_state;
  
  if ($Startup or $Reload) {
    $therm_last_mode = "unknown";
    $therm_last_fan = "unknown";
  }
  
  if ($New_Second) {
    $therm_check_mode = therm_get_mode();
    $therm_check_fan = therm_get_fan_mode();
    $therm_check_state = therm_get_state();

    # check if a mode change ocurred
    if ($therm_check_mode ne $therm_last_mode) {
      &::print_log("Notify all WebSockets that the thermostat mode has changed");
      WebSocket::SendToAll("THERM_MODE:" . $therm_check_mode);
    }
    
    # check if a fan mode change ocurred 
    if ($therm_check_fan ne $therm_last_fan) {
      &::print_log("Notify all WebSockets that the thermostats fan mode has changed");
      WebSocket::SendToAll("THERM_FAN:" . $therm_check_fan);
    }
    
    # save the last known mode
    $therm_last_mode = $therm_check_mode;
    $therm_last_fan = $therm_check_fan;
  }
}
