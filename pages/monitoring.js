import Layout from '../components/Layout';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import { useSession, signIn } from 'next-auth/react';

const MonitoringPage = () => {
  
  useEffect(() => {
    // Lógica que se ejecutará después del montaje del componente
    updateuser();
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar el componente
const [statuschats, setStatuschats] = useState('')
const [asesores, setAsesores] = useState([]);
const [resultados, setResultados] = useState([]);
const [resultados1, setResultados1] = useState([]);
const [resultados2, setResultados2] = useState([]);
const [resultadost, setResultadost] = useState([]);
const [datosbuscados, setDatosbuscados] = useState('');
const [valorbuscado, setValorbuscado] = useState('');
useEffect(() => {
  const obtenerMensajes = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
      const responseChats = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-chats');

      if (!response.ok || !responseChats.ok) {
        throw new Error(`Error en la solicitud`);
      }

      const data = await response.json();
      const chats = await responseChats.json();

      const asesores = data.filter((d) => d.type_user === 'Asesor' ||  d.type_user === 'Asesor1' );
      setAsesores(asesores);
      console.log(asesores)
      const chatspendientes = chats.filter((valor) => valor.status === 'pending');
      const chatsengestion = chats.filter((valor) => valor.status === 'in process');
      const chatscerrados = chats.filter((valor) => valor.status === 'closed');
      const chatCerrado = chatscerrados.map((chat) => chat.userId);
      const chatGestion = chatsengestion.map((chat) => chat.userId);
      const chatsPendings = chats.map((chat) => chat.userId);
      setResultadost(chats)
      console.log(chatsPendings)
      // pendientes
      const frecuencias = {};
      chatsPendings.forEach((id) => {
        frecuencias[id] = (frecuencias[id] || 0) + 1;
      });

      const resultados = asesores.map((asesor) => ({
        asesor,
        frecuencia: frecuencias[asesor.id] || 0,
      }));

      setResultados(resultados);
      // en gestion
      const frecuencias1 = {};
      chatGestion.forEach((id) => {
        frecuencias1[id] = (frecuencias1[id] || 0) + 1;
      });
      const resultados1 = asesores.map((asesor) => ({
        asesor,
        frecuencia: frecuencias1[asesor.id] || 0,
      }));
      setResultados1(resultados1);
      // cerrados
      const frecuencias2 = chatscerrados.length

      const resultados2 = frecuencias2
      setResultados2(resultados2);
      
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      // Puedes manejar el error según tus necesidades
    }
  };

  obtenerMensajes();
}, []);
const { data: session } = useSession();
  const manejarPresionarEnter = (event) => {
    if (event.key === 'Enter') {
      enviarMensaje();
    }
  };

  const [emojis, setEmojis] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const handleAddEmoji = (emoji) => {
    setInputValue(`${inputValue} ${emoji}`);
    setEmojis([...emojis, emoji]);
    setShowEmojiPicker(false); // Ocultar el EmojiPicker después de seleccionar un emoji
  };
  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevShow) => !prevShow);
  };
  const [contactos2, setContactos2] = useState([]);

  const [contactos1, setContactos1] = useState([]);
  const [contactos, setContactos] = useState([
    { user: null, fecha: null, mensajes: [{ tipomensaje: '', datemessage: '', content: '' }] },
  ]);
  const [webhookData, setWebhookData] = useState(null);
  const [mensajes1, setMensajes1] = useState([]);
  const [mensajes2, setMensajes2] = useState([]);
  const handlePendientesClick = async (iduser) => {
    conection();
      try {   const fechaActual = new Date();
      const options = { timeZone: 'America/Bogota', hour12: false };
      const fechaInicio = new Date(fechaActual);
      fechaInicio.setHours(fechaInicio.getHours() - 24);
      
      // Formatear la fecha de inicio
      const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
      const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
      const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
      const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
      const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
      const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
      
      const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;
      
      // Formatear la fecha actual
      const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
      const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
      const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
      const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
      const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
      const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
      
      const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;
      
            const status = 'pending';
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/obtener-mensajes-por-fecha?fechaInicio=${fechaInicioString}&fechaFin=${fechaFinString}`);      
            const responseChats = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/consultar_por_status?status=${status}`);
      
      // El usuario está autenticado, puedes acceder a la sesión
      
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
      
      const Id = iduser
       
      const chatsPending = await responseChats.json();
      const withoutGest = chatsPending.filter(d => d.userId == Id )
      console.log(Id)
      const data = await response.json();
      setMensajes1(Object.values(data)[0]);
      setContactos1(withoutGest);
      setStatuschats('Pendientes');
      try {   const fechaActual = new Date();
        const options = { timeZone: 'America/Bogota', hour12: false };
              const fechaInicio = new Date(fechaActual);
        fechaInicio.setHours(fechaInicio.getHours() - 24);
        
        // Formatear la fecha de inicio
        const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
        const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
        const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
        const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
        const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
        const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
        
        const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;
        
        // Formatear la fecha actual
        const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
        const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
        const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
        const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
        const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
        const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
        
        const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;
        
        const status = 'in process';
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/obtener-mensajes-por-fecha?fechaInicio=${fechaInicioString}&fechaFin=${fechaFinString}`);
        const responseChats = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/consultar_por_status?status=${status}`);
       
        // El usuario está autenticado, puedes acceder a la sesión
        
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        
        const Id = iduser
        const chatsPending = await responseChats.json();
        const withoutGest = chatsPending.filter(d => d.userId == Id )
        console.log(Id)
        const data = await response.json();
        setMensajes2(Object.values(data)[0]);
        setContactos2(withoutGest);
      } catch (error) {
        console.error('Error al obtener mensajes:', error);
        // Puedes manejar el error según tus necesidades
      }
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      // Puedes manejar el error según tus necesidades
    }
  };
  
  const handleClick = async (iduser) => {
    setNumeroEspecifico(iduser)
    conection();
  try {   const fechaActual = new Date();
    const options = { timeZone: 'America/Bogota', hour12: false };
          const fechaInicio = new Date(fechaActual);
    fechaInicio.setHours(fechaInicio.getHours() - 24);
    
    // Formatear la fecha de inicio
    const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
    const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
    const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
    const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
    const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
    const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
    
    const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;
    
    // Formatear la fecha actual
    const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
    const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
    const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
    const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
    const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
    const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
    
    const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;
    
          const status = 'pending';
          const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/obtener-mensajes-por-fecha?fechaInicio=${fechaInicioString}&fechaFin=${fechaFinString}`);      
          const responseChats = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/consultar_por_status?status=${status}`);
    
    // El usuario está autenticado, puedes acceder a la sesión
    
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }
    
    const Id = iduser
     
    const chatsPending = await responseChats.json();
    const withoutGest = chatsPending.filter(d => d.idChat2 == Id )
    console.log(Id)
    const data = await response.json();
    setMensajes1(Object.values(data)[0]);
    setContactos1(withoutGest);
    setStatuschats('Pendientes');
    try {   const fechaActual = new Date();
      const options = { timeZone: 'America/Bogota', hour12: false };
            const fechaInicio = new Date(fechaActual);
      fechaInicio.setHours(fechaInicio.getHours() - 24);
      
      // Formatear la fecha de inicio
      const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
      const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
      const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
      const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
      const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
      const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
      
      const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;
      
      // Formatear la fecha actual
      const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
      const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
      const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
      const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
      const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
      const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
      
      const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;
      
            const status = 'in process';
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/obtener-mensajes-por-fecha?fechaInicio=${fechaInicioString}&fechaFin=${fechaFinString}`);
      const responseChats = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/consultar_por_status?status=${status}`);
     
      // El usuario está autenticado, puedes acceder a la sesión
      
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
      
      const Id = iduser
      const chatsPending = await responseChats.json();
      const withoutGest = chatsPending.filter(d => d.idChat2 == Id )
      console.log(Id)
      const data = await response.json();
      setMensajes2(Object.values(data)[0]);
      setContactos2(withoutGest);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      // Puedes manejar el error según tus necesidades
    }
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    // Puedes manejar el error según tus necesidades
  }
};
  // closed chats
  const handleClosedClick = async () => {
    conection();
    setStatuschats('Cerrados')
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-mensajes');
      const responseChats = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-chats');
      const responseUsers = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
      // El usuario está autenticado, puedes acceder a la sesión
      
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
      const users = await responseUsers.json()
      
      const dataChats =  await responseChats.json();
      const chatsPending = dataChats.filter(d=> d.status == 'closed')
      
      
      const data = await response.json();
      setMensajes1(data);
      setContactos1(chatsPending);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      // Puedes manejar el error según tus necesidades
    }
  };

  const [mensajes, setMensajes] = useState(
     [
      { numero: '', tipo: '', contenido: '', estado: '', date: ''},
    ]   
);

