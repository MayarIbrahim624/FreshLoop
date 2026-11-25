
/* ---------- Data & config ---------- */
const CATS = {
  fruit:    {label:'Fruit',            icon:'🍎'},
  veg:      {label:'Vegetables',       icon:'🥦'},
  dairy:    {label:'Dairy & Eggs',     icon:'🥛'},
  bakery:   {label:'Bread & Bakery',   icon:'🍞'},
  meat:     {label:'Meat & Fish',      icon:'🍗'},
  left:     {label:'Leftovers',        icon:'🍲'},
  pantry:   {label:'Pantry & Other',   icon:'🥫'}
};

const IDEAS_BY_CAT = {
  fruit:  ['Blend into a smoothie','Bake a quick fruit crumble','Freeze slices for later','Make a fruit salad'],
  veg:    ['Roast them with olive oil','Make a veggie soup','Stir-fry for dinner','Blend into a pasta sauce'],
  dairy:  ['Bake pancakes or muffins','Make a creamy soup or sauce','Prepare an omelette or scrambled eggs','Make a smoothie or lassi'],
  bakery: ['Make toast or croutons','Turn into French toast','Blitz into breadcrumbs','Make a bread pudding'],
  meat:   ['Cook it today or freeze it now','Make a stir-fry or curry','Add to a sandwich or wrap','Make fried rice'],
  left:   ['Reheat thoroughly for lunch','Wrap it in a tortilla','Mix into fried rice','Turn it into a pie filling'],
  pantry: ['Plan a meal around it this week','Share it with a neighbour','Add it to a one-pot meal']
};

/* keyword-specific ideas take priority over category ideas */
const IDEAS_BY_WORD = {
  banana:['Make a banana smoothie','Bake banana bread','Freeze for banana “nice cream”'],
  tomato:['Cook a quick tomato sauce','Make shakshuka','Slice into a fresh salad'],
  bread:['Make toast or croutons','Whip up French toast'],
  apple:['Bake cinnamon apples','Slice into oats or yogurt'],
  milk:['Make pancake batter','Cook rice pudding','Blend a milkshake'],
  yogurt:['Make a smoothie bowl','Use as a marinade for chicken'],
  yoghurt:['Make a smoothie bowl','Use as a marinade for chicken'],
  egg:['Boil a batch for snacks','Make an omelette or shakshuka'],
  potato:['Roast with herbs','Make mashed potatoes or a tortilla'],
  spinach:['Wilt into pasta or eggs','Blend into a green smoothie'],
  lettuce:['Make a big salad','Use as wrap instead of bread'],
  carrot:['Roast or glaze them','Grate into a salad or muffins'],
  lemon:['Squeeze & freeze as juice cubes','Make lemonade'],
  cheese:['Bake a cheesy toastie','Grate over pasta or eggs'],
  chicken:['Cook & shred for wraps','Make a curry or soup'],
  rice:['Make egg fried rice','Turn into rice pudding'],
  cucumber:['Make tzatziki or a salad','Quick-pickle the slices'],
  strawberr:['Make jam or compote','Blend into a smoothie'],
  mushroom:['Sauté with garlic','Add to omelettes or pasta']
};

/* combos: when several foods can be rescued together */
const COMBOS = [
  {need:['banana',['milk','yogurt','yoghurt']], title:'Banana smoothie', text:'Blend banana with milk or yogurt for a 2-minute breakfast.'},
  {need:['tomato','egg'],                       title:'Shakshuka',       text:'Simmer tomatoes, crack in eggs and serve with bread.'},
  {need:['bread','egg'],                        title:'French toast',    text:'Dip bread in beaten egg (and milk) and pan-fry.'},
  {need:['bread','tomato'],                     title:'Bruschetta',      text:'Toast the bread and top with chopped tomato and olive oil.'},
  {need:['rice','egg'],                         title:'Egg fried rice',  text:'Fry leftover rice with egg and any veggies on hand.'},
  {need:['apple',['milk','yogurt','yoghurt']],  title:'Apple yogurt bowl',text:'Dice the apple, add yogurt and a sprinkle of cinnamon.'},
  {need:['potato','egg'],                       title:'Spanish tortilla',text:'Slice potatoes, fry gently and bind with beaten eggs.'},
  {need:['chicken','rice'],                     title:'Chicken & rice bowl',text:'Cook both together with spices for a one-pot dinner.'}
];

const LS_KEY='freshloop.v1';

let state = load();
let filter='all', query='';

/* ---------- Data loading & storage ---------- */

