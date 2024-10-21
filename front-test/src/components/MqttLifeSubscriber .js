import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';

const MqttLifeSubscriber = () => {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('Conectando...');

    useEffect(() => {
        // Configuración del cliente MQTT
        const client = mqtt.connect({
            host: process.env.REACT_APP_MQTT_HOST, // Define estas variables en un .env o directamente aquí
            port: 8883,
            protocol: 'mqtts',
            username: process.env.REACT_APP_MQTT_USERNAME,
            password: process.env.REACT_APP_MQTT_PASSWORD,
            rejectUnauthorized: false,
        });

        // Conexión al broker
        client.on('connect', () => {
            console.log('Conectado al broker MQTT');
            setStatus('Conectado');

            // Suscribirse al tópico 'life'
            client.subscribe('life', (err) => {
                if (!err) {
                    console.log('Suscrito al tópico "life"');
                } else {
                    console.error('Error al suscribirse:', err);
                }
            });
        });

        // Manejar mensajes recibidos
        client.on('message', (topic, message) => {
            const parsedMessage = JSON.parse(message.toString());
            setMessages((prevMessages) => [
                ...prevMessages,
                parsedMessage,
            ]);
        });

        // Manejar errores
        client.on('error', (error) => {
            console.error('Error de conexión:', error);
            setStatus('Error en la conexión');
        });

        // Limpiar la conexión cuando el componente se desmonte
        return () => {
            client.end();
        };
    }, []);

    return (
        <div>
            <h1>Estado de conexión: {status}</h1>
            <h2>Mensajes recibidos:</h2>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>
                        <p>{msg.mensaje}</p>
                        <p>Puntos de Vida: {msg.puntosVida}</p>
                        <p>Nivel de Sed: {msg.waterAmount}</p>
                        <p>Nivel de Comida: {msg.foodAmount}</p>
                        <p>Nivel de Felicidad: {msg.happyAmount}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MqttLifeSubscriber;
