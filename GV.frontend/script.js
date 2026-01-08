//const API_BASE = "https://marckdown-production.up.railway.app:3000/api";
// const API_BASE = "http://localhost:3000/api";
const API_BASE = "http://localhost:8015/vecorta.api.external/GV.backend";

// elementos
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn"); 
const cancelBtn = document.getElementById("cancelBtn");
const editorContainer = document.getElementById("editorContainer");
const title = document.getElementById("title");
const btnAdd = document.getElementById('btn-add'); 
const menuList = document.getElementById('menu-list');

const btnBold = document.getElementById("btnBold");
const btnItalic = document.getElementById("btnItalic");
const btnUnderline = document.getElementById("btnUnderline");
const btnList = document.getElementById("btnList");
const btnLine = document.getElementById("btnLine");
const btnImage = document.getElementById("btnImage");
const btnHeading = document.getElementById("btnHeading");
const popupBg     = document.getElementById("popupGlobal");
const popupTitle  = document.getElementById("popupTitle");
const popupMsg    = document.getElementById("popupMessage");
const popupInput  = document.getElementById("popupInput");
const popupBtns   = document.querySelector(".popup-btns");
const popupCustom = document.getElementById("popupCustomContent");

let currentImgFolder = "";
let currentSectionId = null;
let currentSubId = null;
let editando = false;
let secciones = [];


// ocultar el botón de editar hasta que se seleccione un sub-item
if (editBtn) editBtn.style.display = 'none';

// imágenes locales 
const localImages = {};
let imageCounter = 1;

// -------- Markdown Renderer --------
function renderMarkdown(markdownText) {
    if (!markdownText || markdownText.trim() === "") return "";

    let html = markdownText
        .replace(/^###### (.*)$/gim, "<h6>$1</h6>")
        .replace(/^##### (.*)$/gim, "<h5>$1</h5>")
        .replace(/^#### (.*)$/gim, "<h4>$1</h4>")
        .replace(/^### (.*)$/gim, "<h3>$1</h3>")
        .replace(/^## (.*)$/gim, "<h2>$1</h2>")
        .replace(/^# (.*)$/gim, "<h1>$1</h1>")
        .replace(/^\> (.*)$/gim, "<blockquote>$1</blockquote>")
        .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
        .replace(/\*(.*?)\*/gim, "<i>$1</i>")
        .replace(/__(.*?)__/gim, "<u>$1</u>")
        .replace(/\n---\n/gim, "<hr>")
        .replace(/\!\[(.*?)\]\((.*?)\)/gim, (match, alt, src) => {
            if (localImages[src]) {
                return `<img src="${localImages[src]}" alt="${alt}" style="max-width:100%; border-radius:8px; margin:10px 0;">`;
            }
            return `<img src="${src}" alt="${alt}" style="max-width:100%; border-radius:8px; margin:10px 0;">`;
        })
        .replace(/^- (.*)$/gim, "<ul><li>$1</li></ul>")
        .replace(/\n/gim, "<br>");

    html = html.replace(/<\/ul><ul>/g, "");
    return html.trim();
}

// -------- Insertar Markdown --------
function insertAtCursor(textarea, before, after = "") {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const newText = before + selected + after;
    textarea.value =
        textarea.value.substring(0, start) +
        newText +
        textarea.value.substring(end);
    textarea.focus();
}

// -------- BOTONES (toolbar) --------
if (btnBold) {
    btnBold.addEventListener("click", () => {
        insertAtCursor(editor, "**", "**");
        preview.innerHTML = renderMarkdown(editor.value);
    });
}
if (btnItalic) {
    btnItalic.addEventListener("click", () => {
        insertAtCursor(editor, "*", "*");
        preview.innerHTML = renderMarkdown(editor.value);
    });
}
if (btnUnderline) {
    btnUnderline.addEventListener("click", () => {
        insertAtCursor(editor, "__", "__");
        preview.innerHTML = renderMarkdown(editor.value);
    });
}
if (btnList) {
    btnList.addEventListener("click", () => {
        insertAtCursor(editor, "- ");
        preview.innerHTML = renderMarkdown(editor.value);
    });
}
if (btnLine) {
    btnLine.addEventListener("click", () => {
        insertAtCursor(editor, "\n---\n");
        preview.innerHTML = renderMarkdown(editor.value);
    });
}

if (btnImage) {
    btnImage.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!editando) {
            console.warn("No estás en modo edición");
            return;
        }

        console.log("Click botón imagen");
        openImagePopup("");
    });
}

if (btnHeading) {
    btnHeading.addEventListener("change", () => {
        const prefix = btnHeading.value;
        if (!prefix) return;
        insertAtCursor(editor, `\n${prefix} `, "");
        preview.innerHTML = renderMarkdown(editor.value);
        btnHeading.value = "";
    });
}

// preview
editor?.addEventListener("input", () => {
    preview.innerHTML = renderMarkdown(editor.value) || "<p><em>Contenido vacío</em></p>";
});

// ---------- API helpers ----------
async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`API GET ${path} -> ${res.status}`);
    return res.json();
}
// async function apiPost(path, body) {
//     const res = await fetch(`${API_BASE}${path}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//     });
//     if (!res.ok) throw new Error(`API POST ${path} -> ${res.status}`);
//     return res.json();
// }
async function apiPost(path, data) {

    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }

    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        body: formData
    });

    const json = await res.json();

    if (!res.ok || json.status !== "ok") {
        throw new Error(`API POST ${path} -> ${res.status}`);
    }

    return json;
}
// async function apiPut(path, body) {
//     const res = await fetch(`${API_BASE}${path}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//     });
//     if (!res.ok) throw new Error(`API PUT ${path} -> ${res.status}`);
//     return res.json();
// }
async function apiDelete(path) {
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`API DELETE ${path} -> ${res.status}`);
    return res.json();
}

