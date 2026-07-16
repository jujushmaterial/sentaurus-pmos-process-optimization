# P-type MOSFET Process Optimization using Sentaurus TCAD

## Project Overview

기존 Sentaurus `SimpleMOS` nMOS 공정을 pMOS 공정으로 변환하고, 주요 공정 parameter를 단계적으로 조정해 on-state와 off-state 특성의 균형을 찾은 프로젝트입니다.

단순히 전압 부호만 바꾼 것이 아니라 다음 작업을 수행했습니다.

- **SProcess:** NWell, BF2 LDD, BF2 Source/Drain, RTA, Spacer parameterization
- **SDevice:** pMOS용 음전압 gate/drain sweep
- **SVisual:** drain current 절대값 처리와 `Ion`, `Ioff`, `SS`, `Vtgm`, `gm` 자동 추출
- **Workbench:** LDD, Source/Drain, RTA, Spacer split 비교
- **Optimization:** 수치 비교와 `Ion/Ioff–SS` 그래프 기반 후보 선택

**Summary:**  
This project converts and optimizes a planar pMOSFET by modifying the Sentaurus SProcess–SDevice–SVisual workflow and comparing two process-optimization methods.

---

## Project Information

| Item | Description |
|---|---|
| Course | Semiconductor Integrated Process |
| Period | 2026.03–2026.06 |
| Tool | Synopsys Sentaurus TCAD T-2022.03 |
| Modules | Sentaurus Workbench, SProcess, SDevice, SVisual |
| Device | Planar enhancement-mode pMOSFET |
| Status | Completed |

---

## Objective and Target

목표는 pMOS를 정상 동작시키는 것에서 끝나지 않고, 공정 조건을 조정해 충분한 Ion을 유지하면서 Ioff와 SS를 낮추는 것이었습니다.

| Metric | Target |
|---|---:|
| Ion at Vg = -2.5 V | `> 1e-5 A/µm` |
| Ioff at Vg = 0 V | `< 1e-14 A/µm` |
| SS | `< 100 mV/dec` |
| Vtgm | Negative pMOS threshold |

---

## Final Result

| Parameter | Final Value |
|---|---:|
| Lg | 0.25 |
| GOxTime | 10 |
| NWell | `1e17 cm^-3` |
| LDD_Dose / LDD_E | `3e13 cm^-2` / 3 keV |
| SD_Dose / SD_E | `5e16 cm^-2` / 10 keV |
| RTA | 3 s |
| Spacer_Dep | 0.30 |
| Vg / Vd | -2.5 V / -1.0 V |

| Metric | Result | Target | Check |
|---|---:|---:|---|
| Ion | `1.35e-04 A/µm` | `> 1e-5` | Pass |
| Ioff | `4.93e-16 A/µm` | `< 1e-14` | Pass |
| SS | 85.181 mV/dec | `< 100` | Pass |
| Vtgm | -1.1421 V | Negative | Pass |
| gm | `9.91e-05` | Reference | - |

![Final method comparison](./figures/overview/final_method_comparison.png)

*Figure. 두 최적화 방법의 최종 후보 비교. 그래프 기반 조건은 Ion과 gm이 조금 낮지만 Ioff와 SS가 개선되었습니다.*

수치 비교 방식에서 선택한 소자보다 Ion은 약 9.2% 낮았지만, Ioff는 약 68.1% 감소했고 SS도 약 0.56% 개선되었습니다. 목표 Ion을 충분히 만족했기 때문에 누설전류와 gate 제어성을 함께 고려한 그래프 기반 조건을 최종 소자로 선정했습니다.

---

## Process and Electrical Verification

### 1. Thirteen Process Checkpoints

![pMOS process flow](./figures/overview/pmos_process_flow_13_steps.png)

*Figure. NWell 초기화부터 final device까지 저장한 13개 TDR checkpoint.*

NWell 형성부터 gate oxide, poly gate, LDD, spacer, p+ Source/Drain, RTA, Al 전극, reflect, contact 완성까지 구조를 순서대로 확인했습니다.

[공정 단계와 TDR command 자세히 보기](./guide/07_process_flow_visualization.md)

### 2. Final pMOS Structure

![Final pMOS structure](./figures/overview/pmos_final_structure.png)

