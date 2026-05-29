
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB06anYhza3Z6P_WuFbPxpDGWUpx8t1dD8",
  authDomain: "tulum-hoy.firebaseapp.com",
  projectId: "tulum-hoy",
  storageBucket: "tulum-hoy.firebasestorage.app",
  messagingSenderId: "138006744973",
  appId: "1:138006744973:web:dd7b1fe86e803378f737c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

mapboxgl.accessToken = 'pk.eyJ1IjoibWF1cmljaW9odWl0emlsbWFydGluIiwiYSI6ImNtcHBmbDhzcjBlZHEyc3B4YXc5ejBmOTgifQ.fp_m94NTszvo28v98iY0eg';
const map = new mapboxgl.Map({ container: 'map', style: 'mapbox://styles/mapbox/streets-v12', center: [-87.4578, 20.1472], zoom: 13 });

let categoriaActual = '';
let marcadores = [];

// Manejo global de teclado
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        document.getElementById('photo-modal').classList.add('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
    }
});

const obtenerInfoSargazo = (nivel) => {
    switch (nivel) {
        case 'Verde': return { color: '#28a745', desc: 'Limpio' };
        case 'Amarillo': return { color: '#ffc107', desc: 'Poco' };
        case 'Naranja': return { color: '#fd7e14', desc: 'Moderado' };
        case 'Rojo': return { color: '#dc3545', desc: 'Abundante' };
        default: return { color: '#3FB1CE', desc: '' };
    }
};

window.abrirFoto = (url) => {
    document.getElementById('modal-img').src = url;
    document.getElementById('photo-modal').classList.remove('hidden');
};

window.abrirAdmin = () => {
    document.getElementById('admin-panel').classList.remove('hidden');
    document.getElementById('admin-sargazo').classList.toggle('hidden', categoriaActual !== 'Sargazo');
    document.getElementById('admin-eventos').classList.toggle('hidden', categoriaActual !== 'Eventos');
};

window.cerrarAdmin = () => document.getElementById('admin-panel').classList.add('hidden');

window.mostrarMapa = async (coleccion) => {
    categoriaActual = coleccion;
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('back-btn').style.display = 'block';
    
    marcadores.forEach(m => m.remove());
    marcadores = [];
    
    const querySnapshot = await getDocs(collection(db, coleccion));
    querySnapshot.forEach((doc) => {
        const d = doc.data();
        if (d.latitude && d.longitude) {
            const info = coleccion === 'Sargazo' ? obtenerInfoSargazo(d.sargazo_level) : null;
            const colorPin = info ? info.color : '#7b2cbf';
            
            const popupHTML = `
                <div style="text-align:center;">
                    <h3>${d.title}</h3>
                    ${d.sargazo_level ? `<p>Nivel: <b>${d.sargazo_level} (${info.desc})</b></p>` : `<p>${d.description || ''}</p>`}
                    ${d.photoURL ? `<img src="${d.photoURL}" style="width:100px; border-radius:5px; cursor:pointer;" onclick="abrirFoto('${d.photoURL}')">` : ''}
                </div>
            `;
            const m = new mapboxgl.Marker({ color: colorPin })
                .setLngLat([d.longitude, d.latitude])
                .setPopup(new mapboxgl.Popup().setHTML(popupHTML))
                .addTo(map);
            marcadores.push(m);
        }
    });
};

window.guardarLugar = async (coleccion) => {
    const isSargazo = coleccion === 'Sargazo';
    const file = document.getElementById(isSargazo ? 's-foto' : 'e-foto').files[0];
    if (!file) return alert("Selecciona una foto");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "tulum_preset");

    const res = await fetch("https://api.cloudinary.com/v1_1/dx6hgkipa/image/upload", { method: "POST", body: formData });
    const imgData = await res.json();

    const data = {
        title: document.getElementById(isSargazo ? 's-lugar' : 'e-lugar').value,
        latitude: parseFloat(document.getElementById(isSargazo ? 's-lat' : 'e-lat').value),
        longitude: parseFloat(document.getElementById(isSargazo ? 's-lng' : 'e-lng').value),
        photoURL: imgData.secure_url
    };

    if(isSargazo) data.sargazo_level = document.getElementById('s-semaforo').value;
    else data.description = document.getElementById('e-desc').value;

    await addDoc(collection(db, coleccion), data);
    alert("¡Guardado correctamente!");
    location.reload();
};
