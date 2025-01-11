import { createSignal, JSX, Show } from "solid-js"
import formatFileSize from "../utils/formatFileSize"
import Brand from "./brand"
import Built from "./built"

type DropzoneProps = {
  children?: JSX.Element[];
}

function Dropzone(props: DropzoneProps) {
  const [uploadedFiles, setUploadedFiles] = createSignal<File[]>([])
  const [isDragActive, setIsDragActive] = createSignal(false)
  const [activeMode, setActiveMode] = createSignal<"compress" | "convert">("compress")
  let dragCounter = 0
  let fileInputRef: HTMLInputElement | undefined

  const handleDrop = (files: File[]) => {
    const validFiles = files.filter(
      (file) =>
        file.size > 0 &&
        file.type !== "" &&
        !uploadedFiles().some((uploaded) => uploaded.name === file.name)
    )
    setUploadedFiles((prev) => [...prev, ...validFiles])
    setIsDragActive(false)
    dragCounter = 0
  }
  
  window.addEventListener("dragend", () => {
    dragCounter = 0
    setIsDragActive(false)
  })
  

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileToRemove.name))
  }

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
          <h2 class="text-4xl font-bold text-cyan-500">Letakkan Gambar Disini</h2>
        </div>
      </section>

      <section class="w-full max-w-lg mb-20">
        <div class="w-fit mx-auto mb-4">
          <Brand />
        </div>

        <div class="flex justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setActiveMode("compress")}
            class={`min-w-24 px-3.5 py-2.5 rounded-lg transition border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 [&.active]:pointer-events-none [&.active]:text-white [&.active]:border-cyan-500 [&.active]:bg-cyan-500 [&.active]:dark:bg-cyan-600 ${
              activeMode() === "compress"
                ? "active"
                : ""
            }`}
          >
            Kompresi
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("convert")}
            class={`min-w-24 px-3.5 py-2.5 rounded-lg transition border border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 [&.active]:pointer-events-none [&.active]:text-white [&.active]:border-cyan-500 [&.active]:bg-cyan-500 [&.active]:dark:bg-cyan-600 ${
              activeMode() === "convert"
                ? "active"
                : ""
            }`}
          >
            Konversi
          </button>
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
              Tarik dan Taruh Gambar Disini
            </h2>
            <p class="text-sm text-slate-400 dark:text-slate-600 mt-2">
              atau klik untuk telusuri
            </p>
          </div>
        </div>

        <div class="w-full mt-8">
          {uploadedFiles().length > 0 && (
            <ul class="mb-8">
              {uploadedFiles().map((file) => (
                <li class="flex justify-between items-center gap-6 py-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <div class="flex items-center gap-2">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      class="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <span class="text-sm text-slate-700 dark:text-white">{file.name}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatFileSize(file.size)}</span>
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
              ))}
            </ul>
          )}
        </div>

        <Show when={activeMode() === "compress"}>{props.children?.[0]}</Show>
        <Show when={activeMode() === "convert"}>{props.children?.[1]}</Show>

        <Built />
      </section>
    </div>
  )
}

export default Dropzone
