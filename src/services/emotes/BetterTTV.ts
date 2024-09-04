import axios from 'axios'

const bttvApi = axios.create({
  baseURL: 'https://api.betterttv.net/3/cached',
})

export default async function getChannelEmotes(
  platform: Slime2.Platform,
  userId: string,
): Promise<Slime2.Event.Message.EmoteMap> {
  const bttvEmoteMap = new Map<string, Slime2.Event.Message.Emote>()

  // Get Global Emotes First
  const globalEmotes = await bttvApi
    .get<BetterTTV.ChannelEmote[]>('/emotes/global')
    .then(response => response.data)
    .catch(() => null)

  if (globalEmotes) {
    setEmotes(globalEmotes, bttvEmoteMap)
  }

  const user = await bttvApi
    .get<BetterTTV.UserResponse>(`/users/${platform}/${userId}`)
    .then(response => response.data)
    .catch(() => null)

  if (!user) return bttvEmoteMap

  const { channelEmotes, sharedEmotes } = user

  // if these aren't defined then the API returned an error
  if (!channelEmotes || !sharedEmotes) return bttvEmoteMap

  function setEmotes(
    emotes: BetterTTV.Emote[],
    emoteMap: Map<string, Slime2.Event.Message.Emote>,
  ) {
    emotes.forEach(emote => {
      emoteMap.set(emote.code, {
        id: emote.id,
        name: emote.code,
        images: {
          default: buildEmoteUrls(emote.id),
          static: buildEmoteUrls(emote.id, true),
        },
        source: 'betterttv',
      })
    })
  }

  setEmotes(channelEmotes, bttvEmoteMap)
  setEmotes(sharedEmotes, bttvEmoteMap)

  return bttvEmoteMap
}

function buildEmoteUrls(
  id: string,
  staticEmote: boolean = false,
): Slime2.Event.Message.Emote.Urls {
  function buildEmoteUrl(size: 1 | 2 | 3) {
    const baseURL = 'https://cdn.betterttv.net/emote'
    return `${baseURL}/${id}${staticEmote ? '/static' : ''}/${size}x`
  }

  return {
    x1: buildEmoteUrl(1),
    x2: buildEmoteUrl(2),
    x4: buildEmoteUrl(3),
  }
}
