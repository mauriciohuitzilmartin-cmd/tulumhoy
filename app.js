import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB06anYhza3Z6P_WuFbPxpDGWUpx8t1dD8",
  authDomain: "tulum-hoy.firebaseapp.com",
  projectId: "tulum-hoy",
  storageBucket: "tulum-hoy.firebasestorage.app",
  messagingSenderId: "138006744973",
  appId: "1:785740850445:web:dd7b1fe86e803378f737c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

mapboxgl.accessToken = 'pk.eyJ1IjoibWF1cmljaW9odWl0emlsbWFydGluIiwiYSI6ImNtcHBmbDhzcjBlZHEyc3B4YXc5ejBmOTgifQ.fp_m94NTszvo28v98iY0eg';
const map = new mapboxgl.Map({ 
    container: 'map', 
    style: 'mapbox://styles/mapbox/streets-v12', 
    center: [-87.4578, 20.1472], 
    zoom: 13 
});

let marcadores = [];

window.mostrarMapa = async (coleccion) => {
    // Limpiar marcadores anteriores
    marcadores.forEach(m => m.remove());
    marcadores = [];

    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('back-btn').style.display = 'block';

    try {
        const querySnapshot = await getDocs(collection(db, coleccion));
        
        querySnapshot.forEach((doc) => {
            const d = doc.data();
            // Verificamos que tenga coordenadas válidas
            if (d.latitude != null && d.longitude != null) {
                const marker = new mapboxgl.Marker()
                    .setLngLat([parseFloat(d.longitude), parseFloat(d.latitude)])
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${d.title || 'Sin nombre'}</h3>`))
                    .addTo(map);
                marcadores.push(marker);
            }
        });
    } catch (error) {
        console.error("Error al cargar la colección " + coleccion + ":", error);
        alert("No se pudieron cargar los datos.");
    }
};

window.abrirAdmin = () => document.getElementById('admin-panel').classList.remove('hidden');
window.cerrarAdmin = () => document.getElementById('admin-panel').classList.add('hidden');

window.guardarLugar = async (coleccion) => {
    alert("Función de guardado vinculada a: " + coleccion);
};
