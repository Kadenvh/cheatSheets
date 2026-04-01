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
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref) VALUES
('cl-elegoo-00', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 0, 'Installing IDE', 'Arduino IDE installation and board configuration', 'Arduino IDE setup and board manager configuration', 'skipped', NULL, 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-01', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 1, 'Add Libraries & Serial Monitor', 'Installing Arduino libraries and using Serial Monitor for debugging', 'Arduino library management and Serial Monitor debugging', 'available', NULL, 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-02', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 2, 'Blink', 'The Hello World of Arduino — LED_BUILTIN, setup(), loop(), digitalWrite()', 'Arduino Blink: setup/loop pattern, digital output, LED_BUILTIN', 'locked', NULL, 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-03', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 3, 'LED', 'External LED wiring with resistor, anode/cathode, breadboard basics', 'External LED circuit: resistors, breadboard wiring, current limiting', 'locked', NULL, 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-04', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 4, 'RGB LED', 'PWM color mixing with common-cathode RGB LED, analogWrite()', 'RGB LED color mixing with PWM: analogWrite, color theory, duty cycle', 'locked', 'archive/elegoo-mega-kit/code/Lesson 4 RGB LED', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-05', 'cu-elegoo-mega-2560', 1, 'Setup & Digital Basics', 5, 'Digital Inputs', 'Button wiring, digitalRead(), INPUT_PULLUP, debouncing', 'Digital input with buttons: pull-up resistors, debouncing, state detection', 'locked', 'archive/elegoo-mega-kit/code/Lesson 5 Digital Inputs', 'archive/elegoo-mega-kit/tutorial.pdf');

-- Tier 2: Audio & Motion (Lessons 6-9)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref) VALUES
('cl-elegoo-06', 'cu-elegoo-mega-2560', 2, 'Audio & Motion', 6, 'Active Buzzer', 'Digital output to piezo buzzer, HIGH/LOW toggling for sound', 'Active buzzer: digital output for simple tone generation', 'locked', 'archive/elegoo-mega-kit/code/Lesson 6 Making Sounds', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-07', 'cu-elegoo-mega-2560', 2, 'Audio & Motion', 7, 'Passive Buzzer', 'PWM-driven buzzer with tone() function, frequency control, melodies', 'Passive buzzer with tone(): frequency control, PWM audio, melodies', 'locked', 'archive/elegoo-mega-kit/code/Lesson 7 Passive Buzzer', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-08', 'cu-elegoo-mega-2560', 2, 'Audio & Motion', 8, 'Tilt Ball Switch', 'Mercury-free tilt sensor, digital state detection, orientation sensing', 'Tilt ball switch: orientation detection, digital sensor reading', 'locked', 'archive/elegoo-mega-kit/code/Lesson 8 Ball Switch', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-09', 'cu-elegoo-mega-2560', 2, 'Audio & Motion', 9, 'Servo Motor', 'Servo library, angle control 0-180, PWM signal, mechanical limits', 'Servo motor control: Servo library, angle positioning, PWM signals', 'locked', 'archive/elegoo-mega-kit/code/Lesson 9 Servo', 'archive/elegoo-mega-kit/tutorial.pdf');

-- Tier 3: Sensors (Lessons 10-20)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref) VALUES
('cl-elegoo-10', 'cu-elegoo-mega-2560', 3, 'Sensors', 10, 'Ultrasonic Sensor (HC-SR04)', 'Distance measurement via sound pulse timing, pulseIn(), speed of sound', 'HC-SR04 ultrasonic distance sensor: trigger/echo timing, pulseIn()', 'locked', 'archive/elegoo-mega-kit/code/Lesson 10 Ultrasonic Sensor Module', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-11', 'cu-elegoo-mega-2560', 3, 'Sensors', 11, 'Membrane Switch (4x4 Keypad)', 'Matrix scanning, Keypad library, row/column multiplexing', '4x4 membrane keypad: matrix scanning, Keypad library, input decoding', 'locked', 'archive/elegoo-mega-kit/code/Lesson 11 Membrane Switch Module', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-12', 'cu-elegoo-mega-2560', 3, 'Sensors', 12, 'DHT11 Temperature & Humidity', 'Single-wire digital protocol, DHT library, environmental sensing', 'DHT11 sensor: temperature and humidity reading, DHT library', 'locked', 'archive/elegoo-mega-kit/code/Lesson 12 DHT11 Temperature and Humidity Sensor', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-13', 'cu-elegoo-mega-2560', 3, 'Sensors', 13, 'Analog Joystick', 'Dual-axis analog input, analogRead() for X/Y, button press on Z', 'Analog joystick: dual-axis analogRead, center calibration, button input', 'locked', 'archive/elegoo-mega-kit/code/Lesson 13 Analog Joystick Module', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-14', 'cu-elegoo-mega-2560', 3, 'Sensors', 14, 'IR Receiver', 'Infrared remote decoding, IRremote library, protocol handling', 'IR receiver: remote control decoding, IRremote library, NEC protocol', 'locked', 'archive/elegoo-mega-kit/code/Lesson 14 IR Receiver Module', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-15', 'cu-elegoo-mega-2560', 3, 'Sensors', 15, 'MAX7219 LED Dot Matrix', 'SPI-driven 8x8 LED matrix, LedControl library, multiplexing', 'MAX7219 LED dot matrix: SPI communication, LedControl library, pixel patterns', 'locked', 'archive/elegoo-mega-kit/code/Lesson 15 MAX7219 LED Dot Matrix Module', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-16', 'cu-elegoo-mega-2560', 3, 'Sensors', 16, 'GY-521 Accelerometer/Gyro', 'MPU-6050 I2C sensor, 6-axis motion, Wire library, register reads', 'GY-521 MPU-6050: I2C accelerometer/gyroscope, motion sensing, Wire library', 'locked', 'archive/elegoo-mega-kit/code/Lesson 16 GY-521 Module', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-17', 'cu-elegoo-mega-2560', 3, 'Sensors', 17, 'HC-SR501 PIR Sensor', 'Passive infrared motion detection, sensitivity/delay adjustment', 'PIR motion sensor: passive infrared detection, sensitivity tuning', 'locked', 'archive/elegoo-mega-kit/code/Lesson 17 HC-SR501 PIR Sensor', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-18', 'cu-elegoo-mega-2560', 3, 'Sensors', 18, 'Water Level Sensor', 'Analog resistance-based water detection, threshold logic', 'Water level sensor: analog resistance reading, threshold-based detection', 'locked', 'archive/elegoo-mega-kit/code/Lesson 18 Water Level Detection Sensor Module', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-19', 'cu-elegoo-mega-2560', 3, 'Sensors', 19, 'Real Time Clock (DS1307)', 'I2C timekeeping module, battery backup, date/time tracking', 'DS1307 real-time clock: I2C timekeeping, battery backup, alarm scheduling', 'locked', 'archive/elegoo-mega-kit/code/Lesson 19 Real Time Clock Module', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-20', 'cu-elegoo-mega-2560', 3, 'Sensors', 20, 'Sound Sensor', 'Analog microphone module, sound level detection, threshold triggers', 'Sound sensor: analog audio detection, threshold triggering, sensitivity', 'locked', 'archive/elegoo-mega-kit/code/Lesson 20 Sound Sensor Module', 'archive/elegoo-mega-kit/tutorial.pdf');

