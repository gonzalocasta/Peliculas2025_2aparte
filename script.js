// --- CONFIGURACIÓN Y MODELO DE DATOS ---

const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOTgxNWVjZTI4ZjcyNWJlZGRmY2Y3OGE0YzRjZGU0ZiIsIm5iZiI6MTc2MDQ1NjUxNS4xNDcsInN1YiI6IjY4ZWU2ZjQzNDYzMzQ0Yjg0MTlkZjQ3MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ejdXz4pm0dZn0OAVJvJ16R8SwNAa-MBkO_yttUiblLk';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Iniciamos con listas vacías
let mis_peliculas_iniciales = [];
let mis_peliculas = [];
let mis_palabras_clave = [];

// --- GESTIÓN DE ALMACENAMIENTO (LOCALSTORAGE) ---

const postAPI = async (peliculas) => {
    try {
        localStorage.setItem('peliculas_data', JSON.stringify(peliculas));
        return 'peliculas_data';
    } catch (err) {
        console.error("Error guardando:", err);
        return null;
    }
}

const getAPI = async () => {
    try {
        const moviesData = localStorage.getItem('peliculas_data') || '[]';
        mis_peliculas = JSON.parse(moviesData);
        
        const keywordsData = localStorage.getItem('mis_palabras_clave') || '[]';
        mis_palabras_clave = JSON.parse(keywordsData);

        return mis_peliculas;
    } catch (err) {
        console.error("Error leyendo:", err);
        return [];
    }
}

const updateAPI = async (peliculas) => {
    try {
        localStorage.setItem('peliculas_data', JSON.stringify(peliculas));
    } catch (err) {
        console.error("Error actualizando películas:", err);
    }
}

// Gestión de Lista Personalizada de Keywords
const addKeywordToList = async (keyword) => {
    if (!mis_palabras_clave.includes(keyword)) {
        mis_palabras_clave.push(keyword);
        localStorage.setItem('mis_palabras_clave', JSON.stringify(mis_palabras_clave));
        return true;
    }
    return false;
}

const removeKeywordFromList = async (index) => {
    mis_palabras_clave.splice(index, 1);
    localStorage.setItem('mis_palabras_clave', JSON.stringify(mis_palabras_clave));
}

// --- API CLIENT (TMDb) ---

