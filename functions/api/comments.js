// ==========================================
// 留言枢纽：拉取留言 (GET) + 抓取IP并保存留言 (POST)
// ==========================================

// 人格 1：当前端来拿留言时 (GET)
export async function onRequestGet(context) {
  try {
    // 获取前端问的是哪首歌/哪张照片的留言？
    const { searchParams } = new URL(context.request.url);
    const target_id = searchParams.get('target_id');
    if (!target_id) return new Response("缺少目标ID", { status: 400 });

    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    // 去数据库把对应目标的所有留言捞出来 (按时间从新到旧排)
    const res = await fetch(`${supabaseUrl}/rest/v1/comments?target_id=eq.${encodeURIComponent(target_id)}&order=created_at.desc`, {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    
    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// 人格 2：当前端发来新留言时 (POST)
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    // 📡 极客黑科技：拦截请求，解析 Cloudflare 底层自带的 IP 位置信息！
    const cf = context.request.cf || {};
    const province = cf.region || '';
    const city = cf.city || '';
    // 拼接成 "湖北省 武汉市"，如果他开代理隐身了，就显示 "未知星域"
    const ip_location = province || city ? `${province} ${city}`.trim() : '未知星域';

    const insertData = {
      target_id: body.target_id,
      username: body.username,
      avatar_url: body.avatar_url,
      content: body.content,
      ip_location: ip_location // 把截获的属地一起塞进数据库！
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/comments`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(insertData)
    });

    if (!res.ok) throw new Error("数据库拒收留言");

    return new Response(JSON.stringify({ success: true, message: "留言发射成功！" }), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