function load(){
  try{
    const s=JSON.parse(localStorage.getItem(LS_KEY));

    if(s && Array.isArray(s.items)){
      return {
        ...s,
        items:s.items.map(it=>{
          const quantity=Number(it.quantity);

          return {
            ...it,
            quantity:Number.isFinite(quantity)&&quantity>0?quantity:1,
            unit:it.unit||'pieces'
          };
        }),
        used:Number(s.used)||0,
        wasted:Number(s.wasted)||0
      };
    }
  }catch(e){}

  return {items:[],used:0,wasted:0};
}

function save(){
  try{
    localStorage.setItem(LS_KEY,JSON.stringify(state));
  }catch(e){
    toast('Could not save your changes');
  }
}

/* ---------- Core logic ---------- */

function parseDate(str){
  const [y,m,d]=str.split('-').map(Number);
  return new Date(y,m-1,d);
}

function toISO(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function today(){
  const d=new Date();
  d.setHours(0,0,0,0);
  return d;
}

function daysLeft(str){
  return Math.round((parseDate(str)-today())/864e5);
}

/* Smart Rescue Score
   Expired food is separated for safety review.
   It does not receive a consumption priority score.
*/
function rescueScore(days){
  if(days<0) return 0;
  if(days===0) return 90;
  if(days<=2) return 75;
  if(days<=5) return 50;
  return 20;
}

function level(score,days){
  if(days<0) return {key:'expired',color:'var(--crit)',label:'Safety review'};
  if(score>=90) return {key:'urgent',color:'var(--crit)',label:'Use today'};
  if(score>=75) return {key:'urgent',color:'var(--high)',label:'Use very soon'};
  if(score>=50) return {key:'soon',color:'var(--med)',label:'Plan it'};
  return {key:'fresh',color:'var(--fresh)',label:'Fresh'};
}

function whenText(d){
  if(d<0) return `Expired ${-d} day${d===-1?'':'s'} ago`;
  if(d===0) return 'Expires today';
  if(d===1) return 'Expires tomorrow';
  return `Expires in ${d} days`;
}

function idea(item){
  const d=daysLeft(item.expiry);

  if(d<0){
    return 'Safety review needed. Check the food and its storage history. Never taste-test meat, fish or dairy.';
  }

  if(d>5) return 'Still fresh. No action needed yet.';

  const n=item.name.toLowerCase();

  for(const k in IDEAS_BY_WORD){
    if(n.includes(k)) return pick(IDEAS_BY_WORD[k],item.name);
  }

  return pick(IDEAS_BY_CAT[item.cat]||IDEAS_BY_CAT.pantry,item.name);
}

function pick(arr,seed){
  /* deterministic so cards don't change on re-render */
  let h=0;
  for(const c of seed) h=(h*31+c.charCodeAt(0))>>>0;
  return arr[h%arr.length];
}

/* Quantity formatting */

function roundQuantity(value){
  return Math.round(value*1000)/1000;
}

function formatQuantity(value){
  return String(roundQuantity(Number(value)));
}

function unitLabel(unit,quantity){
  const singular={
    pieces:'piece',
    packs:'pack',
    bottles:'bottle',
    containers:'container'
  };

  if(Number(quantity)===1 && singular[unit]){
    return singular[unit];
  }

  return unit||'pieces';
}

function quantityText(item){
  return `${formatQuantity(item.quantity)} ${unitLabel(item.unit,item.quantity)} remaining`;
}

function enriched(){
  return state.items.map(it=>{
    const d=daysLeft(it.expiry);
    const s=rescueScore(d);

    return {
      ...it,
      days:d,
      score:s,
      lvl:level(s,d)
    };
  }).sort((a,b)=>b.score-a.score||a.days-b.days||a.name.localeCompare(b.name));
}

const esc=s=>String(s).replace(/[&<>"']/g,c=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[c]));

/* ---------- Rendering ---------- */

function render(){
  const all=enriched();

  renderStats(all);
  renderReminders(all);
  renderRescue(all);
  renderList(all);
}

function renderStats(all){
  /* Includes expired items because they also require attention,
     but they are not treated as food to consume.
  */
  const urgent=all.filter(i=>i.days<=2).length;

  const done=state.used+state.wasted;

  $('sTotal').textContent=all.length;
  $('sUrgent').textContent=urgent;
  $('sSaved').textContent=state.used;
  $('sRate').textContent=done?Math.round(state.used/done*100)+'%':'–';
}

/* ---------- Smart Expiry Reminders ---------- */

function renderReminders(all){
  const section=$('reminders');
  const count=$('reminderCount');
  const list=$('reminderList');

  /* Show expired food and food expiring within the next two days. */
  const reminders=all
    .filter(i=>i.days<=2)
    .sort((a,b)=>a.days-b.days||a.name.localeCompare(b.name));

  if(!reminders.length){
    section.hidden=true;
    list.innerHTML='';
    count.textContent='0';
    return;
  }

  section.hidden=false;
  count.textContent=reminders.length;

  list.innerHTML=reminders.map(i=>{
    const expired=i.days<0;
    const cat=CATS[i.cat]||CATS.pantry;

    return `
      <div class="reminder-item ${expired?'expired':''}">
        <div class="reminder-info">
          <strong>${expired?'⚠️ Safety review:':'🔔'} ${esc(i.name)}</strong>
          <small>${expired?'Expired — review food safety':whenText(i.days)} · ${esc(quantityText(i))}</small>
        </div>
        <button type="button" data-jump="${esc(i.id)}">View item</button>
      </div>
    `;
  }).join('');
}

/* ---------- Rescue recommendations ---------- */

function renderRescue(all){
  const el=$('rescue');

  /* Expired food must never appear in normal rescue suggestions. */
  const active=all.filter(i=>i.days>=0);
  const expired=all.filter(i=>i.days<0);

  const hot=active.filter(i=>i.score>=75).slice(0,3);

  const names=active
    .filter(i=>i.score>=50)
    .map(i=>i.name.toLowerCase());

  const has=k=>(Array.isArray(k)?k:[k]).some(w=>
    active.some(i=>i.name.toLowerCase().includes(w))
  );

  const hasHot=k=>(Array.isArray(k)?k:[k]).some(w=>
    names.some(n=>n.includes(w))
  );

  const combos=COMBOS
    .filter(c=>c.need.every(has)&&c.need.some(hasHot))
    .slice(0,2);

  if(!all.length){
    el.className='card rescue calm';
    el.innerHTML=`
      <h2>🎯 Rescue Mission</h2>
      <p style="color:var(--muted)">Add your first food item using the form and FreshLoop will tell you what to use first.</p>
    `;
    return;
  }

  if(!hot.length && !expired.length){
    el.className='card rescue calm';
    el.innerHTML=`
      <h2>🎉 All clear</h2>
      <p style="color:var(--muted)">Nothing is about to expire. Your kitchen is in great shape!</p>
    `;
    return;
  }

  el.className='card rescue';

  let html='';

  if(hot.length){
    html+=`
      <h2>🚨 Use these first</h2>
      <div class="rescue-list">
        ${hot.map(i=>{
          const cat=CATS[i.cat]||CATS.pantry;

          return `
            <div class="rescue-item">
              <span class="em">${cat.icon}</span>
              <div>
                <p><b>${esc(i.name)}</b> · ${whenText(i.days)}</p>
                <small>${esc(idea(i))}</small>
                <small>Quantity: ${esc(quantityText(i))}</small>
              </div>
            </div>
          `;
        }).join('')}

        ${combos.map(c=>`
          <div class="rescue-item combo">
            <span class="em">💡</span>
            <div>
              <p><b>Combo idea: ${c.title}</b></p>
              <small>${c.text}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if(expired.length){
    html+=`
      <div class="rescue-list" style="margin-top:${hot.length?'18px':'0'}">
        <h2>⚠️ Safety review</h2>
        <p style="color:var(--muted);font-size:.88rem;margin-bottom:4px">
          These items are past their expiry date. They are excluded from consumption recommendations. Review their safety and discard them when necessary.
        </p>

        ${expired.map(i=>{
          const cat=CATS[i.cat]||CATS.pantry;

          return `
            <div class="rescue-item" style="border:1px solid rgba(255,107,107,.4)">
              <span class="em">⚠️</span>
              <div>
                <p><b>${esc(i.name)}</b> · ${whenText(i.days)}</p>
                <small>${esc(idea(i))}</small>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  el.innerHTML=html;
}

/* ---------- Food list ---------- */

function renderList(all){
  const q=query.trim().toLowerCase();

  const list=all.filter(i=>
    (filter==='all'||i.lvl.key===filter)&&
    (!q||i.name.toLowerCase().includes(q))
  );

  const box=$('items');

  if(!list.length){
    box.innerHTML=`
      <div class="card empty">
        <div class="big">${all.length?'🔎':'🥬'}</div>
        <p>${all.length?'No items match this view.':'Your fridge list is empty.'}</p>
      </div>
    `;
    return;
  }

  box.innerHTML=list.map((i,idx)=>{
    const cat=CATS[i.cat]||CATS.pantry;
    const expired=i.days<0;

    const tip=expired
      ?`<div class="tip"><b>⚠️ Safety:</b> ${esc(idea(i))}</div>`
      :`<div class="tip"><b>💡</b> ${esc(idea(i))}</div>`;

    return `
      <article
        class="item"
        id="food-${esc(i.id)}"
        style="--c:${i.lvl.color};animation-delay:${Math.min(idx,8)*40}ms"
      >
        <div class="ring" style="--p:${i.score}">
          <span>${expired?'!':i.score}</span>
        </div>

        <div class="info">
          <h3>
            ${cat.icon} ${esc(i.name)}
            <span class="badge">${i.lvl.label}</span>
          </h3>

          <div class="meta">
            ${cat.label} · ${esc(quantityText(i))} · ${whenText(i.days)} · ${esc(i.expiry)}
          </div>

          ${tip}
        </div>

        <div class="acts">
          ${expired?'':`
            <button class="btn sm" data-act="partial" data-id="${esc(i.id)}">
              ➖ Use some
            </button>

            <button class="btn sm primary" data-act="used" data-id="${esc(i.id)}">
              ✔ Used it
            </button>
          `}

          <button class="btn sm" data-act="wasted" data-id="${esc(i.id)}">
            🗑 Tossed
          </button>
        </div>
      </article>
    `;
  }).join('');
}

/* ---------- Events ---------- */

const $=id=>document.getElementById(id);

const catSel=$('cat');

catSel.innerHTML=Object.entries(CATS)
  .map(([k,v])=>`<option value="${k}">${v.icon} ${v.label}</option>`)
  .join('');

/* Auto-pick category when typing a known food */

const GUESS={
  fruit:['banana','apple','orange','berry','strawberr','grape','mango','lemon','pear'],
  veg:['tomato','potato','carrot','spinach','lettuce','cucumber','onion','pepper','mushroom','broccoli'],
  dairy:['milk','yogurt','yoghurt','cheese','egg','butter','cream'],
  bakery:['bread','bun','cake','croissant','toast'],
  meat:['chicken','beef','fish','meat','tuna','salmon','sausage'],
  left:['leftover','soup','pasta']
};

$('name').addEventListener('input',e=>{
  const n=e.target.value.toLowerCase();

  for(const k in GUESS){
    if(GUESS[k].some(w=>n.includes(w))){
      catSel.value=k;
      break;
    }
  }
});

/* Quick expiry date buttons */

function setDate(offset){
  const d=today();
  d.setDate(d.getDate()+offset);

  $('exp').value=toISO(d);

  document.querySelectorAll('#quick .chip').forEach(c=>
    c.classList.toggle('on',+c.dataset.d===offset)
  );
}

$('quick').addEventListener('click',e=>{
  if(e.target.dataset.d!==undefined){
    setDate(+e.target.dataset.d);
  }
});

$('exp').addEventListener('input',()=>{
  document.querySelectorAll('#quick .chip').forEach(c=>
    c.classList.remove('on')
  );
});

setDate(3);

/* ---------- Add food ---------- */

$('form').addEventListener('submit',e=>{
  e.preventDefault();

  const name=$('name').value.trim();
  const quantity=Number($('quantity').value);
  const unit=$('unit').value;
  const expiry=$('exp').value;

  if(!name) return;

  if(!Number.isFinite(quantity)||quantity<=0){
    toast('Please enter a valid quantity');
    $('quantity').focus();
    return;
  }

  if(!expiry){
    toast('Please select an expiry date');
    return;
  }

  state.items.push({
    id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
    name,
    cat:catSel.value,
    expiry,
    quantity:roundQuantity(quantity),
    unit
  });

  save();
  render();

  toast(`${name} added 🌱`);

  $('name').value='';
  $('quantity').value='1';
  $('name').focus();

  setDate(3);
});

/* ---------- Partial consumption & item actions ---------- */

$('items').addEventListener('click',e=>{
  const b=e.target.closest('button[data-act]');

  if(!b) return;

  const i=state.items.findIndex(x=>x.id===b.dataset.id);

  if(i<0) return;

  const it=state.items[i];
  const action=b.dataset.act;

  /* Expired food cannot be marked as consumed through this interface. */
  if(daysLeft(it.expiry)<0 && action!=='wasted'){
    toast('This item requires a safety review ⚠️');
    return;
  }

  if(action==='partial'){
    const current=Number(it.quantity)||1;

    const answer=window.prompt(
      `How much ${it.name} did you use?\nRemaining: ${formatQuantity(current)} ${unitLabel(it.unit,current)}`,
      ''
    );

    if(answer===null) return;

    const amount=Number(answer);

    if(!Number.isFinite(amount)||amount<=0){
      toast('Please enter a valid amount');
      return;
    }

    if(amount>current){
      toast(`You only have ${formatQuantity(current)} remaining`);
      return;
    }

    const remaining=roundQuantity(current-amount);

    if(remaining<=0){
      state.used++;
      state.items.splice(i,1);

      save();
      render();

      toast(`Great! ${it.name} fully used 🎉`);
      return;
    }

    it.quantity=remaining;

    save();
    render();

    toast(`${formatQuantity(amount)} used · ${formatQuantity(remaining)} remaining`);
    return;
  }

  if(action==='used'){
    /* Used it means the entire remaining quantity was consumed. */
    state.used++;

    toast(`Nice! ${it.name} rescued 🎉`);
  }else if(action==='wasted'){
    state.wasted++;

    toast(`${it.name} removed. Next time!`);
  }else{
    return;
  }

  state.items.splice(i,1);

  save();
  render();
});

/* ---------- Reminder navigation ---------- */

$('reminderList').addEventListener('click',e=>{
  const b=e.target.closest('button[data-jump]');

  if(!b) return;

  const id=b.dataset.jump;

  /* Make sure the item is visible even if a filter or search is active. */
  filter='all';
  query='';

  $('search').value='';

  document.querySelectorAll('#filters .chip').forEach(c=>
    c.classList.toggle('on',c.dataset.f==='all')
  );

  render();

  const target=document.getElementById(`food-${id}`);

  if(target){
    target.scrollIntoView({
      behavior:'smooth',
      block:'center'
    });

    target.style.outline='2px solid var(--accent)';
    target.style.outlineOffset='4px';

    setTimeout(()=>{
      target.style.outline='';
      target.style.outlineOffset='';
    },2200);
  }
});

/* Refresh reminders when the user returns to the tab. */
window.addEventListener('focus',()=>{
  render();
});

/* ---------- Filters & search ---------- */

$('filters').addEventListener('click',e=>{
  if(!e.target.dataset.f) return;

  filter=e.target.dataset.f;

  document.querySelectorAll('#filters .chip').forEach(c=>
    c.classList.toggle('on',c===e.target)
  );

  render();
});

$('search').addEventListener('input',e=>{
  query=e.target.value;
  render();
});

/* ---------- Copy rescue plan ---------- */

$('planBtn').addEventListener('click',()=>{
  /* Exclude expired food from consumption recommendations. */
  const list=enriched().filter(i=>i.days>=0&&i.score>=50);

  if(!list.length){
    toast('No unexpired items need a rescue plan right now');
    return;
  }

  const lines=list.map(i=>
    `• ${i.name} — ${quantityText(i)} (${whenText(i.days).toLowerCase()}): ${idea(i)}`
  );

  const text=
    `FreshLoop rescue plan, ${new Date().toLocaleDateString()}\n\n`+
    lines.join('\n');

  copyText(text).then(ok=>
    toast(ok?'Rescue plan copied 📋':'Could not copy, please try again')
  );
});

function copyText(text){
  if(navigator.clipboard&&window.isSecureContext){
    return navigator.clipboard.writeText(text)
      .then(()=>true)
      .catch(()=>fallbackCopy(text));
  }

  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text){
  const t=document.createElement('textarea');

  t.value=text;
  t.style.position='fixed';
  t.style.opacity='0';

  document.body.appendChild(t);
  t.select();

  let ok=false;

  try{
    ok=document.execCommand('copy');
  }catch(e){}

  t.remove();

  return ok;
}

/* ---------- Reset ---------- */

$('clearBtn').addEventListener('click',()=>{
  if(!confirm('Remove all items and reset your stats?')) return;

  state={
    items:[],
    used:0,
    wasted:0
  };

  save();
  render();

  toast('Everything reset');
});

/* ---------- Toast ---------- */

let tt;

function toast(msg){
  const t=$('toast');

  t.textContent=msg;
  t.classList.add('show');

  clearTimeout(tt);

  tt=setTimeout(()=>
    t.classList.remove('show'),
    2200
  );
}

/* ---------- Initial render ---------- */

render();
