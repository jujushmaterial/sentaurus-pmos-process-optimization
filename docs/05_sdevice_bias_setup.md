# 05. SDevice Bias Setup

## pMOS Bias

| Terminal | Bias |
|---|---|
| Gate | 0 to -2.5 V |
| Drain | -0.05 V and -1.0 V |

## Sweep Resolution

The low-voltage region was sampled with smaller steps to improve off-current extraction near `Vg = 0 V`.

## Verification Points

- `Vg0_actual`: actual gate voltage used for Ioff
- `VgIon_actual`: actual gate voltage used for Ion

The final DOE results showed:

```text
Vg0_actual = 0.0000 V
VgIon_actual = -2.5000 V
```

This confirmed that Ioff and Ion were extracted at the intended gate voltages.

**Summary:**  
The SDevice setup applied the correct negative-bias pMOS sweep and improved endpoint accuracy.
