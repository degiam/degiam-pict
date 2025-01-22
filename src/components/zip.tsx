import { createSignal, Show } from "solid-js"
import JSZip from "jszip"

type ZipProps = {
  converted?: { file: File; format: string }[];
  compressed?: { file: File; format: string }[];
  removebg?: { file: File; format: string }[];
}

function Zip(props: ZipProps) {
  const [isDownloading, setIsDownloading] = createSignal(false)

  const downloadZip = async () => {
    setIsDownloading(true)

    const zip = new JSZip()

    const files: any = props.converted || props.compressed || props.removebg

    for (const { file } of files) {
      const arrayBuffer = await file.arrayBuffer()
      zip.file(file.name, arrayBuffer)
    }

    zip
    .generateAsync({ type: "blob" })
    .then((blob) => {
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "kiepict.zip"
      link.click()
    })
    .catch((error) => {
      console.error("Gagal membuat ZIP: ", error)
    })
    .finally(() => {
      setIsDownloading(false)
    })
  }

  return (
    <Show
      when={
        (props.converted && props.converted.length > 0) || 
        (props.compressed && props.compressed.length > 0) ||
        (props.removebg && props.removebg.length > 0)
      }
      fallback={
        <div class="w-full px-4 py-3 rounded-lg transition font-bold relative flex items-center justify-center gap-2 text-white border border-cyan-500 bg-cyan-500 dark:bg-cyan-600">
          Memproses...
        </div>
      }
    >
      <button
        type='button'
        onClick={downloadZip}
        disabled={isDownloading()}
        class={`w-full px-4 py-3 rounded-lg transition font-bold relative flex items-center justify-center gap-2 text-white border border-cyan-500 hover:border-cyan-600 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 ${isDownloading() ? 'pointer-events-none' : ''}`}
      >
        Unduh Semua
      </button>
    </Show>
  )
}

export default Zip
