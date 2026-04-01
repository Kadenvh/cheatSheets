---
category: Tools
tags: [arduino, microcontroller, embedded, hardware, electronics, atmega]
title: Arduino Fundamentals
created: 2026-03-31
type: cheatsheet
difficulty: 4
exercise_hints:
  recall: "Name the 3 sections of an Arduino sketch and the role of each"
  understanding: "Why does Arduino use setup() and loop() instead of a main() function? How does this map to embedded system design?"
  application: "Wire an LED and button to the Arduino Mega — write a sketch that toggles the LED on each button press with debounce"
---

# Arduino Fundamentals

## Quick Reference
- `Arduino Mega 2560` : ATmega2560 MCU // 54 digital I/O, 16 analog in, 256KB flash, 8KB SRAM
- `sketch` : Arduino program // `.ino` file — C/C++ with Arduino abstractions
- `setup()` : Runs once at boot // Pin modes, serial init, library config
- `loop()` : Runs forever // Main logic — read sensors, drive outputs, communicate
- `pinMode(pin, mode)` : Configure pin // `INPUT`, `OUTPUT`, `INPUT_PULLUP`
- `digitalRead(pin)` : Read HIGH/LOW // Button, switch, digital sensor
- `digitalWrite(pin, val)` : Write HIGH/LOW // LED, relay, buzzer
- `analogRead(pin)` : Read 0-1023 // 10-bit ADC — potentiometer, light sensor
- `analogWrite(pin, val)` : PWM 0-255 // LED brightness, motor speed (not true analog)
- `Serial.begin(baud)` : Start UART // `Serial.println("debug")` for monitoring
- `delay(ms)` : Blocking pause // Simple but blocks everything — use millis() for non-blocking

## Functional Logic
- **Architecture:** MCU runs one program in a loop — no OS, no threads (without libraries)
- **Digital vs Analog:** Digital = HIGH/LOW (3.3V/5V or 0V). Analog input = ADC (0-1023). "Analog" output = PWM
- **Pull-up resistors:** `INPUT_PULLUP` enables internal pull-up — button reads HIGH when open, LOW when pressed
- **Power:** 5V logic, 7-12V barrel jack input. Sensors/components draw from 5V/3.3V rails
- **Communication:** Serial (UART), I2C (`Wire`), SPI — for sensors, displays, other boards
- **Linux connection:** [[Linux CLI Essentials]] // Arduino IDE uses avrdude for upload; can use CLI (`arduino-cli`)
- **Automation:** [[Task Automation with Python]] // pyserial for Python↔Arduino communication

## Implementation
```cpp
// Blink — the "Hello World" of Arduino
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);  // Pin 13 on Mega
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
```

```cpp
// Button-controlled LED with debounce
const int BUTTON_PIN = 2;
const int LED_PIN = 13;
bool ledState = false;
bool lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY = 50;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool reading = digitalRead(BUTTON_PIN);

  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW && lastButtonState == HIGH) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState);
      Serial.println(ledState ? "LED ON" : "LED OFF");
    }
  }
  lastButtonState = reading;
}
```

```cpp
// Analog sensor reading (potentiometer or light sensor)
const int SENSOR_PIN = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int value = analogRead(SENSOR_PIN);    // 0-1023
  float voltage = value * (5.0 / 1023.0); // Convert to voltage
  Serial.print("Raw: "); Serial.print(value);
  Serial.print(" Voltage: "); Serial.println(voltage);
  delay(100);
}
```

```bash
# Arduino CLI — upload without IDE
arduino-cli compile --fqbn arduino:avr:mega sketch/
arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:avr:mega sketch/
arduino-cli monitor -p /dev/ttyACM0 -b 9600
```

## Sandbox
- Wire a DHT-11 temperature sensor and log readings to Serial every 2 seconds
- Build a traffic light with 3 LEDs that cycles green→yellow→red with proper timing
- Use a potentiometer to control LED brightness via analogRead → analogWrite (PWM)
- Communicate between Arduino and a Python script via pyserial — send sensor data, receive commands
