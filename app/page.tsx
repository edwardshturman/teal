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
    tweetFields: [
      "created_at",
      "author_id",
      "text",
      "public_metrics",
      "entities"
    ],
    expansions: ["author_id", "attachments.media_keys"],
    userFields: ["name", "username"],
    mediaFields: [
      "type",
      "url",
      "preview_image_url",
      "width",
      "height",
      "alt_text"
    ],
    exclude: ["retweets"]
  })

  if (!timeline.data) {
    throw new Error("Failed to fetch timeline")
  }

  const users = timeline.includes?.users ?? []
  const authorsById = new Map(
    users.map((u) => [u.id, { name: u.name, username: u.username }])
  )

  // The SDK's Media type omits url/previewImageUrl/altText, but the API
  // returns them when requested — read via a loose shape.
  const media = (timeline.includes?.media ?? []) as unknown as Array<
    Record<string, unknown>
  >
  const mediaByKey = new Map(media.map((m) => [m.mediaKey as string, m]))

  return timeline.data.map((tweet) => {
    const t = tweet as Record<string, unknown>
    const metrics = t.publicMetrics as Record<string, number> | undefined
    const attachments = t.attachments as { mediaKeys?: string[] } | undefined
    const entities = t.entities as
      | { urls?: Array<{ url: string; mediaKey?: string }> }
      | undefined

    // Strip the trailing t.co links that just point to attached media
    // (identified by a mediaKey); leave real external links intact.
    let text = t.text as string
    for (const u of entities?.urls ?? []) {
      if (u.mediaKey) text = text.replace(u.url, "")
    }
    text = text.trim()

    const tweetMedia = (attachments?.mediaKeys ?? [])
      .map((key) => mediaByKey.get(key))
      .filter((m): m is Record<string, unknown> => m != null)
      .map((m) => {
        const type = m.type as string
        // Photos expose `url`; videos/GIFs only a static `previewImageUrl`.
        const src = (m.url ?? m.previewImageUrl) as string | undefined
        if (!src) return null
        return {
          type,
          src,
          width: (m.width as number) ?? 0,
          height: (m.height as number) ?? 0,
          alt: (m.altText as string) ?? ""
        }
      })
      .filter((m): m is NonNullable<typeof m> => m != null)

    return {
      id: t.id as string,
      text,
      createdAt: t.createdAt as string,
      author: authorsById.get(t.authorId as string) ?? null,
      media: tweetMedia,
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