// ---------- Sidebar: render y carga ----------
function crearMenuItemHTML(seccion) {
    return `
    <div class="menu-section">  
        <ve-desplegable title="${escapeHtml(seccion.nombre)}" close-outside>

            <div slot="header-right" class="icons-section">

            
                <button class="btn-add-sub"
                data-section-id="${seccion.id}"
                title="Agregar subitem">
                <i class="fas fa-plus"></i>
                </button>
                
                <button class="btn-edit-section"
                    data-section-id="${seccion.id}"
                    title="Renombrar sección">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            
                <button class="btn-delete-section"
                    data-section-id="${seccion.id}"
                    title="Eliminar sección">
                    <i class="fas fa-trash"></i>
                </button>

            </div>

            <div slot="content" class="subitems-container">
                ${(seccion.subitems || []).map(sub => `
                    <div class="subitem"
                        data-section-id="${seccion.id}"
                        data-sub-id="${sub.id}">
                        
                        <span class="subitem-text">${escapeHtml(sub.nombre)}</span>

                        <div class="subitem-icons">
                            <button class="btn-edit-sub"
                                data-section-id="${seccion.id}"
                                data-sub-id="${sub.id}"
                                title="Renombrar">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-delete-sub"
                                data-section-id="${seccion.id}"
                                data-sub-id="${sub.id}"
                                title="Eliminar">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>

        </ve-desplegable>
    </div>
    `;
}


function escapeHtml(str) {
    return String(str).replace(/[&<>"'`=/]/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;','/':'&#47;','=':'&#61;'
    }[s]));
}




console.log("Secciones:", window.secciones);

