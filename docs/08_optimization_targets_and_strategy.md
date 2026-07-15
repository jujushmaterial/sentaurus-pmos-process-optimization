# 08. Optimization Targets and Strategy

## Targets

| Metric | Target |
|---|---:|
| Ion | `> 1e-5 A/µm` |
| Ioff | `< 1e-14 A/µm` |
| SS | `< 100 mV/dec` |
| Vtgm | Negative |

## Variables

- `LDD_Dose`
- `LDD_E`
- `SD_Dose`
- `SD_E`
- `RTA`
- `Spacer_Dep`

## Search Order

```text
LDD
→ RTA
→ Source/Drain
→ Spacer
→ Fine split
```

This sequence reduced the number of cases and made the role of each process variable easier to interpret.

## Two Selection Methods

### Method 1

Compare the extracted values and percentage changes directly.

### Method 2

Plot each case using:

```text
x = Ion/Ioff
y = SS
```

The preferred region is the lower-right area.

![Optimization workflow](../figures/optimization_workflow.svg)

**Summary:**  
The strategy combines interpretable sequential splits with a multi-objective plot-based comparison.
