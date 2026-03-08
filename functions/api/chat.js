export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const apiKey = context.env.GROQ_API_KEY; 

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await groqResponse.text();
    
    //把 Groq 的真实状态码 (status) 原封不动还给前端
    return new Response(data, {
      status: groqResponse.status, 
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