function attachSubitemListeners() {
  document.querySelectorAll('.subitem').forEach(el => {

    el.removeEventListener('click', el._boundSubClick);

    el._boundSubClick = async (e) => {
      e.stopPropagation();

      const sid   = parseInt(el.dataset.sectionId);
      const subId = parseInt(el.dataset.subId);

      currentSectionId = sid;
      currentSubId     = subId;

      console.log(`📄 Click subitem ${subId}`);

      try {
        const res = await apiGet(`/Test/GetSubItems/${subId}`);

        console.log("🟢 Subitem recibido:", res.data);

        mostrarSubitem(res.data);

      } catch (err) {
        console.error("❌ Error cargando subitem", err);
        alert("Error cargando el contenido");
      }
    };

    el.addEventListener('click', el._boundSubClick);
  });
}




function mostrarSubitem(sub) {
    console.log("🟢 Subitem recibido:", sub);

  try {
    console.log("📄 Mostrando subitem:", sub);

    if (!sub?.id) {
      editor.value = "# Sin contenido";
      preview.innerHTML = renderMarkdown(editor.value);
      return;
    }

    // subitem activo
    window.subitemActivo = sub;

    // contenido
    editor.value = sub.contenido?.trim() || `# ${sub.nombre}\n\nContenido vacío`;
    preview.innerHTML = renderMarkdown(editor.value);

    // UI
    editorContainer.style.display = 'none';
    preview.style.display = 'block';
    title.textContent = sub.nombre;

    if (editBtn && !editando) editBtn.style.display = 'inline-block';
    

    console.log("✔ Subitem renderizado");
  } catch (e) {
    console.error("❌ Error mostrando subitem", e);
  }
}


async function cargarSidebar() {
    try {
        const _result = await apiGet('/Test/GetSeccionesConSubitems');
        console.log("DATA CARGADA:", _result);
        
        if (_result.status !== "ok") {
            console.warn("Respuesta no ok");
            return;
        }

        secciones = _result.data || [];
        console.log("Secciones:", secciones);

        let sHTML = '';
        secciones.forEach(seccion => {
            sHTML += crearMenuItemHTML(seccion);
        });

        menuList.innerHTML = sHTML;

        attachDirectListeners();
        attachSubitemListeners();
    }
    catch (err) {
        console.error("Error cargando sidebar:", err);
        preview.innerHTML = `<p style="color:#e74c3c;">Error cargando datos del servidor.</p>`;
    }
}

// ---------- POPUP GLOBAL ----------
function showPopup({ title = "", message = "", input = false }) {
    return new Promise(resolve => {
        const bg = document.getElementById("popupGlobal");
        const t = document.getElementById("popupTitle");
        const msg = document.getElementById("popupMessage");
        const inp = document.getElementById("popupInput");
        const ok = document.getElementById("popupOk");
        const cancel = document.getElementById("popupCancel");

        t.textContent = title;
        msg.textContent = message;

        if (input) {
            inp.style.display = "block";
            inp.value = "";
            setTimeout(() => inp.focus(), 50);
        } else {
            inp.style.display = "none";
        }

        bg.style.display = "flex";

        const cleanup = () => {
            bg.style.display = "none";
            ok.removeEventListener("click", okHandler);
            cancel.removeEventListener("click", cancelHandler);
        };

        const okHandler = () => {
            const value = input ? inp.value.trim() : true;
            cleanup();
            resolve(value);
        };
        const cancelHandler = () => {
            cleanup();
            resolve(false);
        };

        ok.addEventListener("click", okHandler);
        cancel.addEventListener("click", cancelHandler);
    });
}

