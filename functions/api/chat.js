export async function onRequestPost(context) {
  try {
    // 1. 获取前端发来的聊天内容
    const body = await context.request.json();

    // 2. 从 Cloudflare 的保险箱拿到 API Key
    const apiKey = context.env.GROQ_API_KEY; 

    // 3. 后端代替你，去向 Groq 发起请求（这里没有跨域限制！）
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    // 4. 把大模型的回答原封不动返回给前端
    const data = await groqResponse.text();
    return new Response(data, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
