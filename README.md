# rgb-streetlight-iot-platform
Here is a clean **README.md** you can copy and paste:

# Adaptive RGB Smart Street Lighting System

An IoT-based smart lighting pilot for a **private campus road or private roadway**, built using **two ESP32 lamp nodes**, **MQTT communication**, a **Node.js backend**, a **React dashboard**, and **OpenStack cloud hosting**.

The system is designed to improve **visibility, safety, and energy efficiency** by adapting light behavior based on **ambient light** and **motion detection**. Each lamp node acts as an edge device that makes local decisions in real time, while the backend provides centralized monitoring, control, logging, and visualization.

---

## Project Overview

This project implements an **Adaptive RGB Smart Street Lighting and Environmental Indication System** using two intelligent lamp-post nodes.

Each node:
- reads an **ambient light sensor**
- reads a **motion sensor**
- controls an **RGB LED light**
- runs a local **state machine**
- communicates with the backend using **MQTT**

The system supports:
- automatic **day/night detection**
- **motion-based adaptive brightness**
- **RGB color indication** for environmental or system states
- **remote monitoring and control**
- **cloud-based data storage and dashboard visualization**

This project is designed as a **private campus/private-road pilot**, but the same architecture can be scaled into a larger smart lighting network.

---

## Main Features

- **Day/Night Detection**
  - Lamp turns off during the day
  - Lamp enters standby mode at night

- **Motion-Based Adaptive Lighting**
  - Lamp increases brightness when motion is detected
  - Can be extended to coordinate with nearby lamp nodes

- **RGB Environmental / Status Indication**
  - **Blue**: Night standby mode
  - **Yellow**: Motion/activity detected
  - **Green**: Normal stable operation
  - **Red**: Fault / emergency / manual override

- **MQTT-Based Communication**
  - ESP32 nodes publish telemetry and state updates
  - Backend sends commands to nodes

- **Cloud Monitoring Dashboard**
  - Live device state
  - Sensor readings
  - RGB meaning
  - Brightness level
  - Alert history
  - Manual control

---

## System Architecture

```text
ESP32 Node 1        ESP32 Node 2
   |                    |
   |---- MQTT ----------|
            |
        Mosquitto Broker
            |
        Node.js Backend
            |
       PostgreSQL Database
            |
       React Dashboard
            |
         OpenStack VM
```

### Edge Layer

Each ESP32 node performs:

* sensor reading
* local decision-making
* RGB output control
* state transitions
* MQTT publishing/subscribing

### Cloud Layer

The cloud/backend layer performs:

* telemetry ingestion
* state tracking
* data storage
* alert logging
* dashboard APIs
* live monitoring
* remote command dispatch

---

## Tech Stack

### Hardware / Edge

* **ESP32**
* Ambient light sensor
* Motion sensor
* RGB LED / RGB lamp output

### Communication

* **MQTT**
* **Mosquitto** broker

### Backend

* **Node.js**
* Express.js or NestJS
* WebSocket / Socket.IO

### Database

* **PostgreSQL**

### Frontend

* **React**
* **Vite**

### Cloud / Deployment

* **OpenStack**
* Docker / Docker Compose

### Project Management / Dev Workflow

* **GitHub**
* GitHub Issues
* GitHub Projects
* Pull Requests

---

## Node Operating States

Each lamp node follows a local state machine:

* `DAY_OFF`
* `NIGHT_STANDBY`
* `MOTION_ACTIVE`
* `MANUAL_OVERRIDE`
* `FAULT`

This allows the system to make immediate decisions locally without waiting for cloud commands.

---

## MQTT Topics

Example topic structure:

* `streetlight/node1/telemetry`
* `streetlight/node1/state`
* `streetlight/node1/cmd`
* `streetlight/node2/telemetry`
* `streetlight/node2/state`
* `streetlight/node2/cmd`

### Example Telemetry Payload

```json
{
  "node_id": "node1",
  "lux": 120,
  "motion": true,
  "mode": "MOTION_ACTIVE",
  "brightness": 100,
  "rgb_color": "yellow",
  "timestamp": "2026-03-15T19:30:00Z"
}
```

---

## Project Objectives

* Build a working **2-node IoT smart lighting prototype**
* Demonstrate **edge computing** through local node logic
* Use **MQTT** as the main application-layer communication protocol
* Provide **descriptive data analysis and visualization** through a dashboard
* Deploy the backend system on a **cloud environment**
* Evaluate performance such as:

  * event latency
  * command response time
  * MQTT reliability and overhead

---

## Repository Structure

```text
adaptive-rgb-smart-street-lighting-system/
│
├── firmware/
│   ├── node1/
│   └── node2/
│
├── backend/
├── frontend/
├── infra/
├── docs/
├── diagrams/
├── tests/
│
├── docker-compose.yml
├── README.md
└── .github/
```

---

## Team Roles

### Person 1 – Full-Stack / Communication Lead

Responsible for:

* Node.js backend
* PostgreSQL database
* React dashboard
* MQTT integration
* APIs and WebSocket updates
* telemetry storage and visualization
* software documentation
* GitHub workflow and organization

### Person 2 – Embedded Systems / Edge-Cloud Integration Lead

Responsible for:

* ESP32 firmware
* sensor integration
* RGB LED control
* local state machine
* hardware wiring and calibration
* OpenStack deployment support
* hardware and cloud documentation

### Shared Responsibilities

* project ideation
* requirements engineering
* architecture design
* UML diagrams
* integration testing
* performance evaluation
* final report
* final demo

---

## Documentation

Project documentation will include:

* problem statement
* requirements specification
* system architecture
* UML diagrams
* MQTT topic and payload definitions
* database design
* API specification
* deployment guide
* user manual
* test plan
* performance evaluation

---

## How to Run the Project

### 1. Start Infrastructure

* Start Mosquitto broker
* Start PostgreSQL
* Start backend
* Start frontend

### 2. Flash ESP32 Nodes

* Upload firmware to Node 1 and Node 2
* Configure Wi-Fi credentials and MQTT broker address

### 3. Open Dashboard

* View live telemetry
* Monitor node states
* Send manual override commands

> Detailed setup instructions will be added in `/docs/10-deployment-guide.md`.

---

## Future Enhancements

* coordination between multiple lamp nodes
* fault detection using current sensing
* scheduling and policy-based control
* analytics dashboard improvements
* authentication and role-based access
* mobile-friendly dashboard
* expansion to larger campus road networks

---

## Why This Project Matters

This project combines:

* embedded systems
* IoT networking
* edge/cloud computing
* backend development
* frontend development
* database design
* deployment
* documentation

It is not just a sensor demo; it is a complete **cyber-physical IoT system** that can scale from a two-node pilot into a larger smart lighting platform.
