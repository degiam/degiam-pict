function formatMessage(message: string) {
  const parts = message.split(/\*(.*?)\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? `<strong>${part}</strong>` : part
  ).join("");
}

export default formatMessage;