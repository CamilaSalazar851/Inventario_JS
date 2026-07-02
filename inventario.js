const API_URL = "https://stock-flow-354d0-default-rtdb.firebaseio.com/productos";
const formProducto = document.getElementById("producto-form"); 
const formStock = document.getElementById("form-stock");
const chkEsTerminado = document.getElementById("esTerminado");
const seccionFormula = document.getElementById("seccion-formula");
const btnAgregarIngrediente = document.getElementById("btn-agregar-ingrediente");
const txtBuscador = document.getElementById("buscador");

let formulaTemporal = {}; 
let todosLosProductos = []; 
let ModoEdicion = false; 

document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("login") !== "True") {
        window.location.href = "login.html";
        return;
    }
    
    chkEsTerminado.addEventListener("change", (e) => {
        seccionFormula.style.display = e.target.checked ? "block" : "none";
        if (e.target.checked) cargarSelectMateriasPrimas();
    });

    btnAgregarIngrediente.addEventListener("click", agregarIngredienteAFormula);
    txtBuscador.addEventListener("input", filtrarProductos);

    cargarInventario();
});

// Guardar o modificar un producto utilizando su CÓDIGO único como clave en Firebase
formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = document.getElementById("codigo").value.trim();
    const nombre = document.getElementById("nombre").value.trim();
    const proveedor = document.getElementById("proveedor").value.trim();
    const esTerminado = chkEsTerminado.checked;

    const producto = {
        codigo,
        nombre,
        proveedor,
        esTerminado,
        stock: 0 
    };

    if (esTerminado) {
        if (Object.keys(formulaTemporal).length === 0) {
            alert("Por favor, añada al menos una materia prima a la fórmula.");
            return;
        }
        producto.formula = formulaTemporal;
    }

    try {
        if (ModoEdicion) {
            const resProd = await fetch(`${API_URL}/${codigo}.json`);
            const prodActual = await resProd.json();
            if (prodActual) {
                producto.stock = prodActual.stock || 0;
            }
        }

        const respuesta = await fetch(`${API_URL}/${codigo}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto)
        });

        if (respuesta.ok) {
            alert(ModoEdicion ? "Producto actualizado con éxito" : "Producto registrado con éxito");
            
            formProducto.reset();
            document.getElementById("codigo").disabled = false;
            seccionFormula.style.display = "none";
            formulaTemporal = {};
            document.getElementById("lista-formula-visual").innerHTML = "";
            ModoEdicion = false;
            formProducto.querySelector("button[type='submit']").textContent = "Guardar Producto";
            
            cargarInventario();
        }
    } catch (error) {
        console.error("Error al guardar el producto:", error);
    }
});

// Incrementar saldo de un artículo en stock (Abastecimiento)
formStock.addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = document.getElementById("codigo-stock").value.trim();
    const cantidadAumentar = parseInt(document.getElementById("cantidad-stock").value);

    try {
        const respuestaVerificar = await fetch(`${API_URL}/${codigo}.json`);
        const productoExistente = await respuestaVerificar.json();

        if (!productoExistente) {
            alert("El código del producto no se encuentra registrado.");
            return;
        }

        const nuevoStock = (productoExistente.stock || 0) + cantidadAumentar;

        const respuestaUpdate = await fetch(`${API_URL}/${codigo}/stock.json`, {
            method: "PUT",
            body: JSON.stringify(nuevoStock)
        });

        if (respuestaUpdate.ok) {
            alert(`Stock incrementado con éxito. Saldo actual: ${nuevoStock}`);
            formStock.reset();
            cargarInventario();
        }
    } catch (error) {
        console.error("Error al actualizar el stock:", error);
    }
});

async function descargarInventario() {
    try {
        const respuesta = await fetch(`${API_URL}.json`);
        const datos = await respuesta.json();
        if (!datos) return [];
        return Object.keys(datos).map(key => datos[key]);
    } catch (error) {
        console.error("Error al descargar inventario:", error);
        return [];
    }
}

async function cargarInventario() {
    const contenedor = document.getElementById("contenedorTablaInventario");
    contenedor.innerHTML = "<p>Cargando inventario de la planta...</p>";

    todosLosProductos = await descargarInventario();
    renderizarTabla(todosLosProductos);
}

function renderizarTabla(lista) {
    const contenedor = document.getElementById("contenedorTablaInventario");
    contenedor.innerHTML = "";

    const miTabla = document.createElement("mi-tabla");
    
    const columnas = ["Código", "Nombre", "Proveedor", "Stock actual"];
    const claves = ["codigo", "nombre", "proveedor", "stock"];

    miTabla.setTabla(columnas, claves, lista);

    miTabla.addEventListener("editar-fila", (e) => {
        const { id, datos } = e.detail;
        ModoEdicion = true;
        
        formProducto.querySelector("button[type='submit']").textContent = "Actualizar Producto";
        
        document.getElementById("codigo").value = datos.codigo;
        document.getElementById("codigo").disabled = true; 
        document.getElementById("nombre").value = datos.nombre;
        document.getElementById("proveedor").value = datos.proveedor;
        
        if (datos.esTerminado) {
            document.getElementById("esTerminado").checked = true;
            seccionFormula.style.display = "block";
            formulaTemporal = datos.formula || {};
            
            cargarSelectMateriasPrimas();
            const listaVisual = document.getElementById("lista-formula-visual");
            listaVisual.innerHTML = "";
            Object.keys(formulaTemporal).forEach(mpCodigo => {
                const li = document.createElement("li");
                li.textContent = `Materia Prima: ${mpCodigo} ➔ Cantidad Requerida: ${formulaTemporal[mpCodigo]}`;
                listaVisual.appendChild(li);
            });
        } else {
            document.getElementById("esTerminado").checked = false;
            seccionFormula.style.display = "none";
            formulaTemporal = {};
        }
    });

    miTabla.addEventListener("eliminar-fila", async (e) => {
        const { id } = e.detail;
        if (confirm(`¿Está seguro de que desea eliminar el producto con código: ${id}?`)) {
            try {
                const respuesta = await fetch(`${API_URL}/${id}.json`, {
                    method: "DELETE"
                });
                if (respuesta.ok) {
                    alert("Producto eliminado correctamente.");
                    cargarInventario();
                }
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
            }
        }
    });

    contenedor.appendChild(miTabla);
}

function cargarSelectMateriasPrimas() {
    const select = document.getElementById("select-materia-prima");
    select.innerHTML = '<option value="">-- Seleccione Materia Prima --</option>';

    const materiasPrimas = todosLosProductos.filter(p => !p.esTerminado);

    materiasPrimas.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.codigo;
        opt.textContent = `${m.nombre} (${m.codigo})`;
        select.appendChild(opt);
    });
}

function agregarIngredienteAFormula() {
    const select = document.getElementById("select-materia-prima");
    const cantidad = parseInt(document.getElementById("cantidad-materia").value);

    if (!select.value || isNaN(cantidad) || cantidad <= 0) {
        alert("Selecciona una materia prima y asigne una cantidad válida.");
        return;
    }

    formulaTemporal[select.value] = cantidad;

    const listaVisual = document.getElementById("lista-formula-visual");
    const li = document.createElement("li");
    li.textContent = `Materia Prima: ${select.value} ➔ Cantidad Requerida: ${cantidad}`;
    listaVisual.appendChild(li);

    select.value = "";
    document.getElementById("cantidad-materia").value = "";
}

function filtrarProductos() {
    const texto = txtBuscador.value.toLowerCase();
    const filtrados = todosLosProductos.filter(p => 
        p.nombre.toLowerCase().includes(texto) || 
        p.codigo.toLowerCase().includes(texto)
    );
    renderizarTabla(filtrados);
}