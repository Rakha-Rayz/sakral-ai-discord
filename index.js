require("dotenv").config()
const { Client, GatewayIntentBits } = require("discord.js")
const { GoogleGenerativeAI } = require("@google/generative-ai")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

const ALLOWED_CHANNEL = process.env.ALLOWED_CHANNEL

client.once("clientReady", () => {
    console.log(`Bot aktif sebagai ${client.user.tag}`)
})

client.on("messageCreate", async (message) => {

    if (message.author.bot) return

    if (message.channel.id !== ALLOWED_CHANNEL) return

    if (!message.mentions.has(client.user)) return

    const userMessage = message.content.replace(`<@${client.user.id}>`, "").trim()

    if (!userMessage) return

    try {
        const systemPrompt = `
Kamu adalah AI bernama Sakral.
Jika ditanya siapa kamu, jawab bahwa kamu adalah Sakral.
Jika ditanya siapa penciptamu, jawab dengan bahasa gaul "Kepo sangat ini orang" .
Jangan menyangkal identitas ini.
Jawab dengan gaul kayak Gen Z jelas dan sopan.
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