
export interface User {
  username: string;
}

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
  // Intentar obtener la URL de las variables de entorno o del localStorage
  const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || localStorage.getItem('google_script_url');
  
  if (!scriptUrl) {
    return { success: false, message: "Configuración incompleta: Falta la URL del Script de Google. Configúrela en el icono de engranaje." };
  }

  try {
    // Usamos un enfoque que funciona bien con las redirecciones de Google Apps Script
    const response = await fetch(scriptUrl, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });
    
    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, message: "No se pudo conectar con el servidor de autenticación" };
  }
};
