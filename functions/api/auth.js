// ==========================================
// 访客通行证中心：自动处理登录与静默注册
// ==========================================
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    // 1. 去户籍库(users表)查查有没有这个名字
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/users?username=eq.${encodeURIComponent(body.username)}&select=*`, {
      headers: { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` }
    });
    const users = await checkRes.json();

    if (users.length > 0) {
      // 🚨 情况 A：老用户回归，核对密码
      if (users[0].password !== body.password) {
        return new Response(JSON.stringify({ error: "密码错误，你是不是冒充的？" }), { status: 401 });
      }
      // 密码正确，放行并返回他的专属头像
      return new Response(JSON.stringify({ 
        success: true, 
        message: "欢迎回来！", 
        avatar_url: users[0].avatar_url 
      }), { headers: { "Content-Type": "application/json" } });
      
    } else {
      // ✨ 情况 B：新面孔，自动帮他注册入库
      const defaultAvatar = body.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${body.username}`;
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({ 
          username: body.username, 
          password: body.password, 
          avatar_url: defaultAvatar 
        })
      });

      if (!insertRes.ok) throw new Error("注册新通行证失败");

      return new Response(JSON.stringify({ 
        success: true, 
        message: "新通行证注册成功！", 
        avatar_url: defaultAvatar 
      }), { headers: { "Content-Type": "application/json" } });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
