// Cargar variables de entorno desde el archivo .env
require("dotenv").config();

const mqtt = require("mqtt");

// Acceder a las variables de entorno
const usuario = process.env.USUARIO;
const password = process.env.PASSWORD;

// Conectar al broker de MQTT en la nube
const client = mqtt.connect({
  host: "aa6aebc1bcd64e19a125b232dfb27ad1.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts", // mqtts para conexiones seguras
  username: usuario,
  password: password,
  rejectUnauthorized: false, // Evitar el rechazo de certificados no autorizados
});

const topic = "luz"; // Tópico en el que se publican los datos

// Datos simulados que incluyen la luz
const simulatedData = {
  light: 300, // Simulamos valores de luz
};

// Cuando el cliente se conecta al broker
client.on("connect", () => {
  console.log("Publisher connected to broker.");

  // Publicar datos cada 5 segundos
  setInterval(() => {
    const message = JSON.stringify(simulatedData);
    client.publish(topic, message, () => {
      console.log(`Message sent: ${message} lm`);
    });
    simulatedData.light += Math.random() * 100 - 50; // Variación aleatoria de luz
  }, 5000);
});

// Manejar errores de conexión
client.on("error", (error) => {
  console.error("Connection error: ", error);
});
