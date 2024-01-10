import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Layout from '../components/Layout';
import { useSession, signIn } from 'next-auth/react';

function Reports() {
  const { data: session } = useSession();
  const [informes, setInformes] = useState([]);
  const [campaign, setCampaign] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const [tipoMensajes, setTipoMensajes] = useState('');
  const [datos, setDatos] = useState([]);
  const fetchData = async () => {
    try {
      // Construir la URL con los parámetros necesarios
      const url = `https://novaventa.appcenteryes.com/dbn/generar-informe?campaign=${campaign}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      
      // Realizar la solicitud GET al servidor
      const response = await fetch(url);
  
      // Verificar si la respuesta es exitosa (código 200)
      if (response.ok) {
        // Obtener la respuesta en formato JSON
        const data = await response.json();
        // Actualizar el estado con los informes obtenidos
        setInformes(data.informes);
  
        // Generar el informe Excel después de haber recibido los datos
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data.informes);
  
        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Informes');
  
        // Descargar el archivo Excel
        XLSX.writeFile(wb, 'informes.xlsx');
      } else {
        console.error('Error al obtener informes:', response.statusText);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };
  
  const generarReporte = async () => {
    try {
      if (!fechaInicio || !fechaFin) {
        console.error('Por favor, selecciona fechas de inicio y fin.');
        return;
      }
  
      const response = await fetch(`https://novaventa.appcenteryes.com/dbn/obtener-mensajes-por-fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
  
      const mensajes = await response.json();
  
      let mensajesFiltrados = [];
  
      if (tipoMensajes == 'entrantes') {
        mensajesFiltrados = mensajes.mensajes.filter((mensaje) => mensaje.type_comunication == 'message');
      } else if (tipoMensajes == 'salientes') {
        mensajesFiltrados = mensajes.mensajes.filter((mensaje) => mensaje.type_comunication == 'message-event');
      } else {
        mensajesFiltrados = mensajes.mensajes;
      }
  
      if (mensajesFiltrados.length > 0) {
        const datosFiltrados = mensajesFiltrados.map((mensaje) => ({
          fecha: mensaje.timestamp,
          mensaje: mensaje.content,
          destinatario: mensaje.number,
          tipo: mensaje.type_message,
          tipocomunicacion: mensaje.type_comunication,
          estado: mensaje.status,
          idMensaje: mensaje.idMessage,
        }));
  
        const ws = XLSX.utils.json_to_sheet(datosFiltrados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  
        XLSX.writeFile(wb, 'resportewhatsapp.xlsx');
      } else {
        console.log('No se encontraron mensajes en el rango de fechas y tipo especificados.');
      }
    } catch (error) {
      console.error('Error al generar el reporte:', error);
    }
  };
  
  return (
    <>
      {session ? (
        <Layout>
          <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-black p-8 bg-opacity-80">
            <h1 className="text-4xl font-bold mb-4">
              Generador de Reportes WhatsApp
            </h1>
            <label className="block mb-4">
              Fecha de Inicio:
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border rounded p-2 ml-2"
              />
            </label>
            <label className="block mb-4">
              Fecha de Fin:
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border rounded p-2 ml-2"
              />
            </label>
            <label className="block mb-4">
            </label>
            <label className="block mb-4">
              Tipo de Mensajes:
              <select
                value={tipoMensajes}
                onChange={(e) => setTipoMensajes(e.target.value)}
                className="border rounded p-2 ml-2"
              >
                <option value="ambos">Ambos</option>
                <option value="entrantes">Entrantes</option>
                <option value="salientes">Salientes</option>
              </select>
            </label>
            <button
              onClick={generarReporte}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Generar Reporte mensajeria
            </button>
            <form>
        <label>Campaña:</label>
        <input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)} />

        <label>Fecha de inicio:</label>
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />

        <label>Fecha de fin:</label>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />

        <button onClick={fetchData}>Generar Informe de campaña</button>
      </form>
          </div>
           {/* Formulario para ingresar los parámetros */}
     
        </Layout>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="mb-4">Not signed in</p>
          <button
            onClick={() => signIn()}
            className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
          >
            Sign in
          </button>
        </div>
      )}
    </>
  );
}

export default Reports;
