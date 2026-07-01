const form = document.querySelector("#form-login");

form.addEventListener("submit",(ev)=>{
    ev.preventDefault();

    const identificacion = document.querySelector("#identificacion");
    const password = document.querySelector("#password");

    let users = descargarUsuarios();

    if(users == null){
        alert("No hay usuarios registrados");
        return;
    }

    for(let i = 0; i < users.length; i++){

        if(
            identificacion.value == users[i].identificacion &&
            password.value == users[i].password
        ){
            sessionStorage.setItem("login","True");
            window.location.href = "inventario.html";
            return;
        }

    }

    alert("Credenciales Incorrectas");
});

function descargarUsuarios(){
    return JSON.parse(localStorage.getItem("usuarios"));
}