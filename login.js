const form = document.querySelector("#form-login");

form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const identificacionInput = document.querySelector("#identificacion").value.trim();
    const claveInput = document.querySelector("#clave").value;

    // Buscamos el usuario en la base de datos
    const user = await validateUser(identificacionInput, claveInput);

    if (user !== null) {
        alert(`¡Bienvenido al sistema, ${user.nombre}!`);
        sessionStorage.setItem("login", "True");
        sessionStorage.setItem("usuarioActivo", JSON.stringify(user));
        
        // Redirección al módulo de usuarios tras el éxito
        window.location.href = "usuarios.html";
        return;
    }

    alert("Número de identificación o contraseña incorrectos.");
});

async function validateUser(userId, userPassword) {
    try {
        // Consultamos el nodo correcto en Firebase: /usuarios
        const res = await fetch("https://stock-flow-354d0-default-rtdb.firebaseio.com/usuarios.json");
        const datos = await res.json();

        if (!datos) return null;

        // CORREGIDO: Usamos 'in' en lugar de 'en' para recorrer el objeto correctamente
        for (const id in datos) {
            const usuario = datos[id];
            
            // Validamos que coincida el número de identificación y la contraseña (password)
            if (usuario.identificacion === userId && usuario.password === userPassword) {
                return usuario; // Retorna el objeto del usuario encontrado
            }
        }
        
        return null; // No se encontró coincidencia
    } catch (err) {
        console.error("Error en la autenticación:", err);
        return null;
    }
}