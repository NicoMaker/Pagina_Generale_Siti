const $=id=>document.getElementById(id);
let rgb=[42,125,225];
const cl=(v,a,b)=>Math.min(b,Math.max(a,Math.round(+v)||0));
const hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');
function toHsl([r,g,b]){r/=255;g/=255;b/=255;const m=Math.max(r,g,b),n=Math.min(r,g,b),d=m-n;let h=0,s=0,l=(m+n)/2;
if(d){s=d/(1-Math.abs(2*l-1));h=m==r?((g-b)/d)%6:m==g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360}
return[Math.round(h),Math.round(s*100),Math.round(l*100)]}
function fromHsl(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
return[f(0),f(8),f(4)].map(v=>Math.round(v*255))}
const lum=c=>{const [r,g,b]=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2)};
function render(skip){
const H=hex(rgb),[h,s,l]=toHsl(rgb);
$('sw').style.background=H;$('sw').style.color=lum(rgb)>.4?'#000':'#fff';$('sw').textContent=H.toUpperCase();
if(skip!='hex')$('hex').value=H;
$('pk').value=H;
if(skip!='rgb'){$('r').value=rgb[0];$('g').value=rgb[1];$('b').value=rgb[2]}
if(skip!='hsl'){$('h').value=h;$('s').value=s;$('l').value=l}
$('oh').textContent=H.toUpperCase();
$('or').textContent=`rgb(${rgb.join(', ')})`;
$('ol').textContent=`hsl(${h}, ${s}%, ${l}%)`;
$('cw').style.background=H;$('cw').style.color='#fff';
$('cb').style.background=H;$('cb').style.color='#000';
$('cw').textContent='Bianco';$('cb').textContent='Nero';$('cb').style.removeProperty('background');
$('cb').style.background=H;
$('rw').textContent=ratio(rgb,[255,255,255])+':1';
$('rb').textContent=ratio(rgb,[0,0,0])+':1';
}
$('hex').addEventListener('input',e=>{let v=e.target.value.trim();if(!v.startsWith('#'))v='#'+v;
if(/^#[0-9a-f]{6}$/i.test(v)){rgb=[1,3,5].map(i=>parseInt(v.substr(i,2),16));render('hex')}
else if(/^#[0-9a-f]{3}$/i.test(v)){rgb=[1,2,3].map(i=>parseInt(v[i]+v[i],16));render('hex')}});
$('pk').addEventListener('input',e=>{const v=e.target.value;rgb=[1,3,5].map(i=>parseInt(v.substr(i,2),16));render()});
['r','g','b'].forEach((k,i)=>$(k).addEventListener('input',e=>{rgb[i]=cl(e.target.value,0,255);render('rgb')}));
['h','s','l'].forEach(k=>$(k).addEventListener('input',()=>{rgb=fromHsl(cl($('h').value,0,360),cl($('s').value,0,100),cl($('l').value,0,100));render('hsl')}));
document.querySelectorAll('button[data-c]').forEach(b=>b.addEventListener('click',()=>{
const t=$(b.dataset.c).textContent;
try{navigator.clipboard.writeText(t).then(()=>{b.textContent='Copiato';setTimeout(()=>b.textContent='Copia',1200)})}catch(e){}
}));
render();