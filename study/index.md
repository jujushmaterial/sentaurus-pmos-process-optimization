---
layout: default
title: 연구 상세보기
---

# 연구 상세보기

이 문서는 기존 Sentaurus SimpleMOS nMOS 예제를 pMOS 공정으로 변환하고, 공정 구조·전기적 동작·자동 metric extraction을 검증한 뒤 두 최적화 방식을 비교한 전체 과정을 정리합니다.

> **연구 범위**  
> 최종 조건은 평가한 Workbench split 범위에서 선택한 balanced condition입니다. 모든 공정 변수의 조합을 탐색한 global optimum으로 해석하지 않습니다.

---

## 1. 프로젝트 목적과 평가 기준

기존 SimpleMOS 예제는 nMOS 공정을 기준으로 구성되어 있습니다. pMOS를 구현하려면 body와 Source/Drain의 도핑 극성, implant species, gate·drain bias 방향, 전류 처리 방식을 함께 변경해야 합니다.

프로젝트의 질문은 다음과 같습니다.

1. nMOS 예제를 pMOS 공정으로 어떻게 변환할 것인가?
2. pMOS가 음의 gate voltage에서 정상 동작하는가?
3. LDD, Source/Drain, RTA, Spacer가 Ion, Ioff, SS에 어떤 영향을 주는가?
4. 여러 지표의 trade-off를 어떤 기준으로 비교할 것인가?
5. 제한된 split 범위에서 어떤 조건이 가장 균형적인가?

| Metric | Target |
|---|---:|
| Ion at Vg = -2.5 V | `> 1e-5 A/µm` |
| Ioff at Vg = 0 V | `< 1e-14 A/µm` |
| SS | `< 100 mV/dec` |
| Vtgm | Negative pMOS threshold |

---

## 2. 선행 TCAD 실습

최종 pMOS 과제 전에 nMOS SimpleMOS 예제를 이용해 Sentaurus Workbench, SProcess, SDevice, SVisual의 기본 흐름을 익혔습니다.

![Preliminary TCAD structure](../figures/preliminary/preliminary_tcad_structure.png)

![Preliminary TDR flow](../figures/preliminary/preliminary_tdr_flow.png)

![Preliminary parameter sweep](../figures/preliminary/preliminary_parameter_sweep.png)

선행 단계에서는 다음 작업을 연습했습니다.

- Workbench parameter split 구성
- 공정 단계별 TDR 저장
- Id–Vg curve 비교
- Vtgm, Id, SS, gm 결과 해석
- 공정 parameter와 전기적 특성 연결

[선행 실습 자세히 보기](../guide/02_preliminary_coursework.html)

---

## 3. nMOS-to-pMOS 변환

pMOS 변환은 전압 부호만 바꾸는 작업이 아닙니다. channel이 형성되는 body 극성, Source/Drain dopant, extension 영역, bias 방향과 current 처리 방식을 함께 변경했습니다.

| nMOS Configuration | pMOS Configuration | Reason |
|---|---|---|
| PWell / Boron | NWell / Phosphorus | p-channel 형성을 위한 n-type body |
| Arsenic LDD | BF2 LDD | p-type extension 형성 |
| Phosphorus S/D | BF2 p+ S/D | pMOS Source/Drain 형성 |
| Positive Vg, Vd | Negative Vg, Vd | hole channel 형성 및 pMOS 동작 |
| Signed drain current | `abs(Id)` | magnitude 기준 비교와 metric 추출 |

![Final pMOS structure](../figures/overview/pmos_final_structure.png)

![pMOS transfer curve](../figures/overview/pmos_transfer_curve.png)

음의 gate voltage가 증가할수록 `|Id|`가 증가하고 Vtgm이 음수로 추출되어 enhancement-mode pMOS의 정상 동작 방향을 확인했습니다.

[nMOS-to-pMOS 변환 자세히 보기](../guide/03_nmos_to_pmos_conversion.html)

---

## 4. SProcess 구현

NWell, BF2 LDD와 p+ Source/Drain, RTA, Spacer를 Workbench parameter로 연결했습니다.