const [file, setFile] = useState(null);
const [url, setUrl] = useState('');
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Selecciona un archivo primero.');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', file);

    try {
      const response = await fetch('https://3d29bmtd-8080.use2.devtunnels.ms/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // Actualizar el mensajeData para incluir información del archivo
        const mensajeData = {
          channel: 'whatsapp',
          source: process.env.NEXT_PUBLIC_CELLPHONE,
          'src.name': process.env.NEXT_PUBLIC_NAMEAPP,
          destination: numeroEspecifico,
          message: JSON.stringify({
            type: 'image', // Puedes ajustar esto según el tipo de archivo
            originalUrl: data.url, // URL generada después de la carga del archivo
            previewUrl: data.url, // Puedes ajustar esto según tus necesidades
            caption: 'Envío de imagen',
          }),
          disablePreview: true,
        };

        const responseEnvio = await fetch(process.env.NEXT_PUBLIC_BASE_API+'/api/envios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(mensajeData).toString(),
        });

        if (!responseEnvio.ok) {
          throw new Error(`Error en la solicitud: ${responseEnvio.status} ${responseEnvio.statusText}`);
        }

        const responseData = await responseEnvio.json();
        console.log('Respuesta del servidor:', responseData);

        const idMessage = responseData.messageId;

        const actualizarMensajeResponse = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/mensajeenviado', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: mensajeData.message,
            idMessage,
          }),
        });

        if (actualizarMensajeResponse.ok) {
          const actualizarMensajeData = await actualizarMensajeResponse.json();
          console.log('Respuesta de la actualización del mensaje:', actualizarMensajeData);
        } else {
          console.error('Error al actualizar el mensaje:', actualizarMensajeResponse.status);
          // Resto del código para guardar el mensaje en el servidor...
        }
      } else {
        alert(`Error al subir el archivo: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };


  const [numeroEspecifico, setNumeroEspecifico] = useState('');
  const actualizarEstadoChat = async (estado) => {
    try {
      const idChat2 = numeroEspecifico; // Asegúrate de obtener el idChat2 según tu lógica
      const nuevoEstado = 'in process'; // Asegúrate de obtener el nuevoEstado según tu lógica

      const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/actualizar-estado-chat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idChat2, nuevoEstado }), // Ajusta la estructura del cuerpo según tus necesidades
      });

      if (response.ok) {
        const resultado = await response.json();
        console.log('Respuesta de la actualización:', resultado);
        // Manejar la respuesta exitosa según tus necesidades
      } else if (response.status === 404) {
        console.error('Chat no encontrado');
        // Manejar el caso de chat no encontrado según tus necesidades
      } else {
        console.error('Error interno del servidor');
        // Manejar otros errores según tus necesidades
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      // Manejar errores generales según tus necesidades
    }
  };
   // Reemplaza esto con el número que necesites
  const [inputValue, setInputValue] = useState('')
  const [msg, setMsg] = useState([]);
 const conection = () =>{
  const socket = io(process.env.NEXT_PUBLIC_SOCKET); 
  socket.on( async (data) => { 
    
    
    
  // Manejar la conexión del socket al montar el componente
  // Reemplaza con la URL de tu servidor Socket.IO

  // Manejar la desconexión del socket al desmontar el componente
  
 // Asegúrate de tener un array vacío como dependencia para que solo se ejecute al montar y desmontar el componente

    try {
      const fechaActual = new Date();
      const options = { timeZone: 'America/Bogota', hour12: false };
            const fechaInicio = new Date(fechaActual);
      fechaInicio.setHours(fechaInicio.getHours() - 24);
      
      // Formatear la fecha de inicio
      const anioInicio = fechaInicio.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
      const mesInicio = fechaInicio.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
      const diaInicio = fechaInicio.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
      const horaInicio = fechaInicio.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
      const minutosInicio = fechaInicio.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
      const segundosInicio = fechaInicio.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
      
      const fechaInicioString = `${anioInicio}-${mesInicio}-${diaInicio} ${horaInicio}:${minutosInicio}:${segundosInicio}`;
      
      // Formatear la fecha actual
      const anioFin = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
      const mesFin = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
      const diaFin = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
      const horaFin = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
      const minutosFin = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
      const segundosFin = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
      
      const fechaFinString = `${anioFin}-${mesFin}-${diaFin} ${horaFin}:${minutosFin}:${segundosFin}`;
      
      
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+`/obtener-mensajes-por-fecha?fechaInicio=${fechaInicioString}&fechaFin=${fechaFinString}`);
        

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }

      const data1 = await response.json();
      setMensajes1(data1);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      // Puedes manejar el error según tus necesidades
    }
  


     
const nuevosContactos = [
  ...contactos,
  {
    user: data.payload.source,
    fecha: new Date(data.timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    }),
  },
];
let fecha = new Date(data.timestamp).toLocaleString('es-ES', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZoneName: 'short',
})
const nuevoMensaje = {
  numero: data.payload.destination,
  tipo: 'message-event',
  contenido: inputValue,
  estado: data.payload.type,
  date: fecha

};
setMsg((prevMsg) => [...prevMsg, mensajes.inputValue]);
const nuevoMensajeEntrante = {
  numero: data.payload.source,
  tipo: data.type,
  contenido: data.payload.payload.text,
  date: fecha,
};
if(data.payload.payload == undefined){
  setMensajes((prevMensajes) => [...prevMensajes, nuevoMensaje]);
}
else{
  setMensajes((prevMensajes)=>[...prevMensajes, nuevoMensajeEntrante]);
}

if (contactos.fecha !== nuevosContactos.fecha) {
  setContactos(nuevosContactos);
}
const cont = parseInt(msg.length);
console.log(cont);
const webhookText = data ? data.payload.payload.text : null;
setWebhookData(webhookText);

})
}
  
  const enviarMensaje = async () => {
    
    if (!inputValue.trim()){
      console.log('Mensaje vacío, no se enviará.');
      return;
    }
    try {
      const mensajeData = {
        channel: 'whatsapp',
        source: process.env.NEXT_PUBLIC_CELLPHONE,
        'src.name': process.env.NEXT_PUBLIC_NAMEAPP,
        destination: numeroEspecifico,
        message: inputValue,
        disablePreview: true,
      };
      console.log(mensajes)
      setMsg((prevMsg) => [...prevMsg, inputValue]);
      
      setMensajes((prevMensajes) => (
        [
          ...prevMensajes,
          {
            numero: mensajeData.destination,
            tipo: 'message-event',
            contenido: mensajeData.message,
            date: new Date().toLocaleString(),
          },
        ]
      ));
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_API+'/api/envios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(mensajeData).toString(),
      });
      
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData);
       // Escucha el evento 'cambio' para obtener el idMessage
      const idMessage = responseData.messageId;

      // Actualiza el mensaje en el servidor
      const actualizarMensajeResponse = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/mensajeenviado', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: mensajeData.message,
          idMessage,
        }),
      });
      if (actualizarMensajeResponse.ok) {
        const actualizarMensajeData = actualizarMensajeResponse.json();
        console.log('Respuesta de la actualización del mensaje:', actualizarMensajeData);
      } else {
        console.error('Error al actualizar el mensaje:', actualizarMensajeResponse.status);
          // Guarda el mensaje en el servidor
    const guardarMensajeResponse = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/guardar-mensajes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: mensajeData.message,
        type_comunication: 'message-event', // Puedes ajustar este valor según tus necesidades
        status: 'sent', // Puedes ajustar este valor según tus necesidades
        number: numeroEspecifico,
        type_message: 'text',
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        idMessage: idMessage // Puedes ajustar este valor según tus necesidades
      }),
    });

    if (guardarMensajeResponse.ok) {
      const guardarMensajeData = await guardarMensajeResponse.json();
      console.log('Respuesta de guardar mensaje en la base de datos:', guardarMensajeData);
    } else {
      console.error('Error al guardar el mensaje:', guardarMensajeResponse.status);
    }conection()
      }
    
      setInputValue('')
      
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  useEffect(() => {
    const apiUrl2 = process.env.NEXT_PUBLIC_BASE_API+"/api/users";
    fetch(apiUrl2, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        const nuevosContactos = data.users.map((usuario) => ({
          user: usuario.countryCode + usuario.phoneCode,
          fecha: new Date(usuario.lastMessageTimeStamp).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short',
          }),
        }));
        setContactos(nuevosContactos);
      })
      .catch((error) => {
        console.error('Error:', error);
      });  
  }, []);
  const updateuser = async () => {
    const usuario = session.user.name; // Reemplaza con el nombre de usuario que deseas actualizar
    const nuevoDato = 'Activo'; // Reemplaza con el nuevo valor que deseas asignar
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/actualizar/usuario', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nuevoDato: nuevoDato,
          usuario: usuario
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
         // Aquí puedes manejar la respuesta del servidor
      } else {
        console.error('Error al actualizar el usuario:', response.statusText);
      }
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-mensajes');

        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        const data1 = await response.json();
        setMensajes1(data1);
      } catch (error) {
        console.error('Error al obtener mensajes:', error);
        // Puedes manejar el error según tus necesidades
      }
    
    } catch (error) {
      console.error('Error de red:', error.message);
    }
  };
  function limpiarLink(dataString) {
    const match = dataString.match(/"file":"([^"]*)"/);
    return match ? match[1] : null;
  }
  const handleNumeroChange = (e) => {
    
    console.log(asesores.filter((contacto) => contacto.id == 4))
    setValorbuscado(e.target.value)
    const resultadosFiltrados = resultadost.filter(
      (contacto) => contacto.idChat2.includes(e.target.value) || nombreuser(contacto.userId).includes(e.target.value) );
            
    setDatosbuscados(resultadosFiltrados);
  };
  const nombreuser = (idus) => {
    const asesorEncontrado = asesores.find((contacto) => contacto.id === idus);
  
    // Verifica si se encontró el asesor antes de intentar acceder a la propiedad
    return asesorEncontrado ? asesorEncontrado.complete_name : 'Nombre no encontrado';
  };

  if(session){
  return (
  <>
    <Layout>
      <Box onLoad={updateuser()}>
        <ButtonContainer>
        <div className="p-2 border border-gray-300 rounded">
        <div>
        <input
          type="text"
          
          onChange={handleNumeroChange}
          placeholder="Buscar por número"
        />

        {valorbuscado !== '' && <ul>
        {datosbuscados.length > 0 ? (
            datosbuscados.map((contacto) => (
              <li key={contacto.idChat2} onClick={()=>handleClick(contacto.idChat2)}>
                {/* Renderizar los datos del contacto */}
                {nombreuser(contacto.userId)} - {contacto.idChat2} - {contacto.status === 'pending' ? 'Pendiente' : contacto.status === 'in process' ? 'En Atención' : contacto.status === 'expiredbyassesor' ? 'Expirado por Asesor' : contacto.status === 'expiredbyclient' ? 'Expirado por cliente' :'Finalizado'}
              </li>
            ))
          ) : (
            <li>No se encontraron resultados</li>
          )}
        </ul>}
        </div>
        {resultados.map((resultado, index) => (
          <CustomButton className="cursor-pointer" key={index}
            onClick={()=>{handlePendientesClick(resultado.asesor.id)}}>
            {resultado.asesor.complete_name},estado:{resultado.asesor.session}, N° Chats: {resultado.frecuencia}
          </CustomButton>
        ))}
      
    </div>

    <div className="p-2 border border-gray-300 rounded">
          <CustomButton className="cursor-pointer" 
          onClick={()=>{handleClosedClick()}}>
             {}Chats cerrados: {resultados2}
          </CustomButton>
    </div>
    </ButtonContainer>
      </Box>
     {statuschats && <Container>
        <Box style={{ height: '30vw', width: '50vw'}}>
        <h2>Chat {numeroEspecifico}</h2>
          


      
            {(() => {
          // Filtra los mensajes por el número específico y contenido no vacío
          const mensajesFiltrados = mensajes1
            .filter((mensaje) => mensaje.number === numeroEspecifico && mensaje.content && mensaje.content.trim() !== '')
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Ordena los mensajes por fecha

          // Mapea y renderiza los mensajes ordenados
          return mensajesFiltrados.map((mensaje, index) => (
            <div
              key={index}
              className={`mensaje ${mensaje.type_message && console.log(mensajes1.length, mensajesFiltrados.length)} ${
                mensaje.type_comunication === 'message-event' ? 'bg-white text-right shadow-lg p-4 bg-gray rounded-md' : 'bg-green text-left shadow-lg p-4 bg-gray rounded-md'
              } p-4 mb-4`}
            > 
        
              { mensaje.type_message === 'image'  ? (
                <img src={limpiarLink(mensaje.content) || mensaje.content}  alt="Imagen" className="w-15vw shadow-md p-4 bg-gray rounded-md" />
              ) : mensaje.type_message === 'audio' ? (
                <audio controls>
                  <source src={mensaje.content} type="audio/mp3" />
                  Tu navegador no soporta el elemento de audio.
                </audio>
              ) : mensaje.type_message === 'sticker' ? (
                <img src={mensaje.content} alt="Sticker" className="w-15vw" />
              ) : mensaje.type_message === 'video' ? (
                <video controls className="w-15vw">
                  <source src={limpiarLink(mensaje.content)||mensaje.content} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              ) : mensaje.type_message === 'file' ? (
                <a href={ limpiarLink(mensaje.content)||mensaje.content} target="_blank" rel="noopener noreferrer" className="text-blue">
                  Descargar documento
                </a>
              ) : (
                <>
                  <p className="mb-2">{mensaje.content && mensaje.content.trim()}</p>
                  <span >{mensaje.status +" "+ mensaje.timestamp}</span>
                </>
              )}
              
            </div>
          ));
        })()}
      
        </Box>
        <Box style={{ height: '30vw', width: '15vw'}}>
        
          <div className="chat-container">
            <h1>{statuschats}</h1>
            <ul>
              {contactos1.map((contacto, index) => (
                <li key={index}>
                  
                  <CustomButton onClick={() => setNumeroEspecifico(contacto.idChat2)}>Usuario:{contacto.idChat2}</CustomButton>
                   
                </li>
              ))}
            </ul>
          </div>
        </Box>
        <Box style={{ height: '30vw', width: '15vw'}}>
          <div className="chat-container">
            <h1>En gestion</h1>
            <ul>
              {contactos2.map((contacto, index) => (
                <li key={index}>
                  
                  <CustomButton onClick={() => setNumeroEspecifico(contacto.idChat2)}>Usuario:{contacto.idChat2}</CustomButton>
                   
                </li>
              ))}
            </ul>
          </div></Box>
      </Container>}
    </Layout>
      </>
  )}
  return (
    <>
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="mb-4">Not signed in</p>
      <button
        onClick={() => signIn()}
        className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
      >
        Sign in
      </button>
    </div>
  </>
  
    )  };

  const Box = styled.div`
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
  overflow-y: scroll;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

`;

const CustomButton = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;

  &:hover {
    background-color: #45a049;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Container = styled.div`
  display: flex;
  gap: 20px;
`;

const ContainerBox = styled.div`
  background-color: #f7f7f7;
  padding: 15px;
  border-radius: 10px;
  overflow-y: scroll;
  height: 35vw;
  width: 100vw;
`;

const p = styled.div`
  background-color: ${(props) => (props.tipo === 'message-event' ? '#6e6e6' : '#4caf50')};
  color: ${(props) => (props.tipo === 'message-event' ? 'black' : 'white')};
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
`;

const InputContainer = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
`;

const InputMensaje = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-right: 10px;
`;

const BotonEnviar = styled.button`
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;
const StyledList = styled.ul`
  list-style: none;
  padding: 0;
`;

const StyledListItem = styled.li`
  margin-bottom: 10px;
`;

const StyledStrong = styled.strong`
  font-weight: bold;
`;

export default MonitoringPage;
