import Layout from '../components/Layout';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import { useSession, signIn } from 'next-auth/react';


const MonitoringPage = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showPopup, setShowPopup] = useState('')
  const [templateParams, setTemplateParams] = useState({}); // Nuevo estado para los parámetros
  const [numericInputValue, setNumericInputValue] = useState('');
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState ('hoy')
  // Función para abrir la ventana emergente
  const openPopup = () => {
    setShowPopup(true);
  };
  const closePopup = () => {
    setShowPopup(false);
  };
  const handleNumericInputChange = (value) => {
    // Permite solo números y limita a 10 caracteres
    const newValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    setNumericInputValue(newValue);
    console.log('Valor numérico ingresado:', newValue);
   };
   const enviarSolicitud = async () => {
      if (!selectedTemplateId) {
        console.error('Error: No se ha seleccionado ninguna plantilla.');
      return;
      }
      
      const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
   
      if (!selectedTemplate) {
        console.error('Error: No se encontró la plantilla seleccionada.');
      return;
      }
   
      const url = 'https://api.gupshup.io/wa/api/v1/template/msg';
      const apiKey = 'thpuawjbidnbbbfrp9bw7qg03eci6rdz';
      const data = new URLSearchParams();
        data.append('channel', 'whatsapp');
        data.append('source', process.env.NEXT_PUBLIC_CELLPHONE);
        data.append('destination', numericInputValue);
        data.append('src.name', process.env.NEXT_PUBLIC_NAMEAPP);
        data.append('template', JSON.stringify({
                      id: selectedTemplate.id,
                      params: Object.values(templateParams) || [] // Asegúrate de que tu plantilla tenga una propiedad params
                    }));
    try {
      setSelectedTemplateId('')
      setNumericInputValue('')
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apikey': apiKey,
            'cache-control': 'no-cache',
          },
          body: data,
      });
        const responseenvio = response.json(); 
        // guardar template
        const fechaActual = new Date();
        const options = { timeZone: 'America/Bogota', hour12: false };
          const anio = fechaActual.toLocaleString('en-US', { year: 'numeric', timeZone: options.timeZone });
          const mes = fechaActual.toLocaleString('en-US', { month: '2-digit', timeZone: options.timeZone });
          const dia = fechaActual.toLocaleString('en-US', { day: '2-digit', timeZone: options.timeZone });
          const hora = fechaActual.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: options.timeZone });
          const minutos = fechaActual.toLocaleString('en-US', { minute: '2-digit', timeZone: options.timeZone });
          const segundos = fechaActual.toLocaleString('en-US', { second: '2-digit', timeZone: options.timeZone });
        const datosdenetrada = {
          idmessageTemplate: responseenvio.messageId,
          status: 'sent',
          attachments: data.destination,
          message: data.template,
          timestamp:`${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`,
          campaign: 'envio unico'
        };
          try {
            const responseguardar = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/insertar-datos-template', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Otros encabezados si es necesario
              },
              body: JSON.stringify(datosdenetrada), // Convierte los datos a formato JSON
            });
        
            if (!responseguardar.ok) {
              throw new Error(`Error en la solicitud: ${response.statusText}`);
            }
            const data1 = await responseguardar.json(); // Parsea la respuesta como JSON
            console.log('Respuesta del servidor:', data1);
            // Puedes realizar acciones adicionales con la respuesta aquí
              } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            // Manejo de errores
              }
            const responseData = await response.json();
            console.log('Respuesta:', Object.values(templateParams));
        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
        }
      };
      const handleAgregarNumeroClick = () => {
    // Llamamos a la función enviarSolicitud al hacer clic en el botón
      enviarSolicitud();
   };
   function contarOcurrencias(texto, patron) {
    const regex = new RegExp(patron, 'g');
    const coincidencias = texto.match(regex);
    const componentes = Array.from({ length: coincidencias }, (v, index) => index);
    return coincidencias ? coincidencias : 0;
   }
   const handleParamChange = (param, value) => {
    setTemplateParams((prevParams) => {
      const updatedParams = {
        ...prevParams,
        [param]: value,
      };
      console.log('Updated Params:', updatedParams);
      return updatedParams;
    });
   };
