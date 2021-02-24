class TextSize {
  private canvas: HTMLCanvasElement
  private canvasContext: CanvasRenderingContext2D | null

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvasContext = this.canvas.getContext('2d')
  }

  /**
   * Measures the rendered width of arbitrary text given the font size and font face
   * {string} text The text to measure
   * {number} fontSize The font size in pixels
   * {string} fontFace The font face ("Arial", "Helvetica", etc.)
   * {number} The width of the text
   **/
  getTextWidth(text: string, fontSize: number, fontFace: string = 'Helvetica') {
    if (this.canvasContext) {
      this.canvasContext.font = `${fontSize}px ${fontFace}`
      return Math.floor(this.canvasContext.measureText(text).width)
    } else {
      console.error('Error calculating text string width. Canvas context not created.')
      return 0
    }
  }
}

export default new TextSize()
