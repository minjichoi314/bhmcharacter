function validateConfig(){
  const cfg = window.APP_CONFIG;

  if(!cfg){
    throw new Error("config.js가 로드되지 않았습니다.");
  }

  if(
    !cfg.SUPABASE_URL ||
    !/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/?$/.test(cfg.SUPABASE_URL)
  ){
    throw new Error("SUPABASE_URL 형식이 잘못되었습니다.");
  }

  if(!cfg.SUPABASE_ANON_KEY){
    throw new Error("Supabase Publishable key가 없습니다.");
  }
}

function getSupabaseClient(){
  validateConfig();

  if(!window.supabase){
    throw new Error("Supabase 라이브러리를 불러오지 못했습니다.");
  }

  return window.supabase.createClient(
    window.APP_CONFIG.SUPABASE_URL.replace(/\/$/, ""),
    window.APP_CONFIG.SUPABASE_ANON_KEY,
    {
      auth:{
        persistSession:false,
        autoRefreshToken:false,
        detectSessionInUrl:false
      }
    }
  );
}

async function testSupabaseConnection(client){
  const { error } = await client
    .from("artworks")
    .select("id")
    .limit(1);

  if(error) throw error;
  return true;
}

function humanizeSupabaseError(err){
  if(!err) return "알 수 없는 오류";

  const raw = [
    err.message,
    err.details,
    err.hint,
    err.code
  ].filter(Boolean).join(" / ");

  if(/Failed to fetch/i.test(raw)){
    return "Supabase 서버에 연결하지 못했습니다. 네트워크 연결을 확인해주세요.";
  }

  if(/row-level security|RLS|42501/i.test(raw)){
    return "RLS 정책에 의해 차단되었습니다. supabase/schema.sql을 다시 실행해주세요.";
  }

  if(/bucket/i.test(raw) && /not found/i.test(raw)){
    return "artworks Storage 버킷이 없습니다. supabase/schema.sql을 실행해주세요.";
  }

  return raw;
}
