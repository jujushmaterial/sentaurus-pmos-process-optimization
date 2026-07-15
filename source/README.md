# Source Code

최종 보고서에 포함된 Sentaurus command를 기능별로 분리했습니다.

| Folder | File | Description |
|---|---|---|
| `coursework/` | `tdr_checkpoint_example.cmd` | 선행 실습 TDR 저장 예시 |
| `sprocess/` | `pmos_process_modifications.cmd` | pMOS 변환과 parameterization |
| `sprocess/` | `tdr_checkpoints.cmd` | 13개 공정 checkpoint |
| `sdevice/` | `pmos_bias_sweep.cmd` | pMOS bias goal과 sweep 방향 |
| `svisual/` | `pmos_metric_extraction.tcl` | current 처리와 metric 자동 추출 |

이 파일들은 보고서에 제시된 변경·추출 command를 정리한 코드입니다. 전체 mesh, physics, electrode, solve block을 포함한 원본 project command가 확보되면 추가할 수 있습니다.
