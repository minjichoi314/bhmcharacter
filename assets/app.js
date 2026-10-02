const cfg = window.APP_CONFIG;
let sb;
try{ sb=getSupabaseClient(); }catch(err){ alert(err.message); throw err; }
const canvas=document.getElementById("drawCanvas");
const ctx=canvas.getContext("2d",{willReadFrequently:true});
const brushSize=document.getElementById("brushSize");
const eraserBtn=document.getElementById("eraserBtn");
const undoBtn=document.getElementById("undoBtn");
const clearBtn=document.getElementById("clearBtn");
const submitBtn=document.getElementById("submitBtn");
const statusEl=document.getElementById("status");
const debugEl=document.getElementById("debug");
const paletteButtons=[...document.querySelectorAll(".color-dot")];
let currentColor="#222222",drawing=false,erasing=false,history=[];
const MAX_HISTORY=30;
function setStatus(m,t=""){statusEl.textContent=m;statusEl.className=`status ${t}`.trim();}
function setDebug(m){if(debugEl)debugEl.textContent=m;}
function fillWhite(){ctx.save();ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();}
function initCanvas(){ctx.clearRect(0,0,canvas.width,canvas.height);fillWhite();history=[canvas.toDataURL("image/png")];}
initCanvas();
function getPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height)};}
function saveHistory(){history.push(canvas.toDataURL("image/png"));if(history.length>MAX_HISTORY)history.shift();}
function restore(data){const img=new Image();img.onload=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0);};img.src=data;}
function startDraw(e){if(e.pointerType==="mouse"&&e.button!==0)return;e.preventDefault();drawing=true;const p=getPoint(e);ctx.beginPath();ctx.moveTo(p.x,p.y);try{canvas.setPointerCapture(e.pointerId);}catch(_){}}
function draw(e){if(!drawing)return;e.preventDefault();const p=getPoint(e);ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=Number(brushSize.value);ctx.strokeStyle=erasing?"#ffffff":currentColor;ctx.lineTo(p.x,p.y);ctx.stroke();}
function endDraw(e){if(!drawing)return;e?.preventDefault?.();drawing=false;ctx.closePath();saveHistory();try{if(e&&canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);}catch(_){}}
canvas.addEventListener("pointerdown",startDraw,{passive:false});
canvas.addEventListener("pointermove",draw,{passive:false});
canvas.addEventListener("pointerup",endDraw,{passive:false});
canvas.addEventListener("pointercancel",endDraw,{passive:false});
window.addEventListener("pointerup",endDraw,{passive:false});
paletteButtons.forEach(btn=>btn.addEventListener("click",()=>{currentColor=btn.dataset.color;erasing=false;eraserBtn.classList.remove("active");eraserBtn.textContent="지우개";paletteButtons.forEach(b=>b.classList.remove("selected"));btn.classList.add("selected");}));
eraserBtn.addEventListener("click",()=>{erasing=!erasing;eraserBtn.classList.toggle("active",erasing);eraserBtn.textContent=erasing?"펜으로":"지우개";});
undoBtn.addEventListener("click",()=>{if(history.length<=1)return;history.pop();restore(history.at(-1));});
clearBtn.addEventListener("click",()=>{ctx.clearRect(0,0,canvas.width,canvas.height);fillWhite();saveHistory();});
function canvasToBlob(){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("그림 이미지를 만들지 못했습니다.")),"image/webp",0.92));}
function randomId(){return crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;}
function deviceId(){let id=localStorage.getItem("festival-device-id");if(!id){id=randomId();localStorage.setItem("festival-device-id",id);}return id;}
async function preflight(){try{setDebug("연결 확인 중...");await testSupabaseConnection(sb);setDebug("연결 정상");}catch(err){console.error(err);setDebug("연결 확인 실패 · "+humanizeSupabaseError(err));}}
preflight();
async function submitArtwork(){submitBtn.disabled=true;setStatus("디지털 갤러리에 전송 중입니다...");let uploadedPath=null;try{await testSupabaseConnection(sb);const id=randomId();const blob=await canvasToBlob();const path=`${cfg.EVENT_ID}/${id}.webp`;uploadedPath=path;const{error:uploadError}=await sb.storage.from("artworks").upload(path,blob,{contentType:"image/webp",cacheControl:"3600",upsert:false});if(uploadError)throw uploadError;const{data:publicData}=sb.storage.from("artworks").getPublicUrl(path);const imageUrl=publicData?.publicUrl;if(!imageUrl)throw new Error("이미지 공개 URL 생성에 실패했습니다.");const payload={id,event_id:cfg.EVENT_ID,title:"축제 참여 작품",message:"",image_url:imageUrl,storage_path:path,device_id:deviceId(),status:cfg.AUTO_APPROVE?"approved":"pending"};const{error:insertError}=await sb.from("artworks").insert(payload);if(insertError)throw insertError;setStatus("전시되었습니다!","ok");showSuccess(payload);}catch(err){console.error(err);if(uploadedPath){try{await sb.storage.from("artworks").remove([uploadedPath]);}catch(_){}}setStatus("업로드 실패:
"+humanizeSupabaseError(err),"error");}finally{submitBtn.disabled=false;}}
submitBtn.addEventListener("click",submitArtwork);
function showSuccess(item){document.getElementById("successImage").src=item.image_url;document.getElementById("success").classList.add("show");let n=Number(cfg.AUTO_RESET_SECONDS||10);const label=document.getElementById("countdown");label.textContent=n;const timer=setInterval(()=>{n-=1;label.textContent=n;if(n<=0){clearInterval(timer);resetForNext();}},1000);document.getElementById("nextBtn").onclick=()=>{clearInterval(timer);resetForNext();};}
function resetForNext(){document.getElementById("success").classList.remove("show");setStatus("");initCanvas();}
