---
category: Tools
tags: [sensors, actuators, electronics, arduino, gpio, analog, digital]
title: Electronic Sensors and Actuators
created: 2026-03-31
type: cheatsheet
difficulty: 4
exercise_hints:
  recall: "Classify these as sensor or actuator: DHT-11, servo motor, LDR, buzzer, potentiometer, relay"
  understanding: "Why do some sensors output analog signals while others use digital protocols? How does this affect accuracy and wiring?"
  application: "Build a temperature-controlled fan: DHT-11 reads temp, Arduino drives a DC motor via relay when temp exceeds threshold"
---

# Electronic Sensors and Actuators

## Quick Reference
- `sensor` : Converts physical quantity to electrical signal // Input to MCU — temperature, light, distance
- `actuator` : Converts electrical signal to physical action // Output from MCU — motor, LED, buzzer, relay
- `analog sensor` : Continuous voltage output // Potentiometer, LDR, MQ gas — read with analogRead()
- `digital sensor` : Discrete signal or protocol // DHT-11, ultrasonic, IR — digitalRead() or library
- `relay` : Electrically-controlled switch // Controls high-power devices (motors, lights) from low-power MCU
- `PWM` : Pulse Width Modulation // Simulates analog output — LED dimming, motor speed control
- `pull-up/pull-down` : Resistor to define default state // Prevents floating pin reads

## Functional Logic
- **Arduino connection:** [[Arduino Fundamentals]] // Sensors → analog/digital input pins. Actuators → digital output (+ PWM)
- **Communication:** [[Serial Communication Protocols]] // Complex sensors use I2C/SPI; simple ones use analog or digital pins
- **Analog range:** 0-5V maps to 0-1023 (10-bit ADC). Voltage dividers for sensors that vary resistance
- **Power budgets:** Arduino 5V pin: ~500mA total. High-draw components (motors, many LEDs) need external power
- **Relay safety:** Relays isolate MCU from high voltage — never connect mains voltage directly to Arduino pins
- **Debouncing:** Mechanical switches bounce — use capacitor or software debounce (50ms delay)
- **Automation:** [[Workflow Orchestration]] // Sensor → MCU → decision → actuator is a physical automation loop

## Implementation
```cpp
// DHT-11 Temperature & Humidity Sensor (digital, single-wire protocol)
#include <DHT.h>
#define DHT_PIN 7
DHT dht(DHT_PIN, DHT11);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();  // Celsius
  float hum = dht.readHumidity();
  if (!isnan(temp)) {
    Serial.print("Temp: "); Serial.print(temp);
    Serial.print("°C  Humidity: "); Serial.print(hum);
    Serial.println("%");
  }
  delay(2000);  // DHT-11 minimum 2s between reads
}
```

```cpp
// Ultrasonic Distance Sensor (HC-SR04)
const int TRIG = 9, ECHO = 10;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  Serial.begin(9600);
}

float getDistanceCm() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long duration = pulseIn(ECHO, HIGH, 30000);  // Timeout 30ms
  return duration * 0.0343 / 2;  // Speed of sound / 2 (round trip)
}

void loop() {
  float dist = getDistanceCm();
  Serial.print("Distance: "); Serial.print(dist); Serial.println(" cm");
  delay(100);
}
```

```cpp
// Servo Motor Control (PWM)
#include <Servo.h>
Servo myServo;

void setup() {
  myServo.attach(9);  // PWM pin
}

void loop() {
  for (int angle = 0; angle <= 180; angle += 10) {
    myServo.write(angle);
    delay(100);
  }
  for (int angle = 180; angle >= 0; angle -= 10) {
    myServo.write(angle);
    delay(100);
  }
}
```

```cpp
// Relay Control (digital output — controls external power)
const int RELAY_PIN = 8;
const int TEMP_THRESHOLD = 28;  // Celsius

void loop() {
  float temp = dht.readTemperature();
  if (temp > TEMP_THRESHOLD) {
    digitalWrite(RELAY_PIN, HIGH);  // Fan ON
    Serial.println("Fan ON — temp above threshold");
  } else {
    digitalWrite(RELAY_PIN, LOW);   // Fan OFF
  }
  delay(5000);
}
```

## Sandbox
- Build an ambient light monitor: LDR (analog) → Serial plot brightness over time
- Wire a buzzer and button: press button → play a tone, release → stop
- Create a parking sensor: ultrasonic measures distance, buzzer frequency increases as object approaches
- Log DHT-11 readings to SD card (SPI) with timestamps — create a 24-hour temperature profile
