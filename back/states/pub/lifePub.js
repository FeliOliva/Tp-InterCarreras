require("dotenv").config();
const mqtt = require("mqtt");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
const port = process.env.PORT || 3001;

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
const revivirTopic = "revivir";

let puntosVida = 3;
let waterAmount = 100;
let foodAmount = 100;
let happyAmount = 53;
let temperature;
let humidity;
let light;
let personajeVivo = true;
let estado = 0;
let vidaInterval = null;

const maxVida = 100;
const umbralHambre = 40;
const umbralSed = 60;
const umbralFelicidad = 50;
const umbralCalor = 24;
const umbralSuenio = 300;
const umbralHumedad = 80;

let currentState = {
  puntosVida,
  waterAmount,
  foodAmount,
  happyAmount,
  temperature,
  humidity,
  light,
};

let processing = false; // Bloqueo para evitar procesamiento simultáneo

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
  client.subscribe(revivirTopic, () =>
    console.log(`Suscrito al tópico ${revivirTopic}`)
  );

  vidaInterval = setInterval(() => {
    if (personajeVivo && !processing) {
      descontarVidaYSustancias();
    }
  }, 5000);
});

client.on("message", (topic, message) => {
  const parsedMessage = JSON.parse(message.toString());

  if (topic === necesidadesTopic && personajeVivo && !processing) {
    const { foodAmount: newFood, waterAmount: newWater } = parsedMessage;
    if (newFood !== foodAmount || newWater !== waterAmount) {
      let incrementoVida = calcularIncremento(newFood, newWater);
      puntosVida = Math.min(puntosVida + incrementoVida, maxVida);

      foodAmount = Math.min(foodAmount + newFood, 100);
      waterAmount = Math.min(waterAmount + newWater, 100);

      verificarYPublicarEstado();
    }
  }

  if (topic === happyTopic && personajeVivo && !processing) {
    const { happyValue } = parsedMessage;
    if (happyValue !== happyAmount) {
      happyAmount = Math.min(happyAmount + happyValue, 100);
      verificarYPublicarEstado();
    }
  }

  if (topic === dataTopic && personajeVivo && !processing) {
    const { humidity: newHumidity, light: newLight, temperature: newTemperature } = parsedMessage;

    if (newHumidity !== humidity || newLight !== light || newTemperature !== temperature) {
      humidity = newHumidity || 0;
      light = newLight || 0;
      temperature = newTemperature || 0;

      verificarYPublicarEstado();
    }
  }

  if (topic === revivirTopic && !personajeVivo && estado === 8) {
    const { vida } = parsedMessage;
    foodAmount = 50;
    waterAmount = 50;
    puntosVida = Math.min(vida, maxVida);
    personajeVivo = true;
    estado = 9;

    client.publish(lifeTopic, JSON.stringify({ estado }));
    iniciarDescuentoDeVida();
    verificarYPublicarEstado();
  }
});

function iniciarDescuentoDeVida() {
  if (vidaInterval) {
    clearInterval(vidaInterval);
  }
  vidaInterval = setInterval(() => {
    if (personajeVivo && !processing) {
      descontarVidaYSustancias();
    }
  }, 5000);
}

function calcularIncremento(food, water) {
  return food * 0.6 + water * 0.3;
}

function descontarVidaYSustancias() {
  processing = true; // Bloquear durante el proceso
  if (puntosVida > 0) {
    puntosVida--;
    foodAmount = Math.max(foodAmount - 1, 0);
    waterAmount = Math.max(waterAmount - 1, 0);
    happyAmount = Math.max(happyAmount - 1, 0);
    verificarYPublicarEstado();
  } else {
    personajeVivo = false;
    console.log("El personaje ha muerto.");
    estado = 8;
    client.publish(lifeTopic, JSON.stringify({ estado }));
    verificarYPublicarEstado();
  }
  processing = false; // Liberar al finalizar
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

  let estados = [];
  if (foodAmount < umbralHambre) {
    estados.push(1); // Hambre urgente
  }
  if (waterAmount < umbralSed) {
    estados.push(2); // Necesita agua
  }
  if (happyAmount < umbralFelicidad) {
    estados.push(3); // Está aburrido
  }
  if (temperature > umbralCalor) {
    estados.push(4); // Está sofocado por calor
  }
  if (light < umbralSuenio) {
    estados.push(5); // Tiene sueño por baja iluminación
  }
  if (humidity > umbralHumedad) {
    estados.push(6); // Incómodo por humedad alta
  }
  if (foodAmount >= 99) {
    estados.push(7); // Está lleno
  }

  if (estados.length > 0 && estado !== 8) {
    estado = Math.min(...estados); // Asignar el estado más crítico si no está muerto
  }

  // Determinar el estado más crítico
  let nuevoEstado = estado;
  if (estados.length > 0 && estado !== 8) {
    nuevoEstado = Math.min(...estados);
  } else if (puntosVida === 0) {
    nuevoEstado = 8; // Personaje muerto
  }

  // Si el estado ha cambiado, lo publicamos
  if (nuevoEstado !== estado) {
    estado = nuevoEstado;
    client.publish(lifeTopic, JSON.stringify({ estado }));
    console.log("Estado actualizado a:", estado);
  }
  
  // Publicar los datos actualizados
  client.publish(lifeTopic, JSON.stringify(currentState));
}

app.get("/estado", (req, res) => {
  res.json(currentState);
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});

client.on("error", (error) => {
  console.error("Connection error: ", error);
});
