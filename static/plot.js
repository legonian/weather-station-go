class Plot {
  constructor(canvasElem, data, feedback) {
    this.plot = canvasElem
    this.height = canvasElem.height
    this.ctx = canvasElem.getContext('2d')
    this.excluded = []
    
    this.plot.addEventListener('mousemove', e => {
      this._callFeedback(e.offsetX)
    })
    this.plot.addEventListener('touchmove', e => {
      this._callFeedback(e.touches[0].pageX)
    })
    this.update(data, feedback)
  }

  _callFeedback(x) {
    if (x < 0) {
      x = 0
    } else if (this.plot.width < x) {
      x = this.plot.width
    }
    const target = this.startX + x / this.scaleX

    function findClosest(arr, target) {
      let n = arr.length
      if (target <= arr[0]){
        return 0
      }
      if (target >= arr[n - 1]){
        return n - 1
      }
      let i = 0, j = n, mid = 0
      while (i < j) {
        mid = Math.round((i + j) / 2)
        if (arr[mid] == target) {
          return mid
        }
        if (target < arr[mid]) {
          if (mid > 0 && target > arr[mid - 1]) {
            if (target - arr[mid - 1] >= arr[mid] - target)
              return mid
            else
              return mid - 1
          }
          j = mid
        } else {
          if (mid < n - 1 && target < arr[mid + 1]){
            if (target - arr[mid] >= arr[mid + 1] - target)
              return mid + 1
            else
              return mid
          }
          i = mid + 1
        }
      }
      return mid
    }
    
    const closestX = findClosest(this.x, target)
    const nowX = (this.x[closestX] - this.startX) * this.scaleX

    this.ctx.clearRect(0, 0, this.plot.width, this.height)
    this.ctx.putImageData(this.savedGraph, 0, 0)

    const selected = {
      xAxis: this.x[closestX],
      yAxises: [],
    }
    for (let y of this.ys) {
      selected.yAxises.push({
        name: y.name,
        value: y.values[closestX],
      })
      if (this.excluded.includes(y.name)) {
        continue
      }
      const positionY = (y.values[closestX] - Math.min(...y.values)) / (Math.max(...y.values) - Math.min(...y.values))
      const nowY = this.height * (1 - positionY)
      this.ctx.fillStyle = y.color
      this.ctx.beginPath()
      this.ctx.arc(nowX, nowY, 7, 0, 7)
      this.ctx.fill()
    }
    this.feedback(selected)
  }

  _draw() {
    this.ctx.clearRect(0, 0, this.plot.width, this.height)
    const x = this.x
    const ys = this.ys

    this.startX = x[0]
    this.scaleX = this.plot.width / (x[x.length - 1] - x[0])

    for (let y of ys) {
      if (this.excluded.includes(y.name)) {
        continue
      }
      const startY = Math.min(...y.values)
      const scaleY = this.height / (Math.max(...y.values) - Math.min(...y.values))

      this.ctx.beginPath()
      for (let i = 1; i < y.values.length; i++) {
        const prevX = (x[i - 1] - this.startX) * this.scaleX
        const prevY = (y.values[i - 1] - startY) * scaleY

        const nowX = (x[i] - this.startX) * this.scaleX
        const nowY = (y.values[i] - startY) * scaleY

        this.ctx.moveTo(prevX, this.height - prevY)
        this.ctx.lineTo(nowX, this.height - nowY)
        this.ctx.arc(nowX, this.height - nowY, 3, 0, 7)
        this.ctx.fillStyle = y.color
      }
      this.ctx.fill()
    }

    // Draw separations
    this.ctx.beginPath()
    for (let separation of this.xSeparator) {
      separation = (separation - this.startX) * this.scaleX
      this.ctx.moveTo(separation, 0)
      this.ctx.lineTo(separation, this.height)
      this.ctx.strokeStyle = 'rgb(160,160,160)'
    }
    this.ctx.stroke()

    this.savedGraph = this.ctx.getImageData(0, 0, this.plot.width, this.height)
  }

  update(data, feedback){
    if (typeof data !== "undefined") {
      let { xAxis, xSeparator, yAxises } = data
      for (let y of yAxises) {
        if (y.values.length < 1) {
          console.log(y.values.length)
          throw new Error('yAxis length less then 1')
        }
        if (xAxis.length !== y.values.length) {
          console.log(xAxis.length, y.values.length)
          throw new Error('yAxis length not equal to xAxis')
        }
      }
      this.x = xAxis
      this.xSeparator = xSeparator
      this.ys = yAxises
    }
    if (typeof feedback !== "undefined") {
      this.feedback = feedback
    }
    this._draw()
  }
}
