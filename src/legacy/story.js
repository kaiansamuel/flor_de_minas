/* Flor de Minas — a continuous, procedural Three.js bagel story.
   Everything, including Three.js, is embedded. No network requests or media playback.
   Scroll drives lift, four physical flavors, the plain bagel's cut, then schmear.
   Referência visual do snapshot original. */
(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const dialog=$('#order-dialog');
$$('[data-order]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));
dialog.querySelector('.close').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('#visit-button').onclick=()=>{dialog.close();$('#collection').scrollIntoView({behavior:'smooth'});};
const story=$('#story'),stage=$('#stage'),wash=$('#wash'),heroPhoto=$('#hero-photo'),header=$('#header'),chapters=$$('.chapter'),dots=$$('[data-step]');
function showStaticHero(){stage.classList.add('webgl-fallback');$('#loading').classList.add('done');$('#error').style.display='none';}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try {renderer=new THREE.WebGLRenderer({canvas:$('#webgl'),antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});}
catch(e){showStaticHero();console.error(e);return;}
window.__florMinasRenderer=renderer;
renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#f8f7f4');
window.__florMinasScenes=[scene];
window.__florMinasTargets=[];window.__florMinasTextures=new Set();
window.__florMinasTextureLoaderLoad=THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load=function(...args){const texture=window.__florMinasTextureLoaderLoad.apply(this,args);window.__florMinasTextures.add(texture);return texture;};
const camera=new THREE.PerspectiveCamera(37,1,.05,100);
const ambient=new THREE.HemisphereLight(0xfff3dc,0x645445,1.7);scene.add(ambient);
const key=new THREE.DirectionalLight(0xffe2b7,3.5);key.position.set(-3,5,3);key.castShadow=true;
key.shadow.mapSize.set(innerWidth>900?4096:2048,innerWidth>900?4096:2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:20});key.shadow.normalBias=.0015;key.shadow.bias=-.000015;key.shadow.radius=3;scene.add(key);
const fill=new THREE.DirectionalLight(0xf8fbff,1);fill.position.set(3,2,-1);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffd4a0,2);rim.position.set(0,3,-4);scene.add(rim);
const envScene=new THREE.Scene();envScene.background=new THREE.Color('#665d52');window.__florMinasScenes.push(envScene);
function envPanel(w,h,x,y,z,power){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(power,power*.94,power*.85),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);envScene.add(m);}
envPanel(7,5,-5,5,4,5);envPanel(3,6,5,2,-2,2);envPanel(8,5,0,7,-4,3);
const pmrem=new THREE.PMREMGenerator(renderer),environmentTarget=pmrem.fromScene(envScene,.02);scene.environment=environmentTarget.texture;window.__florMinasTargets.push(environmentTarget);pmrem.dispose();
let seed=48071;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const TAU=Math.PI*2;
function field(size){const a=new Float32Array(size*size);for(let i=0;i<a.length;i++)a[i]=random();return (x,y)=>{x=((x%size)+size)%size;y=((y%size)+size)%size;const ix=x|0,iy=y|0;let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return mix(mix(a[iy*size+ix],a[iy*size+(ix+1)%size],fx),mix(a[((iy+1)%size)*size+ix],a[((iy+1)%size)*size+(ix+1)%size],fx),fy);};}
const noise=field(256);
function canvasTexture(c,srgb=true){const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
function crustTextures(){
 const w=2048,h=1024,c=document.createElement('canvas'),b=document.createElement('canvas'),r=document.createElement('canvas');
 for(const t of [c,b,r]){t.width=w;t.height=h;}
 const ctx=c.getContext('2d'),bx=b.getContext('2d'),rx=r.getContext('2d'),im=ctx.createImageData(w,h),bi=bx.createImageData(w,h),ri=rx.createImageData(w,h);
 for(let y=0;y<h;y++){const v=y/h*TAU;
  for(let x=0;x<w;x++){const u=x/w,n=noise(u*40,y/h*20),n2=noise(u*180,y/h*80),fine=noise(u*740,y/h*370),grain=random();
   const top=Math.max(0,Math.sin(v));const bake=clamp(.19+top*.52+n*.19+(n2-.5)*.09+Math.cos(v)*.12);
   const pale=[217,166,95],gold=[143,65,19],dark=[73,27,10];const blend=smooth(.42,.98,bake);
   let col=pale.map((z,i)=>mix(z,gold[i],smooth(.10,.65,bake)));col=col.map((z,i)=>mix(z,dark[i],blend*.45));
   const fleck=smooth(.68,.83,fine)*11;const detail=(fine-.5)*10+(grain-.5)*5;const i=(y*w+x)*4;
   for(let k=0;k<3;k++)im.data[i+k]=clamp(col[k]+detail-fleck,0,255);im.data[i+3]=255;
   const bump=117+n2*17+fine*36+grain*16;bi.data[i]=bi.data[i+1]=bi.data[i+2]=bump;bi.data[i+3]=255;
   const rough=134+n2*28+fine*20;ri.data[i]=ri.data[i+1]=ri.data[i+2]=rough;ri.data[i+3]=255;
  }
 }
 ctx.putImageData(im,0,0);bx.putImageData(bi,0,0);rx.putImageData(ri,0,0);
 // Baked blisters: a caramel rim, a translucent center and a raised skin.
 for(let i=0;i<12500;i++){const x=random()*w,y=random()*h,rad=.6+Math.pow(random(),3)*5.8,angle=random()*TAU,ratio=.35+random()*.6;
  for(const [target,isHeight] of [[ctx,false],[bx,true]]){target.save();target.translate(x,y);target.rotate(angle);target.scale(1,ratio);const g=target.createRadialGradient(0,0,0,0,0,rad);
   if(isHeight){g.addColorStop(0,'rgba(213,213,213,.8)');g.addColorStop(.5,'rgba(195,195,195,.55)');g.addColorStop(.79,'rgba(89,89,89,.58)');g.addColorStop(1,'rgba(130,130,130,0)');}
   else{g.addColorStop(0,'rgba(244,164,70,.15)');g.addColorStop(.6,'rgba(133,58,14,.05)');g.addColorStop(.85,'rgba(56,22,7,.22)');g.addColorStop(1,'rgba(77,33,13,0)');}
   target.fillStyle=g;target.beginPath();target.arc(0,0,rad,0,TAU);target.fill();target.restore();
  }
 }
 return {map:canvasTexture(c),bumpMap:canvasTexture(b,false),roughnessMap:canvasTexture(r,false)};
}
const crust=crustTextures();
const breadMaterial=new THREE.MeshPhysicalMaterial({map:crust.map,bumpMap:crust.bumpMap,bumpScale:0,roughness:.59,metalness:0,clearcoat:.10,clearcoatRoughness:.48,envMapIntensity:.43});
let photoReady=false;
const photoCrust=new THREE.TextureLoader().load('/assets/hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/782091e7-f78a-4924-bee3-aa4baeac97e2_original.png',()=>{photoReady=true;dirty=true;thumbsMade=false;},undefined,()=>{photoReady=true;dirty=true;});photoCrust.colorSpace=THREE.SRGBColorSpace;photoCrust.wrapS=photoCrust.wrapT=THREE.MirroredRepeatWrapping;photoCrust.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
breadMaterial.onBeforeCompile=shader=>{
 shader.uniforms.photoCrust={value:photoCrust};
 shader.vertexShader='varying vec3 vBreadPosition;varying vec3 vBreadNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBreadPosition=position;vBreadNormal=normal;');
 shader.fragmentShader=`uniform sampler2D photoCrust;varying vec3 vBreadPosition;varying vec3 vBreadNormal;
 vec3 crustAt(vec3 p,vec3 n){vec3 w=pow(abs(n),vec3(5.));w/=max(w.x+w.y+w.z,.00001);return texture2D(photoCrust,p.yz*1.35).rgb*w.x+texture2D(photoCrust,p.xz*1.35).rgb*w.y+texture2D(photoCrust,p.xy*1.35).rgb*w.z;}
 `+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 vec3 crustPhoto=crustAt(vBreadPosition,normalize(vBreadNormal));
 float bake=smoothstep(-.34,.26,vBreadPosition.y);
 diffuseColor.rgb=crustPhoto*mix(vec3(.91,.83,.72),vec3(.63,.60,.56),bake);
 `);
 shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 float photoHeight=dot(crustPhoto,vec3(.2126,.7152,.0722));
 normal=perturbNormalArb(-vViewPosition,normal,vec2(dFdx(photoHeight),dFdy(photoHeight))*.008,faceDirection);
 `);
 shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.46,.67,smoothstep(.07,.50,dot(crustPhoto,vec3(.2126,.7152,.0722))));');
};
breadMaterial.customProgramCacheKey=()=> 'flor-minas-continuous-photo-crust-3';
function surface(u,v){
 const major=.93+.025*Math.sin(3*u+.4)+.011*Math.cos(7*u);
 const tube=.545*(1+.045*Math.sin(5*u)+.02*Math.cos(9*u+.8));
 const wrinkle=.0017*Math.sin(u*87+Math.sin(v*19))*Math.sin(v)**2+.002*Math.sin(u*39+v*15);
 const hand=.007*Math.sin(u*17+v*4)+.0035*Math.sin(u*41-v*9);
 const radius=major+(tube+wrinkle+hand)*Math.cos(v);
 let y=.449*Math.sin(v)*(1+.043*Math.sin(u*4+.7))+.007*Math.sin(u*8)*Math.sin(v)**2;
 if(y<-.285)y=-.285+(y+.285)*.35;
 return new THREE.Vector3(radius*Math.cos(u),y,radius*Math.sin(u));
}
function breadGeometry(start,end){const nu=384,nv=Math.round(96*(end-start)/Math.PI),positions=[],normals=[],uv=[],indices=[];
 for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const u=i/nu*TAU,v=mix(start,end,j/nv),p=surface(u,v),du=surface(u+.0005,v).sub(surface(u-.0005,v)),dv=surface(u,v+.0005).sub(surface(u,v-.0005)),n=dv.cross(du).normalize();positions.push(p.x,p.y,p.z);normals.push(n.x,n.y,n.z);uv.push(i/nu,1-v/TAU);}
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=(i+1)*(nv+1)+j;indices.push(a,a+1,b,a+1,b+1,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.userData.cutStart=positions.length/3;return g;
}
function crumbTextures(){
 const size=1536,c=document.createElement('canvas'),b=document.createElement('canvas');c.width=c.height=b.width=b.height=size;
 const ctx=c.getContext('2d'),bx=b.getContext('2d'),im=ctx.createImageData(size,size),bi=bx.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const d=Math.hypot(x-size/2,y-size/2)/(size/2),edge=smooth(.84,.97,d),inside=1-smooth(.21,.285,d),n=noise(x*.043,y*.043),fine=noise(x*.33,y*.33),fiber=Math.sin(x*.6+noise(x*.022,y*.019)*14+y*.19)*1.8;
  const i=(y*size+x)*4,shade=(n-.5)*14+(fine-.5)*13+(random()-.5)*8+fiber;
  im.data[i]=225+shade-edge*62-inside*38;im.data[i+1]=208+shade-edge*92-inside*58;im.data[i+2]=169+shade-edge*94-inside*66;im.data[i+3]=255;
  const h=180+(n-.5)*14+(fine-.5)*33+fiber*2;bi.data[i]=bi.data[i+1]=bi.data[i+2]=h;bi.data[i+3]=255;
 }
 ctx.putImageData(im,0,0);bx.putImageData(bi,0,0);
 // Torn cell walls and recessed pores give the cut face a fine, tight bread crumb.
 for(let i=0;i<7900;i++){
  const x=random()*size,y=random()*size,r=1.2+Math.pow(random(),4)*11+(random()<.025?random()*13:0),angle=random()*TAU,ratio=.43+random()*.55;
  const edge=[];for(let k=0;k<12;k++)edge.push(.81+random()*.35);
  for(const [target,heightMap] of [[ctx,false],[bx,true]]){
   target.save();target.translate(x,y);target.rotate(angle);target.scale(1,ratio);target.beginPath();
   for(let k=0;k<12;k++){const a=k/12*TAU,px=Math.cos(a)*r*edge[k],py=Math.sin(a)*r*edge[k];if(k===0)target.moveTo(px,py);else target.lineTo(px,py);}target.closePath();
   const g=target.createRadialGradient(-r*.16,-r*.14,.1,0,0,r*1.1);
   if(heightMap){g.addColorStop(0,'#272727');g.addColorStop(.58,'#444');g.addColorStop(.8,'#929292');g.addColorStop(.91,'#d3d3d3');g.addColorStop(1,'#b4b4b4');}
   else{g.addColorStop(0,'rgba(93,74,49,.67)');g.addColorStop(.53,'rgba(118,99,70,.53)');g.addColorStop(.76,'rgba(177,154,112,.35)');g.addColorStop(.94,'rgba(250,229,179,.58)');g.addColorStop(1,'rgba(225,208,169,0)');}
   target.fillStyle=g;target.fill();target.restore();
  }
 }
 return {map:canvasTexture(c),bumpMap:canvasTexture(b,false)};
}
const crumbMaps=crumbTextures();const crumbMaterial=new THREE.MeshStandardMaterial({...crumbMaps,bumpScale:.038,roughness:.93,envMapIntensity:.21});
let crumbReady=false,cutHeight=null,cutDark=0,cutLight=1;
const crumbPhoto=new THREE.TextureLoader().load('/assets/hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a695a70b-9a14-472e-b707-f7d302f95179_original.png',texture=>{
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(12,renderer.capabilities.getMaxAnisotropy());
 const height=texture.clone();height.colorSpace=THREE.NoColorSpace;height.needsUpdate=true;crumbMaterial.bumpMap=height;
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.drawImage(texture.image,0,0,512,512);const pixels=ctx.getImageData(0,0,512,512).data;cutHeight=new Float32Array(512*512);
 for(let i=0;i<cutHeight.length;i++)cutHeight[i]=(pixels[i*4]*.2126+pixels[i*4+1]*.7152+pixels[i*4+2]*.0722)/255;
 const sorted=Float32Array.from(cutHeight).sort();cutDark=sorted[Math.floor(sorted.length*.025)];cutLight=sorted[Math.floor(sorted.length*.47)];
 refreshCutSurface(upper,-1);refreshCutSurface(lower,1);crumbReady=true;crumbMaterial.needsUpdate=true;dirty=true;thumbsMade=false;
},undefined,()=>{crumbReady=true;dirty=true;});
crumbMaterial.onBeforeCompile=shader=>{
 shader.uniforms.cutPhoto={value:crumbPhoto};shader.vertexShader='attribute float cutMargin;varying float vCutMargin;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCutMargin=cutMargin;');
 shader.fragmentShader='uniform sampler2D cutPhoto;varying float vCutMargin;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 vec3 crumbColor=texture2D(cutPhoto,vMapUv).rgb*vec3(.94,.92,.89);
 diffuseColor.rgb=mix(diffuseColor.rgb,crumbColor,smoothstep(.006,.048,vCutMargin)*.97);
 `);
};
crumbMaterial.customProgramCacheKey=()=> 'flor-minas-cut-crumb-photo-1';
function capGeometry(facing){const n=384,rings=72,positions=[],uv=[],margin=[],indices=[];
 // Match every crust boundary vertex exactly. The cut face is part of the solid half.
 for(let i=0;i<=n;i++){const u=i/n*TAU,inner=surface(u,Math.PI),outer=surface(u,0);for(let j=0;j<=rings;j++){const q=j/rings,x=mix(inner.x,outer.x,q),z=mix(inner.z,outer.z,q);positions.push(x,-facing*(.002+noise(x*24,z*24)*.004)*Math.sin(Math.PI*q),z);uv.push(x/3.15+.5,.5-z/3.15);margin.push(Math.min(q,1-q)*inner.distanceTo(outer));}}
 for(let i=0;i<n;i++)for(let j=0;j<rings;j++){const a=i*(rings+1)+j,b=a+rings+1;if(facing>0)indices.push(a,b,a+1,b,b+1,a+1);else indices.push(a,a+1,b,b,a+1,b+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('cutMargin',new THREE.Float32BufferAttribute(margin,1));g.setIndex(indices);g.computeVertexNormals();return g;
}
function halfGeometry(start,end,facing){
 const skin=breadGeometry(start,end),cut=capGeometry(facing),g=new THREE.BufferGeometry();
 for(const name of ['position','normal','uv']){const a=skin.attributes[name],b=cut.attributes[name],array=new Float32Array(a.array.length+b.array.length);array.set(a.array);array.set(b.array,a.array.length);g.setAttribute(name,new THREE.BufferAttribute(array,a.itemSize));}
 const offset=skin.attributes.position.count,idx=[...skin.index.array,...Array.from(cut.index.array,i=>i+offset)];g.setIndex(idx);g.addGroup(0,skin.index.count,0);g.addGroup(skin.index.count,cut.index.count,1);
 const margins=new Float32Array(offset+cut.attributes.position.count);margins.set(cut.attributes.cutMargin.array,offset);g.setAttribute('cutMargin',new THREE.BufferAttribute(margins,1));g.userData.cutStart=offset;skin.dispose();cut.dispose();g.computeBoundingSphere();return g;
}
function refreshCutSurface(mesh,facing){
 const g=mesh.geometry,p=g.attributes.position,uv=g.attributes.uv,m=g.attributes.cutMargin;
 const heightAt=(u,v)=>{const x=clamp(u)*511,y=(1-clamp(v))*511,ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;return mix(mix(cutHeight[iy*512+ix],cutHeight[iy*512+Math.min(511,ix+1)],fx),mix(cutHeight[Math.min(511,iy+1)*512+ix],cutHeight[Math.min(511,iy+1)*512+Math.min(511,ix+1)],fx),fy);};
 for(let i=g.userData.cutStart;i<p.count;i++){const lum=heightAt(uv.getX(i),uv.getY(i)),pore=smooth(cutLight,cutDark,lum),edge=smooth(0,.035,m.getX(i));p.setY(i,-facing*(pore*.028+(1-lum)*.005)*edge);}
 const skinNormals=g.attributes.normal.array.slice(0,g.userData.cutStart*3);p.needsUpdate=true;g.computeVertexNormals();g.attributes.normal.array.set(skinNormals);g.attributes.normal.needsUpdate=true;g.computeBoundingSphere();
}
const bagel=new THREE.Group(),top=new THREE.Group(),bottom=new THREE.Group();bagel.add(top,bottom);scene.add(bagel);
const upper=new THREE.Mesh(halfGeometry(0,Math.PI,-1),[breadMaterial,crumbMaterial]),lower=new THREE.Mesh(halfGeometry(Math.PI,TAU,1),[breadMaterial,crumbMaterial]);top.add(upper);bottom.add(lower);upper.castShadow=lower.castShadow=true;upper.receiveShadow=lower.receiveShadow=true;
// A genuinely continuous outer skin remains visible until the sliced halves move.
// Both representations use exactly the same surface and analytic crust normals.
const intactGeometry=breadGeometry(0,TAU),intact=new THREE.Mesh(intactGeometry,breadMaterial);intact.castShadow=intact.receiveShadow=true;bagel.add(intact);
function sesameTextures(){
 const c=document.createElement('canvas'),b=document.createElement('canvas');c.width=b.width=128;c.height=b.height=256;const cx=c.getContext('2d'),bx=b.getContext('2d'),im=cx.createImageData(128,256),bi=bx.createImageData(128,256);
 for(let y=0;y<256;y++)for(let x=0;x<128;x++){const u=x/128,v=y/256,tip=Math.pow(Math.abs(v-.5)*2,6),ridge=Math.pow(Math.abs(Math.cos(u*TAU)),20),grain=noise(u*80+Math.sin(v*24)*.3,v*32),n=(grain-.5)*12+(random()-.5)*4,vein=ridge*(.35+.65*Math.sin(v*Math.PI));const i=(y*128+x)*4;
 im.data[i]=218+n-tip*29-vein*7;im.data[i+1]=192+n-tip*41-vein*9;im.data[i+2]=142+n-tip*43-vein*11;im.data[i+3]=255;const h=155+(grain-.5)*45-vein*16;bi.data[i]=bi.data[i+1]=bi.data[i+2]=h;bi.data[i+3]=255;}
 cx.putImageData(im,0,0);bx.putImageData(bi,0,0);return {map:canvasTexture(c),bumpMap:canvasTexture(b,false)};
}
function sesameGeometry(broken=false){
 const p=[],uv=[],idx=[],around=16,length=14,lo=broken?Math.PI*.43:0;
 for(let j=0;j<=length;j++){const t=mix(lo,Math.PI,j/length),z=Math.cos(t),s=Math.sin(t),taper=.83-.23*z;
  for(let i=0;i<=around;i++){const a=i/around*TAU,x=s*Math.cos(a)*taper;let y=s*Math.sin(a)*(.83+.07*z);if(y<0)y*=.68;else y-=.045*Math.exp(-x*x*40)*s*Math.max(0,Math.sin(a));p.push(x+.035*s*s,y,z);uv.push(i/around,t/Math.PI);}}
 for(let j=0;j<length;j++)for(let i=0;i<around;i++){const a=j*(around+1)+i,b=a+around+1;idx.push(a,b,a+1,b,b+1,a+1);}
 if(broken){const center=p.length/3;p.push(.02,0,Math.cos(lo));uv.push(.5,lo/Math.PI);for(let i=0;i<around;i++)idx.push(center,i,i+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
const sesameGeo=sesameGeometry(),sesameFragmentGeo=sesameGeometry(true);
const sesameMaterial=new THREE.MeshPhysicalMaterial({...sesameTextures(),roughness:.58,bumpScale:.0007,clearcoat:.09,clearcoatRoughness:.4,envMapIntensity:.28});
function seeds(count,kind,parent=top){let geo,mat;
 if(kind==='salt'){geo=new THREE.DodecahedronGeometry(1,0);mat=new THREE.MeshPhysicalMaterial({color:0xf6f2e1,roughness:.34,transmission:.08,thickness:.2});}
 else if(kind==='sesame'){geo=sesameGeo;mat=sesameMaterial;}
 else{geo=new THREE.SphereGeometry(1,kind==='poppy'?6:10,kind==='poppy'?5:7);mat=new THREE.MeshStandardMaterial({color:kind==='poppy'?0x25201a:kind==='pumpkin'?0x807446:0xc7a772,roughness:kind==='poppy'?.56:.7});}
 const mesh=new THREE.InstancedMesh(geo,mat,count),dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);const color=new THREE.Color(),placed=[];
 for(let i=0;i<count;i++){let u,v,p;for(let attempt=0;attempt<16;attempt++){u=random()*TAU;v=.29+random()*2.5;p=surface(u,v);if(kind!=='sesame'||!placed.some(q=>q.distanceToSquared(p)<.00095))break;}if(kind==='sesame')placed.push(p.clone());const a=surface(u+.001,v).sub(p),b=surface(u,v+.001).sub(p),normal=b.cross(a).normalize();dummy.position.copy(p).addScaledVector(normal,kind==='salt'?.006:.003);dummy.quaternion.setFromUnitVectors(up,normal);dummy.rotateY(random()*TAU);const s=.82+random()*.36;
  if(kind==='sesame')dummy.scale.set(.0145*s,.0055*s,.028*s*(.88+random()*.24));else if(kind==='pumpkin')dummy.scale.set(.028*s,.011*s,.058*s);else if(kind==='salt')dummy.scale.set(.009*s,.007*s,.01*s);else dummy.scale.setScalar(.0065*s);
  dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);const value=.73+random()*.3;color.setRGB(value,value*(.94+random()*.06),value*(.88+random()*.12));mesh.setColorAt(i,color);
 }
 mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
const sesame=seeds(1360,'sesame'),poppy=seeds(0,'poppy'),pumpkin=seeds(0,'pumpkin'),salt=seeds(0,'salt');
// Four independent bagels share the bread geometry and its photographed crust.
// The final plain bagel is the same solid object that opens and receives the cream.
function wholeBagel(){
 const group=new THREE.Group(),crown=new THREE.Mesh(upper.geometry,[breadMaterial,crumbMaterial]),base=new THREE.Mesh(lower.geometry,[breadMaterial,crumbMaterial]);
 crown.visible=base.visible=false;const body=new THREE.Mesh(intactGeometry,breadMaterial);body.castShadow=body.receiveShadow=true;group.add(crown,base,body);scene.add(group);return group;
}
const sesameBagel=wholeBagel(),poppyBagel=wholeBagel(),cinnamonBagel=wholeBagel();sesameBagel.add(sesame,poppy,salt);
const cinnamonUpper=cinnamonBagel.children[0],cinnamonLower=cinnamonBagel.children[1];
const cinnamonWhole=cinnamonBagel.children[2];cinnamonWhole.geometry=cinnamonWhole.geometry.clone();
function poppyGeometry(){
 const g=new THREE.SphereGeometry(1,8,6),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),wrinkle=1+.065*Math.sin(a*5+y*9);p.setXYZ(i,x*wrinkle+.17*(1-y*y),y*.73,z*wrinkle*(.87+.10*y));}
 g.computeVertexNormals();return g;
}
const poppyMaterial=new THREE.MeshPhysicalMaterial({color:0x373742,roughness:.72,bumpMap:sesameMaterial.bumpMap,bumpScale:.001,clearcoat:.045,clearcoatRoughness:.65,envMapIntensity:.25});
const poppyCoat=new THREE.InstancedMesh(poppyGeometry(),poppyMaterial,8800);
{
 const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),color=new THREE.Color();
 for(let i=0;i<poppyCoat.count;i++){
  const u=random()*TAU,v=.17+random()*2.78,p=surface(u,v),normal=surface(u,v+.001).sub(p).cross(surface(u+.001,v).sub(p)).normalize(),s=.75+random()*.50;
  dummy.position.copy(p).addScaledVector(normal,.004);dummy.quaternion.setFromUnitVectors(up,normal);dummy.rotateY(random()*TAU);dummy.scale.set(.0105*s,.008*s,.012*s);dummy.updateMatrix();poppyCoat.setMatrixAt(i,dummy.matrix);
  const tint=.45+random()*.64;color.setRGB(tint*.90,tint*.94,tint);poppyCoat.setColorAt(i,color);
 }
}
poppyCoat.castShadow=poppyCoat.receiveShadow=true;poppyBagel.add(poppyCoat);
// The dedicated photographed material carries buried raisins and stretched cinnamon folds.
// Only this flavor is sculpted; its two cut rims retain their exact shared coordinates.
cinnamonUpper.geometry=cinnamonUpper.geometry.clone();cinnamonLower.geometry=cinnamonLower.geometry.clone();
let cinnamonReady=false;
const cinnamonMaterial=new THREE.MeshPhysicalMaterial({color:0xd4c7b2,roughness:.94,bumpScale:.028,clearcoat:.10,clearcoatRoughness:.45,envMapIntensity:.32});
const cinnamonPhoto=new THREE.TextureLoader().load('/assets/hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5a0aef86-c6e5-420e-b9de-f907f3f0cc3b_original.png',texture=>{
 texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,1);texture.anisotropy=Math.min(12,renderer.capabilities.getMaxAnisotropy());
 const height=texture.clone();height.colorSpace=THREE.NoColorSpace;height.needsUpdate=true;
 cinnamonMaterial.map=texture;cinnamonMaterial.bumpMap=height;
 const c=document.createElement('canvas');c.width=c.height=512;const cx=c.getContext('2d');cx.drawImage(texture.image,0,0,512,512);const pixels=cx.getImageData(0,0,512,512),rough=cx.createImageData(512,512);
 for(let i=0;i<512*512;i++){const r=pixels.data[i*4]/255,g=pixels.data[i*4+1]/255,b=pixels.data[i*4+2]/255,lum=r*.2126+g*.7152+b*.0722,raisin=1-smooth(.08,.27,lum),v=mix(191,118,raisin);rough.data[i*4]=rough.data[i*4+1]=rough.data[i*4+2]=v;rough.data[i*4+3]=255;}
 sculptCinnamon(cinnamonUpper,pixels.data,true);sculptCinnamon(cinnamonLower,pixels.data,false);
 sculptCinnamon(cinnamonWhole,pixels.data,null);
 cx.putImageData(rough,0,0);const roughness=canvasTexture(c,false);roughness.wrapS=roughness.wrapT=THREE.RepeatWrapping;roughness.repeat.set(2,1);cinnamonMaterial.roughnessMap=roughness;
 cinnamonMaterial.needsUpdate=true;cinnamonReady=true;dirty=true;thumbsMade=false;
},undefined,()=>{cinnamonMaterial.map=photoCrust;cinnamonMaterial.bumpMap=crust.bumpMap;cinnamonMaterial.needsUpdate=true;cinnamonReady=true;dirty=true;});
function sculptCinnamon(mesh,pixels,isTop){
 const g=mesh.geometry,p=g.attributes.position,uv=g.attributes.uv;
 const channel=(x,y,k)=>pixels[((y+512)%512*512+(x+512)%512)*4+k]/255;
 for(let i=0;i<g.userData.cutStart;i++){
  const u=uv.getX(i)*TAU,v=(1-uv.getY(i))*TAU,x=((uv.getX(i)*2)%1)*512,y=((1-uv.getY(i))%1)*512,ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const sample=k=>mix(mix(channel(ix,iy,k),channel(ix+1,iy,k),fx),mix(channel(ix,iy+1,k),channel(ix+1,iy+1,k),fx),fy);
  const r=sample(0),green=sample(1),b=sample(2),lum=r*.2126+green*.7152+b*.0722,raisin=1-smooth(.09,.25,lum),pale=smooth(.42,.72,lum);
  const edge=Math.sin(v)**2,fold=.016*Math.sin(u*5+v*2)+.008*Math.sin(u*11-v*3),depth=(fold-raisin*.035-pale*.012)*edge;
  const original=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)),normal=new THREE.Vector3(Math.cos(v)*Math.cos(u),Math.sin(v)*1.2,Math.cos(v)*Math.sin(u)).normalize();
  const crown=isTop===null?Math.sin(v)>=0:isTop;p.setXYZ(i,original.x+normal.x*depth,original.y+(crown?Math.min(0,normal.y*depth+Math.sin(u*5+.6)*.013*edge):Math.max(0,normal.y*depth)),original.z+normal.z*depth);
 }
 p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();g.computeBoundingBox();
}
cinnamonUpper.material=[cinnamonMaterial,crumbMaterial];cinnamonLower.material=[cinnamonMaterial,crumbMaterial];
cinnamonWhole.material=cinnamonMaterial;
// Plain bread contains only its crust and crumb; all fruit belongs to the third flavor.
const flavorBagels=[sesameBagel,poppyBagel,cinnamonBagel,bagel];
// A soft contact shadow gives the suspended object a physical place in the scene.
function shadowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,63);g.addColorStop(0,'rgba(22,12,4,.42)');g.addColorStop(.45,'rgba(22,12,4,.19)');g.addColorStop(1,'rgba(22,12,4,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return canvasTexture(c);}
const shadow=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshBasicMaterial({map:shadowTexture(),transparent:true,depthWrite:false,opacity:.7}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.445;scene.add(shadow);
function woodTexture(){const c=document.createElement('canvas');c.width=1536;c.height=1024;const x=c.getContext('2d'),im=x.createImageData(c.width,c.height);
 for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){const yn=y/c.height,xn=xx/c.width;const broad=noise(xn*3,yn*6),warp=noise(xn*4,yn*18)*5+noise(xn*17,yn*34)*1.4;
 const flow=yn*800+warp*7+Math.sin(xn*5)*8;const grain=Math.pow(Math.abs(Math.sin(flow)),13)*18+Math.pow(Math.abs(Math.sin(flow*2.7)),24)*10;
 const long=noise(xn*20,yn*220)*9;const small=random()*4;const joint=(y%256)<2?14:0;const shade=broad*24-grain+long+small-joint;const i=(y*c.width+xx)*4;
 im.data[i]=109+shade;im.data[i+1]=64+shade*.73;im.data[i+2]=33+shade*.49;im.data[i+3]=255;}
 x.putImageData(im,0,0);return canvasTexture(c);
}
const wood=woodTexture();wood.wrapS=wood.wrapT=THREE.RepeatWrapping;
const woodMat=new THREE.MeshPhysicalMaterial({map:wood,bumpMap:wood,bumpScale:.018,roughness:.64,color:0xc2ad8e,clearcoat:.07,clearcoatRoughness:.48,envMapIntensity:.27});
let woodReady=false;
const woodPhoto=new THREE.TextureLoader().load('/assets/hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/55cc5cbf-5b54-4024-b665-38b87bdbb35d_original.png',texture=>{
 texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.MirroredRepeatWrapping;texture.anisotropy=Math.min(12,renderer.capabilities.getMaxAnisotropy());
 const height=texture.clone();height.colorSpace=THREE.NoColorSpace;height.needsUpdate=true;woodMat.map=texture;woodMat.bumpMap=height;woodMat.needsUpdate=true;woodReady=true;dirty=true;thumbsMade=false;
},undefined,()=>{woodReady=true;dirty=true;});
function boardShape(w,h,r){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
 s.lineTo(-w/2,.74);s.quadraticCurveTo(-w/2,.53,-w/2-.20,.53);s.lineTo(-4.01,.53);s.quadraticCurveTo(-4.19,.53,-4.19,.34);s.lineTo(-4.19,-.34);s.quadraticCurveTo(-4.19,-.53,-4.01,-.53);s.lineTo(-w/2-.20,-.53);s.quadraticCurveTo(-w/2,-.53,-w/2,-.74);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
 const hole=new THREE.Path();hole.absarc(-3.86,0,.13,0,TAU,true);s.holes.push(hole);return s;}
const boardGeo=new THREE.ExtrudeGeometry(boardShape(6.8,3.7,.3),{depth:.16,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:5,steps:1,curveSegments:24});boardGeo.rotateX(-Math.PI/2);
// Top and edge grain are projected in their own planes, avoiding stretched vertical bands.
{const ps=boardGeo.attributes.position,ns=boardGeo.attributes.normal,uv=boardGeo.attributes.uv;for(let i=0;i<ps.count;i++){
 const x=ps.getX(i),y=ps.getY(i),z=ps.getZ(i);
 if(Math.abs(ns.getY(i))>.65)uv.setXY(i,x/7.7+.55,z/3.9+.5);
 else if(Math.abs(ns.getZ(i))>.65)uv.setXY(i,x/7.7+.55,.52+y*.7+(z>0?.32:-.32));
 else uv.setXY(i,z/7.7+.35,.34+y*.8+x*.017);
}}
const board=new THREE.Mesh(boardGeo,woodMat);board.position.set(0,-.65,0);board.receiveShadow=true;board.castShadow=true;scene.add(board);
const tableMaterial=new THREE.ShadowMaterial({color:0x21170f,opacity:.15,depthWrite:false});
const table=new THREE.Mesh(new THREE.PlaneGeometry(60,60),tableMaterial);table.rotation.x=-Math.PI/2;table.position.y=-.73;table.receiveShadow=true;scene.add(table);
const backgroundMaterial=new THREE.ShaderMaterial({depthWrite:false,uniforms:{darkness:{value:0},light:{value:new THREE.Color('#f7f5ef')},dark:{value:new THREE.Color('#251c15')},glow:{value:new THREE.Color('#967453')}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float darkness;uniform vec3 light;uniform vec3 dark;uniform vec3 glow;void main(){float beam=exp(-length((vUv-vec2(.39,.52))*vec2(12.,8.)));vec3 warm=mix(dark,glow,beam*.61);vec3 col=mix(light, warm, darkness);gl_FragColor=vec4(col,1.);}`});
const background=new THREE.Mesh(new THREE.PlaneGeometry(100,70),backgroundMaterial);background.position.set(0,5,-19);scene.add(background);
// Whipped cream cheese: softly polished valleys, tiny curds and dragged fibers.
// The reference is the breakfast photograph in the Rituel section.
function whippedCreamTextures(){
 const w=1024,canvases=Array.from({length:3},()=>{const c=document.createElement('canvas');c.width=c.height=w;return c;}),contexts=canvases.map(c=>c.getContext('2d')),pixels=contexts.map(c=>c.createImageData(w,w));
 for(let y=0;y<w;y++)for(let x=0;x<w;x++){
  const px=(x/w-.5)*3.2,pz=(y/w-.5)*3.2,r=Math.hypot(px,pz),a=Math.atan2(pz,px),grain=noise(px*83+177,pz*83+99),curd=noise(px*163+137,pz*163+37),silk=noise(a/TAU*256,(r+.025*Math.sin(a*3))*150),pore=smooth(.68,.88,curd),i=(y*w+x)*4;
  const tone=242+(grain-.5)*3-pore*4;pixels[0].data[i]=tone;pixels[0].data[i+1]=tone-2;pixels[0].data[i+2]=tone-7;
  const relief=128+(grain-.5)*19+(silk-.5)*25-pore*17;pixels[1].data[i]=pixels[1].data[i+1]=pixels[1].data[i+2]=relief;
  const rough=176+(curd-.5)*40+(silk-.5)*26;pixels[2].data[i]=pixels[2].data[i+1]=pixels[2].data[i+2]=rough;
  for(const p of pixels)p.data[i+3]=255;
 }
 contexts.forEach((c,i)=>c.putImageData(pixels[i],0,0));return {map:canvasTexture(canvases[0]),bumpMap:canvasTexture(canvases[1],false),roughnessMap:canvasTexture(canvases[2],false)};
}
function creamFinish(shader){shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin.replaceAll('RE_Direct( directLight,','directLight.color *= 0.60; RE_Direct( directLight,'));}
const cheeseMaterial=new THREE.MeshPhysicalMaterial({color:0xf6f0e2,...whippedCreamTextures(),roughness:.77,bumpScale:.0026,ior:1.38,specularIntensity:.38,clearcoat:.012,clearcoatRoughness:.6,sheen:.08,sheenColor:0xfff2db,sheenRoughness:.85,envMapIntensity:.26});
cheeseMaterial.onBeforeCompile=creamFinish;cheeseMaterial.customProgramCacheKey=()=> 'flor-minas-whipped-cream-finish-3';
// The same swept footprint drives the relief, its moving edge and its shadow.
const CREAM_START=2.32;
function creamStroke(t){const angle=CREAM_START+TAU*clamp(t),radius=.94;return {x:radius*Math.cos(angle),z:radius*Math.sin(angle),angle};}
function creamCoverage(x,z,spread){
 const angle=Math.atan2(z,x),along=((angle-CREAM_START)%TAU+TAU)%TAU,r=Math.hypot(x,z),radius=.94,start=creamStroke(0),end=creamStroke(spread);
 const distance=along<=spread*TAU?Math.abs(r-radius):Math.min(Math.hypot(x-start.x,z-start.z),Math.hypot(x-end.x,z-end.z));
 const width=.480+.012*Math.sin(angle*13)+.007*Math.sin(z*31);
 return (1-smooth(width-.075,width,distance))*smooth(0,.045,spread);
}
function creamBounds(a){return {outer:surface(a,0).length()-.042+.007*Math.sin(a*39),inner:surface(a,Math.PI).length()+.026+.004*Math.sin(a*31)};}
function creamRelief(a,t){
 const edge=smooth(0,.085,t)*(1-smooth(.88,1,t)),lift=Math.sin(Math.PI*clamp(t))**.46;
 let height=.032+.057*lift+.011*Math.sin(a*3+.4)+.009*Math.sin(a*5-t*4);
 // Overlapping curved passes: narrow raised lips beside broad, smooth hollows.
 for(let k=0;k<4;k++){
  const center=.13+k*.235+.085*Math.sin(a*(k%2+1)+k*1.7)+.044*Math.sin(a*3-k*.8),d=t-center,width=.035+.019*(.5+.5*Math.sin(a*2+k)),strength=.019+.021*(.5+.5*Math.sin(a*3+k*2.1));
  const brokenLip=.25+.75*smooth(.19,.68,noise(Math.cos(a)*3+k*7,Math.sin(a)*3+k*3));
  height+=strength*brokenLip*Math.exp(-Math.pow(d/width,2))+.011*Math.exp(-Math.pow((d+.037)/.065,2))-.012*Math.exp(-Math.pow((d-.075)/.068,2));
 }
 const torn=(noise(Math.cos(a)*(t+.5)*38+31,Math.sin(a)*(t+.5)*38+17)-.5)*.009*(.25+.75*Math.abs(2*t-1));
 return .004+edge*Math.max(.025,height+torn);
}
function creamSurfaceHeight(x,z){const a=Math.atan2(z,x),bounds=creamBounds(a),t=clamp((Math.hypot(x,z)-bounds.inner)/(bounds.outer-bounds.inner));return creamRelief(a,t);}
function creamGeometry(){
 const p=[],idx=[],uv=[],base=[],nr=84,nu=320;
 for(let i=0;i<=nu;i++){const a=i/nu*TAU,{outer,inner}=creamBounds(a);
  for(let j=0;j<=nr;j++){const t=j/nr,r=mix(inner,outer,t),x=r*Math.cos(a),z=r*Math.sin(a),y=creamRelief(a,t);p.push(x,y,z);base.push(y);uv.push(x/3.2+.5,z/3.2+.5);}
 }
 for(let i=0;i<nu;i++)for(let j=0;j<nr;j++){const a=i*(nr+1)+j,b=a+nr+1;idx.push(a,b,a+1,b,b+1,a+1);}
 // Closed underside and feathered lips; there is no unsupported flat cutout edge.
 const underside=p.length/3;
 for(let i=0;i<=nu;i++)for(const j of [0,nr]){const v=i*(nr+1)+j;p.push(p[v*3],.001,p[v*3+2]);base.push(.001);uv.push(uv[v*2],uv[v*2+1]);}
 for(let i=0;i<nu;i++){const a=i*(nr+1),b=a+nr+1,c=underside+i*2,d=c+2;
  idx.push(c,c+1,d,d,c+1,d+1,a,c,b,b,c,d,a+nr,b+nr,c+1,b+nr,d+1,c+1);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.userData.baseHeights=Float32Array.from(base);g.userData.radialSegments=nr;g.userData.angularSegments=nu;g.computeVertexNormals();return g;
}
const creamSpread={value:0};
const creamMaskGLSL=`
 uniform float spread;
 varying vec3 vCreamPosition;
 float creamMask(vec2 p){
  float angle=atan(p.y,p.x),along=mod(angle-2.32+6.28318530718,6.28318530718);
  float radius=.94,endAngle=2.32+spread*6.28318530718;
  vec2 first=vec2(cos(2.32),sin(2.32))*.94;
  vec2 last=vec2(cos(endAngle),sin(endAngle))*.94;
  float distance=along<=spread*6.28318530718?abs(length(p)-radius):min(length(p-first),length(p-last));
  float width=.480+.012*sin(angle*13.)+.007*sin(p.y*31.);
  return (1.-smoothstep(width-.075,width,distance))*smoothstep(0.,.045,spread);
 }
`;
function creamShader(shader){shader.uniforms.spread=creamSpread;shader.vertexShader='varying vec3 vCreamPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCreamPosition=position;');shader.fragmentShader=creamMaskGLSL+shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(creamMask(vCreamPosition.xz)<.015)discard;');}
const spreadMaterial=cheeseMaterial.clone();spreadMaterial.onBeforeCompile=shader=>{creamShader(shader);creamFinish(shader);};spreadMaterial.customProgramCacheKey=()=> 'flor-minas-circular-whipped-cream-3';
const cream=new THREE.Mesh(creamGeometry(),spreadMaterial);cream.receiveShadow=true;cream.castShadow=true;bottom.add(cream);
new THREE.TextureLoader().load('/assets/hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/24cc8f52-04c4-4906-8e8f-b2a1a602414f_original.png',texture=>{
 texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.MirroredRepeatWrapping;texture.anisotropy=Math.min(12,renderer.capabilities.getMaxAnisotropy());
 const height=texture.clone();height.colorSpace=THREE.NoColorSpace;height.needsUpdate=true;
 for(const material of [cheeseMaterial,spreadMaterial]){material.map=texture;material.bumpMap=height;material.bumpScale=.0015;material.color.set(0xffffff);material.needsUpdate=true;}
 dirty=true;
});
cream.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});cream.customDepthMaterial.onBeforeCompile=creamShader;cream.customDepthMaterial.customProgramCacheKey=()=> 'flor-minas-circular-whipped-cream-depth-3';
let lastCreamSpread=-1;
function updateCream(spread){
 creamSpread.value=spread;if(Math.abs(spread-lastCreamSpread)<.00001)return;lastCreamSpread=spread;
 const g=cream.geometry,p=g.attributes.position,base=g.userData.baseHeights;
 for(let i=0;i<p.count;i++)p.setY(i,base[i]*creamCoverage(p.getX(i),p.getZ(i),spread));
 p.needsUpdate=true;g.computeVertexNormals();
 const normal=g.attributes.normal,nu=g.userData.angularSegments,nr=g.userData.radialSegments;
 for(let j=0;j<=nr;j++){const a=j,b=nu*(nr+1)+j,n=new THREE.Vector3().fromBufferAttribute(normal,a).add(new THREE.Vector3().fromBufferAttribute(normal,b)).normalize();normal.setXYZ(a,n.x,n.y,n.z);normal.setXYZ(b,n.x,n.y,n.z);}normal.needsUpdate=true;
}
const dollop=new THREE.Group();scene.add(dollop);
const dpoints=[];for(let i=0;i<=30;i++){let t=i/30;dpoints.push(new THREE.Vector2(Math.max(.008,.48*Math.sqrt(Math.max(0,1-(t*1.55-.55)**2))*(1+.025*Math.sin(t*7))),t*.66));}
const dollopGeo=new THREE.LatheGeometry(dpoints,96);{const a=dollopGeo.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i);const ang=Math.atan2(a.getZ(i),a.getX(i)),ridge=1+.03*Math.sin(ang*7+y*8)+.048*Math.sin(ang*3-y*10);a.setX(i,(a.getX(i)*ridge+.27*(y/.66)**2)*1.15);a.setY(i,y*.8);a.setZ(i,a.getZ(i)*ridge);}dollopGeo.computeVertexNormals();}
const dollopMesh=new THREE.Mesh(dollopGeo,cheeseMaterial);dollopMesh.castShadow=true;dollopMesh.receiveShadow=true;dollop.add(dollopMesh);
// Modeled from flor-minas-knife-reference.png: rounded satin blade, forged bolster,
// two contoured walnut scales, full steel tang and two flush rivets.
const knife=new THREE.Group();scene.add(knife);
function brushedSteelTextures(){
 const c=document.createElement('canvas'),b=document.createElement('canvas'),a=document.createElement('canvas'),w=512,h=2048;for(const canvas of [c,b,a]){canvas.width=w;canvas.height=h;}
 const cx=c.getContext('2d'),bx=b.getContext('2d'),ax=a.getContext('2d'),im=cx.createImageData(w,h),bi=bx.createImageData(w,h),ai=ax.createImageData(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const grain=noise(x*3.37,y*.003),fine=noise(x*7.13,y*.038),satin=noise(x*.029,y*.008),i=(y*w+x)*4;
  const r=196+(grain-.5)*25+(fine-.5)*11+(satin-.5)*12,bump=128+(grain-.5)*25+(fine-.5)*11;
  im.data[i]=im.data[i+1]=im.data[i+2]=r;bi.data[i]=bi.data[i+1]=bi.data[i+2]=bump;
  const shade=219+(grain-.5)*3+(satin-.5)*2;ai.data[i]=shade-2;ai.data[i+1]=shade;ai.data[i+2]=shade+2;
  im.data[i+3]=bi.data[i+3]=ai.data[i+3]=255;
 }
 cx.putImageData(im,0,0);bx.putImageData(bi,0,0);ax.putImageData(ai,0,0);
 // Hairline polishing marks change roughness and normals, rather than painted white stripes.
 for(let i=0;i<105;i++){const x=(i*97.31)%w,y=(i*137.7)%h;bx.strokeStyle='rgba(78,78,78,.17)';bx.lineWidth=.35;bx.beginPath();bx.moveTo(x,y);bx.lineTo(x+.1,y+85+(i%11)*34);bx.stroke();}
 return {map:canvasTexture(a),roughnessMap:canvasTexture(c,false),bumpMap:canvasTexture(b,false)};
}
const cutleryStudio=new THREE.Scene();cutleryStudio.background=new THREE.Color('#282c32');window.__florMinasScenes.push(cutleryStudio);
function cutleryPanel(w,h,x,y,z,power,soft=false){
 let map=null;if(soft){const c=document.createElement('canvas');c.width=256;c.height=128;const cx=c.getContext('2d'),g=cx.createLinearGradient(0,0,256,128);g.addColorStop(0,'#424953');g.addColorStop(.25,'#b3bac2');g.addColorStop(.65,'#fff9ef');g.addColorStop(1,'#7d858e');cx.fillStyle=g;cx.fillRect(0,0,256,128);map=canvasTexture(c);}
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(power,power,power),map,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);cutleryStudio.add(m);
}
cutleryPanel(7,5,-3,5,2,1.65,true);cutleryPanel(.85,7,3.5,4,2,2.7,true);cutleryPanel(4,8,0,3,-5,.014);cutleryPanel(6,4,0,-4,1,.22,true);cutleryPanel(7,1.2,0,5,-.5,.035);
const steelPMREM=new THREE.PMREMGenerator(renderer),steelTarget=steelPMREM.fromScene(cutleryStudio,.025),steelEnv=steelTarget.texture;window.__florMinasTargets.push(steelTarget);steelPMREM.dispose();
const steelMaterial=new THREE.MeshPhysicalMaterial({color:0xb0bbc7,metalness:1,roughness:.46,...brushedSteelTextures(),bumpScale:.00006,anisotropy:.48,anisotropyRotation:Math.PI/2,envMap:steelEnv,envMapIntensity:.95});
const polishedSteel=new THREE.MeshPhysicalMaterial({color:0xadb8c4,metalness:1,roughness:.26,envMap:steelEnv,envMapIntensity:.82});
const bladeShape=new THREE.Shape();bladeShape.moveTo(.01,0);bladeShape.bezierCurveTo(-.23,0,-.30,.13,-.31,.34);bladeShape.bezierCurveTo(-.33,.92,-.29,1.45,-.15,2.19);bladeShape.lineTo(.14,2.19);bladeShape.bezierCurveTo(.18,1.57,.225,.91,.25,.38);bladeShape.bezierCurveTo(.26,.16,.23,.005,.01,0);
const bladeGeo=new THREE.ExtrudeGeometry(bladeShape,{depth:.008,bevelEnabled:true,bevelThickness:.008,bevelSize:.012,bevelSegments:5,curveSegments:40});bladeGeo.rotateX(-Math.PI/2);
{const p=bladeGeo.attributes.position,uv=bladeGeo.attributes.uv;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),crown=.014*Math.max(0,1-(x/.34)**2)*Math.sin(clamp(-z/2.2)*Math.PI);p.setY(i,p.getY(i)+crown);uv.setXY(i,x/.64+.5,-z/2.2);}bladeGeo.computeVertexNormals();}
const blade=new THREE.Mesh(bladeGeo,[steelMaterial,polishedSteel]);knife.add(blade);
function bolsterGeometry(){
 const p=[],uv=[],idx=[],around=48,steps=20;
 for(let j=0;j<=steps;j++){const t=j/steps,h=mix(.025,.125,smooth(0,1,t)),w=.143+.009*Math.sin(t*Math.PI);for(let i=0;i<=around;i++){const a=i/around*TAU,c=Math.cos(a),s=Math.sin(a);p.push(Math.sign(c)*Math.abs(c)**.48*w,Math.sign(s)*Math.abs(s)**.48*h,-2.16-t*.34);uv.push(i/around,t);}}
 for(let j=0;j<steps;j++)for(let i=0;i<around;i++){const a=j*(around+1)+i,b=a+around+1;idx.push(a,b,a+1,b,b+1,a+1);}
 for(const j of [0,steps]){const center=p.length/3;p.push(0,0,-2.16-j/steps*.34);uv.push(.5,j/steps);for(let i=0;i<around;i++){const a=j*(around+1)+i;if(j===0)idx.push(center,a,a+1);else idx.push(center,a+1,a);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
const bolster=new THREE.Mesh(bolsterGeometry(),polishedSteel);knife.add(bolster);
function knifeHandleShape(){const s=new THREE.Shape();s.moveTo(-.133,2.47);s.bezierCurveTo(-.15,2.88,-.163,3.35,-.177,3.74);s.bezierCurveTo(-.183,3.99,-.255,4.18,-.179,4.27);s.bezierCurveTo(-.098,4.35,.126,4.35,.192,4.27);s.bezierCurveTo(.254,4.18,.197,3.99,.178,3.74);s.bezierCurveTo(.164,3.34,.15,2.88,.133,2.47);s.closePath();return s;}
const handleShape=knifeHandleShape(),tangGeo=new THREE.ExtrudeGeometry(handleShape,{depth:.01,bevelEnabled:true,bevelThickness:.003,bevelSize:.004,bevelSegments:3,curveSegments:28});tangGeo.rotateX(-Math.PI/2);tangGeo.translate(0,-.005,0);
const tang=new THREE.Mesh(tangGeo,polishedSteel);knife.add(tang);
const scaleGeo=new THREE.ExtrudeGeometry(handleShape,{depth:.052,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:7,curveSegments:32});scaleGeo.rotateX(-Math.PI/2);
{const p=scaleGeo.attributes.position,uv=scaleGeo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(-p.getZ(i)-2.47)/1.85*.58+.19,p.getX(i)*1.3+.43);}
const walnutMaterial=new THREE.MeshPhysicalMaterial({map:woodPhoto,bumpMap:woodPhoto,bumpScale:.0017,color:0x85705e,roughness:.43,specularIntensity:.48,clearcoat:.22,clearcoatRoughness:.36,envMap:steelEnv,envMapIntensity:.42});
const grip=new THREE.Mesh(scaleGeo,walnutMaterial),gripUnder=new THREE.Mesh(scaleGeo,walnutMaterial);grip.position.y=.043;gripUnder.position.y=-.043;gripUnder.scale.y=-1;knife.add(grip,gripUnder);
const rivetMaterial=polishedSteel.clone();rivetMaterial.roughness=.27;
for(const z of [-2.74,-4.03])for(const side of [-1,1]){
 const rivet=new THREE.Mesh(new THREE.CylinderGeometry(.038,.038,.006,36),rivetMaterial);rivet.position.set(0,side*.132,z);knife.add(rivet);
 const edge=new THREE.Mesh(new THREE.TorusGeometry(.038,.0014,6,36),polishedSteel);edge.rotation.x=Math.PI/2;edge.position.set(0,side*.1355,z);knife.add(edge);
}
const bladeSmearGeo=new THREE.SphereGeometry(1,48,24);{const p=bladeSmearGeo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,p.getY(i)*(1+.19*Math.sin(z*14+x*3)+.08*Math.sin(x*21-z*4)));}bladeSmearGeo.computeVertexNormals();}
const bladeSmear=new THREE.Mesh(bladeSmearGeo,cheeseMaterial);bladeSmear.position.set(-.04,.026,-.40);bladeSmear.scale.set(.13,.019,.28);knife.add(bladeSmear);
// A second, independently modeled tool: flor-minas-bread-knife-reference.png.
// Its long scalloped blade and three-rivet black handle are distinct from the spreader.
const breadKnife=new THREE.Group();breadKnife.name='Faca de pão serrilhada';scene.add(breadKnife);
function breadKnifeEdge(){const points=[];for(let i=0;i<=22*8;i++){const x=1.40-i/(22*8)*3.65,y=-.31+(1.40-x)/3.65*.038+Math.sin((i%8)/8*Math.PI)*.037;points.push([x,y]);}return points;}
function breadKnifeBladeGeometry(){
 const s=new THREE.Shape();s.moveTo(-2.50,-.12);s.bezierCurveTo(-2.43,.11,-2.22,.275,-1.96,.28);s.lineTo(1.40,.29);s.quadraticCurveTo(1.59,.29,1.59,.13);s.lineTo(1.51,-.31);
 for(const [x,y] of breadKnifeEdge())s.lineTo(x,y);s.lineTo(-2.50,-.12);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:.018,bevelEnabled:true,bevelThickness:.005,bevelSize:.004,bevelSegments:3,curveSegments:36});g.translate(0,0,-.009);
 const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getY(i)+.35)/.70,(p.getX(i)+2.5)/4.1);g.rotateX(Math.PI/2);return g;
}
const breadSteel=steelMaterial.clone();breadSteel.roughness=.46;breadSteel.anisotropy=.65;breadSteel.envMapIntensity=.92;breadSteel.bumpScale=.000045;
const breadBlade=new THREE.Mesh(breadKnifeBladeGeometry(),[breadSteel,polishedSteel]);breadKnife.add(breadBlade);
// A restrained laser mark on the actual steel face, visible as the blade approaches.
{
 const c=document.createElement('canvas');c.width=512;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#343a3e';ctx.textAlign='center';ctx.font='500 49px Georgia';ctx.fillText('A U B E',256,79);ctx.font='17px sans-serif';ctx.fillText('PANIFICADORA  /  INOX',256,119);
 const mark=new THREE.Mesh(new THREE.PlaneGeometry(.48,.18),new THREE.MeshStandardMaterial({map:canvasTexture(c),transparent:true,depthWrite:false,roughness:.83,metalness:.25,opacity:.68,polygonOffset:true,polygonOffsetFactor:-1}));mark.rotation.x=-Math.PI/2;mark.position.set(1.05,.0148,-.08);breadKnife.add(mark);
}
// A narrow sharpened face follows every scallop on both sides of the blade.
{
 const edge=breadKnifeEdge(),p=[],idx=[];
 for(const side of [-1,1]){const offset=p.length/3;for(const [x,y] of edge)p.push(x,y,side*.0145,x,y+.032,side*.0145);
  for(let i=0;i<edge.length-1;i++){const a=offset+i*2;if(side>0)idx.push(a,a+1,a+2,a+1,a+3,a+2);else idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();g.rotateX(Math.PI/2);breadKnife.add(new THREE.Mesh(g,polishedSteel));
}
function breadKnifeHandleShape(){const s=new THREE.Shape();s.moveTo(1.82,.25);s.bezierCurveTo(2.45,.24,3.35,.36,3.93,.24);s.bezierCurveTo(4.15,.21,4.06,-.15,3.90,-.31);s.bezierCurveTo(3.74,-.13,3.61,-.08,3.41,-.13);s.bezierCurveTo(2.87,-.21,2.65,-.25,2.31,-.16);s.bezierCurveTo(2.08,-.095,1.95,-.10,1.82,-.12);s.closePath();return s;}
const breadHandleShape=breadKnifeHandleShape();
const breadTangGeo=new THREE.ExtrudeGeometry(breadHandleShape,{depth:.014,bevelEnabled:true,bevelSize:.024,bevelThickness:.001,bevelSegments:3,curveSegments:36});breadTangGeo.translate(0,0,-.007);breadTangGeo.rotateX(Math.PI/2);breadKnife.add(new THREE.Mesh(breadTangGeo,polishedSteel));
function compositeTextures(){
 const c=document.createElement('canvas'),b=document.createElement('canvas'),r=document.createElement('canvas');for(const a of [c,b,r]){a.width=1024;a.height=256;}const ctx=c.getContext('2d'),bx=b.getContext('2d'),rx=r.getContext('2d'),im=ctx.createImageData(1024,256),bi=bx.createImageData(1024,256),ri=rx.createImageData(1024,256);
 for(let y=0;y<256;y++)for(let x=0;x<1024;x++){const i=(y*1024+x)*4,grain=noise(x*.1,y*3.2),pore=noise(x*2.7,y*3.1),weave=noise(x*.013,y*.18),v=30+(grain-.5)*7+(pore-.5)*5+(weave-.5)*6;im.data[i]=v*.94;im.data[i+1]=v;im.data[i+2]=v*1.04;bi.data[i]=bi.data[i+1]=bi.data[i+2]=128+(grain-.5)*20+(pore-.5)*28;ri.data[i]=ri.data[i+1]=ri.data[i+2]=191+(pore-.5)*30+(weave-.5)*25;im.data[i+3]=bi.data[i+3]=ri.data[i+3]=255;}
 ctx.putImageData(im,0,0);bx.putImageData(bi,0,0);rx.putImageData(ri,0,0);return {map:canvasTexture(c),bumpMap:canvasTexture(b,false),roughnessMap:canvasTexture(r,false)};
}
const blackComposite=new THREE.MeshPhysicalMaterial({color:0xd9e1e5,...compositeTextures(),roughness:.51,bumpScale:.00065,clearcoat:.19,clearcoatRoughness:.32,specularIntensity:.65,envMap:steelEnv,envMapIntensity:.6});
function breadGripCrown(x,z){return .032*Math.max(0,1-((z-.025)/.29)**2)*Math.sin(clamp((x-1.80)/2.30)*Math.PI);}
function contouredBreadGrip(){
 const source=new THREE.ExtrudeGeometry(breadHandleShape,{depth:.080,bevelEnabled:true,bevelSize:.045,bevelThickness:.046,bevelSegments:10,curveSegments:40});source.translate(0,0,-.040);source.rotateX(Math.PI/2);
 const attr=source.attributes.position,points=[];
 function triangle(a,b,c,depth=0){const ab=a.distanceToSquared(b),bc=b.distanceToSquared(c),ca=c.distanceToSquared(a);if(depth<10&&Math.max(ab,bc,ca)>.018){if(ab>=bc&&ab>=ca){const m=a.clone().add(b).multiplyScalar(.5);triangle(a,m,c,depth+1);triangle(m,b,c,depth+1);}else if(bc>=ca){const m=b.clone().add(c).multiplyScalar(.5);triangle(a,b,m,depth+1);triangle(a,m,c,depth+1);}else{const m=c.clone().add(a).multiplyScalar(.5);triangle(a,b,m,depth+1);triangle(m,b,c,depth+1);}}else points.push(a,b,c);}
 for(let i=0;i<attr.count;i+=3)triangle(new THREE.Vector3().fromBufferAttribute(attr,i),new THREE.Vector3().fromBufferAttribute(attr,i+1),new THREE.Vector3().fromBufferAttribute(attr,i+2));
 const positions=[],uv=[],indices=[],shared=new Map();for(const point of points){const v=point.clone();v.y+=breadGripCrown(v.x,v.z)*clamp(v.y/.086)**2;const key=`${v.x.toFixed(5)},${v.y.toFixed(5)},${v.z.toFixed(5)}`;let index=shared.get(key);if(index===undefined){index=positions.length/3;shared.set(key,index);positions.push(v.x,v.y,v.z);uv.push((v.x-1.8)/2.3,(v.z+.33)/.7);}indices.push(index);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();source.dispose();return g;
}
const breadGripGeo=contouredBreadGrip();
for(const side of [-1,1]){const grip=new THREE.Mesh(breadGripGeo,blackComposite);grip.position.y=side*.086;grip.scale.y=side;breadKnife.add(grip);}
{
 const s=new THREE.Shape();s.moveTo(1.46,.29);s.lineTo(1.91,.25);s.lineTo(1.91,-.11);s.bezierCurveTo(1.71,-.09,1.64,-.17,1.51,-.31);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelSize:.013,bevelThickness:.022,bevelSegments:5,curveSegments:28});g.translate(0,0,-.08);g.rotateX(Math.PI/2);breadKnife.add(new THREE.Mesh(g,polishedSteel));
}
const domedRivet=new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(.050,0),new THREE.Vector2(.055,.002),new THREE.Vector2(.054,.004),new THREE.Vector2(.045,.006),new THREE.Vector2(.028,.008),new THREE.Vector2(0,.009)],48);
for(const x of [2.27,2.98,3.70])for(const side of [-1,1]){const y=.173+breadGripCrown(x,.015),rivet=new THREE.Mesh(domedRivet,rivetMaterial);rivet.position.set(x,side*y,.015);rivet.scale.y=side;breadKnife.add(rivet);const rim=new THREE.Mesh(new THREE.TorusGeometry(.055,.0012,8,48),polishedSteel);rim.rotation.x=Math.PI/2;rim.position.set(x,side*(y+.0015),.015);breadKnife.add(rim);}
breadKnife.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
// A studio-style exposure for the cutlery keeps the direct highlight below
// clipping while its environment reflections, self-shadowing and grain remain physical.
for(const [material,gain] of [[steelMaterial,.24],[breadSteel,.42],[polishedSteel,.28],[rivetMaterial,.25],[walnutMaterial,.65],[blackComposite,.55]]){
 material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin.replaceAll('RE_Direct( directLight,',`directLight.color *= ${gain.toFixed(3)}; RE_Direct( directLight,`));};
 material.customProgramCacheKey=()=>`flor-minas-cutlery-studio-${gain}`;
}
// Fallen sesame: the same thin seeds, plus closed broken kernels, resting on the wood.
const crumbs=new THREE.Group();scene.add(crumbs);
for(const [count,fragment] of [[78,false],[38,true]]){
 const mesh=new THREE.InstancedMesh(fragment?sesameFragmentGeo:sesameGeo,sesameMaterial,count),dummy=new THREE.Object3D(),color=new THREE.Color();
 for(let i=0;i<count;i++){
  let x,z;do{if(random()<.62){const a=random()*TAU,r=1.65+random()*.9;x=Math.cos(a)*r;z=Math.sin(a)*r*.68;}else{x=(random()-.5)*6.25;z=(random()-.5)*3.35;}}while(Math.hypot(x,z)<1.57||Math.abs(z)>1.66);
  const s=(fragment?.70:.83)+random()*.34;dummy.scale.set(.0145*s,.0055*s,.028*s);dummy.rotation.set((random()-.5)*.12,random()*TAU,(random()-.5)*.15);dummy.position.set(x,-.485,z);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  const v=.7+random()*.3;color.setRGB(v,v*(.93+random()*.07),v*(.82+random()*.14));mesh.setColorAt(i,color);
 }
 mesh.castShadow=mesh.receiveShadow=true;crumbs.add(mesh);
}
const renderTarget=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});window.__florMinasTargets.push(renderTarget);
renderTarget.depthTexture=new THREE.DepthTexture(1,1);renderTarget.depthTexture.type=THREE.UnsignedIntType;
const postScene=new THREE.Scene(),postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);window.__florMinasScenes.push(postScene);
const postMaterial=new THREE.ShaderMaterial({uniforms:{colorTex:{value:renderTarget.texture},depthTex:{value:renderTarget.depthTexture},resolution:{value:new THREE.Vector2(1,1)},focus:{value:6.5},aperture:{value:32}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 vUv;uniform sampler2D colorTex;uniform sampler2D depthTex;uniform vec2 resolution;uniform float focus;uniform float aperture;
 void main(){float d=texture2D(depthTex,vUv).x;float z=5.0/(100.0-d*99.95);float c=clamp(abs(1.0/z-1.0/focus)*aperture,0.0,4.0);vec2 delta=vec2(c)/resolution;vec3 sum=texture2D(colorTex,vUv).rgb*2.0;
 for(int i=0;i<8;i++){float a=float(i)*.785398;sum+=texture2D(colorTex,vUv+vec2(cos(a),sin(a))*delta).rgb;}
 gl_FragColor=vec4(sum/10.0,1.0);
 #ifdef TONE_MAPPING
 if(d<.99999)gl_FragColor.rgb=toneMapping(gl_FragColor.rgb);
 #endif
 #include <colorspace_fragment>
 }`});postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMaterial));
let width=0,height=0,progress=0,target=0,travel=1,last=0,active=-1,dirty=true,rendered=0,thumbsMade=false;
const look=new THREE.Vector3(),worldBottom=new THREE.Vector3(),worldScale=new THREE.Vector3(),worldRotation=new THREE.Quaternion();
const breadBounds=new THREE.Box3(),knifeBounds=new THREE.Box3(),knifeFocus=new THREE.Vector3(),framePoint=new THREE.Vector3(),frameDirection=new THREE.Vector3(),frameRight=new THREE.Vector3(),frameUp=new THREE.Vector3(),arrivalOffset=new THREE.Vector3();
function frameSchmear(weight,offset,mobile){
 if(weight<=0)return;knife.updateMatrixWorld(true);knifeBounds.setFromObject(knife);knifeBounds.min.sub(offset);knifeBounds.max.sub(offset);breadBounds.setFromObject(lower);knifeBounds.union(breadBounds);
 frameDirection.copy(camera.position).sub(look).normalize();frameRight.set(0,1,0).cross(frameDirection).normalize();frameUp.copy(frameDirection).cross(frameRight).normalize();knifeBounds.getCenter(knifeFocus).addScaledVector(frameUp,-.42);
 const distance=camera.position.distanceTo(look);look.lerp(knifeFocus,weight*(mobile?.88:.45));const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov)*.5);let fit=distance;
 for(let i=0;i<8;i++){framePoint.set(i&1?knifeBounds.max.x:knifeBounds.min.x,i&2?knifeBounds.max.y:knifeBounds.min.y,i&4?knifeBounds.max.z:knifeBounds.min.z).sub(look);const near=framePoint.dot(frameDirection);fit=Math.max(fit,near+Math.abs(framePoint.dot(frameRight))/(tangent*camera.aspect*.89),near+Math.abs(framePoint.dot(frameUp))/(tangent*.76));}
 camera.position.copy(look).addScaledVector(frameDirection,mix(distance,fit,weight));camera.lookAt(look);
}
function frameSlicing(weight){
 if(weight<=0)return;
 // Fit the complete stroke envelope, rather than chasing the moving handle.
 knifeBounds.min.set(-2.4,-.47,-2.2);knifeBounds.max.set(4.85,.47,2.2);
 frameDirection.copy(camera.position).sub(look).normalize();frameRight.set(0,1,0).cross(frameDirection).normalize();frameUp.copy(frameDirection).cross(frameRight).normalize();knifeBounds.getCenter(knifeFocus).applyMatrix4(bagel.matrixWorld).addScaledVector(frameUp,-.52);
 const distance=camera.position.distanceTo(look);look.lerp(knifeFocus,weight);const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov)*.5);let fit=distance;
 for(let i=0;i<8;i++){framePoint.set(i&1?knifeBounds.max.x:knifeBounds.min.x,i&2?knifeBounds.max.y:knifeBounds.min.y,i&4?knifeBounds.max.z:knifeBounds.min.z).applyMatrix4(bagel.matrixWorld).sub(look);const near=framePoint.dot(frameDirection);fit=Math.max(fit,near+Math.abs(framePoint.dot(frameRight))/(tangent*camera.aspect*.91),near+Math.abs(framePoint.dot(frameUp))/(tangent*.76));}
 camera.position.copy(look).addScaledVector(frameDirection,mix(distance,fit,weight));camera.lookAt(look);
}
const lightColor=new THREE.Color('#f7f5ef'),darkColor=new THREE.Color('#251c15'),blendColor=new THREE.Color();
const STORY_DURATION=2.09,flavorStops=[.37,.57,.77,.99],flavorButtons=$$('[data-flavor]'),flavorPanel=$('#flavor-panel');
const flavorNames=['Opção 01','Opção 02','Opção 03','Opção 04'];
const flavorDescriptions=flavorNames.map(()=> 'Item do acervo visual original; descrição do produto a confirmar.');
let activeFlavor=-1;
// A pause in preparation opens room for the carousel without speeding up the cut.
// Hermite ramps match the entering/exiting speed and stop smoothly at the hold.
function storyPhase(s){const t=s*STORY_DURATION;
 if(t<=.22)return t;
 if(t<.34){const f=(t-.22)/.12;return .22+.12*f+.06*f*f-.08*f*f*f;}
 if(t<=1.05)return .32;
 if(t<1.17)return .32+.08*smooth(1.05,1.17,t);
 if(t<=1.49)return .40;
 if(t<1.57){const f=(t-1.49)/.08;return .40+.16*f*f-.08*f*f*f;}
 return t-1.09;
}
function carouselIndex(t){return smooth(.405,.535,t)+smooth(.60,.73,t)+smooth(.805,.935,t);}
function flavorPresence(t){return smooth(.29,.385,t)*(1-smooth(1.045,1.135,t));}
function positionFlavors(index,time,mobile,thumbnail){
 const center=bagel.position.clone(),rotation=bagel.rotation.clone(),presence=thumbnail?0:flavorPresence(time);
 const direction=camera.position.clone().sub(look).normalize(),right=new THREE.Vector3(0,1,0).cross(direction).normalize();
 const frameWidth=2*camera.position.distanceTo(look)*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.aspect;
 const gap=mix(Math.max(12,frameWidth*1.25),mobile?3.85:4.7,presence);
 flavorBagels.forEach((object,i)=>{const d=i-index,edge=Math.min(1,Math.abs(d));
  object.visible=true;object.position.copy(center).addScaledVector(right,d*gap).addScaledVector(direction,-.75*Math.abs(d)*presence);object.position.y+=.13*Math.sin(edge*Math.PI)*presence;
  object.rotation.copy(rotation);object.rotation.y+=d*.28*presence;object.rotation.z-=d*.09*presence;object.scale.setScalar(1-.12*edge*presence);
 });
}
const keys=[
 {p:0,c:[.25,2.65,6.10],a:[0,-.63,0],y:-.135,r:[0,-.13,0]},
 {p:.16,c:[-.2,2.45,6.6],a:[0,-.48,0],y:-.135,r:[0,.04,0]},
 {p:.29,c:[.6,2.3,8.2],a:[0,.35,0],y:1.03,r:[.70,-.35,-.12]},
 {p:.32,c:[.67161648,2.31014275,8.18174305],a:[0,.38201551,0],y:1.07799250,r:[.83836128,-.33047254,-.11647032]},
 {p:.40,c:[1.6,4.1,9.6],a:[.45,.75,0],y:1.28,r:[.22,-.18,0]},
 {p:.51,c:[.7,3.9,9.6],a:[0,.68,0],y:1.50,r:[.66,.03,0]},
 {p:.58,c:[.45,4.2,10.1],a:[0,.75,0],y:1.65,r:[.25,.02,0]},
 {p:.66,c:[.3,4.3,9.2],a:[0,-.03,0],y:.18,r:[0,.02,0]},
 {p:.71,c:[.6,3.9,7.7],a:[.4,-.3,0],y:-.135,r:[0,.02,0]},
 {p:.78,c:[2.35,4.85,6.1],a:[1.9,-.20,-.08],y:-.135,r:[0,.02,0]},
 {p:.92,c:[2.75,4.75,5.95],a:[1.9,-.20,-.08],y:-.135,r:[0,.02,0]},
 {p:1,c:[4.5,5.5,9.5],a:[.1,-.4,0],y:-.135,r:[0,.02,0]}
];
// A C1-continuous Hermite path keeps both position and velocity joined at every key.
function sample(field,axis,p){
 let i=0;while(i<keys.length-2&&p>keys[i+1].p)i++;const value=k=>axis===null?k[field]:k[field][axis],k1=keys[i],k2=keys[i+1],v1=value(k1),v2=value(k2),d=k2.p-k1.p,t=clamp((p-k1.p)/d);
 // Shape-preserving tangents keep flat resting intervals flat: no sinking into the board.
 const tangent=j=>{if(j===0||j===keys.length-1)return 0;const h0=keys[j].p-keys[j-1].p,h1=keys[j+1].p-keys[j].p,a=(value(keys[j])-value(keys[j-1]))/h0,b=(value(keys[j+1])-value(keys[j]))/h1;if(a*b<=0)return 0;const w1=2*h1+h0,w2=h1+2*h0;return (w1+w2)/(w1/a+w2/b)*.8;};
 const m1=tangent(i)*d,m2=tangent(i+1)*d;return (2*t*t*t-3*t*t+1)*v1+(t*t*t-2*t*t+t)*m1+(-2*t*t*t+3*t*t)*v2+(t*t*t-t*t)*m2;
}
function cutMotion(p){return {split:smooth(.448,.55,p),flip:smooth(.553,.654,p),upperY:.58*smooth(.422,.468,p)*(1-smooth(.616,.706,p))+.123*smooth(.616,.706,p),lowerY:-.065*smooth(.422,.475,p)*(1-smooth(.616,.706,p))};}
// The edge advances through the middle plane while sawing along the blade's length.
// The knife has cleared the far crust before withdrawal; only then do the halves open.
function slicingMotion(t){
 const approach=smooth(1.075,1.22,t),cut=smooth(1.225,1.425,t),withdraw=smooth(1.435,1.495,t);
 const saw=.22*Math.sin(cut*TAU*4.5)*Math.sin(Math.PI*cut);
 return {approach,cut,withdraw,visible:t>1.07&&t<1.505,x:.43+4.6*(1-approach)+saw+withdraw*6.4,y:.6*(1-approach)+withdraw*.42,z:1.90-3.80*cut+2.6*(1-approach)-withdraw*.60,roll:.38*(1-approach)-withdraw*.26};
}
function schmearMotion(p){
 const spread=smooth(.794,.939,p),approach=smooth(.704,.794,p),leave=smooth(.942,.996,p),stroke=creamStroke(spread);
 return {spread,approach,leave,stroke,pitch:.095+.018*Math.sin(stroke.angle)+.26*(1-approach)+leave*.24,yaw:-.83+.16*Math.sin(stroke.angle-CREAM_START)+.06*Math.sin(stroke.angle*2),roll:.035+.035*Math.cos(stroke.angle),contactHeight:.105+.012*Math.sin(stroke.angle*2)+.12*(1-smooth(0,.16,spread))};
}
function resize(){width=stage.clientWidth;height=stage.clientHeight;renderer.setSize(width,height,false);renderTarget.setSize(Math.round(width*renderer.getPixelRatio()),Math.round(height*renderer.getPixelRatio()));postMaterial.uniforms.resolution.value.set(width*renderer.getPixelRatio(),height*renderer.getPixelRatio());camera.aspect=width/height;camera.updateProjectionMatrix();travel=story.offsetHeight-height;target=clamp(scrollY/travel);dirty=true;}
window.addEventListener('resize',resize,{passive:true});window.addEventListener('scroll',()=>{target=clamp(scrollY/travel);dirty=true;},{passive:true});
dots.forEach(b=>b.addEventListener('click',()=>window.scrollTo({top:[0,.57/STORY_DURATION,1.315/STORY_DURATION,1.92/STORY_DURATION][+b.dataset.step]*travel,behavior:reduceMotion?'auto':'smooth'})));
flavorButtons.forEach(b=>b.addEventListener('click',()=>window.scrollTo({top:flavorStops[+b.dataset.flavor]/STORY_DURATION*travel,behavior:reduceMotion?'auto':'smooth'})));
function updateCopy(p,darkness,s){const t=s*STORY_DURATION,presence=flavorPresence(t),values=[1-smooth(.17,.245,p),smooth(.30,.36,p)*(1-smooth(.54,.65,p))*smooth(1.125,1.175,t),smooth(.735,.795,p)*(1-smooth(.948,.99,p))];const index=t<.29?0:t<1.135?1:p<.72?2:3;
 chapters.forEach((el,i)=>{const opacity=values[i];el.style.opacity=opacity.toFixed(4);el.style.color=i===1?'#f7f0e2':'#29251f';el.classList.toggle('active',opacity>.5);el.setAttribute('aria-hidden',String(opacity<.05));el.inert=opacity<.05;});
 if(index!==active){dots.forEach((el,i)=>{if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});$('#chapter-label').textContent=['01 / Acolhimento','02 / Tradição','03 / Sabores','04 / Experiência'][index];active=index;}
 flavorPanel.style.opacity=presence.toFixed(4);flavorPanel.inert=presence<.05;flavorPanel.setAttribute('aria-hidden',String(presence<.05));
 const track=carouselIndex(t),flavor=Math.round(track),settled=1-Math.sin((track%1)*Math.PI)**2;
 $('#flavor-copy').style.opacity=settled.toFixed(4);$('#flavor-copy').style.transform=`translateY(${(1-settled)*10}px)`;
 if(flavor!==activeFlavor){$('#flavor-name').textContent=flavorNames[flavor];$('#flavor-description').textContent=flavorDescriptions[flavor];$('#flavor-number').textContent=`0${flavor+1} / 04`;flavorButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===flavor)));activeFlavor=flavor;}
 header.classList.toggle('dark',darkness>.62&&scrollY<travel);header.classList.toggle('solid',scrollY>travel+height*.75);
 $('#story-footer').style.color=darkness>.62?'#eee3d3':'#393127';$('#story-footer').style.opacity=1-smooth(.97,1,p);$('#scroll-progress').style.transform=`scaleX(${s})`;
}
function pose(s,thumbnail=false,thumbnailFlavor=0){
 const p=thumbnail?s:storyPhase(s),time=thumbnail?0:s*STORY_DURATION,flavor=thumbnail?thumbnailFlavor:carouselIndex(time);
 if(!thumbnail)heroPhoto.style.opacity=(.55*(1-smooth(.01,.08,s))).toFixed(3);
 const mobile=camera.aspect<.8;const dark=mix(smooth(.205,.375,p)*(1-smooth(.585,.805,p)),.97,thumbnail?0:flavorPresence(time));const cut=cutMotion(p),split=cut.split,flip=cut.flip;const gesture=schmearMotion(p),spread=gesture.spread;
 backgroundMaterial.uniforms.darkness.value=dark;scene.background.copy(lightColor).lerp(darkColor,dark);
 // The board stays put while four physical bagels travel through the same studio.
 board.visible=background.visible=table.visible=crumbs.visible=bagel.visible=top.visible=bottom.visible=true;
 board.position.set(0,-.69,0);board.rotation.y=0;board.scale.set(1,1,1);table.position.y=-.74;
 crumbs.position.y=0;bagel.scale.setScalar(1);bagel.position.set(0,sample('y',null,p),0);
 bagel.rotation.set(sample('r',0,p),sample('r',1,p),sample('r',2,p));
 top.position.set(-1.6*split,cut.upperY,-.10*split);bottom.position.set(1.6*split,cut.lowerY,.10*split);
 top.rotation.set(0,-.08*flip,Math.PI*flip);bottom.rotation.set(0,.05*split,0);
 intact.visible=cut.upperY<.000001&&split===0;upper.visible=lower.visible=!intact.visible;sesame.visible=poppy.visible=salt.visible=true;pumpkin.visible=false;
 // PBR lighting stays coherent while the studio behind the product warms and dims.
 key.intensity=mix(3.5,3.7,dark);key.color.set('#ffe6c5');key.position.set(-3.8,4.5,4.0);
 fill.intensity=mix(.38,.22,dark);rim.intensity=mix(2.4,3.8,dark);ambient.intensity=mix(.48,.36,dark);renderer.toneMappingExposure=.89;
 breadMaterial.color.set(0xffffff);crumbMaterial.color.set(0xffffff);woodMat.color.set(0xc2ad8e);
 shadow.visible=true;shadow.position.set(0,-.489,0);shadow.scale.set(mix(.72,1.6,split),mix(.72,1.6,split),1);shadow.material.opacity=mix(.55,.27,smooth(.20,.31,p))*(1-smooth(.45,.66,p));
 camera.position.set(sample('c',0,p),sample('c',1,p),sample('c',2,p));look.set(sample('a',0,p),sample('a',1,p),sample('a',2,p));
 if(mobile){const front=smooth(.18,.31,p),returning=smooth(.69,.79,p),twoHalves=smooth(.44,.54,p)*(1-smooth(.716,.792,p)),hero=(1-smooth(.12,.31,p))*.78;const extra=1+hero+front*.47+twoHalves*1.1-returning*.35;camera.position.sub(look).multiplyScalar(extra).add(look);camera.position.x-=twoHalves*.4;look.x-=twoHalves*.4;}
 camera.lookAt(look);
 positionFlavors(flavor,time,mobile,thumbnail);
 bagel.updateMatrixWorld(true);
 if(mobile&&!thumbnail)frameSlicing(smooth(1.05,1.185,time)*(1-smooth(1.48,1.61,time)));
 const slicing=slicingMotion(time);breadKnife.visible=!thumbnail&&slicing.visible;
 breadKnife.position.set(slicing.x,slicing.y,slicing.z).applyMatrix4(bagel.matrixWorld);breadKnife.quaternion.copy(bagel.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,slicing.roll)));breadKnife.scale.setScalar(1);
 breadKnife.traverse(o=>{if(o.isMesh)o.castShadow=slicing.approach>.97&&slicing.withdraw<.8;});
 bottom.getWorldPosition(worldBottom);bottom.getWorldQuaternion(worldRotation);
 cream.visible=spread>.0005;cream.position.set(0,.012,0);cream.rotation.set(0,0,0);cream.scale.set(1,1,1);updateCream(spread);
 // The wrist stays on one side of the board while the working end makes a full circle.
 // All positions are reconstructed from scroll, so returning up unwinds the same stroke.
 const {approach,leave,stroke,pitch,yaw,roll,contactHeight}=gesture;
 const wrist=new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch,yaw,roll));
 const contact=new THREE.Vector3(stroke.x,contactHeight+Math.max(0,creamSurfaceHeight(stroke.x,stroke.z)-.072)*smooth(0,.18,spread),stroke.z);
 arrivalOffset.set(.55*(1-approach)+leave*.50,7*(1-approach)+leave*2.6,-1.4*(1-approach)-leave*.60);
 contact.add(arrivalOffset);
 const bladeContact=new THREE.Vector3(-.015,.020,-.50).multiplyScalar(.90).applyQuaternion(wrist);
 knife.position.copy(contact).sub(bladeContact).applyQuaternion(worldRotation).add(worldBottom);
 knife.quaternion.copy(worldRotation).multiply(wrist);knife.scale.setScalar(.90);knife.visible=p>.699&&p<.996;
 knife.traverse(o=>{if(o.isMesh)o.castShadow=approach>.97&&leave<.22;});dollopMesh.castShadow=approach>.97;
 bladeSmear.visible=spread>.045;bladeSmear.scale.set(.15,.019,.26*(.5+.5*smooth(.045,.25,spread)));
 const flatten=smooth(0,.18,spread),dollopLocal=new THREE.Vector3(stroke.x,.048,stroke.z).add(arrivalOffset);
 dollop.position.copy(dollopLocal.applyQuaternion(worldRotation).add(worldBottom));dollop.scale.set(mix(.67,.47,flatten),mix(.52,.002,flatten),mix(.67,.50,flatten));dollop.rotation.set(0,stroke.angle,-.08);dollop.visible=p>.699&&approach<1||spread<.18&&p>.699;
 arrivalOffset.applyQuaternion(worldRotation);frameSchmear(smooth(.739,.795,p)*(1-smooth(.945,.996,p)),arrivalOffset,mobile);
 postMaterial.uniforms.focus.value=camera.position.distanceTo(look)*mix(.85,1,smooth(.17,.36,p));postMaterial.uniforms.aperture.value=mix(15,7,smooth(.16,.36,p))+9*smooth(.72,.84,p);
 if(!thumbnail){blendColor.copy(lightColor).lerp(darkColor,dark);const color='#'+blendColor.getHexString();wash.style.background=`linear-gradient(0deg,${color} 0%,${color}df 10%,${color}55 31%,${color}00 62%)`;wash.style.opacity=mix(.85,.70,dark);updateCopy(p,dark,s);}
}
function render(){renderer.setRenderTarget(renderTarget);renderer.render(scene,camera);const tris=renderer.info.render.triangles;renderer.setRenderTarget(null);renderer.render(postScene,postCamera);rendered++;const c=$('#webgl');c.dataset.frame=rendered;c.dataset.progress=progress.toFixed(4);c.dataset.triangles=tris;c.dataset.motionProgress=storyPhase(progress).toFixed(4);c.dataset.carouselIndex=carouselIndex(progress*STORY_DURATION).toFixed(4);c.dataset.flavor=flavorNames[Math.round(carouselIndex(progress*STORY_DURATION))];c.dataset.split=cutMotion(storyPhase(progress)).split.toFixed(4);const gesture=schmearMotion(storyPhase(progress));c.dataset.spread=gesture.spread.toFixed(4);c.dataset.strokeAngle=gesture.stroke.angle.toFixed(4);c.dataset.contactX=gesture.stroke.x.toFixed(4);c.dataset.contactZ=gesture.stroke.z.toFixed(4);const slicing=slicingMotion(progress*STORY_DURATION);c.dataset.slicing=slicing.cut.toFixed(4);c.dataset.slicingVisible=String(slicing.visible);c.dataset.slicingX=slicing.x.toFixed(4);c.dataset.slicingZ=slicing.z.toFixed(4);}
function makeThumbnails(){const oldAspect=camera.aspect;renderer.setPixelRatio(1);renderer.setSize(1200,900,false);renderTarget.setSize(1200,900);postMaterial.uniforms.resolution.value.set(1200,900);camera.aspect=1200/900;camera.updateProjectionMatrix();
 const shot=(p,ids,adjust,flavor=0)=>{pose(p,true,flavor);if(adjust)adjust();render();const data=renderer.domElement.toDataURL('image/jpeg',.91);ids.forEach(id=>$(id).src=data);};
 shot(.16,['#classic-image'],()=>{camera.position.set(.45,2.05,5.6);camera.lookAt(0,-.28,0);backgroundMaterial.uniforms.darkness.value=.60;});
 shot(.16,['#poppy-image'],()=>{camera.position.set(.45,2.05,5.6);camera.lookAt(0,-.28,0);backgroundMaterial.uniforms.darkness.value=.60;},1);
 shot(.16,['#raisin-image'],()=>{camera.position.set(.45,2.05,5.6);camera.lookAt(0,-.28,0);backgroundMaterial.uniforms.darkness.value=.60;},2);
 shot(.16,['#plain-image'],()=>{camera.position.set(.45,2.05,5.6);camera.lookAt(0,-.28,0);backgroundMaterial.uniforms.darkness.value=.60;},3);
 camera.aspect=oldAspect;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));resize();thumbsMade=true;dirty=true;pose(progress);
}
let lastFrameTime=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.06);last=now;if(document.hidden)return;const delta=target-progress;if(Math.abs(delta)>.000008){progress=reduceMotion?target:progress+delta*(1-Math.exp(-dt*11));dirty=true;}else if(progress!==target){progress=target;dirty=true;}if(dirty){if(scrollY<=travel+height){pose(progress);render();}dirty=false;lastFrameTime=now;}if(!thumbsMade&&photoReady&&woodReady&&crumbReady&&cinnamonReady&&rendered>0&&now>900){makeThumbnails();$('#loading').classList.add('done');$('#loading').setAttribute('aria-hidden','true');}}
resize();progress=target;pose(progress);render();requestAnimationFrame(frame);
$('#webgl').addEventListener('webglcontextlost',e=>{e.preventDefault();showStaticHero();});$('#webgl').addEventListener('webglcontextrestored',()=>location.reload());window.addEventListener('pageshow',()=>{dirty=true;resize();});
})();
