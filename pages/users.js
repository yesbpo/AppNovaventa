import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import styled from 'styled-components';
import { useSession, signIn } from 'next-auth/react';

const CrearUsuario = () => {
  const { data: sesion } = useSession();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [session, setSession] = useState('');
  const [typeUser, setTypeUser] = useState('');
  const [complete_name, setComplete_name] = useState('');
  const [mensaje, setMensaje] = useState(null); //pop up de creacion de usuario

  const handleCrearUsuario = async () => {
    try {
      const createdAt = new Date(); // Puedes ajustar cómo obtienes la fecha de creación
      const updatedAt = new Date(); // Puedes ajustar cómo obtienes la fecha de actualización

      const response = await fetch(process.env.NEXT_PUBLIC_BASE_DB+'/crear-usuario', {
               method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type_user: typeUser,
          email:email,
          session:'Inactivo',
          usuario: usuario,
          password:password,                    
          complete_name: complete_name,
      
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Aquí puedes manejar la respuesta del servidor

        setMensaje({ tipo: 'exito', texto: 'Usuario creado exitosamente.' });
        // Limpiar los campos después de un éxito
        setUsuario('');
        setPassword('');
        setEmail('');
        setTypeUser('');
        setComplete_name('');

         return <><h1>{data}</h1></>;
      } else {
        console.error('Error al crear el usuario:', response.statusText);
        setMensaje({ tipo: 'error', texto: 'Error al crear el usuario.' });
      }
    } catch (error) {
      console.error('Error de red:', error.message);
      setMensaje({ tipo: 'error', texto: 'Error de red al intentar crear el usuario.' });
      return <><h1>{error.message}</h1></>;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMensaje(null);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [mensaje]);

  if (sesion){
  return (
    
    <Layout>
    <div className="flex items-center justify-center h-screen">
    <div className="w-full max-w-md">
      <h1 className="text-dark text-center mb-6">Crear Usuario</h1>    
      {mensaje && (
            <Mensaje tipo={mensaje.tipo}>
              {mensaje.texto}
            </Mensaje>
          )}
      <form>
        <div className="mb-5">
          <label htmlFor="usuario" className="form-label">Usuario:</label>
          <input type="text" className="form-control" id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email:</label>
          <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-3">
            <label htmlFor="typeUser" className="form-label">Type User:</label>
            <select
              id="typeUser"
              className="form-select"
              value={typeUser}
              onChange={(e) => setTypeUser(e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Asesor">Asesor</option>
              <option value="Coordinador">Coordinador</option>
            </select>
        </div>
        <div className="mb-3">
          <label htmlFor="completeName" className="form-label">Complete Name:</label>
          <input type="text" className="form-control" id="completeName" value={complete_name} onChange={(e) => setComplete_name(e.target.value)} />
        </div>
        <BotonEnviar type="button" onClick={handleCrearUsuario}>
          Crear Usuario
        </BotonEnviar>
      </form>
    </div>
  </div>
</Layout>

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
      
        )
};

const Mensaje = styled.p`
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  color: ${({ tipo }) => (tipo === 'exito' ? 'green' : 'red')};
  background-color: ${({ tipo }) => (tipo === 'exito' ? '#d3f5e5' : '#f8d7da')};
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
export default CrearUsuario;
