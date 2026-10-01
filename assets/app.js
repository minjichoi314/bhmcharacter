const cfg = window.APP_CONFIG;
let sb;
try{ sb = getSupabaseClient(); }catch(err){ alert(err.message); throw err; }

const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const eraserBtn = document.getElementById("eraserBtn");
const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");
const messageInput = document.getElementById("message");
const counter = document.getElementById("counter");
const consent = document.getElementById("consent");
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("status");
const debugEl = document.getElementById("debug");

let drawing = false;
let erasing = false;
let history = [];
const MAX_HISTORY = 25;

function setStatus(message, type=""){
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}
function setDebug(message){
  if(debugEl) debugEl.textContent = message;
}
function initCanvas(){
  ctx.save();
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  history = [canvas.toDataURL("image/png")];
}
initCanvas();

function point(e){
  const r = canvas.getBoundingClientRect();
  return { x:(e.clientX-r.left)*(canvas.width/r.width), y:(e.clientY-r.top)*(canvas.height/r.height) };
}
function saveHistory(){
  history.push(canvas.toDataURL("image/png"));
  if(history.length > MAX_HISTORY) history.shift();
}
function restore(data){
  const img = new Image();
  img.onload = ()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
  img.src = data;
}

canvas.addEventListener("pointerdown", e=>{
  drawing = true;
  const p = point(e);
  ctx.beginPath();
  ctx.moveTo(p.x,p.y);
  canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener("pointermove", e=>{
  if(!drawing) return;
  const p = point(e);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Number(brushSize.value);
  ctx.strokeStyle = erasing ? "#f5f5f5" : colorPicker.value;
  ctx.lineTo(p.x,p.y);
  ctx.stroke();
});
["pointerup","pointercancel","pointerleave"].forEach(ev=>{
  canvas.addEventListener(ev, ()=>{
    if(!drawing) return;
    drawing = false;
    ctx.closePath();
    saveHistory();
  });
});

eraserBtn.addEventListener("click", ()=>{
  erasing = !erasing;
  eraserBtn.classList.toggle("active", erasing);
  eraserBtn.textContent = erasing ? "펜으로 전환" : "지우개";
});
undoBtn.addEventListener("click", ()=>{
  if(history.length <= 1) return;
  history.pop();
  restore(history.at(-1));
});
clearBtn.addEventListener("click", ()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  saveHistory();
});
messageInput.addEventListener("input", ()=>{
  counter.textContent = `${messageInput.value.length} / 180`;
});

function canvasToBlob(){
  return new Promise((resolve, reject)=>{
    canvas.toBlob(blob=> blob ? resolve(blob) : reject(new Error("캔버스 이미지를 만들지 못했습니다.")), "image/webp", 0.88);
  });
}
function randomId(){
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function deviceId(){
  let id = localStorage.getItem("festival-device-id");
  if(!id){ id = randomId(); localStorage.setItem("festival-device-id", id); }
  return id;
}
async function preflight(){
  try{
    setDebug("Supabase 연결 확인 중...");
    await testSupabaseConnection(sb);
    setDebug(`연결 정상 · event=${cfg.EVENT_ID}`);
  }catch(err){
    console.error(err);
    setDebug("연결 확인 실패: " + humanizeSupabaseError(err));
  }
}
preflight();

async function submitArtwork(){
  if(!consent.checked){
    setStatus("공개 동의를 체크해주세요.", "error");
    return;
  }
  submitBtn.disabled = true;
  setStatus("업로드 중입니다...");
  let uploadedPath = null;

  try{
    await testSupabaseConnection(sb);
    const id = randomId();
    const blob = await canvasToBlob();
    const path = `${cfg.EVENT_ID}/${id}.webp`;
    uploadedPath = path;

    const { error: uploadError } = await sb.storage.from("artworks").upload(path, blob, {
      contentType:"image/webp", upsert:false, cacheControl:"3600"
    });
    if(uploadError) throw uploadError;

    const { data: publicData } = sb.storage.from("artworks").getPublicUrl(path);
    const imageUrl = publicData?.publicUrl;
    if(!imageUrl) throw new Error("이미지 공개 URL 생성에 실패했습니다.");

    const payload = {
      id,
      event_id:cfg.EVENT_ID,
      title:"축제 참여 작품",
      message:messageInput.value.trim(),
      image_url:imageUrl,
      storage_path:path,
      device_id:deviceId(),
      status:cfg.AUTO_APPROVE ? "approved" : "pending"
    };
    const { error: insertError } = await sb.from("artworks").insert(payload);
    if(insertError) throw insertError;

    setStatus("전시장에 등록되었습니다.", "ok");
    showSuccess(payload);
  }catch(err){
    console.error(err);
    if(uploadedPath){
      try{ await sb.storage.from("artworks").remove([uploadedPath]); }catch(cleanupErr){ console.warn(cleanupErr); }
    }
    setStatus("업로드 실패:\n" + humanizeSupabaseError(err), "error");
  }finally{
    submitBtn.disabled = false;
  }
}
submitBtn.addEventListener("click", submitArtwork);

function showSuccess(item){
  document.getElementById("successImage").src = item.image_url;
  document.getElementById("successTitle").textContent = "전시장에 전시되었어요!";
  document.getElementById("successMessage").textContent = item.message || "참여해주셔서 감사합니다.";
  document.getElementById("success").classList.add("show");

  let n = Number(cfg.AUTO_RESET_SECONDS || 8);
  const label = document.getElementById("countdown");
  label.textContent = n;
  const timer = setInterval(()=>{
    n--;
    label.textContent = n;
    if(n <= 0){
      clearInterval(timer);
      resetForNext();
    }
  }, 1000);

  document.getElementById("nextBtn").onclick = ()=>{
    clearInterval(timer);
    resetForNext();
  };
}
function resetForNext(){
  document.getElementById("success").classList.remove("show");
  messageInput.value = "";
  consent.checked = false;
  counter.textContent = "0 / 180";
  setStatus("");
  initCanvas();
}
