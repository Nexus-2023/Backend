import { createHash } from "crypto"

// TODO : Implement CalulateScore
export function calculateScore(balance: number, slashed: boolean) {
  const threshold = 32000000000

  if (balance > threshold) {
    return slashed ? 80 : 99
  } else {
    return 50
  }
}

// Function to compare two arrays for equality
export function arraysEqual(array1: any, array2: any) {
  return JSON.stringify(array1) === JSON.stringify(array2)
}

export function hashData(data: any): string {
  const hash = createHash("sha256")
  hash.update(JSON.stringify(data))
  return hash.digest("hex")
}
