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
    // 4. SISTEMA DE CARRITO ACUMULATIVO Y PASARELA DE PAGO (DOM CONTROLADO)
    // ==========================================================================
    const carritoPanel = document.getElementById("carrito-panel");
    const abrirCarritoBtn = document.getElementById("abrir-carrito-btn");
    const cerrarCarrito = document.getElementById("cerrar-carrito");
    const contenedorItems = document.getElementById("carrito-items");
    const totalTexto = document.getElementById("carrito-total");
    const botonesComprar = document.querySelectorAll(".btn-comprar");

    const btnProcederPago = document.querySelector(".btn-pagar");
    const modalPago = document.getElementById("modal-pago");
    const cerrarPagoBtn = document.getElementById("cerrar-pago-btn");
    const montoFinalModal = document.getElementById("monto-final-modal");
    const formularioPago = document.getElementById("formulario-pago");

    const inputCupon = document.getElementById("pago-cupon-input");
    const btnAplicarCupon = document.getElementById("btn-aplicar-cupon");
    const mensajeCupon = document.getElementById("mensaje-cupon-estado");

    let listaCarrito = []; // Guardará objetos estructurados: { nombre, precio, cantidad }
    let sumaTotalGlobal = 0;
    let descuentoAplicado = 0;

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

    if (btnProcederPago && modalPago) {
        btnProcederPago.addEventListener("click", () => {
            if (listaCarrito.length === 0) {
                alert("Tu carrito está vacío. Añade algunos productos para proceder al pago.");
                return;
            }

            descuentoAplicado = 0;
            if (inputCupon)
                inputCupon.value = "";
            if (mensajeCupon) {
                mensajeCupon.textContent = "";
                mensajeCupon.className = "msg-cupon";
            }
            if (btnAplicarCupon)
                btnAplicarCupon.disabled = false;

            montoFinalModal.textContent = `S/ ${sumaTotalGlobal.toFixed(2)}`;
            carritoPanel.classList.remove("abierto");
            modalPago.classList.add("mostrar");
        });
    }

    if (btnAplicarCupon && inputCupon && mensajeCupon) {
        btnAplicarCupon.addEventListener("click", () => {
            const codigoIngresado = inputCupon.value.trim().toUpperCase();

            if (codigoIngresado === "ECOJARDIN15") {
                descuentoAplicado = sumaTotalGlobal * 0.15;
                const nuevoTotal = sumaTotalGlobal - descuentoAplicado;

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

    // PROCESAR COMPRA FINAL Y RENDERIZAR BOLETA AGRUPADA CON CANTIDADES
    if (formularioPago && modalPago) {
        formularioPago.addEventListener("submit", (e) => {
            e.preventDefault(); // Evitamos que la página web se recargue por defecto

            const titular = document.getElementById("pago-nombre").value;
            const montoFinalCobrado = sumaTotalGlobal - descuentoAplicado;

            // FUNCIÓN PROPIA DE JAVASCRIPT SEGÚN LA GUÍA UTP: confirm()
            const usuarioConfirma = confirm(`¿Estás seguro de que deseas proceder con el pago seguro de S/ ${montoFinalCobrado.toFixed(2)}?`);

            if (!usuarioConfirma) {
                alert("Transacción cancelada de forma segura por el usuario.");
                return;
            }

            // ==================================================================
            // LÓGICA DE CONTABILIDAD ACTUALIZADA (CON DESCUENTO E IGV)
            // ==================================================================

            // 1. Desglosamos el subtotal e IGV en base al monto real cobrado al cliente
            const subtotalCalculado = montoFinalCobrado / 1.18;
            const igvCalculado = montoFinalCobrado - subtotalCalculado;

            // 2. Inyección de datos del cliente y fecha actual en el DOM
            document.getElementById("boleta-cliente-nombre").textContent = titular.toUpperCase();

            const fechaActual = new Date();
            const fechaFormateada = fechaActual.getDate() + "/" + (fechaActual.getMonth() + 1) + "/" + fechaActual.getFullYear();
            document.getElementById("boleta-fecha").textContent = fechaFormateada;

            // Generamos el número correlativo simulado
            const numeroAleatorio = Math.floor(10000000 + Math.random() * 90000000);
            document.getElementById("boleta-num-dinamico").textContent = `N° B001-${numeroAleatorio}`;

            // 3. Renderizamos los ítems en la tabla de la boleta
            const cuerpoTablaBoleta = document.getElementById("boleta-cuerpo-items");
            if (cuerpoTablaBoleta) {
                cuerpoTablaBoleta.innerHTML = "";

                listaCarrito.forEach(item => {
                    const totalFila = item.precio * item.cantidad;
                    const fila = document.createElement("tr");
                    fila.innerHTML = `
                        <td class="txt-centro"><strong>${item.cantidad}x</strong></td>
                        <td>${item.nombre}</td>
                        <td class="txt-derecha">S/ ${item.precio.toFixed(2)}</td>
                        <td class="txt-derecha">S/ ${totalFila.toFixed(2)}</td>
                    `;
                    cuerpoTablaBoleta.appendChild(fila);
                });
            }

            // 4. LÓGICA DE CONTROL DEL DESCUENTO: Ocultamos la fila si no usó cupón
            const contenedorFilaDescuento = document.getElementById("boleta-fila-descuento-contenedor");
            if (descuentoAplicado > 0) {
                if (contenedorFilaDescuento)
                    contenedorFilaDescuento.style.display = "flex";
                document.getElementById("boleta-descuento").textContent = `-S/ ${descuentoAplicado.toFixed(2)}`;
            } else {
                if (contenedorFilaDescuento)
                    contenedorFilaDescuento.style.display = "none";
            }

            // 5. Pintamos los resultados matemáticos exactos en el DOM de la boleta
            document.getElementById("boleta-subtotal").textContent = `S/ ${subtotalCalculado.toFixed(2)}`;
            document.getElementById("boleta-igv").textContent = `S/ ${igvCalculado.toFixed(2)}`;
            document.getElementById("boleta-total-final").textContent = `S/ ${montoFinalCobrado.toFixed(2)}`;

            // 6. Transición de ventanas modales
            modalPago.classList.remove("mostrar");
            const modalBoleta = document.getElementById("modal-boleta-exito");
            if (modalBoleta) {
                modalBoleta.classList.add("mostrar-boleta");
            }

            // 7. Botón final de cierre
            const btnFinalizarTodo = document.getElementById("btn-finalizar-todo");
            if (btnFinalizarTodo && modalBoleta) {
                btnFinalizarTodo.onclick = () => {
                    listaCarrito = [];
                    renderizarCarrito();
                    formularioPago.reset();
                    modalBoleta.classList.remove("mostrar-boleta");
                    alert("¡Gracias por su compra! El proceso ha finalizado correctamente.");
                };
            }
        });
    }


    // CAPTURA DE CLICS EN LOS BOTONES DE COMPRA CON ALGORITMO DE AGRUPACIÓN
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
                if (titulo.includes("Grass"))
                    precio = 12.00;
                else if (titulo.includes("Abonos"))
                    precio = 15.00;
                else if (titulo.includes("Palmeras"))
                    precio = 85.00;
            }

            // LÓGICA DE CONTROL: Comprobamos si el producto ya fue agregado antes mediante su nombre
            const productoExistente = listaCarrito.find(item => item.nombre === titulo);

            if (productoExistente) {
                // Si ya existe, aumentamos la cantidad en la lista interna (+1)
                productoExistente.cantidad += 1;
            } else {
                // Si es un producto nuevo, lo agregamos con cantidad inicial de 1
                const productoNuevo = {
                    nombre: titulo,
                    precio: precio,
                    cantidad: 1
                };
                listaCarrito.push(productoNuevo);
            }

            renderizarCarrito();

            if (carritoPanel) {
                carritoPanel.classList.add("abierto");
            }
        });
    });

    // FUNCIÓN ENCARGADA DE DIBUJAR EL CARRITO LATERAL CON CANTIDADES
    function renderizarCarrito() {
        if (!contenedorItems || !totalTexto)
            return;

        contenedorItems.innerHTML = "";
        sumaTotalGlobal = 0;

        listaCarrito.forEach(prod => {
            // El costo de esta fila es: Precio Unitario x Cantidad acumulada
            const subtotalFila = prod.precio * prod.cantidad;
            sumaTotalGlobal += subtotalFila;

            const divItem = document.createElement("div");
            divItem.classList.add("item-carrito");

            // Modificamos el contenido agregando un bloque de detalles con la cantidad reflejada (Ej. Cant: 2)
            divItem.innerHTML = `
                <div class="carrito-item-detalles">
                    <span>${prod.nombre}</span>
                    <span class="item-carrito-cantidad">Cant: ${prod.cantidad} x S/ ${prod.precio.toFixed(2)}</span>
                </div>
                <strong>S/ ${subtotalFila.toFixed(2)}</strong>
                <button class="btn-eliminar">&times;</button>
            `;

            const deleteBoton = divItem.querySelector(".btn-eliminar");
            deleteBoton.addEventListener("click", () => {
                // Al eliminar, removemos el producto por completo del carrito
                listaCarrito = listaCarrito.filter(item => item.nombre !== prod.nombre);
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
                    seccionProductos.scrollIntoView({behavior: "smooth", block: "start"});
                }
            });
        }
    }

    // ==========================================================================
    // 7. SCRIPT DE FILTRADO MULTI-CRITERIO PARA EL CATÁLOGO DE PLANTAS
    // ==========================================================================
    const inputBusqueda = document.getElementById("input-busqueda");
    const selectTemporada = document.getElementById("select-temporada");
    const selectEntorno = document.getElementById("select-entorno");
    const tarjetasPlantas = document.querySelectorAll(".servicio-item");

    function filtrarCatalogo() {
        // Capturamos los valores activos de los tres filtros en minúsculas
        const textoBuscar = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : "";
        const temporadaElegida = selectTemporada ? selectTemporada.value : "todos";
        const entornoElegido = selectEntorno ? selectEntorno.value : "todos";

        tarjetasPlantas.forEach(tarjeta => {
            // Extraemos la información de la tarjeta mediante el DOM y atributos de datos
            const nombrePlanta = tarjeta.querySelector("h3").textContent.toLowerCase();
            const estacionPlanta = tarjeta.getAttribute("data-estacion") || "";
            const entornoPlanta = tarjeta.getAttribute("data-entorno") || "";

            // Lógica algorítmica: Evaluamos si el ítem cumple los 3 requisitos en cadena
            const coincideTexto = nombrePlanta.includes(textoBuscar);
            const coincideTemporada = (temporadaElegida === "todos" || estacionPlanta.includes(temporadaElegida));
            const coincideEntorno = (entornoElegido === "todos" || entornoPlanta === entornoElegido);

            // MANIPULACIÓN DEL DOM: Si cumple todo se muestra, de lo contrario se oculta con CSS
            if (coincideTexto && coincideTemporada && coincideEntorno) {
                tarjeta.style.display = "flex"; // Mantiene la estructura elástica de la tarjeta
            } else {
                tarjeta.style.display = "none"; // Desaparece del flujo visual de la pantalla
            }
        });
    }

    // Vinculamos los escuchadores de eventos para que filtren de forma reactiva al escribir o cambiar opciones
    if (inputBusqueda)
        inputBusqueda.addEventListener("input", filtrarCatalogo);
    if (selectTemporada)
        selectTemporada.addEventListener("change", filtrarCatalogo);
    if (selectEntorno)
        selectEntorno.addEventListener("change", filtrarCatalogo);

    // ==========================================================================
    // 8. ANIMACIÓN INTERACTIVA DE IMÁGENES AL PASAR EL MOUSE (MOUSEEVENTS)
    // ==========================================================================
    const imagenesPlantas = document.querySelectorAll(".servicio-item img");

    if (imagenesPlantas.length > 0) {
        // Recorremos la lista de imágenes con un bucle para asignar los escuchadores
        imagenesPlantas.forEach(imagen => {

            // EVENTO 1: Cuando el cursor del usuario entra a la imagen
            imagen.addEventListener("mouseenter", () => {
                // MANIPULACIÓN DEL DOM: Añadimos la clase que activa el zoom y brillo
                imagen.classList.add("animar-foto");
            });

            // EVENTO 2: Cuando el cursor del usuario sale de la imagen
            imagen.addEventListener("mouseleave", () => {
                // MANIPULACIÓN DEL DOM: Removemos la clase para que regrese a su estado original suavemente
                imagen.classList.remove("animar-foto");
            });

        });
    }

    // ==========================================================================
    // 9. MICRO-INTERACCIÓN DE TRANSFORMACIÓN 3D EN TARJETAS DE PRODUCTOS (DOM)
    // ==========================================================================
    // Capturamos de forma masiva las imágenes dentro de los contenedores de productos
    const fotosProductos = document.querySelectorAll(".producto-img img, .producto-card img");

    if (fotosProductos.length > 0) {
        // Iteramos las 4 imágenes con un bucle modular .forEach
        fotosProductos.forEach(imagen => {

            // EVENTO 1: El cursor entra a la tarjeta del producto
            imagen.addEventListener("mouseenter", () => {
                // MANIPULACIÓN DEL DOM: Inyectamos la clase de transformación y rotación diagonal
                imagen.classList.add("transformar-producto-foto");
            });

            // EVENTO 2: El cursor se retira de la tarjeta del producto
            imagen.addEventListener("mouseleave", () => {
                // MANIPULACIÓN DEL DOM: Removemos la clase para regresar la imagen a su eje original
                imagen.classList.remove("transformar-producto-foto");
            });

        });
    }

        // ==========================================================================
    // 10. BOTÓN FLOTANTE INTERACTIVO DE WHATSAPP (COMPORTAMIENTO UX - UTP)
    // ==========================================================================
    const waContenedor = document.getElementById("wa-contenedor");
    const waTooltip = document.getElementById("wa-tooltip");

    if (waContenedor && waTooltip) {
        
        // INTERACCIÓN 1: El botón nace de forma asíncrona solo si el usuario baja 300px la pantalla
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                waContenedor.classList.add("visible"); // Aparece con transición suave
            } else {
                waContenedor.classList.remove("visible"); // Se esconde al subir al inicio (Header)
            }
        });

        // INTERACCIÓN 2: Al pasar el cursor sobre el contenedor, se gatilla el tooltip de ayuda
        waContenedor.addEventListener("mouseenter", () => {
            waTooltip.classList.add("mostrar-tooltip");
        });

        // INTERACCIÓN 3: Al retirar el mouse, el globo de texto se desvanece suavemente
        waContenedor.addEventListener("mouseleave", () => {
            waTooltip.classList.remove("mostrar-tooltip");
        });
        
    }




});
