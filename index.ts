import { Client, OAuth1 } from "@xdevplatform/xdk"

const oauth1 = new OAuth1({
  apiKey: Bun.env.X_API_KEY!,
  apiSecret: Bun.env.X_API_KEY_SECRET!,
  accessToken: Bun.env.X_ACCESS_TOKEN!,
  accessTokenSecret: Bun.env.X_ACCESS_TOKEN_SECRET!,
  callback: "oob"
})

const client = new Client({ oauth1 })

// Look up our own user ID
const me = await client.users.getMe({
  userFields: ["id", "name", "username"]
})

if (!me.data) {
  console.error("Failed to fetch authenticated user:", me.errors)
  process.exit(1)
}

console.log(`Logged in as @${me.data.username} (${me.data.id})`)

// Fetch home timeline
const timeline = await client.users.getTimeline(me.data.id, {
  maxResults: 10,
  tweetFields: ["created_at", "author_id", "text", "public_metrics"],
  exclude: ["retweets"]
})

if (!timeline.data) {
  console.error("Failed to fetch timeline:", timeline.errors)
  process.exit(1)
}

console.info(`Fetched ${timeline.data.length} tweets:\n`)

for (const tweet of timeline.data) {
  const t = tweet as Record<string, unknown>
  const date = new Date(t.createdAt as string).toLocaleString()
  console.log(`--- ${date} ---`)
  console.log(t.text)
  console.log()
}
