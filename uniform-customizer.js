(() => {
    const catalog = [
        {id:'mens-set',name:"Men's School Uniform Set",price:1150,image:'M Sets.png',parts:['School top','School pants'],included:['Uniform top','Uniform pants','School belt','School patch'],extras:[['ID lace',100]]},
        {id:'womens-set',name:"Women's School Uniform Set",price:1100,image:'Set 1.png',parts:['School top','School skirt'],included:['Uniform top','Uniform skirt','School ribbon','School patch'],extras:[['ID lace',100]]},
        {id:'pe-set',name:'PE Uniform Set',price:750,image:'PE Set.png',parts:['PE top','PE pants'],included:['PE uniform top','PE jogger pants'],extras:[['ID lace',100],['School patch',50]]},
        {id:'complete-set',name:'Complete Student Set',price:1900,image:'m fs.png',parts:['School top','School bottom','PE top','PE pants'],included:['School top and bottom','PE top and pants','School ID lace','School patch','Belt or ribbon'],extras:[]}
    ];
    const dialog = document.createElement('dialog');
    dialog.className = 'customize-dialog';
    document.body.append(dialog);
    let active, opener;
    const money = value => new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(value);
    function sizes(part,index) {
        return `<label>${part} size<select name="size${index}" required><option value="">Choose size</option>${['S','M','L','XL'].map(size=>`<option>${size}</option>`).join('')}</select></label>`;
    }
    function price() {
        return active.price + [...dialog.querySelectorAll('[name="extra"]:checked')].reduce((sum,input)=>sum+Number(input.dataset.price),0);
    }
    function update() {
        const quantity=Number(dialog.querySelector('[name="quantity"]').value);
        dialog.querySelector('#setTotal').textContent=money(price()*(Number.isInteger(quantity)&&quantity>0?quantity:1));
        if(active.id==='complete-set') dialog.querySelector('img').src='uniform%20sets/'+encodeURIComponent(dialog.querySelector('[name="variant"]').value==='Women'?'f fs.png':'m fs.png');
    }
    document.querySelectorAll('.set-button').forEach((button,index)=>{
        button.addEventListener('click',()=>{
            active=catalog[index];opener=button;
            dialog.innerHTML=`<form id="customizeForm"><header><div><p>BUILD YOUR SET</p><h2 id="setTitle">${active.name}</h2></div><button type="button" id="closeSet" aria-label="Close customization">×</button></header><div class="customize-body"><div><img class="set-preview" src="uniform%20sets/${encodeURIComponent(active.image)}" alt="${active.name}"><h3>Included in this set</h3><ul>${active.included.map(part=>`<li>${part}</li>`).join('')}</ul></div><div>${active.id==='complete-set'?'<label>Uniform variant<select name="variant"><option>Men</option><option>Women</option></select></label>':''}<div class="set-size-grid">${active.parts.map(sizes).join('')}</div><label>Fabric and color<select name="fabric"><option>${active.id==='pe-set'?'Standard PE fabric — Yellow / White / Black':active.id==='womens-set'?'Standard school fabric — Beige / Brown':active.id==='complete-set'?'Standard school and PE fabrics':'Standard school fabric — Pink / Brown'}</option></select></label><p class="set-help">School-approved colors shown. Additional fabrics are not available yet.</p><label>Number of sets<input type="number" name="quantity" min="1" max="99" step="1" value="1" required></label>${active.extras.length?'<h3>Optional extras</h3>'+active.extras.map(([name,cost])=>`<label class="extra-option"><input type="checkbox" name="extra" value="${name}" data-price="${cost}"> ${name} (+${money(cost)} per set)</label>`).join(''):'<p>All listed accessories are included.</p>'}<p>Base price per set: ${money(active.price)}</p><h3>Total: <output id="setTotal"></output></h3><p id="customizeStatus" role="status"></p><div class="set-buttons"><button class="btn primary-btn" type="submit" name="action" value="cart">Add to Cart</button><button class="btn secondary-btn" type="submit" name="action" value="buy">Buy Now</button></div></div></div></form>`;
            dialog.setAttribute('aria-labelledby','setTitle');
            dialog.querySelector('#closeSet').onclick=()=>dialog.close();
            dialog.querySelector('form').oninput=update;
            dialog.querySelector('form').onsubmit=submit;
            update();dialog.showModal();
        });
    });
    dialog.addEventListener('close',()=>opener?.focus());
    function submit(event) {
        event.preventDefault();
        const form=event.target;
        if(!form.reportValidity())return;
        const data=new FormData(form);
        const options=active.parts.map((part,index)=>`${part}: ${data.get('size'+index)}`);
        const extras=data.getAll('extra');
        const variant=data.get('variant');
        if(variant)options.unshift(variant+' uniform');
        if(extras.length)options.push('Extras: '+extras.join(', '));
        const description=options.join(' | ');
        const image=active.id==='complete-set'&&variant==='Women'?'f fs.png':active.image;
        const item={id:active.id,name:active.name,category:'Uniform Sets',size:description,fabric:data.get('fabric'),quantity:Number(data.get('quantity')),price:price(),image:'uniform%20sets/'+encodeURIComponent(image)};
        try {
            const cart=JSON.parse(localStorage.getItem('unifitCart')||'[]');
            const existing=cart.find(entry=>entry.id===item.id&&entry.size===item.size&&entry.fabric===item.fabric);
            if(existing)existing.quantity=Number(existing.quantity)+item.quantity;
            else cart.push(item);
            localStorage.setItem('unifitCart',JSON.stringify(cart));
            if(typeof updateUniFitCartCount==='function')updateUniFitCartCount();
            location.href=event.submitter?.value==='buy'?'checkout.html':'cart.html';
        } catch(error) {dialog.querySelector('#customizeStatus').textContent='Could not save your set. Please try again.';}
    }
})();
