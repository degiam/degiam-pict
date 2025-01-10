import Brand from "./brand"
import Built from "./built"

function Picture() {
  return (
    <div class="flex justify-center items-center min-h-screen p-6 main-layout">
      <section class="w-full max-w-lg">
        <div class="w-fit mx-auto mb-4">
          <Brand />
        </div>

        <p class="text-center opacity-50">Elit nisi fugiat quis ut. Aliquip in cillum quis commodo irure magna aute ad laboris fugiat laborum enim reprehenderit cupidatat.</p>

        <Built />
      </section>
    </div>
  )
}

export default Picture