// ---------- Eventos del sidebar (listeners dinámicos) ----------
function attachDirectListeners() {
    // add-subitem (reemplaza prompt por popup)
    document.querySelectorAll('.btn-add-sub').forEach(btn => {
        btn.removeEventListener('click', btn._boundAddClick);
        btn._boundAddClick = async (e) => {
            e.stopPropagation();
            const seccionId = parseInt(btn.dataset.sectionId);
            const subname = await showPopup({
                title: "Nuevo subitem",
                message: "Ingresá el nombre del subitem:",
                input: true
            });
            if (!subname) return;
            try {
                await apiPost('/Test/CreateSubItem', { seccion_id: seccionId, nombre: subname });
                await cargarSidebar();
            } catch (err) {
                console.error(err);
                alert('Error agregando subitem');
            }
        };
        btn.addEventListener('click', btn._boundAddClick);
    });

        document.querySelectorAll('.btn-edit-section').forEach(btn => {
        btn.removeEventListener('click', btn._boundEditSection);

        btn._boundEditSection = async (e) => {
            e.stopPropagation();

            const sectionId = parseInt(btn.dataset.sectionId);

            const newName = await showPopup({
                title: "Renombrar sección",
                message: "Ingresá el nuevo nombre:",
                input: true
            });

            if (!newName) return;

            try {
                await apiPost(`/Test/UpdateSeccionNombre/${sectionId}`, {
                    nombre: newName
                });

                await cargarSidebar();

            } catch (err) {
                console.error(err);
                alert('Error renombrando sección');
            }
        };

        btn.addEventListener('click', btn._boundEditSection);
    });


    // delete sub
    document.querySelectorAll('.btn-delete-sub').forEach(btn => {
        btn.removeEventListener('click', btn._boundDelSub);
        btn._boundDelSub = async (e) => {
            e.stopPropagation();
            const subId = parseInt(btn.dataset.subId);
            const confirmar = await showPopup({
                title: "Eliminar subitem",
                message: "¿Eliminar este subitem?"
            });
            if (!confirmar) return;
            try {
                await apiPost('/Test/SoftDeleteSubItem', { id: subId });
                if (currentSubId === subId) {
                    currentSubId = null;
                    editor.value = '';
                    preview.innerHTML = `<p style="color:#666;">Agregá una nueva opción con el botón ➕ para comenzar.</p>`;
                    if (editBtn) editBtn.style.display = 'none';
                }
                await cargarSidebar();
            } catch (err) { console.error(err); alert('Error eliminando subitem'); }
        };
        btn.addEventListener('click', btn._boundDelSub);
    });

    // edit sub (renombrar)
    document.querySelectorAll('.btn-edit-sub').forEach(btn => {
        btn.removeEventListener('click', btn._boundEditSub);

        btn._boundEditSub = async (e) => {
            e.stopPropagation();

            const subId = parseInt(btn.dataset.subId);

            const newName = await showPopup({
                title: "Renombrar subitem",
                message: "Ingresá el nuevo nombre:",
                input: true
            });

            if (!newName) return;

            try {
                await apiPost(`/Test/UpdateSubItemNombre/${subId}`, {
                    nombre: newName
                });

                await cargarSidebar();

            } catch (err) {
                console.error(err);
                alert('Error renombrando subitem');
            }
        };

        btn.addEventListener('click', btn._boundEditSub);
    });


    // delete section
    document.querySelectorAll('.btn-delete-section').forEach(btn => {
        btn.removeEventListener('click', btn._boundDelSection);
        btn._boundDelSection = async (e) => {
            e.stopPropagation();
            const sectionId = parseInt(btn.dataset.sectionId);
            const confirmar = await showPopup({
                title: "Eliminar sección",
                message: "¿Eliminar esta sección y todos sus subitems?"
            });
            if (!confirmar) return;
            try {
                await apiPost('/Test/SoftDeleteSeccion', { id: sectionId });
                if (currentSectionId === sectionId) {
                    currentSectionId = null;
                    currentSubId = null;
                    editor.value = '';
                    preview.innerHTML = `<p style="color:#666;">Agregá una nueva opción con el botón ➕ para comenzar.</p>`;
                    if (editBtn) editBtn.style.display = 'none';
                }
                await cargarSidebar();
            } catch (err) { console.error(err); alert('Error eliminando sección'); }
        };
        btn.addEventListener('click', btn._boundDelSection);
    });

}

