// js/filtros.js

document.addEventListener('DOMContentLoaded', () => {
    const inputBusqueda = document.getElementById('input-busqueda');
    const selectTemporada = document.getElementById('select-temporada');
    const tarjetasPlantas = document.querySelectorAll('#lista-plantas .servicio-item');

    // Función auxiliar para quitar tildes y normalizar textos
    function normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""); // Remueve tildes (ó -> o, ñ se mantiene si es necesario, pero limpia diacríticos)
    }

    if (inputBusqueda && selectTemporada) {
        
        function filtrarPlantas() {
            // Normalizamos la búsqueda de texto y la temporada seleccionada
            let texto = normalizarTexto(inputBusqueda.value);
            let temporadaSeleccionada = normalizarTexto(selectTemporada.value);

            tarjetasPlantas.forEach(tarjeta => {
                let nombrePlanta = normalizarTexto(tarjeta.querySelector('h3').textContent);
                let estacionesTarjeta = normalizarTexto(tarjeta.getAttribute('data-estacion') || '');

                // Lógica de concordancia
                let coincideTexto = nombrePlanta.includes(texto);
                
                // Si elige "todos", se muestra todo. Si no, busca si la temporada seleccionada está contenida en el atributo data-estacion
                let coincideTemporada = (temporadaSeleccionada === 'todos') || estacionesTarjeta.includes(temporadaSeleccionada);

                // Ambas condiciones deben cumplirse
                if (coincideTexto && coincideTemporada) {
                    tarjeta.style.display = "block";
                } else {
                    tarjeta.style.display = "none";
                }
            });
        }

        // Asignar los escuchadores de eventos
        inputBusqueda.addEventListener('keyup', filtrarPlantas);
        selectTemporada.addEventListener('change', filtrarPlantas);
    }
});