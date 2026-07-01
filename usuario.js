const URL = "https://stock-flow-354d0-default-rtdb.firebaseio.com";
const formUsuario = document.getElementById("usuario-from");

let listaUsuarios = [];
let idUsuarioUpdate = null;

document.addEventListener("DOMContentLoaded", () => {
  let login = sessionStorage.getItem("login");

  if (login != "True") {
    window.location.href = "login.html";
  }

  cargarUsuario();
});

formUsuario.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre");
  const usuario = document.getElementById("usuario");
  const rolUsuario = document.getElementById("rolUsuario");

  let nuevoUsuario = {
    nombre: nombre.value,
    nombreUsuario: usuario.value,
    rolUsuario: rolUsuario.value,
  };

  let usuarios = descargarUsuarios();

  if (usuarios == null) {
    usuarios = [];
  }

  if (idUsuarioUpdate != null) {
    usuarios[idUsuarioUpdate] = nuevoUsuario;

    alert("Usuario actualizado correctamente");
  } else {
    usuarios.push(nuevoUsuario);

    alert("Usuario registrado correctamente");
  }

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  idUsuarioUpdate = null;

  limpiarForm();

  cargarUsuario();
});

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
