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

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    if (body.password !== context.env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "口令错误，拒绝访问！" }), { status: 401 });
    }

    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    const insertData = {
      singer: body.singer,
      title: body.title,
      bvid: body.bvid,
      cover_url: body.cover_url,
      description: body.description
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/songs`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(insertData)
    });

    if (!response.ok) throw new Error("数据库写入失败");

    return new Response(JSON.stringify({ success: true, message: "音乐上架成功！前台已自动生成标签。" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
