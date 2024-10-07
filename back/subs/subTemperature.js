// Cargar variables de entorno desde el archivo .env
require("dotenv").config();

const mqtt = require("mqtt");

// Acceder a las variables de entorno
const usuario = process.env.USUARIO;
const password = process.env.PASSWORD;

// Configurar la conexión al broker MQTT
const client = mqtt.connect({
  host: "aa6aebc1bcd64e19a125b232dfb27ad1.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts", // mqtts para conexiones seguras
  username: usuario, // Usuario obtenido del archivo .env
  password: password, // Contraseña obtenida del archivo .env
  rejectUnauthorized: false,
});

const topic = "temperatura"; // Asegúrate de usar el mismo tópico

client.on("connect", () => {
  console.log("Subscriber connected to broker.");
  client.subscribe(topic, () => {
    console.log(`Subscribed to topic "${topic}"`);
  });
});

client.on("message", (topic, message) => {
  if (topic === "temperatura") {
    if (message.toString() < 20) {
      console.log("hace frio qliao");
    } else {
      console.log("hace calor qliao");
    }
  }
});

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
