// Cargar variables de entorno desde el archivo .env
require("dotenv").config();

const express = require("express");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json()); // Para parsear JSON en el cuerpo de las solicitudes

// Acceder a las variables de entorno
const usuario = process.env.USUARIO;
const password = process.env.PASSWORD;

// Configurar el cliente MQTT
const client = mqtt.connect({
  host: "aa6aebc1bcd64e19a125b232dfb27ad1.s1.eu.hivemq.cloud", // Cambia con tu broker MQTT en la nube
  port: 8883,
  protocol: "mqtts",
  username: usuario,
  password: password,
  rejectUnauthorized: false,
});

const topic = "happy"; // Cambia este tópico según sea necesario

// Cuando el cliente MQTT se conecta
client.on("connect", () => {
  console.log("Publisher connected to broker.");
});

// Definir la ruta para el POST
app.post("/publish", (req, res) => {
  const { happyValue } = req.body;

  if (!happyValue === undefined) {
    return res.status(400).send("No se enviaron datos para publicar.");
  }

  const message = JSON.stringify({ happyValue });

  // Publicar el mensaje en el tópico de MQTT
  client.publish(topic, message, (err) => {
    if (err) {
      console.error("Error al publicar el mensaje:", err);
      return res
        .status(500)
        .send("Error al publicar el mensaje en el broker MQTT.");
    }

    console.log(`Datos publicados: ${message}`);
    res.status(200).send(`Datos publicados en el tópico ${topic}: ${message}`);
  });
});

// Manejar errores de conexión MQTT
client.on("error", (error) => {
  console.error("Connection error: ", error);
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API REST ejecutándose en http://localhost:${PORT}`);
});
