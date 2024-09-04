import axios from 'axios'

const sevenTvApi = axios.create({
  baseURL: 'https://7tv.io/v3',
})

export default async function getChannelEmotes(
  platform: Slime2.Platform,
  userId: string,
): Promise<Slime2.Event.Message.EmoteMap> {
  const sevenTvEmoteMap = new Map<string, Slime2.Event.Message.Emote>()

  // Get Global Emotes First
  const global = await sevenTvApi
    .get<SevenTV.EmoteSet>('/emote-sets/global')
    .then(response => response.data)
    .catch(() => null)

  if (global) {
    const { emotes: globalEmotes } = global

    if (globalEmotes) {
      setEmotes(globalEmotes, sevenTvEmoteMap)
    }
  }

  // Get User Emotes Second
  const user = await sevenTvApi
    .get<SevenTV.UserResponse>(`/users/${platform}/${userId}`)
    .then(response => response.data)
    .catch(() => null)

  if (!user) return sevenTvEmoteMap
  const { emotes: userEmotes } = user.emote_set
  if (!userEmotes) return sevenTvEmoteMap

  setEmotes(userEmotes, sevenTvEmoteMap)

  return sevenTvEmoteMap
}

function setEmotes(
  emotes: SevenTV.Emote[],
  emoteMap: Map<string, Slime2.Event.Message.Emote>,
) {
  emotes.forEach(emote => {
    emoteMap.set(emote.name, {
      id: emote.id,
      name: emote.name,
      images: {
        default: buildEmoteUrls(emote.id),
        static: buildEmoteUrls(emote.id, true),
      },
      source: 'seventv',
    })
  })
}

function buildEmoteUrls(
  id: string,
  staticEmote: boolean = false,
): Slime2.Event.Message.Emote.Urls {
  function buildEmoteUrl(size: 1 | 2 | 3 | 4) {
    const baseURL = 'https://cdn.7tv.app/emote'
    return `${baseURL}/${id}/${size}x${staticEmote ? '_static' : ''}.webp`
  }

  return {
    x1: buildEmoteUrl(1),
    x2: buildEmoteUrl(2),
    x4: buildEmoteUrl(4),
  }
}