-- Tier 4: Communication & Display (Lessons 21-26)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref) VALUES
('cl-elegoo-21', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 21, 'RC522 RFID Module', 'SPI RFID reader, MIFARE card UIDs, access control basics', 'RC522 RFID: SPI communication, MIFARE card reading, UID authentication', 'locked', 'archive/elegoo-mega-kit/code/Lesson 21 RC522 RFID Module', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-22', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 22, 'LCD Display (LCD1602)', 'LiquidCrystal library, I2C adapter, 16x2 character display', 'LCD1602 display: LiquidCrystal library, I2C adapter, text output', 'locked', 'archive/elegoo-mega-kit/code/Lesson 22 LCD Display', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-23', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 23, 'Thermometer (NTC + LCD)', 'Integration project: NTC thermistor reading displayed on LCD', 'Thermometer project: NTC thermistor + LCD display integration', 'locked', 'archive/elegoo-mega-kit/code/Lesson 23 Thermometer', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-24', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 24, 'Eight LEDs with 74HC595', 'Shift register for serial-to-parallel output, shiftOut(), daisy-chaining', '74HC595 shift register: serial-to-parallel, shiftOut(), LED arrays', 'locked', 'archive/elegoo-mega-kit/code/Lesson 24 Eight LED with 74HC595', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-25', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 25, 'Serial Monitor Deep Dive', 'Advanced serial debugging, Serial.print formatting, baud rates, data parsing', 'Serial Monitor mastery: formatting, baud rates, bidirectional communication', 'locked', 'archive/elegoo-mega-kit/code/Lesson 25 The Serial Monitor', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-26', 'cu-elegoo-mega-2560', 4, 'Communication & Display', 26, 'Photocell (LDR)', 'Light-dependent resistor, voltage divider circuit, analog light sensing', 'Photocell LDR: voltage divider circuit, analog light measurement', 'locked', 'archive/elegoo-mega-kit/code/Lesson 26 Photocell', 'archive/elegoo-mega-kit/tutorial.pdf');

-- Tier 5: Segment Displays & Motors (Lessons 27-33)
INSERT OR IGNORE INTO curriculum_lessons (id, curriculum_id, tier, tier_name, sort_order, title, description, topic, status, code_ref, doc_ref) VALUES
('cl-elegoo-27', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 27, '74HC595 + 7-Segment Display', 'Shift register driving 7-segment display, digit encoding, BCD', '7-segment display with 74HC595: segment encoding, shift register output', 'locked', 'archive/elegoo-mega-kit/code/Lesson 27 74HC595 And Segment Display', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-28', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 28, '4-Digit 7-Segment Display', 'Multiplexed multi-digit display, persistence of vision, digit scanning', 'Four-digit 7-segment display: multiplexing, digit scanning, POV timing', 'locked', 'archive/elegoo-mega-kit/code/Lesson 28 Four Digital Seven Segment Display', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-29', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 29, 'DC Motors (L293D)', 'H-bridge motor driver, direction control, PWM speed regulation', 'DC motor control: L293D H-bridge, direction switching, PWM speed', 'locked', 'archive/elegoo-mega-kit/code/Lesson 29 DC Motors', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-30', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 30, 'Relay Module', 'Electromechanical relay, high-power switching, isolation, safety', 'Relay module: high-power switching, isolation, safety considerations', 'locked', 'archive/elegoo-mega-kit/code/Lesson 30 Relay', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-31', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 31, 'Stepper Motor (28BYJ-48)', 'ULN2003 driver, step sequences, half/full step modes, positioning', 'Stepper motor: 28BYJ-48 + ULN2003, step sequences, precise positioning', 'locked', 'archive/elegoo-mega-kit/code/Lesson 31 Stepper Motor', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-32', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 32, 'Stepper + IR Remote', 'Integration project: IR remote controlling stepper motor direction/speed', 'Integration: IR remote-controlled stepper motor, command mapping', 'locked', 'archive/elegoo-mega-kit/code/Lesson 32 Controlling Stepper Motor With Remote', 'archive/elegoo-mega-kit/tutorial.pdf'),
('cl-elegoo-33', 'cu-elegoo-mega-2560', 5, 'Segment Displays & Motors', 33, 'Stepper + Rotary Encoder', 'Integration project: rotary encoder for precise stepper positioning', 'Integration: rotary encoder-controlled stepper motor, position feedback', 'locked', 'archive/elegoo-mega-kit/code/Lesson 33 Controlling Stepper Motor With Rotary Encoder', 'archive/elegoo-mega-kit/tutorial.pdf');
