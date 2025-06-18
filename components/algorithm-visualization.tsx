interface AlgorithmVisualizationProps {
  huffmanTree?: any
  huffmanTable?: Map<string, string>
  shannonFanoTable?: Map<string, string>
}

export default function AlgorithmVisualization({
  huffmanTree,
  huffmanTable,
  shannonFanoTable,
}: AlgorithmVisualizationProps) {
  return (
    <div className="space-y-6">
      {/* Huffman Tree Visualization */}
      {huffmanTree && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Árbol de Huffman</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="inline-block bg-blue-100 px-4 py-2 rounded-full">Raíz: {huffmanTree.freq}</div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              El árbol se construye combinando los nodos de menor frecuencia hasta obtener un único nodo raíz.
            </div>
          </div>
        </div>
      )}

      {/* Code Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {huffmanTable && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Tabla de Códigos Huffman</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 p-2 font-semibold text-sm">
                <div>Símbolo</div>
                <div>Frecuencia</div>
                <div>Código</div>
              </div>
              {Array.from(huffmanTable.entries()).map(([char, code]) => (
                <div key={char} className="grid grid-cols-3 p-2 border-t text-sm">
                  <div className="font-mono">{char === " " ? "␣" : char}</div>
                  <div>-</div>
                  <div className="font-mono">{code}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {shannonFanoTable && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Tabla de Códigos Shannon-Fano</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 p-2 font-semibold text-sm">
                <div>Símbolo</div>
                <div>Probabilidad</div>
                <div>Código</div>
              </div>
              {Array.from(shannonFanoTable.entries()).map(([char, code]) => (
                <div key={char} className="grid grid-cols-3 p-2 border-t text-sm">
                  <div className="font-mono">{char === " " ? "␣" : char}</div>
                  <div>-</div>
                  <div className="font-mono">{code}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Algorithm Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pasos del Algoritmo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Huffman</h4>
            <ol className="text-sm space-y-1 text-blue-700">
              <li>1. Calcular frecuencias de símbolos</li>
              <li>2. Crear nodos hoja para cada símbolo</li>
              <li>3. Construir árbol combinando nodos de menor frecuencia</li>
              <li>4. Asignar códigos: 0 para izquierda, 1 para derecha</li>
            </ol>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Shannon-Fano</h4>
            <ol className="text-sm space-y-1 text-purple-700">
              <li>1. Ordenar símbolos por probabilidad</li>
              <li>2. Dividir en dos grupos equilibrados</li>
              <li>3. Asignar 0 al primer grupo, 1 al segundo</li>
              <li>4. Repetir recursivamente para cada grupo</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
