# 05. SDevice Bias Setup

## 이 단계의 목적

| Item | Description |
|---|---|
| Purpose | pMOS의 음전압 동작을 계산하고 정확한 off/on bias point 확보 |
| Drain Bias | -0.05 V, -1.0 V |
| Gate Sweep | 0 V to -2.5 V |
| Check | `Vg0_actual = 0`, `VgIon_actual = -2.5` |

## Bias Direction

기존 nMOS는 양의 gate voltage로 sweep했지만 pMOS는 음의 gate voltage에서 hole inversion channel이 형성됩니다.

```tcl
Goal { Name="drain" Voltage=@Vd@ }
Goal { Name="gate" Voltage=@Vg@ }
```

Workbench parameter:

```text
Vd = -0.05, -1.0 V
Vg = -2.5 V
```

## Sweep Resolution

저전압 영역에서 Ioff를 정확히 확인하기 위해 `InitialStep`, `Increment`, `MaxStep`을 더 촘촘하게 설정했습니다. 최종 결과에서 실제 추출 지점은 다음과 같았습니다.

| Value | Actual Bias |
|---|---:|
| Ioff extraction | `Vg0_actual = 0.0000 V` |
| Ion extraction | `VgIon_actual = -2.5000 V` |

이 확인을 통해 Ioff와 Ion이 목표 bias와 다른 인접 point에서 읽힌 값이 아님을 검증했습니다.

## Operation Verification

![Transfer curve](../figures/actual/project_overview.svg)

- 음의 gate voltage 증가에 따라 `|Id|` 증가
- 높은 drain bias에서 더 큰 current
- enhancement-mode pMOS 동작 확인

[Source command](../source/sdevice/pmos_bias_sweep.cmd)

**Summary:**  
The SDevice setup applies negative pMOS biases and uses a dense sweep to make the extracted Ion and Ioff points verifiable.

---

# 06. SVisual Metric Extraction

## 이 단계의 목적

| Item | Description |
|---|---|
| Problem | pMOS current가 음수 방향으로 저장되고, sweep에 목표 Vg가 정확히 포함되는지 확인 필요 |
| Method | current 절대값 변환, 최근접 Vg 검색, DOE 출력 |
| Output | `Vtgm`, `Id`, `SS`, `gm`, `Ion`, `Ioff`, `Vg0_actual`, `VgIon_actual` |

## 1. Current Sign Processing

```tcl
set Vgs [get_variable_data "gate OuterVoltage" -dataset PLT($n)]
set IdsRaw [get_variable_data "drain TotalCurrent" -dataset PLT($n)]

set Ids {}
foreach i $IdsRaw {
    lappend Ids [expr {abs($i)}]
}
```

pMOS의 current 방향 때문에 음수로 저장되는 값을 성능 크기 비교에 사용할 수 있도록 `|Id|`로 변환했습니다.

## 2. Standard Metrics

```tcl
ext::ExtractVtgm -out Vtgm -name Vtgm -v $Vgs -i $Ids
ext::ExtractExtremum -out Id -name Id -x $Vgs -y $Ids -type max
ext::ExtractSS -out SS -name SS -v $Vgs -i $Ids -vo [expr {$Vtgm/3.0}]
ext::ExtractGm -out gm -name gm -v $Vgs -i $Ids
```

## 3. Nearest-Bias Search

```tcl
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
```

## 4. Ion and Ioff Extraction

```tcl
set Vg0_actual [lindex $Vgs $best_i0]
set Ioff [lindex $Ids $best_i0]
set Imin [lindex $Ids $best_i0]

set VgIon_actual [lindex $Vgs $best_iIon]
set Ion [lindex $Ids $best_iIon]
set Imax [lindex $Ids $best_iIon]
```

## 5. Workbench DOE Output

```tcl
puts "DOE: Vg0_actual [format %.4f $Vg0_actual]"
puts "DOE: Ioff [format %.3e $Ioff]"
puts "DOE: Imin [format %.3e $Imin]"
puts "DOE: VgIon_actual [format %.4f $VgIon_actual]"
puts "DOE: Ion [format %.3e $Ion]"
puts "DOE: Imax [format %.3e $Imax]"
```

전체 command는 [`source/svisual/pmos_metric_extraction.tcl`](../source/svisual/pmos_metric_extraction.tcl)에 정리했습니다.

**Summary:**  
The SVisual script converts pMOS current to magnitude, extracts standard metrics, finds the nearest target bias points, and reports both current and actual extraction voltage.
