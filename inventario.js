const btnGuardarProducto = document.getElementById("producto-form");
let listaInventario = []
let idProductoUpdate = null;


document.addEventListener("DOMContentLoaded",()=>{
    let login = sessionStorage.getItem("login")
    /*
    if(login != "True"){
        window.location.href = "login.html";
    }*/
})

btnGuardarProducto.addEventListener("submit",(ev)=>{
    ev.preventDefault();
    const nombre = document.getElementById("nombre")
    const cantidad = document.getElementById("cantidad")
    const precio = document.getElementById("precio")


    let producto={
        nombre:nombre.value,
        cantidad:cantidad.value,
        precio:precio.value
    }


    const inventario = descargarInventario();

    if(idProductoUpdate != null){
        inventario[idProductoUpdate] = producto;
        listaInventario = inventario;
        alert("Producto Modificado Exitosamente");
    }else{
        if(inventario != null){
            inventario.push(producto);
            listaInventario = inventario;
        }else{
            listaInventario.push(producto);
        }
    }
    

    localStorage.setItem("inventario",JSON.stringify(listaInventario))
    cargarInventario();
    limpiarForm();
    idProductoUpdate = null;
})

function cargarInventario(){
   const tablaProductos = document.querySelector("#tablaProductos");
   let inventario = descargarInventario();
   let html = ""; 
   for(let i = 0; i<inventario.length;i++){
    html += `
        <tr>
            <td>${i+1}</td>
            <td>${inventario[i].nombre}</td>
            <td>${inventario[i].cantidad}</td>
            <td>$${inventario[i].precio}</td>
            <td>
                <button class="btn-editar" onClick = "editar(${i})">Editar</button>
                <button class="btn-eliminar" onClick = "eliminar(${i})">Eliminar</button>
            </td>
        </tr>        
        `;
   }
   tablaProductos.innerHTML = html;
}

function descargarInventario(){
    return JSON.parse(localStorage.getItem("inventario"));
}

function eliminar(idProducto){
    let inventario = descargarInventario();
    inventario.splice(idProducto,1)
    localStorage.setItem("inventario",JSON.stringify(inventario))
    cargarInventario();
}

function editar(idProducto){
    let inventario = descargarInventario();
    
    const nombre = document.getElementById("nombre")
    const cantidad = document.getElementById("cantidad")
    const precio = document.getElementById("precio")

    nombre.value = inventario[idProducto].nombre
    cantidad.value = inventario[idProducto].cantidad
    precio.value = inventario[idProducto].precio

    idProductoUpdate = idProducto;
}

function limpiarForm(){
    const nombre = document.getElementById("nombre")
    const cantidad = document.getElementById("cantidad")
    const precio = document.getElementById("precio")

    nombre.value = "";
    cantidad.value = "";
    precio.value = "";

}
cargarInventario();

