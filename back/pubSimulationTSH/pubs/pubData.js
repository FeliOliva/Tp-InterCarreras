require("dotenv").config();
const mqtt = require("mqtt");

const client = mqtt.connect({
  host: process.env.HOST,
  port: 8883,
  protocol: "mqtts",
  username: process.env.USUARIO,
  password: process.env.PASSWORD,
  rejectUnauthorized: false,
});

const topic = "data";
const umbralHumedad = 80;
const umbralLuz = 300;
const umbralTemperatura = 24;

const simulatedData = {
  humidity: umbralHumedad,  // Inicialmente cerca del umbral
  light: umbralLuz,         // Inicialmente cerca del umbral
  temperature: umbralTemperatura, // Inicialmente cerca del umbral
};

client.on("connect", () => {
  console.log("Publisher connected to broker.");

  setInterval(() => {
    // Simular variación controlada alrededor de los umbrales (±5%)
    simulatedData.humidity = Math.max(50, Math.min(100, umbralHumedad + Math.round(Math.random() * 10 - 5)));
    simulatedData.light = Math.max(200, Math.min(400, umbralLuz + Math.round(Math.random() * 50 - 25)));
    simulatedData.temperature = Math.max(18, Math.min(30, umbralTemperatura + Math.round(Math.random() * 4 - 2)));

    const message = JSON.stringify(simulatedData);
    client.publish(topic, message, () => {
      console.log(`Message sent: ${message}`);
    });
  }, 5000);
});

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
