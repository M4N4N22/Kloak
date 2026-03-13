function generateProof(levels: any[][], index: number) {

  const siblings = []
  const directions = []

  let currentIndex = index

  for (let i = 0; i < levels.length - 1; i++) {

    const level = levels[i]

    const isRightNode = currentIndex % 2 === 1
    const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1

    const sibling = level[siblingIndex] ?? level[currentIndex]

    siblings.push(sibling)
    directions.push(isRightNode ? 1 : 0)

    currentIndex = Math.floor(currentIndex / 2)
  }

  return {
    siblings,
    directions
  }
}