import { createSignal, createEffect, onCleanup, Show } from "solid-js"
import formatMessage from "../utils/formatMessage"
import Zip from "./zip"

type ConvertProps = {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
}

function Convert(props: ConvertProps) {
  const [format, setFormat] = createSignal<string>("jpg")
  const [errorFile, setErrorFile] = createSignal<{ message: string; timeout: number }[]>([])
  const [zipFiles, setZipFiles] = createSignal<{ file: File; format: string; original: string }[]>([])

  const handleFormatChange = (e: Event) => {
    const select = e.target as HTMLSelectElement
    const value = select.value === "jpeg" ? "jpg" : select.value
    setFormat(value)
    setZipFiles([])
  }

  const convertImage = (file: File, downloadAll: boolean = false) => {
    const selectedFormat = format()
    const reader = new FileReader()

    reader.onload = () => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const original = file.name
        const originalName = file.name.slice(0, file.name.lastIndexOf("."))
        const finalFileName = `${originalName}.${selectedFormat}`

        const base64DataUrl = canvas.toDataURL(`image/${selectedFormat}`)
        const base64Data = base64DataUrl.split(",")[1]

        const byteString = atob(base64Data)
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }

        const blob = new Blob([ia], { type: `image/${selectedFormat}` })

        if (downloadAll) {
          const downloadFile = new File([blob], finalFileName, { type: `image/${selectedFormat}` })

          const isDuplicate = zipFiles().some(
            (item) => item.file.name === downloadFile.name
          )

          if (!isDuplicate) {
            setZipFiles((prev) => [...prev, { file: downloadFile, format: selectedFormat, original: original }])
          }
        } else {
          const link = document.createElement("a")
          link.href = URL.createObjectURL(blob)
          link.download = finalFileName
          link.click()
          URL.revokeObjectURL(link.href)
        }
      }

      img.onerror = () => {
        addError(`Gagal memuat *${file.name}*`)
      }

      img.src = reader.result as string
    }

    reader.onerror = () => {
      addError(`*${file.name}* tidak ada atau sudah dipindahkan`)
    }

    reader.readAsDataURL(file)
  }

  const addError = (message: string) => {
    const currentTime = Date.now()
    const newError = { message, timeout: currentTime + 5000 }
    setErrorFile((prev) => [...prev, newError])
  }

  const handleRemoveFile = (fileToRemove: File) => {
    props.setUploadedFiles(props.uploadedFiles.filter((file) => file.name !== fileToRemove.name))
    setZipFiles(zipFiles().filter((zip) => zip.original !== fileToRemove.name))
  }

  createEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now()
      setErrorFile((prev) => prev.filter((error: any) => error.timeout > currentTime))
    }, 1000)
  
    onCleanup(() => clearInterval(interval))
  })

  createEffect(() => {
    const timeout = setTimeout(() => {
      setErrorFile([])
    }, 5000)
    return () => clearTimeout(timeout)
  })

  createEffect(() => {
    props.uploadedFiles.forEach((file) => {
      convertImage(file, true)
    })
  })

  return (
    <>
      {props.uploadedFiles.length > 0 &&
        <>
          <Show when={errorFile().length > 0}>
            <div class="fixed top-0 right-0 z-10 m-4 md:m-8 px-4 py-3 md:px-5 md:py-4 rounded-lg md:rounded-xl shadow-xl text-sm break-word bg-red-100 text-red-600 transition duration-500">
              {errorFile().length > 1 ?
                <ul class="list-disc pl-4">
                  {errorFile().map((error) => (
                    <li class="break-word" innerHTML={formatMessage(error.message)} />
                  ))}
                </ul>
              :
                <p class="break-word" innerHTML={formatMessage(errorFile()[0].message)} />
              }
            </div>
          </Show>

          <fieldset class="pt-2">
            <label class="relative block w-full rounded-lg bg-white">
              <select onChange={handleFormatChange} class="input relative z-1 pr-10 bg-transparent appearance-none">
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
              </select>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-0 bottom-0 right-3.5 my-auto w-5 h-5 text-slate-400">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 9l6 6l6 -6" />
              </svg>
            </label>
          </fieldset>

          <div class="w-full mt-8">
            <ul class="mb-8">
              {props.uploadedFiles.map((file) => {
                const originalName = file.name.slice(0, file.name.lastIndexOf("."))
                const selectedFormat = format()
                const displayedFileName = `${originalName}.${selectedFormat}`
            
                return (
                  <li class="flex justify-between items-center gap-6 py-3 break-word border-b border-slate-200 dark:border-slate-700 last:border-0">
                    <div class="flex items-center gap-2">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        class="w-10 h-10 aspect-square object-cover rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100"
                      />
                      <span class="text-sm text-slate-700 dark:text-white">{displayedFileName}</span>
                    </div>
                    <div class="flex items-center">
                      <button
                        type="button"
                        onClick={() => convertImage(file)}
                        class="ml-3 text-sm text-cyan-500 hover:text-cyan-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                          <path d="M7 11l5 5l5 -5" />
                          <path d="M12 4l0 12" />
                        </svg>
                        <span class="sr-only">Unduh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file)}
                        class="ml-3 text-sm text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M4 7l16 0" />
                          <path d="M10 11l0 6" />
                          <path d="M14 11l0 6" />
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                        <span class="sr-only">Hapus</span>
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <Zip converted={zipFiles()} />
        </>
      }
    </>
  )
}

export default Convert