// ---------- Editar / Guardar / Cancelar ----------
editBtn?.addEventListener('click', () => {
    if (!currentSectionId || !currentSubId) return;
    editando = true;
    editorContainer.style.display = "block";
    preview.style.display = "none";
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";
    cancelBtn.style.display = "inline-block";
});

saveBtn?.addEventListener('click', async () => {

    if (!window.subitemActivo || !currentSubId) {
        console.warn("⚠ No hay subitem activo para guardar");
        return;
    }

    const texto = editor.value;

    console.log("🟡 Guardando subitem:", {
        id: currentSubId,
        contenido: texto
    });

    try {

        await apiPost(`/Test/UpdateSubItem/${currentSubId}`, {
            contenido: texto
        });

        // 🔥 sincronizar memoria
        window.subitemActivo.contenido = texto;

        // render
        preview.innerHTML = renderMarkdown(texto);

        // UI
        editorContainer.style.display = "none";
        preview.style.display = "block";
        editBtn.style.display = "inline-block";
        saveBtn.style.display = "none";
        cancelBtn.style.display = "none";
        editando = false;

        console.log("✔ Subitem guardado correctamente");

    } catch (err) {
        console.error("🔴 Error guardando:", err);
        alert("Error guardando contenido");
    }
});



cancelBtn?.addEventListener('click', () => {

    console.log("Cancelando edición…");

    if (!window.subitemActivo) {
        console.warn("No hay subitem activo");
        return;
    }

    // restaurar contenido original
    editor.value = window.subitemActivo.contenido || 
        `# ${window.subitemActivo.nombre}\n\nContenido vacío`;

    preview.innerHTML = renderMarkdown(editor.value);

    // UI
    editorContainer.style.display = "none";
    preview.style.display = "block";
    editBtn.style.display = "inline-block";
    saveBtn.style.display = "none";
    cancelBtn.style.display = "none";
    editando = false;

    

    console.log("✔ Edición cancelada correctamente");
});


// cancelBtn?.addEventListener('click', async () => {

//     console.log("🔁 Cancelando edición…");

//     // Reset UI
//     editorContainer.style.display = "none";
//     preview.style.display = "block";
//     editBtn.style.display = "inline-block";
//     saveBtn.style.display = "none";
//     cancelBtn.style.display = "none";
//     editando = false;

//     if (dropZone) dropZone.style.display = 'none';

//     if (!currentSubId) {
//         console.warn("⚠ No hay subitem actual seleccionado");
//         return;
//     }

//     try {

//         console.log(`📌 Cargando subitem ${currentSubId}`);

//         const _result = await apiGet(`/Test/GetSeccionesConSubitems/${currentSubId}`);

//         if (_result.status !== "ok") {
//             console.error("❌ Error API GetSeccionesConSubitems:", _result);
//             preview.innerHTML = `<p style="color:#e74c3c;">No se pudo cargar el subitem</p>`;
//             return;
//         }

//         const sub = _result.data?.subitem;

//         editor.value = sub?.contenido || `# ${sub?.nombre || 'Sin nombre'}\n---\nContenido vacío`;

//         preview.innerHTML = renderMarkdown(editor.value);

//         console.log("✔ Subitem restaurado correctamente");

//     } 
//     catch (err) {

//         console.error("❌ Error al restaurar subitem:", err);

//         preview.innerHTML = `
//             <p style="color:#e74c3c;">
//                 Error al cargar el contenido desde el servidor.
//             </p>`;
//     }

// });


