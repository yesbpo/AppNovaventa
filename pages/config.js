import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import 'tailwindcss/tailwind.css';
import { Checkbox} from '@mui/material';
import { useRouter } from 'next/router';
import { Button } from 'reactstrap';

const MessageComponent = () => {
    const router = useRouter();
    
    const [mensajes, setMensajes] = useState([]);
    const [editMode, setEditMode] = useState(false); // Add state for edit mode
    const [idrespuesta, setIdrespuesta] = useState('');
    const [checked, setChecked] = useState(false);
    const [message, setMessage] = useState(mensajes[0]);
    const [horainicio, setHorainicio] = useState('');   
    const [horafinal, setHorafinal] = useState('');

    useEffect(() => {
        getData();
        if (!localStorage.getItem('token')) {
            router.push('/auth/login');
        }
    }, []);
    // consumir rura para crear un dato en la base de datos que tiene los campos horainicio y horafinal con el siguiente endpoint /crear-horario
    const createDataHour = async () => {
        console.log('Creating data:', message);
        try {
            console.log('Creating data:', message);
            const response = await fetch('http://localhost:3001/dbn/crear-horario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    horainicio: horainicio, // Reemplaza con el valor que deseas asignar
                    horafinal: horafinal,
                }),
            });
            if (response.ok) {
                console.log('Hours created successfully');
                setEditMode(false);
                
            } else {
                console.log('Failed to create data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // consumir ruta para obtener todos los datos de la base de datos con el siguiente endpoint /obtener-horario
    // consumir ruta para crear un dato en la base de datos que tiene los campos respuesta y estado con el siguiente endpoint /crear-respuestafueradehorario
    const createData = async () => {
        console.log('Creating data:', message);
        try {
            console.log('Creating data:', message);
            const response = await fetch('http://localhost:3001/dbn/crear-respuestafueradehorario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    respuesta: message, // Reemplaza con el valor que deseas asignar
                    estado: 'Inactivo',
                }),
            });
            if (response.ok) {
                console.log('Data created successfully');
                setEditMode(false);
                getData();
            } else {
                console.log('Failed to create data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // consumir ruta para obtener todos los datos de la base de datos con el siguiente endpoint /obtener-respuestafueradehorario
    const getData = async () => {
        try {
            const responseHorario = await fetch('http://localhost:3001/dbn/obtener-horario');
            const response = await fetch('http://localhost:3001/dbn/obtener-respuestafueradehorario');
            if (response.ok) {
                const data = await response.json();
                const dataHorario = await responseHorario.json();
                console.log('Data:', data[0].respuesta);
                setMensajes([data[0].respuesta]);
                setIdrespuesta(data[0].id);
                setChecked(data[0].estado === 'Activo');
                setHorainicio(dataHorario[0].HoraInicio);
                setHorafinal(dataHorario[0].HoraFinal);
                console.log('Data:', dataHorario[0].HoraInicio);
            } else {
                console.log('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // consumir ruta para actualizar un dato en la base de datos con el siguiente endpoint /actualizar-respuestafueradehorario teniendo en cuenta que se elimina por el id
    const updateData = async (estado) => {
        
        setChecked(!checked);
        try {
            console.log('Updating data:', idrespuesta, estado);
            const response = await fetch('http://localhost:3001/dbn/actualizar-respuestafueradehorario', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: idrespuesta,
                    estado: estado,
                }),
            });
            if (response.ok) {
                console.log('Data updated successfully');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleInputChange = (event) => {
        setMessage(event.target.value);
    };

    

    return (
        <Layout>
      <div className="flex flex-row">

{/* Primer div */}
<div className="flex flex-col items-center justify-center flex-1 mr-20 border border-gray-300 p-4">
  <h1 className="text-2xl font-bold mb-4">Respuestas fuera de horario</h1>
  <button onClick={() => setEditMode(true)} className="bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4">Editar</button>
  <input
    type="text"
    value={message}
    onChange={handleInputChange}
    className={`border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none ${editMode ? '' : 'pointer-events-none'}`}
  />
  <Checkbox   checked={checked} onChange={() => updateData(checked ? 'Inactivo' : 'Activo')} />
  <button
    onClick={createData}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
  >
    Guardar
  </button>
  <div>
    <h2 className="text-xl font-bold mt-8">Respuestas fuera de horario</h2>
    <ul className="list-disc pl-8">
      {mensajes.map((mensaje, index) => (
        <li key={index} className="mt-2">
          {mensaje}
        </li>
      ))}
    </ul>
  </div>
</div>

{/* Segundo div */}

<div className="flex flex-col items-center justify-center flex-1 mr-10 border border-gray-300 p-4">
  <h1 className="text-1xl font-bold mb-4">Horarios de atención</h1>
   
  <Button  onClick={() => setEditMode(true)} className="bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4">Editar</Button>
  <div className="space-y-4">
    <div>
      <h1 className="text-xl font-bold">Horario de inicio de jornada</h1>
      <input
        type="time"
        className={`border border-gray-300 rounded-md px-4 py-2 focus:outline-none ${editMode ? '' : 'pointer-events-none'}`}
        onChange={(e) => setHorainicio(e.target.value)}
      />
    </div>
    <div>
      <h1 className="text-xl font-bold">Horario de fin de jornada</h1>
      <input
        type="time"
        className={`border border-gray-300 rounded-md px-4 py-2 focus:outline-none ${editMode ? '' : 'pointer-events-none'}`}
        onChange={(e) => setHorafinal(e.target.value)}
      />
    </div>
  </div>
  <button
    onClick={createDataHour}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  >
    Guardar
  </button>
</div>
<div className="flex flex-col items-center justify-center flex-1 border border-gray-300 p-4">
  <h1 className="text-1xl font-bold mb-4">Respuesta chat Finalizados</h1>
  <button onClick={() => setEditMode(true)} className="bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4">respuestas fuera de horario</button>
  <button onClick={() => setEditMode(true)} className="bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4">Respuestas chats finalizados</button> 
  
  </div>



</div>
        
    
    </Layout>
        );
};

export default MessageComponent;
