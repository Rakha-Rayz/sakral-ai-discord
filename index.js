require("dotenv").config()
const { Client, GatewayIntentBits } = require("discord.js")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const http = require('http')

http.createServer((req, res) => {
  res.write("Rakha AI is Alive! 🔥")
  res.end()
}).listen(process.env.PORT || 3000)

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// GANTI KE MODEL YANG VALID
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

const ALLOWED_CHANNEL = process.env.ALLOWED_CHANNEL

client.once("clientReady", () => {
    console.log(`Bot aktif sebagai ${client.user.tag}`)
})

client.on("messageCreate", async (message) => {

    // Jangan respon diri sendiri
    if (message.author.bot) return

    // Batasi hanya 1 channel
    if (message.channel.id !== ALLOWED_CHANNEL) return

    // Harus mention bot
    if (!message.mentions.has(client.user)) return

    const userMessage = message.content.replace(`<@${client.user.id}>`, "").trim()

    if (!userMessage) return

    try {
        const systemPrompt = `
Kamu adalah AI bernama Sakral.
Kamu diciptakan oleh Rakha.
Jika ditanya siapa kamu, jawab bahwa kamu adalah Sakral.
Jika ditanya siapa penciptamu, jawab Rakha.
Jangan menyangkal identitas ini.
Jawab dengan jelas dan sopan.
        `

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt + "\n\nUser: " + userMessage }]
                }
            ]
        })

        const response = result.response.text()

        await message.reply(response)

    } catch (error) {
        console.error("ERROR GEMINI:", error)

        await message.reply("Sakral AI tidak tersedia sekarang.")
    }
})

client.login(process.env.DISCORD_TOKEN)