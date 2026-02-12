# Projeto de Monitoramento com ESP32-CAM e Firebase

## Ferramentas Utilizadas

Inicialmente, foram definidas as seguintes ferramentas para o desenvolvimento do projeto:

- Placa **ESP32-CAM**
- Sensor de movimento **PIR HC-SR501**
- Câmera **OV2640**
- Fios conectores (jumpers e cabo USB)
- Conversor **FTDI**

## Backend e Banco de Dados

Como banco de dados e backend, será utilizado o **Firebase**, por meio do **Cloud Functions**, que se conecta aos dispositivos via API desenvolvida em **Node.js** (JavaScript ou TypeScript), linguagem nativa da plataforma.

O Firebase permite integração direta com os seguintes serviços:

- **Firestore** — armazenamento dos dados coletados pelo sensor
- **Firebase Storage** — armazenamento das imagens capturadas pela câmera

## Plataforma de Simulação

Será utilizada a plataforma **Wokwi**, que possibilita a simulação e o desenvolvimento de soluções voltadas à Internet das Coisas (IoT).

---

## Comunicação ESP32 → API

### JSON enviado pelo ESP32

```json
{
  "deviceId": "esp32_001",
  "motionDetected": true,
  "event": "motion_detected",
  "timestamp": "2026-02-11T14:30:00Z"
}
### JSON armazenado no Firestore
{
  "deviceId": "esp32_001",
  "motionDetected": true,
  "imageUrl": "https://storage.googleapis.com/...",
  "createdAt": "2026-02-11T14:30:00Z"
}

### Arquitetura Edge Computing
Sensor PIR detecta movimento
        ↓
ESP32 inicia captura
        ↓
Captura 10 imagens
        ↓
Compara tamanho (fb->len)
        ↓
Seleciona a menor imagem
        ↓
Descarta as demais
        ↓
Envia somente 1 imagem para a API
