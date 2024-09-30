const mqtt = require("mqtt");

// Conecta al broker MQTT en la nube de HiveMQ con TLS
const client = mqtt.connect(
  "mqtt://aa6aebc1bcd64e19a125b232dfb27ad1.s1.eu.hivemq.cloud",
  {
    port: 8883,
    username: "felipe", // Asegúrate de usar tu nombre de usuario correcto
    password: "154254693Feli", // Asegúrate de usar tu contraseña correcta
    rejectUnauthorized: false, // Para evitar errores de certificado si usas el plan gratuito
  }
);

const topic = "arduino/data";

client.on("connect", () => {
  console.log("Subscriber connected to cloud broker on HiveMQ.");
  client.subscribe(topic, () => {
    console.log(`Subscribed to topic "${topic}"`);
  });
});

client.on("message", (topic, message) => {
  console.log(`Received message: "${message.toString()}" on topic "${topic}"`);
});

client.on("error", (error) => {
  console.error(`Error: ${error}`);
});
