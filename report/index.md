---
layout: default
title: Final Report
---

# Final Report

프로젝트의 문제 정의, nMOS-to-pMOS 변환, 공정 조건 비교와 최종 후보 선정 과정을 정리한 공개 보고서입니다.

## 보고서 내용

- Sentaurus SimpleMOS nMOS 예제 분석
- NWell·BF2 implant 기반 pMOS 공정 변환
- SDevice negative bias 구성
- SVisual current magnitude와 metric extraction
- 13단계 TDR 공정 구조 검증
- Numerical optimization과 Ion/Ioff–SS plot optimization 비교
- 최종 공정 조건과 성능
- 순차적 탐색의 한계와 다음 단계

<div class="primary-links">
  <a href="./pmos_process_optimization_report.pdf">PDF 보고서 열기</a>
  <a href="../study/">연구 상세보기</a>
</div>

## 대표 결과

| Metric | Final Result |
|---|---:|
| Ion | `1.35e-04 A/µm` |
| Ioff | `4.93e-16 A/µm` |
| SS | 85.181 mV/dec |
| Vtgm | -1.1421 V |

![Final method comparison](../figures/overview/final_method_comparison.png)

보고서에 포함된 조건은 평가한 Workbench split 범위에서 선정한 balanced condition입니다.
