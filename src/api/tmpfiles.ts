export async function uploadTempFile(file: any): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${import.meta.env.VITE_TMPFILES_API}`, {
    method: "POST",
    body: formData,
  })

  const data = await response.json()
  if (response.ok) {
    const domain = "https://tmpfiles.org/"
    const id = data.data.url.split(domain)[1]
    const url = `${domain}dl/${id}`
    return url
  } else {
    throw new Error(data.message || "Gagal mengunggah file")
  }
}