const searchMovies = async (query) => {
    try {
        const res = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${TMDB_API_KEY}`, 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return data.results || [];
    } catch (err) {
        console.error(err);
        return [];
    }
}

const getMovieDetails = async (movieId) => {
    try {
        const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?append_to_response=credits`, {
            headers: { 'Authorization': `Bearer ${TMDB_API_KEY}`, 'Content-Type': 'application/json' }
        });
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

const getMovieKeywords = async (movieId) => {
    try {
        const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/keywords`, {
            headers: { 'Authorization': `Bearer ${TMDB_API_KEY}`, 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return data.keywords || []; 
    } catch (err) {
        console.error("Error obteniendo keywords:", err);
        return [];
    }
}

// Lógica de Limpieza (Regex)
const processKeywords = (keywords) => {
    const cleanedList = [];
    keywords.forEach(item => {
        let cleanWord = item.name
            .replace(/[^a-zñáéíóú0-9 ]+/igm, "") // Eliminar caracteres raros
            .trim()
            .toLowerCase();
        if (cleanWord) cleanedList.push(cleanWord);
    });
    return cleanedList;
}

// --- VISTAS (UI - DISEÑO PROFESIONAL) ---

const indexView = (peliculas) => {
    let view = "";
    if (peliculas.length === 0) {
        view += `
        <div style="grid-column: 1/-1; text-align:center; padding: 60px;">
            <h2 style="color: var(--text-secondary); font-weight:300;">Tu colección está vacía 🍿</h2>
            <p style="color: var(--text-secondary);">Usa el buscador para empezar a añadir películas.</p>
        </div>`;
    } else {
        peliculas.forEach((pelicula, i) => {
            view += `
            <div class="movie">
               <div class="movie-img">
                   <img class="show" data-my-id="${i}" src="${pelicula.miniatura}" onerror="this.src='files/placeholder.png'"/>
               </div>
               <div class="title">${pelicula.titulo || "<em>Sin título</em>"}</div>
               <p>${pelicula.director || "Director desconocido"}</p>
               <div class="actions">
                   <button class="edit" data-my-id="${i}">Editar</button>
                   <button class="keywords" data-my-id="${i}">Keywords</button>
                   <button class="delete" data-my-id="${i}">Borrar</button>
                </div>
            </div>`;
        });
    }

    view += `<div class="actions">
        <button class="search">🔍 Buscar TMDb</button>
        <button class="new">➕ Añadir Manual</button>
        <button class="my-keywords">🏷️ Mis Keywords</button>
        <button class="reset">🗑️ Resetear</button>
        </div>`;

    return view;
}

const searchView = (searchResults = []) => {
    let resultsHtml = '';
    if (searchResults.length > 0) {
        // Grid interno para los resultados
        resultsHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; width: 100%;">';
        
        searchResults.forEach((movie) => {
            const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : 'files/placeholder.png';
            
            // Tags de keywords
            const keywordsHtml = movie.mis_keywords && movie.mis_keywords.length > 0 
                ? movie.mis_keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')
                : '';

            resultsHtml += `
            <div class="movie">
                <div class="movie-img">
                    <img src="${posterUrl}" style="width:100%; height:100%; object-fit:cover;"/>
                </div>
                <div class="title" style="font-size: 0.9rem;">${movie.title}</div>
                <div style="padding: 0 15px 10px 15px;">
                    ${keywordsHtml}
                </div>
                <div class="actions">
                    <button class="add-from-search" data-movie-id="${movie.id}">Añadir</button>
                </div>
            </div>`;
        });
        resultsHtml += '</div>';
    }
    
    // Usamos keywords-container para dar estilo de "tarjeta grande" al formulario
    return `
    <div class="keywords-container" style="max-width: 1000px;">
        <h2>Buscar en TMDb</h2>
        <div class="field">
            <input type="text" id="search-input" placeholder="Escribe el nombre de la película...">
        </div>
        <div class="actions" style="justify-content: flex-start; margin-bottom: 20px; border-top: none;">
             <button class="search-tmdb">Buscar</button>
             <button class="index" style="background: transparent; border: 1px solid #fff;">Cancelar</button>
        </div>
        <div id="search-results">${resultsHtml}</div>
    </div>`;
}

const keywordsView = (pelicula, keywordsList) => {
    let listHtml = '';
    if (keywordsList.length > 0) {
        listHtml = '<ul class="keywords-list-ui">';
        keywordsList.forEach(word => {
            listHtml += `
            <li>
                <span class="keyword-text">${word}</span>
                <button class="add-keyword" data-word="${word}">Guardar</button>
            </li>`;
        });
        listHtml += '</ul>';
    } else {
        listHtml = '<p style="color: #94a3b8;">No hay palabras clave disponibles.</p>';
    }

    return `
    <div class="keywords-container">
        <h2>Palabras clave: <span style="color:var(--accent)">${pelicula.titulo}</span></h2>
        ${listHtml}
        <div class="actions" style="margin-top: 20px;">
            <button class="index">Volver</button>
        </div>
    </div>`;
}

const myKeywordsView = () => {
    let listHtml = '';
    if (mis_palabras_clave.length > 0) {
        listHtml = '<ul class="keywords-list-ui">';
        mis_palabras_clave.forEach((word, index) => {
            listHtml += `
            <li>
                <span class="keyword-text">${word}</span>
                <button class="remove-keyword" data-index="${index}">Eliminar</button>
            </li>`;
        });
        listHtml += '</ul>';
    } else {
        listHtml = '<div style="padding:20px; text-align:center; color: #94a3b8;">No has guardado ninguna palabra clave todavía.</div>';
    }

    return `
    <div class="keywords-container">
        <h2>Mi Lista de Palabras Clave</h2>
        ${listHtml}
        <div class="actions" style="margin-top: 20px;">
            <button class="index">Volver al Inicio</button>
        </div>
    </div>`;
}

const editView = (i, pelicula) => {
    return `
    <div class="keywords-container">
        <h2>Editar Película</h2>
        <div class="field">Título <br><input type="text" id="titulo" value="${pelicula.titulo}"></div>
        <div class="field">Director <br><input type="text" id="director" value="${pelicula.director}"></div>
        <div class="field">Miniatura <br><input type="text" id="miniatura" value="${pelicula.miniatura}"></div>
        <div class="actions">
            <button class="update" data-my-id="${i}">Actualizar</button>
            <button class="index" style="background:transparent; border:1px solid #fff;">Cancelar</button>
        </div>
    </div>`;
}

const showView = (pelicula) => {
    return `
    <div class="keywords-container" style="text-align:center;">
     <h2>${pelicula.titulo}</h2>
     <div style="margin: 20px 0;">
        <img src="${pelicula.miniatura}" onerror="this.src='files/placeholder.png'" style="max-width:300px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"/>
     </div>
     <p><strong>Director:</strong> ${pelicula.director}</p>
     <div class="actions"><button class="index">Volver</button></div>
    </div>`;
}

const newView = () => {
    return `
    <div class="keywords-container">
        <h2>Crear Película Manual</h2>
        <div class="field">Título <br><input type="text" id="titulo" placeholder="Ej. Matrix"></div>
        <div class="field">Director <br><input type="text" id="director" placeholder="Ej. Wachowski Sisters"></div>
        <div class="field">Miniatura <br><input type="text" id="miniatura" placeholder="URL de imagen"></div>
        <div class="actions">
            <button class="create">Crear</button>
            <button class="index" style="background:transparent; border:1px solid #fff;">Cancelar</button>
        </div>
    </div>`;
}

// --- CONTROLADORES (LÓGICA) ---

const initContr = async () => {
    if (!localStorage.getItem('peliculas_data')) {
        await postAPI(mis_peliculas_iniciales);
    }
    await indexContr();
}

const indexContr = async () => {
    mis_peliculas = await getAPI();
    document.getElementById('main').innerHTML = indexView(mis_peliculas);
}

const showContr = (i) => { document.getElementById('main').innerHTML = showView(mis_peliculas[i]); }
const newContr = () => { document.getElementById('main').innerHTML = newView(); }
const editContr = (i) => { document.getElementById('main').innerHTML = editView(i, mis_peliculas[i]); }
const searchContr = () => { document.getElementById('main').innerHTML = searchView(); }
const myKeywordsContr = () => { document.getElementById('main').innerHTML = myKeywordsView(); }

const createContr = async () => {
    const titulo = document.getElementById('titulo').value;
    const director = document.getElementById('director').value;
    const miniatura = document.getElementById('miniatura').value;
    mis_peliculas.push({titulo, director, miniatura, id: null});
    await updateAPI(mis_peliculas);
    indexContr();
}

const updateContr = async (i) => {
    mis_peliculas[i].titulo = document.getElementById('titulo').value;
    mis_peliculas[i].director = document.getElementById('director').value;
    mis_peliculas[i].miniatura = document.getElementById('miniatura').value;
    await updateAPI(mis_peliculas);
    indexContr();
}

const deleteContr = async (i) => {
    if (confirm("¿Seguro que quieres eliminar esta película?")) {
        mis_peliculas.splice(i, 1);
        await updateAPI(mis_peliculas);
        indexContr();
    }
}

const resetContr = async () => {
    if (confirm("¿Borrar TODA la colección y reiniciar?")) {
        await postAPI([]); // Reinicia a vacío
        localStorage.removeItem('mis_palabras_clave');
        indexContr();
    }
}

const searchTMDbContr = async () => {
    const query = document.getElementById('search-input').value;
    if (!query) return;
    
    document.getElementById('search-results').innerHTML = '<p style="text-align:center; color:#fff;">Buscando en el universo de películas...</p>';
    
    const results = await searchMovies(query);
    
    // Enriquecer con Keywords (Parte 3)
    const resultsWithKeywords = await Promise.all(results.map(async (movie) => {
        const rawKeywords = await getMovieKeywords(movie.id);
        const cleanKeywords = processKeywords(rawKeywords);
        // Guardamos las primeras 3 para mostrar en la tarjeta
        return { ...movie, mis_keywords: cleanKeywords.slice(0, 3) };
    }));

    document.getElementById('main').innerHTML = searchView(resultsWithKeywords);
}

const addFromSearchContr = async (movieId) => {
    const movieDetails = await getMovieDetails(movieId);
    if (!movieDetails) return;
    
    const director = movieDetails.credits?.crew?.find(p => p.job === 'Director')?.name || 'Desconocido';
    const posterUrl = movieDetails.poster_path ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}` : 'files/placeholder.png';
    
    mis_peliculas.push({ 
        titulo: movieDetails.title, 
        director: director, 
        miniatura: posterUrl, 
        id: movieDetails.id 
    });
    
    await updateAPI(mis_peliculas);
    alert("¡Película añadida a tu colección!");
    indexContr();
}

const keywordsContr = async (i) => {
    const pelicula = mis_peliculas[i];
    if (!pelicula.id) {
        alert("Esta película se creó manualmente y no tiene conexión con TMDb.");
        return;
    }
    
    // Carga visual mientras esperamos
    document.getElementById('main').innerHTML = `<div class="keywords-container"><p>Cargando keywords...</p></div>`;
    
    const rawKeywords = await getMovieKeywords(pelicula.id);
    const processedKeywords = processKeywords(rawKeywords);
    document.getElementById('main').innerHTML = keywordsView(pelicula, processedKeywords);
}

const addKeywordContr = async (keyword) => {
    const added = await addKeywordToList(keyword);
    if (added) alert(`"${keyword}" guardada.`);
    else alert("Ya tienes esta palabra en tu lista.");
}

const removeKeywordContr = async (index) => {
    await removeKeywordFromList(index);
    myKeywordsContr(); // Recargar vista
}

// --- ROUTER DE EVENTOS ---
const matchEvent = (ev, sel) => ev.target.matches(sel);
const myId = (ev) => Number(ev.target.dataset.myId);

document.addEventListener('click', ev => {
    if      (matchEvent(ev, '.index'))     indexContr();
    else if (matchEvent(ev, '.edit'))      editContr(myId(ev));
    else if (matchEvent(ev, '.update'))    updateContr(myId(ev));
    else if (matchEvent(ev, '.show'))      showContr(myId(ev));
    else if (matchEvent(ev, '.new'))       newContr();
    else if (matchEvent(ev, '.create'))    createContr();
    else if (matchEvent(ev, '.delete'))    deleteContr(myId(ev));
    else if (matchEvent(ev, '.reset'))     resetContr();
    else if (matchEvent(ev, '.search'))    searchContr();
    else if (matchEvent(ev, '.search-tmdb')) searchTMDbContr();
    else if (matchEvent(ev, '.add-from-search')) addFromSearchContr(ev.target.dataset.movieId);
    
    // Eventos Parte 3
    else if (matchEvent(ev, '.keywords'))    keywordsContr(myId(ev));
    else if (matchEvent(ev, '.add-keyword')) addKeywordContr(ev.target.dataset.word);
    else if (matchEvent(ev, '.my-keywords')) myKeywordsContr();
    else if (matchEvent(ev, '.remove-keyword')) removeKeywordContr(Number(ev.target.dataset.index));
});

// Evento Enter para búsqueda
document.addEventListener('keypress', ev => {
    if (ev.key === 'Enter' && ev.target.id === 'search-input') searchTMDbContr();
});

// Inicialización
document.addEventListener('DOMContentLoaded', initContr);