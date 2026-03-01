# Pilar Control Laboratorio - Guía de Ejecución Local

Este proyecto es un dashboard profesional para el análisis de rendimiento financiero y control de laboratorio. Puedes ejecutarlo en tu PC siguiendo estos pasos.

## 💻 Requisitos Previos

Antes de empezar, asegúrate de tener instalado **Node.js** (descárgalo en [nodejs.org](https://nodejs.org/)).

## 📥 Cómo ejecutar en tu PC

1. **Descarga el proyecto**: Descarga todos los archivos en una carpeta en tu computadora.
2. **Prepara la API Key**:
   - Busca el archivo `.env.example`.
   - Cámbiale el nombre a `.env`.
   - Abre el archivo con el Bloc de notas y pega tu clave de Google Gemini después de `API_KEY=`.
3. **Instala las dependencias**:
   Abre una terminal o consola en la carpeta del proyecto y escribe:
   ```bash
   npm install
   ```
4. **Inicia la aplicación**:
   En la misma terminal, escribe:
   ```bash
   npm run dev
   ```
5. **Abre el navegador**:
   La terminal te dará una dirección (normalmente `http://localhost:5173`). Haz clic o pégala en tu navegador y ¡listo!

## 🚀 Funcionalidades Incluidas
- **Carga de Excel**: Puedes arrastrar tus archivos locales directamente.
- **IA Estratégica**: Análisis automático de riesgos y oportunidades.
- **Gráficos Interactivos**: Visualización de tendencias de GP, GM e Inversiones.
- **Modo Offline**: Una vez cargado, los cálculos de datos se hacen localmente en tu PC.

---
Desarrollado para la optimización de procesos de control de laboratorio.