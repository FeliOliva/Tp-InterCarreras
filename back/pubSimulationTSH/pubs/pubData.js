// Cargar variables de entorno desde el archivo .env
require("dotenv").config();

const mqtt = require("mqtt");

// Cambia esto con la URL, puerto, nombre de usuario y contraseña correctos
const client = mqtt.connect({
  host: process.env.HOST,
  port: 8883,
  protocol: "mqtts", // mqtts para conexiones seguras
  username: process.env.USUARIO, // Reemplaza con el usuario correcto
  password: process.env.PASSWORD, // Reemplaza con la contraseña correcta
  rejectUnauthorized: false,
});

const topic = "Data"; // Tópico en el que se publica
const simulatedData = {
  humidity: 60,
  light: 300,
  temperature: 25,
};

client.on("connect", () => {
  console.log("Publisher connected to broker.");
  setInterval(() => {
    const message = JSON.stringify(simulatedData);
    client.publish(topic, message, () => {
      console.log(`Message sent: ${message}%`);
    });

    // Simulamos cambios en los datos
    simulatedData.humidity += Math.round(Math.random() * 2 - 1);
    simulatedData.light += Math.round(Math.random() * 100 - 50);
    simulatedData.temperature += Math.round(Math.random() * 2 - 2);
  }, 5000);
});

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
