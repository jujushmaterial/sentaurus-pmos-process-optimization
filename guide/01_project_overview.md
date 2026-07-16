# 01. Project Overview

## 이 문서에서 확인할 내용

| Item | Description |
|---|---|
| Purpose | SimpleMOS nMOS를 pMOS로 변환하고 공정 parameter를 최적화 |
| Method | SProcess-SDevice-SVisual 수정, DOE split, 두 최적화 방법 비교 |
| Output | 정상 동작 pMOS, 자동 metric 추출, 최종 공정 조건 |

## Problem Definition

초기 SimpleMOS 예제는 nMOS 기준으로 작성되어 있어 pMOS에 그대로 사용할 수 없었습니다. pMOS 구현에는 body와 Source/Drain의 도핑 극성, gate/drain bias 방향, current 부호 해석을 모두 변경해야 했습니다.

또한 공정 조건은 서로 trade-off를 가집니다.

- LDD와 Source/Drain 도핑 증가: series resistance 감소와 Ion 증가 가능
- 높은 dose/energy와 긴 RTA: junction diffusion과 leakage 증가 가능
- 얇은 spacer: Ion에 유리하지만 drain field와 Ioff에 불리할 수 있음
- 두꺼운 spacer: leakage에 유리하지만 series resistance가 증가할 수 있음

따라서 한 지표만 최대화하지 않고 `Ion`, `Ioff`, `SS`, `Vtgm`을 함께 비교했습니다.

## Workflow

```text
Preliminary Sentaurus practice
-> nMOS-to-pMOS conversion
-> pMOS bias and current extraction
-> thirteen TDR checkpoints
-> baseline verification
-> process parameter splits
-> numerical optimization
-> Ion/Ioff-SS optimization
-> method comparison
-> final device selection
```

## Final Outcome

- pMOS 정상 transfer curve 확인
- 모든 target 만족
- 그래프 기반 최종 조건 선택
- 수치 비교 방식의 장점과 한계 확인
- 순차적 split이 global optimum을 보장하지 않는다는 한계 고찰

**Summary:**  
The project covers the complete conversion, simulation, extraction, and multi-objective optimization workflow for a planar pMOSFET.

---

# 02. Preliminary Coursework

## 이 단계의 목적

| Item | Description |
|---|---|
| Purpose | 최종 pMOS 과제 전 Sentaurus 구조 확인과 DOE 비교 방법 학습 |
| Tools | SVisual, SProcess TDR, Workbench split |
| Scope | Lg, GOxTime, LDD_Dose, SD_Dose 기초 비교 |

![Preliminary TDR and structure comparison](../figures/actual/project_overview.jpg)

## Practice 1: Structure and Transfer Curve

- 선택한 node의 `Net Active` 분포 확인
- 두 node의 drain current curve 비교
- 구조와 전기적 특성을 같은 Workbench project에서 연결해 해석

## Practice 2: TDR Checkpoints

공정 단계마다 다음 형식의 TDR 저장 command를 추가했습니다.

```tcl
struct tdr=My_Project_n@node@_10_Al_depo !Gas !interfaces
```

이 실습을 통해 gate oxide, poly, LDD, spacer, Source/Drain, anneal, metal, reflect 단계의 구조 변화를 확인했습니다.

## Practice 3: Parameter Trends

### Gate Length

- Lg 증가: Id와 gm 감소
- 긴 channel: 일부 조건에서 SS와 threshold 안정성 개선
- 최종 과제에서는 구동 성능을 고려해 Lg = 0.25를 사용

### Gate Oxidation Time

- GOxTime 증가: Tox 증가
- gate control 감소로 Id와 gm 감소
- Vtgm과 SS 증가 경향
- 최종 과제에서는 GOxTime = 10을 사용

### LDD Dose

- LDD dose 증가: extension resistance 감소로 Id 증가 가능
- 과도한 dose: drain field와 leakage 증가 가능

선행 실습 내용은 최종 pMOS 최적화의 parameter 범위와 결과 해석에 사용했습니다.

**Summary:**  
The preliminary coursework established the Sentaurus workflow and the physical interpretation of gate length, oxide thickness, and junction parameters.
