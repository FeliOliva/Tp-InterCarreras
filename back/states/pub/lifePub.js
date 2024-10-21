require("dotenv").config();
const mqtt = require("mqtt");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

const usuario = process.env.USUARIO;
const password = process.env.PASSWORD;
const host = process.env.HOST;

const client = mqtt.connect({
  host: host,
  port: 8883,
  protocol: "mqtts",
  username: usuario,
  password: password,
  rejectUnauthorized: false,
});

const lifeTopic = "life";
const necesidadesTopic = "necesidades";
const happyTopic = "happy";
const dataTopic = "data";

let puntosVida = 100;
let waterAmount = 100;
let foodAmount = 100;
let happyAmount = 53;
let temperature;
let humidity;
let light;
let personajeVivo = true;
let estado = 0;

const maxVida = 100;
const umbralHambre = 40;
const umbralSed = 60;
const umbralFelicidad = 50;
const umbralCalor = 24;
const umbralSuenio = 300;
const umbralHumedad = 80;

// Guarda el estado en un objeto para poder compartirlo mediante la API
let currentState = {
  puntosVida,
  waterAmount,
  foodAmount,
  happyAmount,
  temperature,
  humidity,
  light,
};

client.on("connect", () => {
  console.log("Publicador de vida conectado al broker.");
  client.subscribe(necesidadesTopic, () =>
    console.log(`Suscrito al tópico ${necesidadesTopic}`)
  );
  client.subscribe(happyTopic, () =>
    console.log(`Suscrito al tópico ${happyTopic}`)
  );
  client.subscribe(dataTopic, () =>
    console.log(`Suscrito al tópico ${dataTopic}`)
  );

  const vidaInterval = setInterval(() => {
    if (personajeVivo) {
      descontarVidaYSustancias();
    } else {
      clearInterval(vidaInterval);
    }
  }, 5000);
});

client.on("message", (topic, message) => {
  const parsedMessage = JSON.parse(message.toString());

  if (topic === necesidadesTopic && personajeVivo) {
    const { foodAmount: newFood, waterAmount: newWater } = parsedMessage;
    let incrementoVida = calcularIncremento(newFood, newWater);
    puntosVida = Math.min(puntosVida + incrementoVida, maxVida);

    foodAmount = Math.min(foodAmount + newFood, 100);
    waterAmount = Math.min(waterAmount + newWater, 100);

    verificarYPublicarEstado();
  }

  if (topic === happyTopic && personajeVivo) {
    const { happyValue } = parsedMessage;
    happyAmount = Math.min(happyAmount + happyValue, 100);
    verificarYPublicarEstado();
  }

  if (topic === dataTopic && personajeVivo) {
    ({ humidity, light, temperature } = parsedMessage);
    humidity = Math.min(humidity, 100);
    light = Math.min(light, 100);
    temperature = Math.min(temperature, 100);
    verificarYPublicarEstado();
  }
});

function calcularIncremento(food, water) {
  return food * 0.6 + water * 0.3;
}

function descontarVidaYSustancias() {
  if (puntosVida > 0) {
    puntosVida--;
    foodAmount = Math.max(foodAmount - 1, 0);
    waterAmount = Math.max(waterAmount - 1, 0);
    happyAmount = Math.max(happyAmount - 1, 0);
    verificarYPublicarEstado();
  } else {
    personajeVivo = false;
    client.publish(
      lifeTopic,
      JSON.stringify({ mensaje: "El personaje ha muerto", puntosVida: 0 })
    );
  }
}

function verificarYPublicarEstado() {
  currentState = {
    puntosVida: puntosVida || 0,
    waterAmount: waterAmount || 0,
    foodAmount: foodAmount || 0,
    happyAmount: happyAmount || 0,
    temperature: temperature || 0,
    humidity: humidity || 0,
    light: light || 0,
    estado,
  };

  let mensaje = "";
  let estados = [];

  // Publicar mensajes condicionales sin sobrescribir el estado directamente
  if (foodAmount < umbralHambre) {
    estados.push(1); // Hambre urgente
    mensaje += "El personaje tiene hambre urgente. ";
  }
  if (waterAmount < umbralSed) {
    estados.push(2); // Necesita agua
    mensaje += "El personaje necesita agua inmediatamente. ";
  }
  if (happyAmount < umbralFelicidad) {
    estados.push(3); // Está aburrido
    mensaje += "El personaje está aburrido y desmotivado. ";
  }
  if (temperature > umbralCalor) {
    estados.push(4); // Está sofocado por calor
    mensaje += `El personaje está sofocado por una temperatura de ${temperature}°C. `;
  }
  if (light < umbralSuenio) {
    estados.push(5); // Tiene sueño por baja iluminación
    mensaje += `El personaje tiene sueño debido a la baja iluminación (${light} lux). `;
  }
  if (humidity > umbralHumedad) {
    estados.push(6); // Incómodo por humedad alta
    mensaje += `El personaje está incómodo por la humedad alta (${humidity}%). `;
  }

  // Si hay algún estado crítico, actualiza el estado general y publica el mensaje
  if (estados.length > 0) {
    estado = Math.min(...estados); // Toma el estado más crítico (el más bajo numéricamente)
    client.publish(
      lifeTopic,
      JSON.stringify({
        puntosVida,
        waterAmount,
        foodAmount,
        happyAmount,
        estado,
        mensaje,
      })
    );
  }

  // Publicar siempre los datos actuales
  client.publish(
    lifeTopic,
    JSON.stringify({
      puntosVida: puntosVida || 0,
      waterAmount: waterAmount || 0,
      foodAmount: foodAmount || 0,
      happyAmount: happyAmount || 0,
      temperature: temperature || 0,
      humidity: humidity || 0,
      light: light || 0,
      estado,
    })
  );
}

// API para exponer los estados actualizados
app.get("/estado", (req, res) => {
  res.json(currentState);
});

// Servidor HTTP
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
