# 09. Method 1 – Numerical Optimization

Method 1 selected candidates by comparing `Ion`, `Ioff`, `SS`, and `Vtgm`.

## Search Sequence

1. LDD dose and energy
2. RTA
3. S/D dose and energy
4. Spacer thickness
5. Three fine-split rounds

## Fine-Split Result

The final comparison focused on S/D dose near `4e16 cm⁻²` and S/D energy near `23 keV`.

| Condition | Ion | Ioff | SS |
|---|---:|---:|---:|
| `4e16 / 23` | `1.474e-04` | `1.547e-15` | 85.660 |
| `4.5e16 / 23` | `1.478e-04` | `1.629e-15` | 85.657 |
| `5.5e16 / 23` | `1.480e-04` | `1.811e-15` | 85.653 |

The higher-dose conditions increased Ion by less than 0.5%, while Ioff increased by 5–17%. The `4e16 / 23` condition was selected.

## Selected Device

| Parameter | Value |
|---|---:|
| LDD_Dose | `7e13` |
| LDD_E | 7 keV |
| SD_Dose | `4e16` |
| SD_E | 23 keV |
| RTA | 5 s |
| Spacer_Dep | 0.25 |

**Summary:**  
Method 1 selected a high-Ion condition while limiting the leakage penalty.
