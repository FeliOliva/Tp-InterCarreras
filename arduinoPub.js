const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost"); // Conecta al broker Mosquitto

const topic = "arduino/data";
const simulatedData = {
  temperature: 25, // Simulando datos de temperatura
  humidity: 60, // Simulando datos de humedad
};

// Simulamos la conexión del "Arduino" al broker
client.on("connect", () => {
  console.log("Broker connected to MQTT broker.");

  // Simula el envío de datos desde el "Arduino" cada 5 segundos
  setInterval(() => {
    const message = JSON.stringify(simulatedData);
    client.publish(topic, message, () => {
      console.log(`Arduino data sent: ${message}`);
    });

    // Simular cambios en los datos
    simulatedData.temperature += Math.random() * 2 - 1; // Cambios aleatorios de temperatura
    simulatedData.humidity += Math.random() * 2 - 1; // Cambios aleatorios de humedad
  }, 5000); // Publica cada 5 segundos
});
