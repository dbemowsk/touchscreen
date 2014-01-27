# Category = HVAC

=begin comment

File: thermostat_bridge_RCSsTR40.pl

The purpose of this file is to act as a bridge between the new touchscreen interface and the
MisterHouse thermostat modules.  This will allow the touchscreen interface to only have to be 
coded for one set of function calls to perform the different operations.  This file can be 
modified to bridge these functions to any of the thermostat modules available.  

For consistency, the file should be named "thermostat_bridge_{module base name}.pl".  The 
{module base name} is the base filename of the module that it extends.  For example, if you 
use an RCS-TR40 thermostat with the "RCSsTR40.pm" perl module, your filename would then be
"thermostat_bridge_RCSsTR40.pl".  This file should then be saved in your private code folder.

=cut

# This routine is used to set the heating set point of the thermostat.
sub therm_set_heat_setpoint {
  my ($hsp) = @_;
  $thermostat->heat_setpoint($hsp);
}

# This routine is used to set the heating set point of the thermostat.
sub therm_get_heat_setpoint {
  return $thermostat->get_heat_sp();
}

# This routine is used to set the cooling set point of the thermostat.
sub therm_set_cool_setpoint {
  my ($csp) = @_;
  $thermostat->cool_setpoint($csp);
}
# This routine is used to set the cooling set point of the thermostat.
sub therm_get_cool_setpoint {
  return $thermostat->get_cool_sp();
}

# This routine is to change the mode of the thermostat to one of 'off', 'heat', 'cool', or 'auto'
sub therm_set_mode {
  my ($state) = @_;
  $thermostat->mode($state);
}

# This routine is to get the thermostats current mode setting
sub therm_get_mode {
  return $thermostat->get_mode();
}

# This routine is to set the thermostats fan mode to 'on', or 'off'
sub therm_set_fan {
  my ($state) = @_;
  $thermostat->fan($state);
}

# This routine is to get the thermostats current fan mode setting
sub therm_get_fan_mode {
  return $thermostat->get_fan_mode();
}

# This routine gets the current state of the HVAC system
sub therm_get_state {
  return $thermostat->get_system_state();
}

# This routine is to set the thermostats setback mode to 'on', or 'off'
sub therm_setback_mode {
  my ($state) = @_;
  # The RCS TR40 thermostat does not support setback mode.  
}

# This routine is to get the thermostats setback temp when the furnace is in heating mode
sub therm_get_setback_heat {
  my ($state) = @_;
  # The RCS TR40 thermostat does not support setback mode.   
}

# This routine is to set the thermostats setback temp to use when the furnace is in heating mode
sub therm_set_setback_heat {
  my ($state) = @_;
  # The RCS TR40 thermostat does not support setback mode.   
}

# This routine is to get the thermostats setback temp when the furnace is in cooling mode
sub therm_get_setback_cool {
  my ($state) = @_;
  # The RCS TR40 thermostat does not support setback mode.   
}

# This routine is to set the thermostats setback temp to use when the furnace is in cooling mode
sub therm_set_setback_cool {
  my ($state) = @_;
  # The RCS TR40 thermostat does not support setback mode.   
}

# This routine is to set the thermostats setback temp to use when the furnace is in cooling mode
sub therm_get_system_state {
  return $thermostat->get_system_state();   
}
