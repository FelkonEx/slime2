import { useEffect } from 'react'
import { ChatClient } from '@twurple/chat'
import { useMessageListDispatch } from './contexts/MessageList'
import TwitchChat from './MessageList'
import { useBroadcaster } from './contexts/Twitch'
import useMessageTransform from './hooks/useMessageTransform'
import useTwitchAuthentication from './hooks/useTwitchAuthentication'

import type { Listener } from '@d-fischer/typed-event-emitter'
import type { TwitchMessage, TwitchMessageType } from './types'

/**
 * Uses the {@link ChatClient} to transform and save chat messages
 * into `MessageListContext`, which the user has access to
 */
export default function TwitchChatClient() {
  const { authProvider } = useTwitchAuthentication()
  const dispatch = useMessageListDispatch()
  const broadcaster = useBroadcaster()!
  const messageTransform = useMessageTransform()

  // -------------------------
  //  Chat Dispatch Functions
  // -------------------------

  function addMessage(message?: TwitchMessage) {
    if (!message) return

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `%c[${message.type}] ${message.user.displayName}: ${message.text}`,
        'background-color: black; color: white; padding: 5px 10px; border-radius: 100px; border: 2px solid white',
      )

      console.log('SlimeChat Data', message)

      console.log(
        `%cMessage ${message.id}`,
        'background-color: black; color: white; padding: 5px 10px; border-radius: 0 0 10px 10px; display: inline-block; margin-bottom: 10px; border: 1px solid gray;',
      )
    }
    dispatch({ type: 'add', payload: message })
  }

  // lets the user send test messages
  slimeChat.ready({ test: addMessage })

  function clearMessages(userId: string | null = null) {
    dispatch({ type: 'clear', payload: userId })
  }

  function removeMessage(messageId: string) {
    dispatch({ type: 'remove', payload: messageId })
  }

  // ----------------------------
  //  Chat Client Initialization
  // ----------------------------

  const chatClient = new ChatClient({
    authProvider: authProvider,
    channels: [broadcaster.userName],
  })

  chatClient.connect()

  // -----------------
  //  Event Listeners
  // -----------------

  useEffect(() => {
    const listeners: Listener[] = []
    listeners.push(
      // -----------------------------
      //  Events Using PrivateMessage
      // -----------------------------

      chatClient.onMessage(async (_, __, text, msg) => {
        const { bits } = msg
        const typeData: TwitchMessageType = bits
          ? { type: 'cheer', cheer: { amount: bits } }
          : { type: 'basic' }

        const message = await messageTransform(typeData, msg, text)
        addMessage(message)
      }),

      chatClient.onAction(async (_, __, text, msg) => {
        const message = await messageTransform({ type: 'action' }, msg, text)
        addMessage(message)
      }),

      // -------------------------
      //  Events Using UserNotice
      // -------------------------

      chatClient.onResub(async (_, __, info, msg) => {
        const typeData: TwitchMessageType = {
          type: 'resub',
          resub: { months: info.months, tier: info.plan },
        }

        const message = await messageTransform(typeData, msg)
        addMessage(message)
      }),

      chatClient.onAnnouncement(async (_, __, info, msg) => {
        const typeData: TwitchMessageType = {
          type: 'announcement',
          announcement: { color: info.color },
        }

        const message = await messageTransform(typeData, msg)
        addMessage(message)
      }),

      // --------------------------
      //  Events Removing Messages
      // --------------------------

      chatClient.onChatClear(() => {
        clearMessages()
      }),

      chatClient.onTimeout((_, __, ___, msg) => {
        clearMessages(msg.targetUserId)
      }),

      chatClient.onBan((_, __, msg) => {
        clearMessages(msg.targetUserId)
      }),

      chatClient.onMessageRemove((_, messageId) => {
        removeMessage(messageId)
      }),
    )

    return () => {
      listeners.forEach(listener => {
        if (listener) chatClient.removeListener(listener)
      })
      chatClient.quit()
    }
  })

  return <TwitchChat />
}
