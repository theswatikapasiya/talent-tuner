const { OpenAI } = require("openai");
require("dotenv").config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log("Success:", chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error("OpenAI Error:", err.message);
  }
}
test();
