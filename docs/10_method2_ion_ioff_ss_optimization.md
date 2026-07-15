# 10. Method 2 – Ion/Ioff–SS Optimization

Method 2 compared the on/off current ratio and SS at the same time.

## Selection Rule

```text
Higher Ion/Ioff is better.
Lower SS is better.
Preferred candidates are in the lower-right region.
```

## LDD Split

Low-dose candidates produced strong Ion/Ioff because the leakage reduction was larger than the Ion loss.

## S/D Split

The S/D split showed a trade-off between series-resistance reduction and junction leakage.

## Spacer Split

Spacer values near `0.30–0.35` provided the better trade-off.

## Final Split

The final condition was selected inside the defined low-SS region while maintaining a high current ratio.

## Selected Device

| Parameter | Value |
|---|---:|
| LDD_Dose | `3e13` |
| LDD_E | 3 keV |
| SD_Dose | `5e16` |
| SD_E | 10 keV |
| RTA | 3 s |
| Spacer_Dep | 0.30 |

**Summary:**  
Method 2 selected the device with the stronger combined Ion/Ioff and SS performance.
