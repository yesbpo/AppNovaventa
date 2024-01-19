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
      let url = `${process.env.NEXT_PUBLIC_BASE_DB}/generar-informe`;
  
      // Agregar el parámetro de campaña si está definido
      if (campaign) {
        url += `?campaign=${campaign}`;
      } else {
        // Si la campaña no está especificada, agregar parámetros de fecha directamente
        url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        console.log('URL de la solicitud:', url);
      }
  
      // Realizar la solicitud GET al servidor
      const response = await fetch(url);
  
      // El resto del código sigue igual...
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
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_DB}/obtener-mensajes-por-fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
  
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
  const ObtenerConversaciones = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB + '/obtener-conversaciones');
  
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
  
      const { conversaciones } = await response.json();
  
      // Crear un libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ['id', 'idchat', 'asesor', 'conversacion', 'numero', 'calificacion', 'fecha_ingreso', 'fecha_ultimagestion', 'userid']
      ]);
  
      // Agregar filas para cada conversación
      conversaciones.forEach((conversacion) => {
        // Dividir la conversación en frases cuando se encuentra '['
        const frases = conversacion.conversacion.split('[');
  
        // Crear una fila para cada frase
        frases.forEach((frase, index) => {
          // Ignorar la primera frase si no hay '[' al principio
          if (index === 0 && !conversacion.conversacion.startsWith('[')) {
            // Agregar una nueva fila con los campos correspondientes y la primera frase
            XLSX.utils.sheet_add_aoa(ws, [
              [
                conversacion.id,
                conversacion.idchat,
                conversacion.asesor,
                conversacion.conversacion,
                conversacion.numero,
                conversacion.calificacion,
                conversacion.fecha_ingreso,
                conversacion.fecha_ultimagestion,
                conversacion.userid
              ]
            ]);
          } else if (index > 0) {
            // Agregar filas adicionales solo con la frase
            XLSX.utils.sheet_add_aoa(ws, [
              [
                '', // dejar los campos adicionales vacíos en las filas adicionales
                '',
                '',
                frase.trim(),
                '',
                '',
                '',
                '',
                ''
              ]
            ]);
          }
        });
      });
  
      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Conversaciones');
  
      // Crear un blob del archivo Excel
      XLSX.writeFile(wb, 'resporteconversaciones.xlsx');
  
      console.log('Informe Excel generado y descargado correctamente.');
    } catch (error) {
      console.error('Error durante la solicitud:', error.message);
    }
  };
  
  
  return (
    <>
      {session ? (
        <Layout>
          <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-black p-8 bg-opacity-80">
            <h1 className="text-4xl font-bold mb-4">
              Reportes Mensajeria WhatsApp
            </h1>
            <label className="block mb-4">
              Fecha de Inicio:
              <input
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border rounded p-2 ml-2"
              />
            </label>
            <label className="block mb-4">
              Fecha de Fin:
              <input
                type="datetime-local"
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
                <option value="ambos">Todos</option>
                <option value="entrantes">Entrantes</option>
                <option value="salientes">Salientes</option>
              </select>
            </label>
            <button
              onClick={generarReporte}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Generar reporte de mensajeria
            </button>
            <div>
            <h1 className="text-4xl font-bold mb-4">
              Reportes de campañas
            </h1>
        <label>Campaña:</label>
        <input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)} />

        <label>Fecha de inicio:</label>
        <input type="datetime-local" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />

        <label>Fecha de fin:</label>
        <input type="datetime-local" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />

        <button onClick={fetchData} >Generar reporte de envios masivos </button>
      </div>
      <div>
      <button onClick={ObtenerConversaciones}>Obtener Conversaciones</button>
    </div>
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
