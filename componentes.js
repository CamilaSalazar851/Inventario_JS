class Tabla extends HTMLElement {
    constructor() {
        super();
        this.filas = [];
        this.columnas = [];
        this.claves = [];
    }

    // Añadimos 'claves' para saber qué campos del JSON de Firebase renderizar
    setTabla(columnas, claves, filas) {
        this.columnas = columnas;
        this.claves = claves;
        this.filas = filas;
        this.crearTabla();
    }

    crearTabla() {
        let columnasHtml = "";
        this.columnas.forEach(columna => {
            columnasHtml += `<th>${columna}</th>`;
        });
        
        // Añadir encabezado para la columna de acciones si hay datos
        if (this.filas.length > 0) {
            columnasHtml += `<th>Acciones</th>`;
        }

        let filasHtml = "";
        this.filas.forEach((fila, index) => {
            filasHtml += `<tr>`;

            // CORREGIDO: Buscamos en la fila usando las claves lógicas correspondientes
            this.claves.forEach(clave => {
                filasHtml += `<td>${fila[clave] !== undefined ? fila[clave] : ''}</td>`;
            });
            
            // CORREGIDO: Agregamos data-attributes para identificar la fila por su código único o índice
            const idRegistro = fila.codigo || fila.id; 
            filasHtml += `
                <td>
                    <button class="btn-editar" data-id="${idRegistro}" data-index="${index}">Editar</button>
                    <button class="btn-eliminar" data-id="${idRegistro}" data-index="${index}">Eliminar</button>
                </td>
            `;
            filasHtml += `</tr>`;
        });

        this.innerHTML = `
            <table>
                <thead>
                    <tr>
                        ${columnasHtml}
                    </tr>
                </thead>
                <tbody>
                    ${this.filas.length === 0 
                        ? `<tr><td colspan="${this.columnas.length + 1}">No hay registros disponibles</td></tr>` 
                        : filasHtml
                    }
                </tbody>
            </table>
        `;

        // CORREGIDO: Conectamos los listeners una vez el HTML se ha insertado en el DOM
        this.conectarEventos();
    }

    conectarEventos() {
        // Escuchar clics en botones de Editar
        this.querySelectorAll('.btn-editar').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const index = e.target.getAttribute('data-index');
                const datosFila = this.filas[index];

                // Despachamos un evento personalizado hacia el script principal
                this.dispatchEvent(new CustomEvent('editar-fila', {
                    detail: { id, datos: datosFila }
                }));
            });
        });

        // Escuchar clics en botones de Eliminar
        this.querySelectorAll('.btn-eliminar').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                
                this.dispatchEvent(new CustomEvent('eliminar-fila', {
                    detail: { id }
                }));
            });
        });
    }
}

customElements.define("mi-tabla", Tabla);