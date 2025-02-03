import React, { useEffect, useState, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import './CaptureAudio.css'
import TrashIcon from '../../assets/img/chatImages/trash.png'
import playIcon from '../../assets/img/chatImages/playIcon.png'
import stopIcon from '../../assets/img/chatImages/stopIcon.jpg'
import sendIcon from '../../assets/img/chatImages/send.png'
import micIcon from '../../assets/img/chatImages/mic.png'

function CaptureAudio({ hide, handleSend }) {
    const [isRecording, setIsRecording] = useState(false)
    const [recordedAudio, setRecordedAudio] = useState(null)
    const [waveform, setWaveform] = useState(null)
    const [recordingDuration, setRecordingDuration] = useState(0)
    const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0)
    const [totalDuration, setTotalDuration] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioblob, setAudioBlob] = useState(null)
    const [renderedAudio, setRenderedAudio] = useState(null)

    const audioRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const waveformRef = useRef(null)

    useEffect(() => {
        if (waveformRef.current) {
            const wavesurfer = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#ccc',
                progressColor: '#4a9eff',
                cursorColor: '#7ae3c3',
                barWidth: 2,
                height: 30,
                responsive: true,
            })

            setWaveform(wavesurfer)
            handleStartRecording(wavesurfer)
            wavesurfer.on('finish', () => {
                setIsPlaying(false)
            })

            return () => {
                wavesurfer.destroy()
            }
        }
    }, [])

    useEffect(() => {
        let interval
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration((prevDuration) => {
                    setTotalDuration(prevDuration + 1)
                    return prevDuration + 1
                })
            }, 1000)
        }

        return () => {
            clearInterval(interval)
        }
    }, [isRecording])

    const formatTime = (time) => {
        if (isNaN(time)) return '00:00'
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
    }

    //   useEffect(() => {
    //     handleStartRecording();
    //   }, []);

    const handleStartRecording = (wavesurfer) => {
        setRecordingDuration(0)
        setCurrentPlaybackTime(0)
        setTotalDuration(0)
        setIsRecording(true)
        setRecordedAudio(null)

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream)
                mediaRecorderRef.current = mediaRecorder

                audioRef.current.srcObject = stream

                const chunks = []
                mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, {
                        type: 'audio/ogg; codecs=opus',
                    })
                    const audioURL = URL.createObjectURL(blob)
                    const audio = new Audio(audioURL)
                    setRecordedAudio(audio)
                    setAudioBlob(blob)

                    wavesurfer.load(audioURL)
                }

                mediaRecorder.start()
            })
            .catch((err) => {
                console.error('Error accessing microphone: ', err)
            })
    }

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            waveform.stop()
        }
    }

    const handlePlayRecording = () => {
        if (recordedAudio) {
            waveform.play()
            recordedAudio.play()
            setIsPlaying(true)
        }
    }

    const handlePauseRecording = () => {
        waveform.stop()
        recordedAudio.pause()
        setIsPlaying(false)
        // setIsRecording(false)
    }

    const sendAudio = async () => {
        if (audioblob) {
            // Assuming handleSend is passed from the Chat component
            handleSend(null, audioblob)
            hide() // Close the modal after sending the audio
        }
    }
    return (
        <div className="capture-audio">
            <div className="delete-audio" style={{ paddingTop: '0.5rem' }}>
                <img src={TrashIcon} onClick={() => hide()} alt="Delete" />
            </div>
            {isRecording ? (
                <div className="recording-pulse">
                    Recording <span>{formatTime(recordingDuration)}s</span>
                </div>
            ) : (
                <div className="audio-recorder">
                    {recordedAudio && (
                        <p>
                            {isPlaying ? (
                                <img
                                    src={stopIcon}
                                    onClick={handlePauseRecording}
                                    style={{ width: '30px' }}
                                    alt="Stop"
                                />
                            ) : (
                                <img
                                    src={playIcon}
                                    onClick={handlePlayRecording}
                                    style={{ width: '30px' }}
                                    alt="Play"
                                />
                            )}
                        </p>
                    )}
                </div>
            )}

            <div
                className="w-60"
                ref={waveformRef}
                hidden={!recordedAudio && !isRecording}
            />
            {recordedAudio && isPlaying && (
                <span>{formatTime(currentPlaybackTime)}</span>
            )}
            {recordedAudio && !isPlaying && (
                <span>{formatTime(totalDuration)}</span>
            )}
            <audio ref={audioRef} hidden />
            <div className="m4-4">
                {!isRecording ? (
                    <img
                        src={micIcon}
                        onClick={handleStartRecording}
                        alt="Mic"
                        style={{ width: '20px' }}
                    />
                ) : (
                    <img
                        src={stopIcon}
                        onClick={handleStopRecording}
                        alt="Stop Recording"
                        style={{ width: '30px' }}
                    />
                )}
            </div>
            {!isRecording && (
                <div className="send-button">
                    <img src={sendIcon} alt="Send" onClick={sendAudio} />
                </div>
            )}
        </div>
    )
}

export default CaptureAudio
