"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, BarChart3, TreePine } from "lucide-react"
import { HuffmanEncoder } from "../lib/huffman"
import { ShannonFanoEncoder } from "../lib/shannon-fano"
import ComparisonChart from "./comparison-chart"
import AlgorithmVisualization from "./algorithm-visualization"
import ResultsTable from "./results-table"

export default function CompressionApp() {
  const [inputText, setInputText] = useState("")
  const [encodedText, setEncodedText] = useState("")
  const [decodedText, setDecodedText] = useState("")
  const [huffmanResults, setHuffmanResults] = useState(null)
  const [shannonFanoResults, setShannonFanoResults] = useState(null)
  const [activeTab, setActiveTab] = useState("encode")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputText(content)
      }
      reader.readAsText(file)
    }
  }

  const handleEncode = () => {
    if (!inputText.trim()) {
      alert("Por favor ingrese un texto para codificar")
      return
    }

    try {
      // Huffman encoding
      const huffman = new HuffmanEncoder()
      const huffmanEncoded = huffman.encode(inputText)
      const huffmanStats = huffman.getStatistics()

      // Shannon-Fano encoding
      const shannonFano = new ShannonFanoEncoder()
      const shannonFanoEncoded = shannonFano.encode(inputText)
      const shannonFanoStats = shannonFano.getStatistics()

      setHuffmanResults({
        encoded: huffmanEncoded,
        stats: huffmanStats,
        tree: huffman.getTree(),
        table: huffman.getCodeTable(),
        encoder: huffman, // Guardar la instancia para decodificar
      })

      setShannonFanoResults({
        encoded: shannonFanoEncoded,
        stats: shannonFanoStats,
        table: shannonFano.getCodeTable(),
        encoder: shannonFano, // Guardar la instancia para decodificar
      })

      setEncodedText(huffmanEncoded) // Mostrar resultado de Huffman por defecto
      console.log("Texto original:", inputText)
      console.log("Huffman codificado:", huffmanEncoded)
      console.log("Shannon-Fano codificado:", shannonFanoEncoded)
    } catch (error) {
      console.error("Error al codificar:", error)
      alert("Error al codificar el texto")
    }
  }

  const handleDecode = () => {
    if (!encodedText.trim()) {
      alert("Por favor ingrese un texto codificado para decodificar")
      return
    }

    if (!huffmanResults?.encoder) {
      alert("Primero debe codificar un texto")
      return
    }

    try {
      const decoded = huffmanResults.encoder.decode(encodedText)
      setDecodedText(decoded)
      console.log("Texto decodificado:", decoded)

      // Verificar si la decodificación es correcta
      if (decoded === inputText) {
        console.log("✅ Decodificación exitosa - coincide con el original")
      } else {
        console.log("⚠️ La decodificación no coincide con el texto original")
      }
    } catch (error) {
      console.error("Error al decodificar:", error)
      alert("Error al decodificar el texto")
    }
  }

  const handleCompress = () => {
    if (!inputText.trim()) {
      alert("Por favor ingrese un texto para comprimir")
      return
    }

    try {
      // Limpiar resultados anteriores
      setEncodedText("")
      setDecodedText("")

      // Crear nuevas instancias de los encoders
      const huffman = new HuffmanEncoder()
      const huffmanEncoded = huffman.encode(inputText)
      const huffmanStats = huffman.getStatistics()

      const shannonFano = new ShannonFanoEncoder()
      const shannonFanoEncoded = shannonFano.encode(inputText)
      const shannonFanoStats = shannonFano.getStatistics()

      setHuffmanResults({
        encoded: huffmanEncoded,
        stats: huffmanStats,
        tree: huffman.getTree(),
        table: huffman.getCodeTable(),
        encoder: huffman,
      })

      setShannonFanoResults({
        encoded: shannonFanoEncoded,
        stats: shannonFanoStats,
        table: shannonFano.getCodeTable(),
        encoder: shannonFano,
      })

      // Mostrar el texto comprimido
      setEncodedText(huffmanEncoded)
      console.log("=== COMPRESIÓN REALIZADA ===")
      console.log("Texto original:", inputText)
      console.log("Huffman comprimido:", huffmanEncoded)
      console.log("Shannon-Fano comprimido:", shannonFanoEncoded)
    } catch (error) {
      console.error("Error al comprimir:", error)
      alert("Error al comprimir el texto")
    }
  }

  const handleDecompress = () => {
    if (!inputText.trim()) {
      alert("Por favor ingrese un texto codificado para descomprimir")
      return
    }

    if (!huffmanResults?.encoder) {
      alert("Primero debe comprimir un texto para poder descomprimir")
      return
    }

    try {
      // Usar el texto del área de entrada como código a descomprimir
      const codeToDecompress = inputText.trim()
      const huffmanDecoded = huffmanResults.encoder.decode(codeToDecompress)

      // También intentar con Shannon-Fano si está disponible
      let shannonFanoDecoded = ""
      if (shannonFanoResults?.encoder) {
        shannonFanoDecoded = shannonFanoResults.encoder.decode(codeToDecompress)
      }

      setDecodedText(huffmanDecoded)
      console.log("=== DESCOMPRESIÓN REALIZADA ===")
      console.log("Código a descomprimir:", codeToDecompress)
      console.log("Huffman descomprimido:", huffmanDecoded)
      if (shannonFanoDecoded) {
        console.log("Shannon-Fano descomprimido:", shannonFanoDecoded)
      }
    } catch (error) {
      console.error("Error al descomprimir:", error)
      alert("Error al descomprimir el texto. Verifique que el código sea válido.")
    }
  }

  const handleClear = () => {
    setInputText("")
    setEncodedText("")
    setDecodedText("")
    setHuffmanResults(null)
    setShannonFanoResults(null)
    console.log("=== DATOS LIMPIADOS ===")
  }

  const handleUseCompressed = () => {
    if (encodedText) {
      setInputText(encodedText)
      console.log("Código comprimido copiado al área de entrada")
    } else {
      alert("Primero debe comprimir un texto")
    }
  }

  const handleUseDecompressed = () => {
    if (decodedText) {
      setInputText(decodedText)
      console.log("Texto descomprimido copiado al área de entrada")
    } else {
      alert("Primero debe descomprimir un código")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              CODIFICACIÓN DE DATOS - HUFFMAN Y SHANNON-FANO
            </CardTitle>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="encode">Codificación</TabsTrigger>
            <TabsTrigger value="compress">Compresión</TabsTrigger>
            <TabsTrigger value="compare">Comparación</TabsTrigger>
            <TabsTrigger value="visualize">Visualización</TabsTrigger>
          </TabsList>

          {/* Encoding/Decoding Tab */}
          <TabsContent value="encode" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Codificación y decodificación de texto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Ingrese el texto aquí"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-32"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />O sube tu archivo aquí
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleEncode} className="flex-1 bg-gray-600 hover:bg-gray-700">
                        Codificar
                      </Button>
                      <Button onClick={handleDecode} className="flex-1 bg-gray-600 hover:bg-gray-700">
                        Decodificar
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Textarea
                      placeholder="Aquí aparecerá tu Resultado"
                      value={decodedText || encodedText}
                      readOnly
                      className="min-h-48"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compression Tab */}
          <TabsContent value="compress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Entrada de Texto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ingrese el texto aquí"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-48"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCompress} className="flex-1 bg-gray-600 hover:bg-gray-700">
                    Comprimir
                  </Button>
                  <Button onClick={handleDecompress} className="flex-1 bg-gray-600 hover:bg-gray-700">
                    Descomprimir
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleClear} variant="outline" className="flex-1">
                    Limpiar Todo
                  </Button>
                  <Button onClick={handleUseCompressed} variant="outline" className="flex-1">
                    Usar Código Comprimido
                  </Button>
                  <Button onClick={handleUseDecompressed} variant="outline" className="flex-1">
                    Usar Texto Descomprimido
                  </Button>
                </div>

                {/* Mostrar resultados */}
                {encodedText && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Texto Comprimido (Huffman):</h4>
                    <div className="bg-white p-2 rounded border font-mono text-sm break-all">{encodedText}</div>
                  </div>
                )}

                {decodedText && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Texto Descomprimido:</h4>
                    <div className="bg-white p-2 rounded border">{decodedText}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {(huffmanResults || shannonFanoResults) && (
              <Card>
                <CardHeader>
                  <CardTitle>Comparación de Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-center bg-gray-200 p-2 rounded">Algoritmo Huffman</h3>
                      {huffmanResults && <ResultsTable results={huffmanResults.stats} algorithm="Huffman" />}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-center bg-gray-200 p-2 rounded">
                        Algoritmo Shannon-Fano
                      </h3>
                      {shannonFanoResults && (
                        <ResultsTable results={shannonFanoResults.stats} algorithm="Shannon-Fano" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="compare" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Comparación de Algoritmos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {huffmanResults && shannonFanoResults ? (
                  <ComparisonChart huffmanStats={huffmanResults.stats} shannonFanoStats={shannonFanoResults.stats} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Primero debe codificar un texto para ver la comparación
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visualization Tab */}
          <TabsContent value="visualize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="w-5 h-5" />
                  Visualización del Proceso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {huffmanResults || shannonFanoResults ? (
                  <AlgorithmVisualization
                    huffmanTree={huffmanResults?.tree}
                    huffmanTable={huffmanResults?.table}
                    shannonFanoTable={shannonFanoResults?.table}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Primero debe codificar un texto para ver la visualización
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
