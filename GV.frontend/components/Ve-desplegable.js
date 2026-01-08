class VeDesplegable extends HTMLElement {
    constructor() {
        super();
        this.outsideClickHandler = null;
    }

    static get observedAttributes() {
        return ['title', 'expanded', 'close-outside'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.setupOutsideClickListener();
    }

    disconnectedCallback() {
        this.removeOutsideClickListener();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === 'title') {
                const titleElement = this.querySelector('.ve-desp-title');
                if (titleElement) {
                    titleElement.textContent = newValue || 'Título';
                }
            }
            if (name === 'close-outside') {
                if (newValue !== null) {
                    this.setupOutsideClickListener();
                } else {
                    this.removeOutsideClickListener();
                }
            }
        }
    }

    render() {
    const title = this.getAttribute('title') || 'Título';
    const isExpanded = this.hasAttribute('expanded');

    // Guardar nodos originales (para reasignarlos luego)
    const originalContent = Array.from(this.childNodes);

    // Construir la estructura con un contenedor para los header-right items
    this.innerHTML = `
        <div class="ve-desp${isExpanded ? ' expanded' : ''}">
            <div class="ve-desp-head">
                <p class="ve-desp-title">${title}</p>
                <div class="ve-desp-head-right"></div>
                <i class="intu-icon icon-arrow-right"></i>
            </div>
            <div class="ve-desp-body"></div>
        </div>
    `;

    // Referencias
    const headRight = this.querySelector('.ve-desp-head-right');
    const body = this.querySelector('.ve-desp-body');

    // Reinsertar los nodos originales según su atributo slot
    originalContent.forEach(node => {
        // Ignorar nodos de texto vacíos
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;

        // Si el nodo tiene slot="header-right" lo ponemos en headRight
        if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute('slot') === 'header-right') {
            headRight.appendChild(node);
        } else {
            // El resto va al body
            body.appendChild(node);
        }
    });
}

setupEventListeners() {
    const header = this.querySelector('.ve-desp-head');
    const headRight = this.querySelector('.ve-desp-head-right');

    // Toggle al click del header (sin incluir los botones en head-right)
    header.addEventListener('click', (event) => {
        // Si el click viene desde el head-right o sus hijos, ignorar aquí.
        if (headRight && (headRight === event.target || headRight.contains(event.target))) {
            return;
        }
        event.stopPropagation();
        this.handleClick();
    });

    // Evitar que clicks dentro del head-right burbujeen y provoquen toggle
    if (headRight) {
        headRight.addEventListener('click', (e) => {
            e.stopPropagation();
            // Dejá que los botones hagan su lógica (add/delete), no llamamos handleClick()
        });
    }
}

    setupOutsideClickListener() {
        if (!this.hasAttribute('close-outside')) return;

        this.removeOutsideClickListener();

        this.outsideClickHandler = (event) => {
            const veDesp = this.querySelector('.ve-desp');

            // Solo actuar si está expandido
            if (!veDesp || !veDesp.classList.contains('expanded')) return;

            // Verificar si el clic fue fuera del componente
            if (!this.contains(event.target)) {
                this.close();
            }
        };

        // Usar timeout para evitar que se cierre inmediatamente al abrir
        setTimeout(() => {
            document.addEventListener('click', this.outsideClickHandler);
        }, 0);
    }

    removeOutsideClickListener() {
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
            this.outsideClickHandler = null;
        }
    }

    handleClick() {
        const veDesp = this.querySelector('.ve-desp');

        if (veDesp.classList.contains('animating')) return;

        if (this.hasAttribute('close-others')) {
            this.closeOtherSections();
        }

        const willExpand = !veDesp.classList.contains('expanded');

        veDesp.classList.add('animating');
        veDesp.classList.toggle('expanded');

        setTimeout(() => {
            veDesp.classList.remove('animating');
            this.dispatchEvent(new CustomEvent('sectionToggled', {
                detail: {
                    expanded: veDesp.classList.contains('expanded'),
                    title: this.getAttribute('title')
                },
                bubbles: true
            }));
        }, 300);

        // Actualizar el listener de clic fuera cuando cambia el estado
        if (this.hasAttribute('close-outside')) {
            if (willExpand) {
                this.setupOutsideClickListener();
            } else {
                this.removeOutsideClickListener();
            }
        }
    }

    closeOtherSections() {
        const allSections = document.querySelectorAll('ve-desplegable');
        allSections.forEach(section => {
            if (section !== this) {
                const otherVeDesp = section.querySelector('.ve-desp');
                if (otherVeDesp &&
                    otherVeDesp.classList.contains('expanded') &&
                    !otherVeDesp.classList.contains('animating')) {

                    otherVeDesp.classList.add('animating');
                    otherVeDesp.classList.remove('expanded');

                    setTimeout(() => {
                        otherVeDesp.classList.remove('animating');
                    }, 300);
                }
            }
        });
    }

    expand() {
        const veDesp = this.querySelector('.ve-desp');
        if (!veDesp.classList.contains('expanded') && !veDesp.classList.contains('animating')) {
            this.handleClick();
        }
    }

    close() {
        const veDesp = this.querySelector('.ve-desp');
        if (veDesp.classList.contains('expanded') && !veDesp.classList.contains('animating')) {
            this.handleClick();
        }
    }

    toggle() {
        const veDesp = this.querySelector('.ve-desp');
        if (!veDesp.classList.contains('animating')) {
            this.handleClick();
        }
    }

    updateTitle(newTitle) {
        this.setAttribute('title', newTitle);
    }

    updateContent(htmlContent) {
        const body = this.querySelector('.ve-desp-body slot');
        if (body && body.assignedNodes().length > 0) {
            this.innerHTML = htmlContent;
        }
    }

    get isExpanded() {
        return this.querySelector('.ve-desp').classList.contains('expanded');
    }
}

customElements.define('ve-desplegable', VeDesplegable);