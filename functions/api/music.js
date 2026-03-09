// ==========================================
// 音乐 API 枢纽 (包含拉取、上传与安全抹除)
// ==========================================

// 辅助函数：核实站长权限
async function verifyAdmin(username, supabaseUrl, supabaseKey) {
    if (!username) return false;
    const res = await fetch(`${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(username)}&select=role`, {
        headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    const users = await res.json();
    return users.length > 0 && users[0].role === 'admin';
}

// 1. 获取音乐 (所有人均可)
export async function onRequestGet(context) {
    const { env } = context;
    try {
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/songs?select=*&order=id.desc`, { // 如果你的表名不是 songs 请修改这里
            headers: { "apikey": env.SUPABASE_ANON_KEY, "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}` }
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
    } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500 }); }
}

// 2. 上架音乐 (仅限站长)
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        
        // 🚨 核心安全防御
        const isAdmin = await verifyAdmin(body.admin_user, env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        if (!isAdmin) return new Response(JSON.stringify({ error: "非法越权：你不是系统站长！" }), { status: 403 });

        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/songs`, { // 如果你的表名不是 songs 请修改这里
            method: "POST",
            headers: { "apikey": env.SUPABASE_ANON_KEY, "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
            body: JSON.stringify({ 
                singer: body.singer, title: body.title, 
                bvid: body.bvid, cover_url: body.cover_url, description: body.description 
            })
        });

        if (!res.ok) throw new Error("写入数据库失败");
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500 }); }
}

// 3. 抹除音乐 (仅限站长)
export async function onRequestDelete(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        
        // 🚨 核心安全防御
        const isAdmin = await verifyAdmin(body.admin_user, env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        if (!isAdmin) return new Response(JSON.stringify({ error: "非法越权：你没有抹除权限！" }), { status: 403 });

        if (!body.id) throw new Error("缺少要抹除的目标 ID");

        // 呼叫 Supabase 执行物理删除
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/songs?id=eq.${body.id}`, { // 如果你的表名不是 songs 请修改这里
            method: "DELETE",
            headers: { "apikey": env.SUPABASE_ANON_KEY, "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}` }
        });

        if (!res.ok) throw new Error("云端抹除失败");
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500 }); }
}
