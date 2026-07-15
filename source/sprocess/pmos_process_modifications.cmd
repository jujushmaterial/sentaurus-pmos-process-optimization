# Report-derived SProcess modifications for nMOS-to-pMOS conversion.
# These commands are excerpts to be inserted into the corresponding
# SimpleMOS process blocks.

# 1. N-type body / NWell initialization
# Original: init concentration=@PWell@ field=Boron
init concentration=@NWell@ field=Phosphorus

# 2. p-type LDD extension
# Original: implant Arsenic dose=@LDD_Dose@ energy=30
implant BF2 dose=@LDD_Dose@ energy=@LDD_E@

# 3. p+ Source/Drain
# Original: implant Phosphorus dose=1e+15 energy=15
implant BF2 dose=@SD_Dose@ energy=@SD_E@

# 4. Parameterized rapid thermal anneal
# Original: diffuse time=1<s> temperature=1000
diffuse time=@RTA@<s> temperature=1000

# 5. Parameterized spacer formation
# Original:
# deposit Nitride type=isotropic thickness=0.3*@Lg@
# etch Nitride type=anisotropic thickness=0.35*@Lg@
deposit Nitride type=isotropic thickness=@Spacer_Dep@*@Lg@
etch Nitride type=anisotropic thickness=(@Spacer_Dep@+0.05)*@Lg@
