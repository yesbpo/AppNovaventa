import React, { useState } from 'react';
import Layout from '../components/Layout';
import 'tailwindcss/tailwind.css';
import { Checkbox } from '@mui/material';
import { useRouter } from 'next/router';
const MessageComponent = () => {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [mensajes, setMensajes] = useState([]);

    const handleInputChange = (event) => {
        setMessage(event.target.value);
    };
    const deleteMessage = (index) => {
        const newMensajes = mensajes.filter((_, i) => i !== index);
        setMensajes(newMensajes);
    }
    const saveMessage = () => {
        // Save the message to be used later
        // You can use localStorage, a database, or any other storage mechanism
        // For simplicity, let's just log the message to the console
        console.log('Message saved:', message);
        setMensajes([...mensajes, message]);
    };

    function signin() {
        router.push('/auth/login');
        }
if (localStorage.getItem('token')){
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center h-screen">
                <input
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4"
                />
                <button
                    onClick={saveMessage}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Guardar
                </button>
                <div>
                    <h2 className="text-xl font-bold mt-8">Respuestas fuera de horario</h2>
                    <ul className="list-disc pl-8">
                        {mensajes.map((mensaje, index) => (
                            <li key={index} className="mt-2">{mensaje}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Layout>
    ); }
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <p className="mb-4">Not signed in</p>
            <button
                onClick={() => signin()}
                className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
            >
                Sign in
            </button>
        </div>
    );
};

export default MessageComponent;