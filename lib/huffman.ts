interface HuffmanNode {
  char: string | null
  freq: number
  left: HuffmanNode | null
  right: HuffmanNode | null
}

export class HuffmanEncoder {
  private tree: HuffmanNode | null = null
  private codeTable: Map<string, string> = new Map()
  private originalText = ""

  encode(text: string): string {
    if (!text) return ""

    this.originalText = text
    const frequencies = this.calculateFrequencies(text)

    // Caso especial: solo un carácter único
    if (frequencies.size === 1) {
      const char = Array.from(frequencies.keys())[0]
      this.codeTable.set(char, "0")
      this.tree = { char, freq: frequencies.get(char)!, left: null, right: null }
      return "0".repeat(text.length)
    }

    this.tree = this.buildTree(frequencies)
    this.codeTable = this.generateCodes(this.tree)

    // Codificar el texto usando la tabla de códigos
    return text
      .split("")
      .map((char) => this.codeTable.get(char) || "")
      .join("")
  }

  decode(encodedText: string, tree?: HuffmanNode): string {
    const useTree = tree || this.tree
    if (!useTree || !encodedText) return ""

    // Caso especial: solo un carácter
    if (useTree.char !== null) {
      return useTree.char.repeat(encodedText.length)
    }

    let result = ""
    let currentNode = useTree

    for (const bit of encodedText) {
      if (bit === "0") {
        currentNode = currentNode.left!
      } else if (bit === "1") {
        currentNode = currentNode.right!
      }

      // Si llegamos a una hoja
      if (currentNode && currentNode.char !== null) {
        result += currentNode.char
        currentNode = useTree // Volver a la raíz
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

  private buildTree(frequencies: Map<string, number>): HuffmanNode {
    const nodes: HuffmanNode[] = Array.from(frequencies.entries()).map(([char, freq]) => ({
      char,
      freq,
      left: null,
      right: null,
    }))

    // Construir el árbol de Huffman
    while (nodes.length > 1) {
      // Ordenar por frecuencia (menor a mayor)
      nodes.sort((a, b) => a.freq - b.freq)

      // Tomar los dos nodos con menor frecuencia
      const left = nodes.shift()!
      const right = nodes.shift()!

      // Crear nuevo nodo interno
      const merged: HuffmanNode = {
        char: null,
        freq: left.freq + right.freq,
        left,
        right,
      }

      nodes.push(merged)
    }

    return nodes[0]
  }

  private generateCodes(node: HuffmanNode | null, code = "", codes = new Map<string, string>()): Map<string, string> {
    if (!node) return codes

    // Si es una hoja (tiene carácter)
    if (node.char !== null) {
      codes.set(node.char, code || "0")
      return codes
    }

    // Recorrer subárboles
    if (node.left) this.generateCodes(node.left, code + "0", codes)
    if (node.right) this.generateCodes(node.right, code + "1", codes)

    return codes
  }

  getTree(): HuffmanNode | null {
    return this.tree
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
