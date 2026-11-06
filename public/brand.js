(function(){
const flower=(x,y,r,c)=>{let p='';for(let i=0;i<5;i++){const a=i*72*Math.PI/180;p+=`<circle cx="${(Math.sin(a)*r).toFixed(1)}" cy="${(-Math.cos(a)*r).toFixed(1)}" r="${r*.75}" fill="${c}"/>`}
  return `<g transform="translate(${x} ${y})">${p}<circle r="${r*.6}" fill="#FFD76A"/></g>`};
const cloud=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="var(--cloud)"><ellipse cx="0" cy="0" rx="34" ry="11"/><circle cx="-14" cy="-9" r="13"/><circle cx="6" cy="-14" r="16"/><circle cx="22" cy="-6" r="11"/></g>`;
const cols=['#F78FB3','#FFB07A','#FFE08A','#9EE0B0','#8FCBEF','#B9A6F0'];
let arcs='';cols.forEach((c,i)=>{const r=64-i*5;arcs+=`<path d="M${320-r} 98 A${r} ${r} 0 0 1 ${320+r} 98" fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round"/>`});
const head=`<svg viewBox="0 0 640 122" role="img" aria-label="Clouds, flowers and a little rainbow" style="width:100%;height:auto;display:block">
${arcs}${cloud(262,98,1)}${cloud(380,100,1.1)}${cloud(70,60,.9)}${cloud(575,44,.8)}${cloud(150,100,.7)}
${flower(28,104,9,'#F4A6C3')}${flower(52,112,6,'#8FCBEF')}${flower(612,104,9,'#F4A6C3')}${flower(590,113,6,'#B9A6F0')}
${flower(205,110,6,'#8FCBEF')}${flower(448,111,6,'#F4A6C3')}${flower(120,28,5,'#F4A6C3')}${flower(520,24,5,'#8FCBEF')}</svg>
<h1 class="brand-name"><span class="b">Blue</span> <span class="a">and</span> <span class="p">Pink</span></h1>`;
const b=document.getElementById('brand');if(b)b.innerHTML=head;
let f='';[['#F4A6C3',24],['#8FCBEF',72],['#B9A6F0',120],['#F4A6C3',168],['#8FCBEF',216],['#B9A6F0',264],['#F4A6C3',312],['#8FCBEF',360],['#B9A6F0',408],['#F4A6C3',456],['#8FCBEF',504],['#F4A6C3',552],['#B9A6F0',600]].forEach(([c,x],i)=>f+=flower(x,18+(i%2)*6,6+(i%3),c));
const ft=document.getElementById('foot');if(ft)ft.innerHTML=`<svg viewBox="0 0 640 40" aria-hidden="true" style="width:100%;height:auto;display:block">${f}</svg>`;
})();
