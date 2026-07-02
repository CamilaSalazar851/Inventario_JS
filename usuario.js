const API_URL = "https://stock-flow-354d0-default-rtdb.firebaseio.com/usuarios";
const formUsuario = document.getElementById("usuario-from");

let listaUsuarios = [];
let idUsuarioUpdate = null;

document.addEventListener("DOMContentLoaded", () => {
  let login = sessionStorage.getItem("login");
/*
  if (login != "True") {
    window.location.href = "login.html";
  }*/

  cargarUsuario();
});

formUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const confirmarPassword = document.getElementById("confirmarPassword").value;

  if (password !== confirmarPassword) {
      alert("Las contraseñas no coinciden");
      return;
  }

  const nuevoUsuario = {
      identificacion: document.getElementById("identificacion").value,
      nombre: document.getElementById("nombre").value,
      cargo: document.getElementById("cargo").value,
      password: password
  };

  try {
      const respuesta = await fetch(`${API_URL}.json`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(nuevoUsuario)
      });

      if (respuesta.ok) {
          alert("Usuario registrado correctamente");
          formUsuario.reset();
          cargarTabla();
      }
  } catch (error) {
      console.error(error);
      alert("Error al guardar el usuario");
  }
});

async function descargarUsuarios() {
  const respuesta = await fetch(`${API_URL}.json`);
  const datos = await respuesta.json();

  if (!datos) return [];

  return Object.keys(datos).map(id => ({
      id,
      ...datos[id]
  }));
}

function cargarUsuario() {
  const tabla = document.getElementById("tablaUsuarios");

  let usuarios = descargarUsuarios();

  if (usuarios == null) {
    tabla.innerHTML = "";
    return;
  }

  let html = "";

  for (let i = 0; i < usuarios.length; i++) {
    html += `

        <tr>

            <td>${i + 1}</td>

            <td>${usuarios[i].nombre}</td>

            <td>${usuarios[i].nombreUsuario}</td>

            <td>${usuarios[i].rolUsuario}</td>

            <td>

                <button class="btn-editar" onclick="editar(${i})">
                    Editar
                </button>

                <button class="btn-eliminar" onclick="eliminar(${i})">
                    Eliminar
                </button>

            </td>

        </tr>

        `;
  }

  tabla.innerHTML = html;
}

function descargarUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios"));
}

function eliminar(id) {
  let usuarios = descargarUsuarios();

  usuarios.splice(id, 1);

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  cargarUsuario();
}

function editar(id) {
  let usuarios = descargarUsuarios();

  document.getElementById("nombre").value = usuarios[id].nombre;

  document.getElementById("usuario").value = usuarios[id].nombreUsuario;

  document.getElementById("rolUsuario").value = usuarios[id].rolUsuario;

  idUsuarioUpdate = id;
}

function limpiarForm() {
  document.getElementById("nombre").value = "";

  document.getElementById("usuario").value = "";

  document.getElementById("rolUsuario").selectedIndex = 0;
}
