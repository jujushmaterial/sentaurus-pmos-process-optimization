# Report-derived SVisual extraction script for pMOS transfer curves.

set Vgs [get_variable_data "gate OuterVoltage" -dataset PLT($n)]
set IdsRaw [get_variable_data "drain TotalCurrent" -dataset PLT($n)]

# For pMOS, compare current magnitude.
set Ids {}
foreach i $IdsRaw {
    lappend Ids [expr {abs($i)}]
}

# Standard metrics
ext::ExtractVtgm -out Vtgm -name Vtgm -v $Vgs -i $Ids
ext::ExtractExtremum -out Id -name Id -x $Vgs -y $Ids -type max
ext::ExtractSS -out SS -name SS -v $Vgs -i $Ids -vo [expr {$Vtgm/3.0}]
ext::ExtractGm -out gm -name gm -v $Vgs -i $Ids

# Find the sampled point nearest Vg=0 V and Vg=@Vg@.
set npts [llength $Vgs]
set best_i0 0
set best_d0 1e30
set best_iIon 0
set best_dIon 1e30

for {set i 0} {$i < $npts} {incr i} {
    set vg [lindex $Vgs $i]

    set d0 [expr {abs($vg - 0.0)}]
    if {$d0 < $best_d0} {
        set best_d0 $d0
        set best_i0 $i
    }

    set dIon [expr {abs($vg - @Vg@)}]
    if {$dIon < $best_dIon} {
        set best_dIon $dIon
        set best_iIon $i
    }
}

# Off-state point
set Vg0_actual [lindex $Vgs $best_i0]
set Ioff [lindex $Ids $best_i0]
set Imin [lindex $Ids $best_i0]

# On-state point
set VgIon_actual [lindex $Vgs $best_iIon]
set Ion [lindex $Ids $best_iIon]
set Imax [lindex $Ids $best_iIon]

# Workbench DOE output
puts "DOE: Vg0_actual [format %.4f $Vg0_actual]"
puts "DOE: Ioff [format %.3e $Ioff]"
puts "DOE: Imin [format %.3e $Imin]"
puts "DOE: VgIon_actual [format %.4f $VgIon_actual]"
puts "DOE: Ion [format %.3e $Ion]"
puts "DOE: Imax [format %.3e $Imax]"
