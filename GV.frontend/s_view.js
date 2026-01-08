const menuList = document.getElementById("menu-list");
const preview = document.getElementById("preview");
const title = document.getElementById("title");

async function cargarSecciones() {
  const res = await fetch(`${API_BASE}/secciones`);
  const secciones = await res.json();
  renderMenu(secciones);
}

function renderMenu(secciones) {
  menuList.innerHTML = "";

  secciones.forEach(sec => {
    const li = document.createElement("li");
    li.classList.add("section");
    li.textContent = sec.nombre;

    const ul = document.createElement("ul");
    ul.classList.add("subitems");

    sec.subitems.forEach(sub => {
      const subLi = document.createElement("li");
      subLi.classList.add("subitem");
      subLi.textContent = sub.nombre;

      subLi.onclick = () => mostrarContenido(sub);

      ul.appendChild(subLi);
    });

    li.appendChild(ul);
    menuList.appendChild(li);
  });
}

function mostrarContenido(sub) {
  title.textContent = sub.nombre;
  preview.innerHTML = marked.parse(sub.contenido || "Sin contenido");
}

cargarSecciones();
