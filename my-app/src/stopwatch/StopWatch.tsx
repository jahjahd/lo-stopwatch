// Core deps.
import {
  useState,
  useEffect,
  useRef,
  useId,
} from 'react'

// Component.
export default function StopWatch (props = {}) {
  const [ startTime, setStartTime ] = useState<any|null>(null)
  const [ duration, setDuration ] = useState(0)
  const [ isRunning, setIsRunning ] = useState(false)
  const [ laps, setLaps ] = useState<any[]>([])
  const isFirstMount = useRef(true)
  const storageKey = `lifeomic:stopwatch__${useId()}`

  // Mount.
  useEffect(() => {
    const savedState = loadState()

    // Restore saved state.
    if (savedState) {
      setStartTime(Date.now() - savedState.duration)
      setDuration(savedState.duration)
      setIsRunning(savedState.isRunning)
      setLaps(savedState.laps)
    }
  }, [])

  // Listen for active state changes.
  useEffect(() => {
    let timer: any = null

    if (isRunning) {
      timer = setInterval(() => {
        const duration = Date.now() - startTime
        setDuration(duration)
      }, 10)
    } else {
      clearInterval(timer)
    }

    // Teardown.
    return () => {
      clearInterval(timer)
    }
  }, [isRunning])

  // Save state on updates.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
    } else {
      saveState()
    }
  })

  // Start timer.
  const start = () => {
    setStartTime(Date.now() - duration)
    setIsRunning(true)
  }

  // Stop timer.
  const stop = () => {
    setIsRunning(false)
  }

  // Reset timer.
  const reset = () => {
    stop()
    setDuration(0)
    setLaps([])
    clearState()
  }

  // Lap.
  const lap = () => {
    const prevLap = laps.at(-1) || { startTime: 0, duration }
    const lapDuration = Date.now() - startTime - prevLap.startTime

    setLaps([
      ...laps,
      {
        startTime: prevLap.startTime + lapDuration,
        duration: lapDuration,
      },
    ])
  }

  // Save state.
  const saveState = () => {
    const state = JSON.stringify({ duration, isRunning, laps })
    localStorage.setItem(storageKey, state)
  }

  // Load state.
  const loadState = () => {
    let savedState: any|null = localStorage.getItem(storageKey)
    if (savedState) {
      savedState = JSON.parse(savedState)
    }
    return savedState
  }

  // Clear state.
  const clearState = () => {
    localStorage.removeItem(storageKey)
  }

  // Parse a duration into its parts.
  const parseDuration = (duration: number) => {
    return {
      hours: String(Math.floor(duration / 3600000)).padStart(2, '0'),
      minutes: String(Math.floor((duration / 60000) % 60)).padStart(2, '0'),
      seconds: String(Math.floor((duration / 1000) % 60)).padStart(2, '0'),
      hundredths: String(Math.floor((duration % 1000) / 10)).padEnd(2, '0'),
    }
  }

  // Get parsed duration.
  const { hours, minutes, seconds, hundredths } = parseDuration(duration)
  const hasHours = Number(hours) > 0

  // Calculate shortest & longest lap.
  const lapsByTime = [...laps].sort((a, b) => a.duration - b.duration)
  const shortestLap = lapsByTime.at(0)
  const longestLap = lapsByTime.at(-1)

  return (
    <div
      className="flex-col justify-center bg-slate-100 rounded-xl mb-12 mx-0 w-full md:mx-6 md:w-80"
    >
      {/* Timer */}
      <div
        className={`flex items-center px-6 py-8 text-center h-48 ${hasHours ? 'text-4xl' : 'text-6xl'}`}
      >
        {hasHours ? (
          <>
            <span
              className="flex-1"
            >
              {hours}
            </span>

            :
          </>
        ) : null}

        <span
          className="flex-1"
        >
          {minutes}
        </span>

        :

        <span
          className="flex-1"
        >
          {seconds}
        </span>

        .

        <span
          className="flex-1"
        >
          {hundredths}
        </span>
      </div>

      {/* Buttons */}
      <div
        className="flex justify-between gap-x-3 px-6 mb-8"
      >
        <button
          className="rounded-full bg-slate-700 text-white font-bold w-20 h-20"
          onClick={isRunning ? lap : reset}
          disabled={!duration}
        >
          {isRunning ? 'Lap' : 'Reset'}
        </button>

        <button
          className="rounded-full bg-slate-700 text-white font-bold w-20 h-20"
          onClick={isRunning ? stop : start}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
      </div>

      {/* Laps */}
      {laps?.length ? (
        <ol
          className="max-h-80 overflow-auto px-6 pb-6"
        >
          {[...laps].reverse().map((lap, idx) => {
            const { duration } = lap
            const { hours, minutes, seconds, hundredths } = parseDuration(duration)
            const hasHours = Number(hours) > 0

            // Add classes to highlight longest & shortest laps.
            let lapClass = ''
            if (laps.length >= 2) {
              if (duration === shortestLap.duration) {
                lapClass = 'text-green-500'
              } else if (duration === longestLap.duration) {
                lapClass = 'text-red-500'
              }
            }

            return (
              <li
                key={lap.startTime}
                className={`flex px-3 py-2 border-slate-200 border-t ${lapClass}`}
              >
                <span>
                  Lap {laps.length - idx}
                </span>

                <span className="flex-1 text-right">
                  {hasHours ? `${hours}:` : ''}{minutes}:{seconds}.{hundredths}
                </span>
              </li>
            )
          })}
        </ol>
      ) : null}
    </div>
  )
}