```tcl
init concentration=@NWell@ field=Phosphorus
implant BF2 dose=@LDD_Dose@ energy=@LDD_E@
implant BF2 dose=@SD_Dose@ energy=@SD_E@
diffuse time=@RTA@<s> temperature=1000
deposit Nitride type=isotropic thickness=@Spacer_Dep@*@Lg@
etch Nitride type=anisotropic thickness=(@Spacer_Dep@+0.05)*@Lg@
```

![NWell and implant code](../figures/code/sprocess_nwell_ldd_sd_code.png)

![RTA and spacer code](../figures/code/sprocess_rta_spacer_code.png)

구조 변화는 최종 전기적 결과만으로 판단하지 않고 단계별 TDR checkpoint로 함께 확인했습니다.

[SProcess 구현 자세히 보기](../guide/04_sprocess_implementation.html)

---

## 5. SDevice bias와 pMOS 동작 검증

Workbench에서 다음 bias를 사용했습니다.

```text
Vd = -0.05 V, -1.0 V
Vg = -2.5 V
```

```tcl
Goal { Name="drain" Voltage=@Vd@ }
Goal { Name="gate" Voltage=@Vg@ }
```

![SDevice bias code](../figures/code/sdevice_bias_code.png)

![pMOS transfer curve](../figures/overview/pmos_transfer_curve.png)

검증 결과는 다음과 같습니다.

- Vg = 0 V 부근에서 낮은 off-state current
- Vg가 음의 방향으로 증가할수록 `|Id|` 증가
- Vd = -1.0 V에서 -0.05 V보다 높은 current
- 음의 Vtgm 확인

[SDevice bias 구성 자세히 보기](../guide/05_sdevice_bias_setup.html)

---

## 6. SVisual metric extraction

pMOS drain current의 부호를 그대로 사용하면 max, SS, gm 추출 방향이 nMOS와 다르게 해석될 수 있으므로 모든 비교는 `|Id|` 기준으로 통일했습니다.

```tcl
set Ids {}
foreach i $IdsRaw {
    lappend Ids [expr {abs($i)}]
}
```

![Current processing code](../figures/code/svisual_current_processing_code.png)

표준 metric과 Ion·Ioff를 자동 추출했습니다.

```tcl
ext::ExtractVtgm -out Vtgm -name Vtgm -v $Vgs -i $Ids
ext::ExtractSS -out SS -name SS -v $Vgs -i $Ids -vo [expr {$Vtgm/3.0}]
ext::ExtractGm -out gm -name gm -v $Vgs -i $Ids
```

![Ion and Ioff extraction code](../figures/code/svisual_ion_ioff_extraction_code.png)

![Workbench DOE output](../figures/code/workbench_doe_output.png)

실제 sampled voltage와 목표 gate voltage의 차이를 확인하기 위해 `Vg0_actual`과 `VgIon_actual`도 함께 출력했습니다.

[SVisual extraction 자세히 보기](../guide/06_svisual_metric_extraction.html)

---

## 7. 13단계 공정 구조 검증

![pMOS process flow](../figures/overview/pmos_process_flow_13_steps.png)

| Step | Structure Check |
|---:|---|
| 1 | NWell initialization |
| 2 | gate oxide |
| 3 | poly deposition |
| 4 | gate patterning |
| 5 | p-type LDD |
| 6 | nitride deposition |
| 7 | sidewall spacer |
| 8 | p+ Source/Drain |
| 9 | activation and diffusion |
| 10 | Al deposition |
| 11 | Al patterning |
| 12 | symmetric reflect structure |
| 13 | contact-defined final device |

이 과정은 gate oxide·poly pattern, LDD·Source/Drain 위치, spacer 잔류, junction diffusion과 최종 contact 완성을 전기적 해석 전에 검증하기 위한 절차였습니다.

[공정 구조 검증 자세히 보기](../guide/07_process_flow_visualization.html)

---

## 8. Method 1 — 수치 비교 기반 최적화

```text
Baseline → LDD → RTA → Source/Drain → Spacer → Fine Split ×3
```

각 단계에서 Ion, Ioff, SS, Vtgm과 변화율을 직접 비교했습니다.

![Method 1 LDD split](../figures/method1/method1_ldd_split.png)

![Method 1 RTA split](../figures/method1/method1_rta_split.png)

![Method 1 Source/Drain split](../figures/method1/method1_sd_split.png)

![Method 1 spacer split](../figures/method1/method1_spacer_split.png)

세 차례 fine split을 거쳐 다음 후보를 선정했습니다.

