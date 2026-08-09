const CATEGORIES = ["Chauffeurs","Chefs privés","Sécurité","Yachts & Jets","Villas","Événementiel","Autres"];
let entries = [];
let activeCat = "Tous";
let searchTerm = "";

const tabsEl = document.getElementById('tabs');
const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const appEl = document.getElementById('app');

function renderTabs(){
  const cats = ["Tous", ...CATEGORIES];
  tabsEl.innerHTML = cats.map(c =>
    `<button class="tab ${c===activeCat?'active':''}" data-cat="${c}">${c}</button>`
  ).join('');
  tabsEl.querySelectorAll('.tab').forEach(b=>{
    b.addEventListener('click', ()=>{ activeCat = b.dataset.cat; renderTabs(); renderList(); });
  });
}

function stars(n){
  n = parseInt(n) || 0;
  let s = '';
  for(let i=1;i<=5;i++) s += i<=n ? '★' : '☆';
  return s;
}

function waLink(phone){
  const digits = (phone||'').replace(/[^0-9+]/g,'').replace(/^\+?/, '');
  return digits ? `https://wa.me/${digits}` : null;
}

function renderList(){
  let filtered = entries.filter(e => activeCat==="Tous" || e.category===activeCat);
  if(searchTerm.trim()){
    const t = searchTerm.toLowerCase();
    filtered = filtered.filter(e =>
      (e.name||'').toLowerCase().includes(t) ||
      (e.specialty||'').toLowerCase().includes(t) ||
      (e.zone||'').toLowerCase().includes(t)
    );
  }
  if(filtered.length===0){
    listEl.innerHTML = `<div class="empty">Aucun prestataire ici pour l'instant.<br>Ajoutez-en un avec le bouton ci-dessous.</div>`;
    return;
  }
  filtered.sort((a,b)=> (b.confidence||0) - (a.confidence||0));
  listEl.innerHTML = filtered.map(e => {
    const wa = waLink(e.phone);
    return `
    <div class="card">
      <div class="card-top">
        <div>
          <p class="card-name">${escapeHtml(e.name)}</p>
          <p class="card-cat">${escapeHtml(e.category)}</p>
        </div>
        <div class="stars">${stars(e.confidence)}</div>
      </div>
      ${e.specialty ? `<p class="card-spec">${escapeHtml(e.specialty)}</p>` : ''}
      <div class="card-meta">
        ${e.zone ? `<span class="pill">${escapeHtml(e.zone)}</span>` : ''}
        ${e.languages ? `<span class="pill">${escapeHtml(e.languages)}</span>` : ''}
        ${e.rate ? `<span class="pill">${escapeHtml(e.rate)}</span>` : ''}
      </div>
      <div class="card-actions">
        ${e.phone ? `<a class="btn-action btn-call" href="tel:${escapeHtml(e.phone)}">Appeler</a>` : ''}
        ${wa ? `<a class="btn-action btn-wa" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
        <button class="btn-action btn-del" data-id="${e.id}">Suppr.</button>
      </div>
    </div>`;
  }).join('');
  listEl.querySelectorAll('.btn-del').forEach(b=>{
    b.addEventListener('click', ()=> deleteEntry(b.dataset.id));
  });
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function loadEntries(){
  try{
    const data = localStorage.getItem('prestataires');
    entries = data ? JSON.parse(data) : [];
  }catch(err){
    entries = [];
  }
  renderList();
}

function saveEntries(){
  try{
    localStorage.setItem('prestataires', JSON.stringify(entries));
  }catch(err){ console.error(err); }
}

function deleteEntry(id){
  entries = entries.filter(e => e.id !== id);
  saveEntries();
  renderList();
}

function addEntry(entry){
  entry.id = entry.id || (Date.now().toString(36) + Math.random().toString(36).slice(2,7));
  entries.push(entry);
  saveEntries();
  renderList();
}

searchEl.addEventListener('input', (e)=>{ searchTerm = e.target.value; renderList(); });

function openModal(){
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>Nouveau prestataire</h3>
      <div class="field"><label>Nom / entreprise</label><input id="f-name" type="text" /></div>
      <div class="field"><label>Catégorie</label>
        <select id="f-cat">${CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Spécialité</label><input id="f-spec" type="text" /></div>
      <div class="field"><label>Téléphone</label><input id="f-phone" type="tel" placeholder="+33 6 12 34 56 78" /></div>
      <div class="field"><label>Zone d'intervention</label><input id="f-zone" type="text" /></div>
      <div class="field"><label>Langues</label><input id="f-lang" type="text" placeholder="FR, EN..." /></div>
      <div class="field"><label>Tarif indicatif</label><input id="f-rate" type="text" /></div>
      <div class="field"><label>Confiance (1-5)</label><input id="f-conf" type="number" min="1" max="5" value="4" /></div>
      <div class="modal-actions">
        <button class="btn-cancel" id="f-cancel">Annuler</button>
        <button class="btn-save" id="f-save">Enregistrer</button>
      </div>
    </div>`;
  appEl.appendChild(overlay);
  
  const close = ()=> overlay.remove();
  document.getElementById('f-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); });
  
  document.getElementById('f-save').addEventListener('click', ()=>{
    const name = document.getElementById('f-name').value.trim();
    if(!name){ alert('Le nom est obligatoire'); return; }
    addEntry({
      name,
      category: document.getElementById('f-cat').value,
      specialty: document.getElementById('f-spec').value.trim(),
      phone: document.getElementById('f-phone').value.trim(),
      zone: document.getElementById('f-zone').value.trim(),
      languages: document.getElementById('f-lang').value.trim(),
      rate: document.getElementById('f-rate').value.trim(),
      confidence: document.getElementById('f-conf').value
    });
    close();
  });
}

document.getElementById('fabAdd').addEventListener('click', openModal);

renderTabs();
loadEntries();