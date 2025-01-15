import { createSignal, createEffect, onCleanup, Show } from "solid-js"
import Compressor from "compressorjs"
import formatMessage from "../utils/formatMessage"
import Zip from "./zip"

type CompressProps = {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
}

function Compress(props: CompressProps) {
  const [format, setFormat] = createSignal<string>("original")
  const [quality, setQuality] = createSignal<number>(0.8)
  const [errorFile, setErrorFile] = createSignal<{ message: string; timeout: number }[]>([])
  const [zipFiles, setZipFiles] = createSignal<{ file: File; format: string }[]>([])

  const handleFormatChange = (e: Event) => {
    const select = e.target as HTMLSelectElement
    const value = select.value
    if (['original', 'jpg', 'png', 'webp'].includes(value)) {
      setFormat(value)
      setZipFiles([])
    } else {
      addError("Pilihan ekstensi tidak valid")
    }
  }

  const handleQualityChange = (e: Event) => {
    const select = e.target as HTMLSelectElement
    const value = Number(select.value)
    if (value >= 0 && value <= 1) {
      setQuality(value)
      setZipFiles([])
    } else {
      addError("Pilihan kualitas tidak valid")
    }
  }

  const compressImage = (file: File, downloadAll: boolean = false) => {
    const targetMimeType = format() === 'original' ? file.type : `image/${format()}`
    new Compressor(file, {
      quality: quality(),
      mimeType: targetMimeType,
      convertTypes: [],
      convertSize: Infinity,
      success: (result) => {
        const extension = format() === 'original' ? file.name.slice(file.name.lastIndexOf(".") + 1) : format()
        const compressedFile = new File([result], `${file.name.split(".")[0]}.${extension}`, {
          type: targetMimeType,
        })
  
        if (downloadAll) {
          if (!zipFiles().some((item) => item.file.name === compressedFile.name)) {
            setZipFiles((prev) => [...prev, { file: compressedFile, format: extension }])
          }
        } else {
          const link = document.createElement("a")
          link.href = URL.createObjectURL(compressedFile)
          link.download = compressedFile.name
          link.click()
          URL.revokeObjectURL(link.href)
        }
      },
      error: (err) => {
        console.error(err.message)
        addError(`Gagal mengompresi atau mengonversi *${file.name}*`)
      },
    })
  }  

  const addError = (message: string) => {
    const currentTime = Date.now()
    const newError = { message, timeout: currentTime + 5000 }
    setErrorFile((prev) => [...prev, newError])
  }

  createEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now()
      setErrorFile((prev) => prev.filter((error: any) => error.timeout > currentTime))
    }, 1000)

    onCleanup(() => clearInterval(interval))
  })

  createEffect(() => {
    props.uploadedFiles.forEach((file) => {
      compressImage(file, true)
    })
  })

  return (
    <>
      {props.uploadedFiles.length > 0 && (
        <>
          <Show when={errorFile().length > 0}>
            <div class="fixed top-0 right-0 z-10 m-4 md:m-8 px-4 py-3 md:px-5 md:py-4 rounded-lg md:rounded-xl shadow-xl text-sm break-word bg-red-100 text-red-600 transition duration-500">
              {errorFile().length > 1 ? (
                <ul class="list-disc pl-4">
                  {errorFile().map((error) => (
                    <li class="break-word" innerHTML={formatMessage(error.message)} />
                  ))}
                </ul>
              ) : (
                <p class="break-word" innerHTML={formatMessage(errorFile()[0].message)} />
              )}
            </div>
          </Show>

          <fieldset class="pt-2 flex flex-col gap-6">
            <label class="relative block w-full rounded-lg bg-white">
              <select onChange={handleFormatChange} class="input relative z-[1] pr-10 bg-transparent appearance-none">
                <option value="original">Ekstensi Tidak Diubah</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
              </select>
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
                class="absolute top-0 bottom-0 right-3.5 my-auto w-5 h-5 text-slate-400"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 9l6 6l6 -6" />
              </svg>
            </label>
            <label class="relative block w-full rounded-lg bg-white">
              <select onChange={handleQualityChange} class="input relative z-[1] pr-10 bg-transparent appearance-none">
                <option value="0.8">Kualitas Tinggi</option>
                <option value="0.6">Kualitas Sedang</option>
                <option value="0.3">Kualitas Rendah</option>
              </select>
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
                class="absolute top-0 bottom-0 right-3.5 my-auto w-5 h-5 text-slate-400"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 9l6 6l6 -6" />
              </svg>
            </label>
          </fieldset>

          <div class="w-full mt-8">
            <ul class="w-full mb-8">
              {props.uploadedFiles.map((file) => {
                const originalName = file.name.slice(0, file.name.lastIndexOf("."))
                const selectedFormat = format() === 'original' ? file.name.slice(file.name.lastIndexOf(".") + 1) : format()
                const displayedFileName = `${originalName}.${selectedFormat}`

                return (
                  <li class="flex justify-between items-center gap-6 py-3 break-word border-b border-slate-200 dark:border-slate-700 last:border-0">
                    <div class="flex items-center gap-2">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        class="w-10 h-10 aspect-square object-cover rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                      />
                      <span class="text-sm text-slate-700 dark:text-white">{displayedFileName}</span>
                    </div>
                    <div class="flex items-center">
                      <button
                        type="button"
                        onClick={() => compressImage(file)}
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
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <Zip compressed={zipFiles()} />
        </>
      )}
    </>
  )
}

export default Compress