const handleTemplateChange = (event) => {
  const selectedTemplateId = event.target.value;
  setSelectedTemplateId(selectedTemplateId);
};
// GET TEMPLATES
useEffect(() => {
  
  // Traer las plantillas al cargar el componente
  const fetchTemplates = async () => {
    try {
      // Utilizar el servidor proxy en lugar de la URL directa
      const response = await fetch(process.env.NEXT_PUBLIC_API2+'/gupshup-templates');
      if (!response.ok) {
        throw new Error(HTTP `error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === "success") {
        const processedTemplates = data.templates.map(template => ({
          id: template.id, // Asegúrate de incluir el ID
          category: template.category,
          createdOn: template.createdOn,
          data: template.data,
          elementName: template.elementName,
          languageCode: template.languageCode,
          status: template.status,
          templateType: template.templateType,
          modifiedOn: template.modifiedOn,
          params: template.params || [], // Asegúrate de que tu plantilla tenga una propiedad params
        }));
 
        setTemplates(processedTemplates);
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      setError(Fetch `error: ${error.message}`);
    }
  }; 
  fetchTemplates();
  // Llama a fetchMensajes cada segundo
  }, []);

const [statuschats, setStatuschats] = useState('')
const [asesores, setAsesores] = useState([]);
const [resultados, setResultados] = useState([]);
const [resultados1, setResultados1] = useState([]);
const [resultados2, setResultados2] = useState([]);
const [resultadost, setResultadost] = useState([]);
const [datosbuscados, setDatosbuscados] = useState('');
const [valorbuscado, setValorbuscado] = useState('');
const { data: session } = useSession();  
const [contactos2, setContactos2] = useState([]);
const [contactos1, setContactos1] = useState([]);
const [contactos, setContactos] = useState([
    { user: null, fecha: null, mensajes: [{ tipomensaje: '', datemessage: '', content: '' }] },
  ]);
const [webhookData, setWebhookData] = useState(null);
const [mensajes1, setMensajes1] = useState([]);
const [mensajes2, setMensajes2] = useState([]);
const [timeResponse, setTimeResponse] = useState('')
const obtenerMensajes = async (tiempo) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-usuarios');
    const responseChats = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/consultar-chats-'+tiempo);
    const timeResponseFetch = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-mensajes-tiemporespuesta-'+tiempo)
    const time = await timeResponseFetch.json()
    console.log(time)
    setTimeResponse(time)
    if (!response.ok || !responseChats.ok) {
      throw new Error(`Error en la solicitud`);
    }
    const data = await response.json();
    const chats = await responseChats.json();
    console.log(Object.values(chats)[0].map((chat) => chat.userId))
    const asesores = data.filter((d) => d.type_user === 'Asesor' ||  d.type_user === 'Asesor1' );
    setAsesores(asesores);
    console.log(asesores)
    const chatspendientes = Object.values(chats)[0].filter((valor) => valor.status === 'pending');
    const chatsengestion = Object.values(chats)[0].filter((valor) => valor.status === 'in process');
    const chatscerrados = Object.values(chats)[0].filter((valor) => valor.status === 'closed');
    const chatsExpiredByAsesor = Object.values(chats)[0].filter((valor) => valor.status === 'expiredbyasesor');
    const chatsExpiredByClient = Object.values(chats)[0].filter((valor) => valor.status === 'expiredbyclient');
    const chatCerrado = chatscerrados.map((chat) => chat.userId);
    const chatGestion = chatsengestion.map((chat) => chat.userId);
    const chatsPendings = Object.values(chats)[0].map((chat) => chat.userId);
    setResultadost(chats)
    
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
useEffect(() => {
  obtenerMensajes(timeFilter);
}, []);

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
            const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-mensajes-'+timeFilter);      
            const responseChats = Object.values(resultadost)[0]
      
      // El usuario está autenticado, puedes acceder a la sesión
      
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
      
      const Id = iduser
       
      const chatsPending = responseChats
      const withoutGest = chatsPending.filter(d => d.userId == Id )
      console.log(Id)
      const data = await response.json();
      setMensajes1(Object.values(data)[0]);
      setContactos1(withoutGest);

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
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/obtener-mensajes-'+timeFilter);
        const responseChats = Object.values(resultadost)[0].filter(r=>r.status == 'in process')
       
        // El usuario está autenticado, puedes acceder a la sesión
        
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        
        const Id = iduser
        const chatsPending = responseChats
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
  const [numeroEspecifico, setNumeroEspecifico] = useState('');

   // Reemplaza esto con el número que necesites
  const [inputValue, setInputValue] = useState('')
  const [msg, setMsg] = useState([]);
 const conection = () =>{
  const socket = io(process.env.NEXT_PUBLIC_SOCKET); 
  socket.on( async (data) => { 
    
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
  function limpiarLink(dataString) {
    const match = dataString.match(/"file":"([^"]*)"/);
    return match ? match[1] : null;
  }
  const handleNumeroChange = (e) => {
    console.log(asesores.filter((contacto) => contacto.id == 4))
    setValorbuscado(e.target.value)
    const resultadosFiltrados = Object.values(resultadost)[0].filter(
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
    {showPopup && 
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto">
        <div className="bg-black bg-opacity-50 " ></div>
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <button
            onClick={closePopup}
            className="mb-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
            Cerrar
            </button>
            <label htmlFor="destinationInput" className="block text-sm font-medium text-gray-700">
            Número de destino (máximo 10 dígitos):
            </label>
            <input
              type="text"
              id="destinationInput"
              value={numericInputValue}
              onChange={(e) => handleNumericInputChange(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleAgregarNumeroClick}
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
            Agregar Número
            </button>
            <h2 className="mt-4 text-lg font-semibold">Plantillas:</h2>
            <select
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            className="mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>Select a template</option>
                {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.data}{contarOcurrencias(template.data, '{{.*?}}')}
                </option>
              ))}
            </select>
            {templates.map(
            (template) =>
            template.id === selectedTemplateId &&
            template.params && (
            <div key={template.id} className="mt-4">
              <h3 className="text-lg font-semibold">Parámetros:</h3>
              {contarOcurrencias(template.data, '{{.*?}}').length > 0 && contarOcurrencias(template.data, '{{.*?}}').map((param) => (
              <div key={param} className="mt-2">
                <label htmlFor={param} className="block text-sm font-medium text-gray-700">
                  {param}:
                </label>
                <input
                type="text"
                id={param}
                onChange={(e) => handleParamChange(param, e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-md"
                />
              </div>
              ))}
            </div>
            )
          )}
      </div>
    </div>}
    <Layout>
      <Box>
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
    <select value={timeFilter}
      onChange={(e) => {
        const newValue = e.target.value;
        setTimeFilter(newValue);
        obtenerMensajes(newValue);
      }}
    >
      <option value="hoy" >Hoy</option>
      <option value="semana">Esta semana</option>
      <option value="mes" >Este mes</option>
    </select>
    <select value={statuschats}
      onChange={(e) => {
        const newValue = e.target.value;
        setStatuschats(newValue);
        
      }}
    > 
      <option value="" >Todos</option>
      <option value="pending" >Pendientes</option>
      <option value="in process">En atencion</option>
      <option value="expiredbyasesor" >Expirados por asesor</option>
      <option value="expiredbyclient" >Expirados por cliente</option>
      <option value="closed" >Finalizados</option>
    </select>
    <CustomButton onClick={openPopup}>Agregar Número</CustomButton>
          <CustomButton className="cursor-pointer" 
          onClick={()=>{handleClosedClick()}}>
             {}Chats cerrados: {resultados2}
          </CustomButton>
          <h1>tiempo de respuesta: {Object.values(timeResponse)[0]}</h1>
    </div>
    </ButtonContainer>
      </Box>
     {resultadost && <Container>
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
        <Box style={{ height: '30vw', width: '30vw'}}>
        
          <div className="chat-container">
            <h1>{'chats'}</h1>
            <ul>
              {contactos1.filter(c => statuschats === '' || c.status === statuschats).map((contacto, index) => (
                <li key={index}>
                  
                  <CustomButton onClick={() => setNumeroEspecifico(contacto.idChat2)}>{contacto.idChat2} Asesor:{nombreuser(contacto.userId)}Estado:{contacto.status}</CustomButton>
                   
                </li>
              ))}
              {contactos1.length == 0 && resultadost.filter(c => statuschats === '' || c.status === statuschats).map((contacto, index) => (
                <li key={index}>
                  
                  <CustomButton onClick={() => setNumeroEspecifico(contacto.idChat2)}>{contacto.idChat2} Asesor:{nombreuser(contacto.userId)}Estado:{contacto.status}</CustomButton>
                   
                </li>
              ))}
            </ul>
          </div>
        </Box>
       
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
