function validateConfig(){
  const cfg = window.APP_CONFIG;

  if(!cfg){
    throw new Error("config.js가 로드되지 않았습니다.");
  }

  if(
    !cfg.SUPABASE_REST_URL ||
    !/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/rest\/v1\/?$/.test(cfg.SUPABASE_REST_URL)
  ){
    throw new Error("SUPABASE_REST_URL 형식이 잘못되었습니다.");
  }

  if(
    !cfg.SUPABASE_PUBLISHABLE_KEY ||
    cfg.SUPABASE_PUBLISHABLE_KEY === "PASTE_VALID_PUBLISHABLE_KEY_HERE"
  ){
    throw new Error("config.js에 실제 Publishable key를 넣어주세요.");
  }
}

function restBaseUrl(){
  validateConfig();
  return window.APP_CONFIG.SUPABASE_REST_URL.replace(/\/?$/, "/");
}

function projectOrigin(){
  validateConfig();
  return new URL(window.APP_CONFIG.SUPABASE_REST_URL).origin;
}

function apiKey(){
  validateConfig();
  return window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY.trim();
}

function apiHeaders(extra = {}){
  return {
    "apikey": apiKey(),
    ...extra
  };
}

async function parseErrorResponse(response){
  const bodyText = await response.text().catch(()=> "");
  let message = bodyText || `${response.status} ${response.statusText}`;

  try{
    const json = JSON.parse(bodyText);
    message = [
      json.message,
      json.error_description,
      json.error,
      json.hint,
      json.code
    ].filter(Boolean).join(" / ") || message;
  }catch(_){}

  const err = new Error(message);
  err.status = response.status;
  throw err;
}

async function testSupabaseConnection(){
  const response = await fetch(
    `${restBaseUrl()}artworks?select=id&limit=1`,
    {
      method:"GET",
      headers:apiHeaders({
        "Accept":"application/json"
      })
    }
  );

  if(!response.ok){
    await parseErrorResponse(response);
  }

  return true;
}

async function uploadArtworkBlob(path,blob){
  const encodedPath = path
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const response = await fetch(
    `${projectOrigin()}/storage/v1/object/artworks/${encodedPath}`,
    {
      method:"POST",
      headers:apiHeaders({
        "Content-Type":"image/webp",
        "x-upsert":"false"
      }),
      body:blob
    }
  );

  if(!response.ok){
    await parseErrorResponse(response);
  }

  return `${projectOrigin()}/storage/v1/object/public/artworks/${encodedPath}`;
}

async function deleteArtworkObject(path){
  const encodedPath = path
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const response = await fetch(
    `${projectOrigin()}/storage/v1/object/artworks/${encodedPath}`,
    {
      method:"DELETE",
      headers:apiHeaders()
    }
  );

  if(!response.ok){
    await parseErrorResponse(response);
  }
}

async function insertArtworkRow(payload){
  const response = await fetch(
    `${restBaseUrl()}artworks`,
    {
      method:"POST",
      headers:apiHeaders({
        "Content-Type":"application/json",
        "Prefer":"return=minimal"
      }),
      body:JSON.stringify(payload)
    }
  );

  if(!response.ok){
    await parseErrorResponse(response);
  }
}

async function fetchApprovedArtworks(eventId,limit=100){
  const params = new URLSearchParams();
  params.set("select","id,image_url,created_at");
  params.set("event_id",`eq.${eventId}`);
  params.set("status","eq.approved");
  params.set("order","created_at.desc");
  params.set("limit",String(limit));

  const response = await fetch(
    `${restBaseUrl()}artworks?${params.toString()}`,
    {
      method:"GET",
      headers:apiHeaders({
        "Accept":"application/json"
      })
    }
  );

  if(!response.ok){
    await parseErrorResponse(response);
  }

  return await response.json();
}

function humanizeSupabaseError(err){
  if(!err) return "알 수 없는 오류";

  const raw = String(err.message || err);

  if(/실제 Publishable key/i.test(raw)){
    return raw;
  }

  if(/Invalid Compact JWS|Invalid JWT/i.test(raw)){
    return "Publishable key가 JWT처럼 처리되고 있습니다. 이 코드는 Authorization 헤더를 사용하지 않으므로, config.js의 키 자체를 다시 확인해주세요.";
  }

  if(/Invalid API key|AccessDenied/i.test(raw)){
    return "현재 Publishable key가 이 Supabase 프로젝트에서 유효하지 않습니다. Settings → API Keys → Publishable key의 복사 버튼으로 전체 키를 다시 복사해주세요.";
  }

  if(/Could not find the table.*artworks|PGRST205/i.test(raw)){
    return "public.artworks 테이블이 없습니다. supabase/schema.sql을 SQL Editor에서 실행해주세요.";
  }

  if(/row-level security|RLS|42501/i.test(raw)){
    return "RLS 정책에 의해 차단되었습니다. supabase/schema.sql을 다시 실행해주세요.";
  }

  if(/bucket.*not found/i.test(raw)){
    return "artworks Storage 버킷이 없습니다. supabase/schema.sql을 실행해주세요.";
  }

  if(/Failed to fetch/i.test(raw)){
    return "Supabase 서버에 연결하지 못했습니다. 네트워크 또는 REST URL을 확인해주세요.";
  }

  return raw;
}
