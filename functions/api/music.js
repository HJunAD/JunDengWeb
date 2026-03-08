export async function onRequestGet(context) {
  try {
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    // 2. ⚠️ 这里改成了去 songs 表里拿数据
    const response = await fetch(`${supabaseUrl}/rest/v1/songs?select=*&order=created_at.desc`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
