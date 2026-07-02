class tabla extends HTMLElement{
    constructor(){
        super();
        this.filas = [];
        this.columnas = [];
    }
    setTabla(columnas,filas){
        this.columnas = columnas;
        this.filas = filas;
        this.crearTabla();
    }
    crearTabla(){
        let columnasHtml = "";
        this.columnas.forEach(columna=>{
            columnasHtml+= `<th>${columna}</th>`
        })
        let filasHtml = "";

        this.filas.forEach(fila =>{

            filasHtml += `<tr>`;

            for(let i=0;i<this.columnas.length-1;i++){
                filasHtml += `<td>${fila[this.columnas[i]]}</td>`

            }
            
            filasHtml += `<td><button>Act</button></td>`;
            filasHtml += `<td><button>Eli</button></td>`;
            filasHtml += `</tr>`;
        })


        this.innerHTML = `
            <table>
                <thead>
                    <tr>
                        ${columnasHtml}
                    </tr>
                </thead>
                <tbody>
                    ${filasHtml}
                </tbody>
            </table>
        `;
    }
}
customElements.define("mi-tabla",tabla)