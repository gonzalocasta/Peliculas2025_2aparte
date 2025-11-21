// MODELO DE DATOS

    // TMDb API Configuration
    const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOTgxNWVjZTI4ZjcyNWJlZGRmY2Y3OGE0YzRjZGU0ZiIsIm5iZiI6MTc2MDQ1NjUxNS4xNDcsInN1YiI6IjY4ZWU2ZjQzNDYzMzQ0Yjg0MTlkZjQ3MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ejdXz4pm0dZn0OAVJvJ16R8SwNAa-MBkO_yttUiblLk';
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

    let mis_peliculas_iniciales = [
       {titulo: "Superlópez",   director: "Javier Ruiz Caldera", "miniatura": "files/superlopez.svg"},
       {titulo: "Jurassic Park", director: "Steven Spielberg", "miniatura": "files/jurassicpark.svg"},
       {titulo: "Interstellar",  director: "Christopher Nolan", "miniatura": "files/interstellar.svg"}
    ];

    let mis_peliculas = [];

    const postAPI = async (peliculas) => {
        // Store directly in localStorage as primary storage
        const localStorageKey = 'peliculas_data';
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(peliculas));
            return localStorageKey;
        } catch (err) {
            console.error("Error storing data in localStorage:", err);
            alert("No se ha podido guardar la información localmente.");
            return null;
        }
    }
    const getAPI = async () => {
        try {
            if (!localStorage.URL) return [];
            // Read directly from localStorage
            const data = localStorage.getItem(localStorage.URL);
            if (!data) return [];
            return JSON.parse(data);
        } catch (err) {
            console.error("Error reading data from localStorage:", err);
            alert("No se ha podido leer la información.");
            return [];
        }
    }
    const updateAPI = async (peliculas) => {
        try {
            if (!localStorage.URL) {
                throw new Error("No storage key found");
            }
            // Update directly in localStorage
            localStorage.setItem(localStorage.URL, JSON.stringify(peliculas));
        } catch (err) {
            console.error("Error updating data in localStorage:", err);
            alert("No se ha podido actualizar la información.");
        }
    }

    // TMDb API Functions
    const searchMovies = async (query) => {
        try {
            const res = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${TMDB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            return data.results || [];
        } catch (err) {
            alert("No se ha podido buscar películas en TMDb.");
            return [];
        }
    }

    const getMovieDetails = async (movieId) => {
        try {
            const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?append_to_response=credits`, {
                headers: {
                    'Authorization': `Bearer ${TMDB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return await res.json();
        } catch (err) {
            alert("No se ha podido obtener detalles de la película.");
            return null;
        }
    }

    // VISTAS

    const indexView = (peliculas) => {
        let i=0;
        let view = "";

        while(i < peliculas.length) {
          view += `
        <div class="movie">
           <div class="movie-img">
            <img class="show" data-my-id="${i}" src="${peliculas[i].miniatura}" onerror="this.src='files/placeholder.svg'"/>
           </div>
           <div class="title">
               ${peliculas[i].titulo || "<em>Sin título</em>"}
           </div>
           <div class="actions">
               <button class="edit" data-my-id="${i}">editar</button>
               <button class="delete" data-my-id="${i}">borrar</button>
            </div>
        </div>\n`;
          i = i + 1;
        };

        view += `<div class="actions">
            <button class="new">Añadir</button>
            <button class="search">Buscar en TMDb</button>
            <button class="reset">Reset</button>
            </div>`;

        return view;
    }

    const editView = (i, pelicula) => {
        return `<h2>Editar Película </h2>
        <div class="field">
        Título <br>
        <input  type="text" id="titulo" placeholder="Título" 
            value="${pelicula.titulo}">
        </div>
        <div class="field">
        Director <br>
        <input  type="text" id="director" placeholder="Director" 
            value="${pelicula.director}">
        </div>
        <div class="field">
        Miniatura <br>
        <input  type="text" id="miniatura" placeholder="URL de la miniatura" 
            value="${pelicula.miniatura}">
        </div>
        <div class="actions">
            <button class="update" data-my-id="${i}">
            Actualizar
            </button>
            <button class="index">
            Volver
            </button>
           `;
    }

    const showView = (pelicula) => {
        return `
         <h2>${pelicula.titulo || "<em>Sin título</em>"}</h2>
         <div>
        <img src="${pelicula.miniatura}" onerror="this.src='files/placeholder.svg'" style="max-width:200px"/>
         </div>
         <p><strong>Director:</strong> ${pelicula.director || "<em>Sin director</em>"}</p>
         <div class="actions">
        <button class="index">Volver</button>
         </div>`;
    }

    const newView = () => {
        return `<h2>Crear Película</h2>
        <div class="field">
            Título <br>
            <input type="text" id="titulo" placeholder="Título">
        </div>
        <div class="field">
            Director <br>
            <input type="text" id="director" placeholder="Director">
        </div>
        <div class="field">
            Miniatura <br>
            <input type="text" id="miniatura" placeholder="URL de la miniatura">
        </div>
        <div class="actions">
            <button class="create">Crear</button>
            <button class="index">Volver</button>
        </div>`;
    }

    const searchView = (searchResults = []) => {
        let resultsHtml = '';
        
        if (searchResults.length > 0) {
            resultsHtml = '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
            searchResults.forEach((movie, index) => {
                const posterUrl = movie.poster_path 
                    ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` 
                    : 'files/placeholder.svg';
                resultsHtml += `
                <div class="movie" style="max-width: 200px;">
                    <div class="movie-img">
                        <img src="${posterUrl}" onerror="this.src='files/placeholder.svg'" alt="${movie.title}"/>
                    </div>
                    <div class="title">${movie.title}</div>
                    <div style="font-size: 10px; color: #666; margin: 5px 0;">
                        ${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
                    </div>
                    <div class="actions">
                        <button class="add-from-search" data-movie-id="${movie.id}">Añadir</button>
                    </div>
                </div>`;
            });
            resultsHtml += '</div>';
        } else if (searchResults.length === 0 && document.getElementById('search-input')) {
            resultsHtml = '<p>No se encontraron resultados.</p>';
        }
        
        return `<h2>Buscar Película en TMDb</h2>
        <div class="field">
            <input type="text" id="search-input" placeholder="Buscar película..." 
                style="width: 300px; padding: 8px; font-size: 14px;">
            <button class="search-tmdb" style="padding: 8px 16px; margin-left: 5px;">Buscar</button>
        </div>
        <div id="search-results" style="margin-top: 20px;">
            ${resultsHtml}
        </div>
        <div class="actions" style="margin-top: 20px;">
            <button class="index">Volver</button>
        </div>`;
    }

    // CONTROLADORES 

    const initContr = async () => {
        if (!localStorage.URL || localStorage.URL === "undefined") {
        localStorage.URL = await postAPI(mis_peliculas_iniciales);
        }
        indexContr();
    }

    const indexContr = async () => {
        mis_peliculas = await getAPI() || [];
        document.getElementById('main').innerHTML = await indexView(mis_peliculas);
    }

    const showContr = (i) => {
        document.getElementById('main').innerHTML = showView(mis_peliculas[i]);
    }

    const newContr = () => {
        document.getElementById('main').innerHTML = newView();
    }

    const createContr = async () => {
        const titulo = document.getElementById('titulo').value;
        const director = document.getElementById('director').value;
        const miniatura = document.getElementById('miniatura').value;
        mis_peliculas.push({titulo, director, miniatura});
        await updateAPI(mis_peliculas);
        indexContr();
    }

    const editContr = (i) => {
        document.getElementById('main').innerHTML = editView(i,  mis_peliculas[i]);
    }

    const updateContr = async (i) => {
        mis_peliculas[i].titulo   = document.getElementById('titulo').value;
        mis_peliculas[i].director = document.getElementById('director').value;
        mis_peliculas[i].miniatura = document.getElementById('miniatura').value;
        await updateAPI(mis_peliculas);
        indexContr();
    }

    const deleteContr = async (i) => {
        if (confirm("¿Seguro que quieres borrar esta película?")) {
        mis_peliculas.splice(i, 1);
        await updateAPI(mis_peliculas);
        indexContr();
        }
    }

    const resetContr = async () => {
        if (confirm("¿Seguro que quieres reiniciar la lista de películas?")) {
        await updateAPI(mis_peliculas_iniciales);
        indexContr();
        }
    }

    const searchContr = () => {
        document.getElementById('main').innerHTML = searchView();
    }

    const searchTMDbContr = async () => {
        const query = document.getElementById('search-input').value;
        if (!query.trim()) {
            alert("Por favor, introduce un término de búsqueda.");
            return;
        }
        const results = await searchMovies(query);
        document.getElementById('main').innerHTML = searchView(results);
    }

    const addFromSearchContr = async (movieId) => {
        const movieDetails = await getMovieDetails(movieId);
        if (!movieDetails) return;

        const director = movieDetails.credits?.crew?.find(person => person.job === 'Director')?.name || 'Desconocido';
        const posterUrl = movieDetails.poster_path 
            ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}` 
            : 'files/placeholder.svg';

        const newMovie = {
            titulo: movieDetails.title,
            director: director,
            miniatura: posterUrl
        };

        mis_peliculas.push(newMovie);
        await updateAPI(mis_peliculas);
        alert(`"${movieDetails.title}" añadida a tu lista!`);
        indexContr();
    }

    // ROUTER de eventos
    const matchEvent = (ev, sel) => ev.target.matches(sel)
    const myId = (ev) => Number(ev.target.dataset.myId)

    document.addEventListener('click', ev => {
        if      (matchEvent(ev, '.index'))  indexContr  ();
        else if (matchEvent(ev, '.edit'))   editContr   (myId(ev));
        else if (matchEvent(ev, '.update')) updateContr (myId(ev));
        else if (matchEvent(ev, '.show'))   showContr   (myId(ev));
        else if (matchEvent(ev, '.new'))    newContr    ();
        else if (matchEvent(ev, '.create')) createContr ();
        else if (matchEvent(ev, '.delete')) deleteContr (myId(ev));
        else if (matchEvent(ev, '.reset'))  resetContr  ();
        else if (matchEvent(ev, '.search')) searchContr ();
        else if (matchEvent(ev, '.search-tmdb')) searchTMDbContr ();
        else if (matchEvent(ev, '.add-from-search')) addFromSearchContr (ev.target.dataset.movieId);
    })

    document.addEventListener('keypress', ev => {
        if (ev.key === 'Enter' && ev.target.id === 'search-input') {
            searchTMDbContr();
        }
    })
    
    
    // Inicialización        
    document.addEventListener('DOMContentLoaded', initContr);