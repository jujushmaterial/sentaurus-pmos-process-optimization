# Thirteen TDR checkpoints used to verify the pMOS process flow.
# Place each command immediately after the corresponding process step.

struct tdr=PMOS_n@node@_01_wafer_init !Gas !interfaces
struct tdr=PMOS_n@node@_02_gate_oxide !Gas !interfaces
struct tdr=PMOS_n@node@_03_poly_deposit !Gas !interfaces
struct tdr=PMOS_n@node@_04_gate_pattern !Gas !interfaces
struct tdr=PMOS_n@node@_05_LDD_implant !Gas !interfaces
struct tdr=PMOS_n@node@_06_spacer_deposit !Gas !interfaces
struct tdr=PMOS_n@node@_07_spacer_etch !Gas !interfaces
struct tdr=PMOS_n@node@_08_SD_implant !Gas !interfaces
struct tdr=PMOS_n@node@_09_anneal !Gas !interfaces
struct tdr=PMOS_n@node@_10_Al_deposit !Gas !interfaces
struct tdr=PMOS_n@node@_11_Al_etch !Gas !interfaces
struct tdr=PMOS_n@node@_12_reflect !Gas !interfaces
struct tdr=PMOS_n@node@_13_final_device !Gas !interfaces
