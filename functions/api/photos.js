// ==========================================
// 影像 API 枢纽 (包含拉取、上传与安全抹除)
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

// 1. 获取照片 (所有人均可)
export async function onRequestGet(context) {
    const { env } = context;
    try {
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/photos?select=*&order=id.desc`, {
            headers: { "apikey": env.SUPABASE_ANON_KEY, "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}` }
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
    } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500 }); }
}

// 2. 上传照片 (仅限站长)
export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        
        // 🚨 核心安全防御：核对站长身份
        const isAdmin = await verifyAdmin(body.admin_user, env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        if (!isAdmin) return new Response(JSON.stringify({ error: "非法越权：你不是系统站长！" }), { status: 403 });

        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/photos`, {
            method: "POST",
            headers: { "apikey": env.SUPABASE_ANON_KEY, "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" },
            body: JSON.stringify({ image_url: body.image_url, caption: body.caption })
        });

        if (!res.ok) throw new Error("写入数据库失败");
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500 }); }
}

// 3. 抹除照片 (仅限站长)
export async function onRequestDelete(context) {
    const { request, env } = context;
    try {
        const body = await request.json();
        
        // 🚨 核心安全防御：核对站长身份
        const isAdmin = await verifyAdmin(body.admin_user, env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        if (!isAdmin) return new Response(JSON.stringify({ error: "非法越权：你没有抹除权限！" }), { status: 403 });

        if (!body.id) throw new Error("缺少要抹除的目标 ID");

        // 呼叫 Supabase 执行物理删除
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/photos?id=eq.${body.id}`, {
            method: "DELETE",
            headers: { "apikey": env.SUPABASE_ANON_KEY, "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}` }
        });

        if (!res.ok) throw new Error("云端抹除失败");
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500 }); }
}
