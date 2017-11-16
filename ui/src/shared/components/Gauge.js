import React, {Component, PropTypes} from 'react'

import {GAUGE_SPECS} from 'shared/constants/gaugeSpecs'

const colors = ['#BF3D5E', '#F95F53', '#FFD255', '#7CE490']

class Gauge extends Component {
  constructor(props) {
    super(props)

    this.state = {
      gaugePosition: this.props.gaugePosition,
    }
  }

  componentDidMount() {
    this.updateCanvas()
  }

  updateCanvas = () => {
    const canvas = this.canvasRef
    const ctx = canvas.getContext('2d')

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2 * 1.11
    const radius = canvas.width / 2 * 0.5

    const gradientThickness = 20

    this.drawMultiRadiantCircle(
      ctx,
      centerX,
      centerY,
      radius,
      colors,
      gradientThickness
    )
    // The following functions must be called in the specified order
    this.drawGaugeLines(ctx, centerX, centerY, radius, gradientThickness)
    this.drawGaugeLabels(ctx, centerX, centerY, radius, gradientThickness)
  }

  drawMultiRadiantCircle = (
    ctx,
    xc,
    yc,
    r,
    radientColors,
    gradientThickness
  ) => {
    const partLength = Math.PI / (radientColors.length - 2)
    let start = Math.PI * 0.75
    let gradient = null
    let startColor = null
    let endColor = null

    for (let i = 0; i < radientColors.length - 1; i++) {
      startColor = radientColors[i]
      endColor = radientColors[(i + 1) % radientColors.length]

      // x start / end of the next arc to draw
      const xStart = xc + Math.cos(start) * r
      const xEnd = xc + Math.cos(start + partLength) * r
      // y start / end of the next arc to draw
      const yStart = yc + Math.sin(start) * r
      const yEnd = yc + Math.sin(start + partLength) * r

      ctx.beginPath()

      gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd)
      gradient.addColorStop(0, startColor)
      gradient.addColorStop(1.0, endColor)

      ctx.strokeStyle = gradient
      ctx.arc(xc, yc, r, start, start + partLength)
      ctx.lineWidth = gradientThickness
      ctx.stroke()
      ctx.closePath()

      start += partLength
    }
  }

  drawGaugeLines = (ctx, xc, yc, radius, gradientThickness) => {
    const {
      degree,
      lineCount,
      lineColor,
      lineStrokeSmall,
      lineStrokeLarge,
      tickSizeSmall,
      tickSizeLarge,
    } = GAUGE_SPECS

    const arcStart = Math.PI * 0.75
    const arcLength = Math.PI * 1.5
    const arcStop = arcStart + arcLength
    const lineSmallCount = lineCount * 5
    const startDegree = degree * 135
    const arcLargeIncrement = arcLength / lineCount
    const arcSmallIncrement = arcLength / lineSmallCount

    // Semi-circle
    const arcRadius = radius + gradientThickness * 0.8
    ctx.beginPath()
    ctx.arc(xc, yc, arcRadius, arcStart, arcStop)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = lineColor
    ctx.stroke()
    ctx.closePath()

    // Match center of canvas to center of gauge
    ctx.translate(xc, yc)

    // Draw Large ticks
    for (let lt = 0; lt <= lineCount; lt++) {
      // Rototion before drawing line
      ctx.rotate(startDegree)
      ctx.rotate(lt * arcLargeIncrement)
      // Draw line
      ctx.beginPath()
      ctx.lineWidth = lineStrokeLarge
      ctx.lineCap = 'round'
      ctx.strokeStyle = lineColor
      ctx.moveTo(arcRadius, 0)
      ctx.lineTo(arcRadius + tickSizeLarge, 0)
      ctx.stroke()
      ctx.closePath()
      // Return to starting rotation
      ctx.rotate(-lt * arcLargeIncrement)
      ctx.rotate(-startDegree)
    }

    // Draw Small ticks
    for (let lt = 0; lt <= lineSmallCount; lt++) {
      // Rototion before drawing line
      ctx.rotate(startDegree)
      ctx.rotate(lt * arcSmallIncrement)
      // Draw line
      ctx.beginPath()
      ctx.lineWidth = lineStrokeSmall
      ctx.lineCap = 'round'
      ctx.strokeStyle = lineColor
      ctx.moveTo(arcRadius, 0)
      ctx.lineTo(arcRadius + tickSizeSmall, 0)
      ctx.stroke()
      ctx.closePath()
      // Return to starting rotation
      ctx.rotate(-lt * arcSmallIncrement)
      ctx.rotate(-startDegree)
    }
  }

  drawGaugeLabels = (ctx, xc, yc, radius, gradientThickness) => {
    const {degree, lineCount} = GAUGE_SPECS

    // Build array of label strings
    const {minValue, maxValue} = this.props
    const incrementValue = (maxValue - minValue) / lineCount

    const gaugeValues = []
    for (let g = minValue; g <= maxValue; g += incrementValue) {
      gaugeValues.push(g.toString())
    }

    const startDegree = degree * 135
    const arcLength = Math.PI * 1.5
    const arcIncrement = arcLength / lineCount

    // Format labels text
    ctx.font = 'bold 13px Helvetica'
    ctx.fillStyle = '#8E91A1'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'right'
    let labelRadius

    for (let i = 0; i <= lineCount; i++) {
      if (i === 3) {
        ctx.textAlign = 'center'
        labelRadius = radius + gradientThickness + 30
      } else {
        labelRadius = radius + gradientThickness + 23
      }
      if (i > 3) {
        ctx.textAlign = 'left'
      }
      ctx.rotate(startDegree)
      ctx.rotate(i * arcIncrement)
      ctx.translate(labelRadius, 0)
      ctx.rotate(i * -arcIncrement)
      ctx.rotate(-startDegree)
      ctx.fillText(gaugeValues[i], 0, 0)
      ctx.rotate(startDegree)
      ctx.rotate(i * arcIncrement)
      ctx.translate(-labelRadius, 0)
      ctx.rotate(i * -arcIncrement)
      ctx.rotate(-startDegree)
    }
  }

  render() {
    return (
      <canvas
        className="gauge"
        style={{border: '1px solid #f00'}}
        width={400}
        height={300}
        ref={r => (this.canvasRef = r)}
      />
    )
  }
}

const {number} = PropTypes

Gauge.propTypes = {
  minValue: number.isRequired,
  maxValue: number.isRequired,
  gaugePosition: number.isRequired,
}

export default Gauge
