import { Button, useDisclosure } from '@chakra-ui/react'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { doStartAChat } from '@/api/chat'
import {
  extendChatHistory,
  initChat,
  setChatHistory,
  setPrompt,
  setRecommend,
} from '@/stores/user/chat'
import ChatDialog from './ChatDialog'
import { useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { RecieveStep } from '@/models/user/chat'

export default function GenerateBtn() {
  const dispatch = useAppDispatch()
  const chat = useAppSelector((state) => state.chat)

  const recieveState = useRef(RecieveStep.PENDING)
  const socket = useRef<Socket | undefined>(undefined)

  const onSend = (
    msg: string,
    ws: Socket | undefined = socket.current,
    task_uuid = chat.task_uuid
  ) => {
    if (ws) {
      if (recieveState.current === RecieveStep.RECIEVING) {
        recieveState.current = RecieveStep.CANCELED
      }
      ws.emit('message', {
        content: msg,
        task_uuid: task_uuid,
        provider: 'User',
      })
      dispatch((dispatch, getState) => {
        dispatch(extendChatHistory({ content: msg, provider: 'Human' }))
        dispatch(setPrompt(''))
        dispatch(setRecommend(''))
      })
    }
  }

  const initWebSocket = async (subscription: string, task_uuid: string) => {
    if (!socket.current) {
      const newSocket = await new Promise<Socket>((resolve) => {
        const newSocket = io(
          `${process.env.NEXT_PUBLIC_API_BASE as string}/chat_socket`,
          {
            query: {
              subscription: subscription,
            },
            path: '',
            transports: ['websocket', 'polling'],
          }
        )
        newSocket.on('connect', () => {
          resolve(newSocket)
        })
      })

      newSocket.on('AI Assistant', (event) => {
        if (event.content === '[START]') {
          dispatch((dispatch, getState) => {
            dispatch(extendChatHistory({ content: '', provider: 'AI' }))
          })
        } else if (event.content === '[END]') {
        } else {
          dispatch((dispatch, getState) => {
            const chat = getState().chat
            dispatch(
              setChatHistory([
                ...chat.chat_history.slice(0, -1),
                {
                  content:
                    chat.chat_history[chat.chat_history.length - 1].content +
                    event.content,
                  provider: 'AI',
                },
              ])
            )
          })
        }
      })

      newSocket.on('summary', (event) => {
        if (event.content === '[START]') {
          dispatch((dispatch, getState) => {
            dispatch(setPrompt(''))
          })
        } else if (event.content === '[END]') {
        } else {
          dispatch((dispatch, getState) => {
            const chat = getState().chat
            dispatch(setPrompt(chat.prompt + event.content))
          })
        }
      })

      newSocket.on('guess', (event) => {
        if (event.content === '[START]') {
          recieveState.current = RecieveStep.RECIEVING
          dispatch((dispatch, getState) => {
            dispatch(setRecommend(''))
          })
        } else if (event.content === '[END]') {
          recieveState.current = RecieveStep.PENDING
        } else if (recieveState.current !== RecieveStep.CANCELED) {
          dispatch((dispatch, getState) => {
            const chat = getState().chat
            dispatch(setRecommend(chat.recommend + event.content))
          })
        }
      })

      socket.current = newSocket
    }
  }

  const { isOpen, onClose, onOpen } = useDisclosure({
    onOpen: () => {
      if (chat.task_uuid === '') {
        const fetchInitChat = async () => {
          const { subscription, task_uuid } = await doStartAChat()
          await initWebSocket(subscription, task_uuid)
          dispatch(initChat({ subscription, task_uuid }))
        }
        fetchInitChat()
      }
    },
  })

  return (
    <>
      <ChatDialog
        onSend={onSend}
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
      ></ChatDialog>
      <Button colorScheme="blue" width={20} onClick={onOpen}>
        Generate
      </Button>
    </>
  )
}
