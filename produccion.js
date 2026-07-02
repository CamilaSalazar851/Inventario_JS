const API_URL = "https://stock-flow-354d0-default-rtdb.firebaseio.com/productos";
const formProduccion = document.getElementById("form-produccion");
const selectProducto = document.getElementById("select-producto-terminado");
const txtCantidad = document.getElementById("cantidad-producir");
const vistaReceta = document.getElementById("vista-receta");
const listaInsumos = document.getElementById("lista-insumos-unidades");

let productosBD = {}; // Guardará todos los productos indexados por código

document.addEventListener("DOMContentLoaded", async () => {
    if (sessionStorage.getItem("login") !== "True") {
        window.location.href = "login.html";
        return;
    }

    await cargarProductos();
    
    // Escuchar cuando el usuario cambia de producto para mostrarle su receta
    selectProducto.addEventListener("change", mostrarRecetaItem);
});

// Cargar productos en el selector (Solo los productos terminados que tienen una fórmula)
async function cargarProductos() {
    try {
        const res = await fetch(`${API_URL}.json`);
        productosBD = await res.json() || {};

        selectProducto.innerHTML = '<option value="">-- Seleccione un Producto --</option>';

        Object.keys(productosBD).forEach(codigo => {
            const prod = productosBD[codigo];
            // Solo añadimos los productos fabricados que tienen una fórmula definida
            if (prod.esTerminado && prod.formula) {
                const opt = document.createElement("option");
                opt.value = prod.codigo;
                opt.textContent = `${prod.nombre} (${prod.codigo})`;
                selectProducto.appendChild(opt);
            }
        });
    } catch (error) {
        console.error("Error al cargar productos en producción:", error);
    }
}

// Mostrar los ingredientes en pantalla
function mostrarRecetaItem() {
    const codigoSelect = selectProducto.value;
    if (!codigoSelect || !productosBD[codigoSelect]) {
        vistaReceta.style.display = "none";
        return;
    }

    const producto = productosBD[codigoSelect];
    listaInsumos.innerHTML = "";
    
    Object.keys(producto.formula).forEach(mpCodigo => {
        const nombreMP = productosBD[mpCodigo] ? productosBD[mpCodigo].nombre : mpCodigo;
        const li = document.createElement("li");
        li.textContent = `${nombreMP}: ${producto.formula[mpCodigo]} por unidad.`;
        listaInsumos.appendChild(li);
    });

    vistaReceta.style.display = "block";
}

// Procesar la Fabricación y aplicar los descuentos automáticos
formProduccion.addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigoPT = selectProducto.value;
    const cantidadAProducir = parseInt(txtCantidad.value);

    if (!codigoPT || isNaN(cantidadAProducir) || cantidadAProducir <= 0) {
        alert("Seleccione un producto y cantidad válidos.");
        return;
    }

    // Volvemos a descargar los datos de Firebase para asegurarnos de tener el stock exacto al segundo actual
    try {
        const resFiltro = await fetch(`${API_URL}.json`);
        productosBD = await resFiltro.json() || {};

        const productoTerminado = productosBD[codigoPT];
        const formula = productoTerminado.formula;

        // --- PASO 1: VALIDAR REQUISITOS DE MATERIA PRIMA ---
        let sePuedeProducir = true;
        let reporteFaltantes = "";

        Object.keys(formula).forEach(mpCodigo => {
            const cantidadRequeridaPorUnidad = formula[mpCodigo];
            const cantidadTotalNecesaria = cantidadRequeridaPorUnidad * cantidadAProducir;
            
            const materiaPrimaActual = productosBD[mpCodigo];
            const stockMateriaActual = materiaPrimaActual ? (materiaPrimaActual.stock || 0) : 0;

            if (stockMateriaActual < cantidadTotalNecesaria) {
                sePuedeProducir = false;
                const nombreMP = materiaPrimaActual ? materiaPrimaActual.nombre : mpCodigo;
                reporteFaltantes += `\n- ${nombreMP}: Falta(n) ${cantidadTotalNecesaria - stockMateriaActual} unidades (Stock actual: ${stockMateriaActual}).`;
            }
        });

        if (!sePuedeProducir) {
            alert(`No hay suficiente materia prima en Planta Macondo para fabricar ${cantidadAProducir} unidades de ${productoTerminado.nombre}.${reporteFaltantes}`);
            return;
        }

        // --- PASO 2: APLICAR DESCUENTOS EN MATERIA PRIMA ---
        for (const mpCodigo of Object.keys(formula)) {
            const cantidadTotalNecesaria = formula[mpCodigo] * cantidadAProducir;
            const nuevoStockMP = productosBD[mpCodigo].stock - cantidadTotalNecesaria;

            // Guardar descuento en Firebase
            await fetch(`${API_URL}/${mpCodigo}/stock.json`, {
                method: "PUT",
                body: JSON.stringify(nuevoStockMP)
            });
        }

        // --- PASO 3: SUMAR EL STOCK AL PRODUCTO TERMINADO ---
        const nuevoStockPT = (productoTerminado.stock || 0) + cantidadAProducir;
        await fetch(`${API_URL}/${codigoPT}/stock.json`, {
            method: "PUT",
            body: JSON.stringify(nuevoStockPT)
        });

        alert(`¡Producción exitosa! Se fabricaron ${cantidadAProducir} unidades de ${productoTerminado.nombre}.\nLas materias primas han sido descontadas correctamente del almacén.`);
        
        formProduccion.reset();
        vistaReceta.style.display = "none";
        await cargarProductos(); // Recargar datos de la BD local

    } catch (error) {
        console.error("Error en el proceso de producción:", error);
        alert("Ocurrió un error al procesar la producción.");
    }
});