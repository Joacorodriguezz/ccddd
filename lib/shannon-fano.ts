interface ShannonFanoSymbol {
  char: string
  freq: number
  probability: number
  code: string
}

export class ShannonFanoEncoder {
  private codeTable: Map<string, string> = new Map()
  private originalText = ""
  private symbols: ShannonFanoSymbol[] = []

  encode(text: string): string {
    if (!text) return ""

    this.originalText = text
    const frequencies = this.calculateFrequencies(text)
    this.symbols = this.createSymbols(frequencies, text.length)
    this.buildCodes(this.symbols)

    // Crear tabla de códigos
    this.codeTable.clear()
    this.symbols.forEach((symbol) => {
      this.codeTable.set(symbol.char, symbol.code)
    })

    // Codificar el texto
    return text
      .split("")
      .map((char) => this.codeTable.get(char) || "")
      .join("")
  }

  decode(encodedText: string): string {
    if (!encodedText || this.codeTable.size === 0) return ""

    // Crear tabla inversa (código -> carácter)
    const reverseTable = new Map<string, string>()
    this.codeTable.forEach((code, char) => {
      reverseTable.set(code, char)
    })

    let result = ""
    let currentCode = ""

    for (const bit of encodedText) {
      currentCode += bit

      if (reverseTable.has(currentCode)) {
        result += reverseTable.get(currentCode)
        currentCode = ""
      }
    }

    return result
  }

  private calculateFrequencies(text: string): Map<string, number> {
    const frequencies = new Map<string, number>()
    for (const char of text) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1)
    }
    return frequencies
  }

  private createSymbols(frequencies: Map<string, number>, totalLength: number): ShannonFanoSymbol[] {
    return Array.from(frequencies.entries())
      .map(([char, freq]) => ({
        char,
        freq,
        probability: freq / totalLength,
        code: "",
      }))
      .sort((a, b) => b.probability - a.probability) // Ordenar por probabilidad descendente
  }

  private buildCodes(symbols: ShannonFanoSymbol[], prefix = ""): void {
    if (symbols.length === 0) return

    if (symbols.length === 1) {
      symbols[0].code = prefix || "0"
      return
    }

    // Encontrar el punto de división más equilibrado
    const totalProb = symbols.reduce((sum, s) => sum + s.probability, 0)
    let bestSplit = 0
    let bestDifference = Number.POSITIVE_INFINITY

    for (let i = 1; i < symbols.length; i++) {
      const leftProb = symbols.slice(0, i).reduce((sum, s) => sum + s.probability, 0)
      const rightProb = totalProb - leftProb
      const difference = Math.abs(leftProb - rightProb)

      if (difference < bestDifference) {
        bestDifference = difference
        bestSplit = i
      }
    }

    // Dividir en dos grupos
    const leftGroup = symbols.slice(0, bestSplit)
    const rightGroup = symbols.slice(bestSplit)

    // Asignar códigos recursivamente
    this.buildCodes(leftGroup, prefix + "0")
    this.buildCodes(rightGroup, prefix + "1")
  }

  getCodeTable(): Map<string, string> {
    return this.codeTable
  }

  getStatistics() {
    if (!this.originalText) {
      return {
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: "0.00",
        averageLength: "0.00",
        efficiency: "0.00",
      }
    }

    const originalBits = this.originalText.length * 8
    const compressedBits = this.originalText.split("").reduce((total, char) => {
      return total + (this.codeTable.get(char)?.length || 0)
    }, 0)

    const compressionRatio = originalBits > 0 ? ((originalBits - compressedBits) / originalBits) * 100 : 0
    const averageLength = this.originalText.length > 0 ? compressedBits / this.originalText.length : 0

    return {
      originalSize: originalBits,
      compressedSize: compressedBits,
      compressionRatio: compressionRatio.toFixed(2),
      averageLength: averageLength.toFixed(2),
      efficiency: (compressionRatio > 0 ? compressionRatio : 0).toFixed(2),
    }
  }
}
