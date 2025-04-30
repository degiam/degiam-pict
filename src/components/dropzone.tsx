import { createEffect, createSignal, JSX, onCleanup, Show } from "solid-js"
import formatMessage from "../utils/formatMessage"
import Brand from "./brand"
import Built from "./built"
import Popover from "./popover"

type DropzoneProps = {
  children?: JSX.Element[];
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  ios: boolean;
}

function Dropzone(props: DropzoneProps) {
  const [isDragActive, setIsDragActive] = createSignal(false)
  const [activeMode, setActiveMode] = createSignal<"convert" | "compress" | "removebg">("convert")
  const [errorFile, setErrorFile] = createSignal<{ message: string; timeout: number }[]>([])
  const [isFadingOut, setIsFadingOut] = createSignal(false)
  const [menuScrolled, setMenuScrolled] = createSignal(false)
  const menuRefs: any = []

  let dragCounter = 0
  let fileInputRef: HTMLInputElement | undefined

  const handleMenuActive = (mode: any, index: number) => {
    setActiveMode(mode)
    menuRefs[index].scrollIntoView({ behavior: "smooth", inline: "center" })
  }

  const validImageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp", "tiff"]
  const isImage = (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    return validImageExtensions.includes(fileExtension || "")
  }

  const isValidImage = async (file: File) => {
    return new Promise<boolean>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const arr = new Uint8Array(reader.result as ArrayBuffer)
        const header = arr.subarray(0, 4).reduce((acc, byte) => acc + byte.toString(16), "")

        const validHeaders = [
          "ffd8",     // JPEG
          "89504e47", // PNG
          "47494638", // GIF
          "424d",     // BMP
          "49492a00", // TIFF (little-endian)
          "4d4d002a", // TIFF (big-endian)
        ]

        const isValidHeader = validHeaders.some((valid) => header.startsWith(valid))

        if (!isValidHeader) {
          if (header === "52494646") {
            const type = arr.subarray(8, 12).reduce((acc, byte) => acc + String.fromCharCode(byte), "")
            if (type === "WEBP" || type === "avif") {
              resolve(true)
              return
            }
          }
          resolve(false)
        } else {
          resolve(true)
        }
      }
      reader.onerror = () => resolve(false)
      reader.readAsArrayBuffer(file.slice(0, 12))
    })
  }

  const handleDrop = async (files: File[]) => {
    setErrorFile([])
    setIsFadingOut(false)
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
      const isValid = await isValidImage(file)
      if (
        file.size > 0 &&
        file.type.startsWith("image/") &&
        isImage(file) &&
        isValid &&
        !props.uploadedFiles.some((uploaded) => uploaded.name === file.name)
      ) {
        validFiles.push(file)
      } else {
        if (file.size === 0) {
          errors.push(`*${file.name}* bukan file yang valid`)
        } else if (!file.type.startsWith("image/")) {
          errors.push(`*${file.name}* bukan file gambar`)
        } else if (!isImage(file)) {
          errors.push(`Ekstensi tidak didukung untuk *${file.name}*`)
        } else if (!isValid) {
          errors.push(`*${file.name}* bukan gambar yang valid`)
        } else if (props.uploadedFiles.some((uploaded) => uploaded.name === file.name)) {
          errors.push(`*${file.name}* sudah diunggah`)
        } else {
          errors.push(`*${file.name}* tidak valid`)
        }
      }
    }
    props.setUploadedFiles([...props.uploadedFiles, ...validFiles])
    setIsDragActive(false)
    dragCounter = 0

    if (errors.length > 0) {
      const currentTime = Date.now()
      const newErrors = errors.map((error) => ({
        message: error,
        timeout: currentTime + 10000,
      }))
      setErrorFile([...errorFile(), ...newErrors])
    }
  }

  createEffect(() => {
    const body = document.querySelector('body') as HTMLElement
    const container = document.querySelector('.menu-container') as HTMLDivElement
    if ((container.clientWidth + 6) > body.clientWidth) {
      setMenuScrolled(true)
    }

    const interval = setInterval(() => {
      const currentTime = Date.now()
      setErrorFile((prev) => prev.filter((error: any) => error.timeout > currentTime))
    }, 1000)
  
    onCleanup(() => clearInterval(interval))
  })
  
  window.addEventListener("dragend", () => {
    dragCounter = 0
    setIsDragActive(false)
  })

  return (
    <div
      class="flex justify-center items-center min-h-screen p-6 main-layout"
      onDragEnter={(e) => {
        e.preventDefault()
        dragCounter++
        if (dragCounter === 1) {
          setIsDragActive(true)
        }
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        dragCounter = Math.max(0, dragCounter - 1)
        if (dragCounter === 0) {
          setIsDragActive(false)
        }
      }}
    >
      <section
        class={`fixed top-0 left-0 w-full h-full p-8 transition ${
          isDragActive()
            ? "z-10 bg-slate-950/70 backdrop-blur-lg"
            : "-z-10 opacity-0"
        }`}
        onDrop={(e) => {
          e.preventDefault()
          const files = Array.from(e.dataTransfer?.files ?? [])
          if (files.length > 0) {
            handleDrop(files)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <div
          class={`flex items-center justify-center w-full h-full ${
            isDragActive()
              ? "rounded-3xl border-4 border-dashed border-cyan-500"
              : ""
          }`}
        >
          <h2 class="text-4xl font-bold text-cyan-500 text-center">Letakkan Gambar Disini</h2>
        </div>
      </section>

      <section class={`w-full max-w-lg ${props.uploadedFiles.length < 1 ? "mb-20" : ""}`}>
        <div class="w-fit mx-auto mb-4">
          <Popover content="Konversi dan kompresi gambar secepat kilat tanpa instal Photoshop">
            <Brand />
          </Popover>
        </div>

        <div class="mb-8 -mx-6 px-6 overflow-auto scrollbar-none">
          <div class={`menu-container ${props.ios ? "max-md:[&.active_button:last-child]:mr-6" : ""} ${menuScrolled() ? "active" : ""} flex justify-center gap-2 w-max mx-auto`}>
            <button
              type="button"
              ref={el => menuRefs[0] = el}
              onClick={() => handleMenuActive("convert", 0)}
              class={`whitespace-nowrap min-w-24 px-3.5 py-2.5 rounded-lg transition border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 [&.active]:pointer-events-none [&.active]:text-white dark:[&.active]:hover:text-white [&.active]:border-cyan-500 [&.active]:bg-cyan-500 dark:[&.active]:bg-cyan-600 ${
                activeMode() === "convert"
                  ? "active"
                  : ""
              }`}
            >
              Konversi
            </button>
            <button
              type="button"
              ref={el => menuRefs[1] = el}
              onClick={() => handleMenuActive("compress", 1)}
              class={`whitespace-nowrap min-w-24 px-3.5 py-2.5 rounded-lg transition border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 [&.active]:pointer-events-none [&.active]:text-white dark:[&.active]:hover:text-white [&.active]:border-cyan-500 [&.active]:bg-cyan-500 dark:[&.active]:bg-cyan-600 ${
                activeMode() === "compress"
                  ? "active"
                  : ""
              }`}
            >
              Kompresi
            </button>
            {/* <button
              type="button"
              ref={el => menuRefs[2] = el}
              onClick={() => handleMenuActive("removebg", 2)}
              class={`whitespace-nowrap min-w-24 px-3.5 py-2.5 rounded-lg transition border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 [&.active]:pointer-events-none [&.active]:text-white dark:[&.active]:hover:text-white [&.active]:border-cyan-500 [&.active]:bg-cyan-500 dark:[&.active]:bg-cyan-600 ${
                activeMode() === "removebg"
                  ? "active"
                  : ""
              }`}
            >
              Hapus Latar Belakang
            </button> */}
            <a
              href="https://www.photoroom.com/tools/background-remover"
              rel="noopener noreferrer"
              target="_blank"
              class="whitespace-nowrap min-w-24 px-3.5 py-2.5 rounded-lg transition border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 [&.active]:pointer-events-none [&.active]:text-white dark:[&.active]:hover:text-white [&.active]:border-cyan-500 [&.active]:bg-cyan-500 dark:[&.active]:bg-cyan-600"
            >
              Hapus Latar Belakang
            </a>
          </div>
        </div>

        <div
          class="w-full p-6 transition rounded-2xl border-2 border-dashed hover:border-cyan-400 dark:border-slate-700 dark:hover:border-cyan-500 hover:cursor-pointer"
          onClick={() => fileInputRef?.click()}
          onDrop={(e) => {
            e.preventDefault()
            const files = Array.from(e.dataTransfer?.files ?? [])
            if (files.length > 0) {
              handleDrop(files)
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <label for="file_input" class="sr-only">
            Gambar
          </label>
          <input
            ref={(el) => (fileInputRef = el)}
            id="file_input"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              handleDrop(files)
            }}
          />
          <div class="text-center py-4">
            <h2 class="text-xl font-semibold text-slate-800 dark:text-white">
              Tarik & Taruh Gambar Disini
            </h2>
            <p class="text-sm text-slate-400 dark:text-slate-600 mt-2">
              atau klik untuk telusuri
            </p>
          </div>
        </div>

        <Show when={errorFile().length > 0}>
          <div class={`mt-8 -mb-3 p-4 bg-red-100 text-red-700 rounded-lg text-sm transition duration-500 ${
            isFadingOut() ? "opacity-0 -translate-y-4" : "opacity-100 -translate-y-0"
          }`}>
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

        <div class="mt-8">
          <Show when={activeMode() === "convert"}>{props.children?.[0]}</Show>
          <Show when={activeMode() === "compress"}>{props.children?.[1]}</Show>
          <Show when={activeMode() === "removebg"}>{props.children?.[2]}</Show>
        </div>

        <Built />
      </section>
    </div>
  )
}

export default Dropzone
