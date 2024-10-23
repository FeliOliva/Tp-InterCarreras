import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataComponent = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [estado, setEstado] = useState('Estado normal'); // Valor inicial

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/estado');
            setData(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching the data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (data) {
            switch (data.estado) {
                case 1:
                    setEstado('El personaje tiene hambre');
                    break;
                case 2:
                    setEstado('El personaje necesita agua');
                    break;
                case 3:
                    setEstado('El personaje está aburrido');
                    break;
                case 4:
                    setEstado('El personaje está sofocado por la temperatura');
                    break;
                case 5:
                    setEstado('El personaje tiene sueño');
                    break;
                case 6:
                    setEstado('El personaje está incómodo por la humedad');
                    break;
                case 7:
                    setEstado('El personaje esta lleno')
                    break;
                case 8:
                    setEstado('El personaje ha muerto')
                    break;
                case 9:
                    setEstado('El personaje ha revivido')
                    break;
                case 0:
                default:
                    setEstado('Estado normal');
                    break;
            }
        }
    }, [data]); // Escucha los cambios en `data`

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!data) {
        return <p>No data available</p>;
    }

    return (
        <div>
            <h1>Estado del personaje</h1>
            <ul>
                <li>Puntos de vida: {data.puntosVida}</li>
                <li>Cantidad de agua: {data.waterAmount}</li>
                <li>Cantidad de comida: {data.foodAmount}</li>
                <li>Felicidad: {data.happyAmount}</li>
                <li>Temperatura: {data.temperature}</li>
                <li>Humedad: {data.humidity}</li>
                <li>Luz: {data.light}</li>
                <li>Estado: {estado}</li> {/* Muestra el estado mapeado */}
            </ul>
        </div>
    );
};

export default DataComponent;
