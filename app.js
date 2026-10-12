const API_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const $ = (s) => document.querySelector(s);
const DEFAULT_API_KEY = "e09d89d37d2ee0d297fe0e05b0f4ea91";
let apiKey = localStorage.getItem("interned_tmdb_key") || DEFAULT_API_KEY;
let kind = "movie";
let currentPage = 1;
const grid = $("#grid"), topGrid = $("#topGrid"), notice = $("#notice");

function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function posterUrl(path){return path ? IMG_BASE+path : "";}
function showEmpty(el,title,body){el.innerHTML=`<div class="empty"><strong>${escapeHtml(title)}</strong>${escapeHtml(body)}</div>`;}
function loading(el,count=5){el.innerHTML=Array.from({length:count},()=>'<div class="skeleton"></div>').join("");}
function titleOf(item){return item.title||item.name||"Sin título";}
function yearOf(item){return (item.release_date||item.first_air_date||"").slice(0,4)||"Año desconocido";}
function card(item,type){
 const title=titleOf(item), poster=posterUrl(item.poster_path);
 return `<article class="movie-card" data-id="${item.id}" data-type="${type}">
 <div class="poster">${poster?`<img loading="lazy" src="${poster}" alt="${escapeHtml(title)}" onerror="this.style.display='none'">`:""}<span class="rating">★ ${Number(item.vote_average||0).toFixed(1)}</span></div>
 <h3>${escapeHtml(title)}</h3><div class="meta">${yearOf(item)} · ${type==="tv"?"Serie":"Película"}</div></article>`;
}
async function api(path,extra={}){
 if(!apiKey) throw new Error("Falta la API Key de TMDB.");
 const params=new URLSearchParams({api_key:apiKey,language:"es-AR",include_adult:"false",...extra});
 const response=await fetch(`${API_BASE}${path}?${params}`);
 if(!response.ok) throw new Error(response.status===401?"La API Key no es válida. Revisala en configuración.":`TMDB respondió con error ${response.status}.`);
 return response.json();
}
function setNotice(text){notice.textContent=text;}
async function loadCatalog(){
 if(!apiKey){showEmpty(grid,"Conectá el catálogo","Tocá ⚙ arriba y pegá tu API Key de TMDB.");showEmpty(topGrid,"Todavía no hay títulos","Cuando conectes TMDB aparecerán títulos populares.");setNotice("Falta conectar TMDB. La app carga los pósters y datos automáticamente con tu clave.");return;}
 loading(grid,10);loading(topGrid,5);
 const endpoint=kind==="anime"?"/discover/tv":`/${kind}/popular`;
 const extras=kind==="anime"?{with_genres:"16",sort_by:"popularity.desc", "first_air_date.gte":"2008-01-01", "first_air_date.lte":"2026-12-31"}:{"primary_release_date.gte":"2008-01-01","primary_release_date.lte":"2026-12-31"};
 try{
   const [popular,top]=await Promise.all([
     api(endpoint,{page:String(currentPage),...extras}),
     api(`/${kind}/top_rated`,{page:"1",...(kind==="anime"?{with_genres:"16"}:{})})
   ]);
   const filteredPopular=(popular.results||[]).filter(x=>{const y=Number(yearOf(x));return y>=2008&&y<=2026;});
   grid.innerHTML=filteredPopular.map(x=>card(x,kind==="movie"?"movie":"tv")).join("")||'<div class="empty">No se encontraron títulos.</div>';
   topGrid.innerHTML=(top.results||[]).filter(x=>{const y=Number(yearOf(x));return y>=2008&&y<=2026;}).slice(0,10).map(x=>card(x,kind==="movie"?"movie":"tv")).join("");
   $("#sectionTitle").textContent=kind==="movie"?"Películas populares":kind==="tv"?"Series populares":"Anime popular";
   setNotice(`Catálogo conectado · Página ${currentPage}. Los datos y pósters se cargan desde TMDB.`);
 }catch(e){showEmpty(grid,"No se pudo cargar",e.message);showEmpty(topGrid,"Sin resultados", "Revisá la clave o la conexión a internet.");setNotice(e.message);}
}
async function searchCatalog(query){
 if(!apiKey){$("#settingsModal").classList.remove("hidden");return;}
 if(!query.trim()){loadCatalog();return;}
 loading(grid,10);topGrid.innerHTML="";
 try{
  const data=await api("/search/multi",{query:query.trim(),page:"1"});
  const results=(data.results||[]).filter(x=>{if(x.media_type!=="movie"&&x.media_type!=="tv")return false;const y=Number(yearOf(x));return y>=2008&&y<=2026;});
  grid.innerHTML=results.map(x=>card(x,x.media_type)).join("")||'<div class="empty">No encontramos coincidencias.</div>';
  $("#sectionTitle").textContent=`Resultados para “${query.trim()}”`;
  setNotice(`Encontramos ${results.length} resultados para tu búsqueda.`);
 }catch(e){showEmpty(grid,"Error al buscar",e.message);}
}
async function openDetail(id,type){
 $("#detailModal").classList.remove("hidden");$("#detailContent").innerHTML='<div class="empty">Cargando información…</div>';
 try{
  const data=await api(`/${type}/${id}`,{append_to_response:"credits,recommendations,videos"});
  const name=titleOf(data), poster=posterUrl(data.poster_path), year=yearOf(data);
  const cast=(data.credits?.cast||[]).slice(0,5).map(x=>x.name).join(", ");
  const trailer=(data.videos?.results||[]).find(v=>v.site==="YouTube"&&v.type==="Trailer");
  const watch=data.homepage||"";
  $("#detailContent").innerHTML=`<div class="detail-layout">${poster?`<img src="${poster}" alt="${escapeHtml(name)}">`:""}<div><span class="eyebrow">${type==="tv"?"SERIE":"PELÍCULA"}</span><h2>${escapeHtml(name)}</h2><div class="detail-meta">★ ${Number(data.vote_average||0).toFixed(1)} · ${year} · ${data.runtime?data.runtime+" min":(data.episode_run_time?.[0]?data.episode_run_time[0]+" min por episodio":"Duración no disponible")}</div><p>${escapeHtml(data.overview||"Sin sinopsis disponible en español.")}</p><p><b>Reparto:</b> ${escapeHtml(cast||"No disponible")}</p><div class="detail-actions">${trailer?`<button class="primary" id="trailerBtn">▶ Ver tráiler</button>`:""}${watch?`<button id="officialBtn">Sitio oficial ↗</button>`:""}</div><p class="detail-note">Esta ficha muestra información y tráileres disponibles. La disponibilidad de películas completas depende de fuentes autorizadas.</p></div></div>`;
  if(trailer)$("#trailerBtn").onclick=()=>window.open("https://www.youtube.com/watch?v="+encodeURIComponent(trailer.key),"_blank","noopener");
  if(watch)$("#officialBtn").onclick=()=>window.open(watch,"_blank","noopener");
 }catch(e){$("#detailContent").innerHTML=`<div class="empty"><strong>No pudimos abrir el título</strong>${escapeHtml(e.message)}</div>`;}
}
$("#settingsBtn").onclick=()=>{$("#apiKey").value=apiKey;$("#settingsModal").classList.remove("hidden");};
$("#closeSettings").onclick=()=>$("#settingsModal").classList.add("hidden");
$("#closeDetail").onclick=()=>$("#detailModal").classList.add("hidden");
$("#settingsModal").addEventListener("click",e=>{if(e.target.id==="settingsModal")e.currentTarget.classList.add("hidden");});
$("#detailModal").addEventListener("click",e=>{if(e.target.id==="detailModal")e.currentTarget.classList.add("hidden");});
$("#saveKey").onclick=()=>{apiKey=$("#apiKey").value.trim();if(apiKey)localStorage.setItem("interned_tmdb_key",apiKey);else localStorage.removeItem("interned_tmdb_key");$("#settingsModal").classList.add("hidden");loadCatalog();};
document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));btn.classList.add("active");kind=btn.dataset.kind;currentPage=1;loadCatalog();}));
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();searchCatalog($("#searchInput").value);});
$("#refreshBtn").onclick=()=>loadCatalog();
$("#heroExplore").onclick=()=>document.querySelector(".tabs").scrollIntoView({behavior:"smooth"});
document.addEventListener("click",e=>{const c=e.target.closest(".movie-card");if(c)openDetail(c.dataset.id,c.dataset.type);});
loadCatalog();
