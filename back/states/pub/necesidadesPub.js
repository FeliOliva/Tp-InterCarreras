// Cargar variables de entorno desde el archivo .env
require("dotenv").config();

const express = require("express");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Para parsear JSON en el cuerpo de las solicitudes

// Configurar el cliente MQTT
const client = mqtt.connect({
  host: process.env.HOST, // Cambia con tu broker MQTT en la nube
  port: 8883,
  protocol: "mqtts",
  username: process.env.USUARIO,
  password: process.env.PASSWORD,
  rejectUnauthorized: false,
});

const topic = "necesidades"; // Cambia este tópico a "necesidades"

// Cuando el cliente MQTT se conecta
client.on("connect", () => {
  console.log("Publisher de necesidades conectado al broker.");
});

// Definir la ruta para el POST
app.post("/necesidades/publish", (req, res) => {
  const { foodAmount, waterAmount } = req.body;

  if (
    foodAmount === undefined ||
    waterAmount === undefined
  ) {
    return res
      .status(400)
      .send("No se enviaron datos de comida para publicar.");
  }

  const message = JSON.stringify({ foodAmount, waterAmount });

  // Publicar el mensaje en el tópico de MQTT
  client.publish(topic, message, (err) => {
    if (err) {
      console.error("Error al publicar el mensaje:", err);
      return res
        .status(500)
        .send("Error al publicar el mensaje en el broker MQTT.");
    }

    console.log(`Datos de necesidades publicados: ${message}`);
    res
      .status(200)
      .send(
        `Datos de necesidades publicados en el tópico ${topic}: ${message}`
      );
  });
});

// Manejar errores de conexión MQTT
client.on("error", (error) => {
  console.error("Connection error: ", error);
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor API REST ejecutándose en http://localhost:${PORT}`);
});
