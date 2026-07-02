const API_URL = "https://stock-flow-354d0-default-rtdb.firebaseio.com/usuarios";
const formUsuario = document.getElementById("usuario-from");

// Variable para saber si estamos editando un usuario existente (guarda su ID de Firebase)
let idUsuarioUpdate = null;

document.addEventListener("DOMContentLoaded", () => {
  // Inicializa la descarga y renderizado de los usuarios al cargar la página
  cargarUsuarios();
});

// Guardar o Actualizar Usuario
formUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const confirmarPassword = document.getElementById("confirmarPassword").value;

  if (password !== confirmarPassword) {
      alert("Las contraseñas no coinciden");
      return;
  }

  const datosUsuario = {
      identificacion: document.getElementById("identificacion").value,
      nombre: document.getElementById("nombre").value,
      cargo: document.getElementById("cargo").value,
      password: password
  };

  try {
      let url = `${API_URL}.json`;
      let metodo = "POST";

      // Si idUsuarioUpdate tiene un valor, significa que estamos editando un registro
      if (idUsuarioUpdate) {
          url = `${API_URL}/${idUsuarioUpdate}.json`;
          metodo = "PUT"; // Reemplaza los datos en ese ID específico de Firebase
      }

      const respuesta = await fetch(url, {
          method: metodo,
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(datosUsuario)
      });

      if (respuesta.ok) {
          alert(idUsuarioUpdate ? "Usuario actualizado correctamente" : "Usuario registrado correctamente");
          formUsuario.reset();
          idUsuarioUpdate = null; // Limpiar el estado de edición
          
          // Restaurar el texto original del botón
          formUsuario.querySelector("button[type='submit']").textContent = "Guardar Usuario";
          
          // Recargar el Web Component de la tabla con los datos frescos
          cargarUsuarios();
      }
  } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      alert("Error al conectar con la base de datos");
  }
});

// Obtener usuarios desde Firebase
async function descargarUsuarios() {
  try {
      const respuesta = await fetch(`${API_URL}.json`);
      const datos = await respuesta.json();

      if (!datos) return [];

      // Mapeamos el objeto JSON de Firebase a un Array incluyendo el ID dinámico de la llave
      return Object.keys(datos).map(id => ({
          id,
          ...datos[id]
      }));
  } catch (error) {
      console.error("Error al descargar usuarios:", error);
      return [];
  }
}

// Renderizar la tabla de usuarios utilizando el Web Component <mi-tabla>
async function cargarUsuarios() {
  const contenedorTabla = document.getElementById("contenedorTabla");
  contenedorTabla.innerHTML = "<p>Cargando usuarios...</p>";

  const usuarios = await descargarUsuarios();

  // 1. Creamos la instancia de nuestro Web Component personalizado
  const miTablaComponent = document.createElement("mi-tabla");

  // 2. Definimos las columnas visuales y las propiedades internas de los objetos JSON
  const columnas = ["Nombre", "Identificación", "Cargo"];
  const claves = ["nombre", "identificacion", "cargo"];

  // 3. Pasamos los datos al componente para que genere el HTML de la tabla
  miTablaComponent.setTabla(columnas, claves, usuarios);

  // 4. Escuchamos el evento personalizado de edición que emite la tabla
  miTablaComponent.addEventListener("editar-fila", (e) => {
      const { id, datos } = e.detail;
      prepararEdicion(id, datos.nombre, datos.identificacion, datos.cargo, datos.password);
  });

  // 5. Escuchamos el evento personalizado de eliminación que emite la tabla
  miTablaComponent.addEventListener("eliminar-fila", (e) => {
      const { id } = e.detail;
      eliminarUsuario(id);
  });

  // 6. Limpiamos el contenedor e inyectamos el componente listo en el DOM
  contenedorTabla.innerHTML = "";
  contenedorTabla.appendChild(miTablaComponent);
}

// Cargar los datos en el formulario para iniciar la edición
function prepararEdicion(id, nombre, identificacion, cargo, password) {
  document.getElementById("nombre").value = nombre;
  document.getElementById("identificacion").value = identificacion;
  document.getElementById("cargo").value = cargo;
  document.getElementById("password").value = password;
  document.getElementById("confirmarPassword").value = password;

  idUsuarioUpdate = id; // Guardamos el ID de Firebase para usarlo en el submit (PUT)

  // Cambiar el texto del botón principal para guiar visualmente al usuario
  formUsuario.querySelector("button[type='submit']").textContent = "Actualizar Usuario";
}

// Eliminar usuario de Firebase
async function eliminarUsuario(id) {
  if (!confirm("¿Está seguro de que desea eliminar este usuario?")) return;

  try {
      const respuesta = await fetch(`${API_URL}/${id}.json`, {
          method: "DELETE"
      });

      if (respuesta.ok) {
          alert("Usuario eliminado correctamente");
          cargarUsuarios(); // Recargar la lista de la tabla
      } else {
          alert("No se pudo eliminar el usuario");
      }
  } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error de red al intentar eliminar");
  }
}