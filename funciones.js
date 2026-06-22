document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================================================
    // 1. CONTROLADOR DEL MENÚ RESPONSIVE (FLEXBOX)
    // ==========================================================================
    const btnMenu = document.getElementById("btn-menu");
    const navegacion = document.getElementById("navegacion");

    if (btnMenu && navegacion) {
        btnMenu.addEventListener("click", () => {
            navegacion.classList.toggle("activo");
        });

        const enlaces = document.querySelectorAll(".nav-menu a");
        enlaces.forEach(enlace => {
            enlace.addEventListener("click", () => {
                navegacion.classList.remove("activo");
            });
        });
    }


    // ==========================================================================
    // 2. CONTROLADOR DEL CARRUSEL DINÁMICO
    // ==========================================================================
    const slides = document.querySelectorAll(".carrusel-slide");
    let indiceActual = 0; 

    function cambiarFoto() {
        if (slides.length > 0) {
            slides[indiceActual].classList.remove("activo");
            indiceActual = (indiceActual + 1) % slides.length;
            slides[indiceActual].classList.add("activo");
        }
    }

    if (slides.length > 0) {
        setInterval(cambiarFoto, 4000);
    }


    // ==========================================================================
    // 3. SINCRONIZACIÓN DE PRECIOS EN TIEMPO REAL (SELECTOR -> TABLA)
    // ==========================================================================
    const selectorPlanta = document.getElementById("tipo-planta");
    const celdaPrecioTabla = document.getElementById("precio-tabla-plantas");

    if (selectorPlanta && celdaPrecioTabla) {
        selectorPlanta.addEventListener("change", () => {
            const opcionSeleccionada = selectorPlanta.options[selectorPlanta.selectedIndex];
            const nuevoPrecio = opcionSeleccionada.getAttribute("data-precio");
            
            celdaPrecioTabla.textContent = `S/ ${nuevoPrecio} por unidad`;
            
            celdaPrecioTabla.style.color = "#4CAF50";
            celdaPrecioTabla.style.fontWeight = "bold";
            setTimeout(() => {
                celdaPrecioTabla.style.color = "#2d5a27"; 
            }, 600);
        });
    }


        // ==========================================================================
    // 4. SISTEMA DE CARRITO DE COMPRAS Y PASARELA DE PAGO (DOM CONTROLADO + UTP)
    // ==========================================================================
    const carritoPanel = document.getElementById("carrito-panel");
    const abrirCarritoBtn = document.getElementById("abrir-carrito-btn");
    const cerrarCarrito = document.getElementById("cerrar-carrito");
    const contenedorItems = document.getElementById("carrito-items");
    const totalTexto = document.getElementById("carrito-total");
    const botonesComprar = document.querySelectorAll(".btn-comprar");
    
    // Elementos de la pasarela de pago modal
    const btnProcederPago = document.querySelector(".btn-pagar"); 
    const modalPago = document.getElementById("modal-pago");
    const cerrarPagoBtn = document.getElementById("cerrar-pago-btn");
    const montoFinalModal = document.getElementById("monto-final-modal");
    const formularioPago = document.getElementById("formulario-pago");

    // Elementos del sistema de cupones
    const inputCupon = document.getElementById("pago-cupon-input");
    const btnAplicarCupon = document.getElementById("btn-aplicar-cupon");
    const mensajeCupon = document.getElementById("mensaje-cupon-estado");

    let listaCarrito = [];
    let sumaTotalGlobal = 0; 
    let descuentoAplicado = 0; 

    // Escuchadores para abrir y cerrar el panel lateral del carrito
    if (abrirCarritoBtn && carritoPanel) {
        abrirCarritoBtn.addEventListener("click", () => {
            carritoPanel.classList.add("abierto");
        });
    }

    if (cerrarCarrito && carritoPanel) {
        cerrarCarrito.addEventListener("click", () => {
            carritoPanel.classList.remove("abierto");
        });
    }

    // Al presionar "Proceder al Pago" en el carrito lateral
    if (btnProcederPago && modalPago) {
        btnProcederPago.addEventListener("click", () => {
            if (listaCarrito.length === 0) {
                // Función propia de JS (alert)
                alert("Tu carrito está vacío. Añade algunos productos para proceder al pago.");
                return;
            }
            
            // Reiniciamos el estado del cupón para una nueva sesión de pago
            descuentoAplicado = 0;
            if (inputCupon) inputCupon.value = "";
            if (mensajeCupon) { mensajeCupon.textContent = ""; mensajeCupon.className = "msg-cupon"; }
            if (btnAplicarCupon) btnAplicarCupon.disabled = false;

            montoFinalModal.textContent = `S/ ${sumaTotalGlobal.toFixed(2)}`;
            carritoPanel.classList.remove("abierto");
            modalPago.classList.add("mostrar");
        });
    }

    // Lógica de procesamiento del cupón mediante el DOM
    if (btnAplicarCupon && inputCupon && mensajeCupon) {
        btnAplicarCupon.addEventListener("click", () => {
            const codigoIngresado = inputCupon.value.trim().toUpperCase();

            if (codigoIngresado === "ECOJARDIN15") {
                descuentoAplicado = sumaTotalGlobal * 0.15;
                const nuevoTotal = sumaTotalGlobal - descuentoAplicado;

                // Modificamos el DOM para actualizar el precio reflejado al cliente
                montoFinalModal.innerHTML = `<del style="color:#aaa; font-size:1rem;">S/ ${sumaTotalGlobal.toFixed(2)}</del> S/ ${nuevoTotal.toFixed(2)}`;
                
                mensajeCupon.textContent = `¡Cupón aplicado correctamente! Se descontó S/ ${descuentoAplicado.toFixed(2)}`;
                mensajeCupon.className = "msg-cupon cupon-exito";
                btnAplicarCupon.disabled = true; 
            } else {
                mensajeCupon.textContent = "Código de descuento inválido o expirado.";
                mensajeCupon.className = "msg-cupon cupon-error";
            }
        });
    }

    if (cerrarPagoBtn && modalPago) {
        cerrarPagoBtn.addEventListener("click", () => {
            modalPago.classList.remove("mostrar");
        });
    }

    // Procesar la transacción final al presionar "Confirmar Transacción"
    if (formularioPago && modalPago) {
        formularioPago.addEventListener("submit", (e) => {
            e.preventDefault(); // Evitamos que la página web se recargue por defecto

            const titular = document.getElementById("pago-nombre").value;
            const montoFinalCobrado = sumaTotalGlobal - descuentoAplicado;

            // --- FUNCIÓN PROPIA DE JAVASCRIPT SEGÚN LA GUÍA UTP: confirm() ---
            const usuarioConfirma = confirm(`¿Estás seguro de que deseas proceder con el pago seguro de S/ ${montoFinalCobrado.toFixed(2)}?`);

            // Si presiona "Cancelar", la función se detiene con un return
            if (!usuarioConfirma) {
                alert("Transacción cancelada de forma segura por el usuario.");
                return; 
            }

            // --- FUNCIÓN PROPIA DE JAVASCRIPT SEGÚN LA GUÍA UTP: alert() ---
            alert(`¡Transacción Exitosa!\n\nGracias ${titular}, tu pago por S/ ${montoFinalCobrado.toFixed(2)} ha sido procesado de forma segura.\nEcoJardin empezará a preparar tu pedido de inmediato.`);
            
            // Limpieza absoluta del sistema tras la compra exitosa
            listaCarrito = [];
            renderizarCarrito();
            formularioPago.reset();
            modalPago.classList.remove("mostrar");
        });
    }

    // Captura de clics en los botones "Comprar" de las tarjetas HTML
    botonesComprar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const tarjeta = e.target.closest(".producto-card");
            let titulo = tarjeta.querySelector("h3").textContent;
            let precio = 0;

            if (titulo.includes("Ornamentales")) {
                const selector = tarjeta.querySelector(".select-tipo-planta");
                const opcionSeleccionada = selector.options[selector.selectedIndex];
                titulo = opcionSeleccionada.value;
                precio = parseFloat(opcionSeleccionada.getAttribute("data-precio"));
            } else {
                if (titulo.includes("Grass")) precio = 12.00;
                else if (titulo.includes("Abonos")) precio = 15.00;
                else if (titulo.includes("Palmeras")) precio = 85.00;
            }

            const productoNuevo = {
                id: Date.now(), 
                nombre: titulo,
                precio: precio
            };

            listaCarrito.push(productoNuevo);
            renderizarCarrito();
            
            if (carritoPanel) {
                carritoPanel.classList.add("abierto");
            }
        });
    });

    // Función encargada de re-dibujar y manipular el DOM del carrito
    function renderizarCarrito() {
        if (!contenedorItems || !totalTexto) return;

        contenedorItems.innerHTML = "";
        sumaTotalGlobal = 0; 

        listaCarrito.forEach(prod => {
            sumaTotalGlobal += prod.precio;

            // CREACIÓN DE NODOS: Fabricamos un elemento 'div' en memoria
            const divItem = document.createElement("div");
            divItem.classList.add("item-carrito");

            divItem.innerHTML = `
                <span>${prod.nombre}</span>
                <strong>S/ ${prod.precio.toFixed(2)}</strong>
                <button class="btn-eliminar" data-id="${prod.id}">&times;</button>
            `;

            const deleteBoton = divItem.querySelector(".btn-eliminar");
            deleteBoton.addEventListener("click", () => {
                listaCarrito = listaCarrito.filter(item => item.id !== prod.id);
                renderizarCarrito(); 
            });

            contenedorItems.appendChild(divItem);
        });

        totalTexto.textContent = `S/ ${sumaTotalGlobal.toFixed(2)}`;
    }



        // ==========================================================================
    // 5. VALIDACIONES DE SEGURIDAD PARA LA TARJETA (REGULAR EXPRESSIONS)
    // ==========================================================================
    const inputTarjeta = document.getElementById("pago-tarjeta");
    const inputExpira = document.getElementById("pago-expira");
    const inputCVV = document.getElementById("pago-cvv");

    // 1. Filtrado de Tarjeta: Bloquea y borra cualquier caracter que no sea un dígito numérico
    if (inputTarjeta) {
        inputTarjeta.addEventListener("input", (e) => {
            // El patrón \D busca todo lo que NO sea un número y g lo reemplaza globalmente por nada ("")
            e.target.value = e.target.value.replace(/\D/g, ""); 
        });
    }

    // 2. Filtrado de CVV: Sanitiza la caja del código de seguridad rechazando letras al instante
    if (inputCVV) {
        inputCVV.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, ""); 
        });
    }

    // 3. Máscara Dinámica de Expiración: Formatea la cadena insertando la barra diagonal automáticamente
    if (inputExpira) {
        inputExpira.addEventListener("input", (e) => {
            let valor = e.target.value.replace(/\D/g, ""); // Remueve cualquier caracter inválido
            
            // Si el usuario ingresó más de dos números, secciona la cadena y concatena el slash '/'
            if (valor.length > 2) {
                e.target.value = valor.substring(0, 2) + "/" + valor.substring(2, 4);
            } else {
                e.target.value = valor;
            }
        });
    }
    
        // ==========================================================================
    // 6. MODAL DE BIENVENIDA AUTOMÁTICO (OFERTA CON TEMPORIZADOR)
    // ==========================================================================
    const modalOferta = document.getElementById("modal-oferta-bienvenida");
    const cerrarOfertaBtn = document.getElementById("cerrar-oferta-btn");
    const btnAprovechar = document.getElementById("btn-aprovechar");

    function ocultarOferta() {
        if (modalOferta) {
            modalOferta.classList.remove("mostrar-oferta");
        }
    }

    if (modalOferta) {
        // Disparador automático: Espera 3000ms (3 segundos) tras cargar la página
        setTimeout(() => {
            modalOferta.classList.add("mostrar-oferta");
        }, 3000);

        if (cerrarOfertaBtn) {
            cerrarOfertaBtn.addEventListener("click", ocultarOferta);
        }

        if (btnAprovechar) {
            btnAprovechar.addEventListener("click", () => {
                ocultarOferta();
                const seccionProductos = document.getElementById("productos");
                if (seccionProductos) {
                    seccionProductos.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }
    }


});
