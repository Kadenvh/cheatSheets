-- learning.db schema v1 — Curriculum guided learning paths
-- Separate from brain.db to avoid PE template/migration conflicts

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_info (
    version     INTEGER NOT NULL,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS curricula (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    domain          TEXT NOT NULL DEFAULT 'general',
    tier_count      INTEGER DEFAULT 1,
    lesson_count    INTEGER DEFAULT 0,
    source_ref      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS curriculum_lessons (
    id              TEXT PRIMARY KEY,
    curriculum_id   TEXT NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
    tier            INTEGER NOT NULL DEFAULT 1,
    tier_name       TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    title           TEXT NOT NULL,
    description     TEXT,
    topic           TEXT NOT NULL,
    concept_id      TEXT,
    session_id      TEXT,
    status          TEXT NOT NULL DEFAULT 'locked'
                    CHECK (status IN ('locked','available','in_progress','complete','skipped')),
    code_ref        TEXT,
    doc_ref         TEXT,
    doc_pages       TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cl_curriculum ON curriculum_lessons(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_cl_status ON curriculum_lessons(status);
CREATE INDEX IF NOT EXISTS idx_cl_session ON curriculum_lessons(session_id);
CREATE INDEX IF NOT EXISTS idx_cl_sort ON curriculum_lessons(curriculum_id, tier, sort_order);

CREATE TABLE IF NOT EXISTS curriculum_enrollments (
    id              TEXT PRIMARY KEY,
    curriculum_id   TEXT NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
    enrolled_at     TEXT NOT NULL DEFAULT (datetime('now')),
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','paused','completed','abandoned')),
    lessons_complete INTEGER DEFAULT 0,
    last_activity   TEXT,
    completed_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_ce_curriculum ON curriculum_enrollments(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_ce_status ON curriculum_enrollments(status);

INSERT INTO schema_info (version) VALUES (1);

-- ─── ELEGOO Mega 2560 Starter Kit Curriculum ────────────────────

INSERT OR IGNORE INTO curricula (id, title, description, domain, tier_count, lesson_count, source_ref)
VALUES (
    'cu-elegoo-mega-2560',
    'ELEGOO Mega 2560 Starter Kit',
    'Complete Arduino learning path: 34 lessons from LED basics through stepper motor control. Based on the ELEGOO Most Complete Starter Kit tutorial (223 pages). Covers digital/analog I/O, sensors, actuators, communication protocols (UART/I2C/SPI), displays, and motor control.',
    'electronics',
    5,
    34,
    'archive/elegoo-mega-kit/LEARNING_PATH.md'
);

-- Tier 1: Setup & Digital Basics (Lessons 0-5)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-elegoo-00', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 0, 'Installing IDE', 'Arduino IDE installation and board configuration', 'Arduino IDE setup and board manager configuration', 'skipped', NULL, 'archive/elegoo-mega-kit/tutorial.pdf', '12-24'),
('cl-elegoo-01', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 1, 'Add Libraries & Serial Monitor', 'Installing Arduino libraries and using Serial Monitor for debugging', 'Arduino library management and Serial Monitor debugging', 'available', NULL, 'archive/elegoo-mega-kit/tutorial.pdf', '25-31'),
('cl-elegoo-02', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 2, 'Blink', 'The Hello World of Arduino — LED_BUILTIN, setup(), loop(), digitalWrite()', 'Arduino Blink: setup/loop pattern, digital output, LED_BUILTIN', 'locked', NULL, 'archive/elegoo-mega-kit/tutorial.pdf', '32-42'),
('cl-elegoo-03', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 3, 'LED', 'External LED wiring with resistor, anode/cathode, breadboard basics', 'External LED circuit: resistors, breadboard wiring, current limiting', 'locked', NULL, 'archive/elegoo-mega-kit/tutorial.pdf', '43-49'),
('cl-elegoo-04', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 4, 'RGB LED', 'PWM color mixing with common-cathode RGB LED, analogWrite()', 'RGB LED color mixing with PWM: analogWrite, color theory, duty cycle', 'locked', 'archive/elegoo-mega-kit/code/Lesson 4 RGB LED', 'archive/elegoo-mega-kit/tutorial.pdf', '50-58'),
('cl-elegoo-05', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 5, 'Digital Inputs', 'Button wiring, digitalRead(), INPUT_PULLUP, debouncing', 'Digital input with buttons: pull-up resistors, debouncing, state detection', 'locked', 'archive/elegoo-mega-kit/code/Lesson 5 Digital Inputs', 'archive/elegoo-mega-kit/tutorial.pdf', '59-63');

-- Tier 2: Audio & Motion (Lessons 6-9)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-elegoo-06', 'cu-elegoo-mega-2560', 2, 'Audio & Motion', 6, 'Active Buzzer', 'Digital output to piezo buzzer, HIGH/LOW toggling for sound', 'Active buzzer: digital output for simple tone generation', 'locked', 'archive/elegoo-mega-kit/code/Lesson 6 Making Sounds', 'archive/elegoo-mega-kit/tutorial.pdf', '64-67'),
('cl-elegoo-07', 'cu-elegoo-mega-2560', 2, 'Audio & Motion', 7, 'Passive Buzzer', 'PWM-driven buzzer with tone() function, frequency control, melodies', 'Passive buzzer with tone(): frequency control, PWM audio, melodies', 'locked', 'archive/elegoo-mega-kit/code/Lesson 7 Passive Buzzer', 'archive/elegoo-mega-kit/tutorial.pdf', '68-71'),
('cl-elegoo-08', 'cu-elegoo-mega-2560', 2, 'Audio & Motion', 8, 'Tilt Ball Switch', 'Mercury-free tilt sensor, digital state detection, orientation sensing', 'Tilt ball switch: orientation detection, digital sensor reading', 'locked', 'archive/elegoo-mega-kit/code/Lesson 8 Ball Switch', 'archive/elegoo-mega-kit/tutorial.pdf', '72-75'),
('cl-elegoo-09', 'cu-elegoo-mega-2560', 2, 'Audio & Motion', 9, 'Servo Motor', 'Servo library, angle control 0-180, PWM signal, mechanical limits', 'Servo motor control: Servo library, angle positioning, PWM signals', 'locked', 'archive/elegoo-mega-kit/code/Lesson 9 Servo', 'archive/elegoo-mega-kit/tutorial.pdf', '76-79');

-- Tier 3: Sensors (Lessons 10-20)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-elegoo-10', 'cu-elegoo-mega-2560', 3, 'Sensors', 10, 'Ultrasonic Sensor (HC-SR04)', 'Distance measurement via sound pulse timing, pulseIn(), speed of sound', 'HC-SR04 ultrasonic distance sensor: trigger/echo timing, pulseIn()', 'locked', 'archive/elegoo-mega-kit/code/Lesson 10 Ultrasonic Sensor Module', 'archive/elegoo-mega-kit/tutorial.pdf', '80-84'),
('cl-elegoo-11', 'cu-elegoo-mega-2560', 3, 'Sensors', 11, 'Membrane Switch (4x4 Keypad)', 'Matrix scanning, Keypad library, row/column multiplexing', '4x4 membrane keypad: matrix scanning, Keypad library, input decoding', 'locked', 'archive/elegoo-mega-kit/code/Lesson 11 Membrane Switch Module', 'archive/elegoo-mega-kit/tutorial.pdf', '85-90'),
('cl-elegoo-12', 'cu-elegoo-mega-2560', 3, 'Sensors', 12, 'DHT11 Temperature & Humidity', 'Single-wire digital protocol, DHT library, environmental sensing', 'DHT11 sensor: temperature and humidity reading, DHT library', 'locked', 'archive/elegoo-mega-kit/code/Lesson 12 DHT11 Temperature and Humidity Sensor', 'archive/elegoo-mega-kit/tutorial.pdf', '91-96'),
('cl-elegoo-13', 'cu-elegoo-mega-2560', 3, 'Sensors', 13, 'Analog Joystick', 'Dual-axis analog input, analogRead() for X/Y, button press on Z', 'Analog joystick: dual-axis analogRead, center calibration, button input', 'locked', 'archive/elegoo-mega-kit/code/Lesson 13 Analog Joystick Module', 'archive/elegoo-mega-kit/tutorial.pdf', '97-101'),
('cl-elegoo-14', 'cu-elegoo-mega-2560', 3, 'Sensors', 14, 'IR Receiver', 'Infrared remote decoding, IRremote library, protocol handling', 'IR receiver: remote control decoding, IRremote library, NEC protocol', 'locked', 'archive/elegoo-mega-kit/code/Lesson 14 IR Receiver Module', 'archive/elegoo-mega-kit/tutorial.pdf', '102-107'),
('cl-elegoo-15', 'cu-elegoo-mega-2560', 3, 'Sensors', 15, 'MAX7219 LED Dot Matrix', 'SPI-driven 8x8 LED matrix, LedControl library, multiplexing', 'MAX7219 LED dot matrix: SPI communication, LedControl library, pixel patterns', 'locked', 'archive/elegoo-mega-kit/code/Lesson 15 MAX7219 LED Dot Matrix Module', 'archive/elegoo-mega-kit/tutorial.pdf', '108-111'),
('cl-elegoo-16', 'cu-elegoo-mega-2560', 3, 'Sensors', 16, 'GY-521 Accelerometer/Gyro', 'MPU-6050 I2C sensor, 6-axis motion, Wire library, register reads', 'GY-521 MPU-6050: I2C accelerometer/gyroscope, motion sensing, Wire library', 'locked', 'archive/elegoo-mega-kit/code/Lesson 16 GY-521 Module', 'archive/elegoo-mega-kit/tutorial.pdf', '112-120'),
('cl-elegoo-17', 'cu-elegoo-mega-2560', 3, 'Sensors', 17, 'HC-SR501 PIR Sensor', 'Passive infrared motion detection, sensitivity/delay adjustment', 'PIR motion sensor: passive infrared detection, sensitivity tuning', 'locked', 'archive/elegoo-mega-kit/code/Lesson 17 HC-SR501 PIR Sensor', 'archive/elegoo-mega-kit/tutorial.pdf', '121-130'),
('cl-elegoo-18', 'cu-elegoo-mega-2560', 3, 'Sensors', 18, 'Water Level Sensor', 'Analog resistance-based water detection, threshold logic', 'Water level sensor: analog resistance reading, threshold-based detection', 'locked', 'archive/elegoo-mega-kit/code/Lesson 18 Water Level Detection Sensor Module', 'archive/elegoo-mega-kit/tutorial.pdf', '131-135'),
('cl-elegoo-19', 'cu-elegoo-mega-2560', 3, 'Sensors', 19, 'Real Time Clock (DS1307)', 'I2C timekeeping module, battery backup, date/time tracking', 'DS1307 real-time clock: I2C timekeeping, battery backup, alarm scheduling', 'locked', 'archive/elegoo-mega-kit/code/Lesson 19 Real Time Clock Module', 'archive/elegoo-mega-kit/tutorial.pdf', '136-140'),
('cl-elegoo-20', 'cu-elegoo-mega-2560', 3, 'Sensors', 20, 'Sound Sensor', 'Analog microphone module, sound level detection, threshold triggers', 'Sound sensor: analog audio detection, threshold triggering, sensitivity', 'locked', 'archive/elegoo-mega-kit/code/Lesson 20 Sound Sensor Module', 'archive/elegoo-mega-kit/tutorial.pdf', '141-146');

-- Tier 4: Communication & Display (Lessons 21-26)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-elegoo-21', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 21, 'RC522 RFID Module', 'SPI RFID reader, MIFARE card UIDs, access control basics', 'RC522 RFID: SPI communication, MIFARE card reading, UID authentication', 'locked', 'archive/elegoo-mega-kit/code/Lesson 21 RC522 RFID Module', 'archive/elegoo-mega-kit/tutorial.pdf', '147-151'),
('cl-elegoo-22', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 22, 'LCD Display (LCD1602)', 'LiquidCrystal library, I2C adapter, 16x2 character display', 'LCD1602 display: LiquidCrystal library, I2C adapter, text output', 'locked', 'archive/elegoo-mega-kit/code/Lesson 22 LCD Display', 'archive/elegoo-mega-kit/tutorial.pdf', '152-156'),
('cl-elegoo-23', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 23, 'Thermometer (NTC + LCD)', 'Integration project: NTC thermistor reading displayed on LCD', 'Thermometer project: NTC thermistor + LCD display integration', 'locked', 'archive/elegoo-mega-kit/code/Lesson 23 Thermometer', 'archive/elegoo-mega-kit/tutorial.pdf', '157-161'),
('cl-elegoo-24', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 24, 'Eight LEDs with 74HC595', 'Shift register for serial-to-parallel output, shiftOut(), daisy-chaining', '74HC595 shift register: serial-to-parallel, shiftOut(), LED arrays', 'locked', 'archive/elegoo-mega-kit/code/Lesson 24 Eight LED with 74HC595', 'archive/elegoo-mega-kit/tutorial.pdf', '162-168'),
('cl-elegoo-25', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 25, 'Serial Monitor Deep Dive', 'Advanced serial debugging, Serial.print formatting, baud rates, data parsing', 'Serial Monitor mastery: formatting, baud rates, bidirectional communication', 'locked', 'archive/elegoo-mega-kit/code/Lesson 25 The Serial Monitor', 'archive/elegoo-mega-kit/tutorial.pdf', '169-174'),
('cl-elegoo-26', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 26, 'Photocell (LDR)', 'Light-dependent resistor, voltage divider circuit, analog light sensing', 'Photocell LDR: voltage divider circuit, analog light measurement', 'locked', 'archive/elegoo-mega-kit/code/Lesson 26 Photocell', 'archive/elegoo-mega-kit/tutorial.pdf', '175-179');

-- Tier 5: Segment Displays & Motors (Lessons 27-33)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-elegoo-27', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 27, '74HC595 + 7-Segment Display', 'Shift register driving 7-segment display, digit encoding, BCD', '7-segment display with 74HC595: segment encoding, shift register output', 'locked', 'archive/elegoo-mega-kit/code/Lesson 27 74HC595 And Segment Display', 'archive/elegoo-mega-kit/tutorial.pdf', '180-185'),
('cl-elegoo-28', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 28, '4-Digit 7-Segment Display', 'Multiplexed multi-digit display, persistence of vision, digit scanning', 'Four-digit 7-segment display: multiplexing, digit scanning, POV timing', 'locked', 'archive/elegoo-mega-kit/code/Lesson 28 Four Digital Seven Segment Display', 'archive/elegoo-mega-kit/tutorial.pdf', '186-190'),
('cl-elegoo-29', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 29, 'DC Motors (L293D)', 'H-bridge motor driver, direction control, PWM speed regulation', 'DC motor control: L293D H-bridge, direction switching, PWM speed', 'locked', 'archive/elegoo-mega-kit/code/Lesson 29 DC Motors', 'archive/elegoo-mega-kit/tutorial.pdf', '191-200'),
('cl-elegoo-30', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 30, 'Relay Module', 'Electromechanical relay, high-power switching, isolation, safety', 'Relay module: high-power switching, isolation, safety considerations', 'locked', 'archive/elegoo-mega-kit/code/Lesson 30 Relay', 'archive/elegoo-mega-kit/tutorial.pdf', '201-205'),
('cl-elegoo-31', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 31, 'Stepper Motor (28BYJ-48)', 'ULN2003 driver, step sequences, half/full step modes, positioning', 'Stepper motor: 28BYJ-48 + ULN2003, step sequences, precise positioning', 'locked', 'archive/elegoo-mega-kit/code/Lesson 31 Stepper Motor', 'archive/elegoo-mega-kit/tutorial.pdf', '206-213'),
('cl-elegoo-32', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 32, 'Stepper + IR Remote', 'Integration project: IR remote controlling stepper motor direction/speed', 'Integration: IR remote-controlled stepper motor, command mapping', 'locked', 'archive/elegoo-mega-kit/code/Lesson 32 Controlling Stepper Motor With Remote', 'archive/elegoo-mega-kit/tutorial.pdf', '214-217'),
('cl-elegoo-33', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 33, 'Stepper + Rotary Encoder', 'Integration project: rotary encoder for precise stepper positioning', 'Integration: rotary encoder-controlled stepper motor, position feedback', 'locked', 'archive/elegoo-mega-kit/code/Lesson 33 Controlling Stepper Motor With Rotary Encoder', 'archive/elegoo-mega-kit/tutorial.pdf', '218-223');

-- ─── SPDRbot Quadruped Robotics Curriculum ─────────────────────
-- Follow-up to ELEGOO Mega 2560. Applies Arduino/electronics foundations
-- to a real 12-DOF quadruped robot project using MicroPython on Raspberry Pi Pico.
-- Prerequisite knowledge: ELEGOO Tiers 1-2 (servo PWM, digital I/O, basic circuits).

INSERT OR IGNORE INTO curricula (id, title, description, domain, tier_count, lesson_count, source_ref)
VALUES (
    'cu-spdrbot-quadruped',
    'SPDRbot Quadruped Robotics',
    'Applied robotics course: 26 lessons building a 12-DOF quadruped spider robot. Covers MicroPython on Raspberry Pi Pico, servo calibration, inverse kinematics, gait development, sensor integration, and Jetson AI. Builds on ELEGOO Mega 2560 foundations (servo PWM, I2C, sensors). Hardware: SPDRbot kit with Pico Servo Driver Rev 3.1, 12x 25kg servos, 2S LiPo + Castle BEC Pro.',
    'robotics',
    5,
    26,
    '/home/ava/SPDRbot/SPDRBOT_AGENT2.md'
);

-- Tier 1: Setup & Foundations (Lessons 0-4)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-spdr-00', 'cu-spdrbot-quadruped', 1, 'Setup & Foundations', 0, 'MicroPython & Raspberry Pi Pico', 'Flash MicroPython firmware, Thonny IDE setup, REPL basics, Pin and PWM modules', 'MicroPython on RP2040: firmware flashing, REPL, Pin/PWM imports, machine module', 'available', NULL, '/home/ava/SPDRbot/README.md', NULL),
('cl-spdr-01', 'cu-spdrbot-quadruped', 1, 'Setup & Foundations', 1, 'PWM Servo Control', 'Duty cycle math, degrees_to_duty conversion, single servo sweep test', 'Servo PWM control: 50Hz frequency, duty cycle calculation, angle-to-pulse mapping', 'available', '/home/ava/SPDRbot/scripts/safe_test.py', '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-02', 'cu-spdrbot-quadruped', 1, 'Setup & Foundations', 2, 'Power Systems for Robotics', 'Current budgets, LiPo safety (2S chemistry), BEC voltage regulation, wiring gauge', 'Robotics power: LiPo batteries, BEC regulators, current budgeting for 12-servo systems', 'available', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-03', 'cu-spdrbot-quadruped', 1, 'Setup & Foundations', 3, 'Servo Calibration', 'Finding mechanical center, neutral offsets, direction mapping for mirrored servos', 'Servo calibration: center-finding, NEUTRAL_OFFSETS array, DIRECTION_MAP for mirrored mounts', 'available', '/home/ava/SPDRbot/scripts/servo_calibration.py', '/home/ava/SPDRbot/README.md', NULL),
('cl-spdr-04', 'cu-spdrbot-quadruped', 1, 'Setup & Foundations', 4, 'Multi-Servo Coordination', 'Pico Servo Driver board, controlling 12 servos simultaneously, joint mapping', 'Multi-servo systems: Pico Servo Driver Rev 3.1, JOINT_MAP, by-joint-type wiring layout', 'available', '/home/ava/SPDRbot/scripts/joints.py', '/home/ava/SPDRbot/README.md', NULL);

-- Tier 2: Leg Mechanics (Lessons 5-9)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-spdr-05', 'cu-spdrbot-quadruped', 2, 'Leg Mechanics', 5, '3-DOF Leg Anatomy', 'Hip/shoulder/knee joint roles, joint naming convention (_a/_b/_c), physical structure', 'Quadruped leg anatomy: 3 degrees of freedom, hip yaw + shoulder pitch + knee pitch', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-06', 'cu-spdrbot-quadruped', 2, 'Leg Mechanics', 6, 'Forward Kinematics', 'Joint angles to foot position, coordinate frames, segment length measurement', 'Forward kinematics: computing foot position from joint angles using trig and segment lengths', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT.md', NULL),
('cl-spdr-07', 'cu-spdrbot-quadruped', 2, 'Leg Mechanics', 7, 'Inverse Kinematics', 'Foot position to joint angles, 2-link IK math, workspace boundaries', 'Inverse kinematics: 3-DOF IK solver (shoulder atan2 + 2-link planar), workspace limits', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT.md', NULL),
('cl-spdr-08', 'cu-spdrbot-quadruped', 2, 'Leg Mechanics', 8, 'Leg Class Abstraction', 'OOP for robot control, Leg class with set_angles and set_position methods', 'Robot OOP: Leg class encapsulating servo channels, calibration, IK, and position control', 'locked', '/home/ava/SPDRbot/spdrbot.py', '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-09', 'cu-spdrbot-quadruped', 2, 'Leg Mechanics', 9, 'Interpolated Motion', 'Smooth movement via linear interpolation, step count tuning, easing functions', 'Motion smoothing: linear interpolation between poses, configurable step count and duration', 'locked', '/home/ava/SPDRbot/spdrbot.py', '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL);

-- Tier 3: Body Control (Lessons 10-14)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-spdr-10', 'cu-spdrbot-quadruped', 3, 'Body Control', 10, 'Body Coordinate System', 'Body frame origin, leg mount offsets, 4-leg initialization, Robot class', 'Body kinematics: coordinate frame, leg mounting geometry, Robot class architecture', 'locked', '/home/ava/SPDRbot/spdrbot.py', '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-11', 'cu-spdrbot-quadruped', 3, 'Body Control', 11, 'Standing & Balance', 'Center of gravity, support polygon, stable standing pose, standup sequence', 'Static stability: center of gravity over support polygon, multi-phase standup routine', 'locked', '/home/ava/SPDRbot/spdrbot.py', '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-12', 'cu-spdrbot-quadruped', 3, 'Body Control', 12, 'Body Pose Control', 'Roll/pitch/yaw rotation, body translation, 6-DOF pose as IK input offsets', 'Body pose: 6-DOF control (x/y/z translation + roll/pitch/yaw) via IK foot adjustments', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-13', 'cu-spdrbot-quadruped', 3, 'Body Control', 13, 'Weight Shifting', 'Moving center of gravity over support legs, pre-gait weight transfer', 'Weight shifting: translating body CoG to unload a leg before lifting, stability margins', 'locked', '/home/ava/SPDRbot/spdrbot.py', '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-14', 'cu-spdrbot-quadruped', 3, 'Body Control', 14, 'RC Control Integration', 'ELRS receiver wiring, PWM input reading on Pico, stick-to-movement mapping', 'RC integration: RadioMaster TX16S + RP3 receiver, PWM channel reading, input normalization', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL);

-- Tier 4: Locomotion (Lessons 15-19)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-spdr-15', 'cu-spdrbot-quadruped', 4, 'Locomotion', 15, 'Gait Theory', 'Crawl/walk/trot patterns, phase timing, duty factor, support triangles', 'Gait fundamentals: phase diagrams, duty factor, static vs dynamic stability, gait selection', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-16', 'cu-spdrbot-quadruped', 4, 'Locomotion', 16, 'Foot Trajectory Planning', 'Bezier curve foot paths, lift-swing-plant cycle, ground clearance tuning', 'Foot trajectories: Bezier curves for smooth swing phase, parameterized step height and length', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-17', 'cu-spdrbot-quadruped', 4, 'Locomotion', 17, 'Crawl Gait', 'One-leg-at-a-time locomotion, maximum stability, sequential leg lifting', 'Crawl gait: single-leg swing with 3-leg support, slowest but most stable walking pattern', 'locked', '/home/ava/SPDRbot/spdrbot.py', '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-18', 'cu-spdrbot-quadruped', 4, 'Locomotion', 18, 'Trot Gait', 'Diagonal pair locomotion, dynamic balance, faster movement with reduced stability', 'Trot gait: diagonal leg pairs move simultaneously, dynamic stability, X-gait pattern', 'locked', '/home/ava/SPDRbot/spdrbot.py', '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-19', 'cu-spdrbot-quadruped', 4, 'Locomotion', 19, 'Turning & Omnidirectional Movement', 'In-place rotation, strafing, combined translation and yaw, direction vectors', 'Omnidirectional control: rotation via asymmetric stepping, strafe, combined heading + direction', 'locked', '/home/ava/SPDRbot/spdrbot.py', '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL);

-- Tier 5: Sensing & Intelligence (Lessons 20-25)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref, doc_pages) VALUES
('cl-spdr-20', 'cu-spdrbot-quadruped', 5, 'Sensing & Intelligence', 20, 'IMU Integration', 'MPU-6050 on Pico via I2C, accelerometer and gyroscope reading, orientation estimation', 'IMU integration: MPU-6050 I2C setup on Pico, raw accel/gyro reads, complementary filter', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-21', 'cu-spdrbot-quadruped', 5, 'Sensing & Intelligence', 21, 'Body Leveling', 'IMU feedback loop, PID control for pitch/roll correction, terrain compensation', 'Closed-loop leveling: PID controller using IMU pitch/roll to adjust leg heights in real-time', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-22', 'cu-spdrbot-quadruped', 5, 'Sensing & Intelligence', 22, 'Obstacle Detection', 'ToF or ultrasonic distance sensors, reactive avoidance behaviors, sensor placement', 'Obstacle avoidance: distance sensor integration, threshold-based reactive path adjustment', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-23', 'cu-spdrbot-quadruped', 5, 'Sensing & Intelligence', 23, 'Central Pattern Generator', 'CPG neural oscillators for adaptive gait rhythms, coupling between legs', 'CPG gait engine: coupled oscillators replacing scripted gaits, frequency/amplitude modulation', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-24', 'cu-spdrbot-quadruped', 5, 'Sensing & Intelligence', 24, 'Jetson-Pico Communication', 'UART protocol design, command/telemetry interface, high-level vs low-level split', 'Jetson-Pico UART: command protocol, telemetry streaming, dual-processor architecture', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL),
('cl-spdr-25', 'cu-spdrbot-quadruped', 5, 'Sensing & Intelligence', 25, 'Camera-Based Navigation', 'Jetson CV pipeline, object tracking, autonomous waypoint following', 'Vision navigation: Jetson Orin Nano camera pipeline, object detection, autonomous behavior', 'locked', NULL, '/home/ava/SPDRbot/SPDRBOT_AGENT2.md', NULL);
