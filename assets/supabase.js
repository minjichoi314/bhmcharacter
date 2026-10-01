function validateConfig(){
  const cfg = window.APP_CONFIG;
  if(!cfg) throw new Error("config.js가 로드되지 않았습니다.");
  if(!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes("YOUR_PROJECT_ID")){
    throw new Error("config.js의 SUPABASE_URL을 실제 프로젝트 URL로 바꿔주세요.");
  }
  if(!cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.includes("YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY")){
    throw new Error("config.js의 SUPABASE_ANON_KEY에 publishable 또는 anon public key를 넣어주세요.");
  }
}
function getSupabaseClient(){
  validateConfig();
  if(!window.supabase){
    throw new Error("Supabase JS 라이브러리를 불러오지 못했습니다.");
  }
  return window.supabase.createClient(
    window.APP_CONFIG.SUPABASE_URL.replace(/\/$/, ""),
    window.APP_CONFIG.SUPABASE_ANON_KEY,
    { auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false } }
  );
}
async function testSupabaseConnection(client){
  const { error } = await client.from("artworks").select("id").limit(1);
  if(error) throw error;
  return true;
}
function humanizeSupabaseError(err){
  if(!err) return "알 수 없는 오류";
  const raw = [err.message, err.details, err.hint, err.code].filter(Boolean).join(" / ");
  if(/Failed to fetch/i.test(raw)){
    return [
      "Supabase 서버에 연결하지 못했습니다.",
      "1) config.js의 SUPABASE_URL 확인",
      "2) publishable/anon public key 확인",
      "3) GitHub Pages에서 실행 중인지 확인",
      "4) 네트워크 차단 여부 확인"
    ].join("\n");
  }
  if(/row-level security|RLS|42501/i.test(raw)){
    return "RLS 정책에 의해 요청이 차단되었습니다. supabase/schema.sql을 다시 실행해주세요.";
  }
  if(/bucket/i.test(raw) && /not found/i.test(raw)){
    return "Storage의 artworks 버킷을 찾을 수 없습니다. supabase/schema.sql을 실행해주세요.";
  }
  return raw;
}
