import { useEffect, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { closeWebsocket, startWebsocket } from '../../net'
import { ChatBoard } from './ChatBoard'
import { DetailBoard } from './DetailBoard'
import { GenerateBoard } from './GenerateBoard'
import style from './result.module.css'
import {
	taskInitAtom,
	taskDetailAtom,
	chatHistoryAtom,
	chatGuessAtom,
	promptAtom,
	stopChatAtom,
	meshProfileAtom,
	assistantChatStatusAtom,
	guessChatStatusAtom,
	chatTextAtom,
	chatLangAtom,
	needStartWsAtom,
	chatDialogStartAtom,
	generateStageAtom,
} from './store.js'
import { exportToImage } from "./utils";

function ResultBoard() {
	const navi = useNavigate()
	const taskInit = useRecoilValue(taskInitAtom)
	const taskDetail = useRecoilValue(taskDetailAtom)
	const [chatHistory, setChatHistory] = useRecoilState(chatHistoryAtom)
	const setChatGuess = useSetRecoilState(chatGuessAtom)
	const setMeshProfile = useSetRecoilState(meshProfileAtom)
	const setAssistantChatStatus = useSetRecoilState(assistantChatStatusAtom)
	const setGuessChatStatus = useSetRecoilState(guessChatStatusAtom)
	const [prompt, setPrompt] = useRecoilState(promptAtom)
	const [stopChat, setStopChat] = useRecoilState(stopChatAtom)
	const [chatText, setChatText] = useRecoilState(chatTextAtom)
	const chatLang = useRecoilValue(chatLangAtom)
	const [needStartWs, setNeedStartWs] = useRecoilState(needStartWsAtom)
	const setChatDialogStart = useSetRecoilState(chatDialogStartAtom)
	const isListenRef = useRef(false)
	const chatHistoryRef = useRef({})
	const chatGuessRef = useRef('')
	const promptRef = useRef('')
	const [generateStage, setGenerateStage] = useRecoilState(generateStageAtom)

	const handleClose = (ev) => {
		// closeWebsocket()
		// disposeWebsocket()
		// setChatDialogStart(false)
		// navi('/')
	}

	const bindWsListeners = (ws) => {
		setNeedStartWs(false)

		ws.on('assistant', (ev) => {
			console.log('assistant', ev)
			const currentChat = { ...(chatHistoryRef.current[ev.chat_uuid] || {}) }
			setAssistantChatStatus(ev.content)

			if (ev.content === '[START]') {
				currentChat.chat_uuid = ev.chat_uuid
				currentChat.provider = ev.provider
				currentChat.timeStamp = new Date(ev.submit_time).getTime()
				currentChat.content = ''
			} else if (ev.content !== '[END]') {
				currentChat.content += ev.content
			}
			setChatHistory({
				...chatHistoryRef.current,
				[ev.chat_uuid]: currentChat,
			})
		})

		ws.on('guess', (ev) => {
			console.log('guess', ev)
			setGuessChatStatus(ev.content)
			if (ev.content === '[START]') {
				chatGuessRef.current = ''
			} else if (ev.content !== '[END]') {
                chatGuessRef.current += ev.content
                // console.log(chatGuessRef.current);
				setChatGuess(chatGuessRef.current.split('\n'))
			}
		})
		ws.on('summary', (ev) => {
			console.log('summary', ev)
			if (ev.content === '[START]') {
				promptRef.current = ''
			} else if (ev.content !== '[END]') {
				promptRef.current += ev.content
				setPrompt(promptRef.current)
			}
		})
	}

	useEffect(() => {
		document.documentElement.style.overflowY = 'hidden'
		return () => (document.documentElement.style.overflowY = 'overlay')
	}, [])

	useEffect(() => {
		chatHistoryRef.current = { ...chatHistory }
	}, [chatHistory])

	useEffect(() => {
		promptRef.current = prompt
	}, [prompt])

	useEffect(() => {
		if (stopChat) {
			closeWebsocket()
		}
	}, [stopChat])

	useEffect(() => {
		if (!taskInit && !taskDetail) {
			// navi('/', { replace: true })
		}
		// eslint-disable-next-line
	}, [taskInit, taskDetail])

	useEffect(() => {
		// console.log('taskInit', taskInit)
		// if (!taskInit) return
		// ;(async () => {
		// 	// console.log(isListenRef.current);
		// 	if (isListenRef.current) return
		// 	isListenRef.current = true

		// 	const ws = await startWebsocket(taskInit.subscription, taskInit.task_uuid, chatLang)

		// 	bindWsListeners(ws)
		// })()
		// eslint-disable-next-line
	}, [taskInit])

	useEffect(() => {
		// console.log("needStartWs", needStartWs)
		// if (!needStartWs) return

		// setChatGuess([])
		// setPrompt('')
		// setChatHistory({})
		// setChatText('')
		// setAssistantChatStatus('')
		// setStopChat(false)

		// isListenRef.current = false
		// chatHistoryRef.current = {}
		// chatGuessRef.current = ''
		// promptRef.current = ''

		// startWebsocket(taskInit.subscription, taskInit.task_uuid, chatLang).then((ws) => {
		// 	bindWsListeners(ws)
		// })
		// eslint-disable-next-line
	}, [needStartWs])

	useEffect(() => {
        if (!taskDetail) return
        // console.log(taskDetail);
		setChatHistory(
			taskDetail.chat_history.reduce(
				(res, cur) => ({
					...res,
					[cur.chat_uuid]: { ...cur, timeStamp: new Date(cur.time).getTime() },
				}),
				{}
			)
		)
		setPrompt(taskDetail.prompt)
		setMeshProfile({...taskDetail.resources, task_uuid: taskDetail.task_uuid})
		// navi('/result/detail')
		setGenerateStage('detail')
		// eslint-disable-next-line
	}, [taskDetail])

	const dialogRef = useRef(null);

	const exportDialog = async () => {
	  await exportToImage(dialogRef.current, "dialog");
	};
  
	window.exportDialog = exportDialog;	

	return (
		<div className={style.con} onPointerDown={handleClose}>
			<div
				className={style.board}
				onPointerDown={(ev) => ev.stopPropagation()}
				ref={dialogRef}
			>
				<GenerateBoard />
				<DetailBoard />
			</div>
		</div>
	)
}

export { 
	ResultBoard, 
	GenerateBoard, 
	DetailBoard, 
	taskInitAtom, 
	taskDetailAtom, 
	chatTextAtom, 
	chatDialogStartAtom,
	generateStageAtom,
	promptAtom
}
