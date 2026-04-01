---
category: Tools
tags: [serial, uart, i2c, spi, communication, protocols, arduino, embedded]
title: Serial Communication Protocols
created: 2026-03-31
type: cheatsheet
difficulty: 5
exercise_hints:
  recall: "Name the 3 common serial protocols (UART, I2C, SPI) and their pin requirements"
  understanding: "When should you choose I2C over SPI? What are the trade-offs in speed, complexity, and addressing?"
  application: "Connect an I2C LCD display to an Arduino Mega and display sensor readings from a UART-connected module"
---

# Serial Communication Protocols

## Quick Reference
- `UART` : Universal Async Receiver/Transmitter // TX/RX pair, point-to-point, no clock line
- `I2C` : Inter-Integrated Circuit // SDA + SCL (2 wires), multi-device bus, addressed
- `SPI` : Serial Peripheral Interface // MOSI/MISO/SCK/CS, fast, full-duplex, one CS per device
- `baud rate` : Symbols per second // UART: 9600, 115200 common. Both sides must agree.
- `address` : I2C device identifier // 7-bit (0x00-0x7F), each device has unique address
- `pull-up` : Required for I2C // SDA and SCL need pull-up resistors (often built into breakout boards)
- `CS/SS` : Chip Select (SPI) // LOW = selected device, one GPIO per peripheral
- `TTL` : Transistor-Transistor Logic // 0V/5V or 0V/3.3V signal levels — NOT RS-232 ±12V

## Functional Logic
- **UART:** Simplest — 2 wires, no clock, async. Good for: debug serial, GPS, Bluetooth modules
- **I2C:** 2 wires + addresses = many devices on one bus. Good for: sensors, displays, EEPROMs
- **SPI:** 4+ wires, fastest, full-duplex. Good for: SD cards, TFT displays, high-speed ADCs
- **Arduino Mega I2C:** SDA=pin 20, SCL=pin 21. Multiple hardware serial ports (Serial, Serial1, Serial2, Serial3)
- **Logic levels:** [[Arduino Fundamentals]] // 5V Arduino ↔ 3.3V sensor needs level shifter or voltage divider
- **Linux side:** [[Linux CLI Essentials]] // `/dev/ttyACM0` or `/dev/ttyUSB0` for serial. `screen /dev/ttyACM0 9600`
- **Python bridge:** [[Task Automation with Python]] // `pyserial` for reading/writing serial from Python scripts

## Implementation
```cpp
// UART — Serial communication (Arduino Mega has 4 hardware serial ports)
void setup() {
  Serial.begin(9600);     // USB serial (debug)
  Serial1.begin(115200);  // Hardware serial on pins 18(TX1)/19(RX1)
}

void loop() {
  // Forward data between USB and Serial1
  if (Serial1.available()) {
    String data = Serial1.readStringUntil('\n');
    Serial.println("Received: " + data);
  }
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    Serial1.println(cmd);
  }
}
```

```cpp
// I2C — Reading a sensor (e.g., BMP180 barometer)
#include <Wire.h>

#define BMP180_ADDR 0x77  // Default I2C address

void setup() {
  Serial.begin(9600);
  Wire.begin();  // Join I2C bus as controller

  // Check if device is present
  Wire.beginTransmission(BMP180_ADDR);
  if (Wire.endTransmission() == 0) {
    Serial.println("BMP180 found at 0x77");
  } else {
    Serial.println("BMP180 not found!");
  }
}

// I2C Scanner — find all devices on the bus
void scanI2C() {
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("Device at 0x");
      Serial.println(addr, HEX);
    }
  }
}
```

```cpp
// SPI — Reading/writing (e.g., SD card, shift register)
#include <SPI.h>

const int CS_PIN = 53;  // Mega SS pin

void setup() {
  pinMode(CS_PIN, OUTPUT);
  digitalWrite(CS_PIN, HIGH);  // Deselect
  SPI.begin();
  SPI.setClockDivider(SPI_CLOCK_DIV4);  // 4 MHz
}

byte spiTransfer(byte data) {
  digitalWrite(CS_PIN, LOW);   // Select device
  byte result = SPI.transfer(data);
  digitalWrite(CS_PIN, HIGH);  // Deselect
  return result;
}
```

```python
# Python — Read Arduino serial data via pyserial
import serial
import time

ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)
time.sleep(2)  # Wait for Arduino reset

while True:
    if ser.in_waiting:
        line = ser.readline().decode('utf-8').strip()
        print(f"Arduino says: {line}")

    # Send command to Arduino
    ser.write(b"READ_SENSOR\n")
    time.sleep(1)
```

## Sandbox
- Run an I2C scanner sketch on your Arduino Mega to discover connected devices
- Connect an LCD1602 via I2C and display "Hello" on line 1 and a counter on line 2
- Set up bidirectional UART between Arduino and Python — send commands, receive sensor data
- Compare I2C and SPI data transfer speeds with a logic analyzer or timing measurements
