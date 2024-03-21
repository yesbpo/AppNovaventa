import { useRouter } from "next/router";
import {useState} from 'react'

function LoginPage() {
  const router = useRouter();
  const [username, setUsername ] = useState('');
  const [password, setPassword] = useState('');
const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:3003/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    console.log('Token recibido:', data.token);
       // Almacenar el token y el nombre de usuario en localStorage
       localStorage.setItem('token', data.token);
       localStorage.setItem('username', data.username);
       localStorage.setItem('type_user', data.type_user);
       localStorage.setItem('id', data.id); 
       const token = localStorage.getItem('token');
       const responseautenticate = await fetch('http://localhost:3003/protected', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (responseautenticate.ok) {
        
        router.push('/monitoring');
      } else {
        console.error('Error al acceder a la ruta protegida:', response.statusText);
      }
      
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  }

  


  
}

  return (
    <div className="h-[calc(100vh-7rem)] flex justify-center items-center">
      <div className="w-1/4">
      <img
        className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 mx-auto my-auto"
        src="https://1bb437.a2cdn1.secureserver.net/wp-content/uploads/2023/08/Logo-500-full-150x150.jpg"
        alt="Logo"
      />

      <div className="flex flex-col">
        <label htmlFor="email" className="text-slate-500 mb-2 block text-sm">
          Usuario:
        </label>
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          placeholder="user@email.com"
        />

        <label htmlFor="password" className="text-slate-500 mb-2 block text-sm">
          Password:
        </label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          placeholder="******"
        />

        <button
          className="w-full bg-blue-500 text-black p-3 rounded-lg mt-2"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
      </div>
    </div>
  );
}
export default LoginPage;
