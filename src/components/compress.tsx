import { createSignal, createEffect, onCleanup, Show } from "solid-js"
import imageCompression from "browser-image-compression"
import formatMessage from "../utils/formatMessage"
import Zip from "./zip"

type CompressProps = {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
}

function Compress(props: CompressProps) {
  const [quality, setQuality] = createSignal<number>(0.8)
  const [errorFile, setErrorFile] = createSignal<{ message: string; timeout: number }[]>([])
  const [zipFiles, setZipFiles] = createSignal<{ file: File; format: string; original: string }[]>([])
  const [temp, setTemp] = createSignal<{ file: File; format: string; original: string }[]>([])
  const [loadingFiles, setLoadingFiles] = createSignal<string[]>([])
  const [filePreviews, setFilePreviews] = createSignal<Map<string, string>>(new Map())

  const handleQualityChange = (e: Event) => {
    const select = e.target as HTMLSelectElement
    const value = Number(select.value)
    if (value >= 0 && value <= 1) {
      setQuality(value)
      setZipFiles([])
      setTemp([])
    } else {
      addError("Pilihan kualitas tidak valid")
    }
  }

  const compressImage = async (file: File, downloadAll: boolean = false) => {
    try {
      setLoadingFiles((prev) => [...prev, file.name])

      const options = {
        maxSizeMB: quality() === 0.8 ? 3 : quality() === 0.6 ? 2 : 1,
        useWebWorker: true,
        initialQuality: quality(),
      }

      const original = file.name
      const extension = file.name.slice(file.name.lastIndexOf(".") + 1)

      const compressedFile = await imageCompression(file, options)

      const blob = new Blob([compressedFile], { type: file.type })
      const downloadFile = new File(
        [blob],
        `${file.name.split(".")[0]}.${file.name.split(".").pop()}`,
        { type: file.type }
      )

      if (downloadAll) {
        if (!temp().some((item) => item.file.name === downloadFile.name)) {
          setTemp((prev) => [...prev, { file: downloadFile, format: extension, original: original }])
        }
      } else {
        const link = document.createElement("a")
        link.href = URL.createObjectURL(downloadFile)
        link.download = downloadFile.name
        link.click()
        URL.revokeObjectURL(link.href)
      }
    } catch (error) {
      console.error(error)
      addError(`Kompresi gagal untuk ${file.name}`)
    } finally {
      setLoadingFiles((prev) => prev.filter((name) => name !== file.name))
    }
  }

  const addError = (message: string) => {
    const currentTime = Date.now()
    const newError = { message, timeout: currentTime + 5000 }
    setErrorFile((prev) => [...prev, newError])
  }

  const handleRemoveFile = (fileToRemove: File) => {
    props.setUploadedFiles(props.uploadedFiles.filter((file) => file.name !== fileToRemove.name))
    setZipFiles(zipFiles().filter((zip) => zip.original !== fileToRemove.name))

    setFilePreviews((prev) => {
      const newPreviews = new Map(prev)
      newPreviews.delete(fileToRemove.name)
      return newPreviews
    })
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
    if (props.uploadedFiles.length >= temp().length) {
      setZipFiles(temp())
    }
  })

  createEffect(() => {
    props.uploadedFiles.forEach((file) => {
      const blobPreview = URL.createObjectURL(file)
      setFilePreviews((prev) => {
        const newPreviews = new Map(prev)
        newPreviews.set(file.name, blobPreview)
        return newPreviews
      })
    })
  })

  createEffect(() => {
    onCleanup(() => {
      filePreviews().forEach((blobPreview) => {
        URL.revokeObjectURL(blobPreview)
      })
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
              <select onChange={handleQualityChange} class="input relative z-[1] pr-10 bg-transparent appearance-none">
                <option value="0.8">Kualitas Bagus</option>
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
                const isLoading = loadingFiles().includes(file.name)
                const blobPreview = filePreviews().get(file.name)

                return (
                  <li class="flex justify-between items-center gap-6 py-3 break-word border-b border-slate-200 dark:border-slate-700 last:border-0">
                    <div class="flex items-center gap-2">
                      <img
                        src={blobPreview}
                        alt={file.name}
                        class="w-10 h-10 aspect-square object-cover rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                      />
                      <span class="text-sm text-slate-700 dark:text-white">{file.name}</span>
                    </div>
                    <div class="flex items-center">
                      {isLoading ?
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="animate-spin h-5 w-5 text-cyan-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          />
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                      :
                        <>
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
                        </>
                      }
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
