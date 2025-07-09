export async function uploadTempFile(file: any): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${import.meta.env.VITE_TMPFILES_API}`, {
    method: "POST",
    body: formData,
  })

  const result = await response.json()
  if (response.ok) {
    return result.data.url
  } else {
    throw new Error(result.message || "Gagal mengunggah file")
  }
}
