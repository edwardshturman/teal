import { Client, OAuth1 } from "@xdevplatform/xdk"

import { Timeline } from "@/components/Timeline"

async function getTimeline() {
  const oauth1 = new OAuth1({
    apiKey: process.env.X_API_KEY!,
    apiSecret: process.env.X_API_KEY_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET!,
    callback: "oob"
  })

  const client = new Client({ oauth1 })

  const me = await client.users.getMe({
    userFields: ["id", "name", "username"]
  })

  if (!me.data) {
    throw new Error("Failed to fetch authenticated user")
  }

  const timeline = await client.users.getTimeline(me.data.id, {
    maxResults: 10,
    tweetFields: ["created_at", "author_id", "text", "public_metrics"],
    exclude: ["retweets"]
  })

  if (!timeline.data) {
    throw new Error("Failed to fetch timeline")
  }

  return timeline.data.map((tweet) => {
    const t = tweet as Record<string, unknown>
    const metrics = t.publicMetrics as Record<string, number> | undefined
    return {
      id: t.id as string,
      text: t.text as string,
      createdAt: t.createdAt as string,
      likes: metrics?.likeCount ?? 0,
      retweets: metrics?.retweetCount ?? 0,
      replies: metrics?.replyCount ?? 0
    }
  })
}

export default async function Home() {
  const tweets = await getTimeline()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex w-full max-w-xl flex-col gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <Timeline tweets={tweets} />
      </main>
    </div>
  )
}
