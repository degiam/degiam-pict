import { createSignal, JSX } from "solid-js"

type PopoverProps = {
  content: string | JSX.Element;
  children: JSX.Element;
}

const Popover = (props: PopoverProps) => {
  const [isVisible, setIsVisible] = createSignal(false)
  const [position, setPosition] = createSignal({ x: 0, y: 0 })

  const handleMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const maxPopoverWidth = 200
    const popoverPadding = 10

    const x = Math.min(
      clientX + 0,
      screenWidth - maxPopoverWidth - popoverPadding
    )
    const y = Math.min(
      clientY + 80,
      screenHeight - popoverPadding
    )

    setPosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <div
      class="inline-block"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {props.children}
      {isVisible() && (
        <div
          class="absolute bg-black text-white px-4 py-3 text-sm rounded-xl z-10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 max-w-[200px] break-word after:content-[''] after:absolute after:-top-3.5 after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-0 after:border-8 after:border-t-transparent after:border-x-transparent after:border-b-black"
          style={{
            top: `${position().y}px`,
            left: `${position().x}px`,
          }}
        >
          {props.content}
        </div>
      )}
    </div>
  )
}

export default Popover
