import { createSignal, onCleanup, onMount } from 'solid-js'
import Dropzone from "./components/dropzone"
import Compress from "./components/compress"
import Convert from "./components/convert"
import RemoveBg from "./components/removebg"

function App() {
  const [isChildren, setIsChildren] = createSignal<boolean>(false)
  const [isMobile, setIsMobile] = createSignal<boolean>(false)
  const [isIos, setIsIos] = createSignal<boolean>(false)

  const updateTheme = (isDarkMode: boolean) => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  onMount(() => {
    const handleThemeChange = (event: MessageEvent) => {
      if (event.data?.type === "theme-change") {
        updateTheme(event.data.isDarkMode)
      }
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleMediaChange = (event: MediaQueryListEvent) => {
      updateTheme(event.matches)
    }

    updateTheme(mediaQuery.matches)

    window.addEventListener("message", handleThemeChange)
    mediaQuery.addEventListener("change", handleMediaChange)

    window.parent.postMessage({ type: "iframe-ready" }, "*")

    onCleanup(() => {
      window.removeEventListener("message", handleThemeChange)
      mediaQuery.removeEventListener("change", handleMediaChange)
    })
  })

  onMount(() => {
    const handleScreenSizeMessage = (event: MessageEvent) => {
      if (event.data?.type === "screen-size") {
        setIsChildren(true)
        setIsMobile(event.data.isMobile)
      }
    }

    window.addEventListener("message", handleScreenSizeMessage)

    onCleanup(() => {
      window.removeEventListener("message", handleScreenSizeMessage)
    })
  })

  onMount(() => {
    const userAgent = window.navigator.userAgent
    const isTouchDevice = navigator.maxTouchPoints && navigator.maxTouchPoints > 2

    if (
      /iPad|iPhone|iPod/.test(userAgent) ||
      (userAgent.includes("Mac") && isTouchDevice)
    ) {
      setIsIos(true)
    }
  })

  const mainClass = (): string => {
    if (isChildren()) {
      return isMobile()
        ? "max-md:[&_.main-layout]:pb-24"
        : "md:[&_.main-layout]:pt-24"
    }
    return ""
  }

  const [uploadedFiles, setUploadedFiles] = createSignal<File[]>([])

  return (
    <main class={mainClass()}>
      {!isChildren() &&
        <h1 class="sr-only">KiePict by Degiam</h1>
      }
      <Dropzone uploadedFiles={uploadedFiles()} setUploadedFiles={setUploadedFiles} ios={isIos()}>
        <Convert uploadedFiles={uploadedFiles()} setUploadedFiles={setUploadedFiles} />
        <Compress uploadedFiles={uploadedFiles()} setUploadedFiles={setUploadedFiles} />
        <RemoveBg uploadedFiles={uploadedFiles()} setUploadedFiles={setUploadedFiles} />
      </Dropzone>
    </main>
  )
}

export default App