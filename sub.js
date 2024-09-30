// sub.js
const express = require("express");
const mqtt = require("mqtt");

const app = express();
const client = mqtt.connect("mqtt://localhost"); // Conecta al broker Mosquitto

let subscribedTopic = null; // Tópico al que nos suscribimos

// Cuando el cliente se conecte al broker
client.on("connect", () => {
  console.log(
    `Subscriber connected to broker with client ID: ${client.options.clientId}`
  );
});

// Ruta para suscribirse a un tópico
app.get("/sub", (req, res) => {
  const { topic } = req.query; // Obtiene el tópico del query parameter

  if (!topic) {
    return res.status(400).send('El parámetro "topic" es requerido.');
  }

  // Si ya estamos suscritos a un tópico, primero nos desuscribimos
  if (subscribedTopic) {
    client.unsubscribe(subscribedTopic, (err) => {
      if (err) {
        console.error(`Error desuscribiéndose de ${subscribedTopic}:`, err);
      }
    });
  }

  // Nos suscribimos al nuevo tópico
  subscribedTopic = topic;
  client.subscribe(subscribedTopic, (err) => {
    if (err) {
      console.error(`Error al suscribirse a ${subscribedTopic}:`, err);
      return res.status(500).send("Error al suscribirse al tópico.");
    }

    res.send(`Suscrito al tópico: ${subscribedTopic}`);
  });
});

// Cuando se recibe un mensaje de cualquier tópico, se muestra en consola
client.on("message", (topic, message) => {
  console.log(`Received message: "${message.toString()}" on topic "${topic}"`);
});

// Inicia el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:${PORT}`);
});
