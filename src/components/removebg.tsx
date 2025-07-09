import { createSignal, createEffect, onCleanup, Show } from "solid-js"
import { removeBg } from "../api/zest";
import { uploadTempFile } from "../api/tmpfiles";
import formatMessage from "../utils/formatMessage"

type RemoveBgProps = {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
}

function RemoveBg(props: RemoveBgProps) {
  const [errorFile, setErrorFile] = createSignal<{ message: string; timeout: number }[]>([])
  const [zipFiles, setZipFiles] = createSignal<{ file: File; format: string; original: string }[]>([])
  const [loadingFiles, setLoadingFiles] = createSignal<string[]>([])
  const [filePreviews, setFilePreviews] = createSignal<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [errorUrl, setErrorUrl] = createSignal<string | null>(null);
  const [openNewTab, setOpenNewTab] = createSignal<boolean>(false);

  const processing = async (url: string, title: string, form: boolean = true) => {
    const result: any = await removeBg(encodeURIComponent(url))
    if (result) {
      const imageUrl = result.images.preview
      if (openNewTab() && form) {
        window.open(imageUrl, "_blank")
      } else {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = title
        link.click()
        URL.revokeObjectURL(link.href)
      }
    } else {
      addError(`Hapus latar belakang gagal untuk ${title}`)
    }
  }

  const removeBgImage = async (file: File) => {
    try {
      setLoadingFiles((prev) => [...prev, file.name])

      const upload: any = await uploadTempFile(file)
      processing(upload, file.name, false)
    } catch (error) {
      console.error(error)
      addError(`Hapus latar belakang gagal untuk ${file.name}`)
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

  const handleRemoveBgByUrl = async (e: SubmitEvent) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const url = formData.get("url_image") as string

    setIsLoading(true)

    try {
      const parsedUrl = new URL(url)

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setErrorUrl("URL harus dimulai dengan http atau https")
      } else if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
        setErrorUrl("URL tidak boleh berasal dari localhost")
      } else {
        await processing(url, "KiePict")
      }
    } catch (error) {
      addError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div class="text-slate-400 dark:text-slate-600 text-sm text-center mb-8">atau masukkan URL gambar</div>
      <form onSubmit={handleRemoveBgByUrl} class="relative">
        <fieldset class="flex flex-col gap-2">
          <label class="sr-only" for="url_image">URL</label>
          <input
            id="url_image"
            name="url_image"
            type="url"
            placeholder="https://"
            class={`input pr-14 ${errorUrl() ? "border-red-500" : ""}`}
          />
          {errorUrl &&
            <p class="text-xs text-red-500">{errorUrl()}</p>
          }
        </fieldset>
        <fieldset class="flex gap-2">
          <input
            id="open_new_tab"
            type="checkbox"
            onChange={(e) => setOpenNewTab(e.target.checked)}
            class="sr-only peer"
          />
          <div class="w-4 h-4 flex items-center justify-center border border-gray-400/50 dark:border-gray-500 rounded-sm bg-slate-100 dark:bg-slate-700/70 peer-checked:bg-cyan-500 dark:peer-checked:bg-cyan-500 peer-checked:border-cyan-500 peer-checked:text-white dark:peer-checked:text-slate-800 cursor-pointer">
            {openNewTab() &&
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"  stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12l5 5l10 -10" />
              </svg>
            }
          </div>
          <label class="text-slate-400 dark:text-slate-500 text-xs cursor-pointer" for="open_new_tab">Buka pada tab baru</label>
        </fieldset>
        <fieldset class="absolute top-1.5 right-1.5">
          <button
            type="submit"
            class={`h-full w-full p-2 rounded-lg transition font-bold relative flex items-center justify-center gap-2 text-white border border-cyan-500 hover:border-cyan-600 bg-cyan-500 hover:bg-cyan-600 ${isLoading() ? "pointer-events-none" : ""}`}
          >
            <span class="sr-only">Kirim</span>
            {isLoading() ?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="animate-spin h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle
                  class="opacity-50"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            :
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-white"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z" />
                <path d="M6.5 12h14.5" />
              </svg>
            }
          </button>
        </fieldset>
      </form>

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
                            onClick={() => removeBgImage(file)}
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
        </>
      )}
    </>
  )
}

export default RemoveBg
