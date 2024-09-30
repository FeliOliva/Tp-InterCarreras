// Cargar variables de entorno desde el archivo .env
require("dotenv").config();

const mqtt = require("mqtt");

// Acceder a las variables de entorno
const usuario = process.env.USUARIO;
const password = process.env.PASSWORD;

// Cambia esto con la URL, puerto, nombre de usuario y contraseña correctos
const client = mqtt.connect({
  host: "aa6aebc1bcd64e19a125b232dfb27ad1.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts", // mqtts para conexiones seguras
  username: usuario, // Reemplaza con el usuario correcto
  password: password, // Reemplaza con la contraseña correcta
  rejectUnauthorized: false,
});

const topic = "arduino/data"; // Tópico en el que se publica
const simulatedData = {
  temperature: 25,
  humidity: 60,
};

client.on("connect", () => {
  console.log("Publisher connected to broker.");
  setInterval(() => {
    const message = JSON.stringify(simulatedData);
    client.publish(topic, message, () => {
      console.log(`Message sent: ${message}`);
    });

    // Simulamos cambios en los datos
    simulatedData.temperature += Math.random() * 2 - 1;
    simulatedData.humidity += Math.random() * 2 - 1;
  }, 5000);
});

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
