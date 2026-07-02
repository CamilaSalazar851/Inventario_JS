const form = document.querySelector("#form-login");

form.addEventListener("submit",async (ev)=>{
    ev.preventDefault();

    const identificacion = document.querySelector("#identificacion");
    const clave = document.querySelector("#clave");

    const user = await validateUser(identificacion.value)

    if (user != null) {
        
        if (clave.value === user.clave) {
            alert("Credenciales correctas");
            window.location.href="usuarios.html";
            return;
        } 
    }

    alert("Credenciales Incorrectas");
});

async function validateUser(userId){
    try {
        const res = await fetch(`https://stock-flow-354d0-default-rtdb.firebaseio.com/user/${userId}.json`);
    return await res.json()
    } catch(err) {
        console.error(err);
        return null;
    }
}