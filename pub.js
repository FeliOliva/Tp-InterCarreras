// pub.js
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost"); // Conecta al broker Mosquitto

const topic = "temperatura"; // Nuevo tópico para temperatura
let temperature = 20; // Valor inicial de la temperatura

// Cuando el cliente se conecte
client.on("connect", () => {
  console.log(
    `Publisher connected to broker with client ID: ${client.options.clientId}`
  );

  // Publica un mensaje de temperatura cada 5 segundos
  setInterval(() => {
    temperature += Math.random() * 2 - 1; // Simula cambios en la temperatura
    const message = `Temperatura actual: ${temperature.toFixed(2)} °C`;
    client.publish(topic, message, () => {
      console.log(`Message "${message}" sent to topic "${topic}"`);
    });
  }, 5000); // Publica cada 5 segundos
});
