export async function onRequestGet(context) {
  try {
    // 1. 从保险箱拿出 Supabase 的钥匙
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    // 2. 去 Supabase 冰箱的 photos 表里拿数据（按上传时间倒序，最新的在最前面）
    const response = await fetch(`${supabaseUrl}/rest/v1/photos?select=*&order=created_at.desc`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });

    // 3. 把拿到的照片盲盒打包
    const data = await response.json();
    
    // 4. 原封不动地送给前端大堂
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
