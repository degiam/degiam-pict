import { createSignal, onCleanup, onMount } from 'solid-js'
import Dropzone from "./components/dropzone"
import Compress from "./components/compress"
import Convert from "./components/convert"

function App() {
  const [isStandalone, setIsStandalone] = createSignal<boolean>(false)
  const [isMobile, setIsMobile] = createSignal<boolean>(false)

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
        setIsStandalone(true)
        setIsMobile(event.data.isMobile)
      }
    }

    window.addEventListener("message", handleScreenSizeMessage)

    onCleanup(() => {
      window.removeEventListener("message", handleScreenSizeMessage)
    })
  })

  const mainClass = (): string => {
    if (isStandalone()) {
      return isMobile()
        ? "[&_.main-layout]:max-md:pb-24"
        : "[&_.main-layout]:md:pt-24"
    }
    return ""
  }

  const [uploadedFiles, setUploadedFiles] = createSignal<File[]>([])

  return (
    <main class={mainClass()}>
      <h1 class="sr-only">KiePict by Degiam</h1>
      <Dropzone uploadedFiles={uploadedFiles()} setUploadedFiles={setUploadedFiles}>
        <Compress uploadedFiles={uploadedFiles()} setUploadedFiles={setUploadedFiles} />
        <Convert uploadedFiles={uploadedFiles()} setUploadedFiles={setUploadedFiles} />
      </Dropzone>
    </main>
  )
}

export default App