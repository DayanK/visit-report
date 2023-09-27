import "./index.css";
import './i18n'
import App from "./components/pages/App";
import { createRoot } from 'react-dom/client';



const container = document.getElementById('root');
const root = createRoot(container as Element); 
root.render( <App /> );