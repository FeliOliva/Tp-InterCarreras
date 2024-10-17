// Cargar variables de entorno desde el archivo .env
require("dotenv").config();

const mqtt = require("mqtt");

// Configurar la conexión al broker MQTT
const client = mqtt.connect({
  host: process.env.HOST,
  port: 8883,
  protocol: "mqtts", // mqtts para conexiones seguras
  username: process.env.USUARIO, // Usuario obtenido del archivo .env
  password: process.env.PASSWORD, // Contraseña obtenida del archivo .env
  rejectUnauthorized: false,
});

const topic = "canal"; // Asegúrate de usar el mismo tópico

client.on("connect", () => {
  console.log("Subscriber connected to broker.");
  client.subscribe(topic, () => {
    console.log(`Subscribed to topic "${topic}"`);
  });
});

client.on("message", (topic, message) => {
  console.log(`Mensaje recibido en el tópico "${topic}":`);
  const msgString = message.toString();
  console.log(msgString); // Mostrar el mensaje como string

  // Si el mensaje es un JSON, intentamos parsearlo
  if (topic === "canal") {
    try {
      const data = JSON.parse(msgString); // Intentar parsear JSON
      console.log("Mensaje en formato JSON:", data);
    } catch (error) {
      console.error("Error al procesar el mensaje (no es JSON):", error);
    }
  }
});

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
