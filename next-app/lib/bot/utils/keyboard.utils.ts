export function withCancel(keyboard: any[] = []) {
  return {
    inline_keyboard: [
      ...keyboard,
      [{ text: "❌ Cancel", callback_data: "cancel_flow" }],
    ],
  }
}