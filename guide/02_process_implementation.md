# 03. nMOS-to-pMOS Conversion

## 이 단계의 목적

| Item | Description |
|---|---|
| Problem | nMOS용 well, implant, bias, current interpretation을 pMOS에 맞게 변경 |
| Method | SProcess, SDevice, SVisual을 함께 수정 |
| Check | 음의 Vg에서 current가 증가하는 enhancement-mode pMOS 확인 |

## Conversion Table

| Item | SimpleMOS nMOS | Converted pMOS | Reason |
|---|---|---|---|
| Body | P-type | N-type | p+ S/D가 NWell 위에 형성되어야 함 |
| Well dopant | Boron | Phosphorus | n-type body 형성 |
| LDD | Arsenic | BF2 | p-type extension 형성 |
| S/D | Phosphorus | BF2 | p+ Source/Drain 형성 |
| Gate bias | Positive | 0 to -2.5 V | negative gate bias로 hole channel 형성 |
| Drain bias | Positive | -0.05, -1.0 V | pMOS 극성 반영 |
| Current | Raw sign | Absolute magnitude | 성능값 비교를 위한 `|Id|` 사용 |

## Main Command Changes

```tcl
# Well
init concentration=@NWell@ field=Phosphorus

# LDD
implant BF2 dose=@LDD_Dose@ energy=@LDD_E@

# Source/Drain
implant BF2 dose=@SD_Dose@ energy=@SD_E@

# Bias
Goal { Name="drain" Voltage=@Vd@ }
Goal { Name="gate" Voltage=@Vg@ }
```

## Verification

![pMOS transfer curve](../figures/actual/project_overview.jpg)

- Vg = 0 V 부근에서 off current 확인
- Vg가 -2.5 V 방향으로 이동할수록 `|Id|` 증가
- Vd = -1.0 V가 -0.05 V보다 높은 on current를 형성

**Summary:**  
The conversion required consistent changes in process polarity, bias polarity, and current processing across all Sentaurus modules.

---

# 04. SProcess Modifications

## 이 단계의 목적

| Item | Description |
|---|---|
| Purpose | pMOS 공정 구조를 만들고 주요 공정 조건을 Workbench parameter로 분리 |
| Main Variables | `NWell`, `LDD_Dose`, `LDD_E`, `SD_Dose`, `SD_E`, `RTA`, `Spacer_Dep` |
| Output | pMOS process structure와 13개 TDR checkpoint |

## 1. Well Initialization

기존 nMOS 예제:

```tcl
init concentration=@PWell@ field=Boron
```

pMOS 변경:

```tcl
init concentration=@NWell@ field=Phosphorus
```

pMOS의 p+ Source/Drain이 n-type body 위에 형성되도록 NWell로 변경했습니다.

## 2. LDD Implant

```tcl
implant BF2 dose=@LDD_Dose@ energy=@LDD_E@
```

- acceptor dopant로 p-type extension 형성
- BF2를 이용해 shallow junction과 channeling 억제 고려
- energy를 parameter로 분리해 junction depth 비교

## 3. Source/Drain Implant

```tcl
implant BF2 dose=@SD_Dose@ energy=@SD_E@
```

Dose와 energy를 함께 변화시켜 Source/Drain resistance, junction depth, Ion, Ioff, SS의 trade-off를 확인했습니다.

## 4. RTA

기존:

```tcl
diffuse time=1<s> temperature=1000
```

변경:

```tcl
diffuse time=@RTA@<s> temperature=1000
```

RTA가 길어지면 activation은 증가할 수 있지만 junction diffusion과 leakage도 증가할 수 있어 3, 5, 7 s를 비교했습니다.

## 5. Spacer Parameterization

기존:

```tcl
deposit Nitride type=isotropic thickness=0.3*@Lg@
etch Nitride type=anisotropic thickness=0.35*@Lg@
```

변경:

```tcl
deposit Nitride type=isotropic thickness=@Spacer_Dep@*@Lg@
etch Nitride type=anisotropic thickness=(@Spacer_Dep@+0.05)*@Lg@
```

증착 두께만 변경하고 식각량을 고정하면 spacer가 거의 남지 않거나 과도하게 남을 수 있습니다. 따라서 두 값을 연동해 각 split에서도 안정적인 sidewall spacer를 형성했습니다.

## 6. Complete Report-Derived Source

- [SProcess modification commands](../source/sprocess/pmos_process_modifications.cmd)
- [Thirteen TDR checkpoints](../source/sprocess/tdr_checkpoints.cmd)

**Summary:**  
SProcess was converted to a parameterized pMOS flow covering well formation, p-type implants, RTA, spacer geometry, and process checkpoints.
