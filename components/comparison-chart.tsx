"use client"

import { useEffect, useRef } from "react"

interface ComparisonChartProps {
  huffmanStats: any
  shannonFanoStats: any
}

export default function ComparisonChart({ huffmanStats, shannonFanoStats }: ComparisonChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Chart data
    const data = [
      {
        label: "Tasa de Compresión (%)",
        huffman: Number.parseFloat(huffmanStats.compressionRatio),
        shannonFano: Number.parseFloat(shannonFanoStats.compressionRatio),
      },
      {
        label: "Longitud Promedio",
        huffman: Number.parseFloat(huffmanStats.averageLength),
        shannonFano: Number.parseFloat(shannonFanoStats.averageLength),
      },
      {
        label: "Eficiencia (%)",
        huffman: Number.parseFloat(huffmanStats.efficiency),
        shannonFano: Number.parseFloat(shannonFanoStats.efficiency),
      },
    ]

    // Chart dimensions
    const chartWidth = canvas.width - 100
    const chartHeight = canvas.height - 100
    const barWidth = 40
    const barSpacing = 60
    const groupSpacing = 100

    // Colors
    const huffmanColor = "#4F46E5"
    const shannonFanoColor = "#7C3AED"

    // Draw bars
    data.forEach((item, index) => {
      const x = 50 + index * (barWidth * 2 + groupSpacing)
      const maxValue = Math.max(item.huffman, item.shannonFano, 100)

      // Huffman bar
      const huffmanHeight = (item.huffman / maxValue) * chartHeight * 0.8
      ctx.fillStyle = huffmanColor
      ctx.fillRect(x, chartHeight - huffmanHeight + 20, barWidth, huffmanHeight)

      // Shannon-Fano bar
      const shannonFanoHeight = (item.shannonFano / maxValue) * chartHeight * 0.8
      ctx.fillStyle = shannonFanoColor
      ctx.fillRect(x + barWidth + 10, chartHeight - shannonFanoHeight + 20, barWidth, shannonFanoHeight)

      // Labels
      ctx.fillStyle = "#374151"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(item.label, x + barWidth, chartHeight + 40)

      // Values
      ctx.fillStyle = huffmanColor
      ctx.fillText(item.huffman.toFixed(1), x + barWidth / 2, chartHeight - huffmanHeight + 10)
      ctx.fillStyle = shannonFanoColor
      ctx.fillText(item.shannonFano.toFixed(1), x + barWidth + 10 + barWidth / 2, chartHeight - shannonFanoHeight + 10)
    })

    // Legend
    ctx.fillStyle = huffmanColor
    ctx.fillRect(50, 10, 20, 15)
    ctx.fillStyle = "#374151"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Huffman", 80, 22)

    ctx.fillStyle = shannonFanoColor
    ctx.fillRect(180, 10, 20, 15)
    ctx.fillText("Shannon-Fano", 210, 22)
  }, [huffmanStats, shannonFanoStats])

  return (
    <div className="w-full">
      <canvas ref={canvasRef} width={800} height={400} className="w-full h-auto border rounded" />
    </div>
  )
}
