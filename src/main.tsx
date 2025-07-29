import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Importar a configuração de data
import './lib/date-config';

createRoot(document.getElementById("root")!).render(<App />);
