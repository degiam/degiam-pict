import { createEffect } from "solid-js";

type ConvertProps = {
  uploadedFiles: File[];
}

function Convert(props: ConvertProps) {
  createEffect(() => {
    console.log(props.uploadedFiles)
  })

  return (
    <div class="p-6 bg-gradient-to-tr from-slate-50/20 via-slate-50 to-cyan-50 dark:from-slate-800/10  dark:via-slate-800/50 dark:to-cyan-900/50 rounded-2xl text-sm">
      <p class="text-center text-slate-400/60 dark:text-slate-600 italic">
        Work still in progress<span class="absolute dots"></span>
      </p>
    </div>
  )
}

export default Convert
