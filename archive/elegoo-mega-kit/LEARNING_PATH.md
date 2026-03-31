# ELEGOO Mega 2560 Kit — Learning Path

Maps 34 ELEGOO tutorial lessons to CheatSheets vault concepts.
Reference: `archive/elegoo-mega-kit/tutorial.pdf` (223 pages)
Code: `archive/elegoo-mega-kit/code/` (per-lesson .ino files)
Libraries: `archive/elegoo-mega-kit/libraries/` (required Arduino libraries)

## Status Key
- **COVERED** — Vault concept exists and covers this material
- **PARTIAL** — Vault concept exists but doesn't cover lesson-specific detail
- **PLANNED** — Good candidate for a future vault concept
- **SKIP** — IDE/setup lesson, not conceptual content

## Lesson Map

### Tier 1: Setup & Digital Basics (Lessons 0-5)
| Lesson | Topic | Status | Vault Concept |
|--------|-------|--------|---------------|
| 0 | Installing IDE | SKIP | (setup, not a concept) |
| 1 | Add Libraries & Serial Monitor | PARTIAL | `arduino-fundamentals` covers Serial basics |
| 2 | Blink | COVERED | `arduino-fundamentals` — LED_BUILTIN, setup/loop |
| 3 | LED | PARTIAL | `electronic-sensors-and-actuators` — LEDs as actuators |
| 4 | RGB LED | PLANNED | `pwm-and-analog-output` — PWM color mixing |
| 5 | Digital Inputs | PARTIAL | `arduino-fundamentals` — digitalRead, buttons |

### Tier 2: Audio & Motion (Lessons 6-9)
| Lesson | Topic | Status | Vault Concept |
|--------|-------|--------|---------------|
| 6 | Active Buzzer | PARTIAL | `electronic-sensors-and-actuators` — actuators |
| 7 | Passive Buzzer | PLANNED | `pwm-and-analog-output` — tone(), frequency control |
| 8 | Tilt Ball Switch | PARTIAL | `electronic-sensors-and-actuators` — digital sensor |
| 9 | Servo Motor | PARTIAL | `electronic-sensors-and-actuators` — servo control |

### Tier 3: Sensors (Lessons 10-20)
| Lesson | Topic | Status | Vault Concept |
|--------|-------|--------|---------------|
| 10 | Ultrasonic Sensor (HC-SR04) | COVERED | `electronic-sensors-and-actuators` — distance sensing |
| 11 | Membrane Switch (4x4 keypad) | PLANNED | `input-devices` — matrix scanning, keypad |
| 12 | DHT11 Temp/Humidity | COVERED | `electronic-sensors-and-actuators` — DHT example |
| 13 | Analog Joystick | PLANNED | `analog-input-processing` — dual-axis analog |
| 14 | IR Receiver | PLANNED | `ir-remote-control` — decode/encode IR signals |
| 15 | MAX7219 LED Dot Matrix | PLANNED | `led-matrix-displays` — SPI, multiplexing |
| 16 | GY-521 Accelerometer/Gyro | PLANNED | `motion-sensing` — I2C, MPU-6050/QMI8658C |
| 17 | HC-SR501 PIR Sensor | PARTIAL | `electronic-sensors-and-actuators` — motion |
| 18 | Water Level Sensor | PARTIAL | `electronic-sensors-and-actuators` — analog sensor |
| 19 | DS1307 Real Time Clock | PLANNED | `real-time-clock` — I2C, timekeeping |
| 20 | Sound Sensor | PARTIAL | `electronic-sensors-and-actuators` — analog sensor |

### Tier 4: Communication & Display (Lessons 21-25)
| Lesson | Topic | Status | Vault Concept |
|--------|-------|--------|---------------|
| 21 | RC522 RFID | PLANNED | `rfid-nfc` — SPI, MIFARE, access control |
| 22 | LCD Display (LCD1602) | PLANNED | `lcd-display` — LiquidCrystal, I2C vs parallel |
| 23 | Thermometer (NTC + LCD) | PARTIAL | Combines sensors + display (project, not concept) |
| 24 | Eight LED with 74HC595 | PLANNED | `shift-registers` — serial-to-parallel, daisy-chain |
| 25 | Serial Monitor deep dive | COVERED | `serial-communication` — UART debugging |
| 26 | Photocell (LDR) | PARTIAL | `electronic-sensors-and-actuators` — analog sensor |

### Tier 5: Segment Displays & Motors (Lessons 27-33)
| Lesson | Topic | Status | Vault Concept |
|--------|-------|--------|---------------|
| 27 | 74HC595 + 7-Segment Display | PLANNED | `shift-registers` + `segment-displays` |
| 28 | 4-Digit 7-Segment Display | PLANNED | `segment-displays` — multiplexing digits |
| 29 | DC Motors (L293D) | PLANNED | `motor-control` — H-bridge, PWM speed, direction |
| 30 | Relay | COVERED | `electronic-sensors-and-actuators` — relay control |
| 31 | Stepper Motor (28BYJ-48) | PLANNED | `stepper-motors` — ULN2003, step sequences |
| 32 | Stepper + IR Remote | PARTIAL | Combines IR + stepper (project, not concept) |
| 33 | Stepper + Rotary Encoder | PARTIAL | Combines encoder + stepper (project, not concept) |

## Recommended Study Order

### Phase A — Foundations (do first, build confidence)
1. `arduino-fundamentals` (COVERED) — then do Lessons 2, 3, 5
2. `electronic-sensors-and-actuators` (COVERED) — then do Lessons 6, 8, 10, 12
3. `serial-communication` (COVERED) — then do Lesson 25

### Phase B — Communication Protocols (build on Phase A)
4. Create `lcd-display` concept → do Lessons 22, 23
5. Create `shift-registers` concept → do Lessons 24, 27, 28
6. Create `motor-control` concept → do Lessons 29, 30, 31

### Phase C — Advanced Sensors & Projects (apply knowledge)
7. Create `ir-remote-control` concept → do Lessons 14, 32
8. Create `motion-sensing` concept → do Lesson 16
9. Create `rfid-nfc` concept → do Lesson 21
10. Create `real-time-clock` concept → do Lesson 19

### Phase D — Integration Projects (combine multiple concepts)
- Lesson 23: Thermometer (sensor + display)
- Lesson 32: IR-controlled stepper (IR + motor)
- Lesson 33: Encoder-controlled stepper (input + motor)
- Custom: Temperature monitor with LCD + buzzer alarm + serial logging

## Coverage Summary
- **COVERED (full):** 5 lessons — already have vault concepts
- **PARTIAL:** 10 lessons — existing concepts touch on the material
- **PLANNED:** 13 lessons — need new vault concepts
- **SKIP:** 1 lesson — IDE setup
- **Project (combo):** 5 lessons — combine existing concepts, good for exercises

## New Concepts Needed (priority order)
1. `lcd-display` — LCD1602, LiquidCrystal library, I2C adapter
2. `motor-control` — DC motors, H-bridge (L293D), PWM speed control
3. `shift-registers` — 74HC595, serial-to-parallel, LED arrays
4. `stepper-motors` — 28BYJ-48, ULN2003, step sequences, half/full step
5. `ir-remote-control` — IR encoding/decoding, IRremote library
6. `real-time-clock` — DS1307/DS3231, I2C, timekeeping, alarms
7. `rfid-nfc` — RC522, SPI, MIFARE cards, access control
8. `motion-sensing` — GY-521/MPU-6050, accelerometer, gyroscope, I2C
