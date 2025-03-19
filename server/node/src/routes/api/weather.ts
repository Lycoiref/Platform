import Router from '@koa/router'
import { Context } from 'koa'

const router = new Router()

const PRIVATE_KEY = 'a195e4b853984ac9b654661ed3f46f68'

router.get('/', async (ctx: Context) => {
  try {
    const { lat, lon } = ctx.query
    const resLocation = await fetch(
      `https://geoapi.qweather.com/v2/city/lookup?location=${lon},${lat}&key=${PRIVATE_KEY}`
    )
    if (!resLocation.ok) {
      throw new Error('Failed to fetch city location')
    }
    const locationData = await resLocation.json()
    const locationId = locationData.location[0]?.id
    if (!locationId) {
      throw new Error('City ID not found')
    }
    const [resNow, resDaily] = await Promise.all([
      fetch(
        `https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${PRIVATE_KEY}`
      ),
      fetch(
        `https://devapi.qweather.com/v7/weather/3d?location=${locationId}&key=${PRIVATE_KEY}`
      ),
    ])

    if (!resNow.ok || !resDaily.ok) {
      throw new Error('Failed to fetch weather data')
    }

    const resultNow = await resNow.json()
    const resultDaily = await resDaily.json()
    // 返回天气数据
    ctx.body = {
      updateTime: resultNow.updateTime,
      city: locationData.location[0].adm2,
      windSpeed: resultNow.now.windSpeed,
      area: locationData.location[0].name,
      windDir: resultNow.now.windDir,
      temp: resultNow.now.temp,
      weather: resultNow.now.text,
      bodyTemperature: resultNow.now.feelsLike,
      icon: resultNow.now.icon,
      UVIndex: resultDaily.daily[0].uvIndex,
      tempMax: resultDaily.daily[0].tempMax,
      tempMin: resultDaily.daily[0].tempMin,
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    ctx.status = 500
    ctx.body = { error: 'Failed to fetch weather data' }
  }
})

export default router