async function openImagePopup(folder = "") {
    console.log("openImagePopup llamado con folder:", folder);

    currentImgFolder = folder;

    // UI popup
    popupTitle.textContent = "Seleccionar imagen";
    popupMsg.textContent   = folder ? `/${folder}` : "/";

    popupInput.style.display  = "none";
    popupBtns.style.display   = "none";
    popupCustom.style.display = "block";
    popupCustom.innerHTML     = "Cargando imágenes…";

    popupBg.style.display = "flex";

    try {
        const path = `/Test/getListImagenes${folder ? `?folder=${folder}` : ""}`;
        console.log("GET →", path);

        const res = await apiGet(path);
        console.log("Respuesta imágenes:", res);

        if (res.status !== "ok") {
            popupCustom.innerHTML = "❌ Error cargando imágenes";
            return;
        }

        let html = `<div class="popup-images">`;

        // ⬅ volver
        if (folder) {
            html += `
                <div class="popup-img-item" data-back>
                    <div class="popup-folder">⬅</div>
                    <div>Volver</div>
                </div>
            `;
        }

        // 📁 carpetas
        (res.folders || []).forEach(f => {
            html += `
                <div class="popup-img-item" data-folder="${f}">
                    <div class="popup-folder">📁</div>
                    <div>${f}</div>
                </div>
            `;
        });

        // 🖼 imágenes
        (res.images || []).forEach(img => {

            const imgSrc = `/vecorta.api.external/GV.frontend/ImagenesGuias/${folder ? folder + "/" : ""}${img.name}`;

            html += `
                <div class="popup-img-item" data-img="${imgSrc}">
                    <img src="${imgSrc}" alt="${img.name}">
                    <div>${img.name}</div>
                </div>
            `;
        });

        html += `</div>`;
        popupCustom.innerHTML = html;

        bindImagePopupEvents();

    } catch (err) {
        console.error("❌ Error openImagePopup:", err);
        popupCustom.innerHTML = "❌ Error de conexión";
    }
}




function bindImagePopupEvents() {

  // volver
    popupCustom.querySelector("[data-back]")?.addEventListener("click", () => {
        currentImgFolder = currentImgFolder.split("/").slice(0,-1).join("/");
        openImagePopup(currentImgFolder);
    });

    // carpetas
    popupCustom.querySelectorAll("[data-folder]").forEach(el => {
        el.addEventListener("click", () => {
        currentImgFolder = currentImgFolder
            ? `${currentImgFolder}/${el.dataset.folder}`
            : el.dataset.folder;
        openImagePopup(currentImgFolder);
        });
    });

    // imágenes
    popupCustom.querySelectorAll("[data-img]").forEach(el => {
        el.addEventListener("click", () => {
        insertAtCursor(editor, `![imagen](${el.dataset.img})`);
        preview.innerHTML = renderMarkdown(editor.value);
        closePopup();
        });
    });
}

function closePopup() {
    popupBg.style.display = "none";
    popupCustom.style.display = "none";
    popupBtns.style.display = "flex";
}



// ---------- Utilities ----------
document.addEventListener("DOMContentLoaded", () => {
    cargarSidebar();
    preview.innerHTML = `<p style="color:#666;">Agregá una nueva opción con el botón ➕ para comenzar.</p>`;
});

// agregar seccion - top plus (btnAdd)
btnAdd?.addEventListener('click', async () => {
    const nombre = await showPopup({
        title: "Nueva sección",
        message: "Ingresá el nombre de la nueva sección:",
        input: true
    });

    if (!nombre) return;

    try {

        console.log("POST CreateSeccion:", nombre);

        const res = await apiPost('/Test/CreateSeccion', { nombre });

        console.log("respuesta CreateSeccion:", res);

        await cargarSidebar();

    } catch (err) {
        console.error("Error creando sección", err);
        alert('Error creando sección');
    }
});




// sidebar title click to reset
const sidebarTitle = document.getElementById('sidebar-title');
sidebarTitle?.addEventListener('click', () => {
    title.textContent = "Centro de ayuda";
    preview.innerHTML = `<p style="color:#666;">Agregá una nueva opción con el botón ➕ para comenzar.</p>`;
    editorContainer.style.display = 'none';
    preview.style.display = 'block';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    currentSectionId = null;
    currentSubId = null;
    editando = false;
});


