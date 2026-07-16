# 06. SVisual Metric Extraction

## 이 단계에서 확인할 내용

| Item | Description |
|---|---|
| Purpose | 모든 split에서 같은 기준으로 성능 지표 자동 추출 |
| Method | pMOS current magnitude 처리와 nearest-voltage search |
| Metrics | Vtgm, Id, SS, gm, Ion, Ioff, actual Vg |
| Output | Workbench DOE table과 CSV 비교에 사용할 값 |
| Source | [pmos_metric_extraction.tcl](../source/svisual/pmos_metric_extraction.tcl) |

## 1. Current Magnitude Processing

![Current processing code](../figures/code/svisual_current_processing_code.png)

*Figure. signed pMOS current를 절대값으로 변환하는 SVisual code.*

```tcl
set Vgs [get_variable_data "gate OuterVoltage" -dataset PLT($n)]
set IdsRaw [get_variable_data "drain TotalCurrent" -dataset PLT($n)]

set Ids {}
foreach i $IdsRaw {
    lappend Ids [expr {abs($i)}]
}
```

pMOS current의 부호를 그대로 사용하면 `max`, SS, gm 추출 방향이 nMOS와 다르게 해석될 수 있습니다. 따라서 모든 성능 비교는 `|Id|` 기준으로 통일했습니다.

## 2. Standard Metrics

```tcl
ext::ExtractVtgm -out Vtgm -name Vtgm -v $Vgs -i $Ids
ext::ExtractExtremum -out Id -name Id -x $Vgs -y $Ids -type max
ext::ExtractSS -out SS -name SS -v $Vgs -i $Ids -vo [expr {$Vtgm/3.0}]
ext::ExtractGm -out gm -name gm -v $Vgs -i $Ids
```

이 code로 `Vtgm`, 최대 current, SS, gm을 Workbench result column에 출력했습니다.

## 3. Ion and Ioff at Intended Gate Bias

![Ion/Ioff extraction code](../figures/code/svisual_ion_ioff_extraction_code.png)

*Figure. Vg = 0 V와 목표 on-state Vg에 가장 가까운 sampled point를 찾는 code.*

gate sweep가 목표 voltage를 정확히 포함하지 않을 수 있으므로 각 data point와 목표 voltage의 거리를 비교해 가장 가까운 index를 선택했습니다.

```tcl
set Vg0_actual [lindex $Vgs $best_i0]
set Ioff [lindex $Ids $best_i0]

set VgIon_actual [lindex $Vgs $best_iIon]
set Ion [lindex $Ids $best_iIon]
```

| Metric | Target Gate Voltage |
|---|---:|
| Ioff | 0 V |
| Ion | -2.5 V |

`Vg0_actual`과 `VgIon_actual`을 함께 출력해 실제 추출 bias가 의도한 voltage와 일치하는지 확인했습니다.

## 4. Workbench DOE Output

![Workbench DOE output](../figures/code/workbench_doe_output.png)

*Figure. Ion, Ioff와 실제 gate voltage를 Workbench에 전달하는 DOE output.*

```tcl
puts "DOE: Vg0_actual [format %.4f $Vg0_actual]"
puts "DOE: Ioff [format %.3e $Ioff]"
puts "DOE: VgIon_actual [format %.4f $VgIon_actual]"
puts "DOE: Ion [format %.3e $Ion]"
```

이 결과를 이용해 각 split 후보의 target 만족 여부와 `Ion/Ioff`를 같은 기준으로 비교했습니다.

[Next: Process Flow Visualization](./07_process_flow_visualization.md)

**Summary:**  
SVisual was extended to process pMOS current magnitude, extract standard metrics, and report Ion and Ioff at verified gate-voltage sample points.