| Parameter | Value |
|---|---:|
| LDD_Dose / LDD_E | `7e13` / 7 keV |
| SD_Dose / SD_E | `4e16` / 23 keV |
| RTA | 5 s |
| Spacer_Dep | 0.25 |
| Ion | `1.474e-04 A/µm` |
| Ioff | `1.547e-15 A/µm` |
| SS | 85.660 mV/dec |

![Method 1 final result](../figures/method1/method1_final_result.png)

이 방식은 높은 Ion 후보를 찾는 데 유리했지만, 여러 metric이 반대 방향으로 변할 때 전체 trade-off를 한눈에 판단하기 어려웠습니다.

[Method 1 자세히 보기](../guide/08_method1_numerical_optimization.html)

---

## 9. Method 2 — Ion/Ioff–SS plot 기반 최적화

수치 비교에서 초기 제외했던 조건도 다시 포함해 후보 분포를 확인했습니다.

- x-axis: `Ion/Ioff`, larger is better
- y-axis: `SS`, smaller is better
- preferred region: lower-right

![Method 2 LDD plot](../figures/method2/method2_ldd_plot.png)

![Method 2 Source/Drain plot](../figures/method2/method2_sd_plot.png)

![Method 2 RTA plot](../figures/method2/method2_rta_plot.png)

![Method 2 spacer plot](../figures/method2/method2_spacer_plot.png)

![Method 2 fine split](../figures/method2/method2_fine_split_plot.png)

최종 선택에서는 Ion/Ioff 최대값만 고르지 않고 충분히 높은 전류비와 `SS ≤ 85.2 mV/dec`를 함께 만족하는 후보를 선택했습니다.

![Method 2 final candidate](../figures/method2/method2_final_candidate.png)

| Parameter | Value |
|---|---:|
| LDD_Dose / LDD_E | `3e13` / 3 keV |
| SD_Dose / SD_E | `5e16` / 10 keV |
| RTA | 3 s |
| Spacer_Dep | 0.30 |
| Ion | `1.35e-04 A/µm` |
| Ioff | `4.93e-16 A/µm` |
| SS | 85.181 mV/dec |

[Method 2 자세히 보기](../guide/09_method2_plot_optimization.html)

---

## 10. 최종 후보 비교와 선정

![Final method comparison](../figures/overview/final_method_comparison.png)

| Metric | Numerical Method | Plot-Based Method | Interpretation |
|---|---:|---:|---|
| Ion | `1.474e-04` | `1.35e-04` | plot method 약 9.2% 낮음 |
| Ioff | `1.547e-15` | `4.93e-16` | plot method 약 68.1% 낮음 |
| SS | 85.660 | 85.181 | plot method 약 0.56% 낮음 |
| gm | `1.044e-04` | `9.91e-05` | plot method 약 5.3% 낮음 |

두 조건 모두 target을 만족했습니다. Plot-based 조건은 Ion과 gm이 조금 낮았지만 목표 Ion을 충분히 초과했고, Ioff 감소 폭이 크며 SS도 개선되었습니다.

따라서 switching과 leakage의 균형을 기준으로 plot-based 조건을 최종 소자로 선정했습니다.

[최종 비교 자세히 보기](../guide/10_method_comparison_and_final.html)

---

## 11. 한계와 다음 단계

- 순차적 후보 제거 방식으로 인해 변수 간 상호작용을 완전히 탐색하지 못함
- `Ion/Ioff–SS` 그래프의 축 범위, point 중첩과 threshold에 판단이 영향을 받을 수 있음
- 현재 source는 보고서에 제시된 수정·추출 command이며 전체 mesh·physics·electrode·solve block은 포함하지 않음
- 후속 단계에서 full-factorial DOE, response surface, Pareto front와 자동 결과 수집 필요

이 프로젝트에서 확인한 핵심은 최종 수치뿐 아니라 **어떤 기준으로 후보를 제거하고 선택했는가가 결과에 영향을 준다**는 점입니다.

[한계와 다음 단계 자세히 보기](../guide/11_limitations_and_next_steps.html)

---

## 관련 자료

- [TCAD 코드 확인](../source/)
- [연구 진행 Data](../results/)
- [연구 재현](../appendix/reproducibility.html)
- [최종 보고서](../report/)
- [참고자료](../references/)
