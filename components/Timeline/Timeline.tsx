"use client"

import { useEffect, useState } from "react"
import { Drawer } from "@base-ui/react/drawer"

type Tweet = {
  id: string
  text: string
  createdAt: string
  author: { name: string; username: string } | null
  likes: number
  retweets: number
  replies: number
}

export function Timeline({ tweets }: { tweets: Tweet[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setIndex((i) => Math.min(i + 1, tweets.length - 1))
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        setIndex((i) => Math.max(i - 1, 0))
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [tweets.length])

  const tweet = tweets[index]

  if (!tweet) {
    return <p className="text-zinc-500">No tweets to show.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border p-4">
        {tweet.author && (
          <div className="mb-2 flex gap-2 text-sm">
            <span className="font-semibold">{tweet.author.name}</span>
            <span className="text-zinc-500">@{tweet.author.username}</span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{tweet.text}</p>
        <div className="mt-3 flex gap-4 text-sm text-zinc-500">
          <span>{new Date(tweet.createdAt).toLocaleString()}</span>
          <span>{tweet.likes} likes</span>
          <span>{tweet.retweets} reposts</span>
          <span>{tweet.replies} replies</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          {index + 1} / {tweets.length}
        </span>
        <span>↑ / ↓ to navigate</span>
      </div>

      <Drawer.Root modal={false} defaultOpen disablePointerDismissal>
        <Drawer.Trigger className="self-start rounded-md border px-3 py-1.5 text-sm text-zinc-500">
          Debug
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Viewport>
            <Drawer.Popup
              initialFocus={false}
              className="fixed inset-x-0 bottom-0 flex max-h-[60vh] flex-col border-t bg-white shadow-xl dark:bg-zinc-950"
            >
              <Drawer.Content className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <Drawer.Title className="text-sm font-semibold">
                    Debug
                  </Drawer.Title>
                  <Drawer.Close className="rounded-md border px-2 py-1 text-sm text-zinc-500">
                    Close
                  </Drawer.Close>
                </div>
                <pre className="flex-1 overflow-auto rounded-md bg-zinc-100 p-3 font-mono text-xs whitespace-pre-wrap dark:bg-zinc-900">
                  {JSON.stringify(tweet, null, 2)}
                </pre>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
