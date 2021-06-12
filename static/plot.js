
const tChartElem = document.getElementById('tempChart')
const tColor = 'rgb(255, 102, 102)'

const hChartElem = document.getElementById('humidityChart')
const hColor = 'rgb(153, 102, 255)'

const pChartElem = document.getElementById('presureChart')
const pColor = 'rgb(0, 153, 255)'


const filterThreeHours = document.getElementById('filter-last-3-hours')
const filterDay = document.getElementById('filter-last-day')
const filterThreeDays = document.getElementById('filter-last-3-day')
const filterWeek = document.getElementById('filter-last-week')
const filterMonth = document.getElementById('filter-month')

const filterDescription = document.getElementById('filter-description')

const filters = [
  filterThreeHours, 
  filterDay, 
  filterThreeDays, 
  filterWeek, 
  filterMonth,
]

async function updateLastData(by){
  function createConfig(data) {
    return {
      type: 'line',
      data,
      options: {
        // responsive: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
      }
    }
  }
  const res = await fetch(`/get?last=${by}`)
  const weather = await res.json()

  if (weather.length <= 0 ) {
    throw new Error('empty data')
  }
  const temp = weather.map(w => w.temp)
  const humidity = weather.map(w => w.humidity)
  const preasure = weather.map(w => w.preasure)

  const time = weather.map(w => {
    const date = new Date(w.time)
    if (by === 'day' || by === '3hour'){
      return date.toLocaleTimeString('en-GB')
    }
    return date.toLocaleString('en-GB')
  })

  const lastTime = new Date(weather[weather.length - 1].time)
  const lastData = `Temperature: \t${weather[weather.length - 1].temp} °C
                    Humidity: \t${weather[weather.length - 1].humidity} %
                    Preasure: \t${weather[weather.length - 1].preasure} mBar
                    Time: \t${lastTime.toLocaleTimeString('en-GB')}`
  document.getElementById('lastData').innerText = lastData

  const tChart = new Chart(tChartElem, createConfig({
    labels: time,
    datasets: [{
      label: 'Temperature',
      backgroundColor: tColor,
      borderColor: tColor,
      data: temp,
    }]
  }))
  const hChart = new Chart(hChartElem, createConfig({
    labels: time,
    datasets: [{
      label: 'Humidity',
      backgroundColor: hColor,
      borderColor: hColor,
      data: humidity,
    }]
  }))
  const pChart = new Chart(pChartElem, createConfig({
    labels: time,
    datasets: [{
      label: 'Preasure',
      backgroundColor: pColor,
      borderColor: pColor,
      data: preasure,
    }]
  }))
  return [tChart, hChart, pChart]
}

;(async function main() {
  let charts = await updateLastData('day')

  filterThreeHours.onclick = async function() {
    if (this.classList.contains('active')){
      return
    }
    filters.map(f => f.classList.remove('active'))
    this.classList.add('active')
    charts.map(ch => ch.destroy())

    charts = await updateLastData('3hours')
    filterDescription.innerText = 'Data by 3 Hours'
  }
  filterDay.onclick = async function() {
    if (this.classList.contains('active')){
      console.log('active')
      return
    }
    filters.map(f => f.classList.remove('active'))
    this.classList.add('active')
    charts.map(ch => ch.destroy())

    charts = await updateLastData('day')
    filterDescription.innerText = 'Data by Day'
  }
  filterThreeDays.onclick = async function() {
    if (this.classList.contains('active')){
      console.log('active')
      return
    }
    filters.map(f => f.classList.remove('active'))
    this.classList.add('active')
    charts.map(ch => ch.destroy())

    charts = await updateLastData('3days')
    filterDescription.innerText = 'Data by 3 Day'
  }
  filterWeek.onclick = async function() {
    if (this.classList.contains('active')){
      console.log('active')
      return
    }
    filters.map(f => f.classList.remove('active'))
    this.classList.add('active')
    charts.map(ch => ch.destroy())

    charts = await updateLastData('week')
    filterDescription.innerText = 'Data by Week'
  }
  filterMonth.onclick = async function() {
    if (this.classList.contains('active')){
      console.log('active')
      return
    }
    filters.map(f => f.classList.remove('active'))
    this.classList.add('active')
    charts.map(ch => ch.destroy())

    charts = await updateLastData('month')
    filterDescription.innerText = 'Data by Month'
  }
})()
