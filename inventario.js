// ==========================================================================
// CONSTANTE DE CONEXIÓN REST API (PROPORCIONADA POR EL USUARIO)
// ==========================================================================
const API_URL = "https://stock-flow-354d0-default-rtdb.firebaseio.com/productos";

// ==========================================================================
// REFERENCIAS DEL DOM
// ==========================================================================
const productoForm = document.getElementById("producto-form");
const btnGuardar = document.getElementById("btnGuardar");
const contenedorTablaComponente = document.getElementById("contenedor-tabla-componente");
const tipoProductoSelect = document.getElementById("tipo-producto");
const cantidadInput = document.getElementById("cantidad");

// Variable para controlar el Estado de Edición
let codigoEnEdicion = null;

// ==========================================================================
// CONTROL INTERACTIVO DE ENTRADA DE STOCK (PRODUCCIÓN VS COMPRA)
// ==========================================================================
tipoProductoSelect.addEventListener("change", () => {
    if (tipoProductoSelect.value === "si") {
        cantidadInput.value = 0;
        cantidadInput.disabled = true;
        cantidadInput.placeholder = "Se genera en producción";
    } else {
        cantidadInput.disabled = false;
        cantidadInput.placeholder = "0";
    }
});

// ==========================================================================
// COMPONENTE: OBTENER DATOS Y RENDERIZAR TABLA (GET)
// ==========================================================================
function cargarTablaComponente() {
    // Al usar la API REST de Firebase, añadimos obligatoriamente ".json" al final
    fetch(`${API_URL}.json`)
        .then(response => response.json())
        .then(productosDB => {
            
            // 1. Validar si la base de datos está vacía
            if (!productosDB) {
                contenedorTablaComponente.innerHTML = `
                    <div style="text-align: center; color: #777; padding: 32px 0; font-size: 14px;">
                        No hay artículos registrados en la base de datos de Firebase.
                    </div>`;
                return;
            }

            // 2. Estructura de cabeceras del componente Tabla
            let htmlComponente = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>¿Producto Terminado?</th>
                            <th>Stock</th>
                            <th>Precio Unitario</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            // 3. Iteramos las llaves del JSON (Códigos de producto)
            const codigos = Object.keys(productosDB);
            codigos.forEach(codigo => {
                const item = productosDB[codigo];
                const textoTerminado = item.productoTerminado === "si" ? "Sí (Producto)" : "No (Materia Prima)";

                htmlComponente += `
                    <tr>
                        <td><strong>${codigo}</strong></td>
                        <td>${item.nombre}</td>
                        <td>${textoTerminado}</td>
                        <td>${item.stock}</td>
                        <td>$${parseFloat(item.precio).toFixed(2)}</td>
                        <td>
                            <button class="btn-editar" onclick="prepararEdicion('${codigo}')">Editar</button>
                            <button class="btn-eliminar" onclick="eliminarProducto('${codigo}')">Eliminar</button>
                        </td>
                    </tr>
                `;
            });

            htmlComponente += `
                    </tbody>
                </table>
            `;

            // 4. Inyección del componente en el HTML
            contenedorTablaComponente.innerHTML = htmlComponente;
        })
        .catch(error => console.error("Error al leer de Firebase:", error));
}

// Carga inicial al abrir la página
cargarTablaComponente();

// ==========================================================================
// OPERACIÓN: GUARDAR NUEVO / ACTUALIZAR EXISTENTE (PUT / PATCH)
// ==========================================================================
productoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const tipoProducto = tipoProductoSelect.value;
    const cantidad = parseInt(cantidadInput.value);
    const precio = parseFloat(document.getElementById("precio").value);

    // Creamos la estructura del objeto a enviar
    const datosProducto = {
        nombre: nombre,
        productoTerminado: tipoProducto,
        stock: cantidad,
        precio: precio
    };

    if (codigoEnEdicion) {
        // --- MODO EDICIÓN (PATCH) ---
        fetch(`${API_URL}/${codigoEnEdicion}.json`, {
            method: 'PATCH',
            body: JSON.stringify(datosProducto),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(() => {
            // Si cambió a materia prima, eliminamos la receta usando DELETE en esa ruta específica
            if (tipoProducto === "no") {
                return fetch(`${API_URL}/${codigoEnEdicion}/receta.json`, { method: 'DELETE' });
            }
        })
        .then(() => {
            codigoEnEdicion = null;
            btnGuardar.textContent = "Guardar Artículo";
            cantidadInput.disabled = false;
            productoForm.reset();
            cargarTablaComponente(); // Recargamos el componente para ver los cambios
        });

    } else {
        // --- MODO NUEVO REGISTRO (PUT con ID manual incremental) ---
        fetch(`${API_URL}.json`)
            .then(res => res.json())
            .then(productosDB => {
                const totalExistentes = productosDB ? Object.keys(productosDB).length + 1 : 1;
                const prefijo = tipoProducto === "si" ? "PROD_" : "MAT_";
                const nuevoCodigo = prefijo + String(totalExistentes).padStart(3, '0');

                // Si es producto terminado agregamos una receta por defecto
                if (tipoProducto === "si") {
                    datosProducto.receta = { "harina": 100, "mantequilla": 100, "huevo": 1 };
                }

                // Guardamos directamente apuntando al nuevo nodo /productos/CODIGO.json
                return fetch(`${API_URL}/${nuevoCodigo}.json`, {
                    method: 'PUT',
                    body: JSON.stringify(datosProducto),
                    headers: { 'Content-Type': 'application/json' }
                });
            })
            .then(() => {
                productoForm.reset();
                cargarTablaComponente(); // Refrescar tabla dinámicamente
            });
    }
});

// ==========================================================================
// OPERACIÓN: PREPARAR EDICIÓN (TRAER REGISTRO DE FIREBASE)
// ==========================================================================
window.prepararEdicion = function(codigo) {
    fetch(`${API_URL}/${codigo}.json`)
        .then(res => res.json())
        .then(item => {
            document.getElementById("nombre").value = item.nombre;
            tipoProductoSelect.value = item.productoTerminado;
            cantidadInput.value = item.stock;
            document.getElementById("precio").value = item.precio;

            if (item.productoTerminado === "si") {
                cantidadInput.disabled = true;
            } else {
                cantidadInput.disabled = false;
            }

            codigoEnEdicion = codigo;
            btnGuardar.textContent = "Actualizar en Firebase";
            document.getElementById("nombre").focus();
        });
};

// ==========================================================================
// OPERACIÓN: ELIMINACIÓN FÍSICA (DELETE)
// ==========================================================================
window.eliminarProducto = function(codigo) {
    if (confirm(`¿Está seguro de eliminar permanentemente el artículo ${codigo}?`)) {
        fetch(`${API_URL}/${codigo}.json`, {
            method: 'DELETE'
        })
        .then(() => {
            cargarTablaComponente(); // Volver a pintar la tabla tras borrar
        });
    }
};