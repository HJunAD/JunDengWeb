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


// ==========================================
// 站长专属通道：接收并验证数据，存入数据库
// ==========================================
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    // 1. 赛博保安：核对暗号
    if (body.password !== context.env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "口令错误，拒绝访问！" }), { status: 401 });
    }

    // 2. 拿到 Supabase 的钥匙
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    // 3. 把你传来的照片信息打包
    const insertData = {
      image_url: body.image_url,
      caption: body.caption
    };

    // 4. 拿着钥匙，强行写入 Supabase 的 photos 表
    const response = await fetch(`${supabaseUrl}/rest/v1/photos`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal" // 告诉数据库：存进去就行，不用啰嗦
      },
      body: JSON.stringify(insertData)
    });

    if (!response.ok) throw new Error("数据库写入失败");

    // 5. 告诉密室：搞定！
    return new Response(JSON.stringify({ success: true, message: "照片发布成功！前台已更新。" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
