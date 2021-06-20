// Fetch data and organize data with to add name, color, separators (x axis grid)
async function fetchData(by) {
  const res = await fetch(`/get?last=${by}`)
  const weather = await res.json()

  if (weather.length <= 0) {
    throw new Error('empty data')
  }
  const temp = weather.map(w => w.temp)
  const humidity = weather.map(w => w.humidity)
  const preasure = weather.map(w => w.preasure)
  const time = weather.map(w => (new Date(w.time)).getTime())

  function timeSeparator(timeArray) {
    const firstTime = Math.min(...timeArray)
    const lastTime = Math.max(...timeArray)
    const minutesCount = (lastTime  - firstTime) / 1000 / 60

    let separations = []
    if (minutesCount < 60){ // if less then hour, get all minutes
      let temp = Math.ceil(firstTime / 1000 / 60)
      const lastMin = Math.floor(lastTime / 1000 / 60)
      while (temp <= lastMin) {
        separations.push(temp * 60 * 1000)
        temp++
      }
    } else if (minutesCount < 60 * 60) { // if less then day, get all hours
      let temp = Math.ceil(firstTime / 1000 / 60 / 60)
      const lastHour = Math.floor(lastTime / 1000 / 60 / 60)
      while (temp <= lastHour) {
        separations.push(temp * 60  *  60 * 1000)
        temp++
      }
    } else if (minutesCount < 60 * 60 * 24) { // if less then month, get all days
      let temp = Math.ceil(firstTime / 1000 / 60 / 60 / 24)
      const lastDay = Math.floor( (lastTime / 1000 / 60) / 60 / 24)
      // Account timezones
      const timezoneShift = (new Date().getTimezoneOffset()) * 60 * 1000
      while(temp <= lastDay) {
        separations.push(temp * 24 * 60 * 60 * 1000 + timezoneShift)
        temp++
      }
    }
    return separations
  }
  const data = {
    xAxis: time,
    xSeparator: timeSeparator(time),
    yAxises: [{
      name: "Temperature",
      color: 'rgb(255, 102, 102)',
      values: temp,
    }, {
      name: "Humidity",
      color: 'rgb(153, 102, 255)',
      values: humidity,
    }, {
      name: "Preasure",
      color: 'rgb(0, 153, 255)',
      values: preasure,
    }]
  }
  return data
}

;(async function main() {
  // What period be at start
  const defaultBy = 'day'
  // Period options
  const optionsBy = ['3hours', 'day', '3days', 'week', 'mounth']
  // Get start data
  let data = await fetchData(defaultBy)

  // Setup table with last and selected data
  const lastTemp = document.getElementById('last-temp')
  const lastHumidity = document.getElementById('last-humidity')
  const lastPreasure = document.getElementById('last-preasure')
  const lastTime = document.getElementById('last-time')

  const selectedTemp = document.getElementById('selected-temp')
  const selectedHumidity = document.getElementById('selected-humidity')
  const selectedPreasure = document.getElementById('selected-preasure')
  const selectedTime = document.getElementById('selected-time')

  const ys = data.yAxises
  lastTemp.innerText = String(ys[0].values[ys[0].values.length - 1]) + ' °C'
  lastHumidity.innerText = String(ys[1].values[ys[1].values.length - 1]) + ' %'
  lastPreasure.innerText = String(ys[2].values[ys[2].values.length - 1]) + ' mBar'
  lastTime.innerText = (new Date(data.xAxis[data.xAxis.length - 1])).toLocaleString('en-GB')

  selectedTemp.innerText = lastTemp.innerText
  selectedHumidity.innerText = lastHumidity.innerText
  selectedPreasure.innerText = lastPreasure.innerText
  selectedTime.innerText = lastTime.innerText

  // Define cursor selectring behavior
  function handleFeedback(selected) {
    const { xAxis, yAxises } = selected

    selectedTemp.innerText = String(yAxises[0].value) + ' °C'
    selectedHumidity.innerText = String(yAxises[1].value) + ' %'
    selectedPreasure.innerText = String(yAxises[2].value) + ' mBar'
    selectedTime.innerText = new Date(xAxis).toLocaleString('en-GB')
  }

  // Draw plot in canvas
  const plot = new Plot(document.getElementById('plot'), data, handleFeedback)

  // Dont like too much graphs so remove preasure and redraw
  plot.excluded.push("Preasure")
  plot.update()

  // Add period selectors
  const selectPeriod = document.getElementById('select-period')
  for (let periodBy of optionsBy) {
    const periodOption = document.createElement('div')

    const periodInput = document.createElement('input')
    periodInput.setAttribute('type', 'radio')
    periodInput.setAttribute('name', 'last-period')
    periodInput.setAttribute('value', periodBy)
    periodInput.setAttribute('id', periodBy)
    periodInput.setAttribute('style', 'margin: .4rem;')
    if (periodBy === defaultBy) {
      periodInput.checked = true
    }
    periodInput.addEventListener('change', async function(e) {
      data = await fetchData(e.target.value)
      plot.update(data)
    })
    const periodLabel = document.createElement('label')
    periodLabel.setAttribute('for', periodBy)
    periodLabel.innerText = periodBy

    periodOption.appendChild(periodInput)
    periodOption.appendChild(periodLabel)
    selectPeriod.appendChild(periodOption)
  }

  // Add or remove graphs from plot if clicked
  document.getElementById('isTemp').onclick = async function() {
    plot.excluded = plot.excluded.filter(v => v !== "Temperature")
    if (!this.checked){
      plot.excluded.push("Temperature")
    }
    plot.update()
  }
  document.getElementById('isHumidity').onclick = async function() {
    plot.excluded = plot.excluded.filter(v => v !== "Humidity")
    if (!this.checked){
      plot.excluded.push("Humidity")
    }
    plot.update()
  }
  document.getElementById('isPreasure').onclick = async function() {
    plot.excluded = plot.excluded.filter(v => v !== "Preasure")
    if (!this.checked){
      plot.excluded.push("Preasure")
    }
    plot.update()
  }
})()
