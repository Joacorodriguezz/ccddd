interface ResultsTableProps {
  results: {
    originalSize: number
    compressedSize: number
    compressionRatio: string
    averageLength: string
    efficiency: string
  }
  algorithm: string
}

export default function ResultsTable({ results, algorithm }: ResultsTableProps) {
  const compressionSavings = results.originalSize - results.compressedSize

  return (
    <div className="space-y-2">
      <div className="bg-gray-100 p-3 rounded">
        <div className="text-sm font-medium">Tamaño Original</div>
        <div className="text-lg">{results.originalSize} bits</div>
      </div>
      <div className="bg-gray-100 p-3 rounded">
        <div className="text-sm font-medium">Tamaño Comprimido</div>
        <div className="text-lg">{results.compressedSize} bits</div>
      </div>
      <div className="bg-green-100 p-3 rounded">
        <div className="text-sm font-medium">Ahorro de Espacio</div>
        <div className="text-lg">{compressionSavings} bits</div>
      </div>
      <div className="bg-blue-100 p-3 rounded">
        <div className="text-sm font-medium">Tasa de Compresión</div>
        <div className="text-lg">{results.compressionRatio}%</div>
      </div>
      <div className="bg-gray-100 p-3 rounded">
        <div className="text-sm font-medium">Longitud Promedio</div>
        <div className="text-lg">{results.averageLength} bits/símbolo</div>
      </div>
      <div className="bg-purple-100 p-3 rounded">
        <div className="text-sm font-medium">Eficiencia</div>
        <div className="text-lg">{results.efficiency}%</div>
      </div>
    </div>
  )
}