*Figure. reflect와 contact 정의가 끝난 최종 pMOS 단면 구조.*

### 3. pMOS Transfer Curve

![pMOS transfer curve](./figures/overview/pmos_transfer_curve.png)

*Figure. Vd = -0.05 V와 -1.0 V에서 확인한 pMOS transfer curve.*

- Vg가 0 V에 가까울 때 current가 매우 작음
- Vg가 음의 방향으로 증가할수록 `|Id|` 증가
- Vd = -1.0 V에서 Vd = -0.05 V보다 큰 current 확인

이를 통해 enhancement-mode pMOS의 정상 동작을 확인했습니다.

[바이어스 구성과 검증 과정 보기](./guide/05_sdevice_bias_setup.md)

---

## Code Modification Summary

| Module | Main Modification | Detailed Page |
|---|---|---|
| SProcess | NWell, BF2 LDD/S-D, RTA, spacer parameterization | [Open](./guide/04_sprocess_implementation.md) |
| SDevice | Negative drain/gate bias and dense sweep setup | [Open](./guide/05_sdevice_bias_setup.md) |
| SVisual | Absolute current, Ion/Ioff, actual Vg extraction | [Open](./guide/06_svisual_metric_extraction.md) |
| TDR | Thirteen process checkpoints | [Open](./guide/07_process_flow_visualization.md) |

[전체 source code 목록](./source/README.md)

---

## Optimization Flow

### Method 1: Numerical Comparison

```text
Baseline → LDD → RTA → Source/Drain → Spacer → Fine Split ×3
```

각 단계에서 `Ion`, `Ioff`, `SS`, `Vtgm`과 변화율을 직접 비교했습니다. 높은 Ion을 확보한 후보를 찾는 데 유리했지만, 여러 지표의 trade-off를 한눈에 판단하기 어려웠습니다.

[Method 1 자세히 보기](./guide/08_method1_numerical_optimization.md)

### Method 2: Ion/Ioff–SS Plot

```text
Baseline → LDD → Source/Drain → RTA → Spacer → Fine Split
```

- x-axis: `Ion/Ioff`, larger is better
- y-axis: `SS`, smaller is better
- preferred region: lower-right

![Plot-based final candidate](./figures/method2/method2_final_candidate.png)

*Figure. 전체 후보의 `Ion/Ioff–SS` 분포와 최종 후보 위치.*

[Method 2 자세히 보기](./guide/09_method2_plot_optimization.md)

---

## Detailed Documents

| No. | Document | What You Can Check |
|---:|---|---|
| 00 | [Navigation](./guide/00_navigation.md) | 전체 문서와 source 위치 |
| 01 | [Project Overview](./guide/01_project_overview.md) | 문제 정의와 전체 흐름 |
| 02 | [Preliminary Coursework](./guide/02_preliminary_coursework.md) | 최종 과제 전 TCAD 실습 |
| 03 | [nMOS-to-pMOS Conversion](./guide/03_nmos_to_pmos_conversion.md) | 구조, dopant, bias 변경 이유 |
| 04 | [SProcess Implementation](./guide/04_sprocess_implementation.md) | 실제 공정 command와 구조 변화 |
| 05 | [SDevice Bias Setup](./guide/05_sdevice_bias_setup.md) | pMOS sweep와 정상 동작 검증 |
| 06 | [SVisual Metric Extraction](./guide/06_svisual_metric_extraction.md) | 자동 추출 Tcl code |
| 07 | [Process Flow Visualization](./guide/07_process_flow_visualization.md) | TDR 13단계 |
| 08 | [Method 1](./guide/08_method1_numerical_optimization.md) | 수치 비교 최적화 |
| 09 | [Method 2](./guide/09_method2_plot_optimization.md) | 그래프 기반 최적화 |
| 10 | [Method Comparison and Final Device](./guide/10_method_comparison_and_final.md) | 두 방법 비교와 최종 조건 |
| 11 | [Limitations](./guide/11_limitations_and_next_steps.md) | 순차적 탐색 한계와 개선 방향 |

---

## Report and Repository

- [Public Report](./report/pmos_process_optimization_report.pdf)
- [GitHub Repository](https://github.com/jujushmaterial/sentaurus-pmos-process-optimization)
- [Main Portfolio](https://jujushmaterial.github.io/)
