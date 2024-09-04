namespace SevenTV {
  type UserResponse = {
    id: string
    platform: string
    username: string
    emote_set: EmoteSet
  }

  type EmoteSet = {
    id: string
    name: string
    emotes: Emote[]
  }

  type Emote = {
    id: string
    name: string
    data: EmoteData
  }

  type EmoteData = {
    id: string
    name: string
    data: EmoteData
  }

  type EmoteHostData = {
    url: string
    files: EmoteHostDataFiles[]
  }

  type EmoteHostDataFiles = {
    name: string
    static_name: string
    width: number
    height: number
    format: string
  }
}
