import { createEffect } from "solid-js";
// import formatFileSize from "../utils/formatFileSize"

type CompressProps = {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
}

function Compress(props: CompressProps) {
  // const handleRemoveFile = (fileToRemove: File) => {
  //   props.setUploadedFiles(props.uploadedFiles.filter((file) => file.name !== fileToRemove.name))
  // }

  createEffect(() => {
    console.log(props.uploadedFiles)
  })

  return (
    <>
      {/* {props.uploadedFiles.length > 0 && (
        <ul class="w-full mb-8">
          {props.uploadedFiles.map((file) => (
            <li class="flex justify-between items-center gap-6 py-3 break-word border-b border-slate-200 dark:border-slate-700 last:border-0">
              <div class="flex items-center gap-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  class="w-10 h-10 aspect-square object-cover rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
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
      )} */}

      <div class="p-6 bg-gradient-to-tr from-slate-50/20 via-slate-50 to-cyan-50 dark:from-slate-800/10 dark:via-slate-800/50 dark:to-cyan-900/50 rounded-2xl text-sm">
        <p class="text-center text-slate-400/80 dark:text-slate-600 italic">
          Fitur kompresi gambar sedang dalam pengembangan<span class="absolute dots"></span>
        </p>
      </div>
    </>
  )
}

export default Compress
