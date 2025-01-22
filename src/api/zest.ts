export async function removeBg(url: string): Promise<string> {
  const response = await fetch(`${import.meta.env.VITE_ZEST_API}?url=${url}`)

  const data = await response.json()
  if (response.ok) {
    return data
  } else {
    throw new Error(data.message || "Gagal menghapus latar belakang")
  }
}
